import NextAuth, { NextAuthOptions, Session, Account, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { userdb } from "@/lib/userdb";
import { JWT } from "next-auth/jwt";

interface SignInParams {
  user: User;
  account: Account | null;
}

interface SessionParams {
  session: Session;
  token: JWT;
}

interface RedirectParams {
  baseUrl: string;
}

const isAllowedEmail = async (email: string): Promise<boolean> => {
  try {
    const db = await userdb();
    const existingUser = await db.collection("users").findOne({ email });
    return existingUser !== null;
  } catch (error) {
    console.error("Error checking allowed email:", error);
    return false;
  }
};

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async signIn({ user, account }: SignInParams) {
      if (account?.provider === "google" && user?.email) {
        return isAllowedEmail(user.email);
      }
      return false;
    },
    async session({ session, token }: SessionParams) {
      if (session.user) {
        token.id = token.sub;
      }
      return session;
    },
    async redirect({ baseUrl }: RedirectParams) {
      return baseUrl;
    },
  },
  pages: {
    error: "/error",
  },
};

// Create and export the route handlers
const handler = NextAuth(authOptions);
export const GET = handler;
export const POST = handler;