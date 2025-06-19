"use client";

import { useState, useEffect } from "react";

interface CachedImageOptions {
  fallbackUrl?: string;
  cacheKey?: string;
}

export function useCachedImage(
  originalUrl: string | null | undefined,
  options: CachedImageOptions = {},
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!originalUrl) {
      setImageUrl(null);
      setIsLoading(false);
      return;
    }

    // Generate cache key
    const cacheKey = options.cacheKey ?? `cached_image_${btoa(originalUrl)}`;

    // Check localStorage cache first
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData) as {
          timestamp?: number;
          url?: string;
        };
        const now = Date.now();

        // Check if cached data is still valid (1 hour cache)
        if (
          parsed.timestamp &&
          now - parsed.timestamp < 3600000 &&
          parsed.url
        ) {
          setImageUrl(parsed.url);
          setIsLoading(false);
          return;
        }
      } catch {
        // Invalid cached data, remove it
        localStorage.removeItem(cacheKey);
      }
    }

    // If not from supported CDN URLs, use original URL
    const supportedDomains = [
      "https://cdn.discordapp.com/",
      "https://lh3.googleusercontent.com/",
      "https://lh4.googleusercontent.com/",
      "https://lh5.googleusercontent.com/",
      "https://lh6.googleusercontent.com/",
    ];

    const isSupported = supportedDomains.some((domain) =>
      originalUrl.startsWith(domain),
    );

    if (!isSupported) {
      setImageUrl(originalUrl);
      setIsLoading(false);
      return;
    }

    // Use proxy for supported provider images
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;

    // Test if the proxy URL works
    const img = new Image();
    img.onload = () => {
      setImageUrl(proxyUrl);
      setIsLoading(false);
      setError(null);

      // Cache the successful URL
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          url: proxyUrl,
          originalUrl,
          timestamp: Date.now(),
        }),
      );
    };

    img.onerror = () => {
      // Fallback to original URL if proxy fails
      if (options.fallbackUrl) {
        setImageUrl(options.fallbackUrl);
      } else {
        setImageUrl(originalUrl);
      }
      setIsLoading(false);
      setError("Failed to load image via proxy");
    };

    img.src = proxyUrl;
  }, [originalUrl, options.cacheKey, options.fallbackUrl]);

  return { imageUrl, isLoading, error };
}
