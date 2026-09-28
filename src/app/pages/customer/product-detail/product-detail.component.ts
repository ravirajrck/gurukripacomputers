import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import { CommonModule, Location } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SITE_CONFIG } from '../../../config/site-config';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmOrderComponent } from '../confirm-order/confirm-order.component';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductDetailComponent implements OnInit {
  siteData = SITE_CONFIG;
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private toastr = inject(ToastrService);
  private location = inject(Location);
  private dialog = inject(MatDialog);

  isLoading = false;
  @ViewChild('swiperRef') swiperRef: ElementRef | undefined;

  product: any = null;
  loading = true;
  activeImage: string = '';
  sourceType: string = '';

  async ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.route.queryParams.subscribe((params) => {
      this.sourceType = params['type'];
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.product = await this.dataService.getProductById(id);
      this.activeImage = this.product?.images?.[0]?.url;
      this.loading = false;
    }
  }

  // ======= MAT-DIALOG OPEN & SELF-CONTAINED LOGIC =======
  orderOnWhatsApp() {
    this.dialog.open(ConfirmOrderComponent, {
      width: '420px',
      panelClass: 'custom-dialog-container',
      data: { 
        productName: this.product.name,
        product: this.product 
      },
      disableClose: true 
    });
  }

  changeImage(url: string, index: number) {
    this.activeImage = url;
    if (this.swiperRef?.nativeElement?.swiper) {
      this.swiperRef.nativeElement.swiper.slideTo(index);
    }
  }

  onSlideChange(event: any) {
    const swiperEl = event.target;
    const activeIndex = swiperEl.swiper.activeIndex;
    if (this.product?.images && this.product.images[activeIndex]) {
      this.activeImage = this.product.images[activeIndex].url;
    }
  }

  shareProduct() {
    if (navigator.share) {
      navigator.share({ title: this.product.name, url: window.location.href });
    }
  }

  goBack() {
    this.location.back();
  }

  onImageError(event: any) {
    event.target.src = 'noimage.png';
  }

  isExpanded: boolean = false;

  toggleSaved() {
    if (this.isLoading) return;
    this.isLoading = true;
    const isSaved: any = this.dataService.toggleSavedLocal(this.product);
    if (isSaved) {
      this.toastr.success('Product saved successfully!', 'Success');
    } else {
      this.toastr.info('Product removed successfully!', 'Removed');
    }
    setTimeout(() => {
      this.isLoading = false;
    }, 400);
  }

  isSaved(): boolean {
    return this.dataService.isProductSaved(this.product.id);
  }
}