import type { Decision, Board } from "./types";

export interface QualityCheck {
  id: string;
  label: string;
  passed: boolean;
}

export interface QualityResult {
  score: number;
  checks: QualityCheck[];
}

export function checkDecisionQuality(decision: Decision, board: Board): QualityResult {
  const checks: QualityCheck[] = [];

  // 1. Owner
  checks.push({
    id: "owner",
    label: "دارای مالک",
    passed: !!decision.ownerId,
  });

  // 2. Criteria
  checks.push({
    id: "criteria",
    label: "دارای معیار",
    passed: decision.criteria && decision.criteria.length > 0,
  });

  // 3. Due Date
  checks.push({
    id: "due",
    label: "دارای تاریخ سررسید",
    passed: !!decision.dueDate,
  });

  // 4. Irreversible Evidence
  if (!decision.reversible) {
    checks.push({
      id: "evidence",
      label: "شواهد برای موارد غیرقابل بازگشت",
      passed: !!(decision.keyRisksMitigations && decision.evidenceLinks?.length),
    });
  } else {
    checks.push({
      id: "evidence",
      label: "شواهد (اختیاری برای قابل بازگشت)",
      passed: true,
    });
  }

  // 5. High Impact Approvers
  if (decision.impact === "High") {
    checks.push({
      id: "approvers",
      label: "تایید‌کنندگان برای تاثیر بالا",
      passed: !!(decision.approverIds && decision.approverIds.length > 0),
    });
  } else {
    checks.push({
      id: "approvers",
      label: "تایید‌کنندگان (اختیاری)",
      passed: true,
    });
  }

  // 6. Confidence Validation
  if (decision.confidence < 60) {
    checks.push({
      id: "validation",
      label: "طرح اعتبارسنجی برای اطمینان پایین",
      passed: !!decision.validationPlan?.trim(),
    });
  }

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return { score, checks };
}

export function canMoveToReview(decision: Decision, board: Board): { can: boolean; reason?: string } {
  const quality = checkDecisionQuality(decision, board);
  
  if (quality.score < 80) {
    return {
      can: false,
      reason: "امتیاز کیفیت باید حداقل ۸۰ باشد تا به مرحله بررسی برود.",
    };
  }

  if (!decision.ownerId) {
    return { can: false, reason: "مالک الزامی است." };
  }

  return { can: true };
}
