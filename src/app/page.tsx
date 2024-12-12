"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {!session ? (
        <div>
          <h1>Welcome to Google Authentication</h1>
          <button
            onClick={() => signIn("google")}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4285F4",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Sign in with Google
          </button>
        </div>
      ) : (
        <div>
          <h1>Welcome, {session.user?.name}!</h1>
          <img
            src={session.user?.image || ""}
            alt={session.user?.name || "Profile Picture"}
            width={100}
            style={{ borderRadius: "50%" }}
          />
          <p>Email: {session.user?.email}</p>
          <button
            onClick={() => signOut()}
            style={{
              padding: "10px 20px",
              backgroundColor: "#DB4437",
              color: "white",
              border: "none",
              borderRadius: "4px",
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
