"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { users } from "@/lib/mock-data";
import { useApp } from "@/lib/store";

type ApprovalStatus = "Approved" | "Pending" | "Rejected";

interface ApprovalItem {
  approverId: string;
  approverName: string;
  status: ApprovalStatus;
  comment: string;
  date?: string;
}

export default function ApprovalPage() {
  const params = useParams();
  const boardId = params.id as string;
  const decisionId = params.decisionId as string;
  const { getBoard, getDecision } = useApp();
  const board = getBoard(boardId);
  const decision = getDecision(decisionId);

  const [rows, setRows] = useState<ApprovalItem[]>(
    () =>
      (decision?.approverIds || []).map((id) => ({
        approverId: id,
        approverName: users.find((user) => user.id === id)?.name || id,
        status: "Pending",
        comment: "",
      }))
  );

  if (!board || !decision) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">Decision not found</p>
      </div>
    );
  }

  const summary = {
    required: rows.length,
    approved: rows.filter((row) => row.status === "Approved").length,
    pending: rows.filter((row) => row.status === "Pending").length,
  };

  const markApproved = (approverId: string) => {
    setRows((current) =>
      current.map((row) =>
        row.approverId === approverId
          ? { ...row, status: "Approved", date: new Date().toISOString() }
          : row
      )
    );
  };

  const sendReminder = (approverId: string) => {
    setRows((current) =>
      current.map((row) =>
        row.approverId === approverId
          ? { ...row, comment: "Reminder sent internally" }
          : row
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Approvals for ${decision.title}`}
        breadcrumbs={[
          { label: "Boards", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "Decisions", href: `/boards/${boardId}/decisions` },
          { label: decision.title, href: `/boards/${boardId}/decisions/${decisionId}` },
          { label: "Approvals", href: `/boards/${boardId}/decisions/${decisionId}/approvals` },
        ]}
        actions={
          <Button asChild variant="outline">
            <Link href={`/boards/${boardId}/decisions/${decisionId}`}>Back to decision</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Approval Summary</CardTitle>
          <CardDescription>
            Required approvers: {summary.required} | Approved: {summary.approved} | Pending: {summary.pending}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Approver List</CardTitle>
          <CardDescription>Manage reminders and demo approvals</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No approvers assigned.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.approverId}>
                  <TableCell>{row.approverName}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.comment || "-"}</TableCell>
                  <TableCell>{row.date ? new Date(row.date).toLocaleDateString() : "-"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => sendReminder(row.approverId)}>
                      Request Reminder
                    </Button>
                    <Button size="sm" onClick={() => markApproved(row.approverId)}>
                      Mark approved
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline">Send approval request</Button>
          <Input placeholder="Internal note (MVP)" />
        </CardContent>
      </Card>
    </div>
  );
}
