import { CommonModule } from '@angular/common';
import { SwiperOptions } from 'swiper/types';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from '../../../core/services/data.service';
import { register } from 'swiper/element/bundle';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductCardComponent } from '../../../core/components/shared/product-card/product-card.component';
register();

@Component({
  selector: 'app-landing-page',
  imports: [CommonModule, ProductCardComponent, RouterModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private dataService = inject(DataService);
  private destroy$ = new Subject<void>();

  featuredProducts: any[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  currentSlide = 0;
  totalSlides = 3;
  private slideInterval: any;
  popularProducts: any[] = [];
  isLoadingPopular: boolean = false;
  errorPopularMessage: string | null = null;

  categories = [
    {
      name: 'Laptops & PCs',
      subtext: 'High Performance',
      icon: '💻',
      catId: 'KAA8QHzOvg5h2P7NuvKh',
    },
    {
      name: 'Mobiles & Tabs',
      subtext: 'Latest Devices',
      icon: '📱',
      catId: 'gswuNy5hhoe896sAFwHs',
    },
    {
      name: 'Audio & Wear',
      subtext: 'Immersive Sound',
      icon: '🎧',
      catId: 'TrUjKtUmjGSAWphuDwX2',
    },
    {
      name: 'Peripherals',
      subtext: 'Gaming & Office',
      icon: '⌨️',
      catId: 'hhTUimwrRZJCW6LBhvcH',
    },
    {
      name: 'CCTV Cameras',
      subtext: 'HD & IP Security',
      icon: '📷',
      catId: 'BpZGJeGg27XtbY7jB2SD',
    },
    {
      name: 'NVR & DVR Kits',
      subtext: 'Storage & Setup',
      icon: '🛡️',
      catId: 'nJVKGK1lmJIlcARTBZhK',
    },
    {
      name: 'Smart PTZ Cams',
      subtext: 'Wi-Fi & 360° View',
      icon: '🌐',
      catId: 'Cq6KU6eChAuLdfMtWOaU',
    },
    {
      name: 'Cables & SMPS',
      subtext: 'Power & Connectors',
      icon: '🔌',
      catId: 'jHKZ35Dadjmdv1N3jk6W',
    },
  ];

  ngOnInit() {
    this.loadFeaturedProducts();
    this.loadPopularProducts();

    // Auto-play slider (har 5 second mein slide change hogi)
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }
  loadPopularProducts() {
    this.isLoadingPopular = true;
    this.errorPopularMessage = null;

    // Yahan apni 'popular' category ki actual ID dal dein jo Firestore mein hai
    const popularCategoryId = 'O4sC098VsEb3nCFsxudj';

    this.dataService
      .getPopularProducts(popularCategoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.popularProducts = data;
          this.isLoadingPopular = false;
        },
        error: (err) => {
          console.error('Error loading popular products:', err);
          this.errorPopularMessage =
            'Popular products load karne me samasya aayi. Kripya baad me koshish karein.';
          this.isLoadingPopular = false;
        },
      });
  }

  loadFeaturedProducts() {
    this.isLoading = true;
    this.errorMessage = null;

    // Yahan apni 'featured' category ki actual ID dal dein jo Firestore mein hai
    const featuredCategoryId = 'xsyA70709hw6kcVfBkuZ';

    this.dataService
      .getFeaturedProducts(featuredCategoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.featuredProducts = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading featured products:', err);
          this.errorMessage =
            'Featured products load karne me samasya aayi. Kripya baad me koshish karein.';
          this.isLoading = false;
        },
      });
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  prevSlide() {
    this.currentSlide =
      (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  swiperConfig: SwiperOptions = {
    slidesPerView: 2,
    spaceBetween: 10,
    loop: true,
    autoplay: { delay: 3000 },
    breakpoints: {
      768: { slidesPerView: 4 },
    },
  };

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  // WhatsApp Checkout Action Link
  onOrderNow(product: any) {
    const currentUrl = window.location.href + '/product/' + product.id;
    const textMessage = `Hello! I want to order this product:
*🔗 Product Link:*
${currentUrl}

*📦 Product Details:*
*Name:* ${product.name}
*Price:* ₹${product.price}
*Original Price:* ₹${product.originalPrice}

*📝 Description:*
${product.description}

*🖼️ Images:*
${product.images.map((img: any, i: number) => (img.url ? `Image ${i + 1}: ${img.url}` : '')).join('\n')}

Please let me know about the availability!`;
    const whatsappUrl = `https://wa.me/919644692189?text=${encodeURIComponent(textMessage)}`; // 👈 XXXXXXXXXX ki jagah apna link phone number daal dena
    window.open(whatsappUrl, '_blank');
  }

  // Navigate karne ka function
  viewProduct(productId: string) {
    this.router.navigate(['/store/product', productId], {
      queryParams: { type: 'store' },
    });
  }

  onImageError(event: any) {
    // अगर इमेज लोड नहीं हो पाती, तो उसे 'noimage.png' से रिप्लेस कर दें
    event.target.src = 'noimage.png';
  }

  // Save/Toggle Logic
  toggleSaved(prod: any, event: Event) {
    event.stopPropagation(); // Parent card click na ho
    const isSaved: any = this.dataService.toggleSavedLocal(prod);

    // Toast Notification logic
    if (isSaved) {
      this.toastr.success('Product saved successfully!', 'Success');
    } else {
      this.toastr.info('Product removed successfully!', 'Removed');
    }
  }

  // Check karne ke liye ki product saved hai ya nahi
  isSaved(productId: string): boolean {
    return this.dataService.isProductSaved(productId);
  }
}
