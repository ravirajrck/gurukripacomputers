import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';
import { DataService } from '../../../../core/services/data.service';

@Component({
  selector: 'app-service-list',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.css',
})
export class ServiceListComponent {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  serviceRequestsList: any[] = [];

  ngOnInit(): void {
    // 3. Service Requests load karein
    this.loadServiceRequests();
  }

  loadServiceRequests() {
    if (typeof (this.dataService as any).getServiceRequests === 'function') {
      (this.dataService as any).getServiceRequests().subscribe({
        next: (data: any) => {
          this.serviceRequestsList = data || [];
        },
        error: (err: any) =>
          console.error('Failed to load service requests', err),
      });
    } else {
      this.serviceRequestsList = [];
    }
  }

  // ======= SERVICE REQUEST ACTIONS =======
  updateServiceRequestStatus(req: any) {
    const service = this.dataService as any;
    if (typeof service.updateServiceRequestStatus === 'function') {
      service
        .updateServiceRequestStatus(req.id, req.status)
        .then(() => {
          this.toastr.success('Service request status updated!', 'Success');
        })
        .catch((err: any) => {
          console.error(err);
          this.toastr.error('Failed to update request status!', 'Error');
        });
    } else {
      this.toastr.success('Status updated locally!', 'Success');
    }
  }

async removeServiceRequest(id: string) {
    if (confirm('Are you sure you want to delete this service request?')) {
      try {
        const service = this.dataService as any;
        if (typeof service.deleteServiceRequest === 'function') {
          await service.deleteServiceRequest(id);
        }

        // 📉 Update Dashboard Counter (-1 for Service Requests)
        await this.dataService.updateDashboardCounter('totalServices', -1);

        this.serviceRequestsList = this.serviceRequestsList.filter(
          (r) => r.id !== id,
        );
        this.toastr.success('Service request deleted successfully!', 'Success');
      } catch (err) {
        console.error(err);
        this.toastr.error('Failed to delete service request!', 'Error');
      }
    }
  }
}
