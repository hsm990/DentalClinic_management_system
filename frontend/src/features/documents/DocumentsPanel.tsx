import { toast } from "sonner";
import { format } from "date-fns";
import {
  useGetDocumentsQuery,
  useDeleteDocumentMutation,
} from "./documentsApi";
import { UploadDocumentDialog } from "./UploadDocumentDialog";
import { downloadDocument } from "@/lib/downloadFile";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Image as ImageIcon, Download, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsPanel({ patientId }: { patientId: string }) {
  const { data: documents, isLoading } = useGetDocumentsQuery(patientId);
  const [deleteDocument] = useDeleteDocumentMutation();

  if (isLoading) return <Skeleton className="h-40 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <UploadDocumentDialog patientId={patientId} />
      </div>

      {documents?.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No documents uploaded yet.
        </p>
      )}

      <div className="space-y-2">
        {documents?.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center justify-between rounded-md border p-3"
          >
            <div className="flex items-center gap-3">
              {doc.mimeType.startsWith("image/") ? (
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              ) : (
                <FileText className="h-5 w-5 text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium">{doc.label}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(doc.fileSize)} ·{" "}
                  {format(new Date(doc.createdAt), "MMM d, yyyy")}
                  {doc.uploadedBy ? ` · by ${doc.uploadedBy.firstName}` : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                size="icon"
                variant="ghost"
                onClick={async () => {
                  try {
                    await downloadDocument(doc.id);
                  } catch {
                    toast.error("Failed to download");
                  }
                }}
              >
                <Download className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button size="icon" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete "{doc.label}"?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        try {
                          await deleteDocument({
                            id: doc.id,
                            patientId,
                          }).unwrap();
                          toast.success("Document deleted");
                        } catch {
                          toast.error("Failed to delete");
                        }
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
