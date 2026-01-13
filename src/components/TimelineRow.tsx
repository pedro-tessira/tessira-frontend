import { EventTypeDto } from '@/lib/types';
import { EventChip } from './EventChip';
import { MoreChip } from './MoreChip';
import { PositionedEvent, RowLayoutInfo } from '@/hooks/useRowHeights';

interface TimelineRowProps {
  eventTypes: EventTypeDto[];
  layoutInfo: RowLayoutInfo;
  isExpanded: boolean;
  onToggleExpand: () => void;
  rowWidth: number;
}

const EVENT_HEIGHT = 28;
const EVENT_GAP = 4;
const EVENT_PADDING = 6;
const MAX_VISIBLE_ROWS = 3;

export function TimelineRow({
  layoutInfo,
  eventTypes,
  isExpanded,
  onToggleExpand,
  rowWidth,
}: TimelineRowProps) {
  const { positionedEvents, hasOverflow, overflowCount, height } = layoutInfo;
  
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
      return Math.min(rightmost + 6, rowWidth - 80);
    }
    const leftmost = Math.min(...hiddenEvents.map(e => e.left));
    return leftmost + 2;
  })();

  return (
    <div 
      className="relative border-b border-timeline-grid transition-all duration-200"
      style={{ width: rowWidth, height }}
    >
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
