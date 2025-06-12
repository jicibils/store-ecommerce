import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  _: NextRequest,
  context: { params: { path: string[] } }
) {
  const { params } = context;
  const filePath = params.path.join("/");
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!baseUrl) {
    console.error("❌ Faltante: NEXT_PUBLIC_SUPABASE_URL");
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
