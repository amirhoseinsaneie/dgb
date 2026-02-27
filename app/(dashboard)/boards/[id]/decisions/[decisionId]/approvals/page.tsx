"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock,
  Send,
  Shield,
  UserCheck,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApp } from "@/lib/store";
import { cn, toJalali } from "@/lib/utils";

type ApprovalStatus = "Approved" | "Pending" | "Rejected";

interface ApprovalItem {
  approverId: string;
  approverName: string;
  status: ApprovalStatus;
  comment: string;
  date?: string;
}

const statusConfig: Record<
  ApprovalStatus,
  { label: string; icon: typeof CheckCircle2; color: string; bg: string }
> = {
  Approved: {
    label: "تایید شده",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  Pending: {
    label: "در انتظار",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  Rejected: {
    label: "رد شده",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
};

export default function ApprovalPage() {
  const params = useParams();
  const boardId = params.id as string;
  const decisionId = params.decisionId as string;
  const { getBoard, getDecision, users } = useApp();
  const board = getBoard(boardId);
  const decision = getDecision(decisionId);

  const [rows, setRows] = useState<ApprovalItem[]>(() =>
    (decision?.approverIds || []).map((id) => ({
      approverId: id,
      approverName: users.find((user) => user.id === id)?.name || id,
      status: "Pending",
      comment: "",
    }))
  );
  const [internalNote, setInternalNote] = useState("");

  if (!board || !decision) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted">
          <Shield className="size-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">تصمیم یافت نشد</p>
      </div>
    );
  }

  const summary = {
    required: rows.length,
    approved: rows.filter((row) => row.status === "Approved").length,
    pending: rows.filter((row) => row.status === "Pending").length,
    rejected: rows.filter((row) => row.status === "Rejected").length,
  };

  const allApproved = summary.required > 0 && summary.approved === summary.required;

  const markApproved = (approverId: string) => {
    setRows((current) =>
      current.map((row) =>
        row.approverId === approverId
          ? { ...row, status: "Approved", date: new Date().toISOString() }
          : row
      )
    );
  };

  const markRejected = (approverId: string) => {
    setRows((current) =>
      current.map((row) =>
        row.approverId === approverId
          ? { ...row, status: "Rejected", date: new Date().toISOString() }
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
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader
        title={`تاییدهای تصمیم: ${decision.title}`}
        subtitle="مدیریت فرآیند تایید و بررسی تصمیم"
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: board.name, href: `/boards/${boardId}` },
          { label: "تصمیمات", href: `/boards/${boardId}/decisions` },
          {
            label: decision.title,
            href: `/boards/${boardId}/decisions/${decisionId}`,
          },
          {
            label: "تاییدها",
            href: `/boards/${boardId}/decisions/${decisionId}/approvals`,
          },
        ]}
        actions={
          <Button asChild variant="outline" className="gap-2">
            <Link href={`/boards/${boardId}/decisions/${decisionId}`}>
              <ArrowRight className="size-4" />
              بازگشت به تصمیم
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "تایید شده",
            value: summary.approved,
            icon: CheckCircle2,
            color: "text-emerald-600",
            bg: "bg-emerald-500/10",
          },
          {
            label: "در انتظار",
            value: summary.pending,
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
          },
          {
            label: "رد شده",
            value: summary.rejected,
            icon: XCircle,
            color: "text-destructive",
            bg: "bg-destructive/10",
          },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="relative overflow-hidden transition-all hover:shadow-sm"
          >
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl",
                    stat.bg
                  )}
                >
                  <stat.icon className={cn("size-5", stat.color)} />
                </div>
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {allApproved && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              تمام تاییدکنندگان تایید کرده‌اند
            </p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">
              تصمیم آماده اجرا است
            </p>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
              <UserCheck className="size-4.5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">لیست تایید‌کنندگان</CardTitle>
              <CardDescription>
                مدیریت یادآورها و ثبت تاییدها
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-muted">
                <UserCheck className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">تایید‌کننده‌ای تعیین نشده است</p>
                <p className="text-sm text-muted-foreground">
                  از صفحه تصمیم تاییدکننده اضافه کنید
                </p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>نام</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>یادداشت</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead className="text-end">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const config = statusConfig[row.status];
                  const StatusIcon = config.icon;
                  return (
                    <TableRow key={row.approverId} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                            {row.approverName.charAt(0)}
                          </div>
                          <span className="font-medium text-sm">
                            {row.approverName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("gap-1.5", config.color, config.bg)}
                        >
                          <StatusIcon className="size-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.comment || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.date
                          ? toJalali(row.date)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1.5">
                          {row.status === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 gap-1.5 text-xs"
                                onClick={() => sendReminder(row.approverId)}
                              >
                                <Bell className="size-3" />
                                یادآور
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
                                onClick={() => markRejected(row.approverId)}
                              >
                                <XCircle className="size-3" />
                                رد
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 gap-1.5 text-xs shadow-sm"
                                onClick={() => markApproved(row.approverId)}
                              >
                                <CheckCircle2 className="size-3" />
                                تایید
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10">
              <Send className="size-4.5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">عملیات دسته‌جمعی</CardTitle>
              <CardDescription>
                ارسال درخواست تایید و یادداشت داخلی
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <label className="text-xs text-muted-foreground">
                یادداشت داخلی
              </label>
              <Input
                placeholder="یادداشت اختیاری برای تایید‌کنندگان..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="transition-shadow focus:shadow-sm"
              />
            </div>
            <Button
              variant="outline"
              className="gap-2 shadow-sm"
              onClick={() => {
                const pendingIds = rows
                  .filter((r) => r.status === "Pending")
                  .map((r) => r.approverId);
                for (const id of pendingIds) {
                  sendReminder(id);
                }
                setInternalNote("");
              }}
              disabled={rows.filter((r) => r.status === "Pending").length === 0}
            >
              <Send className="size-4" />
              ارسال درخواست تایید همگانی
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
