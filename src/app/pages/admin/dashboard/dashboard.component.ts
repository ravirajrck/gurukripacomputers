import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { ClickBtnComponent } from '../../../core/components/shared/click-btn/click-btn.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ClickBtnComponent],
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

    // 1. Categories load karein
    this.dataService.getCategories().subscribe({
      next: (data) => {
        this.categoriesList = data;
      },
      error: (err) => console.error(err),
    });

    // 2. Products load karein
    this.dataService.getProducts().subscribe({
      next: (data) => {
        this.productsList = data;
        this.loadingData = false;
      },
      error: (err) => {
        console.error(err);
        this.loadingData = false;
      },
    });

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

  get filteredProducts() {
    if (!this.searchTerm.trim()) {
      return this.productsList;
    }
    const term = this.searchTerm.toLowerCase().trim();
    return this.productsList.filter(
      (prod) =>
        (prod.name && prod.name.toLowerCase().includes(term)) ||
        (prod.description && prod.description.toLowerCase().includes(term)),
    );
  }

  clearSearch() {
    this.searchTerm = '';
  }

  productEdit(product: any = null) {
    this.router.navigate(['/admin/manage-product', product.id]);
  }

  // ======= CATEGORY ACTIONS =======
  async onSaveCategory() {
    const trimmedName = this.newCategoryName.trim();
    if (!trimmedName) return;

    // Agar edit mode mein hain aur purani category isDelete === false hai, toh block karein
    if (this.isEditingCategory) {
      const currentCat = this.categoriesList.find(
        (c) => c.id === this.currentEditingCategoryId,
      );
      if (currentCat && currentCat.isDelete === false) {
        this.toastr.error(
          'This category is protected and cannot be modified!',
          'Action Denied',
        );
        return;
      }
    }

    // 1. Duplicate Category Check (Case-insensitive)
    const categoryExists = this.categoriesList.some(
      (cat) =>
        cat.name.toLowerCase() === trimmedName.toLowerCase() &&
        (!this.isEditingCategory || cat.id !== this.currentEditingCategoryId),
    );

    if (categoryExists) {
      this.toastr.warning(
        `Category "${trimmedName}" already exists! Please use a different name.`,
        'Duplicate Category',
      );
      return;
    }

    try {
      if (this.isEditingCategory) {
        await this.dataService.updateCategory(
          this.currentEditingCategoryId,
          trimmedName,
        );
        this.toastr.success('Category updated successfully!', 'Success');
        this.cancelCategoryEdit();
      } else {
        await this.dataService.addCategory(trimmedName);
        this.toastr.success('Category added successfully!', 'Success');
        this.newCategoryName = '';
      }
    } catch (err) {
      console.error(err);
      this.toastr.error('Something went wrong. Please try again!', 'Error');
    }
  }

  editCategory(category: any) {
    // 🛡️ Security Check: Agar isDelete false hai toh edit allow mat karo
    if (category.isDelete === false) {
      this.toastr.error(
        'This category is protected and cannot be edited.',
        'Access Denied',
      );
      return;
    }

    this.isEditingCategory = true;
    this.currentEditingCategoryId = category.id;
    this.newCategoryName = category.name;
  }

  cancelCategoryEdit() {
    this.isEditingCategory = false;
    this.currentEditingCategoryId = '';
    this.newCategoryName = '';
  }

  async removeCategory(id: string, categoryName: string) {
    // Find category to check isDelete status
    const categoryToRemove = this.categoriesList.find((c) => c.id === id);
    if (categoryToRemove && categoryToRemove.isDelete === false) {
      this.toastr.error(
        'This category is protected and cannot be deleted.',
        'Access Denied',
      );
      return;
    }

    // 2. Check if any product is associated with this category
    const hasAssociatedProducts = this.productsList.some(
      (prod) => prod.categoryId === id,
    );

    if (hasAssociatedProducts) {
      this.toastr.error(
        `Cannot delete "${categoryName}" because it has active products assigned to it. Please reassign or delete those products first.`,
        'Action Denied',
      );
      return;
    }

    if (
      confirm(`Are you sure you want to delete the category "${categoryName}"?`)
    ) {
      try {
        await this.dataService.deleteCategory(id);
        this.toastr.success('Category deleted successfully!', 'Success');
      } catch (err) {
        console.error(err);
        this.toastr.error(
          'Failed to delete category. Please try again!',
          'Error',
        );
      }
    }
  }

  async removeProduct(id: string, name: string) {
    if (confirm(`Are you sure you want to delete the product "${name}"?`)) {
      try {
        await this.dataService.deleteProduct(id);
        this.toastr.success('Product deleted successfully!', 'Success');
      } catch (err) {
        console.error(err);
        this.toastr.error(
          'Failed to delete product. Please try again!',
          'Error',
        );
      }
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

  viewProduct(productId: string) {
    this.router.navigate(['/store/product', productId], {
      queryParams: { type: 'dashboard' },
    });
  }

  onImageError(event: any) {
    event.target.src = 'noimage.png';
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
}
