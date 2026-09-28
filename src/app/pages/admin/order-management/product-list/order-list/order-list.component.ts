import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../../../core/services/data.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-order-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  private dataService = inject(DataService);
  private toastr = inject(ToastrService);

  ordersList: any[] = [];
  filteredOrders: any[] = [];
  searchTerm: string = '';
  loadingOrders: boolean = false;

  ngOnInit(): void {
    this.loadOrders();
  }

  // ======= DATA SERVICE SE ORDERS LOAD KARNA =======
  loadOrders() {
    this.loadingOrders = true;
    this.dataService.getOrders().subscribe({
      next: (data: any) => {
        this.ordersList = data || [];
        this.filteredOrders = [...this.ordersList];
        this.loadingOrders = false;
      },
      error: (err: any) => {
        console.error('Failed to load orders', err);
        this.toastr.error('Failed to load orders', 'Error');
        this.loadingOrders = false;
      }
    });
  }

  // ======= SEARCH FILTER =======
  filterOrders(): void {
    if (!this.searchTerm.trim()) {
      this.filteredOrders = [...this.ordersList];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredOrders = this.ordersList.filter(
        (ord) =>
          (ord.id && ord.id.toLowerCase().includes(term)) ||
          (ord.customerName && ord.customerName.toLowerCase().includes(term)) ||
          (ord.phone && ord.phone.toLowerCase().includes(term)) ||
          (ord.address && ord.address.toLowerCase().includes(term)) ||
          (ord.paymentMethod && ord.paymentMethod.toLowerCase().includes(term))
      );
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredOrders = [...this.ordersList];
  }

  // ======= UPDATE STATUS VIA DATA SERVICE =======
  async updateOrderStatus(order: any) {
    try {
      await this.dataService.updateOrderStatus(order.id, order.orderStatus);
      this.toastr.success('Order status updated successfully!', 'Success');
    } catch (err) {
      console.error(err);
      this.toastr.error('Failed to update order status!', 'Error');
    }
  }

  // ======= DELETE ORDER VIA DATA SERVICE =======
  async removeOrder(id: string) {
    const result = await Swal.fire({
      html: `
        <div class="text-left pt-2 pb-1">
          <h3 class="text-slate-900 font-bold text-base mb-2">Delete Order Record</h3>
          <p class="text-slate-600 text-xs font-light leading-relaxed">
            Are you sure you want to delete order <span class="font-semibold text-slate-800">"${id}"</span>? This action cannot be undone.
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
        confirmButton: 'flex-1 px-5 py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-md shadow-blue-500/20 transition-all cursor-pointer whitespace-nowrap',
        cancelButton: 'flex-1 px-5 py-3 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer whitespace-nowrap',
      },
    });

    if (result.isConfirmed) {
      try {
        await this.dataService.deleteOrder(id);
        this.ordersList = this.ordersList.filter((o) => o.id !== id);
        this.filteredOrders = this.filteredOrders.filter((o) => o.id !== id);
        this.toastr.success('Order deleted successfully!', 'Success');
      } catch (err) {
        console.error(err);
        this.toastr.error('Failed to delete order!', 'Error');
      }
    }
  }
}