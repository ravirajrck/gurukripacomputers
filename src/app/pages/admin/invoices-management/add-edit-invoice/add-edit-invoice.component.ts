import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { DataService } from '../../../../core/services/data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-edit-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-edit-invoice.component.html',
  styleUrl: './add-edit-invoice.component.css'
})
export class AddEditInvoiceComponent implements OnInit {
  @ViewChild('invoiceForm') invoiceForm!: NgForm;

  private invoiceService = inject(DataService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  todayDate: string = new Date().toISOString().split('T')[0];
  isEditMode: boolean = false;
  invoiceId: string | null = null;
  submitted: boolean = false;
  isLoading: boolean = false;

  invoice: any = {
    invoice_no: '',
    invoice_date: new Date().toISOString().split('T')[0],
    gst_type: 'intra',
    gst_rate: 18,
    customer: {
      name: '',
      phone: '',
      address: '',
      gstin: ''
    },
    items: [
      { description: '', hsn_code: '', quantity: 1, unit: 'Pcs', rate: '', amount: '' }
    ],
    notes: 'Terms & Conditions: Goods once sold will not be taken back.\nBank Name: State Bank of India\nA/C No: XXXXXXXXXXX\nIFSC: SBIN00XXXXX',
    subtotal: 0,
    total_tax: 0,
    total_amount: 0,
    payment_status: 'pending'
  };

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id');
    if (this.invoiceId) {
      this.isEditMode = true;
      this.loadInvoiceData(this.invoiceId);
    } else {
      this.generateDefaultInvoiceNo();
    }
  }

  generateDefaultInvoiceNo() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.invoice.invoice_no = `INV-2026-${randomNum}`;
  }

  async loadInvoiceData(id: string) {
    this.isLoading = true;
    try {
      const response: any = this.invoiceService.getInvoiceById(id);
      let data = response;

      // Handle Promise or Observable safely
      if (response && typeof response.then === 'function') {
        data = await response;
      } else if (response && typeof response.subscribe === 'function') {
        data = await new Promise((resolve, reject) => {
          response.subscribe({ next: resolve, error: reject });
        });
      }

      // Handle Zone.js wrapper if present
      if (data && data.__zone_symbol__value) {
        data = data.__zone_symbol__value;
      }

      if (data) {
        this.invoice = data;
        if (!this.invoice.customer) {
          this.invoice.customer = { name: '', phone: '', address: '', gstin: '' };
        }
        if (!this.invoice.items || !Array.isArray(this.invoice.items)) {
          this.invoice.items = [{ description: '', hsn_code: '', quantity: 1, unit: 'Pcs', rate: '', amount: '' }];
        }
      } else {
        this.toastr.error('Invoice not found!', 'Error');
        this.router.navigate(['/admin/invoices']);
      }
    } catch (error) {
      console.error(error);
      this.toastr.error('Failed to load invoice details.', 'Error');
    } finally {
      this.isLoading = false;
    }
  }

  addItem() {
    this.invoice.items.push({ description: '', hsn_code: '', quantity: 1, unit: 'Pcs', rate: '', amount: '' });
  }

  removeItem(index: number) {
    if (this.invoice.items.length > 1) {
      this.invoice.items.splice(index, 1);
    } else {
      this.toastr.error('At least one item is required.', 'Error');
    }
  }

  calculateAmount(item: any) {
    const qty = Number(item.quantity);
    const rate = Number(item.rate);
    if (!isNaN(qty) && !isNaN(rate) && qty > 0 && rate >= 0) {
      item.amount = qty * rate;
    } else {
      item.amount = '';
    }
  }

  get subtotal(): number {
    if (!this.invoice.items || !Array.isArray(this.invoice.items)) return 0;
    return this.invoice.items.reduce((sum: number, item: any) => {
      const amt = Number(item.amount);
      return sum + (isNaN(amt) ? 0 : amt);
    }, 0);
  }

  get totalTax(): number {
    return Math.round((this.subtotal * Number(this.invoice.gst_rate)) / 100);
  }

  get cgst(): number {
    return this.invoice.gst_type === 'intra' ? Math.round(this.totalTax / 2) : 0;
  }

  get sgst(): number {
    return this.invoice.gst_type === 'intra' ? Math.round(this.totalTax / 2) : 0;
  }

  get igst(): number {
    return this.invoice.gst_type === 'inter' ? this.totalTax : 0;
  }

  get grandTotal(): number {
    return this.subtotal + this.totalTax;
  }

  saveInvoice(form: NgForm) {
    this.submitted = true;

    if (form.invalid) {
      this.toastr.error('Please fill in all required fields correctly.', 'Error');
      return;
    }

    if (!this.invoice.items || this.invoice.items.length === 0) {
      this.toastr.error('Please add at least one item.', 'Error');
      return;
    }

    this.invoice.subtotal = this.subtotal;
    this.invoice.total_tax = this.totalTax;
    this.invoice.total_amount = this.grandTotal;

    this.isLoading = true;

    if (this.isEditMode && this.invoiceId) {
      // Edit Mode
      const updateCall = this.invoiceService.updateInvoice(this.invoiceId, this.invoice);
      Promise.resolve(updateCall).then(() => {
        this.toastr.success('Invoice updated successfully!', 'Success');
        setTimeout(() => this.router.navigate(['/admin/invoices']), 1000);
      }).catch((err) => {
        console.error(err);
        this.isLoading = false;
        this.toastr.error('Error updating invoice.', 'Error');
      });
    } else {
      // Add Mode
      const addCall = this.invoiceService.addInvoice(this.invoice);
      Promise.resolve(addCall).then(() => {
        this.toastr.success('Invoice generated successfully!', 'Success');
        setTimeout(() => this.router.navigate(['/admin/invoices']), 1000);
      }).catch((err) => {
        console.error(err);
        this.isLoading = false;
        this.toastr.error('Error saving invoice.', 'Error');
      });
    }
  }

  
}