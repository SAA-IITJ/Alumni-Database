"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { alumdata, columns } from "./columns"
import { DataTable } from "./data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Moon, Sun } from "lucide-react"
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

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const result = await response.json();
    return result.data;
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
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchUserRole = async (email: string) => {
    try {
      const response = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await response.json();
      setUserRole(userData.user.role);
      return userData.user.role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
      return null;
    }
  };

  // Check authentication and admin role
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    const checkUserRole = async () => {
      if (session?.user?.email) {
        const role = await fetchUserRole(session.user.email);
        if (role !== "admin") {
          router.push("/protected");
        }
      }
    };

    checkUserRole();
  }, [status, session, router]);

  // Fetch data and add user
  useEffect(() => {
    const fetchDataAndAddUser = async () => {
      if (status === "authenticated" && session?.user) {
        const { name, email } = session.user;
        const role = "user";

        try {
          // Add user to database
          await fetch("/api/user", {
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

          // Fetch alumni data
          const alumniData = await getData();
          setData(alumniData);
        } catch (err: unknown) {
          if (err instanceof Error) {
            setMessage(`Error: ${err.message}`);
          } else {
            setMessage("An unknown error occurred");
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDataAndAddUser();
  }, [status, session]);

  const handleRoleUpgradeRequest = async (requestedRole: string) => {
    if (!session?.user?.name || !session?.user?.email || !userRole) {
      setMessage("Missing user information");
      return;
    }

    try {
      const response = await fetch("/api/admin", {
        method: "PUT",
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

      const result = await response.json();

      if (response.ok) {
        setMessage(`Role upgrade request to ${requestedRole} submitted successfully`);
      } else {
        setMessage(result.error || "Failed to submit role upgrade request");
      }
    } catch (error) {
      console.error("Error submitting role upgrade request:", error);
      setMessage("Error submitting role upgrade request");
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (status !== "authenticated" || userRole !== "admin") {
    return null;
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
              <DropdownMenuItem onClick={() => router.push('/protected')}>
                Alumni Database
              </DropdownMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem className="cursor-pointer">
                    Change Role
                  </DropdownMenuItem>
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
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}