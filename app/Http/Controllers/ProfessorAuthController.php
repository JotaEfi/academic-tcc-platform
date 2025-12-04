<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ProfessorAuthController extends Controller
{
    public function create()
    {
        return Inertia::render('Professor/Login');
    }

    public function store(Request $request)
    {
        $credentials = $request->validate([
            'name' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::attempt(['name' => $credentials['name'], 'password' => $credentials['password'], 'role' => 'professor'])) {
            $request->session()->regenerate();

            return redirect()->intended(route('professor.dashboard'));
        }

        return back()->withErrors([
            'name' => 'The provided credentials do not match our records.',
        ]);
    }

    public function destroy(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/professor/login');
    }
}
