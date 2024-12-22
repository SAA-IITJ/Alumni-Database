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
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react";

async function getData(filters: any, role: string): Promise<alumdata[]> {
  try {
    const queryParams = new URLSearchParams({
      filterName: filters.filterName || '',
      filterBranch: filters.filterBranch || '',
      filterProgramme: filters.filterProgramme || '',
      filterYear: filters.filterYear || '',
      role: role
    });

    const response = await fetch(`/api/alumni?${queryParams.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch alumni data');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching alumni data:', error);
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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    filterName: '',
    filterBranch: '',
    filterProgramme: '',
    filterYear: ''
  });

  const fetchUserRole = async (email: string) => {
    try {
      const response = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setUserRole(userData.user.role);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

    // Effect for authentication check and fetching user role
    useEffect(() => {
      if (status === "unauthenticated") {
        router.push("/");
      } else if (status === "authenticated" && session?.user?.email) {
        fetchUserRole(session.user.email);
      }
    }, [status, router, session]);

  // Effect for authentication check  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Function to handle filter button click
  const handleFilterClick = async () => {
    if (status === "authenticated") {
      console.log("started");
      setIsLoading(true);
      const role = "user"; // Or get from session if you have role information
      const filteredData = await getData(filters, role);
      setData(filteredData);
      setIsLoading(false);
      console.log(filteredData);
    }
  };

  // Initial data fetch
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

          // Fetch initial alumni data with empty filters
          setIsLoading(true);
          const alumniData = await getData({
            filterName: '',
            filterBranch: '',
            filterProgramme: '',
            filterYear: ''
          }, role);
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

  const handleRoleUpgradeRequest = async (requestedRole: string) => {
    if (!session?.user?.name || !session?.user?.email || !userRole) {
      setMessage("Missing user information");
      return;
    }

    try {
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: session.user.name,
          email: session.user.email,
          currentRole: userRole,
          requestedRole: requestedRole
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`Role upgrade request to ${requestedRole} submitted successfully`);
      } else {
        setMessage(data.error || "Failed to submit role upgrade request");
      }
    } catch (error) {
      console.error("Error submitting role upgrade request:", error);
      setMessage("Error submitting role upgrade request");
    }
  };


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
              <DropdownMenuItem >
                <DropdownMenu>
                  <DropdownMenuTrigger>
                      Change Role
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Current Role: {userRole}</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={() => handleRoleUpgradeRequest('master')}>Request for Master</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleUpgradeRequest('admin')}>Request for Admin</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </DropdownMenuItem>
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
        <div className="flex items-center py-4 gap-4">
          <Input
            placeholder="Filter names..."
            value={filters.filterName}
            onChange={(event) =>
              setFilters(prev => ({ ...prev, filterName: event.target.value }))
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filter Branch..."
            value={filters.filterBranch}
            onChange={(event) =>
              setFilters(prev => ({ ...prev, filterBranch: event.target.value }))
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filter Programme..."
            value={filters.filterProgramme}
            onChange={(event) =>
              setFilters(prev => ({ ...prev, filterProgramme: event.target.value }))
            }
            className="max-w-sm"
          />
          <Input
            placeholder="Filter Year..."
            value={filters.filterYear}
            onChange={(event) =>
              setFilters(prev => ({ ...prev, filterYear: event.target.value }))
            }
            className="max-w-sm"
          />
          <Button onClick={handleFilterClick}>Filter</Button>
        </div>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}