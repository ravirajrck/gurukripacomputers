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

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private location = inject(Location);
    isLoading = false;
  @ViewChild('swiperRef') swiperRef: ElementRef | undefined;

  product: any = null;
  loading = true;
  activeImage: string = ''; // Slider ke liye
  sourceType: string = '';
  async ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.route.queryParams.subscribe((params) => {
      this.sourceType = params['type']; // Yahan 'store' milega
      console.log('Coming from:', this.sourceType);
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.product = await this.dataService.getProductById(id);
      this.activeImage = this.product?.images?.[0]?.url; // Default image
      this.loading = false;
    }
  }

  changeImage(url: string, index: number) {
    this.activeImage = url;
    // Swiper ko batayein ki konsi slide par jana hai
    if (this.swiperRef?.nativeElement?.swiper) {
      this.swiperRef.nativeElement.swiper.slideTo(index);
    }

    // if (window.innerWidth < 768) {
    //   window.scrollTo({ top: 0, behavior: 'smooth' });
    // }
  }

  onSlideChange(event: any) {
    const swiperEl = event.target;
    const activeIndex = swiperEl.swiper.activeIndex;

    if (this.product?.images && this.product.images[activeIndex]) {
      this.activeImage = this.product.images[activeIndex].url;
    }
  }

  orderOnWhatsApp() {
    const message = `Hi! I am interested in this product: ${this.product.name}. 
  Could you please provide more details and current availability?`;

    window.open(
      `https://wa.me/YOUR_NUMBER?text=${encodeURIComponent(message)}`,
      '_blank',
    );
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
    // अगर इमेज लोड नहीं हो पाती, तो उसे 'noimage.png' से रिप्लेस कर दें
    event.target.src = 'noimage.png';
  }

  isExpanded: boolean = false;

  toggleDescription() {
    this.isExpanded = !this.isExpanded;
  }


  toggleSaved() {
    if (this.isLoading) return;
    this.isLoading = true;

    // Data service call
    this.dataService.toggleSavedLocal(this.product);

    // Thoda sa visual loading effect dikhane ke baad loader hata dein
    setTimeout(() => {
      this.isLoading = false;
    }, 400);
  }

  // Check karne ke liye button active hai ya nahi
  isSaved(): boolean {
    return this.dataService.isProductSaved(this.product.id);
  }
}
