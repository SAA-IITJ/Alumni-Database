import { NextRequest, NextResponse } from "next/server";
import { userdb } from '@/lib/userdb';

export async function POST(request: NextRequest) {
  try {
    // Connect to the 'database_app' database
    const db = await userdb();

    // Parse the request body
    const body = await request.json();
    const { name, email, currentRole , requestedRole } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Check if a user with the given name already exists
    const existingUser = await db.collection("raiseRoleUpgrade").findOne({ name });
    if (existingUser) {
      return NextResponse.json(
        { error: "Request is already sent status pending" },
        { status: 409 }
      );
    }

    // Insert a new user into the 'users' collection
    const result = await db.collection("raiseRoleUpgrade").insertOne({ name, email, currentRole , requestedRole});

    // Return success response
    return NextResponse.json(
      {
        message: "request raised successfully",
        user: {name, email, currentRole , requestedRole },
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("error raising request:", error);

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

    // Fetch all documents from the 'raiseRoleUpgrade' collection
    const existingUsers = await db.collection("raiseRoleUpgrade").find({}).toArray();

    // Return a successful response with the data
    return NextResponse.json({ data: existingUsers }, { status: 200 });
  } catch (error) {
    // Return an error response with the error details
    return NextResponse.json(
      { 
        error: 'Error fetching all data',
        details: error instanceof Error ? error.message : error 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Request body:', body);

    const { name, email, currentRole, requestedRole, Validation } = body;


    const db = await userdb();
    const usersCollection = db.collection('users');
    const raiseRoleUpgradeCollection = db.collection('raiseRoleUpgrade');

    if (Validation === 'Approved') {
      // Update the user's role
      const updateResult = await usersCollection.updateOne(
        { name, email, role: currentRole }, // Filter to match the user
        { $set: { role: requestedRole } }   // Update the role
      );

      if (updateResult.matchedCount === 0) {
        return NextResponse.json(
          { error: 'User not found or role not updated' },
          { status: 404 }
        );
      }

      // Delete the corresponding record from `raiseRoleUpgrade`
      const deleteResult = await raiseRoleUpgradeCollection.deleteOne({
        name,
        email,
        requestedRole
      });

      if (deleteResult.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Request not found or already deleted' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: 'Role updated and request deleted successfully', updatedRole: requestedRole },
        { status: 200 }
      );
    } else {
      // If disapproved, delete the role upgrade request
      const deleteResult = await raiseRoleUpgradeCollection.deleteOne({
        name,
        email,
        requestedRole
      });

      if (deleteResult.deletedCount === 0) {
        return NextResponse.json(
          { error: 'Request not found or already deleted' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: 'Request disapproved and deleted successfully' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      {
        error: 'Error processing the request',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

