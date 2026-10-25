import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const distPath = path.resolve(__dirname, 'dist');
  const distIndex = path.resolve(distPath, 'index.html');
  const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.argv[1] && process.argv[1].endsWith('server.js'));

  app.use(express.json());

  // Health check endpoint for Cloud Run probes
  app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

  // Explicit route for the requested merchant login path
  app.get('/merchant/login.php', (req, res) => {
    if (isProduction && fs.existsSync(distIndex)) {
      res.sendFile(distIndex);
    } else {
      // In dev, let the wildcard/vite handler deal with it
      res.redirect('/');
    }
  });

  if (isProduction && fs.existsSync(distIndex)) {
    console.log('Serving production build from:', distPath);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(distIndex);
    });
  } else {
    // Dev server using Vite
    console.log('Starting Vite development server...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const rootIndex = path.resolve(__dirname, 'index.html');
        if (!fs.existsSync(rootIndex)) {
          return res.status(404).send('index.html not found');
        }
        let template = fs.readFileSync(rootIndex, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', err);
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error');
    }
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`TkpayBD server listening on 0.0.0.0:${PORT} (${isProduction ? 'Production' : 'Development'})`);
  });

  // Handle termination signals gracefully
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

