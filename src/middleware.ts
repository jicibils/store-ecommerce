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

// middleware.ts  (en la raíz o en src/)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Dejar pasar assets del framework y archivos comunes
  if (
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  ) {
    return NextResponse.next();
  }

  // --- ADMIN ---
  if (pathname.startsWith("/admin")) {
    // Permitir login sin sesión
    if (pathname.startsWith("/admin/login")) {
      return NextResponse.next();
    }

    // Resto de /admin requiere sesión Supabase
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return res; // autenticado ⇒ ok
  }

  // --- TODO lo que NO es /admin => 403 ---
  return new NextResponse("Forbidden", { status: 403 });
}

export const config = {
  matcher: ["/:path*"], // aplica a todo
};
