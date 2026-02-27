import boards from "@/data/boards.json";
import config from "@/data/config.json";
import decisions from "@/data/decisions.json";
import templates from "@/data/templates.json";
import users from "@/data/users.json";
import type { AppDatabase } from "@/lib/types";

export const seedData: AppDatabase = {
  boards: boards as AppDatabase["boards"],
  decisions: decisions as AppDatabase["decisions"],
  templates: templates as AppDatabase["templates"],
  users: users as AppDatabase["users"],
  config: config as AppDatabase["config"],
};
