import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HelpPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader
        title="راهنما"
        subtitle="راهنمای استفاده از هیئت حاکمیت تصمیم"
        breadcrumbs={[{ label: "راهنما", href: "/help" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>شروع کار</CardTitle>
          <CardDescription>جریان پیشنهادی</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>۱. یک بورد برای پروژه یا تیم خود ایجاد کنید.</p>
          <p>۲. تصمیمات را با مالک، معیار و گزینه‌های مشخص اضافه کنید.</p>
          <p>۳. تصمیمات را در کانبان از پیش‌نویس تا انجام‌شده جابجا کنید.</p>
          <p>۴. از دروازه‌های کیفیت برای جلوگیری از جابجایی‌های ناقص یا پرریسک استفاده کنید.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>دروازه‌های کیفیت</CardTitle>
          <CardDescription>بررسی‌های اجباری پیش‌فرض</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>- مالک قبل از بررسی الزامی است</p>
          <p>- معیار قبل از بررسی الزامی است</p>
          <p>- تاریخ سررسید قبل از بررسی الزامی است</p>
          <p>- تصمیمات غیرقابل بازگشت نیاز به گزینه‌ها، ریسک‌ها و شواهد دارند</p>
          <p>- تصمیمات با تاثیر بالا نیاز به تایید‌کنندگان دارند</p>
          <p>- اطمینان زیر آستانه نیاز به طرح اعتبارسنجی دارد</p>
        </CardContent>
      </Card>
    </div>
  );
}
