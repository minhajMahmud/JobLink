<?php
echo "Loaded php.ini: " . php_ini_loaded_file() . "\n";
echo "PHP Version: " . phpversion() . "\n";
echo "Extension Dir: " . ini_get('extension_dir') . "\n";
echo "\nLoaded Extensions:\n";
$extensions = get_loaded_extensions();
sort($extensions);
foreach ($extensions as $ext) {
    echo "  - " . $ext . "\n";
}
