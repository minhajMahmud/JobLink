import axios from "axios";

export const MAX_RESUME_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export const RESUME_ALLOWED_EXTENSIONS = ["pdf", "doc", "docx"];

export const RESUME_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export interface ResumeUploadResponse {
  success: boolean;
  message: string;
  data?: {
    file_name: string;
    file_path: string;
    mime_type: string;
    size: number;
    upload_date: string;
    user_id: string | null;
    db_saved: boolean;
  };
  warning?: string;
}

export async function uploadResume(
  params: {
    apiBaseUrl: string;
    file: File;
    userId?: string | null;
  },
  onProgress?: (percentage: number) => void,
): Promise<ResumeUploadResponse> {
  const formData = new FormData();
  formData.append("resume", params.file);
  formData.append("user_id", params.userId ?? "anonymous");

  const response = await axios.post<ResumeUploadResponse>(`${params.apiBaseUrl}/upload-resume.php`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (!onProgress) return;
      const total = progressEvent.total ?? params.file.size;
      const loaded = progressEvent.loaded ?? 0;
      const percentage = Math.max(0, Math.min(100, Math.round((loaded * 100) / total)));
      onProgress(percentage);
    },
  });

  return response.data;
}
