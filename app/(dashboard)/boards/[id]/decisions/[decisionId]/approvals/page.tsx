"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  const { getBoard, getDecision, users } = useApp();
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
        <p className="text-muted-foreground">تصمیم یافت نشد</p>
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
          ? { ...row, comment: "یادآور داخلی ارسال شد" }
          : row
      )
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`تاییدهای تصمیم: ${decision.title}`}
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "تصمیمات", href: `/boards/${boardId}/decisions` },
          { label: decision.title, href: `/boards/${boardId}/decisions/${decisionId}` },
          { label: "تاییدها", href: `/boards/${boardId}/decisions/${decisionId}/approvals` },
        ]}
        actions={
          <Button asChild variant="outline">
            <Link href={`/boards/${boardId}/decisions/${decisionId}`}>بازگشت به تصمیم</Link>
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>خلاصه تاییدها</CardTitle>
          <CardDescription>
            تعداد تایید‌کنندگان: {summary.required} | تایید شده: {summary.approved} | در انتظار: {summary.pending}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>لیست تایید‌کنندگان</CardTitle>
          <CardDescription>مدیریت یادآورها و ثبت تاییدها</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>وضعیت</TableHead>
                <TableHead>یادداشت</TableHead>
                <TableHead>تاریخ</TableHead>
                <TableHead>عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    تایید‌کننده‌ای تعیین نشده است.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((row) => (
                <TableRow key={row.approverId}>
                  <TableCell>{row.approverName}</TableCell>
                  <TableCell>{row.status === "Approved" ? "تایید شده" : row.status === "Rejected" ? "رد شده" : "در انتظار"}</TableCell>
                  <TableCell>{row.comment || "-"}</TableCell>
                  <TableCell>{row.date ? new Date(row.date).toLocaleDateString("fa-IR") : "-"}</TableCell>
                  <TableCell className="space-x-2 rtl:space-x-reverse">
                    <Button size="sm" variant="outline" onClick={() => sendReminder(row.approverId)}>
                      ارسال یادآور
                    </Button>
                    <Button size="sm" onClick={() => markApproved(row.approverId)}>
                      ثبت تایید
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
          <CardTitle>عملیات</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="outline">ارسال درخواست تایید همگانی</Button>
          <Input placeholder="یادداشت داخلی..." className="w-64" />
        </CardContent>
      </Card>
    </div>
  );
}
