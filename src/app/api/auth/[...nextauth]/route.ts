import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Session } from "node:inspector/promises";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET!,
  callbacks: {
    async session({ session, token }: any) {
      session.user.id = token.sub; // Attach Google user ID to session
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };