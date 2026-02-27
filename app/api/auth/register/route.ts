import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "نام، ایمیل و رمز عبور الزامی هستند." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل ۶ کاراکتر باشد." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const existing = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });

    if (existing) {
      return NextResponse.json(
        { error: "این ایمیل قبلاً ثبت شده است." },
        { status: 409 }
      );
    }

    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    await db.collection("users").insertOne({
      id: userId,
      name,
      email: email.toLowerCase(),
      passwordHash,
      createdAt: new Date().toISOString(),
    });

    const token = await createToken({
      userId,
      email: email.toLowerCase(),
      name,
    });

    await setAuthCookie(token);

    return NextResponse.json(
      { user: { id: userId, name, email: email.toLowerCase() } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "خطا در ثبت‌نام. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
