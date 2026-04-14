import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuthPage = req.nextUrl.pathname === "/";
    const isPanel = req.nextUrl.pathname.startsWith("/panel");
    const isResetPassword = req.nextUrl.pathname.startsWith("/auth/reset-password");

    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/panel", req.url));
    }

    if (!token && (isPanel || isResetPassword)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Şifre değişim kontrolü (6 aylık periyot)
    if (token && isPanel) {
      if (!token.passwordVerifiedAt) {
          return NextResponse.redirect(new URL("/auth/reset-password", req.url));
      }
      
      const verifiedAt = new Date(token.passwordVerifiedAt as string);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      if (verifiedAt < sixMonthsAgo) {
        return NextResponse.redirect(new URL("/auth/reset-password", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Yetkilendirme mantığını yukarıdaki middleware fonksiyonuna bıraktık
    },
  }
);

export const config = {
  matcher: ["/", "/panel/:path*", "/auth/reset-password"],
};
