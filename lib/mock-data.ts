import type { Board, Decision, Template, User } from "./types";

export const users: User[] = [
  { id: "1", name: "Amir", email: "amir@example.com" },
  { id: "2", name: "Sara", email: "sara@example.com" },
  { id: "3", name: "Reza", email: "reza@example.com" },
];

export const defaultColumns = [
  "Draft",
  "Ready for Review",
  "Review",
  "Approved",
  "Implementing",
  "Done",
  "Reversed",
];

export const defaultQualityGates = [
  {
    id: "1",
    label: "Owner required before Review",
    description: "Owner required before moving to Review",
    enabled: true,
  },
  {
    id: "2",
    label: "Criteria required before Review",
    description: "Criteria required before Review",
    enabled: true,
  },
  {
    id: "3",
    label: "Due date required before Review",
    description: "Due date required before Review",
    enabled: true,
  },
  {
    id: "4",
    label: "Irreversible requires Options + Risks + Evidence",
    description: "If Irreversible => must include Options + Risks + Evidence",
    enabled: true,
  },
  {
    id: "5",
    label: "High impact requires Approvers",
    description: "If High impact => must include Approvers list",
    enabled: true,
  },
  {
    id: "6",
    label: "Low confidence requires Validation plan",
    description: "If Confidence < 60% => add Experiment/Validation plan",
    enabled: true,
  },
];

export const defaultCategories = [
  "Product / Scope",
  "Technical / Architecture",
  "Resource / Capacity",
  "Process / Ways of working",
];

export const boards: Board[] = [
  {
    id: "1",
    name: "Project X",
    description: "Main product decision board",
    method: "Scrum",
    project: "Project X",
    categories: defaultCategories,
    qualityGates: defaultQualityGates,
    highImpactLevel: "High",
    confidenceThreshold: 60,
    columns: defaultColumns,
    createdAt: "2026-02-01T00:00:00Z",
    updatedAt: "2026-02-18T00:00:00Z",
    status: "Active",
  },
  {
    id: "2",
    name: "Platform Team",
    description: "Technical architecture decisions",
    method: "Kanban",
    project: "Platform",
    categories: defaultCategories,
    qualityGates: defaultQualityGates,
    highImpactLevel: "High",
    confidenceThreshold: 60,
    columns: defaultColumns,
    createdAt: "2026-02-05T00:00:00Z",
    updatedAt: "2026-02-17T00:00:00Z",
    status: "Active",
  },
];

export const decisions: Decision[] = [
  {
    id: "1",
    boardId: "1",
    title: "Choose DB migration plan",
    problemStatement: "We need to migrate from legacy DB to new schema.",
    category: "Technical / Architecture",
    impact: "High",
    urgency: "Medium",
    ownerId: "1",
    ownerName: "Amir",
    approverIds: ["2", "3"],
    status: "Review",
    criteria: [
      { id: "c1", name: "Value", weight: 4, notes: "Business value" },
      { id: "c2", name: "Time", weight: 5 },
      { id: "c3", name: "Risk", weight: 4 },
    ],
    options: [
      {
        id: "o1",
        title: "Big bang migration",
        pros: "Fast",
        cons: "Risky",
        risk: "High downtime",
        costTimeEstimate: "2 weeks, high outage risk",
      },
      {
        id: "o2",
        title: "Incremental migration",
        pros: "Lower risk",
        cons: "Longer",
        risk: "Medium",
        costTimeEstimate: "6 weeks, phased migration",
      },
    ],
    confidence: 70,
    reversible: false,
    dueDate: "2026-03-05",
    createdAt: "2026-02-10T00:00:00Z",
    updatedAt: "2026-02-18T00:00:00Z",
  },
  {
    id: "2",
    boardId: "1",
    title: "API versioning strategy",
    problemStatement: "How should we handle API versioning?",
    category: "Technical / Architecture",
    impact: "Medium",
    ownerId: "2",
    ownerName: "Sara",
    status: "Draft",
    criteria: [{ id: "c1", name: "Maintainability", weight: 5 }],
    options: [],
    confidence: 50,
    reversible: true,
    validationPlan: "",
    dueDate: "2026-03-05",
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "3",
    boardId: "1",
    title: "Feature prioritization Q1",
    problemStatement: "Which features to prioritize for Q1?",
    category: "Product / Scope",
    impact: "High",
    ownerId: "1",
    ownerName: "Amir",
    status: "Ready for Review",
    criteria: [
      { id: "c1", name: "Value", weight: 5 },
      { id: "c2", name: "Effort", weight: 3 },
    ],
    options: [
      {
        id: "o1",
        title: "Option A",
        pros: "High value",
        cons: "High effort",
      },
    ],
    confidence: 65,
    reversible: true,
    dueDate: "2026-02-21",
    createdAt: "2026-02-12T00:00:00Z",
    updatedAt: "2026-02-18T00:00:00Z",
  },
  {
    id: "4",
    boardId: "1",
    title: "Team capacity allocation",
    problemStatement: "How to allocate team capacity across projects?",
    category: "Resource / Capacity",
    impact: "High",
    status: "Draft",
    criteria: [],
    options: [],
    confidence: 0,
    validationPlan: "",
    reversible: true,
    dueDate: "2026-03-01",
    createdAt: "2026-02-10T00:00:00Z",
    updatedAt: "2026-02-10T00:00:00Z",
  },
];

export const templates: Template[] = [
  {
    id: "1",
    name: "Value vs Time vs Risk",
    criteria: [
      { name: "Value", weight: 4 },
      { name: "Time-to-delivery", weight: 5 },
      { name: "Risk", weight: 4 },
      { name: "Cost", weight: 2 },
    ],
    requiredFields: ["owner", "criteria", "due", "options"],
  },
  {
    id: "2",
    name: "Architecture decision (ADR-lite)",
    criteria: [
      { name: "Technical feasibility", weight: 5 },
      { name: "Maintainability", weight: 5 },
      { name: "Performance", weight: 4 },
    ],
    requiredFields: ["owner", "criteria", "due", "options", "evidence"],
  },
];
