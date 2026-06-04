import { JSX } from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetail: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart, onViewDetail }: ProductCardProps): JSX.Element {
  const isBestValue = product.tag === 'Best Value';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -8 }}
      className={`glass-card rounded-3xl p-5 flex flex-col justify-between overflow-hidden shadow-lg border relative transition-shadow duration-300 hover:shadow-xl ${
        isBestValue ? 'border-primary-container ring-1 ring-primary-container/30' : 'border-white/40'
      }`}
    >
      {/* Product Image Section with absolute click area */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container/60 mb-5 group cursor-pointer" onClick={() => onViewDetail(product)}>
        {isBestValue && (
          <div className="absolute top-3 right-3 bg-primary text-white text-[11px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider z-10 flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3 text-primary-container animate-pulse" />
            {product.tag}
          </div>
        )}
        
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Hover overlay detail invitation */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/90 text-primary text-xs font-bold px-4 py-2 rounded-full shadow-md backdrop-blur-sm">
            Ver receta e ingredientes
          </span>
        </div>
      </div>

      {/* Info details */}
      <div className="flex-grow flex flex-col">
        <h3 
          className="font-sans font-bold text-lg text-on-surface hover:text-primary transition-colors cursor-pointer mb-1 tracking-tight"
          onClick={() => onViewDetail(product)}
        >
          {product.name}
        </h3>
        
        <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 flex-grow min-h-[40px]">
          {product.description}
        </p>

        <div className="flex items-center justify-between mb-4">
          <span className="text-xs uppercase tracking-wider font-bold text-secondary bg-secondary/15 px-2.5 py-1 rounded-md">
            {product.category}
          </span>
          <span className="text-xl font-black text-primary">
            ${product.price.toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      {/* Footer Add button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart(product);
        }}
        className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
          isBestValue 
            ? 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20' 
            : 'bg-secondary text-white hover:bg-primary'
        }`}
      >
        <ShoppingCart className="w-4 h-4" />
        Agregar al Carrito
      </motion.button>
    </motion.div>
  );
}
