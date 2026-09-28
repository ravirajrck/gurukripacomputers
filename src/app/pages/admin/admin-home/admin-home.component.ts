import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { authState } from '@angular/fire/auth';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-home',
  imports: [CommonModule, RouterModule, AdminSidebarComponent],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css',
})
export class AdminHomeComponent implements OnInit, OnDestroy {
  public router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  public authService = inject(AuthService);
  private toastr = inject(ToastrService);
  isLoggedIn$ = authState(this.authService.auth);

  pageTitle: string = 'Dashboard';
  private routerSub!: Subscription;

  ngOnInit(): void {
    // Current URL se initial title set karein
    this.updatePageTitle(this.router.url);

    // Jab bhi route change ho, title automatically update ho jaye
    this.routerSub = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects);
    });
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  // URL ko parse karke 'admin' ke baad wala text nikalne ka logic
  updatePageTitle(url: string) {
    const segments = url.split('/').filter(segment => segment.length > 0);
    const adminIndex = segments.indexOf('admin');
    
    if (adminIndex !== -1 && segments[adminIndex + 1]) {
      // Agar '/admin/invoices/edit' hai toh pehla segment 'invoices' uthayega
      let rawTitle = segments[adminIndex + 1];
      // '-' ko space me badal de (jaise 'user-profile' ko 'user profile')
      this.rawTitleFormat(rawTitle);
    } else {
      this.pageTitle = 'Dashboard';
    }
  }

  rawTitleFormat(title: string) {
    this.pageTitle = title.replace(/-/g, ' ');
  }

  onMobileNavChange(event: any): void {
    const selectedRoute = event.target.value;
    if (selectedRoute) {
      this.router.navigate([selectedRoute]);
    }
  }

  async onLogout() {
    try {
      await this.authService.logout();
      this.toastr.info('Logged out successfully!', 'Session Ended');
      this.router.navigate(['/admin-login']);
    } catch (err) {
      console.error('Logout failed:', err);
      this.toastr.error('Failed to logout. Please try again!', 'Error');
    }
  }
}