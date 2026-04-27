import { useEffect, useState } from "react";
import { ShoppingBag, Video, ExternalLink, Package } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product } from "../types";

export default function Showcase() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-orange-500"
        >
          <Package size={40} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-beige pb-12 font-sans">
      {/* Header */}
      <header className="bg-brand-cream/80 backdrop-blur-md border-b border-brand-brown-light/20 sticky top-0 z-10 py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-serif font-bold text-brand-brown-dark tracking-tight">
            Minha Vitrine Shop
          </h1>
          <div className="w-12 h-0.5 bg-brand-brown-light mx-auto mt-3 mb-2 rounded-full opacity-50"></div>
          <p className="text-sm text-brand-brown/80 font-medium italic">
            Curadoria exclusiva dos meus achadinhos favoritos
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 mt-10">
        <div className="grid gap-8">
          <AnimatePresence>
            {products.length === 0 ? (
              <div className="text-center py-24 text-brand-brown/40">
                <Package className="mx-auto mb-4 opacity-20" size={64} />
                <p className="font-medium">Nenhum produto selecionado no momento.</p>
              </div>
            ) : (
              products.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className={`bg-brand-cream rounded-[2rem] shadow-[0_8px_30px_rgb(139,94,60,0.06)] border overflow-hidden flex flex-col h-full group ${
                    product.isFeatured ? "border-brand-brown-light/40 ring-2 ring-brand-brown-light/10 scale-[1.02]" : "border-brand-brown-light/10"
                  }`}
                >
                  {/* Product Image */}
                  <div className="w-full aspect-[4/5] relative overflow-hidden">
                    {product.isFeatured && (
                      <div className="absolute top-4 left-4 z-10 bg-brand-brown text-brand-cream text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                        Destaque
                      </div>
                    )}
                    <img
                      src={product.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-brand-cream/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-brand-brown shadow-sm border border-brand-brown-light/20">
                      {product.price}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-8 flex flex-col justify-between grow">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-brand-brown-dark leading-tight mb-3">
                        {product.name}
                      </h2>
                      <p className="text-sm text-brand-brown/70 leading-relaxed max-w-md mx-auto">
                        {product.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      {/* Only show Shopee if it exists, or if chosen as primary */}
                      {(!product.primaryLink || product.primaryLink === 'shopee') ? (
                        <>
                          <a
                            href={product.shopeeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-brand-brown hover:bg-brand-brown-dark text-brand-cream font-bold py-4 rounded-2xl transition-all shadow-md active:scale-[0.98]"
                          >
                            <ShoppingBag size={20} />
                            Comprar na Shopee
                          </a>
                          {product.tiktokUrl && (
                            <a
                              href={product.tiktokUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 bg-transparent border-2 border-brand-brown-light/30 hover:border-brand-brown-light text-brand-brown font-bold py-4 rounded-2xl transition-all"
                            >
                              <Video size={20} />
                              Ver no TikTok
                            </a>
                          )}
                        </>
                      ) : (
                        <>
                          <a
                            href={product.tiktokUrl || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-black text-white hover:bg-zinc-900 font-bold py-4 rounded-2xl transition-all shadow-md active:scale-[0.98]"
                          >
                            <Video size={20} />
                            Comprar no TikTok
                          </a>
                          <a
                            href={product.shopeeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 bg-transparent border-2 border-brand-brown-light/30 hover:border-brand-brown-light text-brand-brown font-bold py-4 rounded-2xl transition-all"
                          >
                            <ShoppingBag size={20} />
                            Ver na Shopee
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 text-center py-12 flex flex-col items-center gap-4">
        <p className="text-brand-brown/40 text-[10px] uppercase tracking-widest font-bold">
          &copy; {new Date().getFullYear()} • Curadoria por Kamila
        </p>
        <a 
          href="/admin" 
          className="text-[10px] text-brand-brown/20 hover:text-brand-brown/40 transition-colors uppercase tracking-widest font-medium"
        >
          Área Administrativa
        </a>
      </footer>
    </div>
  );
}
