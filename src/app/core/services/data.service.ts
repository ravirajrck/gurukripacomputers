import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  limit,
  orderBy,
  where,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private firestore = inject(Firestore);

  // ====== CATEGORIES CRUD ======
  addCategory(categoryName: string) {
    const categoriesRef = collection(this.firestore, 'categories');
    return addDoc(categoriesRef, { name: categoryName, createdAt: new Date() });
  }

  getCategories(): Observable<any[]> {
    const categoriesRef = collection(this.firestore, 'categories');
    return collectionData(categoriesRef, { idField: 'id' });
  }

  updateCategory(categoryId: string, newName: string) {
    const categoryDocRef = doc(this.firestore, `categories/${categoryId}`);
    return updateDoc(categoryDocRef, { name: newName });
  }

  deleteCategory(categoryId: string) {
    const categoryDocRef = doc(this.firestore, `categories/${categoryId}`);
    return deleteDoc(categoryDocRef);
  }

  // ====== PRODUCTS CRUD ======
  addProduct(product: any) {
    const productsRef = collection(this.firestore, 'products');
    return addDoc(productsRef, { ...product, createdAt: new Date() });
  }

  getProducts(): Observable<any[]> {
    const productsRef = collection(this.firestore, 'products');
    return collectionData(productsRef, { idField: 'id' });
  }

  updateProduct(productId: string, updatedData: any) {
    const productDocRef = doc(this.firestore, `products/${productId}`);
    return updateDoc(productDocRef, updatedData);
  }

  updateProductStock(productId: string, inStock: boolean) {
    const productDocRef = doc(this.firestore, `products/${productId}`);
    return updateDoc(productDocRef, { inStock: inStock });
  }

  deleteProduct(productId: string) {
    const productDocRef = doc(this.firestore, `products/${productId}`);
    return deleteDoc(productDocRef);
  }

  async getProductById(id: string): Promise<any> {
    const docRef = doc(this.firestore, 'products', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Product not found!');
    }
  }

  async getCategoryById(id: string): Promise<any> {
    const docRef = doc(this.firestore, 'categories', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return { name: 'Uncategorized' };
  }

  getSavedProductsFromList(allProducts: any[]): any[] {
    const savedIds = JSON.parse(localStorage.getItem('saved_products') || '[]');
    if (savedIds.length === 0) return [];
    return allProducts.filter((prod) => savedIds.includes(prod.id));
  }

  toggleSavedLocal(product: any): boolean {
    let savedIds = JSON.parse(localStorage.getItem('saved_products') || '[]');
    const index = savedIds.indexOf(product.id);
    let isSaved = false;

    if (index > -1) {
      savedIds.splice(index, 1);
      isSaved = false;
    } else {
      savedIds.push(product.id);
      isSaved = true;
    }

    localStorage.setItem('saved_products', JSON.stringify(savedIds));
    return isSaved;
  }

  isProductSaved(productId: string): boolean {
    const savedIds = JSON.parse(localStorage.getItem('saved_products') || '[]');
    return savedIds.includes(productId);
  }

  async getAllProductsFromFirestore(): Promise<any[]> {
    const productsCollection = collection(this.firestore, 'products');
    const snapshot = await getDocs(productsCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // ====== SERVICES & INQUIRIES ======
  async getServices(): Promise<any[]> {
    const servicesRef = collection(this.firestore, 'services');
    const snapshot = await getDocs(servicesRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async seedServices(servicesArray: any[]) {
    const promises = servicesArray.map(async (service) => {
      const serviceDocRef = doc(this.firestore, `services/${service.id}`);
      const { id, ...dataToSave } = service;

      return setDoc(serviceDocRef, {
        ...dataToSave,
        createdAt: new Date(),
      });
    });

    await Promise.all(promises);
    console.log('All services uploaded successfully!');
  }

  submitServiceInquiry(inquiryData: any) {
    const inquiriesRef = collection(this.firestore, 'serviceInquiries');
    return addDoc(inquiriesRef, {
      ...inquiryData,
      createdAt: new Date(),
    });
  }

  getServiceRequests(): Observable<any[]> {
    const inquiriesRef = collection(this.firestore, 'serviceInquiries');
    return collectionData(inquiriesRef, { idField: 'id' });
  }

  updateServiceRequestStatus(requestId: string, status: string) {
    const requestDocRef = doc(this.firestore, `serviceInquiries/${requestId}`);
    return updateDoc(requestDocRef, { status: status });
  }

  deleteServiceRequest(requestId: string) {
    const requestDocRef = doc(this.firestore, `serviceInquiries/${requestId}`);
    return deleteDoc(requestDocRef);
  }

  getFeaturedProducts(categoryId: string): Observable<any[]> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(
      productsRef,
      where('categoryId', '==', categoryId),
      limit(6),
    );

    return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(
      map((products) => products || []),
      catchError((error) => {
        console.error('Error fetching featured products:', error);
        return of([]);
      }),
    );
  }

  // ====== POPULAR PRODUCTS (Using Category ID) ======
  getPopularProducts(categoryId: string): Observable<any[]> {
    const productsRef = collection(this.firestore, 'products');

    // Yahan 'categoryId' field ke sath '==' karke us ID se match karenge
    const q = query(
      productsRef,
      where('categoryId', '==', categoryId),
      limit(6),
    );

    return (collectionData(q, { idField: 'id' }) as Observable<any[]>).pipe(
      map((products) => products || []),
      catchError((error) => {
        console.error('Error fetching popular products:', error);
        return of([]);
      }),
    );
  }
}
