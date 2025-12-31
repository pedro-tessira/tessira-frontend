import { EventTypeDto, TimelineEvent } from '@/lib/types';
import { DayColumn } from '@/lib/dateUtils';
import { EventChip } from './EventChip';
import { MoreChip } from './MoreChip';
import { PositionedEvent, RowLayoutInfo } from '@/hooks/useRowHeights';

interface TimelineRowProps {
  employeeId: string;
  events: TimelineEvent[];
  eventTypes: EventTypeDto[];
  columns: DayColumn[];
  colWidth: number;
  layoutInfo: RowLayoutInfo;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const EVENT_HEIGHT = 28;
const EVENT_GAP = 4;
const EVENT_PADDING = 6;
const MAX_VISIBLE_ROWS = 3;

export function TimelineRow({
  columns,
  colWidth,
  layoutInfo,
  eventTypes,
  isExpanded,
  onToggleExpand,
}: TimelineRowProps) {
  const totalWidth = columns.length * colWidth;
  const { positionedEvents, totalRows, hasOverflow, overflowCount, height } = layoutInfo;
  
  // Filter events to show based on expanded state
  const actualEventsToShow: PositionedEvent[] = hasOverflow && !isExpanded
    ? positionedEvents.filter(e => e.row < MAX_VISIBLE_ROWS - 1)
    : isExpanded 
      ? positionedEvents 
      : positionedEvents.filter(e => e.row < MAX_VISIBLE_ROWS);

  // Find position for overflow chip
  const overflowPosition = (() => {
    if (!hasOverflow || isExpanded) return null;
    const hiddenEvents = positionedEvents.filter(e => e.row >= MAX_VISIBLE_ROWS - 1);
    if (hiddenEvents.length === 0) {
      if (positionedEvents.length === 0) return 2;
      const rightmost = Math.max(...positionedEvents.map(e => e.left + e.width));
      return Math.min(rightmost + 6, totalWidth - 80);
    }
    const leftmost = Math.min(...hiddenEvents.map(e => e.left));
    return leftmost + 2;
  })();

  return (
    <div 
      className="relative border-b border-timeline-grid transition-all duration-200"
      style={{ width: totalWidth, height }}
    >
      {/* Background columns for weekends and today */}
      <div className="absolute inset-0 flex">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className={`shrink-0 h-full border-r border-timeline-grid ${
              col.isToday ? 'bg-timeline-today' : col.isWeekend ? 'bg-timeline-weekend' : ''
            }`}
            style={{ width: colWidth }}
          />
        ))}
      </div>

      {/* Events */}
      {actualEventsToShow.map((pe) => (
        <EventChip
          key={pe.event.id}
          event={pe.event}
          eventTypes={eventTypes}
          style={{
            left: pe.left + 2,
            width: pe.width,
            top: EVENT_PADDING + pe.row * (EVENT_HEIGHT + EVENT_GAP),
          }}
        />
      ))}

      {/* Overflow indicator */}
      {hasOverflow && !isExpanded && overflowPosition !== null && (
        <MoreChip
          count={overflowCount}
          style={{ 
            left: overflowPosition, 
            top: EVENT_PADDING + (MAX_VISIBLE_ROWS - 1) * (EVENT_HEIGHT + EVENT_GAP),
          }}
          onClick={onToggleExpand}
        />
      )}
    </div>
  );
}
