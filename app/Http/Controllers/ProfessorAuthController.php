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
        $request->merge([
            'name' => trim($request->input('name', '')),
            'password' => trim($request->input('password', '')),
        ]);

        $credentials = $request->validate([
            'name' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $loginField = filter_var($credentials['name'], FILTER_VALIDATE_EMAIL) ? 'email' : 'name';

        if (Auth::attempt([
            $loginField => $credentials['name'],
            'password' => $credentials['password'],
            'role' => 'professor'
        ])) {
            $request->session()->regenerate();

            return redirect()->intended(route('professor.dashboard'));
        }

        return back()->withErrors([
            'name' => 'As credenciais fornecidas não correspondem aos nossos registros.',
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
