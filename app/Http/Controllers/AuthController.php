<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function magicLogin($token)
    {
        $user = User::where('access_token', $token)->first();

        if (!$user) {
            abort(403, 'Invalid token');
        }

        Auth::login($user);

        if ($user->role === 'admin') {
            return redirect()->route('admin.dashboard');
        }

        return redirect()->route('professor.dashboard');
    }
}
