import { useState, useEffect } from "react";
import { Plus, Trash2, Key, Image as ImageIcon, Link as LinkIcon, ShoppingBag, Video, Save, X, LogOut, Copy, Check, Database, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { Product } from "../types";
import defaultProducts from "../../products.json";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [dbMode, setDbMode] = useState<"supabase" | "local" | "loading">("loading");
  const [supabaseUrl, setSupabaseUrl] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [error, setError] = useState("");

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    shopeeUrl: "",
    tiktokUrl: "",
    isFeatured: false,
    primaryLink: "shopee" as "shopee" | "tiktok",
  });

  useEffect(() => {
    // Check DB integration mode
    fetch("/api/status")
      .then((res) => res.json())
      .then((status) => {
        setDbMode(status.mode);
        setSupabaseUrl(status.supabaseUrl);
      })
      .catch((err) => {
        console.warn("Could not query DB status:", err);
        setDbMode("local");
      });

    const savedPass = localStorage.getItem("admin_pass");
    if (savedPass) {
      setPassword(savedPass);
      checkAuth(savedPass);
    }
  }, []);

  const checkAuth = async (pass: string) => {
    if (!pass) return;
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pass }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("admin_pass", pass);
        // Load products
        const prodRes = await fetch("/api/products");
        if (prodRes.ok) {
          const data = await prodRes.json();
          setProducts(data);
        }
      } else {
        setIsAuthenticated(false);
        if (localStorage.getItem("admin_pass")) {
          localStorage.removeItem("admin_pass");
        }
        setLoginError("Senha incorreta, tente novamente.");
      }
    } catch (e) {
      setLoginError("Erro ao conectar com o servidor.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("admin_pass");
    setPassword("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    checkAuth(password);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const productWithId = {
      ...newProduct,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, product: productWithId }),
      });

      if (res.ok) {
        const added = await res.json();
        setProducts([added, ...products]);
        setShowAddForm(false);
        setNewProduct({
          name: "",
          description: "",
          price: "",
          imageUrl: "",
          shopeeUrl: "",
          tiktokUrl: "",
          isFeatured: false,
          primaryLink: "shopee",
        });
      } else {
        const errData = await res.json();
        setError(errData.error || "Algo deu errado");
      }
    } catch (err) {
      setError("Erro ao salvar produto no servidor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        const errData = await res.json();
        alert(errData.error || "Erro ao deletar produto");
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor para deletar produto");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-beige flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-brand-cream p-10 rounded-[2.5rem] shadow-xl border border-brand-brown-light/10 max-w-sm w-full"
        >
          <div className="bg-brand-beige w-20 h-20 rounded-3xl flex items-center justify-center text-brand-brown mb-8 mx-auto">
            <Key size={40} />
          </div>
          <h1 className="text-2xl font-serif font-bold text-center mb-1 text-brand-brown-dark">Painel Privado</h1>
          <p className="text-[10px] text-center text-brand-brown/40 uppercase tracking-widest font-bold mb-8">Dica: use a senha "admin"</p>
          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold text-center border border-red-100">
                {loginError}
              </div>
            )}
            <input
              type="password"
              placeholder="Sua senha secreta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-brand-brown-light/20 bg-brand-beige/50 focus:bg-white focus:ring-2 focus:ring-brand-brown-light outline-none transition-all placeholder:text-brand-brown/30"
              required
            />
            <button
              type="submit"
              className="w-full bg-brand-brown hover:bg-brand-brown-dark text-brand-cream font-bold py-4 rounded-2xl transition-all shadow-md"
            >
              Acessar Vitrine
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige pb-20 p-4 sm:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-12">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-serif font-bold text-brand-brown-dark">Gestão da Vitrine</h1>
            <p className="text-sm text-brand-brown/60">Organize seus links de produtos favoritos</p>
            
            {/* Status Indicator */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
              {dbMode === "supabase" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Nuvem Supabase Ativa (Mudanças em Tempo Real)
                </span>
              ) : dbMode === "loading" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-100 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-pulse"></span>
                  Verificando conexão...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Modo Local (Configure o Supabase nos Secrets para salvar na nuvem)
                </span>
              )}
            </div>

            <button 
              onClick={handleLogout}
              className="text-[10px] text-brand-brown/40 hover:text-brand-brown underline uppercase tracking-widest font-bold mt-3 flex items-center gap-1 mx-auto sm:mx-0"
            >
              <LogOut size={10} />
              Sair do Painel
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              to="/"
              className="bg-brand-cream border-2 border-brand-brown-light/20 hover:border-brand-brown-light text-brand-brown px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
            >
              <ArrowLeft size={20} />
              Voltar para página inicial
            </Link>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-brand-brown hover:bg-brand-brown-dark text-brand-cream px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
            >
              <Plus size={20} />
              Novo Produto
            </button>
          </div>
        </header>

        <div className="grid gap-6">
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-brand-cream p-5 rounded-3xl border border-brand-brown-light/10 shadow-sm flex items-center gap-5 group"
              >
                <img
                  src={product.imageUrl}
                  className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-brand-brown-light/10"
                  alt={product.name}
                  referrerPolicy="no-referrer"
                />
                <div className="grow min-w-0">
                  <h3 className="font-bold text-lg text-brand-brown-dark truncate">{product.name}</h3>
                  <p className="text-xs text-brand-brown/50 font-mono truncate bg-brand-beige px-2 py-1 rounded inline-block mt-1">
                    {product.shopeeUrl}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-3 text-brand-brown/30 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                >
                  <Trash2 size={22} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Product Modal */}
        <AnimatePresence>
          {showAddForm && (
            <div className="fixed inset-0 bg-brand-brown-dark/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-brand-cream w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-brown-light/20"
              >
                <div className="p-8 border-b border-brand-brown-light/10 flex justify-between items-center bg-brand-beige/30">
                  <h2 className="text-2xl font-serif font-bold text-brand-brown-dark">Novo Link</h2>
                  <button onClick={() => setShowAddForm(false)} className="text-brand-brown/40 hover:text-brand-brown-dark p-2 rounded-full hover:bg-brand-beige transition-all">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleAddProduct} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto">
                  {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100">{error}</div>}

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em] ml-1">Título do Produto</label>
                    <div className="relative">
                      <ShoppingBag className="absolute left-5 top-4 text-brand-brown/30" size={20} />
                      <input
                        required
                        placeholder="Ex: Vestido de Seda Minimal"
                        className="w-full pl-14 pr-5 py-4 rounded-2xl border border-brand-brown-light/20 bg-brand-beige/30 focus:bg-white focus:ring-2 focus:ring-brand-brown-light outline-none transition-all"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em] ml-1">Sobre o Produto</label>
                    <textarea
                      placeholder="Aquela peça que não pode faltar..."
                      className="w-full px-5 py-4 rounded-2xl border border-brand-brown-light/20 bg-brand-beige/30 focus:bg-white focus:ring-2 focus:ring-brand-brown-light outline-none transition-all resize-none h-28"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em] ml-1">Valor</label>
                      <input
                        required
                        placeholder="R$ 99,90"
                        className="w-full px-5 py-4 rounded-2xl border border-brand-brown-light/20 bg-brand-beige/30 focus:bg-white focus:ring-2 focus:ring-brand-brown-light outline-none transition-all"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em] ml-1">URL da Imagem</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-5 top-4 text-brand-brown/30" size={20} />
                        <input
                          required
                          placeholder="Link da imagem"
                          className="w-full pl-14 pr-5 py-4 rounded-2xl border border-brand-brown-light/20 bg-brand-beige/30 focus:bg-white focus:ring-2 focus:ring-brand-brown-light outline-none transition-all"
                          value={newProduct.imageUrl}
                          onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                        />
                      </div>
                      {newProduct.imageUrl && (
                        <div className="mt-2 rounded-xl border border-brand-brown-light/10 overflow-hidden h-20 w-20">
                          <img src={newProduct.imageUrl} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em] ml-1">Link Shopee Afiliado</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-5 top-4 text-brand-brown/30" size={20} />
                      <input
                        required
                        placeholder="https://shope.ee/..."
                        className="w-full pl-14 pr-5 py-4 rounded-2xl border border-brand-brown-light/20 bg-brand-beige/30 focus:bg-white focus:ring-2 focus:ring-brand-brown-light outline-none transition-all"
                        value={newProduct.shopeeUrl}
                        onChange={(e) => setNewProduct({ ...newProduct, shopeeUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em] ml-1">Link TikTok (Opcional)</label>
                    <div className="relative">
                      <Video className="absolute left-5 top-4 text-brand-brown/30" size={20} />
                      <input
                        placeholder="Link do vídeo review"
                        className="w-full pl-14 pr-5 py-4 rounded-2xl border border-brand-brown-light/20 bg-brand-beige/30 focus:bg-white focus:ring-2 focus:ring-brand-brown-light outline-none transition-all"
                        value={newProduct.tiktokUrl}
                        onChange={(e) => setNewProduct({ ...newProduct, tiktokUrl: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5 py-2">
                    <div className="flex items-center gap-3 bg-brand-beige/30 p-4 rounded-2xl border border-brand-brown-light/10">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        className="w-5 h-5 accent-brand-brown cursor-pointer"
                        checked={newProduct.isFeatured}
                        onChange={(e) => setNewProduct({ ...newProduct, isFeatured: e.target.checked })}
                      />
                      <label htmlFor="isFeatured" className="text-sm font-bold text-brand-brown cursor-pointer">Destaque ⭐</label>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em] ml-1">Botão Principal</label>
                      <select
                        className="w-full px-4 py-3.5 rounded-2xl border border-brand-brown-light/20 bg-brand-beige/30 focus:bg-white focus:ring-2 focus:ring-brand-brown-light outline-none transition-all text-sm font-bold text-brand-brown"
                        value={newProduct.primaryLink}
                        onChange={(e) => setNewProduct({ ...newProduct, primaryLink: e.target.value as "shopee" | "tiktok" })}
                      >
                        <option value="shopee">Shopee</option>
                        <option value="tiktok">TikTok</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-brown hover:bg-brand-brown-dark text-brand-cream font-bold py-5 rounded-[1.5rem] transition-all shadow-xl flex items-center justify-center gap-2 mt-6 active:scale-95"
                  >
                    <Save size={24} />
                    Salvar na Vitrine
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Export Database Modal */}
        <AnimatePresence>
          {showExportModal && (
            <div className="fixed inset-0 bg-brand-brown-dark/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-brand-cream w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl border border-brand-brown-light/20"
              >
                <div className="p-8 border-b border-brand-brown-light/10 flex justify-between items-center bg-brand-beige/30">
                  <h2 className="text-2xl font-serif font-bold text-brand-brown-dark flex items-center gap-2">
                    <Database size={24} />
                    {dbMode === "supabase" ? "Conexão Supabase Ativa" : "Sincronizar com o Site"}
                  </h2>
                  <button onClick={() => { setShowExportModal(false); setCopied(false); }} className="text-brand-brown/40 hover:text-brand-brown-dark p-2 rounded-full hover:bg-brand-beige transition-all">
                    <X size={24} />
                  </button>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                  {dbMode === "supabase" ? (
                    <div className="space-y-4">
                      <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl text-sm space-y-2">
                        <p className="font-bold">🟢 Banco de Dados Conectado!</p>
                        <p className="text-xs text-green-700 leading-relaxed">
                          Tudo pronto! Todas as atualizações, novos produtos e exclusões que você fizer aqui no painel serão gravadas permanentemente no seu banco de dados Supabase e estarão visíveis instantaneamente para todos os visitantes do site.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em]">Estrutura SQL da Tabela (Supabase)</label>
                        <p className="text-xs text-brand-brown/70 leading-relaxed">
                          Se você acabou de configurar o Supabase, vá para o painel do Supabase, clique em <strong>SQL Editor</strong>, clique em <strong>New Query</strong>, cole o código abaixo e clique em <strong>Run</strong>:
                        </p>
                        <div className="relative">
                          <pre className="bg-brand-beige/30 border border-brand-brown-light/10 p-4 rounded-2xl text-xs font-mono text-brand-brown overflow-x-auto">
{`create table products (
  id text primary key,
  name text not null,
  description text,
  price text,
  "imageUrl" text,
  "shopeeUrl" text,
  "tiktokUrl" text,
  "isFeatured" boolean default false,
  "primaryLink" text default 'shopee',
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);`}
                          </pre>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(`create table products (
  id text primary key,
  name text not null,
  description text,
  price text,
  "imageUrl" text,
  "shopeeUrl" text,
  "tiktokUrl" text,
  "isFeatured" boolean default false,
  "primaryLink" text default 'shopee',
  "createdAt" timestamp with time zone default timezone('utc'::text, now()) not null
);`);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 3000);
                            }}
                            className="absolute right-3 bottom-3 bg-brand-brown hover:bg-brand-brown-dark text-brand-cream px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow active:scale-95"
                          >
                            {copied ? "Copiado!" : "Copiar SQL"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-brand-brown/80 leading-relaxed">
                        Como você solicitou a integração com o Supabase, nós preparamos tudo! Agora falta apenas você inserir as credenciais do seu projeto Supabase para ativar a gravação na nuvem automática.
                      </p>

                      <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2 text-xs">
                        <p className="font-bold text-amber-800">🛠️ Como configurar o Supabase:</p>
                        <ol className="list-decimal list-inside text-amber-700 space-y-1.5 ml-1">
                          <li>Crie um projeto no <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-bold">Supabase</a></li>
                          <li>Vá nas configurações do projeto (Project Settings) &gt; API</li>
                          <li>Abra o menu <strong>Settings</strong> (Segredos/Secrets) aqui no canto esquerdo da tela do assistente de código</li>
                          <li>Adicione as chaves:
                            <div className="mt-1 font-mono text-[11px] bg-white/50 p-2 rounded border border-amber-100">
                              <div><strong>SUPABASE_URL</strong> = (sua Project URL)</div>
                              <div><strong>SUPABASE_ANON_KEY</strong> = (sua public anon key)</div>
                            </div>
                          </li>
                        </ol>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-brand-brown/40 uppercase tracking-[0.2em]">Sincronização Manual (Código de Atualização)</span>
                          {copied && (
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                              <Check size={14} /> Copiado!
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-brand-brown/70 leading-relaxed">
                          Enquanto você não configura as chaves acima, você ainda pode copiar este código JSON atualizado de seus produtos e enviá-lo para mim no chat para que eu salve permanentemente:
                        </p>
                        <div className="relative">
                          <textarea
                            readOnly
                            value={JSON.stringify(products, null, 2)}
                            className="w-full h-32 p-4 font-mono text-xs rounded-2xl border border-brand-brown-light/20 bg-brand-beige/20 text-brand-brown-dark focus:outline-none resize-none"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(JSON.stringify(products, null, 2));
                              setCopied(true);
                              setTimeout(() => setCopied(false), 3000);
                            }}
                            className="absolute right-3 bottom-3 bg-brand-brown hover:bg-brand-brown-dark text-brand-cream px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                          >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                            {copied ? "Copiado!" : "Copiar Código JSON"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
