import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { SITE_CONFIG } from '../../../config/site-config';
import { DataService } from '../../../core/services/data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-service-book-dialog',
  imports: [FormsModule,CommonModule,ReactiveFormsModule],
  templateUrl: './service-book-dialog.component.html',
  styleUrl: './service-book-dialog.component.css'
})

export class ServiceBookDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private toastr = inject(ToastrService);
  public dialogRef = inject(MatDialogRef<ServiceBookDialogComponent>);
  public data = inject(MAT_DIALOG_DATA);

  inquiryForm!: FormGroup;
  minDate: string = '';
  isSubmitting = false;

  ngOnInit() {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.inquiryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      serviceDate: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  async submitInquiry() {
    if (this.inquiryForm.invalid) {
      this.inquiryForm.markAllAsTouched();
      this.toastr.warning('Please fill in all required fields correctly.', 'Validation Error');
      return;
    }

    this.isSubmitting = true;
    try {
      const formValues = this.inquiryForm.value;
      const payload = {
        ...formValues,
        serviceId: this.data?.id || 'general',
        serviceTitle: this.data?.title || 'General Inquiry',
        status: 'Pending',
        createdAt: new Date(),
      };

      await this.dataService.submitServiceInquiry(payload);
      await this.dataService.updateDashboardCounter('totalServices', 1);

      this.toastr.success('Your inquiry has been submitted successfully! Redirecting to WhatsApp...', 'Request Sent');

      const adminWhatsAppNumber = SITE_CONFIG?.phone;
      const rawMessage =
        `*New Service Inquiry Booking!*\n\n` +
        `*Service:* ${payload.serviceTitle}\n` +
        `*Name:* ${formValues.name}\n` +
        `*Phone:* ${formValues.phone}\n` +
        `*Address:* ${formValues.address}\n` +
        `*Date:* ${formValues.serviceDate}\n` +
        `*Email:* ${formValues.email || 'N/A'}\n` +
        `*Requirement:* ${formValues.message}`;

      const encodedMessage = encodeURIComponent(rawMessage);
      const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodedMessage}`;

      this.dialogRef.close();

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 1000);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      this.toastr.error('Failed to submit inquiry. Please try again later.', 'Error');
    } finally {
      this.isSubmitting = false;
    }
  }
}