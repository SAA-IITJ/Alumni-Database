import { NextRequest, NextResponse } from 'next/server'
import { alumdata } from '../../protected/columns' // Adjust the import path if needed

export async function GET(request: NextRequest) {
  // Mock data - replace with actual database query
  const alumni: alumdata[] = [
    {
      id: "728ed52f",
      name: "aditya",
      passing_year: "2022",
      programme: "B.Tech",
      branch: "Electrical",
      status: "in contact",
      contactedBy: "John Doe"
    },
    {
      id: "729ed53f", 
      name: "jack1",
      passing_year: "2023",
      programme: "M.Tech",
      branch: "Computer Science",
      status: "never contacted",
      contactedBy: "Jane Smith"
    },
    {
        id: "729ed53f", 
        name: "jack2",
        passing_year: "2023",
        programme: "M.Tech",
        branch: "Computer Science",
        status: "never contacted",
        contactedBy: "Jane Smith"
      },
      {
        id: "729ed53f", 
        name: "jack3",
        passing_year: "2023",
        programme: "M.Tech",
        branch: "Computer Science",
        status: "never contacted",
        contactedBy: "Jane Smith"
      },
      {
        id: "729ed53f", 
        name: "jack3",
        passing_year: "2023",
        programme: "M.Tech",
        branch: "Computer Science",
        status: "never contacted",
        contactedBy: "Jane Smith"
      },
      {
        id: "729ed53f", 
        name: "jack4",
        passing_year: "2023",
        programme: "M.Tech",
        branch: "Computer Science",
        status: "never contacted",
        contactedBy: "Jane Smith"
      },
      {
        id: "729ed53f", 
        name: "jack4",
        passing_year: "2023",
        programme: "M.Tech",
        branch: "Computer Science",
        status: "never contacted",
        contactedBy: "Jane Smith"
      },
      {
        id: "729ed53f", 
        name: "jack4",
        passing_year: "2023",
        programme: "M.Tech",
        branch: "Computer Science",
        status: "never contacted",
        contactedBy: "Jane Smith"
      },
      {
        id: "729ed53f", 
        name: "jack4",
        passing_year: "2023",
        programme: "M.Tech",
        branch: "Computer Science",
        status: "never contacted",
        contactedBy: "Jane Smith"
      },
      {
        id: "729ed53f", 
        name: "jack4",
        passing_year: "2023",
        programme: "M.Tech",
        branch: "Computer Science",
        status: "never contacted",
        contactedBy: "Jane Smith"
      },
      {
        id: "729ed53f", 
        name: "jack4",
        passing_year: "2023",
        programme: "M.Tech",
        branch: "Computer Science",
        status: "never contacted",
        contactedBy: "Jane Smith"
      },
      {
        id: "729ed53f", 
        name: "jack4",
        passing_year: "2023",
        programme: "M.Tech",
        branch: "Computer Science",
        status: "never contacted",
        contactedBy: "Jane Smith"
      },
      {
        id: "729ed53f", 
        name: "jack4",
        passing_year: "2023",
        programme: "M.Tech",
        branch: "Computer Science",
        status: "never contacted",
        contactedBy: "Jane Smith"
      },
    
  ];

  return NextResponse.json(alumni);
}