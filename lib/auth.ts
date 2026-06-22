import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
          const { data, error } = await supabase
            .from("User")
            .select("*")
            .eq("email", credentials.email as string)
            .maybeSingle();
          console.log("[AUTH] query result:", !!data, error?.message || "ok");
          if (error || !data) return null;
          const valid = await bcrypt.compare(
            credentials.password as string,
            data.password
          );
          console.log("[AUTH] password valid:", valid);
          if (!valid) return null;
          return { id: data.id, name: data.name, email: data.email, role: data.role };
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
        token.id = (user as { id?: string }).id;
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
