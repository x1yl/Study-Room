import { NextResponse } from 'next/server';
import { RateLimiter } from 'limiter';

const limiters = new Map<string, RateLimiter>();

export async function rateLimiter(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  
  if (!limiters.has(ip)) {
    limiters.set(ip, new RateLimiter({
      tokensPerInterval: 20,
      interval: "hr",
    }));
  }

  const limiter = limiters.get(ip)!;
  const hasToken = await limiter.removeTokens(1);

  if (!hasToken) {
    return NextResponse.json(
      { error: 'Too many requests from this IP, please try again later' },
      { status: 429 }
    );
  }

  return null;
}