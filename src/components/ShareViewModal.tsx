import { useEffect, useMemo, useState } from 'react';
import { Copy, Check, Link, Ban } from 'lucide-react';
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
import { EventTypeDto, TeamEmployeeDto } from '@/lib/types';
import { useCreateShare, useRevokeShare } from '@/queries/useShares';

interface ShareViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  employees: TeamEmployeeDto[];
  eventTypes: EventTypeDto[];
}

export function ShareViewModal({ open, onOpenChange, teamId, employees, eventTypes }: ShareViewModalProps) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [includeCompanyLane, setIncludeCompanyLane] = useState(true);
  const [limitEmployees, setLimitEmployees] = useState(false);
  const [limitEventTypes, setLimitEventTypes] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [shareHistory, setShareHistory] = useState<
    { id: string; url: string; title?: string; expiresAt?: string; createdAt: string }[]
  >([]);

  const shareStorageKey = `horizon-share-links-${teamId}`;

  const createShare = useCreateShare();
  const revokeShare = useRevokeShare();

  const employeeOptions = useMemo(() => employees, [employees]);
  const eventTypeOptions = useMemo(() => eventTypes, [eventTypes]);

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
    createShare.mutate(
      {
        teamId,
        title: title.trim() || null,
        employeeIds: limitEmployees ? selectedEmployees : null,
        eventTypeIds: limitEventTypes ? selectedEventTypes : null,
        includeCompanyLane,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
      },
      {
        onSuccess: (response) => {
          setShareId(response.id ?? response.token);
          const url = `${window.location.origin}${response.urlPath}`;
          setShareUrl(url);
          setShareHistory(prev => [
            {
              id: response.id ?? response.token,
              url,
              title: title.trim() || undefined,
              expiresAt: expiresAt || undefined,
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ]);
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
      setIncludeCompanyLane(true);
      setLimitEmployees(false);
      setLimitEventTypes(false);
      setSelectedEmployees([]);
      setSelectedEventTypes([]);
    }
    onOpenChange(open);
  };

  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(shareStorageKey);
      if (raw) {
        setShareHistory(JSON.parse(raw));
      }
    } catch {
      // Ignore storage errors.
    }
  }, [open, shareStorageKey]);

  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem(shareStorageKey, JSON.stringify(shareHistory));
    } catch {
      // Ignore storage errors.
    }
  }, [open, shareHistory, shareStorageKey]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Share View
          </DialogTitle>
          <DialogDescription>
            Generate a public read-only link to share this timeline view with others.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareUrl ? (
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
                  id="include-company"
                  checked={includeCompanyLane}
                  onCheckedChange={(checked) => setIncludeCompanyLane(checked === true)}
                />
                <Label htmlFor="include-company" className="text-sm cursor-pointer">
                  Include company lane (global events)
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

              {shareHistory.length > 0 && (
                <div className="space-y-2 border-t border-border pt-3">
                  <div className="text-sm font-medium text-foreground">Recent links</div>
                  <p className="text-xs text-muted-foreground">Available in this session.</p>
                  <div className="space-y-2">
                    {shareHistory.map(link => (
                      <div key={link.id} className="flex items-center gap-2 rounded-md border border-border p-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">
                            {link.title ?? 'Shared timeline'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                          {link.expiresAt && (
                            <p className="text-[11px] text-muted-foreground">
                              Expires {new Date(link.expiresAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(link.url)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            revokeShare.mutate(link.id, {
                              onSuccess: () => {
                                toast({
                                  title: 'Share link revoked',
                                  description: 'This link is no longer active.',
                                });
                                setShareHistory(prev => prev.filter(item => item.id !== link.id));
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
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={shareUrl}
                  className="flex-1 text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopy}
                  className="shrink-0"
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
      </DialogContent>
    </Dialog>
  );
}
