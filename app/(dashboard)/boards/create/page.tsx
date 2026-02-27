"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FolderPlus,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";
import type { Board } from "@/lib/types";

export default function CreateBoardPage() {
  const router = useRouter();
  const { addBoard, config } = useApp();

  const [name, setName] = useState("");
  const [project, setProject] = useState("");

  const onSubmit = () => {
    if (!name.trim()) return;
    const newBoard: Board = {
      id: crypto.randomUUID(),
      name,
      project,
      status: "Active",
      columns: config.defaultColumns,
      qualityGates: config.defaultQualityGates,
      categories: config.defaultCategories,
      roles: ["مالک", "مشارکت‌کننده", "تاییدکننده"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    void addBoard(newBoard);
    router.push(`/boards/${newBoard.id}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="ایجاد بورد جدید"
        subtitle="تنظیم بورد تصمیم‌یار برای تیم یا پروژه شما"
        breadcrumbs={[
          { label: "بوردها", href: "/boards" },
          { label: "ایجاد", href: "/boards/create" },
        ]}
      />

      <div className="space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="border-b bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                <Info className="size-4.5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">اطلاعات پایه</CardTitle>
                <CardDescription>
                  نام بورد و پروژه مرتبط را وارد کنید
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">نام بورد *</Label>
              <Input
                id="name"
                placeholder="مثلاً: معماری پلتفرم"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="transition-shadow focus:shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project">پروژه (اختیاری)</Label>
              <Input
                id="project"
                placeholder="نام پروژه یا تیم"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                className="transition-shadow focus:shadow-sm"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <FolderPlus className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">آماده ایجاد بورد هستید؟</p>
              <p className="text-xs text-muted-foreground">
                بعد از ایجاد می‌توانید تنظیمات را ویرایش کنید
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              انصراف
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!name.trim()}
              className="shadow-md"
            >
              <FolderPlus className="me-2 size-4" />
              ایجاد بورد
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
