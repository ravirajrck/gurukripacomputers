import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../../core/services/data.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

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
  productsList: any[] = []; // Products list for association check
  
  newCategoryName: string = '';
  isEditingCategory: boolean = false;
  currentEditingCategoryId: string = '';

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.dataService.getCategories().subscribe({
      next: (data) => {
        this.categoriesList = data || [];
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
        // 1. Add Category to Firestore
        await this.dataService.addCategory(trimmedName);

        // 2. 📈 Update Dashboard Counter (+1 for Categories)
        await this.dataService.updateDashboardCounter('totalCategories', 1);

        this.toastr.success('Category added successfully!', 'Success');
        this.newCategoryName = '';
      }
      this.loadCategories(); // Refresh list
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
        // 1. Delete Category from Firestore
        await this.dataService.deleteCategory(id);

        // 2. 📉 Update Dashboard Counter (-1 for Categories)
        await this.dataService.updateDashboardCounter('totalCategories', -1);

        this.toastr.success('Category deleted successfully!', 'Success');
        this.loadCategories(); // Refresh list
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