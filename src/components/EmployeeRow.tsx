import { ChevronDown, ChevronUp } from 'lucide-react';
import { EmployeeDto } from '@/lib/types';

interface EmployeeRowProps {
  employee: EmployeeDto;
  isSelected: boolean;
  onClick: () => void;
  height: number;
  hasOverflow: boolean;
  isExpanded: boolean;
}

const avatarColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

function getAvatarColor(id: string): string {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatarColors[hash % avatarColors.length];
}

export function EmployeeRow({ employee, isSelected, onClick, height, hasOverflow, isExpanded }: EmployeeRowProps) {
  const displayName = employee.displayName ?? employee.fullName ?? "Unknown";
  const initials = displayName.trim()
    ? displayName
        .trim()
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : "--";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 transition-all duration-200 text-left border-b border-timeline-grid ${
        isSelected
          ? 'bg-sidebar-accent border-l-2 border-l-primary'
          : 'hover:bg-muted/50 border-l-2 border-l-transparent'
      }`}
      style={{ height }}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium shrink-0 ${getAvatarColor(employee.id)}`}
      >
        {initials}
      </div>
      <span className="text-sm font-medium text-foreground truncate flex-1">
        {displayName}
      </span>
      {hasOverflow && (
        <div className="text-muted-foreground">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      )}
    </button>
  );
}
