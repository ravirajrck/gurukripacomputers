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
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  // Category State
  newCategoryName = '';
  categoriesList: any[] = [];
  isEditingCategory = false;
  currentEditingCategoryId = '';

  // Product State
  productsList: any[] = [];
  isEditingProduct = false;
  currentEditingProductId = '';

  // Service Requests State
  serviceRequestsList: any[] = [];

  // Search State
  searchTerm = '';

  // Loaders
  loading = false;
  loadingData = true;

  showCategoryModal = false;

  ngOnInit() {
    this.loadingData = true;
  }

  clearSearch() {
    this.searchTerm = '';
  }
}
