<?php

declare(strict_types=1);

return [
    'prefix'     => '/messaging',
    'middleware' => ['auth'],
    'routes'     => [
        // Messaging endpoints
        ['POST',   '/send',                                    'MessagingController@sendMessage'],
        ['GET',    '/conversations',                            'MessagingController@getUserConversations'],
        ['GET',    '/conversations/{conversationId}/messages',  'MessagingController@getConversationMessages'],
        ['PUT',    '/messages/{messageId}/read',                'MessagingController@markMessageAsRead'],
        ['DELETE', '/messages/{messageId}',                     'MessagingController@deleteMessage'],
        ['GET',    '/conversations/{conversationId}/search',    'MessagingController@searchMessages'],

        // Typing status
        ['POST',   '/conversations/{conversationId}/typing',    'MessagingController@updateTypingStatus'],
        ['GET',    '/conversations/{conversationId}/typing',    'MessagingController@getTypingUsers'],

        // Online status
        ['POST',   '/online-status',                            'MessagingController@updateOnlineStatus'],
        ['GET',    '/users/{userId}/online-status',             'MessagingController@getUserOnlineStatus'],

        // Block/Unblock
        ['POST',   '/block',                                    'MessagingController@blockUser'],
        ['DELETE', '/block/{blockedId}',                        'MessagingController@unblockUser'],

        // File upload
        ['POST',   '/upload',                                   'FileUploadController@uploadFile'],
        ['GET',    '/files/{attachmentId}/download',            'FileUploadController@downloadFile'],
        ['GET',    '/files/{attachmentId}/preview',             'FileUploadController@previewFile'],
    ],
];