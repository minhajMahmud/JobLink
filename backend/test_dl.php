<?php
ini_set('enable_dl', '1');
ini_set('extension_dir', 'C:/Program Files/php-8.5.5/ext');

echo "pdo_mysql loaded before dl(): " . (extension_loaded('pdo_mysql') ? 'YES' : 'NO') . "\n";

if (!extension_loaded('pdo_mysql')) {
    $result = @dl('php_pdo_mysql.dll');
    echo "dl() result: " . ($result ? 'true' : 'false') . "\n";
    echo "pdo_mysql loaded after dl(): " . (extension_loaded('pdo_mysql') ? 'YES' : 'NO') . "\n";
}
