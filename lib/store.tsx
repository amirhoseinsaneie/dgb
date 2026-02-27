"use client";

import boardsSnapshot from "@/data/boards.json";
import configSnapshot from "@/data/config.json";
import decisionsSnapshot from "@/data/decisions.json";
import templatesSnapshot from "@/data/templates.json";
import usersSnapshot from "@/data/users.json";
import {
  createContext,
  useCallback,
  useEffect,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppDatabase, Board, Decision, Template } from "./types";

type AppState = AppDatabase;

interface AppContextValue extends AppState {
  isLoading: boolean;
  refresh: () => Promise<void>;
  getBoard: (id: string) => Board | undefined;
  getBoardDecisions: (boardId: string) => Decision[];
  getDecision: (id: string) => Decision | undefined;
  addBoard: (board: Board) => Promise<void>;
  updateBoard: (id: string, updates: Partial<Board>) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
  addDecision: (decision: Decision) => Promise<void>;
  updateDecision: (id: string, updates: Partial<Decision>) => Promise<void>;
  deleteDecision: (id: string) => Promise<void>;
  addTemplate: (template: Template) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<Template>) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const seedState: AppState = {
  boards: boardsSnapshot as AppState["boards"],
  decisions: decisionsSnapshot as AppState["decisions"],
  templates: templatesSnapshot as AppState["templates"],
  users: usersSnapshot as AppState["users"],
  config: configSnapshot as AppState["config"],
};

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(seedState);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const nextState = await apiRequest<AppState>("/api/db");
    setState(nextState);
  }, []);

  const refreshSafely = useCallback(async () => {
    try {
      await refresh();
    } catch (error) {
      console.error("Failed to refresh datastore from /api/db:", error);
    }
  }, [refresh]);

  useEffect(() => {
    const run = async () => {
      try {
        await refresh();
      } catch (error) {
        console.error("Failed to load datastore from /api/db:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, [refresh]);

  const getBoard = useCallback(
    (id: string) => state.boards.find((b) => b.id === id),
    [state.boards]
  );

  const getBoardDecisions = useCallback(
    (boardId: string) =>
      state.decisions.filter((d) => d.boardId === boardId),
    [state.decisions]
  );

  const getDecision = useCallback(
    (id: string) => state.decisions.find((d) => d.id === id),
    [state.decisions]
  );

  const addBoard = useCallback(
    async (board: Board) => {
      setState((s) => ({ ...s, boards: [...s.boards, board] }));
      try {
        await apiRequest<Board>("/api/db/boards", {
          method: "POST",
          body: JSON.stringify(board),
        });
      } catch (error) {
        console.error("Failed to persist board:", error);
        void refreshSafely();
      }
    },
    [refreshSafely]
  );

  const updateBoard = useCallback(
    async (id: string, updates: Partial<Board>) => {
      setState((s) => ({
        ...s,
        boards: s.boards.map((b) =>
          b.id === id
            ? { ...b, ...updates, updatedAt: new Date().toISOString() }
            : b
        ),
      }));
      try {
        await apiRequest<Board>(`/api/db/boards/${id}`, {
          method: "PATCH",
          body: JSON.stringify(updates),
        });
      } catch (error) {
        console.error("Failed to persist board update:", error);
        void refreshSafely();
      }
    },
    [refreshSafely]
  );

  const deleteBoard = useCallback(
    async (id: string) => {
      setState((s) => ({
        ...s,
        boards: s.boards.filter((b) => b.id !== id),
        decisions: s.decisions.filter((d) => d.boardId !== id),
      }));
      try {
        await apiRequest(`/api/db/boards/${id}`, { method: "DELETE" });
      } catch (error) {
        console.error("Failed to delete board:", error);
        void refreshSafely();
      }
    },
    [refreshSafely]
  );

  const addDecision = useCallback(
    async (decision: Decision) => {
      setState((s) => ({ ...s, decisions: [...s.decisions, decision] }));
      try {
        await apiRequest<Decision>("/api/db/decisions", {
          method: "POST",
          body: JSON.stringify(decision),
        });
      } catch (error) {
        console.error("Failed to persist decision:", error);
        void refreshSafely();
      }
    },
    [refreshSafely]
  );

  const updateDecision = useCallback(
    async (id: string, updates: Partial<Decision>) => {
      setState((s) => ({
        ...s,
        decisions: s.decisions.map((d) =>
          d.id === id
            ? { ...d, ...updates, updatedAt: new Date().toISOString() }
            : d
        ),
      }));
      try {
        await apiRequest<Decision>(`/api/db/decisions/${id}`, {
          method: "PATCH",
          body: JSON.stringify(updates),
        });
      } catch (error) {
        console.error("Failed to persist decision update:", error);
        void refreshSafely();
      }
    },
    [refreshSafely]
  );

  const deleteDecision = useCallback(
    async (id: string) => {
      setState((s) => ({
        ...s,
        decisions: s.decisions.filter((d) => d.id !== id),
      }));
      try {
        await apiRequest(`/api/db/decisions/${id}`, { method: "DELETE" });
      } catch (error) {
        console.error("Failed to delete decision:", error);
        void refreshSafely();
      }
    },
    [refreshSafely]
  );

  const addTemplate = useCallback(
    async (template: Template) => {
      setState((s) => ({ ...s, templates: [...s.templates, template] }));
      try {
        await apiRequest<Template>("/api/db/templates", {
          method: "POST",
          body: JSON.stringify(template),
        });
      } catch (error) {
        console.error("Failed to persist template:", error);
        void refreshSafely();
      }
    },
    [refreshSafely]
  );

  const updateTemplate = useCallback(
    async (id: string, updates: Partial<Template>) => {
      setState((s) => ({
        ...s,
        templates: s.templates.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      }));
      try {
        await apiRequest<Template>(`/api/db/templates/${id}`, {
          method: "PATCH",
          body: JSON.stringify(updates),
        });
      } catch (error) {
        console.error("Failed to persist template update:", error);
        void refreshSafely();
      }
    },
    [refreshSafely]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      isLoading,
      refresh,
      getBoard,
      getBoardDecisions,
      getDecision,
      addBoard,
      updateBoard,
      deleteBoard,
      addDecision,
      updateDecision,
      deleteDecision,
      addTemplate,
      updateTemplate,
    }),
    [
      state,
      isLoading,
      refresh,
      getBoard,
      getBoardDecisions,
      getDecision,
      addBoard,
      updateBoard,
      deleteBoard,
      addDecision,
      updateDecision,
      deleteDecision,
      addTemplate,
      updateTemplate,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
