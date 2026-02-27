import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "ایمیل و رمز عبور الزامی هستند." },
        { status: 400 }
      );
    }

    const db = await getDb();
    const user = await db
      .collection("users")
      .findOne({ email: email.toLowerCase() });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "ایمیل یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    const valid = verifyPassword(password, user.passwordHash as string);
    if (!valid) {
      return NextResponse.json(
        { error: "ایمیل یا رمز عبور اشتباه است." },
        { status: 401 }
      );
    }

    const token = await createToken({
      userId: user.id as string,
      email: user.email as string,
      name: user.name as string,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    return NextResponse.json(
      { error: "خطا در ورود. لطفاً دوباره تلاش کنید." },
      { status: 500 }
    );
  }
}
