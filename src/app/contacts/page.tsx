"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { alumdata, columns } from "./columns"
import { DataTable } from "./data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Moon, Sun } from "lucide-react"
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

interface FilterParams {
  filterName: string;
  filterBranch: string;
  filterProgramme: string;
  filterYear: string;
}

async function getData(filters: FilterParams, userName: string | null ,role : string | null): Promise<alumdata[]> {
  if (!userName) return [];
  
  try {
    const queryParams = new URLSearchParams({
      filterName: filters.filterName || '',
      filterBranch: filters.filterBranch || '',
      filterProgramme: filters.filterProgramme || '',
      filterYear: filters.filterYear || '',
      name: userName,
      role: role || 'user',  
    });

    const response = await fetch(`/api/contacted-alumni?${queryParams.toString()}`, {
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
  const [data, setData] = useState<alumdata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterParams>({
    filterName: '',
    filterBranch: '',
    filterProgramme: '',
    filterYear: '',
  });

  // Store username in a ref to avoid unnecessary re-renders
  const userNameRef = useRef<string | null>(null);

  // Update username ref when session changes
  useEffect(() => {
    if (session?.user?.name) {
      userNameRef.current = session.user.name;
      // Trigger initial data fetch when username becomes available
      debouncedFetch(filters);
    }
  }, [session?.user?.name]);

  // Debounced filter function
  const debouncedFetch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (filters: FilterParams) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          if (!userNameRef.current) return;
          
          setIsLoading(true);
          const alumniData = await getData(filters, userNameRef.current, userRole);
          setData(alumniData);
          setIsLoading(false);
        }, 300);
      };
    })(),
    []
  );

  // Handle filter changes with debouncing
  useEffect(() => {
    if (userNameRef.current) {
      debouncedFetch(filters);
    }
  }, [filters, debouncedFetch]);

  // Session-dependent operations
  useEffect(() => {
    const initializeUserData = async () => {
      if (status === "unauthenticated") {
        router.push("/");
        return;
      }

      if (status === "authenticated" && session?.user?.email) {
        try {
          const { name, email } = session.user;
          await fetch("/api/user", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name,
              email,
              role: "user"
            }),
          });

          const response = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
          if (response.ok) {
            const userData = await response.json();
            setUserRole(userData.user.role);
          }
        } catch (err) {
          console.error('Error initializing user data:', err);
        }
      }
    };

    initializeUserData();
  }, [status, session, router]);

  const handleRoleUpgradeRequest = async (requestedRole: string) => {
    if (!session?.user?.name || !session?.user?.email || !userRole) {
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
          requestedRole: requestedRole,
        }),
      });

      if (response.ok && session?.user?.email) {
        const userData = await response.json();
        setUserRole(userData.user.role);
      }
    } catch (error) {
      console.error("Error submitting role upgrade request:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="scroll-m-20 pb-2 ml-16 text-3xl font-semibold tracking-tight first:mt-8">
            Your Contacted Alumni
          </h2>
          <h3 className="scroll-m-20 border-b-2 text-2xl ml-16 font-semibold tracking-tight">
            Welcome {session?.user?.name}!
          </h3>
        </div>
        <div className="flex flex-col items-start md:flex-row md:items-center md:justify-between mr-32 mt-8">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar className="ml-auto">
                <AvatarImage src={session?.user?.image ?? undefined} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/protected')}>
                Alumni Database
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/contacts')}>
                Your Contacts
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    Change Role
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Current Role: {userRole}</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuItem onClick={() => handleRoleUpgradeRequest('master')}>
                      Request for Master
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleUpgradeRequest('admin')}>
                      Request for Admin
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </DropdownMenuItem>
              {userRole === 'admin' && (
                <DropdownMenuItem onClick={() => router.push('/Profile')}>
                  Profile
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => signOut()}>
                Logout
              </DropdownMenuItem>
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
            placeholder="Filter Programme..."
            value={filters.filterProgramme}
            onChange={(event) =>
              setFilters(prev => ({ ...prev, filterProgramme: event.target.value }))
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
            placeholder="Filter Year..."
            value={filters.filterYear}
            onChange={(event) =>
              setFilters(prev => ({ ...prev, filterYear: event.target.value }))
            }
            className="max-w-sm"
          />
        </div>
        {data.length > 0 ? (
          <DataTable columns={columns} data={data} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            No records found. You haven't contacted any alumni yet.
          </div>
        )}
      </div>
    </div>
  );
}