"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Play, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";
import type { Template } from "@/lib/types";

const requiredFieldOptions = ["owner", "due", "criteria", "options", "evidence", "approvers"];

export default function TemplatesPage() {
  const { templates, addTemplate, updateTemplate } = useApp();
  const initialTemplate = templates[0] ?? null;
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(initialTemplate?.id ?? null);
  const [templateName, setTemplateName] = useState(initialTemplate?.name ?? "");
  const [criteria, setCriteria] = useState<Array<{ name: string; weight: number }>>(
    initialTemplate?.criteria.map((criterion) => ({ ...criterion })) ?? []
  );
  const [requiredFields, setRequiredFields] = useState<string[]>(initialTemplate?.requiredFields ?? []);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) || null,
    [selectedTemplateId, templates]
  );

  const loadTemplate = (template: Template | null) => {
    if (!template) {
      setTemplateName("");
      setCriteria([]);
      setRequiredFields([]);
      return;
    }
    setTemplateName(template.name);
    setCriteria(template.criteria.map((criterion) => ({ ...criterion })));
    setRequiredFields([...template.requiredFields]);
  };

  const openTemplate = (template: Template) => {
    setSelectedTemplateId(template.id);
    loadTemplate(template);
  };

  const createNewTemplate = () => {
    setSelectedTemplateId(null);
    setTemplateName("");
    setCriteria([{ name: "", weight: 3 }]);
    setRequiredFields(["owner", "due", "criteria"]);
  };

  const updateCriterion = (index: number, updates: Partial<{ name: string; weight: number }>) => {
    setCriteria((current) =>
      current.map((criterion, criterionIndex) =>
        criterionIndex === index ? { ...criterion, ...updates } : criterion
      )
    );
  };

  const addCriterion = () => {
    setCriteria((current) => [...current, { name: "", weight: 3 }]);
  };

  const removeCriterion = (index: number) => {
    setCriteria((current) => current.filter((_, criterionIndex) => criterionIndex !== index));
  };

  const toggleRequiredField = (field: string) => {
    setRequiredFields((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field]
    );
  };

  const saveTemplate = () => {
    const payload: Template = {
      id: selectedTemplateId || crypto.randomUUID(),
      name: templateName || "Untitled Template",
      criteria: criteria.filter((criterion) => criterion.name.trim()),
      requiredFields,
    };

    if (selectedTemplateId) {
      updateTemplate(selectedTemplateId, payload);
    } else {
      addTemplate(payload);
      setSelectedTemplateId(payload.id);
    }
  };

  return (
    <div className="max-w-5xl space-y-8">
      <PageHeader
        title="Templates"
        subtitle="Criteria templates and decision structure"
        breadcrumbs={[{ label: "Templates", href: "/templates" }]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Templates List</CardTitle>
            <CardDescription>Select a template to edit or use</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">{template.criteria.length} criteria</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openTemplate(template)}>
                    <Pencil className="mr-2 size-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openTemplate(template)}>
                    <Play className="mr-2 size-4" />
                    Use
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={createNewTemplate}>
              <Plus className="mr-2 size-4" />
              New template
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Editor</CardTitle>
            <CardDescription>{selectedTemplate ? "Edit template" : "Create template"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Template name</Label>
              <Input
                value={templateName}
                onChange={(event) => setTemplateName(event.target.value)}
                placeholder="Template name"
              />
            </div>

            <div className="space-y-2">
              <Label>Criteria defaults</Label>
              {criteria.map((criterion, index) => (
                <div key={`${criterion.name}-${index}`} className="flex items-center gap-2">
                  <Input
                    value={criterion.name}
                    onChange={(event) => updateCriterion(index, { name: event.target.value })}
                    placeholder="Criterion"
                  />
                  <Input
                    className="w-20"
                    type="number"
                    min={1}
                    max={5}
                    value={criterion.weight}
                    onChange={(event) => updateCriterion(index, { weight: Number(event.target.value || 3) })}
                  />
                  <Button variant="outline" size="icon" onClick={() => removeCriterion(index)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCriterion}>
                <Plus className="mr-2 size-4" />
                Add criterion
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Required fields</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {requiredFieldOptions.map((field) => (
                  <label key={field} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={requiredFields.includes(field)}
                      onCheckedChange={() => toggleRequiredField(field)}
                    />
                    {field}
                  </label>
                ))}
              </div>
            </div>

            <Button onClick={saveTemplate}>Save</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
