// // middleware.ts
// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient({ req, res });

//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   // Si no hay usuario, redirigimos al login
//   if (!user) {
//     const loginUrl = new URL("/admin/login", req.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   return res;
// }

// export const config = {
//   matcher: ["/admin((?!/login).*)"],
// };

// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rutas permitidas sin login (ajusta a gusto)
  const publicPaths = ["/admin/login", "/healthz", "/api/public"];

  // Rutas de Next/Supabase que conviene dejar pasar
  const frameworkPaths = [
    "/_next",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
    "/auth", // si usás /auth/callback
  ];

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const isFramework = frameworkPaths.some((p) => pathname.startsWith(p));

  if (isPublic || isFramework) return NextResponse.next();

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/admin/login", req.url);
    loginUrl.searchParams.set("next", pathname); // para volver después del login
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

// Aplica a todo el sitio
export const config = {
  matcher: ["/((?!.*\\.).*)"], // ignora archivos estáticos *.png, *.js, etc.
};
