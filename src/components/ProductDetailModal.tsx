import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Check, Heart, ShieldAlert, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart }: ProductDetailModalProps) {
  if (!product) return null;

  const isBestValue = product.tag === 'Best Value';

  // Dynamic ingredient lists to enrich description
  const mockIngredients: Record<string, string[]> = {
    'limonada-coco': ['Crema de Coco Real', 'Zumo de Limón Tahití', 'Hielo Frappé Perlado', 'Ralladura fresca de Lima'],
    'frutos-rojos': ['Fresas Frescas Trituradas', 'Frambuesas de Cultivo Sostenible', 'Arándanos Silvestres', 'Menta fresca orginal'],
    'maracuya-neon': ['Pulpa de Maracuyá Selecta', 'Almíbar de Caña Natural', 'Hielo cristalizado', 'Semillas de Maracuyá decorativas'],
    'mora-azul': ['Concentrado de Arándano Azul', 'Moras Silvestres del Bosque', 'Extracto refrescante bajo cero', 'Toque dulce sutil'],
    'manzana-verde': ['Zumo Puro de Manzana Granny Smith', 'Toque de Limón para acidez', 'Cristales de agua purificada', 'Mentol natural'],
    'cereza-citrica': ['Pulpa Cremosa de Cerezas Rojas', 'Zumo de Limón exótico', 'Hielo escarchado artesanal', 'Cerezas decorativas enteros'],
    'mango-biche': ['Láminas de Mango Verde Biche', 'Sal Marina premium', 'Zumo de Limón exiliado', 'Toque de pimienta suave (opcional)'],
    'mix-sebas': ['3 Capas Combinadas a Elección', 'Hielo Cristalino Especial', 'Sirope de frutas hecho en casa', 'Decoración frutal del día'],
  };

  const ingredients = mockIngredients[product.id] || ['Pulpa de fruta natural', 'Hielo cristalino artesanal', 'Zumo cítrico de adición'];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 z-10 flex flex-col md:flex-row max-h-[90vh] md:max-h-none"
          >
            {/* Close button strictly on top-right of modal */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-20 p-2 bg-white/80 hover:bg-white text-zinc-800 rounded-full shadow-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Left/Top Image Section */}
            <div className="w-full md:w-1/2 bg-zinc-100 relative aspect-square md:aspect-auto md:min-h-[420px] shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {isBestValue && (
                <div className="absolute bottom-4 left-4 bg-primary text-white text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-primary-container animate-pulse" />
                  {product.tag}
                </div>
              )}
            </div>

            {/* Right/Bottom Info Section */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
              <div>
                <span className="text-xs uppercase tracking-wider font-extrabold text-primary bg-primary/10 px-2.5 py-1 rounded-md inline-block mb-3">
                  {product.category}
                </span>
                
                <h3 className="font-sans font-extrabold text-2xl text-on-surface leading-tight mb-2">
                  {product.name}
                </h3>

                <p className="text-2xl font-black text-primary mb-4">
                  ${product.price.toLocaleString('es-CO')}
                </p>

                <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Ingredients section */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <span>📋</span> Ingredientes Premium
                  </h4>
                  <ul className="grid grid-cols-2 gap-2">
                    {ingredients.map((ing, k) => (
                      <li key={k} className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="truncate">{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Attributes badges */}
                <div className="border-t border-zinc-100 pt-4 mb-6 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                    <Heart className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-[10px] font-bold text-emerald-800 leading-tight">100% natural</p>
                      <p className="text-[9px] text-emerald-700">Sin colorantes químicos</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-sky-50/60 p-2 rounded-xl border border-sky-100">
                    <ShieldAlert className="w-4 h-4 text-sky-600" />
                    <div>
                      <p className="text-[10px] font-bold text-sky-800 leading-tight">Frescura Polar</p>
                      <p className="text-[9px] text-sky-700">Textura de pura nieve</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add to order action */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-bold text-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/35 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Agregar al Pedido
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
