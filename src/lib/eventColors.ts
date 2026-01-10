import { EventTypeDto, EventTypeSummary } from "@/lib/types";

const PALETTE = [
  "bg-event-vacation-bg text-event-vacation border-event-vacation-border",
  "bg-event-sick-bg text-event-sick border-event-sick-border",
  "bg-event-training-bg text-event-training border-event-training-border",
  "bg-event-team-bg text-event-team border-event-team-border",
  "bg-event-company-bg text-event-company border-event-company-border",
];

const hashString = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const getEventColorClass = (
  eventType?: EventTypeDto | EventTypeSummary | null,
  eventTypeId?: string | null
): string => {
  const key = eventType?.code ?? eventType?.id ?? eventTypeId ?? "default";
  const index = hashString(key) % PALETTE.length;
  return PALETTE[index];
};
