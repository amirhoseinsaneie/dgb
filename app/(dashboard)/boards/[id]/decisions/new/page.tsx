"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/store";
import { checkDecisionQuality } from "@/lib/quality-gates";
import { users } from "@/lib/mock-data";
import type { Decision, Criterion, Option } from "@/lib/types";
import { Check, X } from "lucide-react";

export default function CreateDecisionPage() {
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard, addDecision, templates } = useApp();
  const board = getBoard(boardId);

  const [title, setTitle] = useState("");
  const [problemStatement, setProblemStatement] = useState("");
  const [category, setCategory] = useState("");
  const [impact, setImpact] = useState<Decision["impact"]>("Medium");
  const [templateId, setTemplateId] = useState("");
  const [urgency, setUrgency] = useState("");
  const [ownerId, setOwnerId] = useState("");
  const [contributorIds, setContributorIds] = useState<string[]>([]);
  const [approverIds, setApproverIds] = useState<string[]>([]);
  const [stakeholdersNotes, setStakeholdersNotes] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [confidence, setConfidence] = useState(70);
  const [reversible, setReversible] = useState(true);
  const [keyRisksMitigations, setKeyRisksMitigations] = useState("");
  const [evidenceLinks, setEvidenceLinks] = useState<string[]>([]);
  const [rollbackExplanation, setRollbackExplanation] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reviewMeetingDate, setReviewMeetingDate] = useState("");
  const [initialStatus, setInitialStatus] = useState<Decision["status"]>("Draft");

  const draftDecision: Partial<Decision> = {
    title,
    problemStatement,
    category: category || undefined,
    impact,
    ownerId: ownerId || undefined,
    ownerName: ownerId ? users.find((u) => u.id === ownerId)?.name : undefined,
    approverIds: approverIds.length ? approverIds : undefined,
    criteria,
    options,
    confidence,
    reversible,
    keyRisksMitigations: keyRisksMitigations || undefined,
    evidenceLinks: evidenceLinks.length ? evidenceLinks : undefined,
    rollbackExplanation: rollbackExplanation || undefined,
    dueDate: dueDate || undefined,
    reviewMeetingDate: reviewMeetingDate || undefined,
    status: initialStatus,
  };

  const { checks, score } = board
    ? checkDecisionQuality({ ...draftDecision, boardId } as Decision, board)
    : { checks: [], score: 0 };

  const loadTemplate = (id: string) => {
    setTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (t) {
      setCriteria(
        t.criteria.map((c, i) => ({
          id: `c-${i}`,
          name: c.name,
          weight: c.weight,
          notes: "",
        }))
      );
    }
  };

  const addCriterion = () => {
    setCriteria((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", weight: 3, notes: "" },
    ]);
  };

  const updateCriterion = (id: string, updates: Partial<Criterion>) => {
    setCriteria((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const removeCriterion = (id: string) => {
    setCriteria((prev) => prev.filter((c) => c.id !== id));
  };

  const addOption = () => {
    setOptions((prev) => [
      ...prev,
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
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  };

  const removeOption = (id: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== id));
  };

  const handleSubmit = (moveToReview: boolean) => (e: React.FormEvent) => {
    e.preventDefault();
    const decision: Decision = {
      id: crypto.randomUUID(),
      boardId,
      title,
      problemStatement,
      category: category || "Product / Scope",
      impact,
      urgency: urgency as Decision["urgency"],
      ownerId: ownerId || undefined,
      ownerName: ownerId ? users.find((u) => u.id === ownerId)?.name : undefined,
      contributorIds: contributorIds.length ? contributorIds : undefined,
      approverIds: approverIds.length ? approverIds : undefined,
      stakeholdersNotes: stakeholdersNotes || undefined,
      criteria,
      options,
      confidence,
      reversible,
      keyRisksMitigations: keyRisksMitigations || undefined,
      evidenceLinks: evidenceLinks.length ? evidenceLinks : undefined,
      rollbackExplanation: rollbackExplanation || undefined,
      dueDate: dueDate || undefined,
      reviewMeetingDate: reviewMeetingDate || undefined,
      status: moveToReview ? "Ready for Review" : "Draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addDecision(decision);
    router.push(`/boards/${boardId}/decisions/${decision.id}`);
  };

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
        <PageHeader
          title="New Decision"
          subtitle="Register new decision with owner, criteria, and options"
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
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="problem">Problem statement *</Label>
              <Textarea
                id="problem"
                value={problemStatement}
                onChange={(e) => setProblemStatement(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {board.categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Impact *</Label>
                <Select value={impact} onValueChange={(v) => setImpact(v as Decision["impact"])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select impact" />
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
                <Select value={urgency} onValueChange={setUrgency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
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
              <Label>Decision Owner *</Label>
              <Select value={ownerId} onValueChange={setOwnerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Stakeholders / notes</Label>
              <Textarea
                value={stakeholdersNotes}
                onChange={(e) => setStakeholdersNotes(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision Criteria *</CardTitle>
            <CardDescription>
              Load a template for criteria
            </CardDescription>
            <Select value={templateId} onValueChange={loadTemplate}>
              <SelectTrigger className="w-[200px] mt-2">
                <SelectValue placeholder="Load template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="space-y-4">
            {criteria.map((c) => (
              <div key={c.id} className="flex gap-2 items-center">
                <Input
                  value={c.name}
                  onChange={(e) => updateCriterion(c.id, { name: e.target.value })}
                  placeholder="Criterion name"
                  className="flex-1"
                />
                <Slider
                  value={[c.weight]}
                  onValueChange={([v]) => updateCriterion(c.id, { weight: v ?? 3 })}
                  min={1}
                  max={5}
                  className="w-24"
                />
                <span className="text-sm w-6">{c.weight}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCriterion(c.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addCriterion}>
              <Plus className="size-4 mr-2" />
              Add criterion
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Options & Trade-offs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {options.map((o) => (
              <div key={o.id} className="space-y-2 rounded-lg border p-4">
                <div className="flex justify-between">
                  <Input
                    value={o.title}
                    onChange={(e) => updateOption(o.id, { title: e.target.value })}
                    placeholder="Option title"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(o.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={o.pros}
                    onChange={(e) => updateOption(o.id, { pros: e.target.value })}
                    placeholder="Pros"
                  />
                  <Input
                    value={o.cons}
                    onChange={(e) => updateOption(o.id, { cons: e.target.value })}
                    placeholder="Cons"
                  />
                </div>
                <Input
                  value={o.risk || ""}
                  onChange={(e) => updateOption(o.id, { risk: e.target.value })}
                  placeholder="Risk"
                />
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addOption}>
              <Plus className="size-4 mr-2" />
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
                value={[confidence]}
                onValueChange={([v]) => setConfidence(v ?? 70)}
                min={0}
                max={100}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={reversible} onCheckedChange={setReversible} />
              <Label>Reversible?</Label>
            </div>
            {!reversible && (
              <>
                <div className="space-y-2">
                  <Label>Key risks & mitigations *</Label>
                  <Textarea
                    value={keyRisksMitigations}
                    onChange={(e) => setKeyRisksMitigations(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Evidence/References *</Label>
                  <Input
                    value={evidenceLinks.join(", ")}
                    onChange={(e) =>
                      setEvidenceLinks(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))
                    }
                    placeholder="Comma-separated links"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rollback not possible explanation *</Label>
                  <Textarea
                    value={rollbackExplanation}
                    onChange={(e) => setRollbackExplanation(e.target.value)}
                    rows={2}
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
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Review meeting date</Label>
              <Input
                type="date"
                value={reviewMeetingDate}
                onChange={(e) => setReviewMeetingDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Desired status after create</Label>
              <Select
                value={initialStatus}
                onValueChange={(v) => setInitialStatus(v as Decision["status"])}
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

        <div className="flex gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href={`/boards/${boardId}/decisions`}>Cancel</Link>
          </Button>
          <Button
            type="submit"
            variant="secondary"
            onClick={handleSubmit(false)}
          >
            Save as Draft
          </Button>
          <Button onClick={handleSubmit(true)}>
            Save & Move to Ready for Review
          </Button>
        </div>
      </form>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Quality Checklist</CardTitle>
          <CardDescription>Quality score: {score}/100</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {checks.map((c) => (
            <div key={c.id} className="flex items-center gap-2 text-sm">
              {c.passed ? (
                <Check className="size-4 text-green-600" />
              ) : (
                <X className="size-4 text-destructive" />
              )}
              <span>{c.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
