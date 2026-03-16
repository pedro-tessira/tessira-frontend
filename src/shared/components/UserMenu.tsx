import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield, LogOut, ArrowLeftRight } from "lucide-react";
import { useTenant } from "@/shared/contexts/TenantContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  collapsed?: boolean;
}

export const UserMenu = forwardRef<HTMLButtonElement, UserMenuProps>(
  function UserMenu({ collapsed }, ref) {
    const navigate = useNavigate();
    const { isPlatformAdmin } = useTenant();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            ref={ref as React.Ref<HTMLButtonElement>}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent tessira-transition outline-none w-full"
          >
            <div className="h-6 w-6 shrink-0 rounded-full bg-primary/20 border border-primary/30" />
            {!collapsed && (
              <span className="text-xs font-medium text-muted-foreground truncate">Engineering Lead</span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side={collapsed ? "right" : "top"} className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate("/app/account")}>
            <User size={14} className="mr-2" />
            My Account
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate("/app/overview")}>
            <ArrowLeftRight size={14} className="mr-2" />
            Switch Organization
          </DropdownMenuItem>
          {isPlatformAdmin && (
            <DropdownMenuItem onClick={() => navigate("/platform")}>
              <Shield size={14} className="mr-2" />
              Platform Admin
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">
            <LogOut size={14} className="mr-2" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);