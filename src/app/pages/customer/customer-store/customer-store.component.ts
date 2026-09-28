import {
  Component,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { NoDataComponent } from '../../../core/components/shared/no-data/no-data.component';
import { ProductCardComponent } from '../../../core/components/shared/product-card/product-card.component';
import { ToastrService } from 'ngx-toastr';
import { Subject, takeUntil } from 'rxjs';
import { SITE_CONFIG } from '../../../config/site-config';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmOrderComponent } from '../confirm-order/confirm-order.component';

@Component({
  selector: 'app-customer-store',
  standalone: true,
  imports: [CommonModule, FormsModule, NoDataComponent, ProductCardComponent],
  templateUrl: './customer-store.component.html',
  styleUrls: ['./customer-store.component.css'],
})
export class CustomerStoreComponent implements OnInit, OnDestroy {
  siteData = SITE_CONFIG;

  // Data Arrays
  productsList: any[] = [];
  categoriesList: any[] = [];
  savedItems: any[] = [];

  // Filtering & Loader States
  searchQuery: string = '';
  selectedCategory: string = 'all';
  isLoading: boolean = true;

  // Category Popup Dropdown State
  isCategoryDropdownOpen: boolean = false;

  // Dropdown Container Reference for Outside Click
  @ViewChild('categoryDropdownContainer') categoryDropdownContainer!: ElementRef;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private dataService = inject(DataService);
  private dialog = inject(MatDialog); // MatDialog Inject किया गया
  private destroy$ = new Subject<void>();

  constructor(private firestore: Firestore) {}

  ngOnInit(): void {
    this.loadCategoriesFromFirestore();
    this.loadProductsFromFirestore();

    // ⚡ URL se Query Params (category, featured, popular) ko turant catch karein
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        const catParam = params['category'];
        if (catParam) {
          this.selectedCategory = catParam;
        } else {
          this.selectedCategory = 'all';
        }
      });
  }

  // Firestore: Load Categories
  loadCategoriesFromFirestore() {
    const categoriesCollection = collection(this.firestore, 'categories');
    collectionData(categoriesCollection, { idField: 'id' }).subscribe({
      next: (res: any[]) => {
        this.categoriesList = res;
      },
      error: (err) => console.error('Categories read failed:', err),
    });
  }

  // Firestore: Load Products
  loadProductsFromFirestore() {
    const productsCollection = collection(this.firestore, 'products');
    collectionData(productsCollection, { idField: 'id' }).subscribe({
      next: (res: any[]) => {
        this.productsList = res;
        this.isLoading = false;
        this.updateSavedList();
      },
      error: (err) => {
        console.error('Products read failed:', err);
        this.isLoading = false;
      },
    });
  }

  // Saved list ko update karne ke liye
  updateSavedList() {
    this.savedItems = this.dataService.getSavedProductsFromList(
      this.productsList,
    );
  }

  // Helper method to display selected category name on the toggle button
  getSelectedCategoryName(): string {
    if (this.selectedCategory === 'all') return 'All Categories';
    if (this.selectedCategory === 'featured') return 'Featured Products';
    if (this.selectedCategory === 'popular') return 'Popular Products';

    const found = this.categoriesList.find(
      (c) => c.id === this.selectedCategory,
    );
    return found ? found.name : 'Select Category';
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (
      this.categoryDropdownContainer &&
      !this.categoryDropdownContainer.nativeElement.contains(event.target)
    ) {
      this.isCategoryDropdownOpen = false;
    }
  }

  // ⚡ Live Filter Logic (Category ID & Special Flags Match)
  get filteredProducts() {
    let output = this.productsList;

    // 1. Category / Type Filter Toggling
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      if (this.selectedCategory === 'featured') {
        output = output.filter(
          (prod) => prod.isFeatured === true || prod.featured === true,
        );
      } else if (this.selectedCategory === 'popular') {
        output = output.filter(
          (prod) => prod.isPopular === true || prod.popular === true,
        );
      } else {
        output = output.filter(
          (prod) =>
            String(prod.categoryId).trim() ===
            String(this.selectedCategory).trim(),
        );
      }
    }

    // 2. Realtime Keyboard Input Search
    if (this.searchQuery && this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      output = output.filter(
        (prod) =>
          (prod.name && prod.name.toLowerCase().includes(query)) ||
          (prod.description && prod.description.toLowerCase().includes(query)),
      );
    }

    return output;
  }

  // Updated: Open ConfirmOrderComponent Dialog instead of direct WhatsApp call
  onOrderNow(product: any): void {
    this.dialog.open(ConfirmOrderComponent, {
      width: '420px',
      panelClass: 'custom-dialog-container',
      data: { 
        productName: product.name,
        product: product // पूरा प्रोडक्ट ऑब्जेक्ट पास कर रहे हैं ताकि डायलॉग Firebase में सही डेटा सेव कर सके
      },
      disableClose: true
    });
  }

  // Navigate to Product Details
  viewProduct(productId: string) {
    this.router.navigate(['/store/product', productId], {
      queryParams: { type: 'store' },
    });
  }

  onImageError(event: any) {
    event.target.src = 'noimage.png';
  }

  // Save/Toggle Logic
  toggleSaved(prod: any, event: Event) {
    event.stopPropagation();
    const isSaved: any = this.dataService.toggleSavedLocal(prod);

    if (isSaved) {
      this.toastr.success('Product saved successfully!', 'Success');
    } else {
      this.toastr.info('Product removed successfully!', 'Removed');
    }
  }

  // Check if product is saved
  isSaved(productId: string): boolean {
    return this.dataService.isProductSaved(productId);
  }

  // Cleanup on destroy
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}