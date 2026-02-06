import { useState } from 'react';
import { Building2, Lock, Pencil, Trash2, User } from 'lucide-react';
import { EventTypeDto, TimelineEvent } from '@/lib/types';
import { formatDateRange } from '@/lib/dateUtils';
import { getEventColorClass, getEventColorStyle } from '@/lib/eventColors';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useDeleteEvent, useUpdateEvent } from '@/queries/useEventMutations';
import { EditEventModal } from '@/components/EditEventModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EventChipProps {
  event: TimelineEvent;
  eventTypes: EventTypeDto[];
  style: React.CSSProperties;
}

export function EventChip({ event, eventTypes, style }: EventChipProps) {
  const { toast } = useToast();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const isCompanyRow = event.employeeId === null;
  const scopeIcon = event.scope === 'GLOBAL' ? Building2 : User;
  const ScopeIcon = scopeIcon;
  const resolvedEventType = eventTypes.find(type => type.id === event.eventTypeId) ?? event.eventType ?? null;
  const colorStyle = getEventColorStyle(resolvedEventType);
  const colorClass = colorStyle ? '' : getEventColorClass(resolvedEventType, event.eventTypeId);

  return (
    <>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <div
            className="absolute"
            style={style}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`h-7 rounded-md border px-2.5 flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-shadow hover:shadow-md overflow-hidden ${colorClass}`}
              style={colorStyle}
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
                    onClick={() => setShowEdit(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </button>
                )}
                {event.canDelete && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
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
      <EditEventModal
        open={showEdit}
        onOpenChange={setShowEdit}
        event={event}
        eventTypes={eventTypes}
        onSubmit={(payload) => {
          updateEvent.mutate(
            { eventId: event.id, payload },
            {
              onSuccess: () => {
                toast({
                  title: 'Event updated',
                  description: 'Event updated successfully.',
                });
              },
              onError: (error: { message?: string }) => {
                toast({
                  title: 'Event update failed',
                  description: error?.message ?? 'Unable to update event.',
                  variant: 'destructive',
                });
              },
            }
          );
        }}
      />
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                deleteEvent.mutate(event.id, {
                  onSuccess: () => {
                    toast({
                      title: 'Event deleted',
                      description: 'Event deleted successfully.',
                    });
                  },
                  onError: (error: { message?: string }) => {
                    toast({
                      title: 'Delete failed',
                      description: error?.message ?? 'Unable to delete event.',
                      variant: 'destructive',
                    });
                  },
                });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
