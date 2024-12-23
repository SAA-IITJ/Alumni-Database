// api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { userdb } from "@/lib/userdb";


const isAllowedEmail = async (email: string): Promise<boolean> => {
  try {
    const db = await userdb(); // Ensure `userdb()` returns a valid database connection
    const existingUser = await db.collection("users").findOne({ email });
    return existingUser !== null; // Return true if the user exists, otherwise false
  } catch (error) {
    console.error("Error checking allowed email:", error);
    return false; // Handle errors gracefully
  }
};

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async signIn({ user, account }: any) {
      // Only allow sign in if email matches allowed patterns
      if (account?.provider === "google" && user?.email) {
        return isAllowedEmail(user.email);
      }
      return false;
    },
    async session({ session, token }: any) {
      session.user.id = token.sub;
      return session;
    },
    async redirect({ url, baseUrl }: any) {
      // Customize redirect behavior if needed
      return baseUrl;
    },
  },
  pages: {
    error: "/error", // Custom error page for unauthorized access
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };