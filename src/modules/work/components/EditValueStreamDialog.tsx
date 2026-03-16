import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import { toast } from "sonner";
import type { ValueStream } from "../types";

interface Props {
  valueStream: ValueStream;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: ValueStream) => void;
}

export default function EditValueStreamDialog({ valueStream, open, onOpenChange, onSave }: Props) {
  const [name, setName] = useState(valueStream.name);
  const [description, setDescription] = useState(valueStream.description);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ ...valueStream, name: name.trim(), description: description.trim() });
    toast.success(`Value stream "${name.trim()}" updated`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe size={18} className="text-primary" />
            Edit Value Stream
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-vs-name">Name</Label>
            <Input id="edit-vs-name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-vs-desc">Description</Label>
            <Textarea id="edit-vs-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" size="sm" disabled={!name.trim()}>Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
