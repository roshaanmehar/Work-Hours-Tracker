"use client"

import { Clock, Calendar, BarChart2, Settings, Shield } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const isAdmin = true // This would be determined by authentication in a real app

  // Determine active page from pathname
  const getIsActive = (path: string) => pathname === path

  return (
    <Sidebar variant="floating" className="border-none">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center justify-center p-2">
          <h1 className="text-lg font-bold text-e5b80b">TIME TRACKER</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={getIsActive("/")}>
                  <Link href="/">
                    <Clock className="mr-2" />
                    <span>Track</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={getIsActive("/history")}>
                  <Link href="/history">
                    <Calendar className="mr-2" />
                    <span>History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={getIsActive("/analytics")}>
                  <Link href="/analytics">
                    <BarChart2 className="mr-2" />
                    <span>Stats</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={getIsActive("/settings")}>
                  <Link href="/settings">
                    <Settings className="mr-2" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={getIsActive("/admin")}>
                    <Link href="/admin">
                      <Shield className="mr-2" />
                      <span>Admin</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <div className="p-2 text-xs text-center text-sidebar-foreground/60">Pixel Time Tracker v1.0</div>
      </SidebarFooter>
    </Sidebar>
  )
}
