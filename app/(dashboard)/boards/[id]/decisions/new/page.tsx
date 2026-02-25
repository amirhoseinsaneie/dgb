"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Check, Plus, Trash2, X } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { users } from "@/lib/mock-data";
import { checkDecisionQuality } from "@/lib/quality-gates";
import { useApp } from "@/lib/store";
import type { Criterion, Decision, Option } from "@/lib/types";

const relatedUncertaintyOptions = [
  { value: "Requirement uncertainty", label: "Req" },
  { value: "Resource uncertainty", label: "Res" },
  { value: "Task uncertainty", label: "Task" },
  { value: "None", label: "None" },
];

function parseCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function CreateDecisionPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;
  const { addDecision, getBoard, templates } = useApp();
  const board = getBoard(boardId);

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [category, setCategory] = useState("");
  const [impact, setImpact] = useState<Decision["impact"]>("Medium");
  const [urgency, setUrgency] = useState<Decision["urgency"]>("Medium");
  const [relatedUncertainty, setRelatedUncertainty] = useState<string>("None");

  const [ownerId, setOwnerId] = useState("");
  const [contributorIds, setContributorIds] = useState<string[]>([]);
  const [approverIds, setApproverIds] = useState<string[]>([]);
  const [stakeholdersNotes, setStakeholdersNotes] = useState("");

  const [templateId, setTemplateId] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [options, setOptions] = useState<Option[]>([]);

  const [confidence, setConfidence] = useState(70);
  const [reversible, setReversible] = useState(true);
  const [validationPlan, setValidationPlan] = useState("");
  const [keyRisksMitigations, setKeyRisksMitigations] = useState("");
  const [evidenceLinksInput, setEvidenceLinksInput] = useState("");
  const [rollbackExplanation, setRollbackExplanation] = useState("");

  const [dueDate, setDueDate] = useState("");
  const [reviewMeetingDate, setReviewMeetingDate] = useState("");
  const [desiredStatus, setDesiredStatus] = useState<"Draft" | "Ready for Review">("Draft");

  const ownerName = users.find((user) => user.id === ownerId)?.name;
  const evidenceLinks = useMemo(
    () => parseCommaSeparated(evidenceLinksInput),
    [evidenceLinksInput]
  );

  const draftDecision: Decision | null = board
    ? {
        id: "draft",
        boardId,
        title: title || "Untitled",
        problemStatement,
        category: category || board.categories[0] || "Product / Scope",
        impact,
        urgency,
        relatedUncertainty: relatedUncertainty === "None" ? undefined : relatedUncertainty,
        ownerId: ownerId || undefined,
        ownerName,
        contributorIds: contributorIds.length > 0 ? contributorIds : undefined,
        approverIds: approverIds.length > 0 ? approverIds : undefined,
        stakeholdersNotes: stakeholdersNotes || undefined,
        criteria,
        options,
        confidence,
        validationPlan: validationPlan || undefined,
        reversible,
        keyRisksMitigations: keyRisksMitigations || undefined,
        evidenceLinks: evidenceLinks.length > 0 ? evidenceLinks : undefined,
        rollbackExplanation: rollbackExplanation || undefined,
        dueDate: dueDate || undefined,
        reviewMeetingDate: reviewMeetingDate || undefined,
        status: desiredStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    : null;

  const quality = draftDecision && board
    ? checkDecisionQuality(draftDecision, board)
    : { checks: [], score: 0 };

  const toggleMember = (list: string[], id: string, setter: (next: string[]) => void) => {
    if (list.includes(id)) {
      setter(list.filter((current) => current !== id));
    } else {
      setter([...list, id]);
    }
  };

  const loadTemplate = (id: string) => {
    setTemplateId(id);
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    setCriteria(
      template.criteria.map((criterion) => ({
        id: crypto.randomUUID(),
        name: criterion.name,
        weight: criterion.weight,
        notes: "",
      }))
    );
  };

  const addCriterion = () => {
    setCriteria((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        name: "",
        weight: 3,
        notes: "",
      },
    ]);
  };

  const updateCriterion = (id: string, updates: Partial<Criterion>) => {
    setCriteria((previous) =>
      previous.map((criterion) =>
        criterion.id === id ? { ...criterion, ...updates } : criterion
      )
    );
  };

  const removeCriterion = (id: string) => {
    setCriteria((previous) => previous.filter((criterion) => criterion.id !== id));
  };

  const addOption = () => {
    setOptions((previous) => [
      ...previous,
      {
        id: crypto.randomUUID(),
        title: "",
        pros: "",
        cons: "",
        risk: "",
        costTimeEstimate: "",
      },
    ]);
  };

  const updateOption = (id: string, updates: Partial<Option>) => {
    setOptions((previous) =>
      previous.map((option) => (option.id === id ? { ...option, ...updates } : option))
    );
  };

  const removeOption = (id: string) => {
    setOptions((previous) => previous.filter((option) => option.id !== id));
  };

  const buildDecision = (status: Decision["status"]): Decision => ({
    id: crypto.randomUUID(),
    boardId,
    title,
    problemStatement,
    category: category || "Product / Scope",
    impact,
    urgency,
    relatedUncertainty: relatedUncertainty === "None" ? undefined : relatedUncertainty,
    ownerId: ownerId || undefined,
    ownerName,
    contributorIds: contributorIds.length > 0 ? contributorIds : undefined,
    approverIds: approverIds.length > 0 ? approverIds : undefined,
    stakeholdersNotes: stakeholdersNotes || undefined,
    criteria,
    options,
    confidence,
    validationPlan: validationPlan || undefined,
    reversible,
    keyRisksMitigations: keyRisksMitigations || undefined,
    evidenceLinks: evidenceLinks.length > 0 ? evidenceLinks : undefined,
    rollbackExplanation: rollbackExplanation || undefined,
    dueDate: dueDate || undefined,
    reviewMeetingDate: reviewMeetingDate || undefined,
    status,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const submit = (target: "draft" | "desired") => {
    const status: Decision["status"] = target === "draft" ? "Draft" : desiredStatus;
    const decision = buildDecision(status);
    addDecision(decision);
    router.push(`/boards/${boardId}/decisions/${decision.id}`);
  };

  if (!board) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  const highImpactNeedsApprovers = impact === "High" && approverIds.length === 0;
  const lowConfidenceNeedsValidation = confidence < 60;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form
        className="space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          submit("draft");
        }}
      >
        <PageHeader
          title="New Decision"
          subtitle="Register a decision with owner, criteria, options, and quality gates"
          breadcrumbs={[
            { label: "Boards", href: "/boards" },
            { label: board.name, href: `/boards/${boardId}` },
            { label: "Decisions", href: `/boards/${boardId}/decisions` },
            { label: "New", href: `/boards/${boardId}/decisions/new` },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="problem">Problem statement *</Label>
              <Textarea
                id="problem"
                value={problemStatement}
                onChange={(event) => setProblemStatement(event.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {board.categories.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Impact *</Label>
                <Select value={impact} onValueChange={(value) => setImpact(value as Decision["impact"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Urgency</Label>
                <Select value={urgency} onValueChange={(value) => setUrgency(value as Decision["urgency"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Related uncertainty</Label>
                <Select value={relatedUncertainty} onValueChange={setRelatedUncertainty}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {relatedUncertaintyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ownership & Stakeholders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Decision owner *</Label>
              <Select value={ownerId} onValueChange={setOwnerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contributors (optional)</Label>
              <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={contributorIds.includes(user.id)}
                      onCheckedChange={() =>
                        toggleMember(contributorIds, user.id, setContributorIds)
                      }
                    />
                    {user.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Approvers {impact === "High" ? "*" : "(optional)"}</Label>
              <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                {users.map((user) => (
                  <label key={user.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={approverIds.includes(user.id)}
                      onCheckedChange={() =>
                        toggleMember(approverIds, user.id, setApproverIds)
                      }
                    />
                    {user.name}
                  </label>
                ))}
              </div>
              {highImpactNeedsApprovers && (
                <p className="text-sm text-destructive">
                  Approvers required for High impact decisions.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Stakeholders / notes</Label>
              <Textarea
                rows={3}
                value={stakeholdersNotes}
                onChange={(event) => setStakeholdersNotes(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision Criteria *</CardTitle>
            <CardDescription>Use template or add custom criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Select value={templateId} onValueChange={loadTemplate}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" onClick={() => templateId && loadTemplate(templateId)}>
                Load
              </Button>
            </div>

            <div className="space-y-3">
              {criteria.map((criterion) => (
                <div key={criterion.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex gap-2">
                    <Input
                      value={criterion.name}
                      onChange={(event) =>
                        updateCriterion(criterion.id, { name: event.target.value })
                      }
                      placeholder="Criterion title"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCriterion(criterion.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-20 text-sm text-muted-foreground">Weight</span>
                    <Slider
                      className="flex-1"
                      min={1}
                      max={5}
                      value={[criterion.weight]}
                      onValueChange={([value]) =>
                        updateCriterion(criterion.id, { weight: value ?? 3 })
                      }
                    />
                    <span className="w-5 text-sm">{criterion.weight}</span>
                  </div>
                  <Input
                    value={criterion.notes || ""}
                    onChange={(event) =>
                      updateCriterion(criterion.id, { notes: event.target.value })
                    }
                    placeholder="Notes (optional)"
                  />
                </div>
              ))}
            </div>

            <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
              <Plus className="mr-2 size-4" />
              Add criterion
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Options & Trade-offs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {options.map((option, index) => (
              <div key={option.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={option.title}
                    onChange={(event) =>
                      updateOption(option.id, { title: event.target.value })
                    }
                    placeholder={`Option ${index + 1} title`}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(option.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={option.pros}
                    onChange={(event) => updateOption(option.id, { pros: event.target.value })}
                    placeholder="Pros"
                  />
                  <Input
                    value={option.cons}
                    onChange={(event) => updateOption(option.id, { cons: event.target.value })}
                    placeholder="Cons"
                  />
                </div>
                <Input
                  value={option.risk || ""}
                  onChange={(event) => updateOption(option.id, { risk: event.target.value })}
                  placeholder="Risk"
                />
                <Input
                  value={option.costTimeEstimate || ""}
                  onChange={(event) =>
                    updateOption(option.id, { costTimeEstimate: event.target.value })
                  }
                  placeholder="Cost/time estimate"
                />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              <Plus className="mr-2 size-4" />
              Add option
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confidence & Reversibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Confidence: {confidence}%</Label>
              <Slider
                min={0}
                max={100}
                value={[confidence]}
                onValueChange={([value]) => setConfidence(value ?? 70)}
              />
            </div>

            {lowConfidenceNeedsValidation && (
              <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  Confidence &lt; 60%: add Validation Plan (experiment, spike, prototype).
                </p>
                <Textarea
                  rows={3}
                  value={validationPlan}
                  onChange={(event) => setValidationPlan(event.target.value)}
                  placeholder="Describe validation plan"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Switch checked={reversible} onCheckedChange={setReversible} />
              <Label>Reversible?</Label>
            </div>

            {!reversible && (
              <>
                <div className="space-y-2">
                  <Label>Key risks & mitigations *</Label>
                  <Textarea
                    rows={3}
                    value={keyRisksMitigations}
                    onChange={(event) => setKeyRisksMitigations(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Evidence/References *</Label>
                  <Input
                    value={evidenceLinksInput}
                    onChange={(event) => setEvidenceLinksInput(event.target.value)}
                    placeholder="Comma-separated links"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rollback not possible explanation *</Label>
                  <Textarea
                    rows={3}
                    value={rollbackExplanation}
                    onChange={(event) => setRollbackExplanation(event.target.value)}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Due date *</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Review meeting date (optional)</Label>
              <Input
                type="date"
                value={reviewMeetingDate}
                onChange={(event) => setReviewMeetingDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Desired status after create</Label>
              <Select
                value={desiredStatus}
                onValueChange={(value) => setDesiredStatus(value as "Draft" | "Ready for Review")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Ready for Review">Ready for Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Button asChild type="button" variant="outline">
            <Link href={`/boards/${boardId}/decisions`}>Cancel</Link>
          </Button>
          <Button type="submit" variant="secondary">
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={() => submit("desired")}
          >
            Save & Move to Ready for Review
          </Button>
        </div>
      </form>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Live Quality Checklist</CardTitle>
          <CardDescription>Quality score: {quality.score}/100</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {quality.checks.map((check) => (
            <div key={check.id} className="flex items-center gap-2 text-sm">
              {check.passed ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <X className="size-4 text-destructive" />
              )}
              <span>{check.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
