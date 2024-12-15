// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMongoClient } from "@/lib/mongo";

export async function POST(request: NextRequest) {
  try {
    // Connect to the 'database_app' database
    const db = await getMongoClient();

    // Parse the request body
    const body = await request.json();
    const { name, email, role } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if a user with the given name already exists
    const existingUser = await db.collection("users").findOne({ name });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this name already exists" },
        { status: 409 }
      );
    }

    // Insert a new user into the 'users' collection
    const result = await db.collection("users").insertOne({ name, email, role });

    // Return success response
    return NextResponse.json(
      {
        message: "User created successfully",
        user: { id: result.insertedId, name, email, role },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("User creation error:", error);

    // Handle specific errors
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
