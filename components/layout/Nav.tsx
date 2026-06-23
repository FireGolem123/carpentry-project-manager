"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, BarChart2, Hammer, Menu } from "lucide-react";

const navLinks = [
  { href: "/", label: "Builds", icon: Hammer },
  { href: "/analytics", label: "Analytics", icon: BarChart2 },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className="sticky top-0 z-40 bg-primary text-primary-foreground border-b border-primary/20 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg tracking-tight">
          Build Log
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === href
                  ? "bg-primary-foreground/20"
                  : "hover:bg-primary-foreground/10"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="ml-2 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Mobile nav */}
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-primary-foreground hover:bg-primary-foreground/10 transition-colors">
              <Menu className="w-5 h-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={href}
                  onClick={() => router.push(href)}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={handleSignOut}
                variant="destructive"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
