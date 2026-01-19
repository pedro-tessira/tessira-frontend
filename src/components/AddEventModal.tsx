import { useEffect, useMemo, useState } from 'react';
import { EmployeeDto, EventScope, EventTypeDto } from '@/lib/types';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getEventColorClass } from '@/lib/eventColors';

interface AddEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: EmployeeDto[];
  eventTypes: EventTypeDto[];
  currentUserRole?: string;
  currentUserEmployeeId?: string | null;
  onSubmit: (event: {
    title?: string | null;
    startDate: string;
    endDate: string;
    eventTypeId: string;
    scope: EventScope;
    employeeId?: string | null;
  }) => void;
}

export function AddEventModal({
  open,
  onOpenChange,
  employees,
  eventTypes,
  currentUserRole,
  currentUserEmployeeId,
  onSubmit,
}: AddEventModalProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isNormalUser = currentUserRole === "USER";
  const effectiveEmployees = useMemo(() => {
    if (!isNormalUser) return employees;
    if (!currentUserEmployeeId) return [];
    return employees.filter(employee => employee.id === currentUserEmployeeId);
  }, [employees, currentUserEmployeeId, isNormalUser]);
  const selectableEventTypes = useMemo(() => {
    if (!isNormalUser) return eventTypes;
    return eventTypes.filter(eventType => eventType.timelineScope === "INDIVIDUAL");
  }, [eventTypes, isNormalUser]);
  const [title, setTitle] = useState('');
  const [employeeId, setEmployeeId] = useState<string | null>(effectiveEmployees[0]?.id ?? null);
  const [selectedEventTypeId, setSelectedEventTypeId] = useState<string>('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    if (!selectedEventTypeId && selectableEventTypes.length > 0) {
      setSelectedEventTypeId(selectableEventTypes[0].id);
    }
  }, [selectableEventTypes, selectedEventTypeId]);

  useEffect(() => {
    if (!employeeId && effectiveEmployees.length > 0) {
      setEmployeeId(effectiveEmployees[0].id);
    }
  }, [employeeId, effectiveEmployees]);

  const selectedEventType = selectableEventTypes.find(eventType => eventType.id === selectedEventTypeId);
  const eventScope = (selectedEventType?.timelineScope ?? 'INDIVIDUAL') as EventScope;
  const isEmployeeScoped = eventScope === 'INDIVIDUAL';

  const resetForm = () => {
    setTitle('');
    setEmployeeId(effectiveEmployees[0]?.id ?? null);
    setSelectedEventTypeId(selectableEventTypes[0]?.id ?? '');
    setStartDate(today);
    setEndDate(today);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !selectedEventTypeId) return;
    if (isNormalUser && isEmployeeScoped && !currentUserEmployeeId) return;
    if (isNormalUser && !isEmployeeScoped) return;
    
    onSubmit({
      employeeId: isEmployeeScoped
        ? (isNormalUser ? currentUserEmployeeId ?? null : employeeId)
        : null,
      eventTypeId: selectedEventTypeId,
      scope: eventScope,
      title: title.trim() ? title.trim() : null,
      startDate,
      endDate,
    });
    
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Event</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Event title..."
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              autoFocus
            />
          </div>

          {/* Event Type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">Type</label>
            <div className="flex gap-2 flex-wrap">
              {selectableEventTypes.map(eventType => (
                <button
                  key={eventType.id}
                  type="button"
                  onClick={() => setSelectedEventTypeId(eventType.id)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                    selectedEventTypeId === eventType.id
                      ? getEventColorClass(eventType, eventType.id)
                      : 'bg-muted/50 text-muted-foreground border-border opacity-60 hover:opacity-100'
                  }`}
                >
                  {eventType.name}
                </button>
              ))}
            </div>
          </div>

          {/* Employee (only for individual events) */}
          {isEmployeeScoped && !isNormalUser && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Employee</label>
              <select
                value={employeeId ?? ''}
                onChange={e => setEmployeeId(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                {effectiveEmployees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.displayName}</option>
                ))}
              </select>
            </div>
          )}
          {isEmployeeScoped && isNormalUser && (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              Event will be created for your timeline.
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isNormalUser && (!currentUserEmployeeId || selectableEventTypes.length === 0)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Add Event
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
