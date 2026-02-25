import PDFDocument from "pdfkit";
import { createObjectCsvStringifier } from "csv-writer";
import { ENV } from "../config/env.js";

const IVA_RATE = 0.19;

const SELLER = {
    name:     ENV.COMPANY_NAME    || "Don Palito Junior",
    nit:      ENV.COMPANY_NIT     || "71710169-0",      
    address:  ENV.COMPANY_ADDRESS || "Carrera 47 # 76D Sur-37",   
    city:     ENV.COMPANY_CITY    || "Sabaneta, Antioquia",
    phone:    ENV.COMPANY_PHONE   || "3148702078",        
    email:    ENV.ADMIN_EMAIL     || "andreaac777@gmail.com",
    regime:   "Responsable de IVA",
    logoUrl:  ENV.LOGO_URL        || null,
};

const PAYMENT_LABELS = {
    stripe:        "Tarjeta de crédito",
    transferencia: "Transferencia bancaria",
};

function formatCOP(value) {
    return `$${Number(value).toLocaleString("es-CO")} COP`;
}

function generateInvoiceNumber(orderId, date) {
    const year   = date.getFullYear();
    const suffix = orderId.toString().slice(-8).toUpperCase();
    return `FV-${year}-${suffix}`;
}
export async function generateInvoicePDF(invoiceData) {
    return new Promise(async (resolve, reject) => {
        try {
            const {
                orderId, date, paymentMethod, items, shipping, discount = 0,
                customer: { name, documentType, documentNumber, email, phone, address, city },
            } = invoiceData;

            const chunks = [];
            const doc    = new PDFDocument({ size: "A4", margin: 50, bufferPages: true });

            doc.on("data",  chunk => chunks.push(chunk));
            doc.on("end",   ()    => resolve(Buffer.concat(chunks)));
            doc.on("error", err   => reject(err));

            const BRAND  = "#C34928";
            const DARK   = "#222222";
            const GRAY   = "#555555";
            const HGRAY  = "#e8e8e8";
            const LGRAY  = "#f5f5f5";
            const W      = doc.page.width  - 100; 
            const LEFT   = 50;

            const invoiceNumber = generateInvoiceNumber(orderId, date);
            const dateStr       = date.toLocaleDateString("es-CO", {
                day: "2-digit", month: "2-digit", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            });

            let logoLoaded = false;
            if (SELLER.logoUrl) {
                try {
                    const https  = await import("https");
                    const http   = await import("http");
                    const client = SELLER.logoUrl.startsWith("https") ? https : http;

                    const logoBuffer = await new Promise((res2, rej2) => {
                        client.default.get(SELLER.logoUrl, response => {
                            const imgChunks = [];
                            response.on("data",  c  => imgChunks.push(c));
                            response.on("end",   ()  => res2(Buffer.concat(imgChunks)));
                            response.on("error", err => rej2(err));
                        }).on("error", rej2);
                    });

                    doc.image(logoBuffer, LEFT, 45, { fit: [160, 60], align: "left", valign: "center" });
                    logoLoaded = true;
                } catch (_) {
                }
            }

            if (!logoLoaded) {
                doc.fontSize(22).fillColor(BRAND).font("Helvetica-Bold")
                   .text(SELLER.name, LEFT, 50, { width: 300 });
            }
            const badgeX = LEFT + W - 160;
            doc.rect(badgeX, 45, 160, 36).fill(BRAND);
            doc.fontSize(13).fillColor("white").font("Helvetica-Bold")
               .text("FACTURA DE VENTA", badgeX, 56, { width: 160, align: "center" });

            let y = 115;
            doc.fontSize(8).fillColor(GRAY).font("Helvetica");
            doc.text(`NIT: ${SELLER.nit}`, LEFT, y);
            y += 12;
            doc.text(`${SELLER.address} — ${SELLER.city}`, LEFT, y);
            y += 12;
            doc.text(`${SELLER.phone} | ${SELLER.email}`, LEFT, y);
            y += 12;
            doc.text(SELLER.regime, LEFT, y);
            y += 16;

            doc.moveTo(LEFT, y).lineTo(LEFT + W, y).lineWidth(1.5).strokeColor(BRAND).stroke();
            y += 14;

            const halfW   = (W - 10) / 2;
            const colLeft = LEFT;
            const colRight= LEFT + halfW + 10;
            const docLabel = documentType === "cedula_extranjeria" ? "C.E." : "C.C.";

            const sectionHeader = (text, x, width) => {
                doc.rect(x, y, width, 18).fill(HGRAY);
                doc.fontSize(9).fillColor(DARK).font("Helvetica-Bold")
                   .text(text, x + 8, y + 4, { width: width - 16 });
            };

            sectionHeader("DATOS DE LA FACTURA", colLeft,  halfW);
            sectionHeader("DATOS DEL CLIENTE",   colRight, halfW);
            y += 22;
            
            const metaRows = [
                ["N° Factura:", invoiceNumber],
                ["Fecha:",      dateStr],
                ["Pedido:",     `#${orderId.toString().slice(-8).toUpperCase()}`],
                ["Pago:",       PAYMENT_LABELS[paymentMethod] || paymentMethod || "—"],
            ];

            const clientRows = [
                ["Cliente:",    name],
                [`${docLabel}:`, documentNumber || "—"],
                ["Email:",      email],
                ["Teléfono:",   phone || "—"],
                ["Dirección:",  address],
                ["Ciudad:",     `${city}, Colombia`],
            ];

            const rowStart = y;
            metaRows.forEach(([label, value], i) => {
                const ry = rowStart + i * 16;
                doc.fontSize(8).fillColor(GRAY).font("Helvetica-Bold").text(label, colLeft + 8, ry, { width: 65 });
                const isInvNo = label === "N° Factura:";
                doc.fontSize(isInvNo ? 9 : 8)
                   .fillColor(isInvNo ? BRAND : DARK)
                   .font(isInvNo ? "Helvetica-Bold" : "Helvetica")
                   .text(value, colLeft + 75, ry, { width: halfW - 83 });
            });

            clientRows.forEach(([label, value], i) => {
                const ry = rowStart + i * 16;
                doc.fontSize(8).fillColor(GRAY).font("Helvetica-Bold").text(label, colRight + 8, ry, { width: 55 });
                doc.fontSize(8).fillColor(DARK).font("Helvetica")
                   .text(value, colRight + 65, ry, { width: halfW - 73 });
            });

            y = rowStart + Math.max(metaRows.length, clientRows.length) * 16 + 16;

            const cols = {
                desc: LEFT,         wDesc: W * 0.40,
                qty:  LEFT + W * 0.40, wQty: W * 0.08,
                up:   LEFT + W * 0.48, wUp:  W * 0.16,
                iva:  LEFT + W * 0.64, wIva: W * 0.17,
                tot:  LEFT + W * 0.81, wTot: W * 0.19,
            };
            doc.rect(LEFT, y, W, 20).fill(HGRAY);
            doc.fontSize(8.5).fillColor(DARK).font("Helvetica-Bold");
            doc.text("DESCRIPCIÓN",     cols.desc + 6, y + 5, { width: cols.wDesc - 8 });
            doc.text("CANT.",           cols.qty,       y + 5, { width: cols.wQty,  align: "center" });
            doc.text("V. UNITARIO",     cols.up,        y + 5, { width: cols.wUp,   align: "right" });
            doc.text("IVA 19% (incl.)", cols.iva,       y + 5, { width: cols.wIva,  align: "right" });
            doc.text("V. TOTAL",        cols.tot,       y + 5, { width: cols.wTot,  align: "right" });
            y += 20;

            let subtotal = 0;
            items.forEach((item, i) => {
                const lineTotal = item.price * item.quantity;
                const base      = Math.round(lineTotal / (1 + IVA_RATE));
                const iva       = lineTotal - base;
                subtotal       += lineTotal;

                const rowH  = 22;
                const fillC = i % 2 === 0 ? LGRAY : "white";
                doc.rect(LEFT, y, W, rowH).fill(fillC);

                doc.rect(LEFT, y, W, rowH).lineWidth(0.3).strokeColor("#dddddd").stroke();

                doc.fontSize(8.5).fillColor(DARK).font("Helvetica");
                doc.text(item.name,                  cols.desc + 6, y + 6, { width: cols.wDesc - 8 });
                doc.text(String(item.quantity),      cols.qty,       y + 6, { width: cols.wQty,  align: "center" });
                doc.text(formatCOP(item.price),      cols.up,        y + 6, { width: cols.wUp,   align: "right" });
                doc.text(formatCOP(iva),             cols.iva,       y + 6, { width: cols.wIva,  align: "right" });
                doc.text(formatCOP(lineTotal),       cols.tot,       y + 6, { width: cols.wTot,  align: "right" });
                y += rowH;
            });

            y += 12;
            const total  = subtotal + shipping - discount;
            const tBase  = Math.round(total / (1 + IVA_RATE));
            const tIva   = total - tBase;
            const tRight = LEFT + W;
            const tLabelW= 150;
            const tValW  = 110;
            const tLabelX= tRight - tLabelW - tValW;

            const totalRow = (label, value, bold = false, color = DARK) => {
                doc.fontSize(bold ? 10 : 9)
                   .fillColor(GRAY).font("Helvetica")
                   .text(label, tLabelX, y, { width: tLabelW, align: "right" });
                doc.fontSize(bold ? 10 : 9)
                   .fillColor(color).font(bold ? "Helvetica-Bold" : "Helvetica")
                   .text(value, tRight - tValW, y, { width: tValW, align: "right" });
                y += bold ? 16 : 14;
            };

            totalRow("Subtotal productos:", formatCOP(subtotal));
            totalRow("Envío:",              formatCOP(shipping));
            if (discount > 0) {
                totalRow("Descuento:", `-${formatCOP(discount)}`, false, "#2d6a4f");
            }

            doc.moveTo(tLabelX, y).lineTo(tRight, y).lineWidth(0.5).strokeColor(GRAY).stroke();
            y += 8;

            totalRow("Base gravable (sin IVA):", formatCOP(tBase));
            totalRow("IVA 19% (incluido):",      formatCOP(tIva));

            doc.moveTo(tLabelX, y).lineTo(tRight, y).lineWidth(1.5).strokeColor(BRAND).stroke();
            y += 8;
            totalRow("TOTAL A PAGAR:", formatCOP(total), true, BRAND);
            y += 20;
            doc.moveTo(LEFT, y).lineTo(LEFT + W, y).lineWidth(0.5).strokeColor("#dddddd").stroke();
            y += 8;

            const footerLines = [
                "Este documento es una factura de venta equivalente. Los precios incluyen IVA del 19%.",
                `Régimen: ${SELLER.regime} — ${SELLER.name} — NIT ${SELLER.nit}`,
                `Gracias por tu compra en ${SELLER.name}. Consultas: ${SELLER.email}`,
            ];
            footerLines.forEach(line => {
                doc.fontSize(7.5).fillColor(GRAY).font("Helvetica")
                   .text(line, LEFT, y, { width: W, align: "center" });
                y += 11;
            });

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
}

export function generateInvoiceCSV(invoiceData) {
    const {
        orderId, date, paymentMethod, items, shipping, discount = 0,
        customer: { name, documentType, documentNumber, email, phone, address, city },
    } = invoiceData;

    const invoiceNumber = generateInvoiceNumber(orderId, date);
    const dateStr       = date.toLocaleDateString("es-CO");
    const docLabel      = documentType === "cedula_extranjeria" ? "C.E." : "C.C.";
    const paymentLabel  = PAYMENT_LABELS[paymentMethod] || paymentMethod || "—";

    let subtotal = 0;
    const rows = items.map(item => {
        const lineTotal = item.price * item.quantity;
        const base      = Math.round(lineTotal / (1 + IVA_RATE));
        const iva       = lineTotal - base;
        subtotal       += lineTotal;

        return {
            factura:          invoiceNumber,
            fecha:            dateStr,
            pedido:           orderId.toString().slice(-8).toUpperCase(),
            pago:             paymentLabel,
            cliente:          name,
            documento:        `${docLabel} ${documentNumber || "—"}`,
            email_cliente:    email,
            telefono:         phone || "—",
            direccion:        address,
            ciudad:           `${city}, Colombia`,
            descripcion:      item.name,
            cantidad:         item.quantity,
            precio_unitario:  item.price,
            iva_19_incluido:  iva,
            valor_total_item: lineTotal,
        };
    });

    const total = subtotal + shipping - discount;
    const tBase = Math.round(total / (1 + IVA_RATE));
    const tIva  = total - tBase;

    rows.push({ descripcion: "—— RESUMEN ——" });
    rows.push({ descripcion: "Subtotal productos", valor_total_item: subtotal });
    rows.push({ descripcion: "Envío",               valor_total_item: shipping });
    if (discount > 0) {
        rows.push({ descripcion: "Descuento", valor_total_item: -discount });
    }
    rows.push({ descripcion: "Base gravable (sin IVA)", valor_total_item: tBase });
    rows.push({ descripcion: "IVA 19% (incluido)",      valor_total_item: tIva  });
    rows.push({ descripcion: "TOTAL A PAGAR",            valor_total_item: total });

    const csvStringifier = createObjectCsvStringifier({
        header: [
            { id: "factura",          title: "N° Factura"         },
            { id: "fecha",            title: "Fecha"               },
            { id: "pedido",           title: "Pedido"              },
            { id: "pago",             title: "Método de Pago"      },
            { id: "cliente",          title: "Cliente"             },
            { id: "documento",        title: "Documento"           },
            { id: "email_cliente",    title: "Email"               },
            { id: "telefono",         title: "Teléfono"            },
            { id: "direccion",        title: "Dirección"           },
            { id: "ciudad",           title: "Ciudad"              },
            { id: "descripcion",      title: "Descripción"         },
            { id: "cantidad",         title: "Cantidad"            },
            { id: "precio_unitario",  title: "Precio Unitario COP" },
            { id: "iva_19_incluido",  title: "IVA 19% Incluido"    },
            { id: "valor_total_item", title: "Valor Total COP"     },
        ],
    });

    return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(rows);
}