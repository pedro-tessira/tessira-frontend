import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EventTypeDto, TimelineEvent } from "@/lib/types";

interface EditEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: TimelineEvent | null;
  eventTypes: EventTypeDto[];
  onSubmit: (payload: {
    title: string;
    startDate: string;
    endDate: string;
    eventTypeId: string;
  }) => void;
}

export function EditEventModal({ open, onOpenChange, event, eventTypes, onSubmit }: EditEventModalProps) {
  const [title, setTitle] = useState("");
  const [eventTypeId, setEventTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const selectableEventTypes = useMemo(() => eventTypes, [eventTypes]);

  useEffect(() => {
    if (!event) return;
    setTitle(event.title);
    setEventTypeId(event.eventTypeId ?? event.eventType?.id ?? "");
    setStartDate(event.startDate);
    setEndDate(event.endDate);
  }, [event]);

  useEffect(() => {
    if (!eventTypeId && selectableEventTypes.length > 0) {
      setEventTypeId(selectableEventTypes[0].id);
    }
  }, [eventTypeId, selectableEventTypes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTypeId || !title.trim()) return;
    onSubmit({
      title: title.trim(),
      startDate,
      endDate,
      eventTypeId,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Event Type</label>
            <select
              value={eventTypeId}
              disabled
              className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground cursor-not-allowed"
            >
              {selectableEventTypes.map((eventType) => (
                <option key={eventType.id} value={eventType.id}>
                  {eventType.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-foreground">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
                className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                required
              />
            </div>
          </div>

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
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Save changes
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
