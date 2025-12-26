import { ChevronDown, ChevronUp } from 'lucide-react';

interface MoreChipProps {
  count: number;
  style: React.CSSProperties;
  isExpanded?: boolean;
  onClick?: () => void;
}

export function MoreChip({ count, style, isExpanded, onClick }: MoreChipProps) {
  return (
    <div 
      className="absolute z-10" 
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div className="h-7 rounded-md border border-border bg-card shadow-sm px-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
        {isExpanded ? (
          <>
            <ChevronUp className="w-3.5 h-3.5" />
            <span>Show less</span>
          </>
        ) : (
          <>
            <span>+{count} events</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </>
        )}
      </div>
    </div>
  );
}
