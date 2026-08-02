import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-list',
 imports: [CommonModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent {
ordersList: any[] = [
    {
      id: 'ORD-9821',
      customerName: 'Rahul Verma',
      phone: '9826012345',
      address: 'Near Bus Stand, Dhamnod',
      items: [{ name: 'RO Water Purifier Pro', quantity: 1, price: 12999 }],
      totalAmount: 12999,
      paymentMethod: 'Online (UPI)',
      orderStatus: 'Pending',
      orderDate: new Date()
    },
    {
      id: 'ORD-9822',
      customerName: 'Priya Sharma',
      phone: '9123456789',
      address: 'Main Road, Khargone',
      items: [{ name: 'Kitchen Chimney Sleek', quantity: 1, price: 8499 }],
      totalAmount: 8499,
      paymentMethod: 'Cash on Delivery',
      orderStatus: 'Delivered',
      orderDate: new Date(Date.now() - 86400000) // 1 day ago
    }
  ];

  loadingOrders: boolean = false;

  ngOnInit(): void {
    // Agar API se data fetch karna ho toh yahan call karein:
    // this.fetchOrders();
  }

  updateOrderStatus(order: any): void {
    // API call to update order status in database
    console.log(`Order ${order.id} status updated to: ${order.orderStatus}`);
  }

  removeOrder(id: string): void {
    if (confirm('Are you sure you want to delete this order record?')) {
      this.ordersList = this.ordersList.filter(o => o.id !== id);
    }
  }
}