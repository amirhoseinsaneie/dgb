import type { Decision, Board } from "./types";

export interface QualityCheck {
  id: string;
  label: string;
  passed: boolean;
  required: boolean;
}

export function checkDecisionQuality(
  decision: Decision,
  board: Board
): { checks: QualityCheck[]; score: number } {
  const checks: QualityCheck[] = [];
  const qualityGates = board.qualityGates.filter((g) => g.enabled);

  const ownerRequired = qualityGates.some((g) =>
    g.label.toLowerCase().includes("owner")
  );
  const ownerPassed = !!decision.ownerId;
  if (ownerRequired) {
    checks.push({
      id: "owner",
      label: "Owner",
      passed: ownerPassed,
      required: true,
    });
  }

  const criteriaRequired = qualityGates.some((g) =>
    g.label.toLowerCase().includes("criteria")
  );
  const criteriaPassed =
    decision.criteria && decision.criteria.length > 0;
  if (criteriaRequired) {
    checks.push({
      id: "criteria",
      label: "Criteria",
      passed: criteriaPassed,
      required: true,
    });
  }

  const dueRequired = qualityGates.some((g) =>
    g.label.toLowerCase().includes("due")
  );
  const duePassed = !!decision.dueDate;
  if (dueRequired) {
    checks.push({
      id: "due",
      label: "Due date",
      passed: duePassed,
      required: true,
    });
  }

  const optionsRequired =
    decision.reversible === false
      ? qualityGates.some((g) =>
          g.label.toLowerCase().includes("irreversible")
        )
      : false;
  const optionsPassed =
    decision.options && decision.options.length >= 2;
  const evidenceRequired = decision.reversible === false && optionsRequired;
  const evidencePassed =
    !!decision.keyRisksMitigations &&
    !!decision.evidenceLinks &&
    decision.evidenceLinks.length > 0;

  if (optionsRequired) {
    checks.push({
      id: "options",
      label: "Options (2+)",
      passed: optionsPassed,
      required: true,
    });
    checks.push({
      id: "evidence",
      label: "Evidence & Risks",
      passed: evidencePassed,
      required: true,
    });
  }

  const approversRequired =
    decision.impact === "High" &&
    qualityGates.some((g) =>
      g.label.toLowerCase().includes("high impact")
    );
  const approversPassed =
    !!decision.approverIds && decision.approverIds.length > 0;
  if (approversRequired) {
    checks.push({
      id: "approvers",
      label: "Approvers",
      passed: approversPassed,
      required: true,
    });
  }

  const validationRequired =
    decision.confidence < 60 &&
    qualityGates.some((g) =>
      g.label.toLowerCase().includes("confidence")
    );
  if (validationRequired) {
    checks.push({
      id: "validation",
      label: "Validation plan",
      passed: false,
      required: true,
    });
  }

  const total = checks.length;
  const passed = checks.filter((c) => c.passed).length;
  const score = total > 0 ? Math.round((passed / total) * 100) : 0;

  return { checks, score };
}

export function canMoveToReview(
  decision: Decision,
  board: Board
): { allowed: boolean; missing: string[] } {
  const { checks } = checkDecisionQuality(decision, board);
  const requiredFailed = checks.filter((c) => c.required && !c.passed);
  return {
    allowed: requiredFailed.length === 0,
    missing: requiredFailed.map((c) => c.label),
  };
}
