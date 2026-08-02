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
      subtext: 'High Performance, Gaming, AIO PCs & AI Laptops',
      icon: '💻',
      catId: 'KAA8QHzOvg5h2P7NuvKh',
    },
    {
      name: 'Mobiles & Tabs',
    subtext: 'Smartphones, Tablets, Chargers, Cases, Glass & Power Banks',
      icon: '📱',
      catId: 'gswuNy5hhoe896sAFwHs',
    },
    {
      name: 'Audio & Wear',
      subtext: 'Earbuds, Bluetooth Speaker, Smartwatches & Neckbands, Headphone, Home Theater',
      icon: '🎧',
      catId: 'TrUjKtUmjGSAWphuDwX2',
    },
    {
      name: 'Peripherals',
      subtext: 'Keyboards, Mice, Webcams, Routers, UPS, Hubs, Gamepads & Mousepads',
      icon: '⌨️',
      catId: 'hhTUimwrRZJCW6LBhvcH',
    },
    {
      name: 'CCTV Cameras',
      subtext: 'Dome, Bullet, Wireless, NVR Kits, IP Cameras & PTZ, Wi-Fi & 360° View',
      icon: '📷',
      catId: 'BpZGJeGg27XtbY7jB2SD',
    },
    {
      name: 'Storage & Memory',
    subtext: 'SSDs, HDDs, Pen Drives, Memory Cards, RAM & External Drives',
      icon: '🛡️',
      catId: 'nJVKGK1lmJIlcARTBZhK',
    },
    // {
    //   name: 'Smart PTZ Cams',
    //   subtext: 'Wi-Fi & 360° View',
    //   icon: '🌐',
    //   catId: 'Cq6KU6eChAuLdfMtWOaU',
    // },
    {
      name: 'Cables & SMPS',
   subtext: 'Power Cords, HDMI, Data Cables, VGA, SMPS & Adapters',
      icon: '🔌',
      catId: 'jHKZ35Dadjmdv1N3jk6W',
    },
    {
      name: 'Networking',
      subtext: 'Switches, Extenders, LAN Cards, Adapters & Patch Cords',
      icon: '🌐',
      catId: 'Fx6y6DnS90z53u613ZrD',
    },
{
      name: 'Refurbished & Used',
      subtext: 'Second Hand Laptops, Refurbished Mobiles, Pre-Owned PCs & Open Box Items',
      icon: '♻️',
      catId: 'DzawQCDJOTqgPYnEdeD9',
    },
    {
      name: 'Touch Combo & Display',
      subtext: 'LCD Screens, Touch Glass, Display Panels & Flex Cables',
      icon: '📱',
      catId: 'svw2Kdm6f9ewYqbQF4Du',
    },
    {
      name: 'Printer & Accessories',
      subtext: 'Ink Cartridges, Toner, Printer Cables, Rollers & Refill Ink',
      icon: '🖨️',
      catId: '6GyJwWq9K4QXW7I4x4CO',
    },
    {
      name: 'Home Appliances',
      subtext: 'Refrigerator, Water Purifier, Mixer Grinder, Induction, Electric Chimney',
      icon: '🏠',
      catId: 'hUtetnDWv68GpPe4EwrZ',
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
