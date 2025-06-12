import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  _: NextRequest,
  { params }: { params: Record<string, string | string[]> }
) {
  const pathParam = params.path;

  if (!pathParam || typeof pathParam === "string") {
    return new NextResponse("Invalid image path", { status: 400 });
  }

  const filePath = pathParam.join("/");
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    return new NextResponse("Missing Supabase URL", { status: 500 });
  }

  const imageUrl = `${baseUrl}/storage/v1/object/public/${filePath}`;

  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      console.error("❌ Imagen no encontrada:", response.status);
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
  } catch (err) {
    console.error("❌ Error haciendo fetch a Supabase:", err);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
