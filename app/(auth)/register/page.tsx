"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "خطا در ثبت‌نام");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/10 dark:shadow-black/30 p-8 space-y-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary via-primary/90 to-violet-600 shadow-lg shadow-primary/30">
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-primary-foreground"
          >
            <path
              d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="currentColor"
              fillOpacity="0.15"
            />
            <path
              d="M9 12L11 14L15 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight">ثبت‌نام در تصمیم‌یار</h1>
          <p className="text-sm text-muted-foreground">
            یک حساب کاربری جدید بسازید
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              نام
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="نام شما"
              className="h-11 bg-background/50 border-border/60 focus:border-primary/50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              ایمیل
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              dir="ltr"
              className="h-11 text-left bg-background/50 border-border/60 focus:border-primary/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              رمز عبور
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="حداقل ۶ کاراکتر"
                dir="ltr"
                className="h-11 text-left pe-11 bg-background/50 border-border/60 focus:border-primary/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute end-1.5 top-1/2 -translate-y-1/2 size-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              تکرار رمز عبور
            </Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="تکرار رمز عبور"
              dir="ltr"
              className="h-11 text-left bg-background/50 border-border/60 focus:border-primary/50"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full gap-2.5 h-11 text-base font-medium"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="size-4.5 animate-spin" />
          ) : (
            <UserPlus className="size-4.5" />
          )}
          {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
        </Button>

        <p className="text-sm text-muted-foreground text-center pt-1">
          قبلاً ثبت‌نام کرده‌اید؟{" "}
          <Link
            href="/login"
            className="text-primary font-semibold hover:underline underline-offset-4"
          >
            وارد شوید
          </Link>
        </p>
      </form>
    </div>
  );
}
