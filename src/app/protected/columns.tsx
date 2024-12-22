"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type alumdata = {
  id: string
  name: string
  status: "in contact" | "ghosted" | "never contacted" | "failed"
  programme: string
  passing_year: string
  branch: string
  contactedBy: string
  email : string
}


async function updateStatus( email, updated_status, contactedby ) {
  console.log(email);
  try {
    
    // Make the PUT request to the API
    const response = await fetch('/api/alumni', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        updated_status,
        contactedby,
      }),
    });

    console.log('Response:', response);

    // Check if the response is not OK
    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || 'Failed to update alumni data');
    }

    // Parse the JSON response
    const result = await response.json();
    console.log('Result:', result);

    // Return the relevant data
    return result.message; // Return the success message
  } catch (error) {
    console.error('Error updating alumni data:', error);
    return null; // Return `null` to indicate failure
  }
}


export const columns: ColumnDef<alumdata>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const alum = row.original
      const { data: session } = useSession(); 
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>{
                    console.log(alum.email);
                    updateStatus(
                      alum.email,
                       "in contact",
                       session.user.name, // Replace with the actual user's name if available
                    )}}
                >
                  contacted
                </DropdownMenuItem>
                
                <DropdownMenuItem
                onClick={() =>
                  updateStatus(
                  alum.email,
                    "ghosted",
                     session.user.name, // Replace with the actual user's name if available
                  )}
                  >ghosted</DropdownMenuItem>
                <DropdownMenuItem
                onClick={() =>
                  updateStatus(
                    alum.email,
                     "not contacted",
                     session.user.name, // Replace with the actual user's name if available
                  )}
                  >not contacted</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
    },
  },
  {
    accessorKey: "Name",
    header: (props) => (
      <div className="text-left font-medium">Name</div>
    ),
  },
  {
    accessorKey: "year_of_Graduation",
    header: (props) => (
      <div className="text-left font-medium">Passing Year</div>
    ), 
  },
  {
    accessorKey: "Degree",
    header: (props) => (
      <div className="text-left font-medium">Programme</div>
    ),
  },
  {
    accessorKey: "Branch",
    header: (props) => (
      <div className="text-left font-medium">Branch</div>
    ),
  },
  {
    accessorKey: "status",
    header: (props) => (
      <div className="text-left font-medium">Status</div>
    ),
  },
  {
    accessorKey:"contacted_by",
    header: (props) => (
      <div className="text-left font-medium">Contacted by</div>
    ),
  },
  {
    accessorKey:"E-mail",
    header: (props) => (
      <div className="text-left font-medium">Contacted by</div>
    ),
  }

]