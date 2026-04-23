import { createServerFn } from "@tanstack/react-start";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const SMTP_USER = "dharmiayurveda@gmail.com";
const SMTP_PASS = "hlilsoxlbrlhqzjv";
const ADMIN_EMAIL = "dharmiayurveda@gmail.com";

const LOGO_PATH = process.env.VERCEL 
  ? path.join(process.cwd(), "src/assets/logo.jpg")
  : path.resolve(process.cwd(), "src/assets/logo.jpg");

const getLogoAttachment = () => {
  if (fs.existsSync(LOGO_PATH)) {
    return [{
      filename: "logo.jpg",
      path: LOGO_PATH,
      cid: "logo"
    }];
  }
  console.warn("[SMTP] Logo not found at:", LOGO_PATH);
  return [];
};

const transporterPromise = (async () => {
  console.log(`[SMTP] Initializing global transporter pool. Env: ${process.env.VERCEL ? 'VERCEL' : 'LOCAL'}`);
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    requireTLS: true,
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
    debug: true,
    logger: true
  });
})();

export const testEmail = createServerFn({ method: "POST" })
  .handler(async () => {
    console.log("[SMTP] Starting diagnostic test...");
    try {
      const transporter = await transporterPromise;
      console.log("[SMTP] Verifying connection...");
      const verified = await transporter.verify();
      console.log("[SMTP] Verification success:", verified);
      
      return { 
        success: true, 
        verified, 
        info: "SMTP Connection Verified!",
        env: process.env.VERCEL ? 'VERCEL' : 'LOCAL',
        config: { host: "smtp.gmail.com", port: 587, secure: false }
      };
    } catch (err: any) {
      console.error("[SMTP] Diagnostic failed:", err);
      return { 
        success: false, 
        error: err.message, 
        code: err.code,
        command: err.command,
        stack: err.stack
      };
    }
  });

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
}

// MATCHING THE REQUESTED THEME FROM IMAGE
const generateEmailHtml = (data: {
  title: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  items?: OrderItem[];
  total?: number;
  message?: string;
}) => {
  const itemRows = data.items
    ? data.items
        .map(
          (item) => `
      <tr>
        <td style="padding: 12px 10px; border: 1px solid #e5e7eb; font-size: 14px; text-align: left; color: #333;">${item.name}</td>
        <td style="padding: 12px 10px; border: 1px solid #e5e7eb; font-size: 14px; text-align: center; color: #333;">${item.quantity}</td>
        <td style="padding: 12px 10px; border: 1px solid #e5e7eb; font-size: 14px; text-align: right; color: #333;">₹${(item.price * item.quantity).toLocaleString("en-IN")}</td>
      </tr>`
        )
        .join("")
    : "";

  const tableHtml = data.items
    ? `
    <h3 style="font-size: 18px; margin-top: 30px; margin-bottom: 15px; color: #1a1a1a; font-weight: bold;">Order Items</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f9fafb;">
          <th style="padding: 12px 10px; border: 1px solid #e5e7eb; text-align: left; font-size: 14px; color: #1a1a1a;">Product</th>
          <th style="padding: 12px 10px; border: 1px solid #e5e7eb; text-align: center; font-size: 14px; color: #1a1a1a;">Qty</th>
          <th style="padding: 12px 10px; border: 1px solid #e5e7eb; text-align: right; font-size: 14px; color: #1a1a1a;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        <tr style="font-weight: bold;">
          <td colspan="2" style="padding: 12px 10px; border: 1px solid #e5e7eb; text-align: right; font-size: 15px; color: #1a1a1a;">Total</td>
          <td style="padding: 12px 10px; border: 1px solid #e5e7eb; text-align: right; font-size: 15px; color: #1a1a1a;">₹${data.total?.toLocaleString("en-IN")}</td>
        </tr>
      </tbody>
    </table>`
    : "";

  const phoneVal = data.customerPhone && data.customerPhone !== "N/A" ? data.customerPhone : "";
  const addressVal = data.customerAddress && data.customerAddress !== "N/A" ? data.customerAddress : "";
  const emailVal = data.customerEmail && data.customerEmail !== "N/A" ? data.customerEmail : "";
  const logoUrl = "cid:logo";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; overflow: hidden;">
        
        <!-- Header Section -->
        <div style="background-color: #1a1a1a; padding: 40px 30px; color: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" valign="top">
                <div style="color: #c5a059; font-size: 10px; letter-spacing: 2px; font-weight: bold; margin-bottom: 8px; text-transform: uppercase;">
                  AUTHENTIC AYURVEDIC WELLNESS
                </div>
                <div style="font-family: 'Times New Roman', Times, serif; font-size: 32px; line-height: 1.1; margin: 0; font-weight: bold;">
                  Dharmi<br>Ayurveda
                </div>
                <div style="margin-top: 15px; font-size: 12px; color: #a0a0a0; max-width: 260px; line-height: 1.4;">
                  Natural weight loss solutions powered by ancient wisdom and purity.
                </div>
              </td>
              <td align="right" valign="top" width="100">
                <div style="background-color: #ffffff; width: 85px; height: 85px; border-radius: 50%; text-align: center; overflow: hidden;">
                  <img src="${logoUrl}" alt="Dharmi Ayurveda" style="width: 100%; height: 100%; object-fit: contain;">
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Content Section -->
        <div style="padding: 30px;">
          ${data.message ? `<div style="margin-bottom: 30px; font-size: 16px; color: #333; line-height: 1.6;">${data.message}</div>` : ""}

          <h3 style="font-size: 18px; color: #1a1a1a; margin-top: 0; margin-bottom: 15px; font-weight: bold;">Customer Details</h3>
          <div style="font-size: 14px; line-height: 1.8; color: #444; margin-bottom: 30px;">
            <p style="margin: 0;"><strong>Name:</strong> ${data.customerName}</p>
            ${emailVal ? `<p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${emailVal}" style="color: #3b82f6; text-decoration: none;">${emailVal}</a></p>` : ""}
            ${phoneVal ? `<p style="margin: 0;"><strong>Phone:</strong> ${phoneVal}</p>` : ""}
            ${addressVal ? `<p style="margin: 0;"><strong>Address:</strong> ${addressVal}</p>` : ""}
            <p style="margin: 5px 0;"><strong>Order ID:</strong> ${data.orderId}</p>
          </div>

          ${tableHtml}
        </div>

        <!-- Separator Line -->
        <div style="height: 4px; background-color: #1a1a1a; margin: 0 30px;"></div>

        <!-- Signature/Footer Section -->
        <div style="padding: 30px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td align="left" valign="top">
                <div style="font-size: 18px; font-weight: bold; color: #1a1a1a; margin-bottom: 5px;">Dharmi Ayurveda Support</div>
                <div style="color: #c5a059; font-size: 11px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 20px;">
                  CUSTOMER EXPERIENCE | DHARMI AYURVEDA
                </div>
                
                <div style="font-size: 12px; color: #666; line-height: 1.6;">
                  <p style="margin: 0;">+91 63526 63530</p>
                  <p style="margin: 0;"><a href="mailto:dharmiayurveda@gmail.com" style="color: #3b82f6; text-decoration: none;">dharmiayurveda@gmail.com</a></p>
                  <p style="margin: 0;">Rajkot, Gujarat, India</p>
                </div>
              </td>
              <td align="right" valign="bottom" width="150">
                <div style="font-family: serif; font-size: 28px; color: #f2f2f2; font-weight: bold; margin-bottom: 5px; letter-spacing: -1px;">DA.</div>
                <div style="font-size: 9px; color: #999; font-style: italic;">Excellence in every drop.</div>
              </td>
            </tr>
          </table>
        </div>

      </div>

      <!-- Bottom Disclaimer -->
      <div style="max-width: 600px; margin: 20px auto; text-align: center; font-size: 11px; color: #999;">
        <p style="margin: 0;">Dharmi Ayurveda, Rajkot, Gujarat, India.</p>
        <p style="margin: 5px 0;">© 2026. This is a business communication regarding your order.</p>
      </div>
    </body>
    </html>
  `;
};

export const sendOrderEmail = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: OrderEmailData }) => {
    if (!data) {
      console.error("CRITICAL: No data received in sendOrderEmail");
      return { success: false as const, error: "No data received" };
    }

    const { orderId, customerName, customerEmail, customerPhone, customerAddress, items, total } = data;
    console.log("Attempting to send order email for ID:", orderId);
    
    try {
      const transporter = await transporterPromise;
      const emailHtml = generateEmailHtml({
        title: "New Order – Dharmi Ayurveda",
        orderId: orderId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        items: items,
        total: total
      });

      console.log("Sending admin email to:", ADMIN_EMAIL);
      const adminResult = await transporter.sendMail({
        from: SMTP_USER,
        to: ADMIN_EMAIL,
        subject: `New Order: #${orderId.slice(0, 8)}`,
        html: emailHtml,
        attachments: getLogoAttachment()
      });
      console.log("✅ Admin email sent! ID:", adminResult.messageId);

      if (customerEmail) {
        console.log("Sending customer email to:", customerEmail);
        const customerResult = await transporter.sendMail({
          from: SMTP_USER,
          to: customerEmail,
          subject: `Order Confirmed – Dharmi Ayurveda #${orderId.slice(0, 8)}`,
          html: emailHtml,
          attachments: getLogoAttachment()
        });
        console.log("✅ Customer email sent! ID:", customerResult.messageId);
      }
      return { success: true as const };
    } catch (err: any) {
      console.error("❌ ERROR: Order email failed to send!");
      console.error("❌ SMTP Error details:", err);
      return { success: false as const, error: err.message || "Unknown SMTP error" };
    }
  });

export const sendStatusChangeNotification = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: any }) => {
    const { orderId, customerName, customerEmail, customerPhone, customerAddress, status } = data;
    try {
      const transporter = await transporterPromise;
      const emailHtml = generateEmailHtml({
        title: "Order Update – Dharmi Ayurveda",
        orderId: orderId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        message: `<p>The status of your order has been updated to: <strong style="color: #ea580c; text-transform: uppercase;">${status}</strong></p>`
      });

      await transporter.sendMail({
        from: SMTP_USER,
        to: ADMIN_EMAIL,
        subject: `Status Update: #${orderId.slice(0, 8)} - ${status.toUpperCase()}`,
        html: emailHtml,
        attachments: getLogoAttachment()
      });

      if (customerEmail && customerEmail !== "N/A" && customerEmail.includes("@")) {
        await transporter.sendMail({
          from: SMTP_USER,
          to: customerEmail,
          subject: `Update on Order #${orderId.slice(0, 8)} – ${status.toUpperCase()}`,
          html: emailHtml,
          attachments: getLogoAttachment()
        });
      }
      return { success: true as const };
    } catch (err: any) {
      console.error("Status update failed:", err);
      return { success: false as const, error: err.message };
    }
  });

export const sendCancellationNotification = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: any }) => {
    const { orderId, customerName, customerEmail, customerPhone, customerAddress, reason } = data;
    try {
      const transporter = await transporterPromise;
      const emailHtml = generateEmailHtml({
        title: "Order Cancelled – Dharmi Ayurveda",
        orderId: orderId,
        customerName: customerName,
        customerEmail: customerEmail,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        message: `
          <p style="color: #dc2626; font-weight: bold;">This order has been cancelled.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        `
      });

      await transporter.sendMail({
        from: SMTP_USER,
        to: ADMIN_EMAIL,
        subject: `Order Cancelled: #${orderId.slice(0, 8)}`,
        html: emailHtml,
        attachments: getLogoAttachment()
      });

      if (customerEmail && customerEmail !== "N/A" && customerEmail.includes("@")) {
        await transporter.sendMail({
          from: SMTP_USER,
          to: customerEmail,
          subject: `Order Cancelled – Dharmi Ayurveda #${orderId.slice(0, 8)}`,
          html: emailHtml,
          attachments: getLogoAttachment()
        });
      }
      return { success: true as const };
    } catch (err: any) {
      console.error("Cancellation failed:", err);
      return { success: false as const, error: err.message };
    }
  });

export const sendReviewNotification = createServerFn({ method: "POST" })
  .handler(async ({ data }: { data: any }) => {
    const { userName, rating, message } = data;
    try {
      const transporter = await transporterPromise;
      const emailHtml = generateEmailHtml({
        title: "New Review to Approve – Dharmi Ayurveda",
        orderId: "REVIEW",
        customerName: userName,
        customerEmail: "",
        customerPhone: "",
        customerAddress: "",
        message: `
          <p>A new review has been submitted and is waiting for your approval.</p>
          <p><strong>User:</strong> ${userName}</p>
          <p><strong>Rating:</strong> ${rating} Stars</p>
          <p><strong>Comment:</strong> ${message}</p>
        `
      });

      await transporter.sendMail({
        from: SMTP_USER,
        to: ADMIN_EMAIL,
        subject: `New Review from ${userName} - ${rating} Stars`,
        html: emailHtml,
        attachments: getLogoAttachment()
      });

      return { success: true as const };
    } catch (err: any) {
      console.error("Review notification failed:", err);
      return { success: false as const, error: err.message };
    }
  });
