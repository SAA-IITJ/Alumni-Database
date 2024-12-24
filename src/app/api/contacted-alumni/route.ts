// app/api/contacted-alumni/route.ts

import { NextRequest, NextResponse } from "next/server";
import { userdb } from "@/lib/userdb";
import { getServerSession } from "next-auth";

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user's sessio

    // Connect to the database
    const db = await userdb();

    // Parse the request URL parameters
    const url = new URL(request.url);
    const filterName = url.searchParams.get('filterName');
    const filterBranch = url.searchParams.get('filterBranch');
    const filterProgramme = url.searchParams.get('filterProgramme');
    const filterYear = url.searchParams.get('filterYear');
    const user = url.searchParams.get('name');
    
    // Construct the query based on filters
    const query: Record<string, any> = {
      // Always filter by contactedBy matching the current user's name
      contacted_by: user
    };
    
    // Add additional filters if they exist
    if (filterName) {
      query.Name = {
        $regex: filterName,
        $options: 'i'  // case-insensitive
      };
    }
    
    if (filterBranch) {
      query.Branch = {
        $regex: filterBranch,
        $options: 'i'
      };
    }
    
    if (filterProgramme) {
      query.Degree = {
        $regex: filterProgramme,
        $options: 'i'
      };
    }
    
    if (filterYear) {
      query.year_of_Graduation = parseFloat(filterYear);
    }
    
    console.log('Constructed query:', query);
    
    // Fetch the filtered results
    const results = await db.collection('AlumniData')
      .find(query)
      .toArray();
    
    return NextResponse.json(
      { 
        data: results,
        message: "Alumni data fetched successfully" 
      }, 
      { status: 200 }
    );
    
  } catch (error) {
    console.error('Error fetching contacted alumni:', error);
    return NextResponse.json(
      { error: "Failed to fetch alumni data" },
      { status: 500 }
    );
  }
}