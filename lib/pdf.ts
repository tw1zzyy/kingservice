import PDFDocument from 'pdfkit';
import { SalesOrder, Customer, CustomerAddress, OrderItem, Product, Invoice } from '@prisma/client';

export type InvoiceWithDetails = Invoice & {
  customer: Customer & {
    addresses?: CustomerAddress[];
  };
  order?: (SalesOrder & {
    items: (OrderItem & {
      product: Product;
    })[];
    address?: CustomerAddress | null;
  }) | null;
};

export type DeliveryNoteData = SalesOrder & {
  customer: Customer;
  address?: CustomerAddress | null;
  items: (OrderItem & {
    product: Product;
  })[];
  deliveries?: any[];
};

export function generateInvoicePDFBuffer(invoice: InvoiceWithDetails): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header / Company details
      doc.fontSize(20).font('Helvetica-Bold').text('KING SERVICE s.r.o.', 40, 40);
      doc.fontSize(10).font('Helvetica').text('Velkoobchod potravin a gastro vybavení', 40, 65);
      doc.fontSize(9).text('Tel / WhatsApp: +420 776 355 386 | Email: kingservice@email.cz', 40, 78);
      doc.text('Ústí nad Labem, Česká republika', 40, 90);

      // Document Title
      const isCreditNote = invoice.type === 'CREDIT_NOTE';
      const isAdvance = invoice.type === 'ADVANCE';
      const docTitle = isCreditNote ? 'FAKTURA - DAŇOVÝ DOKLAD (Opravný)' : isAdvance ? 'ZÁLOHOVÁ FAKTURA' : 'FAKTURA - DAŇOVÝ DOKLAD';

      doc.fontSize(14).font('Helvetica-Bold').text(docTitle, 320, 40, { align: 'right' });
      doc.fontSize(11).font('Helvetica-Bold').text(`Číslo: ${invoice.invoiceNumber}`, 320, 58, { align: 'right' });

      doc.moveTo(40, 110).lineTo(555, 110).strokeColor('#cccccc').stroke();

      // Supplier and Customer Info Boxes
      const col1Left = 40;
      const col2Left = 300;
      let y = 120;

      // Supplier
      doc.fontSize(10).font('Helvetica-Bold').text('Dodavatel:', col1Left, y);
      doc.fontSize(9).font('Helvetica');
      doc.text('KING SERVICE s.r.o.', col1Left, y + 15);
      doc.text('Ústí nad Labem, ČR', col1Left, y + 27);
      doc.text('IČO: 12345678', col1Left, y + 39);
      doc.text('DIČ: CZ12345678 (Plátce DPH)', col1Left, y + 51);
      doc.text('Bankovní účet: 123456789/0800', col1Left, y + 63);

      // Customer
      doc.fontSize(10).font('Helvetica-Bold').text('Odběratel:', col2Left, y);
      doc.fontSize(9).font('Helvetica');
      doc.text(invoice.customer.companyName, col2Left, y + 15);
      if (invoice.customer.contactPerson) {
        doc.text(`K rukám: ${invoice.customer.contactPerson}`, col2Left, y + 27);
      }
      doc.text(`IČO: ${invoice.customer.ico || 'Není neuvedeno'}`, col2Left, y + 39);
      doc.text(`DIČ: ${invoice.customer.dic || 'Není plátce'}`, col2Left, y + 51);
      doc.text(`Tel: ${invoice.customer.phone}`, col2Left, y + 63);

      y += 80;
      doc.moveTo(40, y).lineTo(555, y).strokeColor('#cccccc').stroke();
      y += 10;

      // Dates and payment terms
      const formattedCreated = new Date(invoice.createdAt).toLocaleDateString('cs-CZ');
      const formattedDue = new Date(invoice.dueDate).toLocaleDateString('cs-CZ');

      doc.fontSize(9).font('Helvetica-Bold').text('Datum vystavení:', col1Left, y);
      doc.font('Helvetica').text(formattedCreated, col1Left + 100, y);

      doc.font('Helvetica-Bold').text('Datum splatnosti:', col2Left, y);
      doc.font('Helvetica').text(formattedDue, col2Left + 100, y);

      y += 15;
      doc.font('Helvetica-Bold').text('Forma úhrady:', col1Left, y);
      const payMethodLabel = invoice.order?.paymentMethod === 'CASH' ? 'Hotovost' : invoice.order?.paymentMethod === 'ON_ACCOUNT' ? 'Na účet' : 'Bankovní převod';
      doc.font('Helvetica').text(payMethodLabel, col1Left + 100, y);

      doc.font('Helvetica-Bold').text('Stav platby:', col2Left, y);
      doc.font('Helvetica').text(invoice.status, col2Left + 100, y);

      y += 25;

      // Table Header
      doc.rect(40, y, 515, 20).fill('#1e293b');
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
      doc.text('Položka', 45, y + 5);
      doc.text('Množství', 260, y + 5, { width: 50, align: 'right' });
      doc.text('Cena/jedn. bez DPH', 320, y + 5, { width: 80, align: 'right' });
      doc.text('Sazba DPH', 410, y + 5, { width: 50, align: 'right' });
      doc.text('Celkem s DPH', 470, y + 5, { width: 80, align: 'right' });

      doc.fillColor('#000000').font('Helvetica');
      y += 22;

      // Table Body
      const items = invoice.order?.items || [];
      if (items.length === 0) {
        doc.fontSize(9).text('Generováno z objednávky bez položek', 45, y + 5);
        y += 20;
      } else {
        items.forEach((item) => {
          const unitPriceExcl = Number(item.unitPrice) / 1.21;
          const lineTotal = Number(item.totalPrice);

          doc.fontSize(9).text(item.product.name, 45, y, { width: 210 });
          doc.text(`${item.quantity} ${item.product.unitOfMeasure || 'ks'}`, 260, y, { width: 50, align: 'right' });
          doc.text(`${unitPriceExcl.toFixed(2)} CZK`, 320, y, { width: 80, align: 'right' });
          doc.text('21%', 410, y, { width: 50, align: 'right' });
          doc.text(`${lineTotal.toFixed(2)} CZK`, 470, y, { width: 80, align: 'right' });

          y += 18;
        });
      }

      y += 10;
      doc.moveTo(40, y).lineTo(555, y).strokeColor('#cccccc').stroke();
      y += 15;

      // Summary Table
      const subtotal = Number(invoice.subtotal);
      const taxTotal = Number(invoice.taxTotal);
      const totalAmount = Number(invoice.totalAmount);

      doc.fontSize(9).font('Helvetica').text('Základ DPH (21%):', 320, y, { width: 110, align: 'right' });
      doc.text(`${subtotal.toFixed(2)} CZK`, 440, y, { width: 110, align: 'right' });
      y += 15;

      doc.text('DPH (21%):', 320, y, { width: 110, align: 'right' });
      doc.text(`${taxTotal.toFixed(2)} CZK`, 440, y, { width: 110, align: 'right' });
      y += 18;

      doc.fontSize(11).font('Helvetica-Bold').text('CELKEM K ÚHRADĚ:', 300, y, { width: 130, align: 'right' });
      doc.fontSize(11).font('Helvetica-Bold').text(`${totalAmount.toFixed(2)} CZK`, 440, y, { width: 110, align: 'right' });

      // Footer
      doc.fontSize(8).font('Helvetica').fillColor('#666666').text('Děkujeme za Váš nákup! V případě dotazů nás kontaktujte na +420 776 355 386.', 40, 780, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export function generateDeliveryNotePDFBuffer(order: DeliveryNoteData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header
      doc.fontSize(20).font('Helvetica-Bold').text('KING SERVICE s.r.o.', 40, 40);
      doc.fontSize(10).font('Helvetica').text('Velkoobchod potravin a gastro vybavení', 40, 65);
      doc.fontSize(9).text('Tel / WhatsApp: +420 776 355 386', 40, 78);

      doc.fontSize(14).font('Helvetica-Bold').text('DODACÍ LIST', 320, 40, { align: 'right' });
      doc.fontSize(11).font('Helvetica-Bold').text(`Číslo obj: ${order.orderNumber}`, 320, 58, { align: 'right' });

      doc.moveTo(40, 100).lineTo(555, 100).strokeColor('#cccccc').stroke();

      let y = 110;
      const col1Left = 40;
      const col2Left = 300;

      // Addresses
      doc.fontSize(10).font('Helvetica-Bold').text('Dodavatel:', col1Left, y);
      doc.fontSize(9).font('Helvetica');
      doc.text('KING SERVICE s.r.o.', col1Left, y + 15);
      doc.text('Ústí nad Labem, ČR', col1Left, y + 27);
      doc.text('Tel: +420 776 355 386', col1Left, y + 39);

      doc.fontSize(10).font('Helvetica-Bold').text('Příjemce / Místo dodání:', col2Left, y);
      doc.fontSize(9).font('Helvetica');
      doc.text(order.customer.companyName, col2Left, y + 15);
      if (order.address) {
        doc.text(`${order.address.street}, ${order.address.city} ${order.address.postalCode}`, col2Left, y + 27);
      } else {
        doc.text('Adresa neuvedena', col2Left, y + 27);
      }
      doc.text(`Tel: ${order.customer.phone}`, col2Left, y + 39);

      y += 65;
      doc.moveTo(40, y).lineTo(555, y).strokeColor('#cccccc').stroke();
      y += 10;

      const formattedDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('cs-CZ') : new Date(order.createdAt).toLocaleDateString('cs-CZ');
      doc.fontSize(9).font('Helvetica-Bold').text('Datum dodání:', col1Left, y);
      doc.font('Helvetica').text(formattedDate, col1Left + 90, y);

      doc.font('Helvetica-Bold').text('Způsob platby:', col2Left, y);
      doc.font('Helvetica').text(order.paymentMethod, col2Left + 90, y);

      y += 25;

      // Items Table Header
      doc.rect(40, y, 515, 20).fill('#1e293b');
      doc.fillColor('#ffffff').fontSize(9).font('Helvetica-Bold');
      doc.text('#', 45, y + 5, { width: 20 });
      doc.text('Název zboží / Kód', 70, y + 5);
      doc.text('Balení', 350, y + 5, { width: 60, align: 'right' });
      doc.text('Požadováno', 420, y + 5, { width: 65, align: 'right' });
      doc.text('Předáno', 490, y + 5, { width: 60, align: 'right' });

      doc.fillColor('#000000').font('Helvetica');
      y += 22;

      order.items.forEach((item, idx) => {
        doc.fontSize(9).text(`${idx + 1}`, 45, y, { width: 20 });
        doc.text(`${item.product.name} (${item.product.sku})`, 70, y, { width: 270 });
        doc.text(`${item.product.packSize || 1} ${item.product.unitOfMeasure}`, 350, y, { width: 60, align: 'right' });
        doc.text(`${item.quantity}`, 420, y, { width: 65, align: 'right' });
        doc.text(`[  ]`, 490, y, { width: 60, align: 'right' });

        y += 18;
      });

      y += 20;
      doc.moveTo(40, y).lineTo(555, y).strokeColor('#cccccc').stroke();
      y += 20;

      // Signature section
      doc.fontSize(9).font('Helvetica-Bold').text('Předal (Řidič):', 40, y);
      doc.text('Převzal (Zákazník):', 300, y);

      y += 40;
      doc.moveTo(40, y).lineTo(200, y).strokeColor('#999999').stroke();
      doc.moveTo(300, y).lineTo(480, y).strokeColor('#999999').stroke();

      y += 5;
      doc.fontSize(8).font('Helvetica').fillColor('#666666');
      doc.text('Podpis & Datum', 40, y);
      doc.text('Podpis, Jméno & Razítko', 300, y);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export function generatePaymentConfirmationPDFBuffer(payment: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      doc.fontSize(20).font('Helvetica-Bold').text('KING SERVICE s.r.o.', 40, 40);
      doc.fontSize(10).font('Helvetica').text('Velkoobchod potravin a gastro vybavení', 40, 65);

      doc.fontSize(14).font('Helvetica-Bold').text('POTVRZENÍ O PLATBĚ', 320, 40, { align: 'right' });

      doc.moveTo(40, 90).lineTo(555, 90).strokeColor('#cccccc').stroke();

      let y = 105;

      doc.fontSize(10).font('Helvetica-Bold').text('Detaily Platby:', 40, y);
      y += 20;

      doc.fontSize(9).font('Helvetica');
      doc.text(`Číslo dokladu / faktury: ${payment.invoice?.invoiceNumber || 'N/A'}`, 40, y); y += 15;
      doc.text(`Zákazník: ${payment.invoice?.customer?.companyName || 'N/A'}`, 40, y); y += 15;
      doc.text(`Datum úhrady: ${new Date(payment.paidAt).toLocaleDateString('cs-CZ')}`, 40, y); y += 15;
      doc.text(`Způsob úhrady: ${payment.method}`, 40, y); y += 15;
      doc.text(`Variabilní symbol / Ref: ${payment.reference || 'N/A'}`, 40, y); y += 20;

      doc.fontSize(12).font('Helvetica-Bold').text(`Příjatá částka: ${Number(payment.amount).toFixed(2)} CZK`, 40, y);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
