import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
private dataService = inject(DataService);
  private toastr = inject(ToastrService);

  // Count Variables
  totalProductsCount: number = 0;
  totalOrdersCount: number = 0;
  totalServicesCount: number = 0;
  totalCategoriesCount: number = 0;

  // Search State
  searchTerm = '';

  // Loaders & Error State
  loadingData = true;
  errorMessage: string | null = null;

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.loadingData = true;
    this.errorMessage = null;

    this.dataService.getDashboardStats().subscribe({
      next: (docSnap) => {
        if (docSnap.exists()) {
          const stats = docSnap.data();
          this.totalProductsCount = stats['totalProducts'] || 0;
          this.totalOrdersCount = stats['totalOrders'] || 0;
          this.totalServicesCount = stats['totalServices'] || 0;
          this.totalCategoriesCount = stats['totalCategories'] || 0;
        } else {
          this.errorMessage = 'Stats document not found in database.';
          this.toastr.warning('Stats metadata missing!', 'Warning');
        }
        this.loadingData = false;
      },
      error: (err) => {
        console.error('Dashboard stats fetch error:', err);
        this.errorMessage = 'Failed to load dashboard metrics.';
        this.toastr.error('Failed to load dashboard metrics', 'Error');
        this.loadingData = false;
      },
    });
  }

  clearSearch() {
    this.searchTerm = '';
  }
}