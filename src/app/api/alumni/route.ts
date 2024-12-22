
import { NextRequest, NextResponse } from "next/server";
import { userdb } from "@/lib/userdb";

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    const db = await userdb();

    // Parse the request body
    const body = await request.json();
    const { filterName, filterBranch, filterProgramme, filterYear, role } = body;

    // Construct the query based on filters
    const query: Record<string, any> = {};
    if (filterName) query.name = filterName;
    if (filterBranch) query.branch = filterBranch;
    if (filterProgramme) query.programme = filterProgramme;
    if (filterYear) query.year = filterYear;

    // Determine the projection based on role
    const projection = role === 'user' ? { phone: 0 } : {}; // Exclude phone for 'user'

    // Fetch data from MongoDB based on query and projection
    const results = await db.collection('AlumniData').find(query, { projection }).toArray();

    // Transform results into key-value pair JSON objects
    const formattedResults = results.map(item => ({ ...item }));

    // Return the filtered results in JSON format
    return NextResponse.json({ data: formattedResults }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
