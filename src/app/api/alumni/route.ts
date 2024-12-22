import { alumdata } from '../../protected/columns' // Adjust the import path if needed
import { NextRequest, NextResponse } from "next/server";
import { userdb } from "@/lib/userdb";
export async function GET(request: NextRequest) {
    
    const db = await userdb();

    const body = await request.json();
    const { filterName , filterBranch , filterProgramme , filterYear , role } = body;

    const query: Record<string, any> = {};

    if (filterName) query.name = filterName;
    if (filterBranch) query.branch = filterBranch;
    if (filterProgramme) query.programme = filterProgramme;
    if (filterYear) query.year = filterYear;


    
      const projection = role === 'user' ? { phone: 0 } : {};        


    const results = await db.collection('AlumniData').find(query, { projection }).toArray();
  


  
}