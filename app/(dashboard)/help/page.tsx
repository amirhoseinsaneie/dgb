import {
  AlertTriangle,
  ArrowLeftRight,
  BookOpen,
  CheckCircle2,
  FolderPlus,
  HelpCircle,
  Kanban,
  ListChecks,
  Shield,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const workflowSteps = [
  {
    step: 1,
    icon: FolderPlus,
    title: "ایجاد بورد",
    desc: "یک بورد برای پروژه یا تیم خود ایجاد کنید و ستون‌ها، دسته‌بندی‌ها و دروازه‌های کیفیت را پیکربندی کنید.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    step: 2,
    icon: ListChecks,
    title: "ثبت تصمیمات",
    desc: "تصمیمات را با مالک، معیار، گزینه‌ها و شواهد مشخص اضافه کنید. از قالب‌ها برای سرعت بیشتر استفاده کنید.",
    color: "text-violet-600",
    bg: "bg-violet-500/10",
  },
  {
    step: 3,
    icon: Kanban,
    title: "مدیریت جریان کار",
    desc: "تصمیمات را در بورد کانبان از پیش‌نویس تا انجام‌شده جابجا کنید و وضعیت هر تصمیم را پیگیری نمایید.",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  {
    step: 4,
    icon: Shield,
    title: "تضمین کیفیت",
    desc: "از دروازه‌های کیفیت برای جلوگیری از جابجایی‌های ناقص یا پرریسک استفاده کنید. سیستم هشدارهای لازم را نمایش می‌دهد.",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
];

const qualityGates = [
  {
    icon: Users,
    label: "مالک قبل از بررسی الزامی است",
    severity: "خطا",
  },
  {
    icon: ListChecks,
    label: "معیار قبل از بررسی الزامی است",
    severity: "خطا",
  },
  {
    icon: Target,
    label: "تاریخ سررسید قبل از بررسی الزامی است",
    severity: "خطا",
  },
  {
    icon: ArrowLeftRight,
    label: "تصمیمات غیرقابل بازگشت نیاز به گزینه‌ها، ریسک‌ها و شواهد دارند",
    severity: "هشدار",
  },
  {
    icon: AlertTriangle,
    label: "تصمیمات با تاثیر بالا نیاز به تایید‌کنندگان دارند",
    severity: "هشدار",
  },
  {
    icon: Sparkles,
    label: "اطمینان زیر آستانه نیاز به طرح اعتبارسنجی دارد",
    severity: "اطلاع",
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <PageHeader
        title="راهنما"
        subtitle="راهنمای استفاده از سامانه مدیریت تصمیم"
        breadcrumbs={[{ label: "راهنما", href: "/help" }]}
      />

      <Card className="overflow-hidden border-primary/20 bg-linear-to-bl from-primary/5 via-background to-background">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle>شروع کار</CardTitle>
              <CardDescription>جریان کاری پیشنهادی</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSteps.map((item, index) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-xl",
                      item.bg
                    )}
                  >
                    <item.icon className={cn("size-5", item.color)} />
                  </div>
                  {index < workflowSteps.length - 1 && (
                    <div className="mt-2 h-full w-px bg-border" />
                  )}
                </div>
                <div className="pb-6">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2 text-[10px] font-mono"
                    >
                      مرحله {item.step}
                    </Badge>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Shield className="size-5 text-emerald-600" />
            </div>
            <div>
              <CardTitle>دروازه‌های کیفیت</CardTitle>
              <CardDescription>بررسی‌های اجباری پیش‌فرض</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {qualityGates.map((gate) => (
              <div
                key={gate.label}
                className="flex items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <gate.icon className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{gate.label}</p>
                </div>
                <Badge
                  variant={
                    gate.severity === "خطا"
                      ? "destructive"
                      : gate.severity === "هشدار"
                        ? "secondary"
                        : "outline"
                  }
                  className="shrink-0 text-[10px]"
                >
                  {gate.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10">
              <HelpCircle className="size-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>نکات مهم</CardTitle>
              <CardDescription>
                موارد کلیدی برای استفاده بهتر
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {[
              "برای تصمیمات غیرقابل بازگشت حتماً شواهد و ریسک‌ها را ثبت کنید.",
              "تصمیمات با تاثیر بالا باید حداقل یک تاییدکننده داشته باشند.",
              "از قالب‌ها برای استانداردسازی فرآیند تصمیم‌گیری استفاده کنید.",
              "امتیاز کیفیت هر تصمیم را در بورد کانبان پیگیری کنید.",
              "گزارش‌ها وضعیت کلی سلامت تصمیمات شما را نشان می‌دهند.",
            ].map((tip) => (
              <div key={tip} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
