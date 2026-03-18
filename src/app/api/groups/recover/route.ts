import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple in-memory rate limiter (per process, resets on restart — good enough)
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const window = 15 * 60 * 1000; // 15 minutes
  const attempts = (rateLimitMap.get(email) ?? []).filter((t) => now - t < window);
  if (attempts.length >= 3) return true;
  rateLimitMap.set(email, [...attempts, now]);
  return false;
}

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email?.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();

  if (isRateLimited(normalised)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait 15 minutes before trying again." },
      { status: 429 }
    );
  }

  // Find groups with this admin email
  const groups = await prisma.group.findMany({
    where: { adminEmail: normalised },
    select: { id: true, name: true, code: true },
  });

  // Always respond with success to avoid email enumeration
  if (groups.length > 0) {
    await sendRecoveryEmail(normalised, groups);
  }

  return NextResponse.json({ ok: true });
}

async function sendRecoveryEmail(
  email: string,
  groups: { name: string; code: string }[]
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Log to console in dev
    console.log(`[Recovery Email] To: ${email}`);
    groups.forEach((g) => console.log(`  Group: ${g.name} — Code: ${g.code}`));
    return;
  }

  const groupList = groups
    .map((g) => `<li><strong>${g.name}</strong> — Code: <code style="font-size:1.2em;letter-spacing:0.15em">${g.code}</code></li>`)
    .join("");

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #0d0b1e; color: white; border-radius: 16px;">
      <div style="text-align:center; font-size:48px; margin-bottom:16px;">🏓</div>
      <h1 style="text-align:center; font-size:24px; margin-bottom:8px;">Your Group Code${groups.length > 1 ? "s" : ""}</h1>
      <p style="color: rgba(255,255,255,0.6); text-align:center; margin-bottom:24px;">Here ${groups.length === 1 ? "is" : "are"} the group${groups.length > 1 ? "s" : ""} linked to your email:</p>
      <ul style="background:rgba(255,255,255,0.08); border-radius:12px; padding:16px 24px; list-style:none; margin:0 0 24px;">
        ${groupList}
      </ul>
      <p style="color:rgba(255,255,255,0.4); font-size:13px; text-align:center;">Enter the code on the home screen to rejoin your group. If you didn't request this, you can ignore this email.</p>
    </div>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Table Tennis <noreply@resend.dev>",
      to: email,
      subject: `Your Table Tennis group code${groups.length > 1 ? "s" : ""}`,
      html,
    }),
  });
}
