import { useEffect, useMemo, useRef, useState } from "react";
import { UploadCloud, FileText, AlertCircle, CheckCircle2, RefreshCw, X } from "lucide-react";
import { useAuth } from "@/features/auth/context/AuthContext";
import {
  MAX_RESUME_FILE_SIZE,
  RESUME_ALLOWED_EXTENSIONS,
  RESUME_ALLOWED_MIME_TYPES,
  uploadResume,
} from "@/features/profile/api/uploadResume";

type UploadStatus =
  | { type: "idle"; message: "" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

interface UploadedResume {
  fileName: string;
  filePath: string;
  uploadedAt: string;
  size: number;
  mimeType: string;
}

function getExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ResumeUpload() {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<UploadStatus>({ type: "idle", message: "" });
  const [uploadedResume, setUploadedResume] = useState<UploadedResume | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const apiBase = useMemo(() => import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000", []);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    if (selectedFile.type === "application/pdf") {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreviewUrl(null);
  }, [selectedFile]);

  const validateFile = (file: File): string | null => {
    const extension = getExtension(file.name);

    if (!RESUME_ALLOWED_EXTENSIONS.includes(extension)) {
      return "Invalid format. Only PDF, DOC, and DOCX are allowed.";
    }

    if (file.size > MAX_RESUME_FILE_SIZE) {
      return "File too large. Maximum allowed size is 2MB.";
    }

    if (file.type && !RESUME_ALLOWED_MIME_TYPES.includes(file.type)) {
      return "Invalid MIME type detected. Please upload a valid resume file.";
    }

    return null;
  };

  const onFilePicked = (file: File | null) => {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setSelectedFile(null);
      setStatus({ type: "error", message: validationError });
      return;
    }

    setSelectedFile(file);
    setStatus({ type: "idle", message: "" });
    setUploadProgress(0);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilePicked(event.target.files?.[0] ?? null);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);

    const file = event.dataTransfer.files?.[0] ?? null;
    onFilePicked(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setStatus({ type: "idle", message: "" });
    setUploadProgress(0);

    try {
      const payload = await uploadResume(
        {
          apiBaseUrl: apiBase,
          file: selectedFile,
          userId: user?.id,
        },
        setUploadProgress,
      );

      if (!payload?.success) {
        throw new Error(payload?.message ?? "Server failed to upload the resume.");
      }

      setUploadedResume({
        fileName: payload.data.file_name,
        filePath: payload.data.file_path,
        uploadedAt: payload.data.upload_date,
        size: payload.data.size,
        mimeType: payload.data.mime_type,
      });

      setStatus({ type: "success", message: payload.message ?? "Resume uploaded successfully." });
      setUploadProgress(100);
    } catch (error: any) {
      if (error?.isAxiosError) {
        if (!error.response) {
          setStatus({ type: "error", message: "Network error. Please check your internet connection and try again." });
        } else {
          setStatus({
            type: "error",
            message: error.response.data?.message ?? "Server failed while uploading your resume.",
          });
        }
      } else {
        setStatus({ type: "error", message: error?.message ?? "Unexpected error occurred." });
      }
    } finally {
      setUploading(false);
    }
  };

  const triggerBrowse = () => inputRef.current?.click();

  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-card space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Resume Upload</h3>
          <p className="text-sm text-muted-foreground">
            Upload PDF, DOC, or DOCX up to 2MB. You can replace your existing resume anytime.
          </p>
        </div>
        {uploadedResume && (
          <button
            type="button"
            onClick={triggerBrowse}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Replace
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        aria-label="Upload resume file"
        title="Upload resume file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileInputChange}
        className="hidden"
      />

      <div
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border bg-secondary/30"
        }`}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-primary" />
        <p className="mt-2 text-sm font-medium text-foreground">Drag & drop your resume here</p>
        <p className="text-xs text-muted-foreground mt-1">or</p>
        <button
          type="button"
          onClick={triggerBrowse}
          className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Browse Files
        </button>
      </div>

      {selectedFile && (
        <div className="rounded-xl border border-border bg-background px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedFile(null);
              setUploadProgress(0);
              setStatus({ type: "idle", message: "" });
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            aria-label="Remove selected file"
            title="Remove selected file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uploading ? "Uploading..." : uploadedResume ? "Replace Resume" : "Upload Resume"}
        </button>

        {uploading && (
          <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
        )}
      </div>

      {uploading && (
        <progress
          value={uploadProgress}
          max={100}
          className="h-2 w-full overflow-hidden rounded-full bg-secondary [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
          aria-label="Resume upload progress"
        />
      )}

      {status.type !== "idle" && (
        <div
          className={`rounded-lg px-3 py-2 text-sm flex items-start gap-2 ${
            status.type === "success"
              ? "bg-accent/10 text-accent"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {uploadedResume && (
        <div className="rounded-xl border border-border bg-background p-4 space-y-2">
          <div className="flex items-center gap-2 text-foreground">
            <FileText className="h-4 w-4" />
            <p className="text-sm font-medium">Uploaded Resume</p>
          </div>
          <p className="text-sm text-foreground break-all">{uploadedResume.fileName}</p>
          <p className="text-xs text-muted-foreground">Stored path: {uploadedResume.filePath}</p>
          <p className="text-xs text-muted-foreground">Uploaded at: {uploadedResume.uploadedAt}</p>
        </div>
      )}

      {previewUrl && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">PDF Preview</p>
          <iframe
            src={previewUrl}
            title="Uploaded resume PDF preview"
            className="h-72 w-full rounded-xl border border-border bg-background"
          />
        </div>
      )}
    </section>
  );
}
