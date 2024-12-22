"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Updated type to match the data structure
export type alumdata = {
  id: string
  name: string
  email: string
  currentRole: string
  requestedRole: string
  status?: "in contact" | "ghosted" | "never contacted" | "failed"
  programme?: string
  passing_year?: string
  branch?: string
  contactedBy?: string
}

// Function to handle the grant request
const handleGrantRequest = async (userData: alumdata) => {
  try {
    const response = await fetch('/api/admin', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        currentRole: userData.currentRole,
        requestedRole: userData.requestedRole,
        Validation: 'Approved'  // Approving the request
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to grant role');
    }

    const data = await response.json();
    alert(data.message); // Show success message
    // You might want to refresh the data here or update the UI
    window.location.reload(); // Simple reload to refresh the data

  } catch (error) {
    console.error('Error granting role:', error);
    alert(error instanceof Error ? error.message : 'Failed to grant role');
  }
};

export const columns: ColumnDef<alumdata>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const userData = row.original;
      return (
        <Button 
          variant="outline" 
          onClick={() => handleGrantRequest(userData)}
        >
          Grant
        </Button>
      )
    },
  },
  {
    accessorKey: "name",
    header: () => (
      <div className="text-left font-medium">Name</div>
    ),
  },
  {
    accessorKey: "currentRole",
    header: () => (
      <div className="text-left font-medium">Current role</div>
    ),
  },
  {
    accessorKey: "requestedRole",
    header: () => (
      <div className="text-left font-medium">Requested role</div>
    ),
  },
]