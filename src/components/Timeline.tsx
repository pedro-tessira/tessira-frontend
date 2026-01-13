import { EventTypeDto, TimelineEvent } from '@/lib/types';
import { DayColumn } from '@/lib/dateUtils';
import { TimelineHeader } from './TimelineHeader';
import { TimelineRow } from './TimelineRow';
import { RowLayoutInfo } from '@/hooks/useRowHeights';

interface TimelineProps {
  rowIds: string[];
  eventsByRow: Map<string, TimelineEvent[]>;
  eventTypes: EventTypeDto[];
  columns: DayColumn[];
  colWidth: number;
  rangeStart: Date;
  rangeEnd: Date;
  expandedRows: Set<string>;
  onToggleExpand: (rowId: string) => void;
  rowLayouts: Map<string, RowLayoutInfo>;
  onJumpToToday: () => void;
}

export function Timeline({
  rowIds,
  eventsByRow,
  eventTypes,
  columns,
  colWidth,
  expandedRows,
  onToggleExpand,
  rowLayouts,
}: TimelineProps) {
  const totalWidth = columns.length * colWidth;
  
  // Find today's column index for the indicator line
  const todayIndex = columns.findIndex(col => col.isToday);
  const todayLeft = todayIndex >= 0 ? todayIndex * colWidth + colWidth / 2 : null;
  
  // Calculate total content height for the today line
  const totalRowHeight = rowIds.reduce((sum, rowId) => {
    const layout = rowLayouts.get(rowId);
    return sum + (layout?.height ?? 45);
  }, 0);
  
  return (
    <div className="inline-block min-w-full relative">
      <div className="sticky top-0 z-20">
        <TimelineHeader 
          columns={columns} 
          colWidth={colWidth}
        />
      </div>
      <div className="relative" style={{ width: totalWidth, height: totalRowHeight }}>
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

        {/* Today indicator line */}
        {todayLeft !== null && (
          <div 
            className="absolute top-0 w-0.5 bg-primary z-10 pointer-events-none"
            style={{ left: todayLeft, height: totalRowHeight }}
          />
        )}

        <div className="relative">
          {rowIds.map(rowId => {
            const layoutInfo = rowLayouts.get(rowId);
            if (!layoutInfo) return null;

            return (
              <TimelineRow
                key={rowId}
                eventTypes={eventTypes}
                layoutInfo={layoutInfo}
                isExpanded={expandedRows.has(rowId)}
                onToggleExpand={() => onToggleExpand(rowId)}
                rowWidth={totalWidth}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
