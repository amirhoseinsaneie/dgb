"use client";

import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";

export default function BoardSettingsPage() {
  const params = useParams();
  const boardId = params.id as string;
  const { getBoard } = useApp();
  const board = getBoard(boardId);

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Board not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader
        title="Board Settings"
        breadcrumbs={[
          { label: "Boards", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "Settings", href: `/boards/${boardId}/settings` },
        ]}
        actions={<Button>Save Changes</Button>}
      />

      <Tabs defaultValue="columns">
        <TabsList>
          <TabsTrigger value="columns">Columns</TabsTrigger>
          <TabsTrigger value="gates">Quality Gates</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="columns" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Columns</CardTitle>
              <CardDescription>
                Reorder, rename, or add/remove columns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {board.columns.map((col, i) => (
                  <div
                    key={col}
                    className="flex items-center justify-between rounded border p-3"
                  >
                    <span>
                      {i + 1}. {col}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Quality Gates</CardTitle>
              <CardDescription>
                Required rules for moving to next stages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {board.qualityGates.map((gate) => (
                <div key={gate.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`gate-${gate.id}`}
                    checked={gate.enabled}
                    disabled
                  />
                  <Label htmlFor={`gate-${gate.id}`} className="font-normal">
                    {gate.label}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage decision categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {board.categories.map((cat) => (
                  <div
                    key={cat}
                    className="flex items-center justify-between rounded border p-3"
                  >
                    <span>{cat}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Admin / Editor / Viewer (optional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Role management coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
