import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule], // [[CRITICAL]]: Forms binding chalane ke liye zaroori hai
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  email = 'rck@gmail.com';
  password = 'rck@96446gfx';
  isLoading: boolean = false;
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  async onLogin() {
    if (this.email && this.password) {
      this.isLoading = true; // Loader on
      try {
        await this.authService.login(this.email, this.password);

        // Success Toast
        this.toastr.success('Welcome back, Admin!', 'Login Successful');

        // Success hone par redirection yahan add kar sakte hain (jaise: this.router.navigate(['/admin-dashboard']);)
      } catch (error: any) {
        console.error(error);
        // Error Toast (agar backend se koi specific error message aaye toh wo dikha sakte hain, warna default)
        const errorMessage =
          error?.message || 'Invalid email or password. Please try again!';
        this.toastr.error(errorMessage, 'Login Failed');
      } finally {
        this.isLoading = false; // Error ya success, dono case mein loader off
      }
    } else {
      // Warning Toast for empty fields
      this.toastr.warning(
        'Please fill in both email and password fields.',
        'Warning',
      );
    }
  }
}
