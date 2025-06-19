"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import {
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const [token, setToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Please complete the security check");
      return;
    }
    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, token }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to send message");
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      setStatus("error");
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to send message");
      }
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto max-w-4xl px-4 py-16">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="bg-primary-100 mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
            <EnvelopeIcon className="text-primary-600 h-8 w-8" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
            Get in <span className="text-primary-600">Touch</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Have questions, feedback, or need support? We&apos;d love to hear
            from you. Send us a message and we&apos;ll get back to you as soon
            as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="shadow-study rounded-2xl border border-slate-200 bg-white p-8">
              <div className="mb-6 flex items-center gap-4">
                <div className="bg-primary-100 flex h-12 w-12 items-center justify-center rounded-xl">
                  <ChatBubbleLeftRightIcon className="text-primary-600 h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Let&apos;s Chat
                  </h3>
                  <p className="text-slate-600">
                    We&apos;re here to help you succeed
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-medium text-slate-900">
                    What can we help with?
                  </h4>
                  <ul className="space-y-1 text-sm text-slate-600">
                    <li>• Technical support and bug reports</li>
                    <li>• Feature requests and suggestions</li>
                    <li>• Account and billing questions</li>
                    <li>• General feedback and ideas</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-medium text-slate-900">
                    Response Time
                  </h4>
                  <p className="text-sm text-slate-600">
                    We typically respond within 24 hours during business days.
                  </p>
                </div>
              </div>
            </div>

            <div className="from-primary-50 border-primary-200 rounded-2xl border bg-gradient-to-br to-indigo-50 p-8">
              <div className="mb-4 flex items-center gap-4">
                <div className="bg-primary-500 flex h-12 w-12 items-center justify-center rounded-xl">
                  <HeartIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    Built with Care
                  </h3>
                  <p className="text-slate-600">For students, by students</p>
                </div>
              </div>
              <p className="text-sm text-slate-700">
                StudySync was created to help students focus better and achieve
                their academic goals. Your feedback helps us build a better
                platform for everyone.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="shadow-study rounded-2xl border border-slate-200 bg-white p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="focus:ring-primary-500 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="focus:ring-primary-500 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  className="focus:ring-primary-500 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={5}
                  className="focus:ring-primary-500 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 placeholder-slate-500 transition-all duration-200 focus:border-transparent focus:ring-2 focus:outline-none"
                  placeholder="Tell us more about your question or feedback..."
                />
              </div>

              <div className="flex justify-center">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_CLOUDFLARE_SITE_KEY!}
                  onSuccess={setToken}
                  options={{
                    theme: "light",
                  }}
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 hover:shadow-study-md flex w-full transform items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading" ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                    Sending Message...
                  </div>
                ) : (
                  <>
                    <EnvelopeIcon className="h-5 w-5" />
                    Send Message
                  </>
                )}
              </button>

              {status === "success" && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                  <p className="text-sm font-medium text-green-700">
                    ✅ Message sent successfully! We&apos;ll get back to you
                    soon.
                  </p>
                </div>
              )}
              {status === "error" && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    ❌ Failed to send message. Please try again or contact us
                    directly.
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
