import { CommonModule } from '@angular/common';
import { Component, EventEmitter } from '@angular/core';
import {  Input,Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {MatMenuModule} from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
@Component({
  selector: 'app-shared-table',
  imports: [CommonModule,FormsModule, RouterModule,MatMenuModule,MatIcon],
  templateUrl: './shared-table.component.html',
  styleUrl: './shared-table.component.css'
})
export class SharedTableComponent {
// Inputs from Parent
  @Input() columns: any[] = [];
  @Input() data: any[] = [];
  @Input() loading: boolean = false;
  
  // Search Bar Configuration
  @Input() showSearch: boolean = true;
  @Input() searchPlaceholder: string = 'Search records...';
  @Input() searchTerm: string = '';
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() clearSearch = new EventEmitter<void>();

  // Header Button Configuration
  @Input() showHeaderButton: boolean = true;
  @Input() buttonLabel: string = 'Add New';
  @Input() buttonRouterLink: any[] | string = '';
  @Output() buttonClick = new EventEmitter<void>();

  // Actions Menu Configuration
  @Input() actions: any[] = [
    { label: 'Details', icon: 'visibility', action: 'view' },
    { label: 'Edit', icon: 'edit', action: 'edit' },
    { label: 'Delete', icon: 'delete', action: 'delete', colorClass: 'hover:!text-rose-600' }
  ];
  @Input() showActionsColumn: boolean = true;
  @Input() actionsWidth: string = '14%';

  // Outputs to Parent
  @Output() actionTriggered = new EventEmitter<{ action: string; item: any }>();
  @Output() statusChanged = new EventEmitter<{ item: any; newStatus: string }>();

  

  getNestedValue(obj: any, path: string) {
    if (!obj) return '';
    const val = path.split('.').reduce((o, p) => (o ? o[p] : ''), obj);
    // अगर वैल्यू कोई ऑब्जेक्ट है (जैसे customer), तो उसका नाम (name) दिखाएं
    if (val && typeof val === 'object' && val.name) {
      return val.name;
    }
    return val;
  }

  onSearchChange(value: string) {
    this.searchTermChange.emit(value);
  }

  triggerAction(actionName: string, item: any) {
    this.actionTriggered.emit({ action: actionName, item });
  }

  onStatusChange(item: any, status: string) {
    this.statusChanged.emit({ item, newStatus: status });
  }
}

