import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';

import {
  Router,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
  RouterModule,
} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { authState } from '@angular/fire/auth';
import { SidebarService } from '../../services/sidebar.service';
import { ToastrService } from 'ngx-toastr';
import { SITE_CONFIG } from '../../../config/site-config';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  siteData = SITE_CONFIG;
  public authService = inject(AuthService);
  public sidebarService = inject(SidebarService); // Service inject ki
  public router = inject(Router); // 'public' kiya taaki HTML mein direct check ho sake
  private cdr = inject(ChangeDetectorRef);
  private toastr = inject(ToastrService);

  isLoading = false;
  private timer: any;
  isLoggedIn$ = authState(this.authService.auth);

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
        this.cdr.detectChanges();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Yahan setTimeout ka use kiya hai loader ko thoda smooth dikhane ke liye
        this.timer = setTimeout(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }, 500); // 500ms ka delay
      }
    });
  }

  ngOnDestroy() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  async onLogout() {
    try {
      await this.authService.logout(); // Agar logout API promise hai
      this.toastr.info('Logged out successfully!', 'Session Ended');
      this.router.navigate(['/admin-login']);
    } catch (err) {
      console.error('Logout failed:', err);
      this.toastr.error('Failed to logout. Please try again!', 'Error');
    }
  }
}