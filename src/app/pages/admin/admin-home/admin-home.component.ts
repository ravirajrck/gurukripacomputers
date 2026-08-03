import { Component, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-home',
  imports: [RouterModule],
  templateUrl: './admin-home.component.html',
  styleUrl: './admin-home.component.css',
})
export class AdminHomeComponent {
  public router = inject(Router);

  onMobileNavChange(event: any): void {
    const selectedRoute = event.target.value;
    if (selectedRoute) {
      this.router.navigate([selectedRoute]);
    }
  }
}
