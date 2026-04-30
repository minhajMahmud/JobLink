<?php
echo "ini: " . (php_ini_loaded_file() ?: 'NONE') . "\n";
echo "pdo_mysql: " . (extension_loaded('pdo_mysql') ? 'YES' : 'NO') . "\n";
echo "extension_dir: " . ini_get('extension_dir') . "\n";
