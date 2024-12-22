// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { userdb } from "@/lib/userdb";

export async function POST(request: NextRequest) {
  try {
    // Connect to the 'database_app' database
    const db = await userdb();

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

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    const db = await userdb();

    // Get email from query parameters
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.collection("users").findOne({ "email" : email });

    // If user not found
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json(
      {
        message: "User found successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching user:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}


