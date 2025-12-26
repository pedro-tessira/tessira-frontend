import { useState } from 'react';
import { Copy, Check, Link } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateShareId, saveShare, getShareUrl } from '@/lib/shareUtils';
import { useToast } from '@/hooks/use-toast';

interface ShareViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
}

export function ShareViewModal({ open, onOpenChange, teamId }: ShareViewModalProps) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = () => {
    const shareId = generateShareId();
    const shareData = {
      id: shareId,
      teamId,
      createdAt: new Date().toISOString(),
    };
    saveShare(shareData);
    setShareUrl(getShareUrl(shareId));
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
    }
    onOpenChange(open);
  };

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
            <Button onClick={handleGenerateLink} className="w-full">
              Generate Share Link
            </Button>
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
              <p className="text-xs text-muted-foreground">
                Anyone with this link can view the timeline in read-only mode.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
