"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button"
import { Row } from "@tanstack/react-table";
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
  email: string
}

async function updateStatus(
  email: string | undefined | null,
  updated_status: string | undefined | null,
  contactedby: string | undefined | null
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
    return null;
  }
}

interface ActionCellProps {
  row: Row<alumdata>;
}

const ActionCell = ({ row }: ActionCellProps) => {
  const { data: session } = useSession();
  const alum = row.original;

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
          onClick={() => {
            console.log(alum.email);
            updateStatus(
              alum.email,
              "in contact",
              session?.user?.name
            )
          }}
        >
          contacted
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() =>
            updateStatus(
              alum.email,
              "ghosted",
              session?.user?.name
            )
          }
        >
          ghosted
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            updateStatus(
              alum.email,
              "not contacted",
              session?.user?.name
            )
          }
        >
           not contacted
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<alumdata>[] = [
  {
    id: "serialNumber",
    header: () => <div className="text-left font-medium">S.No</div>,
    cell: ({ table, row }) => {
      // Get the current page index
      const pageIndex = table.getState().pagination.pageIndex;
      // Get the page size
      const pageSize = table.getState().pagination.pageSize;
      // Get the index of the row within the current page's filtered/sorted data
      const rowIndex = table.getFilteredRowModel().rows.findIndex(r => r.id === row.id);
      // Calculate the serial number
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