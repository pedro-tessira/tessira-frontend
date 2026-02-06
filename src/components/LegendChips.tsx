import { Building2, Plus, Settings2, User } from 'lucide-react';
import { EventTypeDto, EventTypeTimelineScope } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { getEventColorClass, getEventColorStyle } from '@/lib/eventColors';

const getScopeIcon = (scope: EventTypeTimelineScope) => {
  if (scope === 'GLOBAL') return Building2;
  return User;
};

interface LegendChipsProps {
  activeFilters: Set<string>;
  onToggleFilter: (eventTypeId: string) => void;
  onToggleAll: () => void;
  eventTypes: EventTypeDto[];
  onAddEventClick: () => void;
  onManageEventTypesClick: () => void;
  canManageEventTypes?: boolean;
  monthNavigator?: React.ReactNode;
}

export function LegendChips({ 
  activeFilters, 
  onToggleFilter, 
  onToggleAll, 
  eventTypes, 
  onAddEventClick,
  onManageEventTypesClick,
  canManageEventTypes = true,
  monthNavigator,
}: LegendChipsProps) {
  const allActive = eventTypes.length > 0 && activeFilters.size === eventTypes.length;
  
  return (
    <div className="flex items-center gap-3 px-6 py-3 border-b border-border bg-card">
      {/* Show/Hide All button */}
      <button
        onClick={onToggleAll}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
          allActive
            ? 'bg-primary/10 text-primary border-primary/30'
            : 'bg-muted text-muted-foreground border-border'
        }`}
      >
        {allActive ? 'Hide All' : 'Show All'}
      </button>
      
      <div className="w-px h-6 bg-border" />
      
      {eventTypes.map(eventType => {
        const Icon = getScopeIcon(eventType.timelineScope);
        const isActive = activeFilters.has(eventType.id);
        const colorStyle = getEventColorStyle(eventType);
        const colorClass = colorStyle ? '' : getEventColorClass(eventType, eventType.id);
        return (
          <button
            key={eventType.id}
            onClick={() => onToggleFilter(eventType.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
              isActive
                ? colorClass
                : 'bg-muted/50 text-muted-foreground border-border opacity-50'
            }`}
            style={isActive ? colorStyle : undefined}
          >
            <Icon className="w-4 h-4" />
            <span>{eventType.name}</span>
          </button>
        );
      })}
      
      <div className="ml-auto flex items-center gap-2">
        {canManageEventTypes && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={onManageEventTypesClick}
                  className="p-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Manage Event Types</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={onAddEventClick}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add Event
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Create a new event</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {monthNavigator && (
          <>
            <span className="w-px h-6 bg-border" />
            {monthNavigator}
          </>
        )}
      </div>
    </div>
  );
}
