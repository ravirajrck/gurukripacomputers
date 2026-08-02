import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { DataService } from '../../../../core/services/data.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-product',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.css',
})
export class AddProductComponent {
  private dataService = inject(DataService);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);
  private location: any = inject(Location);

  productForm!: FormGroup;
  isSaving = false;
  isLoading = true; // Shimmer ke liye loader flag
  categoriesList: any[] = [];
  isEditing = false;
  productId: string | null = null;

  constructor(private fb: FormBuilder) {}

  goBack() {
    this.location.back();
  }

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 1. Form Initialization
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: ['', Validators.required],
      originalPrice: [null, [Validators.required, Validators.min(1)]],
      price: [null, [Validators.required, Validators.min(1)]],
      inStock: [true, Validators.required],
      description: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(2000),
        ],
      ],
      images: this.fb.array([
        this.fb.group({ url: ['', Validators.required] }),
        this.fb.group({ url: ['', Validators.required] }),
        this.fb.group({ url: ['', Validators.required] }),
      ]),
    });

    // 2. Load Categories and Check for Edit Mode
    this.loadInitialData();
  }

  async loadInitialData() {
    this.isLoading = true;
    try {
      // Categories fetch karein
      this.dataService.getCategories().subscribe({
        next: (data) => {
          this.categoriesList = data;
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to load categories!', 'Error');
        },
      });

      // Route se ID check karein (Edit mode ke liye)
      this.productId = this.route.snapshot.paramMap.get('id');
      if (this.productId) {
        this.isEditing = true;
        await this.loadProductData(this.productId);
      } else {
        // Agar Add New Product hai toh loader turant hata dein
        this.isLoading = false;
      }
    } catch (error) {
      console.error(error);
      this.isLoading = false;
    }
  }

  async loadProductData(id: string) {
    try {
      const product = await this.dataService.getProductById(id);

      this.productForm.patchValue({
        name: product.name,
        categoryId: product.categoryId,
        originalPrice: product.originalPrice,
        price: product.price,
        inStock: product.inStock ?? true,
        description: product.description,
      });

      if (product.images && Array.isArray(product.images)) {
        this.imageArray.clear();
        product.images.forEach((img: any) => {
          this.imageArray.push(
            this.fb.group({ url: [img.url, Validators.required] }),
          );
        });

        while (this.imageArray.length < 3) {
          const isFirst = this.imageArray.length === 0;
          this.imageArray.push(
            this.fb.group({
              url: ['', isFirst ? Validators.required : null],
            }),
          );
        }
      }

      this.imageArray.markAllAsTouched();
    } catch (error) {
      console.error('Error loading product:', error);
      this.toastr.error('Failed to load product details for editing.', 'Error');
    } finally {
      this.isLoading = false; // Data load hone ke baad shimmer hat jayega
    }
  }

  get imageArray() {
    return this.productForm.get('images') as FormArray;
  }

  uploadImage(index: number) {
    const myWidget = (window as any).cloudinary.createUploadWidget(
      {
        cloudName: 'u2uihi8w',
        uploadPreset: 'my_shop_preset_rck_digi',
        sources: ['local'],
        clientAllowedFormats: ['image'],
        multiple: false,
        maxFiles: 1,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          this.imageArray.at(index).patchValue({
            url: result.info.secure_url,
          });
          this.toastr.success('Image uploaded successfully!', 'Success');
        } else if (error) {
          this.toastr.error('Image upload failed. Please try again!', 'Error');
        }
      },
    );
    myWidget.open();
  }

  removeImage(index: number) {
    this.imageArray.at(index).patchValue({
      url: '',
    });
    this.toastr.info('Image removed', 'Removed');
  }

  async onSaveProduct() {
    this.productForm.markAllAsTouched();

    const imagesArray = this.imageArray.value;
    const hasAtLeastOneImage = imagesArray.some(
      (img: any) => img.url && img.url.trim() !== '',
    );

    if (this.productForm.invalid || !hasAtLeastOneImage) {
      this.toastr.warning(
        'Please fill in all required fields.',
        'Validation Error',
      );
      return;
    }

    this.isSaving = true;
    try {
      const productData = this.productForm.value;

      if (this.isEditing && this.productId) {
        await this.dataService.updateProduct(this.productId, productData);
        this.toastr.success('Product updated successfully!', 'Success');
      } else {
        await this.dataService.addProduct(productData);
        this.toastr.success('Product added successfully!', 'Success');
      }

      this.goBack();
    } catch (error) {
      console.error('Error saving product: ', error);
      this.toastr.error('Failed to save product. Please try again.', 'Error');
    } finally {
      this.isSaving = false;
    }
  }

  onlyNumbers(event: Event) {
    const keyboardEvent = event as KeyboardEvent;
    const charCode = keyboardEvent.which
      ? keyboardEvent.which
      : keyboardEvent.keyCode;

    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      keyboardEvent.preventDefault();
    }
  }
}
