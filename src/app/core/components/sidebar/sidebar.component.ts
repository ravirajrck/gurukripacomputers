import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { authState } from '@angular/fire/auth';
import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouterModule,
} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../services/sidebar.service';
import { ToastrService } from 'ngx-toastr';
import { SITE_CONFIG } from '../../../config/site-config';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  siteData = SITE_CONFIG;
  public authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  public sidebarService = inject(SidebarService); // Service inject ki

  isLoggedIn$ = authState(this.authService.auth);

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
