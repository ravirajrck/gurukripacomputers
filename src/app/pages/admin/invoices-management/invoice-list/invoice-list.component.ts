import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { ToastrService } from 'ngx-toastr';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css'
})
export class InvoiceListComponent implements OnInit {
  private invoiceService = inject(DataService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  filteredInvoices: any[] = []; // अब यही टेबल में बाइंड होगी सीधे
  searchTerm: string = '';
  selectedStatus: string = ''; 
  loadingData: boolean = false;
  
  // Debounce timer typing के दौरान बार-बार Firebase request भेजने से रोकने के लिए
  private searchTimeout: any;

  ngOnInit(): void {
    this.loadInvoices();
  }

  // **Firebase से फ़िल्टर होकर डेटा फेच करने वाला फंक्शन**
  loadInvoices() {
    this.loadingData = true;
    
    this.invoiceService.getFilteredInvoices(this.searchTerm, this.selectedStatus).subscribe({
      next: (data: any[]) => {
        this.filteredInvoices = data;
        this.loadingData = false;
      },
      error: (err) => {
        console.error('Error loading invoices:', err);
        this.loadingData = false;
        this.toastr.error('Failed to load invoices. Please try again!', 'Error');
      }
    });
  }

  // जब यूजर सर्च बॉक्स में टाइप करे (Debounce के साथ ताकि हर कीस्ट्रोक पर API/Firebase हिट न हो)
  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.loadInvoices();
    }, 300); // 300ms रुककर फायरबेस को कॉल करेगा
  }

  // जब स्टेटस ड्रॉपडाउन बदले
  onStatusChange() {
    this.loadInvoices();
  }

  // Search clear karne ke liye
  clearSearch() {
    this.searchTerm = '';
    this.loadInvoices();
  }

  // Payment status badalne par Firebase update karna
  updateInvoiceStatus(inv: any) {
    if (!inv.id) return;
    
    this.invoiceService.updateInvoice(inv.id, { payment_status: inv.payment_status }).subscribe({
      next: () => {
        this.toastr.success('Invoice status updated successfully!', 'Success');
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        this.toastr.error('Failed to update payment status. Please try again!', 'Error');
      }
    });
  }

  viewInvoice(id: string) {
    this.router.navigate(['/admin/invoice-details', id]);
  }

  editInvoice(inv: any) {
    this.router.navigate(['/admin/invoices/manage', inv.id]);   
  }

  async deleteInvoice(id: string, invoiceNumber: string) {
    const result = await Swal.fire({
      html: `
        <div class="text-center pt-2 pb-1">
          <h3 class="text-slate-800 font-medium text-base mb-2">Delete Invoice ${invoiceNumber}</h3>
          <p class="text-slate-600 text-sm font-medium leading-relaxed">
            Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.
          </p>
        </div>
      `,
      showCancelButton: true,
      buttonsStyling: false,
      reverseButtons: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 font-sans max-w-md w-full',
        actions: 'flex items-center gap-3 w-full mt-6 mb-0',
        confirmButton: 'flex-1 px-5 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap',
        cancelButton: 'flex-1 px-5 py-3 rounded-xl text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer whitespace-nowrap',
      },
    });

    if (result.isConfirmed) {
      this.invoiceService.deleteInvoice(id).subscribe({
        next: () => {
          this.filteredInvoices = this.filteredInvoices.filter(inv => inv.id !== id);
          this.toastr.success('Invoice deleted successfully!', 'Success');
        },
        error: (err) => {
          console.error('Failed to delete invoice:', err);
          this.toastr.error('Failed to delete invoice. Please try again!', 'Error');
        }
      });
    }
  }
}