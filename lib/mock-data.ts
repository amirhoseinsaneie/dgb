import type { Board, Decision, Template, User } from "./types";

export const users: User[] = [
  { id: "1", name: "امیرحسین" },
  { id: "2", name: "سارا احمدی" },
  { id: "3", name: "علی محمدی" },
  { id: "4", name: "رضا کریمی" },
];

export const defaultColumns = ["Draft", "Ready for Review", "Review", "Approved", "Implementing", "Done"];
export const defaultColumnLabels: Record<string, string> = {
  "Draft": "پیش‌نویس",
  "Ready for Review": "آماده بررسی",
  "Review": "در حال بررسی",
  "Approved": "تایید شده",
  "Implementing": "در حال پیاده‌سازی",
  "Done": "انجام شده",
  "Reversed": "برگشت خورده"
};

export const defaultQualityGates = [
  { id: "1", label: "دارای مالک" },
  { id: "2", label: "دارای معیار" },
  { id: "3", label: "دارای تاریخ سررسید" },
  { id: "4", label: "شواهد برای موارد غیرقابل بازگشت" },
  { id: "5", label: "تایید‌کنندگان برای تاثیر بالا" },
];

export const defaultCategories = [
  "Architecture",
  "Security",
  "Product",
  "Process",
  "Team",
];
export const defaultCategoryLabels: Record<string, string> = {
  "Architecture": "معماری",
  "Security": "امنیت",
  "Product": "محصول",
  "Process": "فرآیند",
  "Team": "تیم",
};

export const templates: Template[] = [
  {
    id: "t1",
    name: "قالب استاندارد",
    criteria: [
      { name: "هزینه پیاده‌سازی", weight: 3 },
      { name: "تاثیر بر کاربر", weight: 5 },
      { name: "پیچیدگی فنی", weight: 4 },
    ],
    requiredFields: ["owner", "due", "criteria", "options"],
  },
];

export const boards: Board[] = [
  {
    id: "1",
    name: "پروژه X",
    project: "پلتفرم اصلی",
    status: "Active",
    columns: defaultColumns,
    qualityGates: defaultQualityGates,
    categories: defaultCategories,
    roles: ["Owner", "Contributor", "Approver"],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-02-20T10:00:00Z",
  },
  {
    id: "2",
    name: "تیم پلتفرم",
    status: "Active",
    columns: defaultColumns,
    qualityGates: defaultQualityGates,
    categories: defaultCategories,
    roles: ["Lead", "Reviewer"],
    createdAt: "2024-01-15T00:00:00Z",
    updatedAt: "2024-02-18T15:30:00Z",
  },
];

export const decisions: Decision[] = [
  {
    id: "d1",
    boardId: "1",
    title: "انتخاب پایگاه داده برای سرویس اعلان",
    problemStatement: "ما نیاز داریم برای مقیاس‌پذیری بالا یک پایگاه داده مناسب انتخاب کنیم...",
    status: "Review",
    category: "Architecture",
    impact: "High",
    ownerId: "1",
    ownerName: "امیرحسین",
    contributorIds: ["2"],
    approverIds: ["3", "4"],
    dueDate: "2024-03-01",
    criteria: [
      { id: "c1", name: "مقیاس‌پذیری", weight: 5, notes: "باید میلیون‌ها رکورد در روز را پشتیبانی کند" },
      { id: "c2", name: "هزینه", weight: 3 },
    ],
    options: [
      { id: "o1", title: "PostgreSQL", pros: "قابلیت اطمینان بالا", cons: "هزینه نگهداشت", risk: "Medium" },
      { id: "o2", title: "MongoDB", pros: "انعطاف‌پذیری", cons: "سازگاری نهایی", risk: "Low" },
    ],
    confidence: 80,
    reversible: true,
    createdAt: "2024-02-10T09:00:00Z",
    updatedAt: "2024-02-22T11:00:00Z",
  },
];
