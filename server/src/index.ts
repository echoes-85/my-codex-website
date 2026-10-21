import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { configuredAdapters } from './integrations/retailers.js';
import { runPriceAlertWorker } from './workers/price-alert-worker.js';

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT || 8787);
const secret = process.env.AUTH_SECRET || 'development-only-secret';
app.use(cors({ origin: process.env.APP_URL || 'http://localhost:4173' }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'screenscout-api' }));
app.post('/api/auth/register', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  if (!email || password.length < 8) return res.status(400).json({ error: 'Email and an 8-character password are required.' });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'An account already exists.' });
  const user = await prisma.user.create({ data: { email, passwordHash: await argon2.hash(password) } });
  res.status(201).json({ token: jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn: '7d' }) });
});
app.post('/api/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await argon2.verify(user.passwordHash, String(req.body.password || '')))) return res.status(401).json({ error: 'Invalid email or password.' });
  res.json({ token: jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn: '7d' }) });
});
app.post('/api/admin/sync-retailers', async (_req, res) => {
  const results = [];
  for (const adapter of configuredAdapters()) { try { const products = await adapter.fetchProducts(); results.push({ retailer: adapter.retailer, records: products.length }); } catch (error) { results.push({ retailer: adapter.retailer, error: String(error) }); } }
  res.json({ results });
});
app.post('/api/admin/run-price-alerts', async (_req, res) => res.json(await runPriceAlertWorker()));
app.listen(port, () => console.log(`ScreenScout API listening on http://localhost:${port}`));

