import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2, Wallet, Send, ArrowRight } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, customDetails: string | undefined, delta: number) => void;
  onRemoveItem: (id: string, customDetails: string | undefined) => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const NEQUI_NUMBER = "305 266 8082";
  const WHATSAPP_PHONE = "573052668082";

  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    let message = "🧊 *¡Hola Sebas Frost!* Me gustaría realizar el siguiente pedido por favor:\n\n";
    
    cartItems.forEach((item, index) => {
      const details = item.customDetails ? ` (${item.customDetails})` : "";
      message += `*${index + 1}. ${item.quantity}x* _${item.product.name}${details}_ 👉 *$${(item.product.price * item.quantity).toLocaleString('es-CO')}*\n`;
    });

    message += `\n💵 *TOTAL COMPRA:* $${total.toLocaleString('es-CO')}\n`;
    message += `🏦 *Medio de Pago:* Nequi de preferencia\n\n`;
    message += `⚡ ¡Espero su confirmación de preparación para disfrutar de la frescura extrema!`;

    const encoded = encodeURIComponent(message);
    const link = `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
    window.open(link, '_blank', 'referrerPolicy=no-referrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex justify-end">
          {/* Backdrop/Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.35, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 bg-primary text-white flex justify-between items-center shrink-0">
              <h2 className="font-sans font-bold text-lg flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary-container" />
                Tu Pedido
                {totalQuantity > 0 && (
                  <span className="bg-primary-container text-primary font-black text-xs px-2.5 py-1 rounded-full">
                    {totalQuantity}
                  </span>
                )}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/15 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 py-12 text-center">
                  <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4 border border-primary/10">
                    <ShoppingBag className="w-10 h-10 text-primary/60" />
                  </div>
                  <h3 className="text-on-surface font-extrabold text-base mb-1">Tu carrito está vacío</h3>
                  <p className="text-xs text-on-surface-variant max-w-[200px] leading-relaxed">
                    Navega por nuestras creaciones y añade granizados helados a tu gusto.
                  </p>
                </div>
              ) : (
                cartItems.map((item, idx) => {
                  const itemKey = `${item.product.id}-${item.customDetails || ''}`;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      key={itemKey}
                      className="flex gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/60 shadow-sm items-center hover:shadow-md transition-shadow"
                    >
                      {/* Avatar Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-white border">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Info & Quantity controls */}
                      <div className="flex-grow min-w-0">
                        <h4 className="font-sans font-bold text-sm text-on-surface truncate">
                          {item.product.name}
                        </h4>
                        
                        {item.customDetails && (
                          <p className="text-[10px] text-zinc-500 font-medium py-0.5 px-1.5 bg-zinc-200/50 rounded-md inline-block max-w-full truncate mb-1.5">
                            {item.customDetails}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.customDetails, -1)}
                            className="w-7 h-7 bg-white hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center rounded-lg text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-semibold w-6 text-center text-on-surface">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.customDetails, 1)}
                            className="w-7 h-7 bg-white hover:bg-zinc-100 border border-zinc-200 flex items-center justify-center rounded-lg text-zinc-700 hover:text-zinc-950 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Price & Delete */}
                      <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="text-sm font-bold text-primary">
                          ${(item.product.price * item.quantity).toLocaleString('es-CO')}
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.product.id, item.customDetails)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-full transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Sticky bottom content */}
            <div className="p-6 bg-zinc-50 border-t border-zinc-200/50 space-y-4 shrink-0">
              <div className="flex justify-between items-center">
                <span className="text-on-surface font-semibold text-sm">Costo del Pedido:</span>
                <span className="text-2xl font-black text-primary">
                  ${total.toLocaleString('es-CO')}
                </span>
              </div>

              {/* Nequi instruction details card */}
              <div className="p-3.5 bg-white rounded-2xl border border-primary/15 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-secondary">
                  <Wallet className="w-4 h-4 text-primary shrink-0" />
                  <span>Medio de pago único preferencial:</span>
                </div>
                <p className="text-xs text-on-surface-variant pl-6">
                  Nequi: <strong className="text-on-surface font-extrabold">{NEQUI_NUMBER}</strong>
                </p>
              </div>

              {/* Concluir en WhatsApp buttons */}
              <button
                disabled={cartItems.length === 0}
                onClick={handleCheckout}
                className={`w-full py-4 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  cartItems.length === 0
                    ? 'bg-zinc-300 shadow-none cursor-not-allowed text-zinc-500'
                    : 'bg-[#25D366] hover:opacity-95 hover:shadow-emerald-500/10 active:scale-[0.99]'
                }`}
              >
                <Send className="w-4 h-4" />
                Concluir compra en WhatsApp
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
