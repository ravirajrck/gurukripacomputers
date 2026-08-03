import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, RouterModule } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, FormsModule, RouterModule],
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
        // Yahan data ko apne array me assign karein
        this.productsList = data;
        this.filteredProducts = [...this.productsList]; // Data milte hi filter list bhi update karein
        this.loadingData = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.loadingData = false;
      },
    });
  }

  //   get filteredProducts() {
  //   if (!this.searchTerm.trim()) {
  //     return this.productsList;
  //   }
  //   const term = this.searchTerm.toLowerCase().trim();
  //   return this.productsList.filter(
  //     (prod) =>
  //       (prod.name && prod.name.toLowerCase().includes(term)) ||
  //       (prod.description && prod.description.toLowerCase().includes(term)),
  //   );
  // }
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
    if (confirm(`Are you sure you want to delete the product "${name}"?`)) {
      try {
        // 1. Product delete karein
        await this.dataService.deleteProduct(id);

        // 2. Dashboard counter me totalProducts ko -1 karein
        await this.dataService.updateDashboardCounter('totalProducts', -1);

        this.toastr.success('Product deleted successfully!', 'Success');

        // Agar aap local list se bhi turant hatana chahte hain toh ye line add kar sakte hain:
        // this.productsList = this.productsList.filter(p => p.id !== id);
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
    event.target.src = 'noimage.png';
  }
  // onImageError(event: any): void {
  //   event.target.src = 'assets/noimage.png';
  // }
}
