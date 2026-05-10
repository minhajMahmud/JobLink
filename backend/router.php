<?php

// PHP built-in server router
// Routes all requests to index.php

$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);

// Serve static files if they exist in public directory
$publicPath = __DIR__ . '/public' . $path;
if ($path !== '/' && is_file($publicPath)) {
    return false;
}

// Route all other requests through index.php
require __DIR__ . '/public/index.php';