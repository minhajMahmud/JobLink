import { type LucideIcon, LayoutDashboard, Menu, PanelLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminNavItem = {
  value: string;
  label: string;
  icon: LucideIcon;
  section: string;
  description?: string;
};

export type AdminStatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
};

type AdminSidebarProps = {
  items: AdminNavItem[];
  stats: AdminStatItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  collapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
  mobileOpen: boolean;
  onMobileOpenChange: (value: boolean) => void;
};

const sectionOrder = ["Overview", "Management", "Insights", "System"];

export default function AdminSidebar({
  items,
  stats,
  activeTab,
  onTabChange,
  collapsed,
  onCollapsedChange,
  mobileOpen,
  onMobileOpenChange,
}: AdminSidebarProps) {
  const sections = sectionOrder
    .map((section) => ({
      title: section,
      items: items.filter((item) => item.section === section),
    }))
    .filter((section) => section.items.length > 0);

  const navContent = (
    <SidebarContent
      items={items}
      stats={stats}
      activeTab={activeTab}
      onTabChange={onTabChange}
      collapsed={false}
      onCollapsedChange={onCollapsedChange}
      sections={sections}
      mobileOpen={mobileOpen}
      onMobileOpenChange={onMobileOpenChange}
    />
  );

  return (
    <>
      <aside
        className={cn(
          "sticky top-4 hidden self-start overflow-hidden rounded-3xl border border-border/70 bg-card/95 shadow-card backdrop-blur supports-[backdrop-filter]:bg-card/80 transition-all duration-300 lg:block",
          collapsed ? "w-[4.75rem]" : "w-[18.5rem]",
        )}
      >
        <SidebarContent
          items={items}
          stats={stats}
          activeTab={activeTab}
          onTabChange={onTabChange}
          collapsed={collapsed}
          onCollapsedChange={onCollapsedChange}
          sections={sections}
          mobileOpen={mobileOpen}
          onMobileOpenChange={onMobileOpenChange}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[19rem] border-border bg-card p-0 text-foreground sm:w-[20rem]">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
            <SheetDescription>Open the admin navigation drawer.</SheetDescription>
          </SheetHeader>
          <div className="h-full">{navContent}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}

type SidebarContentProps = {
  items: AdminNavItem[];
  stats: AdminStatItem[];
  activeTab: string;
  onTabChange: (value: string) => void;
  collapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
  sections: Array<{ title: string; items: AdminNavItem[] }>;
  mobileOpen: boolean;
  onMobileOpenChange: (value: boolean) => void;
};

function SidebarContent({
  stats,
  activeTab,
  onTabChange,
  collapsed,
  onCollapsedChange,
  sections,
  onMobileOpenChange,
}: SidebarContentProps) {
  return (
    <div className={cn("flex h-full flex-col", collapsed ? "p-2.5" : "p-4")}>
      <div className="flex items-start justify-between gap-3">
        <div className={cn("flex min-w-0 items-center gap-3", collapsed && "justify-center")}> 
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Admin panel</p>
              <h1 className="mt-1 truncate font-display text-xl font-bold text-foreground">Control center</h1>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onCollapsedChange(!collapsed)}
            className="hidden h-9 w-9 rounded-xl lg:inline-flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => onMobileOpenChange(true)}
            className="h-9 w-9 rounded-xl lg:hidden"
            aria-label="Open navigation drawer"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="mt-5 space-y-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-border bg-background p-4 text-center shadow-sm">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary text-foreground">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 font-display text-2xl font-bold text-foreground">{stat.value}</p>
              </div>
            );
          })}
        </div>
      )}

      <nav className={cn("mt-5 flex-1", collapsed ? "px-0" : "px-0")} aria-label="Admin navigation">
        <div className="space-y-3">
          {sections.map((section, index) => (
            <div
              key={section.title}
              className={cn(
                "space-y-2",
                !collapsed && "pb-1",
                index > 0 && !collapsed && "border-t border-border/70 pt-3",
              )}
            > 
              {!collapsed && (
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavButton
                    key={item.value}
                    item={item}
                    active={activeTab === item.value}
                    collapsed={collapsed}
                    onSelect={() => onTabChange(item.value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {!collapsed && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-background p-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <span className="font-medium">RBAC protected</span>
          </div>
          <p className="mt-2 leading-5">Every module action is permission-guarded and audit logged.</p>
        </div>
      )}
    </div>
  );
}

type NavButtonProps = {
  item: AdminNavItem;
  active: boolean;
  collapsed: boolean;
  onSelect: () => void;
};

function NavButton({ item, active, collapsed, onSelect }: NavButtonProps) {
  const Icon = item.icon;

  const button = (
    <button
      type="button"
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      aria-label={item.label}
      className={cn(
        "group flex w-full items-center rounded-2xl px-3 py-3 text-left text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        collapsed ? "justify-center px-0" : "gap-3",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <span className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
        active ? "bg-white/15 text-white" : "bg-secondary text-foreground group-hover:bg-background",
      )}>
        <Icon className="h-4 w-4" />
      </span>

      {!collapsed && (
        <span className="min-w-0 flex-1">
          <span className="block truncate">{item.label}</span>
          {item.description && <span className="block text-xs font-normal text-current/70">{item.description}</span>}
        </span>
      )}
    </button>
  );

  if (!collapsed) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" className="ml-2">
        <div className="font-medium">{item.label}</div>
        {item.description && <div className="text-xs text-muted-foreground">{item.description}</div>}
      </TooltipContent>
    </Tooltip>
  );
}
