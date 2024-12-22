"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Show a loading state while the session is being checked
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to "/protected" if the user is signed in
  if (session) {
    router.push("/protected");
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-6 items-center justify-center min-h-screen")}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Login using your college ID to get the Alumni Database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <Button className="w-full" onClick={() => signIn("google")}>
              Login with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            In case of any concern, contact{" "}
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=saa@iitj.ac.in"
              className="underline underline-offset-4"
            >
              saa@iitj.ac.in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
