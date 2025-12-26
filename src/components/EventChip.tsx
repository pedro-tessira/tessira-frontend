import { Building2, Lock, Pencil, Trash2, User, Users } from 'lucide-react';
import { TimelineEvent } from '@/lib/types';
import { formatDateRange } from '@/lib/dateUtils';
import { getEventColorClass } from '@/lib/eventColors';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface EventChipProps {
  event: TimelineEvent;
  style: React.CSSProperties;
}

export function EventChip({ event, style }: EventChipProps) {
  const { toast } = useToast();
  const isCompanyRow = event.employeeId === null;
  const scopeIcon =
    event.scope === 'COMPANY' ? Building2 : event.scope === 'TEAM' ? Users : User;
  const ScopeIcon = scopeIcon;
  const colorClass = getEventColorClass(event.eventType, event.eventTypeId);

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <div
          className="absolute"
          style={style}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={`h-7 rounded-md border px-2.5 flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-shadow hover:shadow-md overflow-hidden ${colorClass}`}
          >
            <ScopeIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{event.title}</span>
            {event.isLocked && <Lock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="p-0 bg-transparent border-none shadow-none">
        <div className="bg-card border border-border rounded-lg shadow-lg p-4 min-w-[220px]">
          <div className="space-y-1.5 text-sm">
            <div>
              <span className="text-muted-foreground">Event: </span>
              <span className="font-medium text-foreground">{event.title}</span>
            </div>
            {!isCompanyRow && (
              <div>
                <span className="text-muted-foreground">Employee: </span>
                <span className="font-medium text-foreground">{event.employeeName ?? 'Unknown'}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Dates: </span>
              <span className="font-medium text-foreground">
                {formatDateRange(event.startDate, event.endDate)}
              </span>
            </div>
          </div>
          {(event.canEdit || event.canDelete) && (
            <div className="flex gap-2 pt-3">
              {event.canEdit && (
                <button
                  type="button"
                  onClick={() =>
                    toast({ title: 'Not implemented yet', description: 'Edit events is not available yet.' })
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
              {event.canDelete && (
                <button
                  type="button"
                  onClick={() =>
                    toast({ title: 'Not implemented yet', description: 'Delete events is not available yet.' })
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
