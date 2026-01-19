import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNowStrict, differenceInDays, format } from 'date-fns';
import { Copy, Check, Link, Ban, CalendarClock, UserRound } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMe } from '@/queries/useMe';
import { EventTypeDto, TeamEmployeeDto } from '@/lib/types';
import { useCreateShare, useRevokeShare, useShares } from '@/queries/useShares';

interface ShareViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  employees: TeamEmployeeDto[];
  eventTypes: EventTypeDto[];
}

export function ShareViewModal({ open, onOpenChange, teamId, employees, eventTypes }: ShareViewModalProps) {
  const { toast } = useToast();
  const { data: me } = useMe();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [includeGlobalLane, setIncludeGlobalLane] = useState(true);
  const [limitEmployees, setLimitEmployees] = useState(false);
  const [limitEventTypes, setLimitEventTypes] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const isShareId = (value: string) => /^[0-9a-fA-F-]{36}$/.test(value);
  const formatDateTime = (value?: string | null) => {
    if (!value) return 'No expiration';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Invalid date';
    const days = Math.abs(differenceInDays(new Date(), date));
    if (days <= 5) {
      return formatDistanceToNowStrict(date, { addSuffix: true });
    }
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const createShare = useCreateShare();
  const revokeShare = useRevokeShare();
  const { data: shareHistory = [], refetch: refetchShares, isLoading: isSharesLoading } = useShares(teamId);

  const employeeOptions = useMemo(() => employees, [employees]);
  const eventTypeOptions = useMemo(() => eventTypes, [eventTypes]);
  const isTeamOwner = useMemo(
    () => employees.some((employee) => employee.isOwner && employee.id === me?.employeeId),
    [employees, me?.employeeId]
  );
  const canCreateShare = me?.role !== "USER" || isTeamOwner;

  useEffect(() => {
    if (!limitEmployees) {
      setSelectedEmployees([]);
    }
  }, [limitEmployees]);

  useEffect(() => {
    if (!limitEventTypes) {
      setSelectedEventTypes([]);
    }
  }, [limitEventTypes]);


  const toggleSelection = (
    id: string,
    setState: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setState(prev => (prev.includes(id) ? prev.filter(value => value !== id) : [...prev, id]));
  };

  const isCreateDisabled =
    createShare.isPending ||
    (limitEmployees && selectedEmployees.length === 0) ||
    (limitEventTypes && selectedEventTypes.length === 0);

  const handleGenerateLink = () => {
    if (!canCreateShare) {
      toast({
        title: "Insufficient permissions",
        description: "Only team owners can create share links.",
        variant: "destructive",
      });
      return;
    }
    createShare.mutate(
      {
        teamId,
        title: title.trim() || null,
        employeeIds: limitEmployees ? selectedEmployees : null,
        eventTypeIds: limitEventTypes ? selectedEventTypes : null,
        includeGlobalLane,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      },
      {
        onSuccess: (response) => {
          if (!response.id) {
            toast({
              title: 'Share link created',
              description: 'Link created, but revoke is unavailable (missing share id).',
            });
          }
          const createdShareId = response.id && isShareId(response.id) ? response.id : null;
          setShareId(createdShareId);
          const url = `${window.location.origin}${response.urlPath}`;
          setShareUrl(url);
          refetchShares();
          toast({
            title: 'Share link created',
            description: 'This view is now available via the share link.',
          });
        },
        onError: (error: { message?: string }) => {
          toast({
            title: 'Share link failed',
            description: error?.message ?? 'Unable to create share link.',
            variant: 'destructive',
          });
        },
      }
    );
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: 'Link copied',
        description: 'Share link has been copied to clipboard.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Failed to copy link to clipboard.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setShareUrl(null);
      setCopied(false);
      setShareId(null);
      setTitle('');
      setExpiresAt('');
      setIncludeGlobalLane(true);
      setLimitEmployees(false);
      setLimitEventTypes(false);
      setSelectedEmployees([]);
      setSelectedEventTypes([]);
    }
    onOpenChange(open);
  };

  useEffect(() => {
    setShareUrl(null);
    setShareId(null);
    setCopied(false);
    if (open) {
      refetchShares();
    }
  }, [teamId, open, refetchShares]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw] sm:w-fit sm:max-w-[720px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Share View
          </DialogTitle>
          <DialogDescription>
            Generate a public read-only link to share this timeline view with others.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">Create link</h3>
              {!canCreateShare && (
                <span className="text-xs text-muted-foreground">
                  Only team owners can create links.
                </span>
              )}
            </div>
            {!canCreateShare ? (
              <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                Only team owners can create share links.
              </div>
            ) : !shareUrl ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="share-title">Title</Label>
                  <Input
                    id="share-title"
                    placeholder="Optional title..."
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="share-expiration">Expiration</Label>
                  <Input
                    id="share-expiration"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(event) => setExpiresAt(event.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Leave empty for no expiration.</p>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="include-global"
                    checked={includeGlobalLane}
                    onCheckedChange={(checked) => setIncludeGlobalLane(checked === true)}
                  />
                  <Label htmlFor="include-global" className="text-sm cursor-pointer">
                    Include global lane (global events)
                  </Label>
                </div>

                <div className="space-y-3 rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="limit-employees"
                      checked={limitEmployees}
                      onCheckedChange={(checked) => setLimitEmployees(checked === true)}
                    />
                    <Label htmlFor="limit-employees" className="text-sm cursor-pointer">
                      Limit to specific employees
                    </Label>
                  </div>
                  {limitEmployees && (
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border p-2">
                      {employeeOptions.map(employee => (
                        <label key={employee.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={selectedEmployees.includes(employee.id)}
                            onCheckedChange={() => toggleSelection(employee.id, setSelectedEmployees)}
                          />
                          <span>{employee.displayName}</span>
                        </label>
                      ))}
                      {employeeOptions.length === 0 && (
                        <p className="text-xs text-muted-foreground">No employees available.</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-3 rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="limit-event-types"
                      checked={limitEventTypes}
                      onCheckedChange={(checked) => setLimitEventTypes(checked === true)}
                    />
                    <Label htmlFor="limit-event-types" className="text-sm cursor-pointer">
                      Limit to specific event types
                    </Label>
                  </div>
                  {limitEventTypes && (
                    <div className="max-h-40 space-y-2 overflow-y-auto rounded-md border border-border p-2">
                      {eventTypeOptions.map(eventType => (
                        <label key={eventType.id} className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={selectedEventTypes.includes(eventType.id)}
                            onCheckedChange={() => toggleSelection(eventType.id, setSelectedEventTypes)}
                          />
                          <span>{eventType.name}</span>
                        </label>
                      ))}
                      {eventTypeOptions.length === 0 && (
                        <p className="text-xs text-muted-foreground">No event types available.</p>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleGenerateLink}
                  className="w-full"
                  disabled={isCreateDisabled}
                >
                  {createShare.isPending ? 'Creating link...' : 'Generate Share Link'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2 min-w-0">
                  <div className="h-9 flex-1 min-w-0 rounded-md border border-border bg-background px-3 sm:max-w-[420px] flex items-center">
                    <div className="overflow-x-auto whitespace-nowrap text-sm text-foreground scrollbar-thin">
                      {shareUrl}
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopy}
                    className="shrink-0 self-end h-9 w-9"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted-foreground">
                    Anyone with this link can view the timeline in read-only mode.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (!shareId) return;
                      revokeShare.mutate(shareId, {
                        onSuccess: () => {
                          toast({
                            title: 'Share link revoked',
                            description: 'This link is no longer active.',
                          });
                          setShareUrl(null);
                          setShareId(null);
                        },
                        onError: (error: { message?: string }) => {
                          toast({
                            title: 'Revoke failed',
                            description: error?.message ?? 'Unable to revoke share link.',
                            variant: 'destructive',
                          });
                        },
                      });
                    }}
                    disabled={revokeShare.isPending}
                    className="w-full"
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    {revokeShare.isPending ? 'Revoking...' : 'Disable Share Link'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-foreground">Existing links</div>
            {isSharesLoading && (
              <p className="text-xs text-muted-foreground">Loading share links...</p>
            )}

            {shareHistory.length > 0 ? (
              <div className="space-y-2">
                {shareHistory.map(link => (
                  <div key={link.id} className="rounded-lg border border-border bg-card p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {link.title ?? 'Shared timeline'}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  `${window.location.origin}${link.urlPath}`
                                )
                              }
                              className="h-8 w-8"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy link</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                if (!link.id || !isShareId(link.id)) return;
                                revokeShare.mutate(link.id, {
                                  onSuccess: () => {
                                    toast({
                                      title: 'Share link revoked',
                                      description: 'This link is no longer active.',
                                    });
                                    refetchShares();
                                  },
                                  onError: (error: { message?: string }) => {
                                    toast({
                                      title: 'Revoke failed',
                                      description: error?.message ?? 'Unable to revoke share link.',
                                      variant: 'destructive',
                                    });
                                  },
                                });
                              }}
                              disabled={revokeShare.isPending || !link.id || !isShareId(link.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Revoke link</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <UserRound className="w-3.5 h-3.5" />
                        <span>{link.createdByName ?? link.createdByUserId}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>{formatDateTime(link.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarClock className="w-3.5 h-3.5" />
                        <span>{formatDateTime(link.expiresAt)}</span>
                      </div>
                    </div>

                    <div className="h-9 w-full overflow-hidden rounded border border-border bg-muted/30 px-2 text-xs text-muted-foreground flex items-center">
                      <div className="overflow-x-auto whitespace-nowrap scrollbar-thin">
                        {`${window.location.origin}${link.urlPath}`}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {link.includeGlobalLane && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="rounded-full bg-blue-50 text-blue-600 px-2 py-0.5 cursor-default">
                                Global lane
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Includes global events in the timeline.</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="rounded-full bg-slate-100 text-slate-600 px-2 py-0.5 cursor-default">
                              {link.employeeIds && link.employeeIds.length > 0
                                ? `${link.employeeIds.length} employee(s)`
                                : 'All employees'}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-[240px] max-h-[160px] overflow-y-auto text-xs">
                              {link.employeeNames && link.employeeNames.length > 0
                                ? link.employeeNames.join(', ')
                                : 'All employees included'}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="rounded-full bg-purple-50 text-purple-600 px-2 py-0.5 cursor-default">
                              {link.eventTypeIds && link.eventTypeIds.length > 0
                                ? `${link.eventTypeIds.length} event type(s)`
                                : 'All event types'}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="max-w-[240px] max-h-[160px] overflow-y-auto text-xs">
                              {link.eventTypeNames && link.eventTypeNames.length > 0
                                ? link.eventTypeNames.join(', ')
                                : 'All event types included'}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No share links yet.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
