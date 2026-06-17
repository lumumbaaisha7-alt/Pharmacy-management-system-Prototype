import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './server/routes/auth';
import medicinesRoutes from './server/routes/medicines';
import inventoryRoutes from './server/routes/inventory';
import salesRoutes from './server/routes/sales';
import dashboardRoutes from './server/routes/dashboard';
import settingsRoutes from './server/routes/settings';
import reportsRoutes from './server/routes/reports';
import installRoutes from './server/routes/install';
import exportRoutes from './server/routes/exports';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' && process.env.ALLOWED_ORIGIN 
      ? process.env.ALLOWED_ORIGIN 
      : '*'
  }));
  app.use(express.json());

  // API Routes FIRST
  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  
  app.use('/api/auth', authRoutes);
  app.use('/api/medicines', medicinesRoutes);
  app.use('/api/inventory', inventoryRoutes);
  app.use('/api/sales', salesRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/reports', reportsRoutes);
  app.use('/api/install', installRoutes);
  app.use('/api/exports', exportRoutes);

  // Vite middleware for development or Static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT as number, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
