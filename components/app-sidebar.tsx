"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import type { UserRole } from "@/app/lib/auth-types"
import { NavUser } from "@/components/nav-user"
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
import {
  CommandIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  ListIcon,
  UsersIcon,
} from "lucide-react"

type SidebarNavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

type SidebarNavSection = {
  title?: string
  items: SidebarNavItem[]
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  role?: UserRole
}

const NAV_BY_ROLE: Record<UserRole, SidebarNavSection[]> = {
  admin: [
    {
      items: [
        {
          title: "Dashboard",
          href: "/admin/dashboard",
          icon: LayoutDashboardIcon,
        },
        {
          title: "Members",
          href: "/admin/members",
          icon: UsersIcon,
        },
        {
          title: "Contribution Window",
          href: "/admin/contribution-window",
          icon: ListIcon,
        },
        {
          title: "Contributions",
          href: "/admin/contributions",
          icon: FileTextIcon,
        },
      ],
    },
    {
      title: "My Account",
      items: [
        {
          title: "Dashboard",
          href: "/admin/my-account/dashboard",
          icon: LayoutDashboardIcon,
        },
        {
          title: "Contributions",
          href: "/admin/my-account/contributions",
          icon: FileTextIcon,
        },
      ],
    },
  ],
  member: [
    {
      items: [
        {
          title: "Dashboard",
          href: "/member/dashboard",
          icon: LayoutDashboardIcon,
        },
        {
          title: "Contributions",
          href: "/member/contributions",
          icon: FileTextIcon,
        },
      ],
    },
  ],
}

const USER_BY_ROLE = {
  admin: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  member: {
    name: "Member",
    email: "member@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
} as const

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AppSidebar({ role = "member", ...props }: AppSidebarProps) {
  const pathname = usePathname()
  const navSections = NAV_BY_ROLE[role]
  const homeHref = navSections[0]?.items[0]?.href ?? "/"

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href={homeHref}>
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Plots & Prosper</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navSections.map((section, sectionIndex) => (
          <SidebarGroup key={`${section.title ?? "main"}-${sectionIndex}`}>
            {section.title ? <SidebarGroupLabel>{section.title}</SidebarGroupLabel> : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActivePath(pathname, item.href)}>
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={USER_BY_ROLE[role]} />
      </SidebarFooter>
    </Sidebar>
  )
}
