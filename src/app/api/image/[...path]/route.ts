import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(_req: unknown, context: any) {
  const filePath = Array.isArray(context?.params?.path)
    ? context.params.path.join("/")
    : context.params.path;

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
  } catch (e) {
    console.error("Fetch error:", e);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
