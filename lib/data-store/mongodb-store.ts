import "server-only";

import { getDb } from "@/lib/mongodb";
import type { AppDatabase, Board, Decision, Template, User } from "@/lib/types";
import { seedData } from "@/lib/data-store/seed-data";
import type { DataStore } from "@/lib/data-store/types";

async function ensureSeeded() {
  const db = await getDb();
  const boardsCount = await db.collection("boards").countDocuments();
  if (boardsCount > 0) return;

  const configCount = await db.collection("config").countDocuments();
  if (configCount === 0 && seedData.config) {
    await db
      .collection("config")
      .insertOne({ _configId: "app", ...seedData.config });
  }
  if (seedData.boards.length > 0) {
    await db.collection("boards").insertMany(seedData.boards as never[]);
  }
  if (seedData.decisions.length > 0) {
    await db.collection("decisions").insertMany(seedData.decisions as never[]);
  }
  if (seedData.templates.length > 0) {
    await db.collection("templates").insertMany(seedData.templates as never[]);
  }
}

function stripMongo<T>(doc: Record<string, unknown> | null): T | null {
  if (!doc) return null;
  const { _id, _configId, ...rest } = doc;
  void _id;
  void _configId;
  return rest as T;
}

class MongoDataStore implements DataStore {
  async getState(): Promise<AppDatabase> {
    await ensureSeeded();
    const db = await getDb();

    const [boards, decisions, templates, users, configDoc] = await Promise.all([
      db.collection("boards").find().toArray(),
      db.collection("decisions").find().toArray(),
      db.collection("templates").find().toArray(),
      db
        .collection("users")
        .find()
        .project({ passwordHash: 0 })
        .toArray(),
      db.collection("config").findOne({ _configId: "app" }),
    ]);

    return {
      boards: boards.map((d) => stripMongo<Board>(d as never)!),
      decisions: decisions.map((d) => stripMongo<Decision>(d as never)!),
      templates: templates.map((d) => stripMongo<Template>(d as never)!),
      users: users.map((d) => stripMongo<User>(d as never)!),
      config: configDoc
        ? stripMongo(configDoc as never)!
        : seedData.config,
    };
  }

  async addBoard(board: Board): Promise<Board> {
    const db = await getDb();
    await db.collection("boards").insertOne({ ...board } as never);
    return board;
  }

  async updateBoard(
    id: string,
    updates: Partial<Board>
  ): Promise<Board | null> {
    const db = await getDb();
    const result = await db.collection("boards").findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: new Date().toISOString() } },
      { returnDocument: "after" }
    );
    return result ? stripMongo<Board>(result as never) : null;
  }

  async deleteBoard(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.collection("boards").deleteOne({ id });
    if (result.deletedCount > 0) {
      await db.collection("decisions").deleteMany({ boardId: id });
      return true;
    }
    return false;
  }

  async addDecision(decision: Decision): Promise<Decision> {
    const db = await getDb();
    await db.collection("decisions").insertOne({ ...decision } as never);
    return decision;
  }

  async updateDecision(
    id: string,
    updates: Partial<Decision>
  ): Promise<Decision | null> {
    const db = await getDb();
    const result = await db.collection("decisions").findOneAndUpdate(
      { id },
      { $set: { ...updates, updatedAt: new Date().toISOString() } },
      { returnDocument: "after" }
    );
    return result ? stripMongo<Decision>(result as never) : null;
  }

  async deleteDecision(id: string): Promise<boolean> {
    const db = await getDb();
    const result = await db.collection("decisions").deleteOne({ id });
    return result.deletedCount > 0;
  }

  async addTemplate(template: Template): Promise<Template> {
    const db = await getDb();
    await db.collection("templates").insertOne({ ...template } as never);
    return template;
  }

  async updateTemplate(
    id: string,
    updates: Partial<Template>
  ): Promise<Template | null> {
    const db = await getDb();
    const result = await db.collection("templates").findOneAndUpdate(
      { id },
      { $set: { ...updates } },
      { returnDocument: "after" }
    );
    return result ? stripMongo<Template>(result as never) : null;
  }
}

export const dataStore: DataStore = new MongoDataStore();
