import { NextRequest, NextResponse } from "next/server";
import { userdb } from "@/lib/userdb";

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    const db = await userdb();

    // Parse the request body
    const url = new URL(request.url);
    const filterName = url.searchParams.get('filterName');
    const filterBranch = url.searchParams.get('filterBranch');
    const filterProgramme = url.searchParams.get('filterProgramme');
    const filterYear = url.searchParams.get('filterYear');
    const role = url.searchParams.get('role');

    // Construct the query based on filters
    const query: Record<string, any> = {};
    if (filterName) query.Name = filterName;
    if (filterBranch) query.Branch = filterBranch;
    if (filterProgramme) query.Degree = filterProgramme;

    // Convert the filterYear to double if it's provided
    if (filterYear) query.year_of_Graduation = parseFloat(filterYear);

    // Determine the projection based on role
    const projection = role === 'user' ? { phone: 0 } : {}; // Exclude phone for 'user'
    console.log(query);

    // Fetch data from MongoDB based on query and projection
    const results = await db.collection('AlumniData').find(query, { projection }).toArray();

    // Return the filtered results in JSON format
    return NextResponse.json({ data: results }, { status: 200 });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    const { email, updated_status, contactedby } = body;

    // Validate input
    if (!email || !updated_status || !contactedby) {
      return NextResponse.json({ error: 'Email, updated_status, and contactedby are required' }, { status: 400 });
    }

    // Connect to the database
    const db = await userdb();
    const AlumniData = db.collection('AlumniData');

    // Find the alumni record by email
    const alumni = await AlumniData.findOne({ "email" :  email });
    if (!alumni) {
      return NextResponse.json({ error: 'Alumni not found' }, { status: 404 });
    }

    // Update both `status` and `contactedby` regardless of the previous state
    if(alumni.status == "not contacted"){
    await AlumniData.updateOne(
      { "email" : email },
      {
        $set: {
          status: updated_status,
          contacted_by : contactedby,
        },
      }
    );
  }

  else if(updated_status == "not contacted"){
    await AlumniData.updateOne(
      { "email" : email },
      {
        $set: {
          status: updated_status,
          contacted_by : "",
        },
      }
    );
  }
  else{
    await AlumniData.updateOne(
      { "email" : email },
      {
        $set: {
          status: updated_status,
        },
      }
    );
  }

    // Respond with success
    return NextResponse.json({ message: 'Alumni data updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating alumni data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


