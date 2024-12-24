"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button"
import { Row } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type alumdata = {
  id: string
  name: string
  status: "in contact" | "ghosted" | "never contacted" | "failed"
  programme: string
  passing_year: string
  branch: string
  contactedBy: string
  email: string
}

async function updateStatus(
  email: string | undefined | null,
  updated_status: string | undefined | null,
  contactedby: string | undefined | null,
  role: string | undefined | null,
) {
  console.log(email);
  try {
    const response = await fetch('/api/alumni', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        updated_status,
        contactedby,
        role
      }),
    });

    console.log('Response:', response);

    if (!response.ok) {
      const errorResponse = await response.json();
      throw new Error(errorResponse.error || 'Failed to update alumni data');
    }

    const result = await response.json();
    console.log('Result:', result);

    window.location.reload();
    return result.message;
  } catch (error) {
    console.error('Error updating alumni data:', error);
    throw error; // Re-throw error to propagate it
  }
}
const fetchUserRole = async (email: string) => {
  try {
    const response = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    const userData = await response.json();
    return userData.user.role;
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};

interface ActionCellProps {
  row: Row<alumdata>;
}

const ActionCell = ({ row }: ActionCellProps) => {
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const alum = row.original;

  useEffect(() => {
    const fetchRole = async () => {
      if (session?.user?.email) {
        const role = await fetchUserRole(session.user.email);
        setUserRole(role);
      }
    };

    fetchRole();
  }, [session?.user?.email]);

  const handleStatusUpdate = async (status: string) => {
    try {
      setErrorMessage(null); // Clear previous errors
      await updateStatus(
        alum.email,
        status,
        session?.user?.name,
        userRole
      );
    } catch (error: any) {
      setErrorMessage(error.message); // Set error message
    }
  };

  return (
    <div>
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
          onClick={() => handleStatusUpdate("in contact")}
        >
          contacted
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleStatusUpdate("ghosted")}
        >
          ghosted
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleStatusUpdate("not contacted")}
        >
           not contacted
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {errorMessage && (
      <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
    )}
  </div>
  );
};

export const columns: ColumnDef<alumdata>[] = [
  {
    id: "serialNumber",
    header: () => <div className="text-left font-medium">S.No</div>,
    cell: ({ table, row }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      const rowIndex = table.getFilteredRowModel().rows.findIndex(r => r.id === row.id);
      return <div>{rowIndex + 1}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ActionCell row={row} />
  },
  {
    accessorKey: "Name",
    header: () => (
      <div className="text-left font-medium">Name</div>
    ),
  },
  {
    accessorKey: "year_of_Graduation",
    header: () => (
      <div className="text-left font-medium">Passing Year</div>
    ), 
  },
  {
    accessorKey: "Degree",
    header: () => (
      <div className="text-left font-medium">Programme</div>
    ),
  },
  {
    accessorKey: "Branch",
    header: () => (
      <div className="text-left font-medium">Branch</div>
    ),
  },
  {
    accessorKey: "status",
    header: () => (
      <div className="text-left font-medium">Status</div>
    ),
  },
  {
    accessorKey:"contacted_by",
    header: () => (
      <div className="text-left font-medium">Contacted by</div>
    ),
  },
  {
    accessorKey:"email",
    header: () => (
      <div className="text-left font-medium">E mail</div>
    ),
  },
  {
    accessorKey:"Phone",
    header: () => (
      <div className="text-left font-medium">Phone Number</div>
    ),
  }
];
