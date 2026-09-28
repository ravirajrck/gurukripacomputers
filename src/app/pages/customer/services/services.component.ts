import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../core/services/data.service';
import { SITE_CONFIG } from '../../../config/site-config';
import { ServiceBookDialogComponent } from '../service-book-dialog/service-book-dialog.component';


@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css',
})
export class ServicesComponent implements OnInit {
  siteData = SITE_CONFIG;
  private dataService = inject(DataService);
  private dialog = inject(MatDialog);

  servicesList: any[] = [];
  loading = true;

  ngOnInit() {
    this.loadServices();
  }

  async loadServices() {
    this.loading = true;
    try {
      const data = await this.dataService.getServices();

      if (data && data.length > 0) {
        this.servicesList = data;
      } else {
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

  // Open Inquiry Modal via Angular Material Dialog
  openInquiryModal(service: any) {
    this.dialog.open(ServiceBookDialogComponent, {
      width: '500px',
      maxWidth: '500px',
      data: service,
      panelClass: 'custom-mat-dialog-container'
    });
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
      this.loadServices();
    } catch (error) {
      console.error('Error uploading services:', error);
    }
  }
}