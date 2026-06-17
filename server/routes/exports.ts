import { Router } from 'express';
import { pool } from '../db';
import { authenticate } from './auth';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

const router = Router();
router.use(authenticate);

// Helper to get settings
async function getSettings() {
  const [rows]: any = await pool.query('SELECT * FROM settings');
  const settings: Record<string, string> = {};
  rows.forEach((row: any) => {
    settings[row.key_name] = row.value_data;
  });
  return settings;
}

// PDF: Medicines
router.get('/medicines/pdf', async (req, res) => {
  try {
    const settings = await getSettings();
    const [medicines]: any = await pool.query('SELECT * FROM medicines ORDER BY name ASC');
    
    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=medicines_report.pdf');
    doc.pipe(res);

    // Header
    if (settings.logo_base64) {
      try {
        const logoData = settings.logo_base64.split(',')[1];
        doc.image(Buffer.from(logoData, 'base64'), 30, 30, { width: 50 });
      } catch (e) {
        console.error('Logo error', e);
      }
    }
    doc.fontSize(20).text(settings.pharmacy_name || 'Pharmacy Management System', 90, 45);
    doc.fontSize(10).text(`Medicines Inventory Report - ${new Date().toLocaleString()}`, 90, 65);
    doc.moveDown(2);

    // Table Header
    const tableTop = 150;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Name', 30, tableTop);
    doc.text('Category', 180, tableTop);
    doc.text('Stock', 300, tableTop);
    doc.text('Price (TZS)', 380, tableTop);
    doc.text('Expiry', 480, tableTop);
    
    doc.moveTo(30, tableTop + 15).lineTo(570, tableTop + 15).stroke();
    
    // Table Content
    let y = tableTop + 25;
    doc.font('Helvetica');
    medicines.forEach((m: any) => {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.text(m.name.substring(0, 25), 30, y);
      doc.text(m.category || '-', 180, y);
      doc.text(m.stock.toString(), 300, y);
      doc.text(Number(m.selling_price).toLocaleString(), 380, y);
      doc.text(new Date(m.expiry_date).toLocaleDateString(), 480, y);
      y += 20;
    });

    doc.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// PDF: Sales
router.get('/sales/pdf', async (req, res) => {
  try {
    const settings = await getSettings();
    const [sales]: any = await pool.query('SELECT * FROM sales ORDER BY created_at DESC LIMIT 100');
    
    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');
    doc.pipe(res);

    doc.fontSize(20).text(settings.pharmacy_name || 'Pharmacy Management System', 30, 30);
    doc.fontSize(10).text(`Sales Report - Generated: ${new Date().toLocaleString()}`, 30, 55);
    doc.moveDown(2);

    // Table Header
    const tableTop = 100;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Receipt #', 30, tableTop);
    doc.text('Date', 130, tableTop);
    doc.text('Method', 250, tableTop);
    doc.text('Subtotal', 350, tableTop);
    doc.text('Total (TZS)', 450, tableTop);
    
    doc.moveTo(30, tableTop + 15).lineTo(570, tableTop + 15).stroke();
    
    let y = tableTop + 25;
    doc.font('Helvetica');
    sales.forEach((s: any) => {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.text(s.receipt_number, 30, y);
      doc.text(new Date(s.created_at).toLocaleString(), 130, y);
      doc.text(s.payment_method || '-', 250, y);
      doc.text(Number(s.subtotal).toLocaleString(), 350, y);
      doc.text(Number(s.total).toLocaleString(), 450, y);
      y += 20;
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// PDF: Inventory
router.get('/inventory/pdf', async (req, res) => {
  try {
    const settings = await getSettings();
    const [movements]: any = await pool.query('SELECT * FROM inventory_transactions ORDER BY created_at DESC LIMIT 100');
    
    const doc = new PDFDocument({ margin: 30 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory_report.pdf');
    doc.pipe(res);

    doc.fontSize(20).text(settings.pharmacy_name || 'Pharmacy Management System', 30, 30);
    doc.fontSize(10).text(`Inventory Movement Report - Generated: ${new Date().toLocaleString()}`, 30, 55);
    doc.moveDown(2);

    const tableTop = 100;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Date', 30, tableTop);
    doc.text('Medicine', 130, tableTop);
    doc.text('Type', 300, tableTop);
    doc.text('Qty', 380, tableTop);
    doc.text('Reason', 430, tableTop);
    
    doc.moveTo(30, tableTop + 15).lineTo(570, tableTop + 15).stroke();
    
    let y = tableTop + 25;
    doc.font('Helvetica');
    movements.forEach((m: any) => {
      if (y > 700) { doc.addPage(); y = 50; }
      doc.text(new Date(m.created_at).toLocaleString(), 30, y);
      doc.text(m.medicine_name.substring(0, 25), 130, y);
      doc.text(m.type, 300, y);
      doc.text(m.quantity.toString(), 380, y);
      doc.text((m.reason || '-').substring(0, 20), 430, y);
      y += 20;
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Excel: Medicines
router.get('/medicines/excel', async (req, res) => {
  try {
    const [medicines]: any = await pool.query('SELECT * FROM medicines ORDER BY name ASC');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Medicines');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Batch', key: 'batch_number', width: 15 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Price', key: 'selling_price', width: 15 },
      { header: 'Expiry', key: 'expiry_date', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true };
    medicines.forEach((m: any) => {
      worksheet.addRow({
        ...m,
        expiry_date: new Date(m.expiry_date).toLocaleDateString()
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=medicines.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Excel' });
  }
});

// Excel: Sales
router.get('/sales/excel', async (req, res) => {
  try {
    const [sales]: any = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales');

    worksheet.columns = [
      { header: 'Receipt #', key: 'receipt_number', width: 20 },
      { header: 'Date', key: 'created_at', width: 25 },
      { header: 'Subtotal', key: 'subtotal', width: 15 },
      { header: 'Tax', key: 'tax', width: 10 },
      { header: 'Total', key: 'total', width: 15 },
      { header: 'Method', key: 'payment_method', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true };
    sales.forEach((s: any) => {
      worksheet.addRow({
        ...s,
        created_at: new Date(s.created_at).toLocaleString()
      });
    });

    // Add totals row
    const totalRevenue = sales.reduce((sum: number, s: any) => sum + Number(s.total), 0);
    worksheet.addRow({});
    worksheet.addRow({
      receipt_number: 'TOTAL',
      total: totalRevenue
    });
    worksheet.lastRow!.font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=sales.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Excel' });
  }
});

export default router;
