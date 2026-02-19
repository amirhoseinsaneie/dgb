"use client";

import { useState } from "react";
import { Pencil, Play } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function TemplatesPage() {
  const { templates } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="Templates"
        subtitle="Criteria templates and decision structure"
        breadcrumbs={[{ label: "Templates", href: "/templates" }]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Templates List</CardTitle>
            <CardDescription>Available templates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{t.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {t.criteria.length} criteria
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(t.id);
                      setEditName(t.name);
                    }}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="size-4 mr-1" />
                    Use
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Template Editor</CardTitle>
            <CardDescription>
              {editingId ? "Edit template" : "Create new template"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Template name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Value vs Time vs Risk"
              />
            </div>
            <div className="space-y-2">
              <Label>Criteria defaults</Label>
              {editingId ? (
                <div className="space-y-2">
                  {templates
                    .find((t) => t.id === editingId)
                    ?.criteria.map((c, i) => (
                      <div
                        key={i}
                        className="flex justify-between rounded border p-2 text-sm"
                      >
                        <span>{c.name}</span>
                        <span className="text-muted-foreground">
                          weight: {c.weight}
                        </span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Select a template to edit or create new.
                </p>
              )}
            </div>
            <Button>Save</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
