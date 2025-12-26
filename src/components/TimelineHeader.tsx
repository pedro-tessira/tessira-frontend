import { DayColumn } from '@/lib/dateUtils';
import { format } from 'date-fns';

interface TimelineHeaderProps {
  columns: DayColumn[];
  colWidth: number;
}

export function TimelineHeader({ 
  columns, 
  colWidth,
}: TimelineHeaderProps) {
  // Group columns by month for month labels
  const monthGroups: { month: string; startIndex: number; count: number }[] = [];
  let currentMonth = '';
  
  columns.forEach((col, idx) => {
    const monthLabel = format(col.date, 'MMMM yyyy');
    if (monthLabel !== currentMonth) {
      monthGroups.push({ month: monthLabel, startIndex: idx, count: 1 });
      currentMonth = monthLabel;
    } else {
      monthGroups[monthGroups.length - 1].count++;
    }
  });

  return (
    <div className="sticky top-0 z-20 bg-card">
      {/* Month labels row */}
      <div className="flex border-b border-border" style={{ height: '1.95rem' }}>
        {monthGroups.map((group, idx) => (
          <div
            key={idx}
            className="relative border-r border-border bg-card"
            style={{ width: group.count * colWidth }}
          >
            <div 
              className="sticky left-0 h-full flex items-center px-3 text-sm font-semibold text-foreground bg-card"
              style={{ width: 'fit-content' }}
            >
              {group.month}
            </div>
          </div>
        ))}
      </div>
      
      {/* Day columns */}
      <div className="flex h-10 border-b border-border">
        {columns.map((col, idx) => (
          <div
            key={idx}
            className={`shrink-0 flex flex-col items-center justify-center border-r border-timeline-grid ${
              col.isToday ? 'bg-timeline-today' : col.isWeekend ? 'bg-timeline-weekend' : ''
            }`}
            style={{ width: colWidth }}
          >
            <span className="text-xs text-muted-foreground">{col.dayOfWeek}</span>
            <span className={`text-xs font-medium ${col.isToday ? 'text-primary' : 'text-foreground'}`}>
              {format(col.date, 'dd')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
