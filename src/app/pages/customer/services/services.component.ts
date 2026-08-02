import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../core/services/data.service';
import { SITE_CONFIG } from '../../../config/site-config';
@Component({
  selector: 'app-services',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
})
export class ServicesComponent {
  siteData = SITE_CONFIG;
  private dataService = inject(DataService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);

  servicesList: any[] = [];
  loading = true;
  showModal = false;
  selectedService: any = null;
  isSubmitting = false;

  inquiryForm!: FormGroup;
  minDate: string = '';

  ngOnInit() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.initForm();
    this.loadServices();
  }

  initForm() {
    this.inquiryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      serviceDate: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  async loadServices() {
    this.loading = true;
    try {
      const data = await this.dataService.getServices();

      if (data && data.length > 0) {
        this.servicesList = data;
      } else {
        // Comprehensive CCTV & Surveillance Services List
        console.log('ddddddddddddd');
        this.servicesList = [
          {
            id: '1',
            title: 'New CCTV Installation',
            description:
              'Complete end-to-end setup of Dome, Bullet, PTZ, and IP cameras for homes, offices, shops, and large warehouses.',
            priceRange: '₹500 onwards / camera',
            icon: 'fa-solid fa-video',
          },
          {
            id: '2',
            title: 'DVR / NVR & Hard Disk Setup',
            description:
              'Configuration of recording units, hard disk installation (HDD), storage optimization, and playback troubleshooting.',
            priceRange: '₹400 onwards',
            icon: 'fa-solid fa-hard-drive',
          },
          {
            id: '3',
            title: 'Mobile & Online Viewing Setup',
            description:
              'Connect your CCTV system to your smartphone, laptop, or tablet so you can monitor live footage from anywhere.',
            priceRange: '₹499',
            icon: 'fa-solid fa-mobile-screen-button',
          },
          {
            id: '4',
            title: 'Wiring & Cable Repairing',
            description:
              'Fixing cut wires, loose connections, BNC/DC pin replacements, and neat trunking or concealment of cables.',
            priceRange: '₹300 onwards',
            icon: 'fa-solid fa-network-wired',
          },
          {
            id: '5',
            title: 'Blurry Footage & Lens Cleaning',
            description:
              'Cleaning foggy, hazy, or dusty lenses, fixing camera angles, and focusing blurred night-vision or day cameras.',
            priceRange: '₹299 onwards',
            icon: 'fa-solid fa-camera-rotate',
          },
          {
            id: '6',
            title: 'Power Supply & No Display Fix',
            description:
              'Resolving power failure issues, SMPS power box replacement, adapter checking, and troubleshooting blank monitors.',
            priceRange: '₹350 onwards',
            icon: 'fa-solid fa-plug-circle-bolt',
          },
        ];
      }
    } catch (err) {
      console.error(err);
    } finally {
      this.loading = false;
    }
  }
  openInquiryModal(service: any) {
    this.selectedService = service;
    this.showModal = true;
    this.inquiryForm.reset();
  }

  closeModal() {
    this.showModal = false;
    this.selectedService = null;
  }

  async submitInquiry() {
    if (this.inquiryForm.invalid) {
      this.inquiryForm.markAllAsTouched();
      this.toastr.warning(
        'Please fill in all required fields correctly.',
        'Validation Error',
      );
      return;
    }

    this.isSubmitting = true;
    try {
      const formValues = this.inquiryForm.value;
      const payload = {
        ...formValues,
        serviceId: this.selectedService?.id || 'general',
        serviceTitle: this.selectedService?.title || 'General Inquiry',
        status: 'Pending',
        createdAt: new Date(),
      };

      // 1. Save to Firebase
      await this.dataService.submitServiceInquiry(payload);

      this.toastr.success(
        'Your inquiry has been submitted successfully! Redirecting to WhatsApp...',
        'Request Sent',
      );

      // 2. Generate Clean Formatted WhatsApp Message with Proper Encoding
      const adminWhatsAppNumber = this?.siteData?.phone;

      // Raw message string
      const rawMessage =
        `*New Service Inquiry Booking!*\n\n` +
        `*Service:* ${payload.serviceTitle}\n` +
        `*Name:* ${formValues.name}\n` +
        `*Phone:* ${formValues.phone}\n` +
         `*Address:* ${formValues.address}\n` +
        `*Date:* ${formValues.serviceDate}\n` +
        `*Email:* ${formValues.email || 'N/A'}\n` +
        `*Requirement:* ${formValues.message}`;

      // encodeURIComponent ensure karega ki koi bhi data/text beech me chute nahi
      const encodedMessage = encodeURIComponent(rawMessage);
      const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodedMessage}`;

      // 3. Close Modal and Open WhatsApp in new tab
      this.closeModal();

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      this.toastr.error(
        'Failed to submit inquiry. Please try again later.',
        'Error',
      );
    } finally {
      this.isSubmitting = false;
    }
  }
  async uploadDefaultServicesToFirebase() {
    const defaultServices = [
      {
        id: '1',
        title: 'New CCTV Installation',
        description:
          'Complete end-to-end setup of Dome, Bullet, PTZ, and IP cameras for homes, offices, shops, and large warehouses.',
        priceRange: '₹500 onwards / camera',
        icon: 'fa-solid fa-video',
      },
      {
        id: '2',
        title: 'DVR / NVR & Hard Disk Setup',
        description:
          'Configuration of recording units, hard disk installation (HDD), storage optimization, and playback troubleshooting.',
        priceRange: '₹400 onwards',
        icon: 'fa-solid fa-hard-drive',
      },
      {
        id: '3',
        title: 'Mobile & Online Viewing Setup',
        description:
          'Connect your CCTV system to your smartphone, laptop, or tablet so you can monitor live footage from anywhere.',
        priceRange: '₹499',
        icon: 'fa-solid fa-mobile-screen-button',
      },
      {
        id: '4',
        title: 'Wiring & Cable Repairing',
        description:
          'Fixing cut wires, loose connections, BNC/DC pin replacements, and neat trunking or concealment of cables.',
        priceRange: '₹300 onwards',
        icon: 'fa-solid fa-network-wired',
      },
      {
        id: '5',
        title: 'Blurry Footage & Lens Cleaning',
        description:
          'Cleaning foggy, hazy, or dusty lenses, fixing camera angles, and focusing blurred night-vision or day cameras.',
        priceRange: '₹299 onwards',
        icon: 'fa-solid fa-camera-rotate',
      },
      {
        id: '6',
        title: 'Power Supply & No Display Fix',
        description:
          'Resolving power failure issues, SMPS power box replacement, adapter checking, and troubleshooting blank monitors.',
        priceRange: '₹350 onwards',
        icon: 'fa-solid fa-plug-circle-bolt',
      },
    ];

    try {
      await this.dataService.seedServices(defaultServices);
      alert('Services uploaded to Firebase successfully!');
      this.loadServices(); // Dobara fetch karlo taaki UI par dikh jaye
    } catch (error) {
      console.error('Error uploading services:', error);
    }
  }

  
}
