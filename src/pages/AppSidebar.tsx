import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "../components/ui/sidebar";

import { LayoutDashboardIcon, Users2Icon, Stethoscope, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { chatService } from "../modules/chat/services/chatService";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import { useLanguage } from "../language/useLanguage";
import strings from "../language";

function HamburgerTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      onClick={toggleSidebar}
      className="flex flex-col gap-0.5 p-0.5"
      aria-label="Toggle sidebar"
    >
      <span className="h-[2px] w-4 rounded-full bg-gray-500" />
      <span className="h-[2px] w-4 rounded-full bg-gray-500" />
      <span className="h-[2px] w-4 rounded-full bg-gray-500" />
    </button>
  );
}



export default function AppSidebar() {
  const { language } = useLanguage();
  const t = strings[language];
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const threads = await chatService.getThreads();
        const total = threads.reduce((acc, thread) => acc + (thread.unreadCount || 0), 0);
        setUnreadCount(total);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);
  return (
    <Sidebar
      collapsible="icon"
      variant="inset"
      className="top-14 h-[calc(100vh-3.5rem)] overflow-y-auto border-r border-gray-600 dark:border-gray-800"
    >
      <SidebarHeader className="flex px-2 group-data-[state=expanded]:justify-end">
        <HamburgerTrigger />
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <NavLink to="/dashboard" end>
              {({ isActive }) => (
                <SidebarMenuButton
                  tooltip={t.sidebar.dashboard}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "bg-black text-white hover:bg-black/85 hover:text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  <LayoutDashboardIcon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-white" : "text-gray-700",
                    )}
                  />
                  <span>{t.sidebar.dashboard}</span>
                </SidebarMenuButton>
              )}
            </NavLink>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <NavLink to="/patients" end>
              {({ isActive }) => (
                <SidebarMenuButton
                  tooltip={t.sidebar.patients}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "bg-black text-white hover:bg-black/85 hover:text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  <Users2Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-white" : "text-gray-700",
                    )}
                  />
                  <span>{t.sidebar.patients}</span>
                </SidebarMenuButton>
              )}
            </NavLink>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <NavLink to="/staff" end>
              {({ isActive }) => (
                <SidebarMenuButton
                  tooltip={t.sidebar.staff}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "bg-black text-white hover:bg-black/85 hover:text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  <Stethoscope
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-white" : "text-gray-700",
                    )}
                  />
                  <span>{t.sidebar.staff}</span>
                </SidebarMenuButton>
              )}
            </NavLink>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <NavLink to="/chat" end>
              {({ isActive }) => (
                <SidebarMenuButton
                  tooltip={t.sidebar.chat}
                  className={cn(
                    "transition-colors",
                    isActive
                      ? "bg-black text-white hover:bg-black/85 hover:text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800",
                  )}
                >
                  <MessageSquare
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-white" : "text-gray-700",
                    )}
                  />
                  <span>{t.sidebar.chat}</span>
                  {unreadCount > 0 && (
                    <span className={cn(
                      "ml-auto bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border border-white dark:border-gray-900",
                      unreadCount > 9 ? "px-1 min-w-[18px] h-4" : "h-4 w-4"
                    )}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </SidebarMenuButton>
              )}
            </NavLink>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
