"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

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
}

export const columns: ColumnDef<alumdata>[] = [
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original
 
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(payment.id)}
                >
                  Copy payment ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View customer</DropdownMenuItem>
                <DropdownMenuItem>View payment details</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
    },
  },
  {
    accessorKey: "name",
    header: (props) => (
      <div className="text-left font-medium">Name</div>
    ),
  },
  {
    accessorKey: "passing_year",
    header: (props) => (
      <div className="text-left font-medium">Passing Year</div>
    ), 
  },
  {
    accessorKey: "programme",
    header: (props) => (
      <div className="text-left font-medium">Programme</div>
    ),
  },
  {
    accessorKey: "branch",
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
    accessorKey:"contactedBy",
    header: (props) => (
      <div className="text-left font-medium">Contacted by</div>
    ),
  }

]
