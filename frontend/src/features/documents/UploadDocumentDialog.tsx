import { useState } from "react";
import { toast } from "sonner";
import { useUploadDocumentMutation } from "./documentsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

export function UploadDocumentDialog({ patientId }: { patientId: string }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [label, setLabel] = useState("");
  const [uploadDocument, { isLoading }] = useUploadDocumentMutation();

  async function handleUpload() {
    if (!file) {
      toast.error("Choose a file first");
      return;
    }
    try {
      await uploadDocument({
        patientId,
        file,
        label: label || file.name,
      }).unwrap();
      toast.success("Document uploaded");
      setFile(null);
      setLabel("");
      setOpen(false);
    } catch (err: any) {
      if (err?.data?.error?.message) toast.error(err.data.error.message);
      else toast.error("Upload failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">Upload document</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload X-ray or document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Panoramic X-ray, ID card"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input
              id="file"
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, WEBP, or PDF. Max 15MB.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpload} disabled={isLoading || !file}>
            {isLoading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
