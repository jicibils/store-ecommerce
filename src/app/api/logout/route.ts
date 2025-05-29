// /src/app/api/logout/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  await supabase.auth.signOut();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || new URL("/", req.url).origin;

  return NextResponse.redirect(new URL("/admin/login", siteUrl));
}
