import express from "express";
import path from "path";
import fs from "fs/promises";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const adminPassword = process.env.ADMIN_PASSWORD || "admin";
const PRODUCTS_FILE = path.join(process.cwd(), "products.json");

let supabaseClient: any = null;

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key || url.trim() === "" || key.trim() === "") {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

async function initProductsFile() {
  try {
    await fs.access(PRODUCTS_FILE);
  } catch {
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

async function loadProducts() {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("createdAt", { ascending: false });
      if (!error && data) {
        return data;
      }
      console.error("Supabase load error, falling back to local file:", error);
    } catch (err) {
      console.error("Supabase exception, falling back to local file:", err);
    }
  }

  try {
    await initProductsFile();
    const content = await fs.readFile(PRODUCTS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error("Error reading products.json:", err);
    return [];
  }
}

async function saveProduct(product: any) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          imageUrl: product.imageUrl,
          shopeeUrl: product.shopeeUrl,
          tiktokUrl: product.tiktokUrl || "",
          isFeatured: product.isFeatured || false,
          primaryLink: product.primaryLink || "shopee",
          createdAt: product.createdAt || new Date().toISOString()
        }])
        .select();
      if (error) {
        console.error("Supabase insert error details:", error);
        throw error;
      }
      if (data && data[0]) return data[0];
    } catch (err) {
      console.error("Supabase insert exception, falling back to local file:", err);
    }
  }

  await initProductsFile();
  const content = await fs.readFile(PRODUCTS_FILE, "utf-8");
  const products = JSON.parse(content);
  products.push(product);
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), "utf-8");
  return product;
}

async function deleteProduct(id: string) {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      if (error) {
        console.error("Supabase delete error details:", error);
        throw error;
      }
      return true;
    } catch (err) {
      console.error("Supabase delete exception, falling back to local file:", err);
    }
  }

  await initProductsFile();
  const content = await fs.readFile(PRODUCTS_FILE, "utf-8");
  const products = JSON.parse(content);
  const filtered = products.filter((p: any) => p.id !== id);
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}

// API Routes
app.post("/api/auth/verify", (req, res) => {
  const { password } = req.body;
  if (password === adminPassword) {
    return res.json({ success: true });
  }
  return res.status(401).json({ error: "Senha incorreta" });
});

app.get("/api/status", (req, res) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  const hasSupabase = !!(url && key && url.trim() !== "" && key.trim() !== "");
  res.json({
    mode: hasSupabase ? "supabase" : "local",
    supabaseUrl: url ? url.substring(0, 20) + "..." : null,
  });
});

app.get("/api/products", async (req, res) => {
  try {
    const prods = await loadProducts();
    res.json(prods);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar produtos" });
  }
});

app.post("/api/products", async (req, res) => {
  const { password, product } = req.body;
  if (password !== adminPassword) {
    return res.status(401).json({ error: "Acesso não autorizado" });
  }
  if (!product || !product.name) {
    return res.status(400).json({ error: "Dados do produto inválidos" });
  }
  try {
    const saved = await saveProduct(product);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao salvar produto" });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (password !== adminPassword) {
    return res.status(401).json({ error: "Acesso não autorizado" });
  }
  try {
    await deleteProduct(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Erro ao deletar produto" });
  }
});

// Vite Middleware for integration
async function startServer() {
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
