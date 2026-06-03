<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class AdminProfessorsTest extends TestCase
{
    use RefreshDatabase, WithoutMiddleware;

    protected function setUp(): void
    {
        parent::setUp();
    }

    public function test_admin_can_list_professors_with_visible_email_and_temp_password()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $professor = User::factory()->create([
            'role' => 'professor',
            'temp_password' => 'secret123',
            'email' => 'prof.test@example.com'
        ]);

        $response = $this->actingAs($admin)
            ->get(route('admin.professors'));

        $response->assertOk();
        
        // Assert that the professor data includes the visible email and temp_password
        $professorsData = $response->original->getData()['page']['props']['professors'];
        
        $this->assertNotEmpty($professorsData);
        $profData = $professorsData[0];
        
        $this->assertEquals($professor->name, $profData['name']);
        $this->assertEquals('prof.test@example.com', $profData['email']);
        $this->assertEquals('secret123', $profData['temp_password']);
    }

    public function test_admin_can_create_professor_with_custom_credentials()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->post(route('admin.professors.store'), [
                'name' => 'Professor Manual',
                'email' => 'manual.prof@example.com',
                'password' => 'manualpass123'
            ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('users', [
            'name' => 'Professor Manual',
            'email' => 'manual.prof@example.com',
            'temp_password' => 'manualpass123',
            'role' => 'professor'
        ]);

        $user = User::where('email', 'manual.prof@example.com')->first();
        $this->assertTrue(\Hash::check('manualpass123', $user->password));
    }

    public function test_admin_can_create_professor_with_auto_generated_password()
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)
            ->post(route('admin.professors.store'), [
                'name' => 'Professor Auto',
                'email' => 'auto.prof@example.com',
                'password' => '' // empty triggers auto-generation
            ]);

        $response->assertRedirect();
        
        $user = User::where('email', 'auto.prof@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNotEmpty($user->temp_password);
        $this->assertTrue(\Hash::check($user->temp_password, $user->password));
    }

    public function test_admin_can_update_professor_credentials()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $professor = User::factory()->create([
            'name' => 'Old Name',
            'email' => 'old.email@example.com',
            'password' => bcrypt('oldpass123'),
            'temp_password' => 'oldpass123',
            'role' => 'professor'
        ]);

        // Update name and email without password
        $response = $this->actingAs($admin)
            ->put(route('admin.professors.update', $professor->id), [
                'name' => 'New Name',
                'email' => 'new.email@example.com',
                'password' => ''
            ]);

        $response->assertRedirect();
        
        $this->assertDatabaseHas('users', [
            'id' => $professor->id,
            'name' => 'New Name',
            'email' => 'new.email@example.com',
            'temp_password' => 'oldpass123' // unchanged
        ]);

        // Update password too
        $response2 = $this->actingAs($admin)
            ->put(route('admin.professors.update', $professor->id), [
                'name' => 'New Name',
                'email' => 'new.email@example.com',
                'password' => 'updatedpass123'
            ]);

        $response2->assertRedirect();
        
        $this->assertDatabaseHas('users', [
            'id' => $professor->id,
            'temp_password' => 'updatedpass123'
        ]);
        
        $professor->refresh();
        $this->assertTrue(\Hash::check('updatedpass123', $professor->password));
    }
}
