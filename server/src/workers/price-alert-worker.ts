import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function runPriceAlertWorker() {
  const alerts = await prisma.priceAlert.findMany({ where: { active: true }, include: { user: true, product: { include: { prices: true } } } });
  const due = alerts.filter(alert => alert.product.prices.some(price => price.pricePence <= alert.targetPence));
  if (!due.length) return { triggered: 0 };
  const transport = process.env.SMTP_HOST ? nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587), auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } }) : null;
  for (const alert of due) {
    if (transport) await transport.sendMail({ from: process.env.EMAIL_FROM, to: alert.user.email, subject: `Price alert: ${alert.product.name}`, text: `${alert.product.name} is now at or below your target price.` });
    await prisma.priceAlert.update({ where: { id: alert.id }, data: { active: false, triggeredAt: new Date() } });
  }
  return { triggered: due.length, emailed: Boolean(transport) };
}

