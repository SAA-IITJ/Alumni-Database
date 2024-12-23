"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AuthError() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Only users with authorized email addresses (@iitj.ac.in) can access this application.
          </p>
          <p className="mb-6 text-sm">
            If you believe this is an error, please contact{" "}
            <a
              href="mailto:saa@iitj.ac.in"
              className="underline underline-offset-4"
            >
              saa@iitj.ac.in
            </a>
          </p>
          <Button
            onClick={() => router.push("/")}
            className="w-full"
          >
            Return to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}