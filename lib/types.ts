export type DecisionCategory =
  | "Product"
  | "Technical"
  | "Resource"
  | "Process"
  | string;

export type Impact = "Low" | "Medium" | "High";
export type Urgency = "Low" | "Medium" | "High";
export type Method = "Scrum" | "Kanban" | "Hybrid";

export type DecisionStatus =
  | "Draft"
  | "Ready for Review"
  | "Review"
  | "Approved"
  | "Implementing"
  | "Done"
  | "Reversed";

export interface QualityGate {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  method?: Method;
  project?: string;
  categories: DecisionCategory[];
  qualityGates: QualityGate[];
  highImpactLevel?: Impact;
  confidenceThreshold?: number;
  columns: string[];
  createdAt: string;
  updatedAt: string;
  status: "Active" | "Archived";
}

export interface Criterion {
  id: string;
  name: string;
  weight: number;
  notes?: string;
}

export interface Option {
  id: string;
  title: string;
  pros: string;
  cons: string;
  risk?: string;
  costTimeEstimate?: string;
}

export interface Decision {
  id: string;
  boardId: string;
  title: string;
  problemStatement: string;
  category: DecisionCategory;
  impact: Impact;
  urgency?: Urgency;
  relatedUncertainty?: string;
  ownerId?: string;
  ownerName?: string;
  contributorIds?: string[];
  approverIds?: string[];
  stakeholdersNotes?: string;
  criteria: Criterion[];
  options: Option[];
  confidence: number;
  validationPlan?: string;
  reversible: boolean;
  keyRisksMitigations?: string;
  evidenceLinks?: string[];
  rollbackExplanation?: string;
  dueDate?: string;
  reviewMeetingDate?: string;
  status: DecisionStatus;
  chosenOptionId?: string;
  finalRationale?: string;
  implementationNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface Template {
  id: string;
  name: string;
  criteria: { name: string; weight: number }[];
  requiredFields: string[];
}

export interface Approval {
  id: string;
  decisionId: string;
  approverId: string;
  approverName: string;
  status: "Approved" | "Pending" | "Rejected";
  comment?: string;
  date?: string;
}

export interface Comment {
  id: string;
  decisionId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  parentId?: string;
}
