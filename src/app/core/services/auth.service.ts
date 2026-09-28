import { Injectable, inject } from '@angular/core';
import {
  Auth,
  signInWithEmailAndPassword,
  signOut,
  user,
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public auth = inject(Auth);
  private router = inject(Router);

  
  // Yeh check karne ke liye ki admin logged in hai ya nahi (Reactive state)
  currentUser$ = user(this.auth);

  // Login Function
async login(email: string, pass: string) {
    try {
      // Await ka use karke seedha response lein
      const userCredential = await signInWithEmailAndPassword(this.auth, email, pass);
      
      // Firebase se UID mil gayi
      const uid = userCredential.user?.uid;

      if (uid) {
        localStorage.setItem('adminToken', uid);
        this.router.navigate(['/admin/dashboard']);
      }
    } catch (error) {
      console.error('Login error:', error);
      // Error ko aage component tak throw karein taaki toastr show ho sake
      throw error; 
    }
  }

// Logout Function
  async logout() {
    try {
      await signOut(this.auth);
      localStorage.removeItem('adminToken');
    } catch (error) {
      console.error('Logout error:', error);
      throw error; // Component tak error bhejne ke liye
    }
  }

  // auth.service.ts
  isLoggedIn(): boolean {
    // Yahan check karein ki user logged in hai ya nahi (e.g., token check)
    return !!localStorage.getItem('adminToken');
  }
  
  // Naya check function
  async isAdminLoggedIn(): Promise<boolean> {
    return !!this.auth.currentUser;
  }

}
