import { cn } from "@/shared/lib/utils";

interface AvatarInitialsProps {
  firstName: string;
  lastName: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function AvatarInitials({ firstName, lastName, size = "md", className }: AvatarInitialsProps) {
  const initials = `${firstName[0]}${lastName[0]}`;
  const sizeClasses = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-8 w-8 text-xs",
    lg: "h-12 w-12 text-sm",
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary font-semibold border border-primary/20",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}
