import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs/promises";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const PORT = 3000;
const DATA_FILE = path.join(process.cwd(), "products.json");
const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "admin").trim();

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  shopeeUrl: string;
  tiktokUrl?: string;
  createdAt: string;
  isFeatured?: boolean;
  primaryLink?: 'shopee' | 'tiktok';
}

async function ensureDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([]));
  }
}

async function getProducts(): Promise<Product[]> {
  const data = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(data);
}

async function saveProducts(products: Product[]) {
  await fs.writeFile(DATA_FILE, JSON.stringify(products, null, 2));
}

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());

  await ensureDataFile();

  // Auth Route
  app.post("/api/auth/verify", (req, res) => {
    const { password } = req.body;
    const provided = (password || "").trim();
    console.log(`Verifying password. Provided: "${provided}", Expected: "${ADMIN_PASSWORD}"`);
    if (provided === ADMIN_PASSWORD) {
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Senha incorreta" });
    }
  });

  // API Routes
  app.get("/api/products", async (req, res) => {
    try {
      const products = await getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to load products" });
    }
  });

  app.post("/api/products", async (req, res) => {
    const { password, product } = req.body;
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const products = await getProducts();
      const newProduct = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      products.push(newProduct);
      await saveProducts(products);
      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ error: "Failed to save product" });
    }
  });

  app.delete("/api/products/:id", async (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const products = await getProducts();
      const filtered = products.filter((p) => p.id !== req.params.id);
      await saveProducts(filtered);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
