import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const BACKEND_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

async function exchangeGoogleToken(idToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: idToken }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { access_token: string };
    return data.access_token ?? null;
  } catch {
    return null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: { params: { scope: "openid email profile" } },
    }),
  ],
  pages: {
    signIn: "/sign-in",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) token.id = user.id;
      if (account?.id_token) {
        const backendToken = await exchangeGoogleToken(account.id_token);
        if (backendToken) token.backendToken = backendToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) session.user.id = String(token.id);
      if (session.user && token.backendToken) session.user.backendToken = String(token.backendToken);
      return session;
    },
    authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isOnPublicPath =
        nextUrl.pathname === "/" ||
        nextUrl.pathname.startsWith("/sign-in") ||
        nextUrl.pathname.startsWith("/api/auth");
      if (isOnPublicPath) return true;
      return isLoggedIn;
    },
  },
});
