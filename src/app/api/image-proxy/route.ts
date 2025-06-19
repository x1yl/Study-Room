import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing image URL", { status: 400 });
  }

  // Validate that the URL is from allowed sources to prevent abuse
  const allowedDomains = [
    "https://cdn.discordapp.com/",
    "https://lh3.googleusercontent.com/",
    "https://lh4.googleusercontent.com/",
    "https://lh5.googleusercontent.com/",
    "https://lh6.googleusercontent.com/",
  ];

  const isAllowedUrl = allowedDomains.some((domain) =>
    imageUrl.startsWith(domain),
  );

  if (!isAllowedUrl) {
    return new NextResponse("Invalid image source", { status: 400 });
  }

  try {
    // Fetch the image from the provider
    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Study-Room-App/1.0",
        // Add referer for Google images
        ...(imageUrl.includes("googleusercontent.com") && {
          Referer: "https://accounts.google.com/",
        }),
      },
    });

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", {
        status: response.status,
      });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") ?? "image/png";

    // Create response with aggressive caching headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800", // 1 day cache, 1 week stale
        "CDN-Cache-Control": "public, max-age=86400",
        "Vercel-CDN-Cache-Control": "public, max-age=86400",
        Expires: new Date(Date.now() + 86400 * 1000).toUTCString(), // 1 day from now
        ETag: `"${Buffer.from(imageUrl).toString("base64")}"`,
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
