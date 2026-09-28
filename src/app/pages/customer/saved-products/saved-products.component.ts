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
import { MatDialog } from '@angular/material/dialog';
import { ConfirmOrderComponent } from '../confirm-order/confirm-order.component';

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
  private dialog = inject(MatDialog); // MatDialog Inject किया गया
  private router = inject(Router);

  savedProducts: any[] = [];
  isLoading = true;

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