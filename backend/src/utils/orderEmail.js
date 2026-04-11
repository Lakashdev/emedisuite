import { mailer } from "../config/mailer.js";

const BRAND = "MediSuite";
const BRAND_COLOR = "#1B3D6E";
const GREEN = "#6BBF4E";

const money = (n) => `NPR ${Number(n || 0).toLocaleString("en-US")}`;
const fmt = (d) => (d ? new Date(d).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "-");

function baseLayout(content) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f6f7fb;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.07);">
          <!-- Header -->
          <tr>
            <td style="background:${BRAND_COLOR};padding:28px 36px;">
              <div style="color:#fff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">${BRAND}</div>
              <div style="color:rgba(255,255,255,.6);font-size:12px;margin-top:2px;">Pharmacy Essentials · Kathmandu</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px 36px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f6f7fb;padding:20px 36px;border-top:1px solid #e2e8f0;">
              <div style="font-size:12px;color:#94a3b8;text-align:center;line-height:1.6;">
                © ${new Date().getFullYear()} ${BRAND} · Kathmandu, Nepal<br/>
                This is an automated email — please do not reply directly.
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function itemsTable(items) {
  const rows = items.map((it) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;">
        <div style="font-weight:600;">${it.productName}</div>
        ${it.variantName ? `<div style="font-size:12px;color:#64748b;">${it.variantName}</div>` : ""}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;text-align:center;font-size:14px;color:#64748b;">${it.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:14px;font-weight:600;color:#1B3D6E;">${money(it.lineTotal)}</td>
    </tr>`).join("");

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="padding:10px 0;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Product</th>
          <th style="padding:10px 0;text-align:center;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Qty</th>
          <th style="padding:10px 0;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;">Total</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function pricingBlock(order) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Subtotal</td>
        <td style="font-size:13px;color:#1e293b;text-align:right;padding:4px 0;">${money(order.subtotal)}</td>
      </tr>
      ${order.discountTotal > 0 ? `
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Discount</td>
        <td style="font-size:13px;color:#16a34a;text-align:right;padding:4px 0;">- ${money(order.discountTotal)}</td>
      </tr>` : ""}
      <tr>
        <td style="font-size:13px;color:#64748b;padding:4px 0;">Delivery Fee</td>
        <td style="font-size:13px;color:#1e293b;text-align:right;padding:4px 0;">${money(order.deliveryFee)}</td>
      </tr>
      <tr>
        <td style="border-top:2px solid #e2e8f0;padding-top:10px;font-size:15px;font-weight:800;color:#1B3D6E;">Total</td>
        <td style="border-top:2px solid #e2e8f0;padding-top:10px;font-size:15px;font-weight:800;color:#1B3D6E;text-align:right;">${money(order.total)}</td>
      </tr>
    </table>`;
}

function deliveryBlock(order) {
  return `
    <div style="background:#f8fafc;border-radius:10px;padding:16px 18px;margin-top:16px;font-size:13px;color:#475569;line-height:1.8;">
      <div style="font-weight:700;color:#1B3D6E;margin-bottom:6px;">Delivery Details</div>
      <div><b>Name:</b> ${order.fullName}</div>
      <div><b>Phone:</b> ${order.phone}</div>
      <div><b>Address:</b> ${order.addressLine}${order.area ? `, ${order.area}` : ""}${order.landmark ? ` (Near ${order.landmark})` : ""}</div>
      <div><b>City:</b> ${order.city || "Kathmandu"}</div>
      <div><b>Zone:</b> ${order.deliveryZone === "inside" ? "Inside Ring Road" : "Outside Ring Road"}</div>
      <div><b>Payment:</b> ${order.paymentMethod}</div>
      ${order.notes ? `<div><b>Notes:</b> ${order.notes}</div>` : ""}
    </div>`;
}

/* ─── Customer email ─── */
function buildCustomerHtml(order) {
  const content = `
    <div style="font-size:24px;font-weight:800;color:#1B3D6E;margin-bottom:4px;">Order Confirmed! 🎉</div>
    <div style="font-size:14px;color:#64748b;margin-bottom:24px;">
      Hi ${order.fullName}, your order has been placed successfully.
    </div>

    <div style="background:${GREEN};border-radius:10px;padding:14px 18px;display:inline-block;margin-bottom:24px;">
      <span style="color:#fff;font-size:13px;font-weight:700;">Order #${order.orderNumber}</span>
      <span style="color:rgba(255,255,255,.8);font-size:12px;margin-left:12px;">Placed ${fmt(order.placedAt)}</span>
    </div>

    <div style="font-size:14px;font-weight:700;color:#1B3D6E;margin-bottom:8px;">Items Ordered</div>
    ${itemsTable(order.items)}
    ${pricingBlock(order)}
    ${deliveryBlock(order)}

    <div style="margin-top:24px;padding:14px 18px;border-radius:10px;background:#EEF2F8;font-size:13px;color:#475569;line-height:1.7;">
      <b>What happens next?</b><br/>
      Our team will confirm your order shortly. You'll receive an update when it's packed and out for delivery. Payment is collected on delivery (COD).
    </div>
  `;
  return baseLayout(content);
}

/* ─── Admin email ─── */
function buildAdminHtml(order) {
  const content = `
    <div style="font-size:20px;font-weight:800;color:#1B3D6E;margin-bottom:4px;">New Order Received</div>
    <div style="font-size:13px;color:#64748b;margin-bottom:20px;">A new order has been placed and requires your attention.</div>

    <div style="background:#FEF3C7;border:1px solid #FDE68A;border-radius:10px;padding:12px 16px;margin-bottom:20px;font-size:13px;font-weight:700;color:#92400e;">
      ⚡ Action needed: Please confirm or process this order.
    </div>

    <div style="display:flex;gap:16px;margin-bottom:20px;">
      <div style="flex:1;background:#f8fafc;border-radius:10px;padding:14px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:4px;">Order Number</div>
        <div style="font-size:16px;font-weight:800;color:#1B3D6E;">#${order.orderNumber}</div>
      </div>
      <div style="flex:1;background:#f8fafc;border-radius:10px;padding:14px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:4px;">Order Total</div>
        <div style="font-size:16px;font-weight:800;color:#1B3D6E;">${money(order.total)}</div>
      </div>
    </div>

    <div style="font-size:14px;font-weight:700;color:#1B3D6E;margin-bottom:8px;">Items</div>
    ${itemsTable(order.items)}
    ${pricingBlock(order)}
    ${deliveryBlock(order)}

    <div style="margin-top:20px;font-size:13px;color:#64748b;">
      Placed at: ${fmt(order.placedAt)}
    </div>
  `;
  return baseLayout(content);
}

/* ─── Plain text fallbacks ─── */
function buildCustomerText(order) {
  const lines = [
    `Order Confirmed — #${order.orderNumber}`,
    `Hi ${order.fullName}, your order has been placed.`,
    ``,
    `Items:`,
    ...order.items.map((it) => `  - ${it.productName}${it.variantName ? ` (${it.variantName})` : ""} x${it.quantity} = ${money(it.lineTotal)}`),
    ``,
    `Subtotal: ${money(order.subtotal)}`,
    `Delivery: ${money(order.deliveryFee)}`,
    `Total: ${money(order.total)}`,
    ``,
    `Deliver to: ${order.fullName}, ${order.phone}`,
    `${order.addressLine}${order.area ? `, ${order.area}` : ""}, ${order.city}`,
    `Payment: ${order.paymentMethod}`,
  ];
  return lines.join("\n");
}

function buildAdminText(order) {
  const lines = [
    `New order received: #${order.orderNumber}`,
    `Total: ${money(order.total)}`,
    `Customer: ${order.fullName} (${order.phone})`,
    `Address: ${order.addressLine}, ${order.city}`,
    `Items: ${order.items.map((it) => `${it.productName} x${it.quantity}`).join(", ")}`,
  ];
  return lines.join("\n");
}

/* ─── Public send functions ─── */
export async function sendOrderConfirmationToCustomer(order, userEmail) {
  console.log("customer email target:", userEmail);

  if (!userEmail) {
    console.warn("Customer email skipped: no user email");
    return;
  }

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: userEmail,
    subject: `Order Confirmed — #${order.orderNumber} | ${BRAND}`,
    text: buildCustomerText(order),
    html: buildCustomerHtml(order),
  });

  console.log("customer email sent:", info.messageId);
}

export async function sendOrderNotificationToAdmin(order) {
  const adminEmail = process.env.ADMIN_EMAIL;
  console.log("admin email target:", adminEmail);

  if (!adminEmail) {
    console.warn("ADMIN_EMAIL env var not set — skipping admin order notification");
    return;
  }

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: adminEmail,
    subject: `🛒 New Order #${order.orderNumber} — ${money(order.total)} | ${BRAND}`,
    text: buildAdminText(order),
    html: buildAdminHtml(order),
  });

  console.log("admin email sent:", info.messageId);
}

/* Send both, never throw — email failures must not break the order */
export async function sendOrderEmails(order, userEmail) {
  const results = await Promise.allSettled([
    sendOrderConfirmationToCustomer(order, userEmail),
    sendOrderNotificationToAdmin(order),
  ]);
  for (const r of results) {
    if (r.status === "rejected") {
      console.error("Order email failed:", r.reason);
    }
  }
}