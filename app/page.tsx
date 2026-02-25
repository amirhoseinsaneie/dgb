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
          title="هیئت حاکمیت تصمیم"
          subtitle="ثبت، استانداردسازی و پیگیری تصمیمات کلیدی در تیم‌های چابک"
        />

        <Card>
          <CardHeader>
            <CardTitle>شروع سریع</CardTitle>
            <CardDescription>با ایجاد یا باز کردن یک بورد شروع کنید</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link href="/boards/create" className="gap-2">
                <Plus className="size-4" />
                ایجاد بورد جدید
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/boards" className="gap-2">
                <FolderOpen className="size-4" />
                باز کردن بورد موجود
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>چرا این ابزار؟</CardTitle>
            <CardDescription>چرا این ابزار؟</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="flex gap-3 rounded-lg border p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <AlertTriangle className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">تصمیمات بدون مالک/معیار</h3>
                <p className="text-muted-foreground text-sm">
                  تاخیر و ریسک بالا
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <RotateCcw className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">تصمیمات غیرقابل بازگشت</h3>
                <p className="text-muted-foreground text-sm">
                  نیاز به شواهد و گزینه‌ها
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border p-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Target className="size-5 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">هم‌راستایی تصمیمات</h3>
                <p className="text-muted-foreground text-sm">
                  کاهش تعارض و دوباره‌کاری
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>بوردهای اخیر</CardTitle>
            <CardDescription>۵ بورد اخیر</CardDescription>
          </CardHeader>
          <CardContent>
            {recentBoards.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
                <p className="text-muted-foreground">هنوز بوردی ایجاد نشده است</p>
                <Button asChild>
                  <Link href="/boards/create">ایجاد بورد</Link>
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
                      <Link href={`/boards/${board.id}`}>باز کردن</Link>
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
