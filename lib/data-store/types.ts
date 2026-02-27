import type { AppDatabase, Board, Decision, Template } from "@/lib/types";

export interface DataStore {
  getState: () => Promise<AppDatabase>;
  addBoard: (board: Board) => Promise<Board>;
  updateBoard: (id: string, updates: Partial<Board>) => Promise<Board | null>;
  addDecision: (decision: Decision) => Promise<Decision>;
  updateDecision: (
    id: string,
    updates: Partial<Decision>
  ) => Promise<Decision | null>;
  addTemplate: (template: Template) => Promise<Template>;
  updateTemplate: (
    id: string,
    updates: Partial<Template>
  ) => Promise<Template | null>;
}
