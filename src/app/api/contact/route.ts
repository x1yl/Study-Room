import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { rateLimiter } from "~/app/api/contact/middleware";

export async function POST(request: Request) {
  try {
    const limitResult = await rateLimiter(request);
    if (limitResult) return limitResult;

    const { email, name, message, subject, token } = await request.json();

    const formData = new URLSearchParams();
    formData.append("secret", process.env.CLOUDFLARE_SECRET_KEY!);
    formData.append("response", token);

    const turnstileRes = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return NextResponse.json(
        { error: "Invalid security token" },
        { status: 400 }
      );
    }

    if (!email || !name || !message || !subject) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
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
      port: parseInt(process.env.SMTP_PORT || "587"),
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
      to: process.env.TO_EMAIL,
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
      { status: 500 }
    );
  }
}