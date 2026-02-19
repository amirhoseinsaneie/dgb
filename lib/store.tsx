"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Board, Decision, Template } from "./types";
import {
  boards as initialBoards,
  decisions as initialDecisions,
  templates as initialTemplates,
} from "./mock-data";

interface AppState {
  boards: Board[];
  decisions: Decision[];
  templates: Template[];
}

interface AppContextValue extends AppState {
  getBoard: (id: string) => Board | undefined;
  getBoardDecisions: (boardId: string) => Decision[];
  getDecision: (id: string) => Decision | undefined;
  addBoard: (board: Board) => void;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  addDecision: (decision: Decision) => void;
  updateDecision: (id: string, updates: Partial<Decision>) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    boards: initialBoards,
    decisions: initialDecisions,
    templates: initialTemplates,
  });

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

  const addBoard = useCallback((board: Board) => {
    setState((s) => ({ ...s, boards: [...s.boards, board] }));
  }, []);

  const updateBoard = useCallback((id: string, updates: Partial<Board>) => {
    setState((s) => ({
      ...s,
      boards: s.boards.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
      ),
    }));
  }, []);

  const addDecision = useCallback((decision: Decision) => {
    setState((s) => ({ ...s, decisions: [...s.decisions, decision] }));
  }, []);

  const updateDecision = useCallback((id: string, updates: Partial<Decision>) => {
    setState((s) => ({
      ...s,
      decisions: s.decisions.map((d) =>
        d.id === id
          ? { ...d, ...updates, updatedAt: new Date().toISOString() }
          : d
      ),
    }));
  }, []);

  const addTemplate = useCallback((template: Template) => {
    setState((s) => ({ ...s, templates: [...s.templates, template] }));
  }, []);

  const updateTemplate = useCallback((id: string, updates: Partial<Template>) => {
    setState((s) => ({
      ...s,
      templates: s.templates.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      getBoard,
      getBoardDecisions,
      getDecision,
      addBoard,
      updateBoard,
      addDecision,
      updateDecision,
      addTemplate,
      updateTemplate,
    }),
    [
      state,
      getBoard,
      getBoardDecisions,
      getDecision,
      addBoard,
      updateBoard,
      addDecision,
      updateDecision,
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
