import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const filePath = Array.isArray(params.path)
    ? params.path.join("/")
    : params.path;

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    return new NextResponse("Missing Supabase URL", { status: 500 });
  }

  const imageUrl = `${baseUrl}/storage/v1/object/public/${filePath}`;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const contentType = response.headers.get("content-type") || "image/webp";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
