import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { 
  Target, 
  Eye, 
  ArrowLeft, 
  Snowflake, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  Bookmark
} from 'lucide-react';

interface MisionVisionPageProps {
  onBackToStore: () => void;
}

export default function MisionVisionPage({ onBackToStore }: MisionVisionPageProps) {
  const [qrWhats, setQrWhats] = useState<string | null>(null);
  const [qrMap, setQrMap] = useState<string | null>(null);
  const [qrGenerating, setQrGenerating] = useState(false);

  const WHATS_LINK = 'https://wa.me/573052668082';
  const MAP_LINK = 'https://www.google.com/maps/search/5853+Cl.+19,+Cartagena,+Bol%C3%ADvar/@10.4150785,-75.5622286,13z/data=!3m1!4b1?entry=ttu&g_ep=EgoyMDI2MDYwMS4wIKXMDSoASAFQAw%3D%3D';

  useEffect(() => {
    let mounted = true;
    const gen = async () => {
      setQrGenerating(true);
      try {
        const QR = await import('qrcode');
        const w = await QR.toDataURL(WHATS_LINK, { width: 600, margin: 1 });
        const m = await QR.toDataURL(MAP_LINK, { width: 600, margin: 1 });
        if (mounted) {
          setQrWhats(w);
          setQrMap(m);
        }
      } catch (e) {
        console.error('QR generation error', e);
      } finally {
        if (mounted) setQrGenerating(false);
      }
    };
    gen();
    return () => { mounted = false; };
  }, []);
  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-gradient-to-b from-sky-50 via-zinc-50 to-white text-on-surface py-12 px-6 md:px-16 relative overflow-hidden select-none">
      
      {/* Background visual accents */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square rounded-full bg-secondary/5 blur-[100px] pointer-events-none animate-pulse" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Controls */}
        <div className="mb-12">
          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-50 text-on-surface-variant border border-zinc-200 shadow-sm rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer hover:border-zinc-300 active:scale-95"
            id="mision-back-to-store"
          >
            <ArrowLeft className="w-4 h-4 text-primary" />
            <span>Volver al Menú</span>
          </button>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Nuestra Identidad</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-sans font-black tracking-tight text-secondary leading-tight">
            Misión y Visión
          </h1>
          <p className="text-sm md:text-base text-on-surface-variant mt-4 leading-relaxed font-medium">
            En Sebas Frost no solo congelamos el calor, cultivamos momentos de alegría y frescura auténtica. Te invitamos a conocer el propósito que nos impulsa día a día.
          </p>
        </div>

        {/* Dual Cards: Mision & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          
          {/* Mission Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_15px_40px_-15px_rgba(0,105,112,0.06)] border border-zinc-200/50 flex flex-col justify-between group hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none transition-all duration-500 group-hover:scale-110" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8 relative z-10 shadow-sm shadow-primary/10">
                <Target className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-black text-secondary mb-4 leading-tight">
                Nuestra Misión
              </h2>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed font-medium mb-6">
                Ofrecer la máxima frescura tropical y felicidad a nuestra comunidad a través de granizados y raspados artesanales incomparables, elaborados con pulpa frutal 100% real y orgánica. Nos comprometemos a mantener una pureza absoluta y un servicio excepcional que refresca el cuerpo de manera saludable y eleva el espíritu.
              </p>
            </div>

            <div className="border-t border-zinc-100 pt-6 mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Compromiso Saludable</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Fruta fresca seleccionada artesanalmente sin conservantes artificiales.
              </p>
            </div>
          </motion.div>

          {/* Vision Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_15px_40px_-15px_rgba(0,105,112,0.06)] border border-zinc-200/50 flex flex-col justify-between group hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full pointer-events-none transition-all duration-500 group-hover:scale-110" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-8 relative z-10 shadow-sm shadow-secondary/10">
                <Eye className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-sans font-black text-secondary mb-4 leading-tight">
                Nuestra Visión
              </h2>
              <p className="text-sm md:text-base text-on-surface-variant leading-relaxed font-medium mb-6">
                Consolidarnos para el año 2028 como la marca referente de frescura, sabor tropical y deleite premium en la región caribeña. Buscamos expandir nuestra presencia física y digital a través de la innovación interactiva de sabores, liderando el mercado con responsabilidad social y un modelo ecológico ejemplar.
              </p>
            </div>

            <div className="border-t border-zinc-100 pt-6 mt-4 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Expansión Sostenible</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Llevar frescura a cada rincón utilizando empaques ecológicos y tecnología ágil.
              </p>
            </div>
          </motion.div>

        </div>

        {/* Values Section */}
        <div className="bg-white rounded-[36px] p-8 md:p-12 shadow-[0_20px_50px_-20px_rgba(0,105,112,0.08)] border border-zinc-200/40">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-xl md:text-2xl font-sans font-extrabold text-secondary">
              Nuestros Valores Pilares
            </h3>
            <p className="text-xs md:text-sm text-on-surface-variant mt-2 leading-relaxed">
              La base sólida que rige cada sonrisa y cada vaso servido en Sebas Frost.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-secondary mb-1">Pasión Artesanal</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Amamos lo que hacemos. Preparamos cada combinación con amor para garantizar la felicidad extrema.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-secondary mb-1">Pureza e Higiene</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Filtros de triple purificación y manipulación impecable para cuidar tu salud por encima de todo.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-sm text-secondary mb-1">Innovación del Sabor</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Estudiamos constantemente nuevas fusiones y toppings divertidos para que seas el creador de tu receta de frío.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="mt-12 text-center">
          <button
            onClick={onBackToStore}
            className="px-8 py-4 bg-primary hover:bg-primary/95 text-white font-extrabold text-sm rounded-2xl tracking-wider uppercase transition-all shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
          >
            Explorar Nuestro Menú de Sabores
          </button>
        </div>

        {/* Persistent QR panel: WhatsApp + Map (always visible) */}
        <div className="fixed right-6 bottom-6 z-50 p-4 bg-white rounded-2xl border shadow-lg w-[260px]">
          <div className="text-xs font-bold mb-2">Contacto rápido</div>
          <div className="flex flex-col gap-3 items-center">
            <div className="text-xs text-zinc-500">WhatsApp</div>
            <div className="w-36 h-36 bg-white p-1 rounded-md flex items-center justify-center">
              {qrGenerating && !qrWhats ? (
                <div className="text-xs text-zinc-400">Generando...</div>
              ) : qrWhats ? (
                <img src={qrWhats} alt="WhatsApp QR" className="w-32 h-32 object-contain" />
              ) : (
                <div className="text-xs text-zinc-400">No disponible</div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (qrWhats) {
                    const a = document.createElement('a');
                    a.href = qrWhats;
                    a.download = 'sebas-whatsapp-qr.png';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  }
                }}
                className="px-2 py-1 bg-primary text-white rounded text-xs"
              >
                Descargar
              </button>
              <a href={WHATS_LINK} target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/50 border rounded text-xs">Abrir</a>
            </div>

            <div className="w-full border-t border-zinc-100 my-2" />

            <div className="text-xs text-zinc-500">Ubicación</div>
            <div className="w-36 h-36 bg-white p-1 rounded-md flex items-center justify-center">
              {qrGenerating && !qrMap ? (
                <div className="text-xs text-zinc-400">Generando...</div>
              ) : qrMap ? (
                <img src={qrMap} alt="Map QR" className="w-32 h-32 object-contain" />
              ) : (
                <div className="text-xs text-zinc-400">No disponible</div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (qrMap) {
                    const a = document.createElement('a');
                    a.href = qrMap;
                    a.download = 'sebas-map-qr.png';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  }
                }}
                className="px-2 py-1 bg-primary text-white rounded text-xs"
              >
                Descargar
              </button>
              <a href={MAP_LINK} target="_blank" rel="noreferrer" className="px-2 py-1 bg-white/50 border rounded text-xs">Abrir</a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
