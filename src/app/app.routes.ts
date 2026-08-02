import { Routes } from '@angular/router';
// import { HomeComponent } from './pages/customer/home/home.component';
// import { ProductDetailComponent } from './pages/customer/product-detail/product-detail.component';
import { LoginComponent } from './pages/admin/auth/login/login.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { CustomerStoreComponent } from './pages/customer/customer-store/customer-store.component';
import { ProductDetailComponent } from './pages/customer/product-detail/product-detail.component';
import { HomeComponent } from './pages/customer/home/home.component';
import { AdminHomeComponent } from './pages/admin/admin-home/admin-home.component';
import { SavedProductsComponent } from './pages/customer/saved-products/saved-products.component';
import { AddProductComponent } from './pages/admin/product-management/add-product/add-product.component';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { LandingPageComponent } from './pages/customer/landing-page/landing-page.component';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { TermsComponent } from './pages/terms/terms.component';
import { ServicesComponent } from './pages/customer/services/services.component';
import { OrderListComponent } from './pages/admin/order-management/product-list/order-list/order-list.component';
import { ServiceListComponent } from './pages/admin/service-management/service-list/service-list.component';
import { CategoriesListComponent } from './pages/admin/category-management/categories-list/categories-list.component';
import { ProductListComponent } from './pages/admin/product-management/product-list/product-list.component';

export const routes: Routes = [
  {
    path: 'store',
    component: HomeComponent, // Yeh aapka main wrapper component hai
    children: [
      { path: '', component: CustomerStoreComponent },
      { path: 'product/:id', component: ProductDetailComponent },
      { path: 'saved', component: SavedProductsComponent },
    ],
  },

  {
    path: '',
    component: LandingPageComponent,
  },
  { path: 'about', component: AboutComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'services', component: ServicesComponent },
  // Suggestion
  {
    path: 'admin',
    canActivate: [authGuard],
    component: AdminHomeComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'products', component: ProductListComponent },
      { path: 'categories', component: CategoriesListComponent },
      { path: 'services', component: ServiceListComponent },
      { path: 'orders', component: OrderListComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'manage-product', component: AddProductComponent },
      { path: 'manage-product/:id', component: AddProductComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'admin-login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },

  {
    path: '**',
    redirectTo: '',
  },
];
