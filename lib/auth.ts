import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          console.log("[AUTH] attempt:", credentials.email);
          const user = await db.user.findUnique({
            where: { email: credentials.email as string },
          });
          console.log("[AUTH] user found:", !!user, user ? { id: user.id, role: user.role } : null);
          if (!user) return null;
          const valid = await bcrypt.compare(credentials.password as string, user.password);
          console.log("[AUTH] password valid:", valid);
          if (!valid) return null;
          return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch (e) {
          console.error("[AUTH] error:", e);
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      (session.user as { role?: string }).role = token.role as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
