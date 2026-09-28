import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { DataService } from '../../../core/services/data.service';
import { ToastrService } from 'ngx-toastr';
import { SITE_CONFIG } from '../../../config/site-config';


@Component({
  selector: 'app-confirm-order',
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './confirm-order.component.html',
  styleUrl: './confirm-order.component.css'
})
export class ConfirmOrderComponent {
  private firestore = inject(Firestore);
  private dataService = inject(DataService);
  private toastr = inject(ToastrService);
  siteData = SITE_CONFIG;

  name: string = '';
  phone: string = '';
  isLoading: boolean = false; // लोडर स्टेट

  constructor(
    public dialogRef: MatDialogRef<ConfirmOrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    if (this.isLoading) return;
    this.dialogRef.close();
  }

  async onSubmit() {
    if (this.name.trim() && this.phone.trim() && this.phone.length >= 10) {
      this.isLoading = true; // लोडर ऑन करें और बटन डिसेबल करें

      const product = this.data?.product;
      const currentUrl = window.location.origin + '/store/product/' + (product?.id || '');

      // 1. Firebase Order Object तैयार करें
      const newOrder = {
        id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
        customerName: this.name.trim(),
        phone: this.phone.trim(),
        address: 'Enquired via Product Detail Page',
        items: [{ 
          name: product?.name || 'Product', 
          quantity: 1, 
          price: product?.price || 0,
          productId: product?.id || '' 
        }],
        totalAmount: product?.price || 0,
        paymentMethod: 'WhatsApp Order',
        orderStatus: 'Pending',
        orderDate: new Date()
      };

      try {
        // 2. Firebase Firestore में 'orders' कलेक्शन में आर्डर सेव करें
        const ordersRef = collection(this.firestore, 'orders');
        await addDoc(ordersRef, newOrder);

        // डैशबोर्ड काउंटर अपडेट करें (+1)
        if (typeof (this.dataService as any).updateDashboardCounter === 'function') {
          await (this.dataService as any).updateDashboardCounter('totalOrders', 1);
        }

        this.toastr.success('Order placed & recorded successfully!', 'Success');

        // 3. WhatsApp Message तैयार करके ओपन करें
        const textMessage = `Hello! My name is *${this.name.trim()}* (${this.phone.trim()}). I want to order/enquire about this product:

*🔗 Product Link:*
${currentUrl}

*📦 Product Details:*
*Name:* ${product?.name}
*Price:* ₹${product?.price}

Please let me know about the availability and delivery details!`;

        window.open(
          `https://wa.me/${this.siteData?.phone}?text=${encodeURIComponent(textMessage)}`,
          '_blank',
        );

        // 4. डायलॉग बंद करें और सफलता भेजें
        this.dialogRef.close({ success: true, name: this.name.trim(), phone: this.phone.trim() });

      } catch (err) {
        console.error('Error saving order to Firebase:', err);
        this.toastr.error('Failed to record order in database!', 'Error');
        this.isLoading = false; // एरर आने पर लोडर हटा दें
      }
    }
  }
}