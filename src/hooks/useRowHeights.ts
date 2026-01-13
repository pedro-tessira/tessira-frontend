import { useMemo } from 'react';
import { TimelineEvent, COMPANY_ROW_ID } from '@/lib/types';
import { getEventPosition } from '@/lib/dateUtils';

const ROW_BASE_HEIGHT = 45;
const EVENT_HEIGHT = 28;
const EVENT_GAP = 4;
const EVENT_PADDING = 6;
const MAX_VISIBLE_ROWS = 3;

export interface PositionedEvent {
  event: TimelineEvent;
  left: number;
  width: number;
  row: number;
}

export interface RowLayoutInfo {
  height: number;
  totalRows: number;
  hasOverflow: boolean;
  overflowCount: number;
  positionedEvents: PositionedEvent[];
}

export function useRowHeights(
  employeeIds: string[],
  events: TimelineEvent[],
  rangeStart: Date,
  rangeEnd: Date,
  colWidth: number,
  expandedRows: Set<string>,
  aggregationByRow?: Map<string, { hasMore: boolean; hiddenCount: number }>
): Map<string, RowLayoutInfo> {
  return useMemo(() => {
    const result = new Map<string, RowLayoutInfo>();
    
    for (const employeeId of employeeIds) {
      // Company row gets events with null employeeId, employees get their own events only
      const employeeEvents = employeeId === COMPANY_ROW_ID
        ? events.filter(e => e.employeeId === null)
        : events.filter(e => e.employeeId === employeeId);
      
      // Sort events by start date, then by duration (longer first)
      const sortedEvents = [...employeeEvents].sort((a, b) => {
        const startDiff = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        if (startDiff !== 0) return startDiff;
        const aDuration = new Date(a.endDate).getTime() - new Date(a.startDate).getTime();
        const bDuration = new Date(b.endDate).getTime() - new Date(b.startDate).getTime();
        return bDuration - aDuration;
      });
      
      // Track occupied ranges per row
      const rowOccupancy: { start: number; end: number }[][] = [];
      const positionedEvents: PositionedEvent[] = [];
      
      for (const event of sortedEvents) {
        const pos = getEventPosition(event.startDate, event.endDate, rangeStart, rangeEnd, colWidth);
        if (!pos.visible) continue;
        
        // Find a row that can fit this event
        let assignedRow = -1;
        for (let row = 0; row < rowOccupancy.length; row++) {
          const canFit = !rowOccupancy[row].some(
            occ => !(pos.left + pos.width <= occ.start || pos.left >= occ.end)
          );
          if (canFit) {
            assignedRow = row;
            rowOccupancy[row].push({ start: pos.left, end: pos.left + pos.width });
            break;
          }
        }
        
        if (assignedRow === -1) {
          assignedRow = rowOccupancy.length;
          rowOccupancy.push([{ start: pos.left, end: pos.left + pos.width }]);
        }
        
        positionedEvents.push({
          event,
          left: pos.left,
          width: pos.width,
          row: assignedRow,
        });
      }
      
      const totalRows = rowOccupancy.length;
      const layoutOverflow = totalRows > MAX_VISIBLE_ROWS;
      const layoutOverflowCount = layoutOverflow
        ? positionedEvents.filter(e => e.row >= MAX_VISIBLE_ROWS - 1).length
        : 0;
      const aggregation = aggregationByRow?.get(employeeId);
      const aggregationOverflow = aggregation?.hasMore ?? false;
      const overflowCount = aggregationOverflow && (aggregation?.hiddenCount ?? 0) > 0
        ? aggregation.hiddenCount
        : layoutOverflowCount;
      const hasOverflow = aggregationOverflow || layoutOverflow;
      const isExpanded = expandedRows.has(employeeId);
      const displayRows = isExpanded ? totalRows : Math.min(totalRows, hasOverflow ? MAX_VISIBLE_ROWS : totalRows);
      const height = Math.max(ROW_BASE_HEIGHT, EVENT_PADDING * 2 + displayRows * (EVENT_HEIGHT + EVENT_GAP) - EVENT_GAP);
      
      result.set(employeeId, { height, totalRows, hasOverflow, overflowCount, positionedEvents });
    }
    
    return result;
  }, [employeeIds, events, rangeStart, rangeEnd, colWidth, expandedRows, aggregationByRow]);
}
