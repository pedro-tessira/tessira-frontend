import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface ModulePageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
}

export function ModulePageHeader({ title, description, breadcrumbs, actions }: ModulePageHeaderProps) {
  const backHref = breadcrumbs?.slice().reverse().find((c) => c.href)?.href;

  return (
    <div className="mb-6 space-y-2">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          {backHref && (
            <Link
              to={backHref}
              className="flex h-6 w-6 items-center justify-center rounded-md hover:bg-accent hover:text-foreground tessira-transition shrink-0"
            >
              <ArrowLeft size={14} />
            </Link>
          )}
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight size={10} className="text-muted-foreground/40" />}
              {crumb.href ? (
                <Link to={crumb.href} className="hover:text-foreground tessira-transition">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
