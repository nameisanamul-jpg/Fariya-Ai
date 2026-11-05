# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants

1. **Zero Enumeration / No List Queries**:
   - Listing (`allow list`) is strictly forbidden (`if false`) across `/server_users`, `/server_credentials`, `/server_users/{userDocKey}/generations`, `/server_sessions`, and `/server_rate_limits`.
   - Documents can only be accessed via their unguessable 256-bit `HMAC-SHA256(SESSION_SECRET, ...)` capability document key (`^[a-f0-9]{64}$`).
2. **Credential & Rate-Limit Isolation**:
   - Password hashes (`passwordHash`) and salts (`salt`) are strictly excluded from `/server_users/{userDocKey}` and stored in a dedicated, write-once collection `/server_credentials/{credDocKey}` (`allow update: if false; allow delete: if false;`) keyed by a distinct HMAC domain (`cred:`).
   - Rate-limit buckets are stored in `/server_rate_limits/{rateDocKey}` keyed by `HMAC-SHA256(SESSION_SECRET, "ratelimit:<scope>:<clientIp>")` so raw client IP addresses are never stored or exposed in Firestore.
3. **Credit Security (Monotonic Non-Increasing Credits on Client-Triggered Updates)**:
   - On creation of `/server_users/{userDocKey}`, `plan == 'free'` and `creditsRemaining <= creditsTotal`.
   - On any update to `/server_users/{userDocKey}`, `incoming().creditsRemaining <= existing().creditsRemaining`, `incoming().creditsTotal == existing().creditsTotal`, and `incoming().plan == existing().plan`.
4. **Master Gate & Relational Integrity**:
   - A `ServerCredential` (`/server_credentials/{credDocKey}`) or `ServerSession` (`/server_sessions/{sessionDocKey}`) cannot be created unless its parent `ServerUser` (`/server_users/$(userDocKey)`) exists and matches `userId`.
   - A `UserGeneration` (`/server_users/{userDocKey}/generations/{generationId}`) cannot be read or created unless `/server_users/$(userDocKey)` exists and matches `userDocKey`.
5. **Immutability & Temporal Integrity**:
   - `createdAt` must equal `request.time` on creation and remain immutable on updates.
   - `updatedAt` must equal `request.time` on updates (including `/server_rate_limits/{rateDocKey}`).

## 2. The "Dirty Dozen" Payloads

1. **Payload 1 (Collection Enumeration / List Scraping)**: Attempting a `list` query on `/server_users`, `/server_credentials`, `/server_sessions`, or `/server_rate_limits`.
2. **Payload 2 (Malformed Document ID / ID Poisoning)**: Creating `/server_users/not-a-sha256-hmac` with a non-64-char hex ID.
3. **Payload 3 (Shadow Field / Password Hash Injection into `ServerUser`)**: Creating a `ServerUser` containing `passwordHash` or `isAdmin: true`.
4. **Payload 4 (Self-Assigned Pro Plan on Signup)**: Creating a `ServerUser` with `"plan": "pro"`.
5. **Payload 5 (Unauthorized Credit Increase on Update)**: Updating `creditsRemaining` on `ServerUser` to a value greater than `existing().creditsRemaining`.
6. **Payload 6 (Credential Mutation / Deletion)**: Attempting to `update` or `delete` a document in `/server_credentials/{credDocKey}`.
7. **Payload 7 (Orphaned Session Creation)**: Creating a `ServerSession` referencing a `userDocKey` that does not exist in `/server_users`.
8. **Payload 8 (Orphaned Generation Creation)**: Creating a `UserGeneration` under a non-existent `/server_users/{userDocKey}`.
9. **Payload 9 (Identity Mutation on Update)**: Updating a `ServerUser` while changing `email` or `id`.
10. **Payload 10 (Forged Client Timestamp)**: Creating a `ServerUser` or `UserGeneration` with a past/future `createdAt` timestamp instead of `request.time`.
11. **Payload 11 (Cross-Document Key Mismatch)**: Creating `/server_users/{keyA}` where `data.userDocKey` is `keyB`.
12. **Payload 12 (Oversized Generation Prompt / Denial of Wallet)**: Creating a `UserGeneration` with a 5,000-character `prompt` (exceeding maxLength 4000).
