"use client";

import Link from "next/link";
import { Plus, FolderOpen, AlertTriangle, RotateCcw, Target } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const { boards } = useApp();
  const recentBoards = boards.slice(0, 5);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <PageHeader
          title="Decision Governance Board"
          subtitle="Register, standardize, and track key decisions in agile teams"
        />

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
            <CardDescription>Quick start by creating or opening a board</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/boards/create" className="gap-2">
                <Plus className="size-4" />
                Create New Board
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/boards" className="gap-2">
                <FolderOpen className="size-4" />
                Open Existing Board
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why this tool?</CardTitle>
            <CardDescription>Why this tool?</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="flex gap-3 rounded-lg border p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <AlertTriangle className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Decisions without owner/criteria</h3>
                <p className="text-muted-foreground text-sm">
                  Delays and high risk
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <RotateCcw className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Irreversible decisions</h3>
                <p className="text-muted-foreground text-sm">
                  Require evidence and options
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Target className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">Decision alignment</h3>
                <p className="text-muted-foreground text-sm">
                  Reduce conflict and rework
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Boards</CardTitle>
            <CardDescription>5 most recent boards</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBoards.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <p className="text-muted-foreground">No boards created yet</p>
                <Button asChild>
                  <Link href="/boards/create">Create Board</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentBoards.map((board) => (
                  <div
                    key={board.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                    )}
                  >
                    <div>
                      <p className="font-medium">{board.name}</p>
                      {board.project && (
                        <p className="text-muted-foreground text-sm">
                          {board.project}
                        </p>
                      )}
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/boards/${board.id}`}>Open</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
