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
            <Button variant="outline">Grant</Button>

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
    accessorKey: "currentRole",
    header: (props) => (
      <div className="text-left font-medium">current role</div>
    ),
  },
  {
    accessorKey: "requestedRole",
    header: (props) => (
      <div className="text-left font-medium">Upgraded role</div>
    ),
  },
 

]
