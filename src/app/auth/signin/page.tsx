"use client";

import { signIn, getProviders } from "next-auth/react";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  UserCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  BookOpenIcon,
  UsersIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

export default function LoginPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<string | null>(null);

  useEffect(() => {
    const setupProviders = async () => {
      const providersRes = await getProviders();
      setProviders(providersRes);
    };
    void setupProviders();
  }, []);

  const handleSignIn = async (providerId: string) => {
    setIsLoading(providerId);
    try {
      await signIn(providerId, {
        callbackUrl: "/",
        redirect: true,
      });
    } catch (error) {
      console.error("Sign in error:", error);
      setIsLoading(null);
      // Show user-friendly error message
      alert("Sign in failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left side - Branding and Features */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <div className="bg-primary-50 text-primary-700 mb-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                  <SparklesIcon className="h-4 w-4" />
                  Focus Together, Achieve More
                </div>
                <h1 className="mb-6 text-4xl font-bold text-slate-900 md:text-5xl lg:text-6xl">
                  Welcome to <span className="text-primary-600">StudySync</span>
                </h1>
                <p className="mx-auto mb-8 max-w-lg text-xl text-slate-600 lg:mx-0">
                  Join collaborative study rooms, track your progress with
                  Pomodoro timers, and stay organized with integrated calendar
                  features.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="text-center lg:text-left">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                    <BookOpenIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="mb-1 font-semibold text-slate-900">
                    Study Rooms
                  </h3>
                  <p className="text-sm text-slate-600">
                    Create or join focused study sessions
                  </p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                    <ClockIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mb-1 font-semibold text-slate-900">
                    Pomodoro Timer
                  </h3>
                  <p className="text-sm text-slate-600">
                    Stay focused with timed work sessions
                  </p>
                </div>
                <div className="text-center lg:text-left">
                  <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                    <UsersIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="mb-1 font-semibold text-slate-900">
                    Collaborate
                  </h3>
                  <p className="text-sm text-slate-600">
                    Chat and work together in real-time
                  </p>
                </div>
              </div>
            </div>

            {/* Right side - Login Form */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <div className="shadow-study-lg rounded-2xl border border-slate-200 bg-white p-8">
                  <div className="mb-8 text-center">
                    <div className="bg-primary-100 mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl">
                      <UserCircleIcon className="text-primary-600 h-8 w-8" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-slate-900">
                      Sign in to StudySync
                    </h2>
                    <p className="text-slate-600">
                      Choose your preferred sign-in method
                    </p>
                  </div>

                  <div className="space-y-4">
                    {providers &&
                      Object.values(providers).map((provider) => {
                        if (provider.id === "credentials") return null;

                        const isDiscord = provider.id === "discord";
                        const isGoogle = provider.id === "google";

                        return (
                          <button
                            key={provider.name}
                            onClick={() => handleSignIn(provider.id)}
                            disabled={isLoading === provider.id}
                            className={`flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 font-semibold transition-all duration-200 ${
                              isDiscord
                                ? "bg-[#5865F2] text-white hover:bg-[#4752C4] focus:ring-[#5865F2]"
                                : isGoogle
                                  ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:ring-slate-500"
                                  : "bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white"
                            } transform hover:-translate-y-0.5 hover:shadow-lg focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50`}
                          >
                            {isLoading === provider.id ? (
                              <div className="flex items-center gap-2">
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                                Signing in...
                              </div>
                            ) : (
                              <>
                                {isDiscord && (
                                  <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.211.375-.444.865-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.120.098.246.195.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                  </svg>
                                )}
                                {isGoogle && (
                                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                      fill="#4285F4"
                                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                      fill="#34A853"
                                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                      fill="#FBBC05"
                                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                      fill="#EA4335"
                                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                  </svg>
                                )}
                                <span>Continue with {provider.name}</span>
                                <ArrowRightIcon className="h-4 w-4" />
                              </>
                            )}
                          </button>
                        );
                      })}
                  </div>

                  <div className="mt-8 text-center">
                    <p className="text-sm text-slate-500">
                      By signing in, you agree to our{" "}
                      <Link
                        href="/tos"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Privacy Policy
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
