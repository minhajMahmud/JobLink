<?php

declare(strict_types=1);

namespace App\Modules\Messaging\Controllers;

use App\Core\Http\Request;
use App\Core\Http\Response;
use App\Modules\Messaging\Services\MessagingService;
use App\Modules\Messaging\Repositories\AttachmentRepository;
use App\Modules\Messaging\Repositories\ConversationRepository;
use Throwable;

final class FileUploadController
{
    private MessagingService $messagingService;
    private AttachmentRepository $attachmentRepo;
    private ConversationRepository $conversationRepo;

    private const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    private const ALLOWED_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    private const UPLOAD_DIR = 'storage/uploads/messages/';

    public function __construct()
    {
        $this->messagingService = new MessagingService();
        $this->attachmentRepo = new AttachmentRepository();
        $this->conversationRepo = new ConversationRepository();
    }

    private function generateUuidV4(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }

    /**
     * Upload file to message
     * POST /api/messaging/upload
     */
    public function uploadFile(Request $request): Response
    {
        try {
            $userId = $request->header('x-user-id');
            if (!$userId) {
                return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            $conversationId = $request->post('conversation_id');
            $recipientId = $request->post('recipient_id');

            if (!$conversationId && !$recipientId) {
                return Response::json([
                    'success' => false,
                    'message' => 'Conversation ID or Recipient ID is required',
                ], 400);
            }

            // Get files from request
            $files = $_FILES['files'] ?? [];
            if (empty($files['name'])) {
                return Response::json([
                    'success' => false,
                    'message' => 'No files provided',
                ], 400);
            }

            // Handle single or multiple files
            $fileCount = is_array($files['name']) ? count($files['name']) : 1;
            $uploadedFiles = [];

            for ($i = 0; $i < $fileCount; $i++) {
                $fileName = is_array($files['name']) ? $files['name'][$i] : $files['name'];
                $fileTmp = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
                $fileSize = is_array($files['size']) ? $files['size'][$i] : $files['size'];
                $fileType = is_array($files['type']) ? $files['type'][$i] : $files['type'];
                $fileError = is_array($files['error']) ? $files['error'][$i] : $files['error'];

                // Validate file
                $validation = $this->validateFile($fileName, $fileSize, $fileType, $fileError);
                if (!$validation['valid']) {
                    return Response::json([
                        'success' => false,
                        'message' => $validation['error'],
                    ], 400);
                }

                // Save file
                $savedFile = $this->saveFile($fileTmp, $fileName);
                if (!$savedFile) {
                    return Response::json([
                        'success' => false,
                        'message' => 'Failed to save file',
                    ], 500);
                }

                $uploadedFiles[] = [
                    'file_name' => $fileName,
                    'file_path' => $savedFile['path'],
                    'file_size' => $fileSize,
                    'mime_type' => $fileType,
                ];
            }

            // Get or create conversation
            if (!$conversationId) {
                $conversation = $this->conversationRepo->getOrCreateConversation($userId, $recipientId);
                $conversationId = $conversation->id;
            }

            // Create message with files
            $messageData = [
                'recipient_id' => $recipientId,
                'content' => $request->post('message') ?? 'Shared files',
                'message_type' => 'file',
            ];

            $messageResult = $this->messagingService->sendMessage($userId, $messageData);
            $messageId = $messageResult['message']['id'];

            // Attach files to message
            foreach ($uploadedFiles as $file) {
                $this->attachmentRepo->createAttachment(
                    $messageId,
                    $file['file_name'],
                    $file['file_path'],
                    pathinfo($file['file_name'], PATHINFO_EXTENSION),
                    $file['file_size'],
                    $file['mime_type']
                );
            }

            return Response::json([
                'success' => true,
                'message' => 'Files uploaded successfully',
                'message_id' => $messageId,
                'files' => $uploadedFiles,
            ], 201);
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Download file
     * GET /api/messaging/files/{attachmentId}/download
     */
    public function downloadFile(Request $request): Response
    {
        try {
            $userId = $request->header('x-user-id');
            if (!$userId) {
                return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            $attachmentId = $request->param('attachmentId');
            $attachment = $this->attachmentRepo->getAttachmentById($attachmentId);

            if (!$attachment) {
                return Response::json(['success' => false, 'message' => 'File not found'], 404);
            }

            $filePath = $attachment->file_path;
            if (!file_exists($filePath)) {
                return Response::json(['success' => false, 'message' => 'File not found on server'], 404);
            }

            // Stream file
            header('Content-Type: ' . ($attachment->mime_type ?? 'application/octet-stream'));
            header('Content-Disposition: attachment; filename="' . $attachment->file_name . '"');
            header('Content-Length: ' . filesize($filePath));
            readfile($filePath);
            exit;
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Preview file (for images)
     * GET /api/messaging/files/{attachmentId}/preview
     */
    public function previewFile(Request $request): Response
    {
        try {
            $userId = $request->header('x-user-id');
            if (!$userId) {
                return Response::json(['success' => false, 'message' => 'Unauthorized'], 401);
            }

            $attachmentId = $request->param('attachmentId');
            $attachment = $this->attachmentRepo->getAttachmentById($attachmentId);

            if (!$attachment) {
                return Response::json(['success' => false, 'message' => 'File not found'], 404);
            }

            $filePath = $attachment->file_path;
            if (!file_exists($filePath)) {
                return Response::json(['success' => false, 'message' => 'File not found on server'], 404);
            }

            // Only allow image preview
            if (!str_starts_with($attachment->mime_type ?? '', 'image/')) {
                return Response::json(['success' => false, 'message' => 'Preview not available for this file type'], 400);
            }

            header('Content-Type: ' . $attachment->mime_type);
            readfile($filePath);
            exit;
        } catch (Throwable $e) {
            return Response::json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Validate file
     * @return array<string, mixed>
     */
    private function validateFile(string $fileName, int $fileSize, string $fileType, int $fileError): array
    {
        if ($fileError !== UPLOAD_ERR_OK) {
            return [
                'valid' => false,
                'error' => 'File upload error: ' . $this->getUploadErrorMessage($fileError),
            ];
        }

        if ($fileSize > self::MAX_FILE_SIZE) {
            return [
                'valid' => false,
                'error' => 'File size exceeds maximum limit of 50MB',
            ];
        }

        if (!in_array($fileType, self::ALLOWED_TYPES, true)) {
            return [
                'valid' => false,
                'error' => 'File type not allowed. Allowed types: PDF, Images, Documents',
            ];
        }

        return ['valid' => true];
    }

    /**
     * Save file to storage
     * @return array<string, string>|false
     */
    private function saveFile(string $tmpPath, string $originalName): array|false
    {
        // Create upload directory if it doesn't exist
        if (!is_dir(self::UPLOAD_DIR)) {
            mkdir(self::UPLOAD_DIR, 0755, true);
        }

        // Generate unique filename
        $extension = pathinfo($originalName, PATHINFO_EXTENSION);
        $uniqueName = $this->generateUuidV4() . '.' . $extension;
        $savePath = self::UPLOAD_DIR . $uniqueName;

        // Move uploaded file
        if (!move_uploaded_file($tmpPath, $savePath)) {
            return false;
        }

        return [
            'path' => $savePath,
            'name' => $uniqueName,
        ];
    }

    /**
     * Get upload error message
     */
    private function getUploadErrorMessage(int $errorCode): string
    {
        return match ($errorCode) {
            UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize',
            UPLOAD_ERR_FORM_SIZE => 'File exceeds form MAX_FILE_SIZE',
            UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
            UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
            UPLOAD_ERR_EXTENSION => 'File upload stopped by extension',
            default => 'Unknown upload error',
        };
    }
}
