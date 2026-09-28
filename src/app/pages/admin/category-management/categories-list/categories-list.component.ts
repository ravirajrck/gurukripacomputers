import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.css',
})
export class CategoriesListComponent implements OnInit {
  private dataService = inject(DataService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  categoriesList: any[] = [];
  filteredCategories: any[] = [];
  productsList: any[] = [];

  newCategoryName: string = '';
  searchTerm: string = '';
  currentEditingCategoryId: string = '';
  tempEditCategoryName: string = '';

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.dataService.getCategories().subscribe({
      next: (data) => {
        this.categoriesList = data || [];
        this.filterCategories(); // Keep search filter active on reload
      },
      error: (err) => console.error('Error fetching categories:', err),
    });
  }

  loadProducts() {
    this.dataService.getProducts().subscribe({
      next: (data) => {
        this.productsList = data || [];
      },
      error: (err) => console.error('Error fetching products for validation:', err),
    });
  }

  // ======= SEARCH & FILTER METHODS =======
  filterCategories() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredCategories = [...this.categoriesList];
      return;
    }
    this.filteredCategories = this.categoriesList.filter((cat) =>
      cat.name.toLowerCase().includes(term)
    );
  }

  clearSearch() {
    this.searchTerm = '';
    this.filteredCategories = [...this.categoriesList];
  }

  // ======= ADD NEW CATEGORY =======
  async onSaveCategory() {
    const trimmedName = this.newCategoryName.trim();
    if (!trimmedName) return;

    const categoryExists = this.categoriesList.some(
      (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (categoryExists) {
      this.toastr.warning(
        `Category "${trimmedName}" already exists! Please use a different name.`,
        'Duplicate Category',
      );
      return;
    }

    try {
      await this.dataService.addCategory(trimmedName);
      await this.dataService.updateDashboardCounter('totalCategories', 1);

      this.toastr.success('Category added successfully!', 'Success');
      this.newCategoryName = '';
      this.loadCategories();
    } catch (err) {
      console.error(err);
      this.toastr.error('Something went wrong. Please try again!', 'Error');
    }
  }

  // ======= INLINE EDIT INITIATE =======
  editCategory(category: any) {
    if (category.isDelete === false) {
      this.toastr.error(
        'This category is protected and cannot be edited.',
        'Access Denied',
      );
      return;
    }

    this.currentEditingCategoryId = category.id;
    this.tempEditCategoryName = category.name;
  }

  // ======= CANCEL INLINE EDIT =======
  cancelCategoryEdit() {
    this.currentEditingCategoryId = '';
    this.tempEditCategoryName = '';
  }

  // ======= SAVE INLINE EDIT =======
  async updateCategoryInline(id: string) {
    const trimmedName = this.tempEditCategoryName.trim();
    if (!trimmedName) {
      this.toastr.warning('Category name cannot be empty!', 'Warning');
      return;
    }

    const categoryExists = this.categoriesList.some(
      (cat) =>
        cat.name.toLowerCase() === trimmedName.toLowerCase() &&
        cat.id !== id
    );

    if (categoryExists) {
      this.toastr.warning(
        `Category "${trimmedName}" already exists! Please use a different name.`,
        'Duplicate Category',
      );
      return;
    }

    try {
      await this.dataService.updateCategory(id, trimmedName);
      this.toastr.success('Category updated successfully!', 'Success');
      this.cancelCategoryEdit();
      this.loadCategories();
    } catch (err) {
      console.error(err);
      this.toastr.error('Failed to update category. Please try again!', 'Error');
    }
  }

  // ======= DELETE CATEGORY =======
  async removeCategory(id: string, categoryName: string) {
    const categoryToRemove = this.categoriesList.find((c) => c.id === id);
    if (categoryToRemove && categoryToRemove.isDelete === false) {
      this.toastr.error(
        'This category is protected and cannot be deleted.',
        'Access Denied',
      );
      return;
    }

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

    const result = await Swal.fire({
      html: `
        <div class="text-center pt-2 pb-1">
          <h3 class="text-slate-800 font-medium text-base mb-2">Delete ${categoryName}</h3>
          <p class="text-slate-600 text-sm font-medium leading-relaxed">
            Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.
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
        await this.dataService.deleteCategory(id);
        await this.dataService.updateDashboardCounter('totalCategories', -1);

        this.toastr.success('Category deleted successfully!', 'Success');
        this.loadCategories();
      } catch (err) {
        console.error(err);
        this.toastr.error(
          'Failed to delete category. Please try again!',
          'Error',
        );
      }
    }
  }
}