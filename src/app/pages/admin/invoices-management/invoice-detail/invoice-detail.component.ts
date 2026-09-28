import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { DataService } from '../../../../core/services/data.service';

const pdf: any = (pdfMake as any).default || pdfMake;
const fonts: any = (pdfFonts as any).default || pdfFonts;

if (fonts.pdfMake && fonts.pdfMake.vfs) {
  pdf.vfs = fonts.pdfMake.vfs;
} else if (fonts.vfs) {
  pdf.vfs = fonts.vfs;
}

interface InvoiceItem {
  description: string;
  hsn_code: string;
  quantity: number | '';
  unit: string;
  rate: number | '';
  amount: number | '';
}

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(DataService);

  invoiceId: string | null = null;
  isLoading: boolean = false;

  invoice: any = {
    invoice_no: '',
    invoice_date: '',
    place_of_supply: 'Madhya Pradesh (23)',
    seller: {
      name: 'RCK Computers & CCTV Solutions',
      address: 'Khandwa Road, Khargone (M.P.)',
      phone: '9644692189',
      gstin: '23AAAAA0000A1Z5'
    },
    customer: {
      name: '',
      address: '',
      phone: '',
      gstin: ''
    },
    bank_details: {
      account_name: 'RCK Computers & CCTV Solutions',
      account_number: '123456789012',
      ifsc_code: 'HDFC0001234',
      bank_name: 'HDFC Bank',
      branch: 'Khargone'
    },
    items: [],
    discount: 0,
    notes: 'Terms & Conditions: Goods once sold will not be taken back. Warranty as per manufacturer.'
  };

  ngOnInit(): void {
    this.invoiceId = this.route.snapshot.paramMap.get('id');
    if (this.invoiceId) {
      this.loadInvoiceData(this.invoiceId);
    }
  }

  async loadInvoiceData(id: string) {
    this.isLoading = true;
    try {
      const response: any = this.invoiceService.getInvoiceById(id);
      let data = response;

      if (response && typeof response.then === 'function') {
        data = await response;
      } else if (response && typeof response.subscribe === 'function') {
        data = await new Promise((resolve, reject) => {
          response.subscribe({ next: resolve, error: reject });
        });
      }

      if (data && data.__zone_symbol__value) {
        data = data.__zone_symbol__value;
      }

      if (data) {
        this.invoice = { ...this.invoice, ...data };
        if (!this.invoice.customer) {
          this.invoice.customer = { name: '', phone: '', address: '', gstin: '' };
        }
        if (!this.invoice.items || !Array.isArray(this.invoice.items)) {
          this.invoice.items = [{ description: '', hsn_code: '', quantity: 1, unit: 'Pcs', rate: '', amount: '' }];
        }
      } else {
        console.error('Invoice not found!');
        this.router.navigate(['/admin/invoices']);
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  get subtotal(): number {
    return (this.invoice.items || []).reduce((sum: number, item: any) => sum + (typeof item.amount === 'number' ? item.amount : 0), 0);
  }

  get taxableValue(): number {
    return this.subtotal - (this.invoice.discount || 0);
  }

  get cgst(): number {
    return Math.round((this.taxableValue * 9) / 100);
  }

  get sgst(): number {
    return Math.round((this.taxableValue * 9) / 100);
  }

  get grandTotal(): number {
    return this.taxableValue + this.cgst + this.sgst;
  }

  getAmountInWords(amount: number): string {
    return `INR ${amount.toLocaleString('en-IN')} Only`;
  }

  get filledItemsForDisplay(): InvoiceItem[] {
    const targetRows = 11;
    const filledItems: InvoiceItem[] = [...(this.invoice.items || [])];
    while (filledItems.length < targetRows) {
      filledItems.push({ description: '', hsn_code: '', quantity: '', unit: '', rate: '', amount: '' });
    }
    return filledItems;
  }

  // --- PDFMAKE DOC DEFINITION ---
  private getDocDefinition() {
    const filledItems = this.filledItemsForDisplay;

    return {
      pageSize: 'A4',
      pageMargins: [25, 25, 25, 25],
      content: [
        {
          table: {
            widths: ['*'],
            body: [
              [
                {
                  stack: [
                    { text: this.invoice.seller.name.toUpperCase(), fontSize: 16, bold: true, alignment: 'center', margin: [0, 6, 0, 2] },
                    { text: `${this.invoice.seller.address} | Mob: ${this.invoice.seller.phone}`, fontSize: 9, alignment: 'center', margin: [0, 0, 0, 4] },
                    { text: `GSTIN: ${this.invoice.seller.gstin}`, fontSize: 8.5, alignment: 'center', margin: [0, 0, 0, 6] },
                    { text: 'TAX INVOICE', fontSize: 11, bold: true, alignment: 'center', decoration: 'underline', margin: [0, 0, 0, 8] },

                    {
                      table: {
                        widths: ['100%'],
                        body: [
                          [
                            {
                              stack: [
                                { text: 'Billed To (Customer):', bold: true, fontSize: 8.5, margin: [0, 0, 0, 2] },
                                { text: `Name: ${this.invoice.customer.name}`, fontSize: 8.5, bold: true },
                                { text: `Address: ${this.invoice.customer.address}`, fontSize: 8.5 },
                                { text: `Phone: ${this.invoice.customer.phone}`, fontSize: 8.5 }
                              ],
                              border: [false, false, false, false],
                              margin: [4, 2, 4, 4]
                            }
                          ]
                        ]
                      },
                      layout: 'noBorders'
                    },

                    {
                      table: {
                        widths: ['35%', '30%', '35%'],
                        body: [
                          [
                            { text: `Invoice No: ${this.invoice.invoice_no}`, fontSize: 8.5, bold: true, border: [false, true, true, true], margin: [4, 4, 4, 4] },
                            { text: `Date: ${this.invoice.invoice_date}`, fontSize: 8.5, bold: true, border: [false, true, true, true], margin: [4, 4, 4, 4] },
                            { text: `Place of Supply: ${this.invoice.place_of_supply}`, fontSize: 8.5, bold: true, border: [false, true, false, true], margin: [4, 4, 4, 4] }
                          ]
                        ]
                      },
                      layout: {
                        hLineWidth: () => 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: () => '#000000',
                        vLineColor: () => '#000000'
                      }
                    },

                    {
                      table: {
                        headerRows: 1,
                        widths: [25, '*', 55, 35, 40, 55, 65],
                        body: [
                          [
                            { text: 'S.No.', bold: true, fontSize: 8.5, fillColor: '#eaeaea', alignment: 'center', margin: [2, 4, 2, 4] },
                            { text: 'Item Description', bold: true, fontSize: 8.5, fillColor: '#eaeaea', margin: [4, 4, 4, 4] },
                            { text: 'HSN Code', bold: true, fontSize: 8.5, fillColor: '#eaeaea', alignment: 'center', margin: [2, 4, 2, 4] },
                            { text: 'Qty', bold: true, fontSize: 8.5, fillColor: '#eaeaea', alignment: 'center', margin: [2, 4, 2, 4] },
                            { text: 'Unit', bold: true, fontSize: 8.5, fillColor: '#eaeaea', alignment: 'center', margin: [2, 4, 2, 4] },
                            { text: 'Rate (₹)', bold: true, fontSize: 8.5, fillColor: '#eaeaea', alignment: 'right', margin: [4, 4, 4, 4] },
                            { text: 'Amount (₹)', bold: true, fontSize: 8.5, fillColor: '#eaeaea', alignment: 'right', margin: [4, 4, 4, 4] }
                          ],
                          ...filledItems.map((item, index) => [
                            { text: item.description ? index + 1 : '', fontSize: 8.5, alignment: 'center', margin: [2, 4, 2, 4] },
                            { text: item.description, fontSize: 8.5, margin: [4, 4, 4, 4] },
                            { text: item.hsn_code, fontSize: 8.5, alignment: 'center', margin: [2, 4, 2, 4] },
                            { text: item.quantity !== '' ? item.quantity : '', fontSize: 8.5, alignment: 'center', margin: [2, 4, 2, 4] },
                            { text: item.unit, fontSize: 8.5, alignment: 'center', margin: [2, 4, 2, 4] },
                            { text: item.rate !== '' ? item.rate : '', fontSize: 8.5, alignment: 'right', margin: [4, 4, 4, 4] },
                            { text: item.amount !== '' ? item.amount : (typeof item.quantity === 'number' && typeof item.rate === 'number' ? item.quantity * item.rate : ''), fontSize: 8.5, alignment: 'right', margin: [4, 4, 4, 4] }
                          ])
                        ]
                      },
                      layout: {
                        hLineWidth: () => 0.5,
                        vLineWidth: () => 0.5,
                        hLineColor: () => '#000000',
                        vLineColor: () => '#000000'
                      }
                    },

                    {
                      columns: [
                        {
                          width: '55%',
                          stack: [
                            { text: 'Amount in Words:', bold: true, fontSize: 8.5, margin: [0, 4, 0, 1] },
                            { text: this.getAmountInWords(this.grandTotal), italics: true, fontSize: 8.5, margin: [0, 0, 0, 4] },
                            { text: 'Bank Details for Payment:', bold: true, fontSize: 8.5, margin: [0, 2, 0, 1] },
                            { text: `A/c Name: ${this.invoice.bank_details.account_name}`, fontSize: 8 },
                            { text: `A/c No: ${this.invoice.bank_details.account_number} | IFSC: ${this.invoice.bank_details.ifsc_code}`, fontSize: 8 },
                            { text: `Bank: ${this.invoice.bank_details.bank_name}, Branch: ${this.invoice.bank_details.branch}`, fontSize: 8, margin: [0, 0, 0, 4] },
                            { text: 'Terms & Conditions:', bold: true, fontSize: 8, margin: [0, 0, 0, 1] },
                            { text: this.invoice.notes, fontSize: 7 }
                          ],
                          margin: [6, 4, 6, 4]
                        },
                        {
                          width: '45%',
                          stack: [
                            {
                              table: {
                                widths: ['55%', '45%'],
                                body: [
                                  [{ text: 'Subtotal:', fontSize: 8.5, margin: [4, 2, 4, 2] }, { text: `₹ ${this.subtotal}`, fontSize: 8.5, alignment: 'right', margin: [4, 2, 4, 2] }],
                                  [{ text: 'Discount:', fontSize: 8.5, margin: [4, 2, 4, 2] }, { text: `(-) ₹ ${this.invoice.discount}`, fontSize: 8.5, alignment: 'right', margin: [4, 2, 4, 2] }],
                                  [{ text: 'Taxable Value:', fontSize: 8.5, bold: true, margin: [4, 2, 4, 2] }, { text: `₹ ${this.taxableValue}`, fontSize: 8.5, bold: true, alignment: 'right', margin: [4, 2, 4, 2] }],
                                  [{ text: 'CGST (9%):', fontSize: 8.5, margin: [4, 2, 4, 2] }, { text: `₹ ${this.cgst}`, fontSize: 8.5, alignment: 'right', margin: [4, 2, 4, 2] }],
                                  [{ text: 'SGST (9%):', fontSize: 8.5, margin: [4, 2, 4, 2] }, { text: `₹ ${this.sgst}`, fontSize: 8.5, alignment: 'right', margin: [4, 2, 4, 2] }],
                                  [{ text: 'Grand Total:', fontSize: 9, bold: true, margin: [4, 3, 4, 3] }, { text: `₹ ${this.grandTotal}`, fontSize: 9, bold: true, alignment: 'right', margin: [4, 3, 4, 3] }]
                                ]
                              },
                              layout: {
                                hLineWidth: () => 0.5,
                                vLineWidth: () => 0.5,
                                hLineColor: () => '#000000',
                                vLineColor: () => '#000000'
                              }
                            }
                          ]
                        }
                      ]
                    },

                    {
                      table: {
                        widths: ['60%', '40%'],
                        body: [
                          [
                            {
                              text: 'Thank you for your business!\nधन्यवाद! आपकी सेवा में सदैव तत्पर।',
                              fontSize: 8.5,
                              italics: true,
                              margin: [6, 8, 6, 8],
                              border: [false, true, false, false]
                            },
                            {
                              text: `For ${this.invoice.seller.name}\n\n\nAuthorized Signatory`,
                              alignment: 'right',
                              fontSize: 8.5,
                              margin: [6, 4, 6, 4],
                              border: [false, true, false, false]
                            }
                          ]
                        ]
                      },
                      layout: {
                        hLineWidth: () => 0.5,
                        vLineWidth: () => 0,
                        hLineColor: () => '#000000'
                      }
                    }

                  ]
                }
              ]
            ]
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000'
          }
        }
      ],
      defaultStyle: { font: 'Roboto' }
    };
  }

  // --- PDF DOWNLOAD ---
  downloadPDF() {
    const docDefinition = this.getDocDefinition();
    pdf.createPdf(docDefinition).download(`Invoice_${this.invoice.invoice_no}.pdf`);
  }

  // --- DIRECT PRINT (PDFMAKE) ---
  printPDF() {
    const docDefinition = this.getDocDefinition();
    pdf.createPdf(docDefinition).print();
  }

  getItemAmount(item: any): number | string {
    if (item.amount !== '' && item.amount !== null && item.amount !== undefined) {
      return item.amount;
    }
    const qty = Number(item.quantity);
    const rate = Number(item.rate);
    
    if (!isNaN(qty) && !isNaN(rate) && item.quantity !== '' && item.rate !== '') {
      return qty * rate;
    }
    return '';
  }
}