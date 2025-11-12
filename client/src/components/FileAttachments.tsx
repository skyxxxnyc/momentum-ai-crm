import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, File, Trash2, Download, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface FileAttachmentsProps {
  entityType: "deal" | "company";
  entityId: number;
}

export function FileAttachments({ entityType, entityId }: FileAttachmentsProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: attachments, isLoading } = trpc.attachments.list.useQuery({
    entityType,
    entityId,
  });

  const uploadMutation = trpc.attachments.upload.useMutation({
    onSuccess: () => {
      toast.success("File uploaded successfully");
      utils.attachments.list.invalidate();
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload file");
      setIsUploading(false);
    },
  });

  const deleteMutation = trpc.attachments.delete.useMutation({
    onSuccess: () => {
      toast.success("File deleted");
      utils.attachments.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete file");
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1]; // Remove data:mime;base64, prefix

        await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          mimeType: file.type,
          entityType,
          entityId,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("File upload error:", error);
      setIsUploading(false);
    }
  };

  const handleDelete = (id: number, fileName: string) => {
    if (confirm(`Delete ${fileName}?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-5 w-5" />;
    if (mimeType.includes("pdf")) return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="h-5 w-5" />
          Attachments
        </CardTitle>
        <CardDescription>Upload documents, contracts, and files</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Button */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.gif"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full gap-2"
            variant="outline"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            Supported: PDF, Word, Excel, Images (max 10MB)
          </p>
        </div>

        {/* Attachments List */}
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Loading attachments...
          </div>
        ) : attachments && attachments.length > 0 ? (
          <div className="space-y-2">
            {attachments.map((attachment: any) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 border-2 border-border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getFileIcon(attachment.mimeType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(attachment.fileSize)} •{" "}
                      {new Date(attachment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(attachment.fileUrl, "_blank")}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(attachment.id, attachment.fileName)}
                    disabled={deleteMutation.isPending}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No attachments yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}
