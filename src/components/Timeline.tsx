import { EventTypeDto, TimelineEvent, COMPANY_ROW_ID } from '@/lib/types';
import { DayColumn } from '@/lib/dateUtils';
import { TimelineHeader } from './TimelineHeader';
import { TimelineRow } from './TimelineRow';
import { RowLayoutInfo } from '@/hooks/useRowHeights';

interface TimelineProps {
  rowIds: string[];
  events: TimelineEvent[];
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
  events,
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
      <div className="relative" style={{ width: totalWidth }}>
        {/* Today indicator line */}
        {todayLeft !== null && (
          <div 
            className="absolute top-0 w-0.5 bg-primary z-10 pointer-events-none"
            style={{ left: todayLeft, height: totalRowHeight }}
          />
        )}
        
        {rowIds.map(rowId => {
          const layoutInfo = rowLayouts.get(rowId);
          if (!layoutInfo) return null;
          
          // Company row gets events with null employeeId, employees get their own
          const rowEvents = rowId === COMPANY_ROW_ID
            ? events.filter(e => e.employeeId === null)
            : events.filter(e => e.employeeId === rowId);
          
          return (
            <TimelineRow
              key={rowId}
              employeeId={rowId}
              events={rowEvents}
              eventTypes={eventTypes}
              columns={columns}
              colWidth={colWidth}
              layoutInfo={layoutInfo}
              isExpanded={expandedRows.has(rowId)}
              onToggleExpand={() => onToggleExpand(rowId)}
            />
          );
        })}
      </div>
    </div>
  );
}
