import { Component, inject } from '@angular/core';
import { DataService } from '../../../core/services/data.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { NoDataComponent } from '../../../core/components/shared/no-data/no-data.component';
import { ProductCardComponent } from '../../../core/components/shared/product-card/product-card.component';
import { ToastrService } from 'ngx-toastr';
import { SITE_CONFIG } from '../../../config/site-config';

@Component({
  selector: 'app-saved-products',
  imports: [CommonModule, RouterModule, NoDataComponent, ProductCardComponent],
  templateUrl: './saved-products.component.html',
  styleUrl: './saved-products.component.css',
})
export class SavedProductsComponent {
  siteData = SITE_CONFIG;
  private location = inject(Location);
  private dataService = inject(DataService);
  private toastr = inject(ToastrService);
  savedProducts: any[] = [];
  isLoading = true;

  private router = inject(Router);
  async ngOnInit() {
    await this.loadSavedData();
  }

  async loadSavedData() {
    this.isLoading = true;
    const allProducts = await firstValueFrom(this.dataService.getProducts());
    this.savedProducts = this.dataService.getSavedProductsFromList(allProducts);
    this.isLoading = false;
  }

  // Un-save functionality
  toggleSaved(product: any, event: Event) {
    event.stopPropagation(); // Card click na ho

    const isSaved: any = this.dataService.toggleSavedLocal(product);

    // Toast Notification logic
    if (isSaved) {
      this.toastr.success('Product saved successfully!', 'Success');
    } else {
      this.toastr.info('Product removed successfully!', 'Removed');
    }
    this.loadSavedData(); // List ko turant refresh karega
  }
  onOrderNow(product: any) {
    const textMessage = `Hello! I want to order this product:\n\n*Name:* ${product.name}\n*Price:* ₹${product.price}\n\nPlease share confirmation and payment details!`;
    const whatsappUrl = `https://wa.me/${this.siteData?.phone}?text=${encodeURIComponent(textMessage)}`;
    window.open(whatsappUrl, '_blank');
  }

  // Navigate karne ka function
  viewProduct(productId: string) {
    this.router.navigate(['/store/product', productId], {
      queryParams: { type: 'saved' },
    });
  }

  onImageError(event: any) {
    // अगर इमेज लोड नहीं हो पाती, तो उसे 'noimage.png' से रिप्लेस कर दें
    event.target.src = 'noimage.png';
  }
  goBack() {
    this.location.back();
  }
}
