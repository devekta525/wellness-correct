import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getDashboardForRole } from "@/lib/utils/auth";

// Define protected routes and their required roles
const protectedRoutes = {
  "/dashboard": ["admin", "super_admin"],
  "/dashboard/blogs": ["admin", "super_admin"],
  "/dashboard/categories": ["admin", "super_admin"],
  "/dashboard/products": ["admin", "super_admin"],
  "/dashboard/users": ["admin", "super_admin"],
  "/dashboard/customers": ["admin", "super_admin"],
  "/dashboard/doctors": ["admin", "super_admin"],
  "/dashboard/influencers": ["admin", "super_admin"],
  "/dashboard/leads": ["admin", "super_admin"],
  "/dashboard/reviews": ["admin", "super_admin"],
  "/dashboard/orders": ["admin", "super_admin"],
  "/dashboard/appointments": ["admin", "super_admin"],
  "/dashboard/settings": ["admin", "super_admin"],
  "/doctors": ["doctor", "admin", "super_admin"],
  "/influencers": ["influencer", "admin", "super_admin"],
  "/profile": ["user", "admin", "doctor", "influencer", "super_admin"],
};

// Public routes that don't require authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/cookie-policy",
  "/products",
  "/product",
  "/our-doctors",
  "/book-appointment",
  "/science",
  "/collab",
  "/shop",
  "/api",
  "/_next",
  "/favicon.ico",
  "/public/*",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Get token and user data from cookies
  const tokenCookie = request.cookies.get("token");
  const userCookie = request.cookies.get("user");
  let user = null;
  let token = null;

  if (userCookie) {
    try {
      user = JSON.parse(userCookie.value);
    } catch (error) {
      console.error("Error parsing user cookie:", error);
      // Clear invalid cookies
      const response = NextResponse.next();
      response.cookies.delete("user");
      response.cookies.delete("token");
      return response;
    }
  }

  if (tokenCookie) {
    token = tokenCookie.value;
  }

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // If user is not authenticated and trying to access protected route
  if ((!user || !token) && !isPublicRoute) {
    // Only redirect to login if not already on login page to prevent loops
    if (pathname !== "/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // If user is authenticated
  if (user && token) {
    // If trying to access login/signup while already logged in, redirect to appropriate dashboard
    if (pathname === "/login" || pathname === "/signup") {
      const redirectParam = request.nextUrl.searchParams.get("redirect");
      const normalizedRedirect =
        redirectParam && redirectParam.startsWith("/") ? redirectParam : null;
      const dashboardUrl = getDashboardForRole(user.role);

      // Prefer a safe redirect target if provided, otherwise role dashboard
      const targetUrl = normalizedRedirect || dashboardUrl;

      // Prevent redirect loop by checking if we're already going to the right place
      if (pathname !== targetUrl) {
        return NextResponse.redirect(new URL(targetUrl, request.url));
      }
    }

    // Check if user has access to the current route
    const routeAccess = Object.entries(protectedRoutes).find(([route]) =>
      pathname.startsWith(route),
    );

    if (routeAccess) {
      const [route, allowedRoles] = routeAccess;

      if (
        !allowedRoles
          .map((role) => role.toLowerCase())
          .includes(user.role.toLowerCase())
      ) {
        // User doesn't have access to this route, redirect to their dashboard
        const dashboardUrl = getDashboardForRole(user.role);
        // Prevent redirect loop
        if (pathname !== dashboardUrl) {
          return NextResponse.redirect(new URL(dashboardUrl, request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
