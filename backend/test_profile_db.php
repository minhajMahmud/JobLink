<?php
require __DIR__ . '/bootstrap/app.php';
use App\Modules\User\Repositories\UserRepository;
use App\Modules\User\Services\ProfileService;

$repo = new UserRepository();
$user = $repo->findByEmail('seeker@demo.com');
if (!$user) { echo "User not found\n"; exit; }

echo "User ID: {$user->id}\n";

$svc = new ProfileService();
$res = $svc->updateProfile($user->id, [
    'experience_years' => rand(1, 10), 
    'skills' => ['PHP', 'React'],
    'first_name' => 'Demo', 
    'last_name' => 'Seeker'
]);

print_r($res);

$profile = $svc->getProfile($user->id);
echo "API Data: \n";
print_r($profile);
