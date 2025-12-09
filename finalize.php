<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
set_time_limit(600);

function shutdown() {
    $error = error_get_last();
    if ($error && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_COMPILE_ERROR)) {
        echo "\n❌ FATAL ERROR: " . $error['message'] . " in " . $error['file'] . ":" . $error['line'] . "\n";
    }
    echo "</pre>";
}
register_shutdown_function('shutdown');

echo "<h1>🚀 Finalizing Deployment (SQLite + Cache Clear + Admin)</h1><pre>";

$root = __DIR__;
echo "Root: $root\n";

// 0. Extract Release.zip (CRITICAL STEP)
$zipPath = $root . '/release.zip';
if (file_exists($zipPath)) {
    echo "\n--- Extracting release.zip ---\n";
    $zip = new ZipArchive;
    if ($zip->open($zipPath) === TRUE) {
        $zip->extractTo($root);
        $zip->close();
        echo "✅ Extracted release.zip successfully.\n";
        // unlink($zipPath); // Optional: Delete zip after extraction
    } else {
        echo "❌ Failed to open release.zip\n";
    }
} else {
    echo "⚠️ release.zip not found. Skipping extraction.\n";
}

// 1. Check .env
$envPath = $root . '/.env';
if (!file_exists($envPath)) {
    echo "⚠️ .env file NOT FOUND! Creating from .env.example...\n";
    if (file_exists($root . '/.env.example')) {
        copy($root . '/.env.example', $envPath);
        echo "✅ Created .env from .env.example\n";
    } else {
        die("❌ .env.example also missing. Cannot proceed.\n");
    }
}

// 2. Setup SQLite
echo "\n--- SQLite Setup ---\n";
$dbFile = $root . '/database/database.sqlite';
$dbDir = dirname($dbFile);

if (!file_exists($dbDir)) {
    mkdir($dbDir, 0775, true);
}
if (!file_exists($dbFile)) {
    touch($dbFile);
    echo "✅ Created database.sqlite\n";
}
chmod($dbFile, 0666);
chmod($dbDir, 0775);
echo "✅ SQLite permissions set.\n";

// Update .env for SQLite
$envContent = file_get_contents($envPath);
$envContent = preg_replace('/^DB_CONNECTION=.*$/m', 'DB_CONNECTION=sqlite', $envContent);
$envContent = preg_replace('/^DB_DATABASE=.*$/m', 'DB_DATABASE="' . $dbFile . '"', $envContent);
// Comment out other DB configs to avoid confusion
$envContent = preg_replace('/^(DB_HOST|DB_PORT|DB_USERNAME|DB_PASSWORD)=/m', '#$1=', $envContent);

if (preg_match('/^CACHE_DRIVER=/m', $envContent)) {
    $envContent = preg_replace('/^CACHE_DRIVER=.*$/m', 'CACHE_DRIVER=file', $envContent);
} else {
    $envContent .= "\nCACHE_DRIVER=file\n";
}
if (preg_match('/^SESSION_DRIVER=/m', $envContent)) {
    $envContent = preg_replace('/^SESSION_DRIVER=.*$/m', 'SESSION_DRIVER=file', $envContent);
} else {
    $envContent .= "\nSESSION_DRIVER=file\n";
}

file_put_contents($envPath, $envContent);
echo "✅ Updated .env (SQLite + Cache/Session Driver).\n";

// 3. Fix APP_KEY
$envContent = file_get_contents($envPath);
if (!preg_match('/^APP_KEY=base64:[a-zA-Z0-9\/+=]{44}/m', $envContent)) {
    echo "⚠️ Invalid or missing APP_KEY. Generating new key...\n";
    try {
        $key = 'base64:' . base64_encode(random_bytes(32));
        if (preg_match('/^APP_KEY=/m', $envContent)) {
            $envContent = preg_replace('/^APP_KEY=.*$/m', "APP_KEY=$key", $envContent);
        } else {
            $envContent .= "\nAPP_KEY=$key\n";
        }
        file_put_contents($envPath, $envContent);
        echo "✅ APP_KEY updated in .env\n";
    } catch (Exception $e) {
        echo "❌ Failed to generate random key: " . $e->getMessage() . "\n";
    }
}

// 4. Permissions
echo "\n--- Permissions ---\n";
$dirs = [
    'storage', 'storage/app', 'storage/app/public',
    'storage/framework', 'storage/framework/views',
    'storage/logs', 'bootstrap/cache'
];
foreach ($dirs as $dir) {
    $path = "$root/$dir";
    if (!file_exists($path)) {
        mkdir($path, 0775, true);
        echo "Created $dir\n";
    }
    chmod($path, 0775);
}
echo "✅ Permissions set.\n";

// 5. Clear bootstrap cache
echo "\n--- Clearing Bootstrap Cache ---\n";
$cacheFiles = [
    $root . '/bootstrap/cache/config.php',
    $root . '/bootstrap/cache/routes.php',
    $root . '/bootstrap/cache/packages.php',
    $root . '/bootstrap/cache/services.php'
];
foreach ($cacheFiles as $file) {
    if (file_exists($file)) {
        unlink($file);
        echo "🗑️ Deleted: " . basename($file) . "\n";
    }
}

// 6. Storage Symlink
echo "\n--- Storage Symlink ---\n";
$target = $root . '/storage/app/public';
$link = $root . '/public/storage';
if (function_exists('symlink')) {
    if (!file_exists($link)) {
        if (symlink($target, $link)) {
            echo "✅ Symlink created: $link -> $target\n";
        } else {
            echo "❌ Failed to create symlink\n";
        }
    } else {
        echo "ℹ️ Symlink already exists.\n";
    }
}

// 7. Boot Laravel
echo "\n--- Booting Laravel ---\n";
try {
    require_once $root . '/vendor/autoload.php';
    $app = require_once $root . '/bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();
    echo "✅ Laravel Booted.\n";
} catch (Throwable $e) {
    echo "❌ Failed to boot Laravel: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit;
}

// Helper for Artisan commands
function runCommand($cmd, $kernel) {
    echo "Running: php artisan $cmd\n";
    try {
        $status = $kernel->call($cmd);
        echo $kernel->output();
        echo "Status: " . ($status == 0 ? 'SUCCESS' : 'ERROR') . "\n\n";
    } catch (Exception $e) {
        echo "❌ Exception: " . $e->getMessage() . "\n\n";
    }
}

// 8. Run Artisan Commands
runCommand('optimize:clear', $kernel);
runCommand('migrate --force', $kernel);

// 9. Create Admin User (The specific fix requested)
echo "\n--- Checking Admin User ---\n";
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

try {
    // Check if users table is empty or admin is missing
    $adminEmail = 'admin@example.com';
    $adminUser = User::where('email', $adminEmail)->first();

    if (!$adminUser) {
        echo "⚠️ Admin user not found. Creating it now...\n";
        
        // Wrap in transaction just in case
        DB::transaction(function () use ($adminEmail) {
            User::create([
                'name' => 'Admin User',
                'email' => $adminEmail,
                'password' => Hash::make('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]);
        });
        
        echo "✅ Admin User ($adminEmail) created successfully.\n";
    } else {
        echo "✅ Admin User ($adminEmail) already exists.\n";
    }
} catch (Throwable $e) {
    echo "❌ Failed to create/check admin user: " . $e->getMessage() . "\n";
}

runCommand('config:cache', $kernel);
runCommand('route:cache', $kernel);
runCommand('view:cache', $kernel);

echo "\n✨ Finalization Complete. Remove this file if exposed publicly.\n";
?>
