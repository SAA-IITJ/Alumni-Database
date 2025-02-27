"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { userData, columns } from "./columns"
import { DataTable } from "./data-table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "next-auth/react";

async function getData(): Promise<userData[]> {
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

  const [data, setData] = useState<userData[]>([]);
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
          const userData = await getData();
          setData(userData);
        } catch (err: unknown) {
          console.log(err);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDataAndAddUser();
  }, [status, session]);

  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({ message: '', type: '', show: false });

  const handleAddUser = async () => {
    if (!email.trim()) {
      setAlert({
        message: "Please enter a valid email.",
        type: 'error',
        show: true
      });
      return;
    }

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.status === 201) {
        setAlert({
          message: data.message || "User added successfully.",
          type: 'success',
          show: true
        });
        setEmail(''); // Clear the input on success
      } else {
        setAlert({
          message: data.error || "An error occurred.",
          type: 'error',
          show: true
        });
      }
    } catch (error) {
      setAlert({
        message: "Failed to connect to the server.",
        type: 'error',
        show: true
      });
      console.error("Error adding user:", error);
    }
  };

  const handleRoleUpgradeRequest = async (requestedRole: string) => {
    if (!session?.user?.name || !session?.user?.email || !userRole) {
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

      await response.json();
    } catch (error) {
      console.error("Error submitting role upgrade request:", error);
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
      <div>
        <h4 className="scroll-m-20 text-2xl ml-16 font-semibold tracking-tight">
          Add User to access database
        </h4>
      </div>
      <div className="ml-16 mt-4 flex items-center space-x-4">
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-64" />
        <Button variant="default" onClick={handleAddUser}>Add</Button>
      </div>
      {alert.show && (
          <Alert 
            variant={alert.type === 'error' ? 'destructive' : 'default'} 
            className="mb-4 mt-4"
          >
            <AlertDescription>
              {alert.message}
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
}