import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Routes that require an authenticated user
const AUTH_REQUIRED = [
  "/profile",
  "/book-listener",
  "/payment",
  "/chat-queue",
  "/session",
];

// Auth pages — redirect signed-in users away
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.cookies.toString());
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Refresh session so route handlers see a valid token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  // Authenticated users should not stay on auth pages
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // Protect routes that require login
  if (!user && AUTH_REQUIRED.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
