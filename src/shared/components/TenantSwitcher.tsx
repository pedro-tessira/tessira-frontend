import { Check, ChevronDown, Building2 } from "lucide-react";
import { useTenant } from "@/shared/contexts/TenantContext";
import { cn } from "@/shared/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TenantSwitcher() {
  const { currentTenant, tenants, switchTenant } = useTenant();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-md border border-border/50 bg-background px-2.5 py-1.5 text-sm font-medium hover:bg-accent tessira-transition outline-none">
        <Building2 size={14} className="text-muted-foreground" />
        <span className="max-w-[140px] truncate">{currentTenant.name}</span>
        <ChevronDown size={12} className="text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Organizations</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => switchTenant(tenant.id)}
            className="flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium">{tenant.name}</span>
              <span className="text-xs text-muted-foreground capitalize">{tenant.plan}</span>
            </div>
            {tenant.id === currentTenant.id && <Check size={14} className="text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
