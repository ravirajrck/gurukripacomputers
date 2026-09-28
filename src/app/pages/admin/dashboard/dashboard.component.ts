import { Component, OnInit, inject } from '@angular/core';
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

  // Invoices & Date Range Filter Variables
  invoices: any[] = [];
  startDate: string = '';
  endDate: string = '';
  filteredTotalAmount: number = 0;
  totalFilteredInvoicesCount: number = 0;

  // Search State
  searchTerm = '';

  // Loaders & Error State
  loadingData = true;
  errorMessage: string | null = null;

  ngOnInit() {
    this.fetchStats();
    this.loadInvoicesForDateRange();
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

  // Date Range के लिए इन्वॉइस लोड करना
  loadInvoicesForDateRange() {
    this.dataService.getInvoices().subscribe({
      next: (data: any[]) => {
        this.invoices = data;
        this.setDefaultDateRange();
        this.calculateDateRangeTotal();
      },
      error: (err) => {
        console.error('Error loading invoices for date range:', err);
      }
    });
  }

  setDefaultDateRange() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.startDate = this.formatDate(firstDay);
    this.endDate = this.formatDate(today);
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  calculateDateRangeTotal() {
    if (!this.startDate || !this.endDate) {
      this.filteredTotalAmount = 0;
      this.totalFilteredInvoicesCount = 0;
      return;
    }

    const start = new Date(this.startDate).getTime();
    const end = new Date(this.endDate).getTime();
    const endTime = end + (24 * 60 * 60 * 1000) - 1; 

    const matchedInvoices = this.invoices.filter(inv => {
      if (!inv.invoice_date) return false;
      const invDate = new Date(inv.invoice_date).getTime();
      return invDate >= start && invDate <= endTime;
    });

    this.totalFilteredInvoicesCount = matchedInvoices.length;
    this.filteredTotalAmount = matchedInvoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
  }

  clearSearch() {
    this.searchTerm = '';
  }
}