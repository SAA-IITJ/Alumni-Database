"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { alumdata, columns } from "./columns"
import { DataTable } from "./data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Moon, MoonIcon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react";
async function getData(): Promise<any[]> {
    try {
      const response = await fetch('/api/admin', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(response);
  
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
  
      const result = await response.json();
      return result.data; // Extract the 'data' field from the response
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }

export default function ProtectedPage() {
  const { setTheme } = useTheme()
  const { data: session, status } = useSession();
  const router = useRouter();

  const [message, setMessage] = useState<string | null>(null);
  const [data, setData] = useState<alumdata[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect unauthenticated users
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Fetch alumni data and add user to database
  useEffect(() => {
    const fetchDataAndAddUser = async () => {
      if (status === "authenticated" && session?.user) {
        const { name, email } = session.user;
        const role = "user";

        try {
          // Add user to database
          const userResponse = await fetch("/api/user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              role   
            }),
          });

          if (userResponse.ok) {
            const result = await userResponse.json();
            setMessage(`User data added: ${result.name}`);
          } else {
            const error = await userResponse.json();
            setMessage(`Error: ${error.error}`);
          }

          // Fetch alumni data
          setIsLoading(true);
          const alumniData = await getData();
          setData(alumniData);
          setIsLoading(false);

        } catch (err: unknown) {
          setIsLoading(false);
          if (err instanceof Error) {
            setMessage(`Error: ${err.message}`);
          } else {
            setMessage("An unknown error occurred");
          }
        }
      }
    };

    fetchDataAndAddUser();
  }, [status, session]);

  // Loading state
  if (status === "loading" || isLoading) {
    return <p>Loading...</p>;
  }



  return (
    <div>
    <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="scroll-m-20 pb-2 ml-16 text-3xl font-semibold tracking-tight first:mt-8">
        The Alumni Database
        </h2>
        <h3 className="scroll-m-20 border-b-2 text-2xl ml-16 font-semibold tracking-tight">
          Welcome {session.user?.name}!
        </h3>
      </div>
      <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between mr-32 mt-8">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="ml-auto">
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem >Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
      </DropdownMenu>


        <div className="ml-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </div>
    </div>
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
    </div>
  );
}