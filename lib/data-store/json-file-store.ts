import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AppDatabase, Board, Decision, Template } from "@/lib/types";
import { seedData } from "@/lib/data-store/seed-data";
import type { DataStore } from "@/lib/data-store/types";

type PersistedCollections = Pick<
  AppDatabase,
  "boards" | "decisions" | "templates" | "users" | "config"
>;

const dataDir = path.join(process.cwd(), "data");
const filePaths: Record<keyof PersistedCollections, string> = {
  boards: path.join(dataDir, "boards.json"),
  decisions: path.join(dataDir, "decisions.json"),
  templates: path.join(dataDir, "templates.json"),
  users: path.join(dataDir, "users.json"),
  config: path.join(dataDir, "config.json"),
};

let writeChain: Promise<void> = Promise.resolve();

function withWriteLock<T>(task: () => Promise<T>): Promise<T> {
  const operation = writeChain.then(task, task);
  writeChain = operation.then(
    () => undefined,
    () => undefined
  );
  return operation;
}

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
}

async function ensureCollectionFile<K extends keyof PersistedCollections>(key: K) {
  const filePath = filePaths[key];
  try {
    await readFile(filePath, "utf8");
  } catch {
    await ensureDataDir();
    const content = JSON.stringify(seedData[key], null, 2);
    await writeFile(filePath, content, "utf8");
  }
}

async function readCollection<K extends keyof PersistedCollections>(
  key: K
): Promise<PersistedCollections[K]> {
  await ensureCollectionFile(key);
  const raw = await readFile(filePaths[key], "utf8");
  return JSON.parse(raw) as PersistedCollections[K];
}

async function writeCollection<K extends keyof PersistedCollections>(
  key: K,
  value: PersistedCollections[K]
) {
  await ensureDataDir();
  await writeFile(filePaths[key], JSON.stringify(value, null, 2), "utf8");
}

class JsonFileDataStore implements DataStore {
  async getState(): Promise<AppDatabase> {
    const [boards, decisions, templates, users, config] = await Promise.all([
      readCollection("boards"),
      readCollection("decisions"),
      readCollection("templates"),
      readCollection("users"),
      readCollection("config"),
    ]);

    return { boards, decisions, templates, users, config };
  }

  async addBoard(board: Board): Promise<Board> {
    return withWriteLock(async () => {
      const boards = await readCollection("boards");
      boards.push(board);
      await writeCollection("boards", boards);
      return board;
    });
  }

  async updateBoard(id: string, updates: Partial<Board>): Promise<Board | null> {
    return withWriteLock(async () => {
      const boards = await readCollection("boards");
      const boardIndex = boards.findIndex((board) => board.id === id);

      if (boardIndex === -1) return null;

      const current = boards[boardIndex];
      const updatedBoard: Board = {
        ...current,
        ...updates,
        id: current.id,
        updatedAt: new Date().toISOString(),
      };

      boards[boardIndex] = updatedBoard;
      await writeCollection("boards", boards);
      return updatedBoard;
    });
  }

  async deleteBoard(id: string): Promise<boolean> {
    return withWriteLock(async () => {
      const boards = await readCollection("boards");
      const filtered = boards.filter((board) => board.id !== id);
      if (filtered.length === boards.length) return false;
      await writeCollection("boards", filtered);
      return true;
    });
  }

  async addDecision(decision: Decision): Promise<Decision> {
    return withWriteLock(async () => {
      const decisions = await readCollection("decisions");
      decisions.push(decision);
      await writeCollection("decisions", decisions);
      return decision;
    });
  }

  async updateDecision(
    id: string,
    updates: Partial<Decision>
  ): Promise<Decision | null> {
    return withWriteLock(async () => {
      const decisions = await readCollection("decisions");
      const decisionIndex = decisions.findIndex((decision) => decision.id === id);

      if (decisionIndex === -1) return null;

      const current = decisions[decisionIndex];
      const updatedDecision: Decision = {
        ...current,
        ...updates,
        id: current.id,
        updatedAt: new Date().toISOString(),
      };

      decisions[decisionIndex] = updatedDecision;
      await writeCollection("decisions", decisions);
      return updatedDecision;
    });
  }

  async deleteDecision(id: string): Promise<boolean> {
    return withWriteLock(async () => {
      const decisions = await readCollection("decisions");
      const filtered = decisions.filter((decision) => decision.id !== id);
      if (filtered.length === decisions.length) return false;
      await writeCollection("decisions", filtered);
      return true;
    });
  }

  async addTemplate(template: Template): Promise<Template> {
    return withWriteLock(async () => {
      const templates = await readCollection("templates");
      templates.push(template);
      await writeCollection("templates", templates);
      return template;
    });
  }

  async updateTemplate(
    id: string,
    updates: Partial<Template>
  ): Promise<Template | null> {
    return withWriteLock(async () => {
      const templates = await readCollection("templates");
      const templateIndex = templates.findIndex((template) => template.id === id);

      if (templateIndex === -1) return null;

      const current = templates[templateIndex];
      const updatedTemplate: Template = {
        ...current,
        ...updates,
        id: current.id,
      };

      templates[templateIndex] = updatedTemplate;
      await writeCollection("templates", templates);
      return updatedTemplate;
    });
  }
}

export const dataStore: DataStore = new JsonFileDataStore();
