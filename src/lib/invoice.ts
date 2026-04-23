import { formatCurrencyPlain, getInvoiceStatusLabel } from "@/lib/order-utils";

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface InvoiceData {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InvoiceItem[];
  total: number;
  status?: string;
  createdAt?: string;
  forceCompletedStatus?: boolean;
}

async function loadImageAsDataUrl(src: string): Promise<{ dataUrl: string; format: "PNG" | "JPEG" } | null> {
  if (!src) return null;
  try {
    if (src.startsWith("data:image")) {
      const format = src.includes("png") ? "PNG" : "JPEG";
      return { dataUrl: src, format: format as any };
    }
    
    // Use a timeout for the fetch
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(src, { 
      mode: "cors",
      signal: controller.signal,
      headers: { "Accept": "image/*" }
    });
    clearTimeout(id);
    
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const type = blob.type.includes("png") ? "PNG" : "JPEG";
    return { dataUrl, format: type };
  } catch (err) {
    console.warn("Failed to load image for invoice:", src, err);
    return null;
  }
}

export async function generateInvoicePDF(data: InvoiceData) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const pdf = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const invoiceStatus = getInvoiceStatusLabel(data.status, data.forceCompletedStatus);

  // Background Header
  pdf.setFillColor(26, 26, 26); // Dark Grey/Black (#1a1a1a)
  pdf.rect(0, 0, pageWidth, 45, "F");

  // Logo & Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(28);
  pdf.text("DHARMI AYURVEDA", 14, 20);
  
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(197, 160, 89); // Gold (#c5a059)
  pdf.text("AUTHENTIC AYURVEDIC WELLNESS", 14, 28);

  // Header Contact Info
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.text("Rajkot, Gujarat, India", pageWidth - 14, 18, { align: "right" });
  pdf.text("+91 63526 63530", pageWidth - 14, 23, { align: "right" });
  pdf.text("dharmiayurveda@gmail.com", pageWidth - 14, 28, { align: "right" });
  pdf.text("www.dharmiayurveda.com", pageWidth - 14, 33, { align: "right" });

  let y = 60;

  // Invoice Details Box
  pdf.setFillColor(249, 250, 251);
  pdf.roundedRect(14, y - 5, pageWidth - 28, 25, 2, 2, "F");
  
  pdf.setTextColor(26, 26, 26);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.text(`INVOICE #${data.orderId.slice(0, 8).toUpperCase()}`, 20, y + 8);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text("DATE", pageWidth / 2, y + 5, { align: "center" });
  pdf.setFont("helvetica", "bold");
  pdf.text(data.createdAt ? new Date(data.createdAt).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN"), pageWidth / 2, y + 10, { align: "center" });

  pdf.setTextColor(26, 26, 26);
  pdf.setFont("helvetica", "normal");
  pdf.text("TOTAL AMOUNT", pageWidth - 20, y + 5, { align: "right" });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  pdf.text(formatCurrencyPlain(data.total), pageWidth - 20, y + 11, { align: "right" });

  y += 35;

  // Bill To Section
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128);
  pdf.text("BILL TO:", 14, y);
  
  pdf.setTextColor(17, 24, 39);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  y += 6;
  pdf.text(data.customerName || "Customer", 14, y);
  
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  if (data.customerPhone) {
    y += 5;
    pdf.text(`Phone: ${data.customerPhone}`, 14, y);
  }
  if (data.customerEmail) {
    y += 5;
    pdf.text(`Email: ${data.customerEmail}`, 14, y);
  }
  if (data.customerAddress) {
    y += 5;
    const wrapped = pdf.splitTextToSize(data.customerAddress, (pageWidth / 2) - 14);
    pdf.text(wrapped, 14, y);
    y += (wrapped.length * 4);
  }

  const tableBody = data.items.map((item) => [item.name, String(item.quantity), formatCurrencyPlain(item.price), formatCurrencyPlain(item.price * item.quantity)]);

  autoTable(pdf, {
    startY: y + 10,
    head: [["Product Description", "Qty", "Unit Price", "Total"]],
    body: tableBody,
    theme: "striped",
    styles: { fontSize: 9, cellPadding: 5, valign: "middle", minCellHeight: 12 },
    headStyles: { fillColor: [26, 26, 26], textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [249, 250, 251] },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 35, halign: "right" },
      3: { cellWidth: 40, halign: "right" },
    },
  });

  const finalY = (pdf as any).lastAutoTable.finalY || y + 20;

  // Summary section
  const summaryX = pageWidth - 80;
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128);
  pdf.text("Subtotal:", summaryX, finalY + 15);
  pdf.setTextColor(17, 24, 39);
  pdf.text(formatCurrencyPlain(data.total), pageWidth - 14, finalY + 15, { align: "right" });

  pdf.setTextColor(107, 114, 128);
  pdf.text("Shipping:", summaryX, finalY + 22);
  pdf.setTextColor(17, 24, 39);
  pdf.text(formatCurrencyPlain(0), pageWidth - 14, finalY + 22, { align: "right" });

  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.5);
  pdf.line(summaryX, finalY + 26, pageWidth - 14, finalY + 26);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(26, 26, 26);
  pdf.text("Grand Total:", summaryX, finalY + 34);
  pdf.text(formatCurrencyPlain(data.total), pageWidth - 14, finalY + 34, { align: "right" });

  // Footer
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(156, 163, 175);
  pdf.text("This is a computer generated invoice and does not require a physical signature.", pageWidth / 2, pageHeight - 20, { align: "center" });
  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(10);
  pdf.text("Thank you for choosing Dharmi Ayurveda!", pageWidth / 2, pageHeight - 12, { align: "center" });

  pdf.save(`Invoice-${data.orderId.slice(0, 8).toUpperCase()}.pdf`);
}
