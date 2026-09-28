import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css',
})
export class ProductListComponent {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  // Product State
  productsList: any[] = [];
  isEditingProduct = false;
  currentEditingProductId = '';

  filteredProducts: any[] = [];
  searchTerm: string = '';
  loadingData: boolean = false;
  categoriesList: any[] = [];

  ngOnInit(): void {
    this.loadingData = true;

    // 1. Categories load karein
    this.dataService.getCategories().subscribe({
      next: (data) => {
        this.categoriesList = data;
      },
      error: (err) => console.error('Error loading categories:', err),
    });

    // 2. Products load karein
    this.dataService.getProducts().subscribe({
      next: (data: any) => {
        console.log(data);
        this.productsList = data;
        this.filteredProducts = [...this.productsList];
        this.loadingData = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loadingData = false;
      },
    });
  }

  // Search filter implementation
  filterProducts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.productsList];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredProducts = this.productsList.filter(
        (prod) =>
          prod.name.toLowerCase().includes(term) ||
          (prod.description && prod.description.toLowerCase().includes(term)),
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredProducts = [...this.productsList];
  }

  productEdit(prod: any): void {
    this.router.navigate(['/admin/manage-product', prod.id]);
  }

  viewProduct(productId: string) {
    this.router.navigate(['/store/product', productId], {
      queryParams: { type: 'dashboard' },
    });
  }

  async removeProduct(id: string, name: string) {
    const result = await Swal.fire({
      html: `
        <div class="text-center pt-2 pb-1">
          <h3 class="text-slate-800 font-medium text-base mb-2">Delete ${name}</h3>
          <p class="text-slate-600 text-sm font-medium leading-relaxed">
            Are you sure you want to delete ${name}? This action cannot be undone.
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
          'flex-1 px-5 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap',
        cancelButton:
          'flex-1 px-5 py-3 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer whitespace-nowrap',
      },
    });

    if (result.isConfirmed) {
      try {
        await this.dataService.deleteProduct(id);
        await this.dataService.updateDashboardCounter('totalProducts', -1);
        this.toastr.success('Product deleted successfully!', 'Success');

        // Local list se turant hatane ke liye
        this.productsList = this.productsList.filter((p) => p.id !== id);
        this.filteredProducts = this.filteredProducts.filter(
          (p) => p.id !== id,
        );
      } catch (err) {
        console.error(err);
        this.toastr.error(
          'Failed to delete product. Please try again!',
          'Error',
        );
      }
    }
  }

  updateStockStatus(prod: any) {
    this.dataService
      .updateProductStock(prod.id, prod.inStock)
      .then(() => {
        console.log(`Stock updated for ${prod.name}:`, prod.inStock);
        this.toastr.success(`Stock updated successfully!`, 'Success');
      })
      .catch((err) => {
        console.error('Failed to update stock:', err);
        this.toastr.error(
          'Failed to update stock status. Please try again!',
          'Error',
        );
      });
  }

  onImageError(event: any) {
    event.target.src = 'assets/noimage.png';
  }
}
