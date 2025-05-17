import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimiter } from "~/app/api/contact/middleware";

interface ContactFormData {
  email: string;
  name: string;
  message: string;
  subject: string;
  token: string;
}

interface TurnstileResponse {
  success: boolean;
  error?: string[];
  challenge_ts: string;
  hostname: string;
  "error-codes"?: string[];
  action?: string;
  cdata?: string;
}

function isContactFormData(data: unknown): data is ContactFormData {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.email === "string" &&
    typeof d.name === "string" &&
    typeof d.message === "string" &&
    typeof d.subject === "string" &&
    typeof d.token === "string"
  );
}

async function safeParseJson(data: string): Promise<unknown> {
  try {
    return JSON.parse(data);
  } catch {
    throw new Error("Invalid JSON response");
  }
}

export async function POST(request: Request) {
  try {
    const limitResult = await rateLimiter(request);
    if (limitResult) return limitResult;

    const rawBody = await safeParseJson(await request.text());
    if (!isContactFormData(rawBody)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }

    const { email, name, message, subject, token } = rawBody;

    const formData = new URLSearchParams();
    formData.append("secret", process.env.CLOUDFLARE_SECRET_KEY ?? "");
    formData.append("response", token);

    const turnstileRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      },
    );

    if (!turnstileRes.ok) {
      throw new Error("Failed to verify security token");
    }

    const turnstileData = (await turnstileRes.json()) as TurnstileResponse;
    if (!turnstileData.success) {
      return NextResponse.json(
        { error: "Invalid security token" },
        { status: 400 },
      );
    }

    if (!email || !name || !message || !subject) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD ||
      !process.env.TO_EMAIL ||
      !process.env.FROM_EMAIL
    ) {
      throw new Error("Missing email configuration");
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.verify();

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      replyTo: `"${name}" <${email}>`,
      to: process.env.TO_EMAIL ?? "",
      subject: subject || `New Contact Form Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              .container { font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; }
              .header { background: linear-gradient(to right, #3b82f6, #9333ea); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 16px; }
              .label { font-weight: bold; color: #3b82f6; }
              .message { white-space: pre-wrap; background: white; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">${subject}</h2>
              </div>
              <div class="content">
                <div class="field">
                  <span class="label">From:</span>
                  <p style="margin: 5px 0;">${name}</p>
                </div>
                <div class="field">
                  <span class="label">Email:</span>
                  <p style="margin: 5px 0;">${email}</p>
                </div>
                <div class="field">
                  <span class="label">Message:</span>
                  <div class="message">${message}</div>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send message",
      },
      { status: 500 },
    );
  }
}
