import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/services/auth.service';
import { DataService } from '../../../../core/services/data.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-service-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './service-list.component.html',
  styleUrl: './service-list.component.css',
})
export class ServiceListComponent {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  serviceRequestsList: any[] = [];
  filteredServiceRequests: any[] = [];
  searchTerm: string = '';

  ngOnInit(): void {
    // 3. Service Requests load karein
    this.loadServiceRequests();
  }

  loadServiceRequests() {
    if (typeof (this.dataService as any).getServiceRequests === 'function') {
      (this.dataService as any).getServiceRequests().subscribe({
        next: (data: any) => {
          this.serviceRequestsList = data || [];
          this.filteredServiceRequests = [...this.serviceRequestsList];
        },
        error: (err: any) =>
          console.error('Failed to load service requests', err),
      });
    } else {
      this.serviceRequestsList = [];
      this.filteredServiceRequests = [];
    }
  }

  // ======= SEARCH FILTER =======
  filterServiceRequests(): void {
    if (!this.searchTerm.trim()) {
      this.filteredServiceRequests = [...this.serviceRequestsList];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredServiceRequests = this.serviceRequestsList.filter(
        (req) =>
          (req.name && req.name.toLowerCase().includes(term)) ||
          (req.clientName && req.clientName.toLowerCase().includes(term)) ||
          (req.phone && req.phone.toLowerCase().includes(term)) ||
          (req.mobile && req.mobile.toLowerCase().includes(term)) ||
          (req.address && req.address.toLowerCase().includes(term)) ||
          (req.location && req.location.toLowerCase().includes(term)) ||
          (req.serviceName && req.serviceName.toLowerCase().includes(term)) ||
          (req.title && req.title.toLowerCase().includes(term))
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredServiceRequests = [...this.serviceRequestsList];
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

  async removeServiceRequest(id: string, clientName: string) {
    const result = await Swal.fire({
      html: `
        <div class="text-left pt-2 pb-1">
          <h3 class="text-slate-900 font-bold text-base mb-2">Delete Service Request</h3>
          <p class="text-slate-600 text-xs font-light leading-relaxed">
            Are you sure you want to delete the request from <span class="font-semibold text-slate-800">"${clientName}"</span>? This action cannot be undone.
          </p>
        </div>
      `,
      showCancelButton: true,
      buttonsStyling: false,
      reverseButtons: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        popup:
          'bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 font-sans max-w-md w-full',
        actions: 'flex items-center gap-3 w-full mt-6 mb-0',
        confirmButton:
          'flex-1 px-5 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap',
        cancelButton:
          'flex-1 px-5 py-3 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer whitespace-nowrap',
      },
    });

    if (result.isConfirmed) {
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
        this.filteredServiceRequests = this.filteredServiceRequests.filter(
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