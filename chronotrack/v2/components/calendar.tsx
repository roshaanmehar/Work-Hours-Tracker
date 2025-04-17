import { Check, ChevronRight, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar"

interface CalendarsProps {
  calendars: {
    name: string
    items: string[]
  }[]
}

export function Calendars({ calendars }: CalendarsProps) {
  return (
    <div className="space-y-1 px-2 py-2">
      <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Calendars</h2>
      {calendars.map((calendar) => (
        <Collapsible key={calendar.name} defaultOpen>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-2">
              <span>{calendar.name}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenu>
              {calendar.items.map((item) => (
                <SidebarMenuItem key={item}>
                  <SidebarMenuButton>
                    <Check className="h-4 w-4" />
                    <span>{item}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Plus className="h-4 w-4" />
                  <span>Add New</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}
