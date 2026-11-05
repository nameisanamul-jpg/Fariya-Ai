import React, { createContext, useContext, useState, useEffect } from 'react';
import { PageView, AITool, UserSession, SavedGeneration } from '../types';
import { AI_TOOLS } from '../data/tools';

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AppContextType {
  currentPage: PageView;
  navigateTo: (page: PageView) => void;
  activeTool: AITool | null;
  openToolPlayground: (tool: AITool | string) => void;
  closeToolPlayground: () => void;
  isCheckoutOpen: boolean;
  checkoutTier: 'pro' | 'free';
  openCheckout: (tier?: 'pro' | 'free') => void;
  closeCheckout: () => void;
  user: UserSession;
  isAuthLoading: boolean;
  signupUser: (name: string, email: string, password: string) => Promise<AuthResult>;
  loginUser: (email: string, password: string) => Promise<AuthResult>;
  logoutUser: () => Promise<void>;
  toggleFavorite: (toolId: string) => void;
  addSavedGeneration: (gen: Omit<SavedGeneration, 'id' | 'createdAt'>) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const LOGGED_OUT_USER: UserSession = {
  isLoggedIn: false,
  email: '',
  name: '',
  plan: 'free',
  creditsRemaining: 0,
  creditsTotal: 50,
  savedGenerations: [],
  favorites: ['ai-chat', 'ai-story', 'ai-video-prompt'],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [activeTool, setActiveTool] = useState<AITool | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutTier, setCheckoutTier] = useState<'pro' | 'free'>('pro');
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<UserSession>(LOGGED_OUT_USER);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  // Temporary buffers for guest-created favorites & generations until server merge confirmation
  const [pendingGuestFavorites, setPendingGuestFavorites] = useState<string[]>([]);
  const [pendingGuestGenerations, setPendingGuestGenerations] = useState<SavedGeneration[]>([]);

  const sanitizeClientFavorites = (favs: string[]): string[] => {
    const seen = new Set<string>();
    const validIds = new Set(AI_TOOLS.map((t) => t.id));
    const clean: string[] = [];
    for (const id of favs) {
      const trimmed = String(id || '').replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64);
      if (trimmed && validIds.has(trimmed) && !seen.has(trimmed)) {
        seen.add(trimmed);
        clean.push(trimmed);
        if (clean.length >= 20) break;
      }
    }
    return clean;
  };

  const sanitizeClientGenerations = (gens: SavedGeneration[]): SavedGeneration[] => {
    const validTypes = new Set(['image', 'text', 'audio', 'video']);
    const seenIds = new Set<string>();
    const seenSigs = new Set<string>();
    const clean: SavedGeneration[] = [];

    for (const g of gens) {
      if (!g || typeof g !== 'object') continue;
      const id = String(g.id || '').replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 128);
      const toolId = String(g.toolId || '').replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64) || 'ai-chat';
      const toolName = String(g.toolName || 'AI Tool').trim().slice(0, 100) || 'AI Tool';
      const prompt = String(g.prompt || '').trim().slice(0, 4000);
      const outputPreview = String(g.outputPreview || '').trim().slice(0, 4000);
      const createdAt = String(g.createdAt || 'Just now').trim().slice(0, 64) || 'Just now';
      const type = validTypes.has(g.type) ? g.type : 'text';

      if (!id || !prompt || !outputPreview) continue;
      const sig = `${toolId}::${prompt}::${outputPreview}`;
      if (seenIds.has(id) || seenSigs.has(sig)) continue;

      seenIds.add(id);
      seenSigs.add(sig);
      clean.push({ id, toolId, toolName, prompt, outputPreview, createdAt, type });
      if (clean.length >= 25) break;
    }
    return clean;
  };

  // Purge any legacy localStorage session/API key data and verify session via server HttpOnly cookie
  useEffect(() => {
    try {
      localStorage.removeItem('fariya_ai_user_session');
    } catch {
      // ignore
    }

    let isMounted = true;
    fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data?.user && data.user.isLoggedIn) {
          setUser((prev) => ({
            ...prev,
            isLoggedIn: true,
            email: data.user.email,
            name: data.user.name,
            plan: data.user.plan === 'pro' ? 'pro' : 'free',
            creditsRemaining: data.user.creditsRemaining ?? 50,
            creditsTotal: data.user.creditsTotal ?? 50,
            favorites: Array.isArray(data.user.favorites) ? data.user.favorites : prev.favorites,
            savedGenerations: Array.isArray(data.user.savedGenerations)
              ? data.user.savedGenerations
              : prev.savedGenerations,
          }));
        } else {
          setUser(LOGGED_OUT_USER);
        }
      })
      .catch(() => {
        if (isMounted) setUser(LOGGED_OUT_USER);
      })
      .finally(() => {
        if (isMounted) setIsAuthLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const navigateTo = (page: PageView) => {
    if (page === 'dashboard' && !user.isLoggedIn) {
      setCurrentPage('login');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openToolPlayground = (toolOrId: AITool | string) => {
    if (typeof toolOrId === 'string') {
      const found = AI_TOOLS.find((t) => t.id === toolOrId || t.slug === toolOrId);
      if (found) {
        setActiveTool(found);
        setCurrentPage('tool');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setActiveTool(toolOrId);
      setCurrentPage('tool');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const closeToolPlayground = () => {
    setActiveTool(null);
    setCurrentPage('all-tools');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCheckout = (tier: 'pro' | 'free' = 'pro') => {
    setCheckoutTier(tier);
    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const signupUser = async (name: string, email: string, password: string): Promise<AuthResult> => {
    try {
      const guestFavsToMerge = sanitizeClientFavorites(pendingGuestFavorites);
      const guestGensToMerge = sanitizeClientGenerations(
        pendingGuestGenerations.length > 0 ? pendingGuestGenerations : user.savedGenerations
      );

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password,
          guestFavorites: guestFavsToMerge,
          guestGenerations: guestGensToMerge,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.user) {
        return { ok: false, error: data?.error || 'Could not create account.' };
      }

      // Clear temporary guest buffers ONLY after the server confirms merge succeeded
      if (data.guestMerged === true) {
        setPendingGuestFavorites([]);
        setPendingGuestGenerations([]);
      }

      setUser((prev) => ({
        ...prev,
        isLoggedIn: true,
        email: data.user.email,
        name: data.user.name,
        plan: data.user.plan === 'pro' ? 'pro' : 'free',
        creditsRemaining: data.user.creditsRemaining ?? 50,
        creditsTotal: data.user.creditsTotal ?? 50,
        favorites: Array.isArray(data.user.favorites) ? data.user.favorites : prev.favorites,
        savedGenerations: Array.isArray(data.user.savedGenerations)
          ? data.user.savedGenerations
          : [],
      }));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while creating account.' };
    }
  };

  const loginUser = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const guestFavsToMerge = sanitizeClientFavorites(pendingGuestFavorites);
      const guestGensToMerge = sanitizeClientGenerations(
        pendingGuestGenerations.length > 0 ? pendingGuestGenerations : user.savedGenerations
      );

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password,
          guestFavorites: guestFavsToMerge,
          guestGenerations: guestGensToMerge,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.user) {
        return { ok: false, error: data?.error || 'Invalid email or password.' };
      }

      // Clear temporary guest buffers ONLY after the server confirms merge succeeded
      if (data.guestMerged === true) {
        setPendingGuestFavorites([]);
        setPendingGuestGenerations([]);
      }

      setUser((prev) => ({
        ...prev,
        isLoggedIn: true,
        email: data.user.email,
        name: data.user.name,
        plan: data.user.plan === 'pro' ? 'pro' : 'free',
        creditsRemaining: data.user.creditsRemaining ?? 50,
        creditsTotal: data.user.creditsTotal ?? 50,
        favorites: Array.isArray(data.user.favorites) ? data.user.favorites : prev.favorites,
        savedGenerations: Array.isArray(data.user.savedGenerations)
          ? data.user.savedGenerations
          : prev.savedGenerations,
      }));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error while signing in.' };
    }
  };

  const logoutUser = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore network error on logout
    }
    setPendingGuestFavorites([]);
    setPendingGuestGenerations([]);
    setUser(LOGGED_OUT_USER);
    setCurrentPage('login');
  };

  const toggleFavorite = (toolId: string) => {
    const cleanId = toolId.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64);
    if (!cleanId) return;

    setUser((prev) => {
      const exists = prev.favorites.includes(cleanId);
      const updated = exists
        ? prev.favorites.filter((id) => id !== cleanId)
        : [...prev.favorites, cleanId].slice(0, 20);

      if (prev.isLoggedIn) {
        fetch('/api/user/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ favorites: updated }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.ok && Array.isArray(data.favorites)) {
              setUser((curr) => ({ ...curr, favorites: data.favorites }));
            }
          })
          .catch(() => {
            // ignore network error
          });
      } else {
        setPendingGuestFavorites((guestPrev) => {
          if (exists) {
            return guestPrev.filter((id) => id !== cleanId);
          }
          return guestPrev.includes(cleanId) ? guestPrev : [...guestPrev, cleanId].slice(0, 20);
        });
      }

      return { ...prev, favorites: updated };
    });
  };

  const addSavedGeneration = (gen: Omit<SavedGeneration, 'id' | 'createdAt'>) => {
    const genId = `gen-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newGen: SavedGeneration = {
      id: genId,
      toolId: gen.toolId.replace(/[^a-zA-Z0-9_\-]/g, '').slice(0, 64) || 'ai-chat',
      toolName: (gen.toolName || 'AI Tool').slice(0, 100),
      prompt: (gen.prompt || 'Prompt').slice(0, 4000),
      outputPreview: (gen.outputPreview || 'Generated output').slice(0, 4000),
      createdAt: 'Just now',
      type: gen.type,
    };

    setUser((prev) => {
      if (prev.isLoggedIn) {
        fetch('/api/user/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(newGen),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.ok) {
              setUser((curr) => ({
                ...curr,
                creditsRemaining:
                  typeof data.creditsRemaining === 'number'
                    ? data.creditsRemaining
                    : curr.creditsRemaining,
                savedGenerations: Array.isArray(data.savedGenerations)
                  ? data.savedGenerations
                  : curr.savedGenerations,
              }));
            }
          })
          .catch(() => {
            // ignore network error
          });
      } else {
        setPendingGuestGenerations((guestPrev) => [newGen, ...guestPrev].slice(0, 25));
      }

      return {
        ...prev,
        creditsRemaining: prev.plan === 'pro' ? prev.creditsRemaining : Math.max(0, prev.creditsRemaining - 1),
        savedGenerations: [newGen, ...prev.savedGenerations].slice(0, 25),
      };
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentPage,
        navigateTo,
        activeTool,
        openToolPlayground,
        closeToolPlayground,
        isCheckoutOpen,
        checkoutTier,
        openCheckout,
        closeCheckout,
        user,
        isAuthLoading,
        signupUser,
        loginUser,
        logoutUser,
        toggleFavorite,
        addSavedGeneration,
        searchQuery,
        setSearchQuery,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

