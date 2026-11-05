import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json' with { type: 'json' };

dotenv.config();

const scryptAsync = promisify(crypto.scrypt);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.set('trust proxy', 1);
app.use(express.json({ limit: '100kb' }));

// ============================================================================
// Firebase Firestore Initialization, Connection Validation & Error Handler
// ============================================================================
const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  docPath: string | null,
  contextUser?: { id?: string; email?: string }
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: contextUser?.id ?? null,
      email: contextUser?.email ?? null,
      emailVerified: null,
      isAnonymous: false,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path: docPath,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'server_users', '0'.repeat(64)));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

// ============================================================================
// Server-Side Authentication, Scrypt Password Hashing & HttpOnly Session Store
// ============================================================================
const DEFAULT_FAVORITES = ['ai-chat', 'ai-story', 'ai-video-prompt'];
const LEGACY_DEV_FALLBACK_SECRET = 'fariya-ai-local-development-only-fallback-session-key';

interface StoredGeneration {
  id: string;
  toolId: string;
  toolName: string;
  prompt: string;
  outputPreview: string;
  createdAt: string;
  type: 'image' | 'text' | 'audio' | 'video';
}

interface StoredUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  plan: 'free' | 'pro';
  creditsRemaining: number;
  creditsTotal: number;
  favorites: string[];
  savedGenerations: StoredGeneration[];
  createdAt: string;
}

interface StoredSession {
  sessionId: string;
  userId: string;
  expiresAt: number;
}

interface AuthDatabase {
  users: StoredUser[];
  sessions: StoredSession[];
}

const isProduction = process.env.NODE_ENV === 'production';

const DATA_DIR = path.join(__dirname, '.data');
const AUTH_DB_PATH = path.join(DATA_DIR, 'auth-store.json');
const SESSION_SECRET_FILE_PATH = path.join(DATA_DIR, 'session-secret.key');
const SESSION_COOKIE_NAME = 'fariya_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

function ensureDevelopmentSecretFile(): string {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(SESSION_SECRET_FILE_PATH)) {
    try {
      const existingSecret = fs.readFileSync(SESSION_SECRET_FILE_PATH, 'utf8').trim();
      if (existingSecret.length >= 64) {
        fs.chmodSync(SESSION_SECRET_FILE_PATH, 0o600);
        return existingSecret;
      }
    } catch {
      // Regenerate if unreadable
    }
  }

  const generatedSecret = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SESSION_SECRET_FILE_PATH, generatedSecret, { encoding: 'utf8', mode: 0o600 });
  fs.chmodSync(SESSION_SECRET_FILE_PATH, 0o600);
  return generatedSecret;
}

function resolveSessionSecret(): string {
  const configuredSecret = process.env.SESSION_SECRET?.trim();
  const isPlaceholder =
    configuredSecret === 'REPLACE_WITH_PERMANENT_SESSION_SECRET' ||
    configuredSecret === 'MY_SESSION_SECRET';

  if (isProduction) {
    if (!configuredSecret || isPlaceholder) {
      console.error(
        'FATAL: SESSION_SECRET environment variable is missing. A permanent SESSION_SECRET is required in production. Server startup aborted.'
      );
      process.exit(1);
    }
    return configuredSecret;
  }

  // In development, always ensure a cryptographically random 256-bit secret file exists with 0600 permissions
  const devFileSecret = ensureDevelopmentSecretFile();
  if (configuredSecret && !isPlaceholder) {
    return configuredSecret;
  }
  return devFileSecret;
}

const SESSION_SECRET = resolveSessionSecret();

// Server-only HMAC-SHA256 capability keys for isolated Firestore collections
function computeUserDocKey(email: string, secret: string = SESSION_SECRET): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`user:${email.trim().toLowerCase()}`)
    .digest('hex');
}

function computeCredDocKey(email: string, secret: string = SESSION_SECRET): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`cred:${email.trim().toLowerCase()}`)
    .digest('hex');
}

function computeSessionDocKey(sessionId: string, secret: string = SESSION_SECRET): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`session:${sessionId}`)
    .digest('hex');
}

function sanitizeFavorites(favorites?: unknown): string[] {
  if (!Array.isArray(favorites)) return [...DEFAULT_FAVORITES];
  return favorites
    .filter((item): item is string => typeof item === 'string' && /^[a-zA-Z0-9_\-]{1,64}$/.test(item))
    .slice(0, 20);
}

function sanitizeGenerations(generations?: unknown): StoredGeneration[] {
  if (!Array.isArray(generations)) return [];
  const validTypes = new Set(['image', 'text', 'audio', 'video']);
  const result: StoredGeneration[] = [];
  for (const g of generations) {
    if (!g || typeof g !== 'object') continue;
    const raw = g as Record<string, unknown>;
    const id =
      typeof raw.id === 'string' && /^[a-zA-Z0-9_\-]{1,128}$/.test(raw.id)
        ? raw.id
        : `gen-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const toolId =
      typeof raw.toolId === 'string' && /^[a-zA-Z0-9_\-]{1,64}$/.test(raw.toolId)
        ? raw.toolId
        : 'ai-chat';
    const toolName =
      typeof raw.toolName === 'string' && raw.toolName.trim()
        ? raw.toolName.trim().slice(0, 100)
        : 'AI Tool';
    const prompt =
      typeof raw.prompt === 'string' && raw.prompt.trim()
        ? raw.prompt.trim().slice(0, 4000)
        : 'Prompt';
    const outputPreview =
      typeof raw.outputPreview === 'string' && raw.outputPreview.trim()
        ? raw.outputPreview.trim().slice(0, 4000)
        : 'Generated output';
    const createdAt =
      typeof raw.createdAt === 'string' && raw.createdAt.trim()
        ? raw.createdAt.trim().slice(0, 64)
        : 'Just now';
    const type =
      typeof raw.type === 'string' && validTypes.has(raw.type)
        ? (raw.type as StoredGeneration['type'])
        : 'text';
    result.push({ id, toolId, toolName, prompt, outputPreview, createdAt, type });
    if (result.length >= 25) break;
  }
  return result;
}

function normalizeStoredUser(raw: any): StoredUser {
  return {
    id: typeof raw.id === 'string' && /^[a-zA-Z0-9_\-]{1,128}$/.test(raw.id) ? raw.id : crypto.randomUUID(),
    email: String(raw.email || '').trim().toLowerCase().slice(0, 254),
    name: String(raw.name || 'Creator').trim().slice(0, 80) || 'Creator',
    passwordHash: String(raw.passwordHash || ''),
    salt: String(raw.salt || ''),
    plan: raw.plan === 'pro' ? 'pro' : 'free',
    creditsRemaining:
      typeof raw.creditsRemaining === 'number' && raw.creditsRemaining >= 0
        ? Math.min(100000, raw.creditsRemaining)
        : 50,
    creditsTotal:
      typeof raw.creditsTotal === 'number' && raw.creditsTotal >= 1
        ? Math.min(100000, raw.creditsTotal)
        : 50,
    favorites: sanitizeFavorites(raw.favorites),
    savedGenerations: sanitizeGenerations(raw.savedGenerations),
    createdAt:
      typeof raw.createdAt === 'string' && raw.createdAt.length >= 10
        ? raw.createdAt.slice(0, 40)
        : new Date().toISOString(),
  };
}

function loadAuthDb(): AuthDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(AUTH_DB_PATH)) {
      const raw = fs.readFileSync(AUTH_DB_PATH, 'utf8');
      const parsed = JSON.parse(raw) as AuthDatabase;
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.sessions)) {
        return {
          users: parsed.users.map(normalizeStoredUser),
          sessions: parsed.sessions,
        };
      }
    }
  } catch {
    // Initialize fresh store if unreadable
  }
  const initialDb: AuthDatabase = {
    users: [],
    sessions: [],
  };
  saveAuthDb(initialDb);
  return initialDb;
}

function saveAuthDb(database: AuthDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(
    AUTH_DB_PATH,
    JSON.stringify({ users: database.users, sessions: database.sessions }, null, 2),
    { mode: 0o600 }
  );
}

const authDb = loadAuthDb();

// ============================================================================
// Firestore Persistence Helpers (Isolated Credentials, Users, Sessions & History)
// ============================================================================

/**
 * Only creates user profile + isolated credential document + generations in Firestore
 * if the user does NOT already exist in Firestore. Never overwrites existing Firestore data.
 */
async function ensureUserMigratedToFirestore(user: StoredUser): Promise<void> {
  const userDocKey = computeUserDocKey(user.email);
  const credDocKey = computeCredDocKey(user.email);
  const userPath = `server_users/${userDocKey}`;
  const credPath = `server_credentials/${credDocKey}`;
  const userRef = doc(db, 'server_users', userDocKey);
  const credRef = doc(db, 'server_credentials', credDocKey);

  const favorites = sanitizeFavorites(user.favorites);
  const generations = sanitizeGenerations(user.savedGenerations);
  const generationIds = generations.map((g) => g.id).slice(0, 25);

  try {
    const existingUserSnap = await getDoc(userRef);
    if (!existingUserSnap.exists()) {
      await setDoc(userRef, {
        id: user.id,
        userDocKey,
        email: user.email,
        name: user.name.slice(0, 80),
        plan: 'free',
        creditsRemaining: Math.min(user.creditsRemaining, user.creditsTotal),
        creditsTotal: user.creditsTotal,
        favorites,
        generationIds,
        createdAtIso: user.createdAt.slice(0, 40),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      for (const gen of generations) {
        const genRef = doc(db, 'server_users', userDocKey, 'generations', gen.id);
        const genSnap = await getDoc(genRef);
        if (!genSnap.exists()) {
          await setDoc(genRef, {
            id: gen.id,
            userDocKey,
            toolId: gen.toolId.slice(0, 64),
            toolName: gen.toolName.slice(0, 100),
            prompt: gen.prompt.slice(0, 4000),
            outputPreview: gen.outputPreview.slice(0, 4000),
            type: gen.type,
            createdAtDisplay: gen.createdAt.slice(0, 64),
            createdAt: serverTimestamp(),
          });
        }
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, userPath, { id: user.id, email: user.email });
  }

  if (user.passwordHash && user.salt) {
    try {
      const existingCredSnap = await getDoc(credRef);
      if (!existingCredSnap.exists()) {
        await setDoc(credRef, {
          credDocKey,
          userDocKey,
          userId: user.id,
          passwordHash: user.passwordHash,
          salt: user.salt,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, credPath, { id: user.id, email: user.email });
    }
  }
}

/**
 * Updates only the user's favorites array in Firestore.
 */
async function updateUserFavoritesInFirestore(user: StoredUser): Promise<void> {
  const userDocKey = computeUserDocKey(user.email);
  const userPath = `server_users/${userDocKey}`;
  const userRef = doc(db, 'server_users', userDocKey);
  const favorites = sanitizeFavorites(user.favorites);

  await ensureUserMigratedToFirestore(user);

  try {
    await updateDoc(userRef, {
      favorites,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath, { id: user.id, email: user.email });
  }
}

/**
 * Creates a new generation document and decrements creditsRemaining in Firestore.
 */
async function persistGenerationToFirestore(user: StoredUser, gen: StoredGeneration): Promise<void> {
  const userDocKey = computeUserDocKey(user.email);
  const genPath = `server_users/${userDocKey}/generations/${gen.id}`;
  const genRef = doc(db, 'server_users', userDocKey, 'generations', gen.id);
  const userRef = doc(db, 'server_users', userDocKey);
  const generationIds = sanitizeGenerations(user.savedGenerations)
    .map((g) => g.id)
    .slice(0, 25);

  await ensureUserMigratedToFirestore(user);

  try {
    await setDoc(genRef, {
      id: gen.id,
      userDocKey,
      toolId: gen.toolId.slice(0, 64),
      toolName: gen.toolName.slice(0, 100),
      prompt: gen.prompt.slice(0, 4000),
      outputPreview: gen.outputPreview.slice(0, 4000),
      type: gen.type,
      createdAtDisplay: gen.createdAt.slice(0, 64),
      createdAt: serverTimestamp(),
    });

    await updateDoc(userRef, {
      creditsRemaining: user.creditsRemaining,
      generationIds,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, genPath, { id: user.id, email: user.email });
  }
}

async function persistSessionToFirestore(session: StoredSession, userEmail: string): Promise<void> {
  const sessionDocKey = computeSessionDocKey(session.sessionId);
  const userDocKey = computeUserDocKey(userEmail);
  const sessionPath = `server_sessions/${sessionDocKey}`;
  const sessionRef = doc(db, 'server_sessions', sessionDocKey);

  try {
    const existingSnap = await getDoc(sessionRef);
    if (!existingSnap.exists()) {
      await setDoc(sessionRef, {
        sessionDocKey,
        userDocKey,
        userId: session.userId,
        expiresAt: session.expiresAt,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, sessionPath, { id: session.userId, email: userEmail });
  }
}

async function deleteSessionFromFirestore(sessionId: string): Promise<void> {
  const sessionDocKey = computeSessionDocKey(sessionId);
  const sessionPath = `server_sessions/${sessionDocKey}`;
  try {
    await deleteDoc(doc(db, 'server_sessions', sessionDocKey));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, sessionPath);
  }
}

/**
 * Loads user profile from /server_users/{userDocKey} and credentials from /server_credentials/{credDocKey}.
 * Treats Firestore as the authoritative source of truth and updates local .data/auth-store.json.
 */
async function loadUserFromFirestoreByDocKey(
  userDocKey: string,
  knownEmail?: string,
  secretUsed: string = SESSION_SECRET
): Promise<StoredUser | null> {
  const userPath = `server_users/${userDocKey}`;
  try {
    const snap = await getDoc(doc(db, 'server_users', userDocKey));
    if (!snap.exists()) return null;
    const data = snap.data();

    const email = String(data.email || knownEmail || '').trim().toLowerCase();
    const credDocKey = computeCredDocKey(email, secretUsed);

    let passwordHash = typeof data.passwordHash === 'string' ? data.passwordHash : '';
    let salt = typeof data.salt === 'string' ? data.salt : '';

    // Load credentials from isolated /server_credentials collection
    if (email) {
      const credSnap = await getDoc(doc(db, 'server_credentials', credDocKey));
      if (credSnap.exists()) {
        const cData = credSnap.data();
        if (typeof cData.passwordHash === 'string') passwordHash = cData.passwordHash;
        if (typeof cData.salt === 'string') salt = cData.salt;
      }
    }

    // Fallback to local authDb credentials if migrating a legacy record
    if (!passwordHash || !salt) {
      const localMatch = authDb.users.find((u) => u.email === email || u.id === data.id);
      if (localMatch) {
        passwordHash = passwordHash || localMatch.passwordHash;
        salt = salt || localMatch.salt;
      }
    }

    const genIds: string[] = Array.isArray(data.generationIds) ? data.generationIds.slice(0, 25) : [];
    const loadedGenerations: StoredGeneration[] = [];

    for (const genId of genIds) {
      if (typeof genId !== 'string' || !/^[a-zA-Z0-9_\-]{1,128}$/.test(genId)) continue;
      const genSnap = await getDoc(doc(db, 'server_users', userDocKey, 'generations', genId));
      if (genSnap.exists()) {
        const gData = genSnap.data();
        loadedGenerations.push({
          id: gData.id,
          toolId: gData.toolId,
          toolName: gData.toolName,
          prompt: gData.prompt,
          outputPreview: gData.outputPreview,
          createdAt: gData.createdAtDisplay || 'Saved',
          type: gData.type,
        });
      }
    }

    const hydrated = normalizeStoredUser({
      id: data.id,
      email,
      name: data.name,
      passwordHash,
      salt,
      plan: data.plan,
      creditsRemaining: data.creditsRemaining,
      creditsTotal: data.creditsTotal,
      favorites: data.favorites,
      savedGenerations: loadedGenerations,
      createdAt: data.createdAtIso,
    });

    const localIdx = authDb.users.findIndex((u) => u.email === hydrated.email || u.id === hydrated.id);
    if (localIdx >= 0) {
      authDb.users[localIdx] = hydrated;
    } else {
      authDb.users.push(hydrated);
    }
    saveAuthDb(authDb);

    // If this record was loaded from the legacy dev fallback secret or lacked isolated credentials, migrate it now
    if (secretUsed !== SESSION_SECRET || (passwordHash && salt)) {
      await ensureUserMigratedToFirestore(hydrated);
    }

    return hydrated;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userPath);
  }
}

async function findOrHydrateUserByEmail(normalizedEmail: string): Promise<StoredUser | null> {
  const primaryUserDocKey = computeUserDocKey(normalizedEmail, SESSION_SECRET);
  try {
    const remoteUser = await loadUserFromFirestoreByDocKey(primaryUserDocKey, normalizedEmail, SESSION_SECRET);
    if (remoteUser) return remoteUser;

    // Seamless migration check for accounts created under the previous dev fallback key
    if (!isProduction && SESSION_SECRET !== LEGACY_DEV_FALLBACK_SECRET) {
      const legacyKey = computeUserDocKey(normalizedEmail, LEGACY_DEV_FALLBACK_SECRET);
      const legacyUser = await loadUserFromFirestoreByDocKey(
        legacyKey,
        normalizedEmail,
        LEGACY_DEV_FALLBACK_SECRET
      );
      if (legacyUser) return legacyUser;
    }
  } catch {
    // Fallback to local store if offline
  }

  const localUser = authDb.users.find((u) => u.email === normalizedEmail);
  return localUser || null;
}

/**
 * Startup Sync:
 * - Treats Firestore as the source of truth if the user document exists in Firestore.
 * - Only migrates local JSON users to Firestore when their Firestore documents do not exist.
 * - Never overwrites newer Firestore data with older local JSON data.
 */
async function syncExistingLocalDataWithFirestore() {
  const localUsersSnapshot = [...authDb.users];
  for (const localUser of localUsersSnapshot) {
    try {
      const primaryKey = computeUserDocKey(localUser.email, SESSION_SECRET);
      const existingRemote = await loadUserFromFirestoreByDocKey(primaryKey, localUser.email, SESSION_SECRET);
      if (existingRemote) {
        // Firestore document exists: loadUserFromFirestoreByDocKey already updated local authDb from Firestore
        continue;
      }

      if (!isProduction && SESSION_SECRET !== LEGACY_DEV_FALLBACK_SECRET) {
        const legacyKey = computeUserDocKey(localUser.email, LEGACY_DEV_FALLBACK_SECRET);
        const migratedLegacy = await loadUserFromFirestoreByDocKey(
          legacyKey,
          localUser.email,
          LEGACY_DEV_FALLBACK_SECRET
        );
        if (migratedLegacy) {
          continue;
        }
      }

      // User does not exist in Firestore yet: safely migrate local user to Firestore
      await ensureUserMigratedToFirestore(localUser);
    } catch {
      // Ignore startup sync warning
    }
  }

  const now = Date.now();
  for (const session of authDb.sessions) {
    if (session.expiresAt > now) {
      const owner = authDb.users.find((u) => u.id === session.userId);
      if (owner) {
        try {
          await persistSessionToFirestore(session, owner.email);
        } catch {
          // Ignore startup sync warning
        }
      }
    }
  }
}
syncExistingLocalDataWithFirestore();

async function hashPasswordWithScrypt(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, usedSalt, 64)) as Buffer;
  return {
    hash: derivedKey.toString('hex'),
    salt: usedSalt,
  };
}

async function verifyPasswordWithScrypt(password: string, storedHash: string, storedSalt: string): Promise<boolean> {
  if (!storedHash || !storedSalt) return false;
  const { hash } = await hashPasswordWithScrypt(password, storedSalt);
  const hashBuffer = Buffer.from(hash, 'hex');
  const storedBuffer = Buffer.from(storedHash, 'hex');
  if (hashBuffer.length !== storedBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, storedBuffer);
}

function signSessionId(sessionId: string): string {
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(sessionId)
    .digest('hex');
  return `${sessionId}.${signature}`;
}

function verifySignedSessionToken(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [sessionId, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(sessionId)
    .digest('hex');
  const sigBuf = Buffer.from(signature, 'hex');
  const expectedBuf = Buffer.from(expectedSig, 'hex');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  return sessionId;
}

function parseCookies(req: Request): Record<string, string> {
  const header = req.headers.cookie;
  if (!header) return {};
  const result: Record<string, string> = {};
  for (const pair of header.split(';')) {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const key = pair.slice(0, idx).trim();
      const val = pair.slice(idx + 1).trim();
      try {
        result[key] = decodeURIComponent(val);
      } catch {
        result[key] = val;
      }
    }
  }
  return result;
}

function setHttpOnlySessionCookie(req: Request, res: Response, signedToken: string, maxAgeSeconds: number): void {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
  const sameSitePolicy = isHttps ? 'SameSite=None; Secure' : 'SameSite=Lax';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(signedToken)}; HttpOnly; Path=/; Max-Age=${maxAgeSeconds}; ${sameSitePolicy}`
  );
}

async function getAuthenticatedUserAsync(req: Request): Promise<StoredUser | null> {
  const cookies = parseCookies(req);
  const rawToken = cookies[SESSION_COOKIE_NAME];
  if (!rawToken) return null;

  const sessionId = verifySignedSessionToken(rawToken);
  if (!sessionId) return null;

  const now = Date.now();
  authDb.sessions = authDb.sessions.filter((s) => s.expiresAt > now);

  let session = authDb.sessions.find((s) => s.sessionId === sessionId);
  if (session) {
    const localUser = authDb.users.find((u) => u.id === session!.userId);
    if (localUser) {
      try {
        const refreshed = await loadUserFromFirestoreByDocKey(
          computeUserDocKey(localUser.email),
          localUser.email,
          SESSION_SECRET
        );
        if (refreshed) return refreshed;
      } catch {
        // Return local user if Firestore read fails
      }
      return localUser;
    }
  }

  // Hydrate session and user from Firestore if not in memory
  const sessionDocKey = computeSessionDocKey(sessionId);
  const sessionPath = `server_sessions/${sessionDocKey}`;
  try {
    const sessionSnap = await getDoc(doc(db, 'server_sessions', sessionDocKey));
    if (!sessionSnap.exists()) return null;
    const sData = sessionSnap.data();
    if (typeof sData.expiresAt !== 'number' || sData.expiresAt <= now) {
      await deleteSessionFromFirestore(sessionId);
      return null;
    }

    const user = await loadUserFromFirestoreByDocKey(sData.userDocKey);
    if (!user) return null;

    session = {
      sessionId,
      userId: user.id,
      expiresAt: sData.expiresAt,
    };
    if (!authDb.sessions.some((s) => s.sessionId === sessionId)) {
      authDb.sessions.push(session);
      saveAuthDb(authDb);
    }
    return user;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, sessionPath);
  }
}

function toSafeUserResponse(user: StoredUser) {
  return {
    isLoggedIn: true,
    email: user.email,
    name: user.name,
    plan: user.plan,
    creditsRemaining: user.creditsRemaining,
    creditsTotal: user.creditsTotal,
    favorites: sanitizeFavorites(user.favorites),
    savedGenerations: sanitizeGenerations(user.savedGenerations),
  };
}

// ============================================================================
// Persistent, Atomic Per-IP Rate Limiting Middleware (Firestore + Local Backup)
// ============================================================================
type RateLimitScope = 'login' | 'signup' | 'chat';

interface RateLimitBucket {
  rateDocKey: string;
  scope: RateLimitScope;
  count: number;
  resetAt: number;
}

interface RateLimitDatabase {
  buckets: Record<string, RateLimitBucket>;
}

const RATE_LIMIT_DB_PATH = path.join(DATA_DIR, 'rate-limits.json');

function computeRateLimitDocKey(
  scope: RateLimitScope,
  clientIp: string,
  secret: string = SESSION_SECRET
): string {
  return crypto
    .createHmac('sha256', secret)
    .update(`ratelimit:${scope}:${clientIp.trim().toLowerCase()}`)
    .digest('hex');
}

function loadRateLimitDb(): RateLimitDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(RATE_LIMIT_DB_PATH)) {
      const raw = fs.readFileSync(RATE_LIMIT_DB_PATH, 'utf8');
      const parsed = JSON.parse(raw) as RateLimitDatabase;
      if (parsed && parsed.buckets && typeof parsed.buckets === 'object') {
        const now = Date.now();
        const activeBuckets: Record<string, RateLimitBucket> = {};
        for (const [key, b] of Object.entries(parsed.buckets)) {
          if (
            b &&
            typeof b.rateDocKey === 'string' &&
            /^[a-f0-9]{64}$/.test(b.rateDocKey) &&
            (b.scope === 'login' || b.scope === 'signup' || b.scope === 'chat') &&
            typeof b.count === 'number' &&
            typeof b.resetAt === 'number' &&
            b.resetAt > now
          ) {
            activeBuckets[key] = b;
          }
        }
        return { buckets: activeBuckets };
      }
    }
  } catch {
    // Initialize clean store if unreadable
  }
  return { buckets: {} };
}

function saveRateLimitDb(store: RateLimitDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(RATE_LIMIT_DB_PATH, JSON.stringify(store, null, 2), { mode: 0o600 });
  } catch {
    // Ignore transient disk write error
  }
}

const rateLimitStore: RateLimitDatabase = loadRateLimitDb();
const rateLimitLocks = new Map<string, Promise<void>>();

/**
 * Serializes concurrent in-process operations on the same rateDocKey to prevent race conditions.
 */
async function withRateLimitLock<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const previousLock = rateLimitLocks.get(key) || Promise.resolve();
  let releaseLock!: () => void;
  const currentLock = new Promise<void>((resolve) => {
    releaseLock = resolve;
  });
  const chainedLock = previousLock.then(() => currentLock);
  rateLimitLocks.set(key, chainedLock);

  await previousLock;
  try {
    return await fn();
  } finally {
    releaseLock();
    if (rateLimitLocks.get(key) === chainedLock) {
      rateLimitLocks.delete(key);
    }
  }
}

/**
 * Automatically purges expired rate-limit records from memory, local backup, and Firestore.
 */
async function cleanupExpiredRateLimits(): Promise<void> {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [rateDocKey, bucket] of Object.entries(rateLimitStore.buckets)) {
    if (!bucket || bucket.resetAt <= now) {
      expiredKeys.push(rateDocKey);
      delete rateLimitStore.buckets[rateDocKey];
    }
  }

  if (expiredKeys.length > 0) {
    saveRateLimitDb(rateLimitStore);
    for (const rateDocKey of expiredKeys) {
      try {
        await deleteDoc(doc(db, 'server_rate_limits', rateDocKey));
      } catch {
        // Ignore cleanup errors if offline or already deleted
      }
    }
  }
}

const globalRateLimitCleanupTimer = setInterval(() => {
  void cleanupExpiredRateLimits();
}, 60_000);
if (typeof globalRateLimitCleanupTimer.unref === 'function') {
  globalRateLimitCleanupTimer.unref();
}
void cleanupExpiredRateLimits();

function extractClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedIp =
    typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0].trim()
      : Array.isArray(forwardedFor) && forwardedFor.length > 0
      ? String(forwardedFor[0]).trim()
      : '';
  return (req.ip || forwardedIp || req.socket?.remoteAddress || 'unknown').trim();
}

function createRateLimiter(options: {
  scope: RateLimitScope;
  windowMs: number;
  maxRequests: number;
  message: string;
}) {
  return async (req: Request, res: Response, next: () => void) => {
    const clientIp = extractClientIp(req);
    const rateDocKey = computeRateLimitDocKey(options.scope, clientIp);

    try {
      const result = await withRateLimitLock(rateDocKey, async () => {
        const now = Date.now();
        const cached = rateLimitStore.buckets[rateDocKey];

        // Spark Free-Tier Quota Protection:
        // Once an IP has already exceeded maxRequests and its blocked state (count > maxRequests)
        // has been committed to Firestore for the active window, fast-reject subsequent flood
        // requests in memory + local disk without burning extra Firestore daily write quota.
        if (cached && cached.resetAt > now && cached.count > options.maxRequests) {
          cached.count = Math.min(100000, cached.count + 1);
          saveRateLimitDb(rateLimitStore);
          return cached;
        }

        const rateRef = doc(db, 'server_rate_limits', rateDocKey);
        try {
          const committedBucket = await runTransaction(db, async (transaction) => {
            const snap = await transaction.get(rateRef);
            const txNow = Date.now();
            let nextCount = 1;
            let nextResetAt = txNow + options.windowMs;

            if (snap.exists()) {
              const data = snap.data();
              const remoteCount = typeof data.count === 'number' ? data.count : 0;
              const remoteResetAt = typeof data.resetAt === 'number' ? data.resetAt : 0;
              if (remoteResetAt > txNow) {
                nextCount = Math.min(100000, remoteCount + 1);
                nextResetAt = remoteResetAt;
              }
            }

            // Reconcile with local disk backup if local state holds a higher count in the active window
            const localActive = rateLimitStore.buckets[rateDocKey];
            if (localActive && localActive.resetAt > txNow) {
              const candidateCount = Math.min(100000, localActive.count + 1);
              if (candidateCount > nextCount) {
                nextCount = candidateCount;
                nextResetAt = localActive.resetAt;
              }
            }

            if (!snap.exists()) {
              transaction.set(rateRef, {
                rateDocKey,
                scope: options.scope,
                count: nextCount,
                resetAt: nextResetAt,
                updatedAt: serverTimestamp(),
              });
            } else {
              transaction.update(rateRef, {
                count: nextCount,
                resetAt: nextResetAt,
                updatedAt: serverTimestamp(),
              });
            }

            return {
              rateDocKey,
              scope: options.scope,
              count: nextCount,
              resetAt: nextResetAt,
            };
          });

          rateLimitStore.buckets[rateDocKey] = committedBucket;
          saveRateLimitDb(rateLimitStore);
          return committedBucket;
        } catch {
          // Safe fallback to local persistent bucket if Firestore is temporarily unreachable or quota-exhausted
          const fallbackNow = Date.now();
          let fallbackBucket = rateLimitStore.buckets[rateDocKey];
          if (!fallbackBucket || fallbackBucket.resetAt <= fallbackNow) {
            fallbackBucket = {
              rateDocKey,
              scope: options.scope,
              count: 1,
              resetAt: fallbackNow + options.windowMs,
            };
          } else {
            fallbackBucket.count = Math.min(100000, fallbackBucket.count + 1);
          }
          rateLimitStore.buckets[rateDocKey] = fallbackBucket;
          saveRateLimitDb(rateLimitStore);
          return fallbackBucket;
        }
      });

      const now = Date.now();
      const remaining = Math.max(0, options.maxRequests - result.count);
      const retryAfterSeconds = Math.max(1, Math.ceil((result.resetAt - now) / 1000));

      res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
      res.setHeader('X-RateLimit-Remaining', String(remaining));

      if (result.count > options.maxRequests) {
        res.setHeader('Retry-After', String(retryAfterSeconds));
        return res.status(429).json({
          error: options.message,
        });
      }

      return next();
    } catch {
      return next();
    }
  };
}

// Reasonable per-IP rate limits for normal users while blocking brute force & quota abuse
const loginRateLimiter = createRateLimiter({
  scope: 'login',
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 10, // 10 login attempts per 15 minutes per IP
  message: 'Too many login attempts from your IP address. Please wait a few minutes and try again.',
});

const signupRateLimiter = createRateLimiter({
  scope: 'signup',
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 account signups per 15 minutes per IP
  message: 'Too many signup requests from your IP address. Please wait a few minutes and try again.',
});

const chatRateLimiter = createRateLimiter({
  scope: 'chat',
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 20, // 20 AI generation requests per minute per IP
  message: 'You have reached the rate limit for AI requests. Please wait a moment before generating again.',
});

/**
 * Safely merges validated & sanitized guest favorites and generations into an authenticated user account.
 * - Preserves all existing Firestore favorites and generations.
 * - Prevents duplicate favorites (by toolId) and duplicate generations (by id or toolId+prompt+outputPreview signature).
 * - Never overwrites existing account documents in Firestore.
 */
async function mergeGuestDataIntoUser(
  user: StoredUser,
  rawGuestFavorites?: unknown,
  rawGuestGenerations?: unknown
): Promise<boolean> {
  const userDocKey = computeUserDocKey(user.email);
  const userPath = `server_users/${userDocKey}`;
  const userRef = doc(db, 'server_users', userDocKey);

  await ensureUserMigratedToFirestore(user);

  const existingFavorites = sanitizeFavorites(user.favorites);
  const incomingFavorites = Array.isArray(rawGuestFavorites) ? sanitizeFavorites(rawGuestFavorites) : [];

  const mergedFavorites = [...existingFavorites];
  let favoritesChanged = false;
  for (const favId of incomingFavorites) {
    if (!mergedFavorites.includes(favId) && mergedFavorites.length < 20) {
      mergedFavorites.push(favId);
      favoritesChanged = true;
    }
  }

  const existingGenerations = sanitizeGenerations(user.savedGenerations);
  const incomingGenerations = Array.isArray(rawGuestGenerations)
    ? sanitizeGenerations(rawGuestGenerations)
    : [];

  const existingIds = new Set(existingGenerations.map((g) => g.id));
  const existingSignatures = new Set(
    existingGenerations.map((g) => `${g.toolId}::${g.prompt.trim()}::${g.outputPreview.trim()}`)
  );

  const newGenerationsToPersist: StoredGeneration[] = [];
  for (const guestGen of incomingGenerations) {
    const signature = `${guestGen.toolId}::${guestGen.prompt.trim()}::${guestGen.outputPreview.trim()}`;
    if (existingIds.has(guestGen.id) || existingSignatures.has(signature)) {
      continue;
    }
    if (existingGenerations.length + newGenerationsToPersist.length >= 25) {
      break;
    }
    existingIds.add(guestGen.id);
    existingSignatures.add(signature);
    newGenerationsToPersist.push(guestGen);
  }

  if (!favoritesChanged && newGenerationsToPersist.length === 0) {
    return true;
  }

  // Persist only brand-new guest generations to Firestore without overwriting existing generation documents
  try {
    for (const gen of newGenerationsToPersist) {
      const genRef = doc(db, 'server_users', userDocKey, 'generations', gen.id);
      const existingGenSnap = await getDoc(genRef);
      if (!existingGenSnap.exists()) {
        await setDoc(genRef, {
          id: gen.id,
          userDocKey,
          toolId: gen.toolId.slice(0, 64),
          toolName: gen.toolName.slice(0, 100),
          prompt: gen.prompt.slice(0, 4000),
          outputPreview: gen.outputPreview.slice(0, 4000),
          type: gen.type,
          createdAtDisplay: gen.createdAt.slice(0, 64),
          createdAt: serverTimestamp(),
        });
      }
    }

    // Keep existing generations intact and append newly merged guest generations
    const mergedGenerations = [...newGenerationsToPersist, ...existingGenerations].slice(0, 25);
    const generationIds = mergedGenerations.map((g) => g.id).slice(0, 25);

    if (user.plan !== 'pro' && newGenerationsToPersist.length > 0) {
      user.creditsRemaining = Math.max(0, user.creditsRemaining - newGenerationsToPersist.length);
    }
    user.favorites = mergedFavorites;
    user.savedGenerations = mergedGenerations;

    const localIdx = authDb.users.findIndex((u) => u.email === user.email || u.id === user.id);
    if (localIdx >= 0) {
      authDb.users[localIdx] = user;
    }
    saveAuthDb(authDb);

    await updateDoc(userRef, {
      favorites: user.favorites,
      generationIds,
      creditsRemaining: user.creditsRemaining,
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, userPath, { id: user.id, email: user.email });
  }
}

// POST /api/auth/signup
app.post('/api/auth/signup', signupRateLimiter, async (req: Request, res: Response) => {
  try {
    const { name, email, password, guestFavorites, guestGenerations } = req.body || {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const trimmedName = typeof name === 'string' ? name.trim() : '';

    if (!normalizedEmail || normalizedEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }
    if (password.length > 128) {
      return res.status(400).json({ error: 'Password cannot exceed 128 characters.' });
    }

    const existing = await findOrHydrateUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
    }

    const { hash, salt } = await hashPasswordWithScrypt(password);
    const displayName = trimmedName ? trimmedName.slice(0, 60) : normalizedEmail.split('@')[0].slice(0, 60);

    // Plan is strictly assigned on the server as 'free' — client cannot self-assign 'pro'
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      name: displayName || 'Creator',
      passwordHash: hash,
      salt: salt,
      plan: 'free',
      creditsRemaining: 50,
      creditsTotal: 50,
      favorites: [...DEFAULT_FAVORITES],
      savedGenerations: [],
      createdAt: new Date().toISOString(),
    };

    const sessionId = crypto.randomBytes(32).toString('hex');
    const newSession: StoredSession = {
      sessionId,
      userId: newUser.id,
      expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
    };

    authDb.users.push(newUser);
    authDb.sessions.push(newSession);
    saveAuthDb(authDb);

    // Persist user profile, isolated credentials, and session to Firebase Firestore
    await ensureUserMigratedToFirestore(newUser);
    const guestMerged = await mergeGuestDataIntoUser(newUser, guestFavorites, guestGenerations);
    await persistSessionToFirestore(newSession, newUser.email);

    const signedToken = signSessionId(sessionId);
    setHttpOnlySessionCookie(req, res, signedToken, SESSION_TTL_SECONDS);

    return res.status(201).json({ user: toSafeUserResponse(newUser), guestMerged });
  } catch {
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', loginRateLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password, guestFavorites, guestGenerations } = req.body || {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await findOrHydrateUserByEmail(normalizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = await verifyPasswordWithScrypt(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const sessionId = crypto.randomBytes(32).toString('hex');
    const newSession: StoredSession = {
      sessionId,
      userId: user.id,
      expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
    };
    authDb.sessions.push(newSession);
    saveAuthDb(authDb);

    // Ensure user exists in Firestore without overwriting existing Firestore data, then safely merge any guest items
    await ensureUserMigratedToFirestore(user);
    const guestMerged = await mergeGuestDataIntoUser(user, guestFavorites, guestGenerations);
    await persistSessionToFirestore(newSession, user.email);

    const signedToken = signSessionId(sessionId);
    setHttpOnlySessionCookie(req, res, signedToken, SESSION_TTL_SECONDS);

    return res.json({ user: toSafeUserResponse(user), guestMerged });
  } catch {
    return res.status(500).json({ error: 'Failed to sign in. Please try again.' });
  }
});

// POST /api/user/merge-guest — Explicitly merge guest favorites & generations into the authenticated account
app.post('/api/user/merge-guest', async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUserAsync(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required to merge guest data.' });
    }

    const { guestFavorites, guestGenerations } = req.body || {};
    const guestMerged = await mergeGuestDataIntoUser(user, guestFavorites, guestGenerations);
    return res.json({
      ok: true,
      guestMerged,
      user: toSafeUserResponse(user),
    });
  } catch {
    return res.status(500).json({ error: 'Failed to merge guest session data.' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', async (req: Request, res: Response) => {
  const cookies = parseCookies(req);
  const rawToken = cookies[SESSION_COOKIE_NAME];
  if (rawToken) {
    const sessionId = verifySignedSessionToken(rawToken);
    if (sessionId) {
      authDb.sessions = authDb.sessions.filter((s) => s.sessionId !== sessionId);
      saveAuthDb(authDb);
      try {
        await deleteSessionFromFirestore(sessionId);
      } catch {
        // Ignore cleanup error on logout
      }
    }
  }
  setHttpOnlySessionCookie(req, res, '', 0);
  return res.json({ ok: true });
});

// GET /api/auth/me
app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUserAsync(req);
    if (!user) {
      return res.json({
        user: {
          isLoggedIn: false,
          email: '',
          name: '',
          plan: 'free',
          creditsRemaining: 0,
          creditsTotal: 50,
          favorites: [...DEFAULT_FAVORITES],
          savedGenerations: [],
        },
      });
    }
    return res.json({ user: toSafeUserResponse(user) });
  } catch {
    return res.json({
      user: {
        isLoggedIn: false,
        email: '',
        name: '',
        plan: 'free',
        creditsRemaining: 0,
        creditsTotal: 50,
        favorites: [...DEFAULT_FAVORITES],
        savedGenerations: [],
      },
    });
  }
});

// POST /api/user/favorites — Persist user's bookmarked favorite tools in Firestore
app.post('/api/user/favorites', async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUserAsync(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required to save favorites.' });
    }

    const { toolId, favorites } = req.body || {};
    if (Array.isArray(favorites)) {
      user.favorites = sanitizeFavorites(favorites);
    } else if (typeof toolId === 'string' && /^[a-zA-Z0-9_\-]{1,64}$/.test(toolId)) {
      const current = sanitizeFavorites(user.favorites);
      user.favorites = current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId].slice(0, 20);
    } else {
      return res.status(400).json({ error: 'A valid toolId is required.' });
    }

    saveAuthDb(authDb);
    await updateUserFavoritesInFirestore(user);

    return res.json({ ok: true, favorites: user.favorites });
  } catch {
    return res.status(500).json({ error: 'Failed to update favorites in Firestore.' });
  }
});

// POST /api/user/generations — Persist user's AI tool generation history & decrement credits in Firestore
app.post('/api/user/generations', async (req: Request, res: Response) => {
  try {
    const user = await getAuthenticatedUserAsync(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required to save generation history.' });
    }

    // Never accept creditsRemaining or plan from client request body
    const { id, toolId, toolName, prompt, outputPreview, type } = req.body || {};
    const validTypes = new Set(['image', 'text', 'audio', 'video']);

    const safeGen: StoredGeneration = {
      id:
        typeof id === 'string' && /^[a-zA-Z0-9_\-]{1,128}$/.test(id)
          ? id
          : `gen-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      toolId:
        typeof toolId === 'string' && /^[a-zA-Z0-9_\-]{1,64}$/.test(toolId)
          ? toolId
          : 'ai-chat',
      toolName:
        typeof toolName === 'string' && toolName.trim()
          ? toolName.trim().slice(0, 100)
          : 'AI Tool',
      prompt:
        typeof prompt === 'string' && prompt.trim()
          ? prompt.trim().slice(0, 4000)
          : 'Prompt',
      outputPreview:
        typeof outputPreview === 'string' && outputPreview.trim()
          ? outputPreview.trim().slice(0, 4000)
          : 'Generated output',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type:
        typeof type === 'string' && validTypes.has(type)
          ? (type as StoredGeneration['type'])
          : 'text',
    };

    if (user.plan !== 'pro') {
      user.creditsRemaining = Math.max(0, user.creditsRemaining - 1);
    }
    user.savedGenerations = [safeGen, ...sanitizeGenerations(user.savedGenerations)].slice(0, 25);

    saveAuthDb(authDb);
    await persistGenerationToFirestore(user, safeGen);

    return res.status(201).json({
      ok: true,
      generation: safeGen,
      creditsRemaining: user.creditsRemaining,
      savedGenerations: user.savedGenerations,
    });
  } catch {
    return res.status(500).json({ error: 'Failed to save generation to Firestore.' });
  }
});

// Helper to return safe, user-friendly error messages without exposing internal server details
function extractReadableError(error: any): string {
  const status = error?.status;
  const raw = String(error?.message || '');
  if (status === 429 || raw.includes('RESOURCE_EXHAUSTED') || raw.includes('quota')) {
    return 'The AI service is currently busy or has reached its free-tier rate limit. Please wait a moment and try again.';
  }
  if (status === 503 || raw.includes('UNAVAILABLE')) {
    return 'The AI service is experiencing high demand. Please retry in a few seconds.';
  }
  return 'Unable to complete the AI request right now. Please try again shortly.';
}

// Shared helper to call free-tier Gemini API on the server
async function callGeminiText(contents: any, systemInstruction: string, clientModel?: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const err: any = new Error('AI service configuration is missing on the server.');
    err.status = 500;
    throw err;
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Primary free-tier high-availability models
  const normalizedClientModel =
    !clientModel || clientModel === 'gemini-3.1-flash-lite' || clientModel === 'gemini-3.8-flash'
      ? 'gemini-3.1-flash-lite-preview'
      : clientModel;
  const preferredModel = normalizedClientModel;
  const candidateModels = Array.from(
    new Set([preferredModel, 'gemini-3.1-flash-lite-preview', 'gemini-flash-latest'])
  );

  let lastError: any = null;
  let reply = '';
  let usedModel = preferredModel;

  // Up to 3 rounds with backoff to smoothly ride out temporary 503 high-demand spikes
  for (let round = 0; round < 3; round++) {
    for (const modelToTry of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelToTry,
          contents: contents,
          config: {
            systemInstruction,
          },
        });

        if (response.text) {
          reply = response.text;
          usedModel = modelToTry;
          break;
        }
      } catch (err: any) {
        lastError = err;
        await new Promise((r) => setTimeout(r, 350 * (round + 1)));
      }
    }
    if (reply) break;
  }

  if (!reply && lastError) {
    throw lastError;
  }

  if (!reply) {
    throw new Error('Empty response received from Gemini API.');
  }

  return { reply, model: usedModel };
}

// Health / status endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({ status: 'ok', hasKey, firestoreDatabaseId: firebaseConfig.firestoreDatabaseId });
});

// Real Gemini Chat API endpoint (rate-limited per IP)
app.post('/api/chat', chatRateLimiter, async (req: Request, res: Response) => {
  try {
    const { message, history, model: clientModel } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'A valid message string is required.' });
    }

    if (message.length > 8000) {
      return res.status(400).json({ error: 'Message is too long. Please keep inputs under 8,000 characters.' });
    }

    let contents: any;
    if (Array.isArray(history) && history.length > 0) {
      const safeHistory = history
        .slice(-20)
        .filter((item: any) => item && typeof item.text === 'string')
        .map((item: { role: string; text: string }) => ({
          role: item.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: item.text.slice(0, 8000) }],
        }));
      safeHistory.push({
        role: 'user',
        parts: [{ text: message.trim() }],
      });
      contents = safeHistory;
    } else {
      contents = message.trim();
    }

    const systemInstruction =
      'You are Fariya AI, an intelligent, helpful, and polite AI assistant. Provide clear, high quality, accurate responses with clean markdown formatting and code syntax when appropriate.';

    const { reply, model } = await callGeminiText(contents, systemInstruction, clientModel);
    return res.json({ reply, model });
  } catch (error: any) {
    const errorMessage = extractReadableError(error);
    const status = typeof error?.status === 'number' && error.status >= 400 && error.status < 600 ? error.status : 500;
    return res.status(status).json({ error: errorMessage });
  }
});

// Real Gemini Text Tool Generation API endpoint (Story Writer, Video Prompt Generator, Content Writer, Translator)
app.post('/api/generate', chatRateLimiter, async (req: Request, res: Response) => {
  try {
    const { tool, prompt, options } = req.body || {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({ error: 'Please enter a prompt or input text to generate a result.' });
    }

    if (prompt.length > 8000) {
      return res.status(400).json({ error: 'Input is too long. Please keep prompts under 8,000 characters.' });
    }

    let systemInstruction =
      'You are Fariya AI, an expert generative AI assistant. Provide well-structured, high-quality output.';
    let userPrompt = prompt.trim();

    switch (tool) {
      case 'ai-story': {
        const genre = options?.genre || 'Creative Fiction';
        const tone = options?.tone || 'Imaginative & Engaging';
        const length = options?.length || 'Medium';
        systemInstruction =
          'You are Fariya AI Story Writer, an acclaimed creative fiction author and narrative designer. Write vivid, original, emotionally resonant stories with strong pacing, sensory details, and compelling characters. Use clean markdown formatting with a title and chapters/scenes.';
        userPrompt = `Write an original story based on the following premise:\n"${prompt.trim()}"\n\nParameters:\n- Genre: ${genre}\n- Tone: ${tone}\n- Length: ${length}`;
        break;
      }

      case 'ai-video-prompt': {
        const style = options?.style || 'Cinematic 4K';
        const camera = options?.camera || 'Smooth Gimbal Tracking Shot';
        const aspect = options?.aspectRatio || '16:9';
        const lighting = options?.lighting || 'Volumetric Golden Hour / Neon Contrast';
        systemInstruction =
          'You are Fariya AI Video Prompt Director, a specialist in crafting detailed text-to-video prompts for modern video synthesis engines (such as Veo, Runway Gen-3, Sora, and Kling). Structure your output clearly with: 1) Master Copy-Ready Video Prompt (a single cohesive paragraph), 2) Camera & Motion Direction, 3) Lighting & Atmosphere Breakdown, and 4) Negative Prompt / Technical Specs.';
        userPrompt = `Create a professional, studio-grade AI video generation prompt for this concept:\n"${prompt.trim()}"\n\nCinematography Settings:\n- Visual Style: ${style}\n- Camera Movement: ${camera}\n- Lighting Mood: ${lighting}\n- Aspect Ratio: ${aspect}`;
        break;
      }

      case 'ai-content': {
        const contentType = options?.contentType || 'Blog Article';
        const tone = options?.tone || 'Professional & Persuasive';
        const audience = options?.audience || 'General Audience';
        systemInstruction =
          'You are Fariya AI Content Writer, an expert copywriter, content strategist, and editor. Produce polished, publication-ready content with compelling hooks, clear headings, actionable takeaways, and strong calls to action.';
        userPrompt = `Create a ${contentType} about the following topic:\n"${prompt.trim()}"\n\nSpecifications:\n- Content Format: ${contentType}\n- Tone of Voice: ${tone}\n- Target Audience: ${audience}`;
        break;
      }

      case 'ai-translator': {
        const sourceLang = options?.sourceLang || 'Auto-Detect';
        const targetLang = options?.targetLang || 'Spanish';
        const formality = options?.formality || 'Natural & Standard';
        systemInstruction =
          'You are Fariya AI Translator, a master polyglot and professional localization expert. Translate the provided text accurately while preserving nuance, idioms, and formatting. First provide the direct translation clearly, followed by brief pronunciation or cultural/contextual notes if helpful.';
        userPrompt = `Translate the following text from ${sourceLang} into ${targetLang} (Style/Formality: ${formality}):\n\n"${prompt.trim()}"`;
        break;
      }

      default: {
        break;
      }
    }

    const { reply, model } = await callGeminiText(userPrompt, systemInstruction);
    return res.json({ result: reply, model });
  } catch (error: any) {
    const errorMessage = extractReadableError(error);
    const status = typeof error?.status === 'number' ? error.status : 500;
    return res.status(status).json({ error: errorMessage });
  }
});

// Server-side Gemini Image Generation endpoint (/api/image)
app.post('/api/image', async (req: Request, res: Response) => {
  const { prompt, style, aspectRatio } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Please enter a valid image prompt.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error:
        'Missing GEMINI_API_KEY. Please make sure your Gemini API key is configured in the environment secrets.',
    });
  }

  const imageModel = 'gemini-3.1-flash-image-preview';
  const fullPrompt = `${prompt.trim()}${style ? `, Style: ${style}` : ''}${
    aspectRatio ? `, Aspect Ratio: ${aspectRatio}` : ''
  }`;

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await ai.models.generateContent({
      model: imageModel,
      contents: fullPrompt,
    });

    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData && p.inlineData.data);

    if (imagePart?.inlineData) {
      const mimeType = imagePart.inlineData.mimeType || 'image/png';
      const imageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;
      return res.json({
        available: true,
        imageUrl,
        model: imageModel,
      });
    }

    return res.json({
      available: false,
      model: imageModel,
      message:
        'No image binary data was returned by the model. Free-tier image generation is currently unavailable without a paid billing plan.',
    });
  } catch (error: any) {
    const rawMessage = extractReadableError(error);
    const isFreeTierZeroQuota =
      error?.status === 429 ||
      rawMessage.includes('limit: 0') ||
      rawMessage.includes('exceeded your current quota') ||
      rawMessage.includes('RESOURCE_EXHAUSTED');

    if (isFreeTierZeroQuota) {
      return res.json({
        available: false,
        model: imageModel,
        quotaError: rawMessage,
        message:
          'Google Gemini image generation (gemini-3.1-flash-image-preview) returned HTTP 429 RESOURCE_EXHAUSTED with Free Tier limit: 0 (0 free requests/day). Live image generation requires a paid Google Cloud billing account, which is disabled.',
      });
    }

    return res.status(500).json({
      error: rawMessage || 'Failed to generate image from Gemini API.',
    });
  }
});

// Vite middleware in dev or static files in production
if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Fariya AI server listening on http://0.0.0.0:${port}`);
});
