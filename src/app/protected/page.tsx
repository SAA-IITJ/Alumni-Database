"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function ProtectedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [message, setMessage] = useState<string | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Call the API when the page loads if the user is authenticated
  useEffect(() => {
    const addUserToDatabase = async () => {
      if (status === "authenticated" && session?.user) {
        const { name, email } = session.user;
        const role = "user";

        try {
          const response = await fetch("/api/user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              role   
            }),
          });

          if (response.ok) {
            const result = await response.json();
            setMessage(`User data added: ${result.name}`);
          } else {
            const error = await response.json();
            setMessage(`Error: ${error.error}`);
          }
        } catch (err: unknown) {
          // Check if the error is an instance of Error
          if (err instanceof Error) {
            setMessage(`Error: ${err.message}`);
          } else {
            setMessage("An unknown error occurred");
          }
        }
      }
    };

    addUserToDatabase();
  }, [status, session]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Protected Page</h1>
      {session && <p>Welcome, {session.user?.name}!</p>}

      {message && <p>{message}</p>}
    </div>
  );
}
