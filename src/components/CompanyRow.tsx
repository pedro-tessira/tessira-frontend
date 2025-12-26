import { ChevronDown, ChevronUp, Building2 } from 'lucide-react';
interface CompanyRowProps {
  isSelected: boolean;
  onClick: () => void;
  height: number;
  hasOverflow: boolean;
  isExpanded: boolean;
}
export function CompanyRow({
  isSelected,
  onClick,
  height,
  hasOverflow,
  isExpanded
}: CompanyRowProps) {
  return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 transition-all duration-200 text-left border-b border-timeline-grid ${isSelected ? 'bg-sidebar-accent border-l-2 border-l-primary' : 'hover:bg-muted/50 border-l-2 border-l-transparent'}`} style={{
    height
  }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-event-company text-white shrink-0">
        <Building2 className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-foreground truncate flex-1">
        Company 
      </span>
      {hasOverflow && <div className="text-muted-foreground">
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>}
    </button>;
}