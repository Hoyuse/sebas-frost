import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Snowflake, Sparkles } from 'lucide-react';

interface CustomMixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmMix: (selectedFlavors: string[]) => void;
}

const SINGLE_FLAVORS = [
  'Limonada de Coco',
  'Frutos Rojos',
  'Maracuyá Neón',
  'Mora Azul Extrema',
  'Manzana Verde Ácida',
  'Cereza Cítrica',
  'Mango Biche con Sal y Limón'
];

export default function CustomMixModal({ isOpen, onClose, onConfirmMix }: CustomMixModalProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const handleToggle = (flavor: string) => {
    if (selected.includes(flavor)) {
      setSelected(selected.filter(item => item !== flavor));
    } else {
      if (selected.length < 3) {
        setSelected([...selected, flavor]);
      }
    }
  };

  const handleConfirm = () => {
    if (selected.length !== 3) return;
    onConfirmMix(selected);
    setSelected([]);
    onClose();
  };

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
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-primary/25 z-10"
          >
            {/* Header */}
            <div className="p-6 border-b border-surface-container bg-primary text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Snowflake className="w-6 h-6 text-primary-container animate-spin" style={{ animationDuration: '10s' }} />
                <div>
                  <h3 className="font-bold text-xl leading-tight">Tu Mix Sebas</h3>
                  <p className="text-xs text-primary-container/80">Diseña tus 3 capas de sabor artesanal</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-primary/10 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Los granizados tri-sabor se sirven en capas ordenadas de abajo hacia arriba. Selecciona exactamente <strong>3 sabores</strong> de la lista para crear tu combinación perfecta:
                </p>
              </div>

              {/* Selection list */}
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {SINGLE_FLAVORS.map((flavor, index) => {
                  const isChecked = selected.includes(flavor);
                  const canSelect = selected.length < 3 || isChecked;
                  
                  return (
                    <button
                      key={index}
                      disabled={!canSelect}
                      onClick={() => handleToggle(flavor)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                        isChecked 
                          ? 'bg-primary/5 border-primary text-primary font-semibold' 
                          : 'border-zinc-200 hover:border-primary/40 hover:bg-zinc-50 text-on-surface'
                      } ${!canSelect ? 'opacity-40 cursor-not-allowed' : ''}`}
                    >
                      <span className="text-sm">{flavor}</span>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isChecked 
                          ? 'bg-primary border-primary text-white' 
                          : 'border-zinc-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Layer visualizer */}
              <div className="pt-2">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Orden del vaso (Tu mezcla):</p>
                <div className="w-full flex flex-col items-center justify-center bg-zinc-100/70 py-4 px-6 rounded-2xl border border-zinc-200/50">
                  <div className="w-[110px] h-[120px] border-2 border-zinc-300 rounded-b-2xl rounded-t-sm flex flex-col justify-end overflow-hidden shadow-inner relative bg-white">
                    {selected.length === 0 ? (
                      <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
                        <span className="text-[10px] text-zinc-400 font-medium">Elige sabores para llenar tu vaso</span>
                      </div>
                    ) : (
                      selected.map((flavor, idx) => {
                        // Dynamic layered colors
                        let colorClass = 'bg-primary/40';
                        if (flavor.includes('Rojos') || flavor.includes('Cereza')) colorClass = 'bg-rose-500/80';
                        else if (flavor.includes('Mora')) colorClass = 'bg-blue-600/80';
                        else if (flavor.includes('Maracuyá') || flavor.includes('Mango')) colorClass = 'bg-amber-400/80';
                        else if (flavor.includes('Verde')) colorClass = 'bg-emerald-400/80';
                        else if (flavor.includes('Coco')) colorClass = 'bg-slate-100/90 border-t border-zinc-300';

                        return (
                          <div 
                            key={idx} 
                            className={`h-[40px] w-full flex items-center justify-center text-[9px] font-bold text-zinc-800 transition-all ${colorClass}`}
                          >
                            <span className="px-1 truncate">{flavor}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="p-6 bg-zinc-50 border-t border-surface-container flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 text-sm font-semibold rounded-xl text-on-surface-variant hover:bg-zinc-200/70 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                disabled={selected.length !== 3}
                onClick={handleConfirm}
                className={`flex-[1.5] py-3 text-sm font-bold rounded-xl text-white flex items-center justify-center gap-2 transition-transform duration-200 cursor-pointer ${
                  selected.length === 3 
                    ? 'bg-primary hover:opacity-95 active:scale-95' 
                    : 'bg-zinc-300 cursor-not-allowed'
                }`}
              >
                ¡Mezclar en mi pedido!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
