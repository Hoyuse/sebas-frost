import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  FlameKindling, 
  Compass, 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Apple, 
  Smartphone,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';

interface WelcomeVideoPageProps {
  onBackToStore: () => void;
}

interface SceneFrame {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  iconColor: string;
  gradient: string;
  graphicUrl: string;
  features: string[];
}

const SCENES: SceneFrame[] = [
  {
    id: 0,
    badge: "FRESCO Y NATURAL",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    title: "Sabor Glacial que Congela el Calor",
    subtitle: "Elaboración manual auténtica",
    description: "Bienvenido a Sebas Frost, donde cada raspado es un homenaje a la frescura caribeña pura. Usamos hielo cristalino doblemente purificado para una textura esponjosa y ligera como la nieve.",
    icon: FlameKindling,
    iconColor: "text-cyan-400",
    gradient: "from-sky-950 via-cyan-900/40 to-zinc-950",
    graphicUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=600",
    features: ["Raspado fino premium", "Hielo de filtros de pureza triple", "Higiene garantizada en cada copa"]
  },
  {
    id: 1,
    badge: "100% FRUTA REAL",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    title: "Pulpas de Origen 100% Orgánico",
    subtitle: "Directo de campos cosechados en el día",
    description: "Cero colorantes artificiales. Cero conservantes perjudiciales. Extraemos las pulpas de frutas de la región en su punto máximo de dulzura natural para cuidar de tu bienestar.",
    icon: Apple,
    iconColor: "text-emerald-400",
    gradient: "from-zinc-950 via-emerald-950/40 to-zinc-950",
    graphicUrl: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=600",
    features: ["Endulzado levemente", "Mango, maracuyá y limón real", "Apoyo local a recolectores"]
  },
  {
    id: 2,
    badge: "DISEÑA TU MIX",
    badgeColor: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/20",
    title: "Fusión de Toppings y Sabores a Tu Gusto",
    subtitle: "Combina hasta tres sabores en un mix",
    description: "¡Sé el alquimista del frío! Diseña mezclas personalizadas combinando sabores ácidos y dulces, completándolos con un chorro de leche condensada premium y gomitas.",
    icon: Compass,
    iconColor: "text-fuchsia-400",
    gradient: "from-purple-950 via-fuchsia-950/30 to-zinc-950",
    graphicUrl: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=600",
    features: ["Mezcla ilimitada de 3 sabores", "Toppings ácidos o cremosos", "Presentación interactiva"]
  },
  {
    id: 3,
    badge: "PEDIDO AL INSTANTE",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    title: "Envío Veloz a WhatsApp y Pago Nequi",
    subtitle: "Soporte exclusivo en línea",
    description: "Olvídate de procesos enredados. Arma tu orden favorita de Sebas Frost en nuestra web, envíanos el pedido por chat mediante el número 305 266 8082 y paga al instante con tu cuenta Nequi.",
    icon: Smartphone,
    iconColor: "text-amber-400",
    gradient: "from-amber-950 via-zinc-900 to-zinc-950",
    graphicUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=600",
    features: ["Atención inmediata y personalizada", "Seguridad Nequi de un toque", "Despacho inmediato con nevera térmica"]
  }
];

export default function WelcomeVideoPage({ onBackToStore }: WelcomeVideoPageProps) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrGenerating, setQrGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<any>(null);

  const PLAY_SPEED = 3000; // Locked strictly to slow (3s) as requested

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalStep = 50; // Progress update update rate
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += intervalStep;
      const currentPct = (elapsed / PLAY_SPEED) * 100;
      setProgress(Math.min(currentPct, 100));

      if (elapsed >= PLAY_SPEED) {
        elapsed = 0;
        setProgress(0);
        setCurrentFrame((prev) => (prev + 1) % SCENES.length);
      }
    }, intervalStep);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentFrame]);

  // Handle manual steps
  const nextFrame = () => {
    setProgress(0);
    setCurrentFrame((prev) => (prev + 1) % SCENES.length);
  };

  const prevFrame = () => {
    setProgress(0);
    setCurrentFrame((prev) => (prev - 1 + SCENES.length) % SCENES.length);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const currentScene = SCENES[currentFrame];
  const IconComponent = currentScene.icon;
  const QR_TARGET = 'https://sebas-frost.vercel.app/';

  // Auto-generate QR once on mount so it's always visible
  useEffect(() => {
    let mounted = true;
    const gen = async () => {
      if (qrDataUrl) return;
      setQrGenerating(true);
      try {
        const QR = await import('qrcode');
        const dataUrl = await QR.toDataURL(QR_TARGET, { width: 800, margin: 1 });
        if (mounted) setQrDataUrl(dataUrl);
      } catch (e) {
        console.error('QR generation error', e);
      } finally {
        if (mounted) setQrGenerating(false);
      }
    };
    gen();
    return () => { mounted = false; };
  }, []);

  // Global aggregate timing calculations
  const totalDurationSec = (SCENES.length * PLAY_SPEED) / 1000; // 12 seconds total
  const elapsedMs = (currentFrame * PLAY_SPEED) + (progress / 100) * PLAY_SPEED;
  const elapsedSec = Math.min(Math.floor(elapsedMs / 1000), totalDurationSec);

  const formatTimerValue = (secondsValue: number) => {
    const mins = Math.floor(secondsValue / 60);
    const secs = Math.floor(secondsValue % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const globalProgressPercent = ((currentFrame + progress / 100) / SCENES.length) * 100;

  return (
    <div className="w-full min-h-[calc(100vh-80px)] bg-zinc-950 text-white flex flex-col justify-between py-8 px-6 md:px-16 relative overflow-hidden select-none">
      
      {/* Background Ambience Colors */}
      <div className={`absolute inset-0 bg-gradient-to-tr ${currentScene.gradient} transition-all duration-1000 ease-in-out`} />
      <div className="absolute top-[-20%] left-[-10%] w-[50%] aspect-square rounded-full bg-cyan-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-10%] w-[50%] aspect-square rounded-full bg-primary/10 blur-[130px] pointer-events-none animate-pulse" />

      {/* Top Controls Bar */}
      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-white/10 pb-6 mb-8">
        <div>
          <button
            onClick={onBackToStore}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-full text-xs font-black tracking-wider uppercase transition-all cursor-pointer shadow-lg active:scale-95"
            id="video-back-to-store"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Menú</span>
          </button>
        </div>

        {/* Locked speed info panel */}
        <div className="flex items-center gap-4.5">
          <div className="flex bg-white/5 px-4 py-2 rounded-2xl border border-white/10 items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black tracking-wider uppercase text-zinc-300">
              Modo Cinematográfico Activo
            </span>
          </div>

          <span className="text-[11px] font-mono text-zinc-400 bg-black/40 px-3 py-1 rounded-lg border border-white/5 tracking-wider">
            {formatTimerValue(elapsedSec)} / {formatTimerValue(totalDurationSec)}
          </span>
        </div>
      </div>

      {/* Main Reel Stage Component */}
      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-8 items-center flex-1 my-auto">
        
        {/* Left Side: Rapid Poster Frame Movie Mockup (gcols 7) */}
        <div className="lg:col-span-7 flex flex-col justify-center h-full relative">
          <div className="relative aspect-video sm:aspect-auto sm:min-h-[380px] md:min-h-[460px] rounded-[36px] overflow-hidden border border-white/15 bg-black/40 backdrop-blur-md shadow-2xl flex items-center justify-center group">
            
            {/* Slide Graphic Underlay */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentFrame}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 0.65, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                src={currentScene.graphicUrl}
                alt={currentScene.title}
                className="absolute inset-0 w-full h-full object-cover filter brightness-[0.7] contrast-[1.05]"
              />
            </AnimatePresence>

            {/* Glowing Gradient Light Cover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none" />

            {/* Float Element Overlay */}
            <div className="absolute inset-x-8 bottom-8 flex flex-col gap-4 text-left pointer-events-none">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentFrame}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-2"
                >
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${currentScene.badgeColor}`}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{currentScene.badge}</span>
                  </div>

                  <h2 className="text-2xl sm:text-4xl font-sans font-black tracking-tight text-white leading-tight">
                    {currentScene.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-300 font-medium">
                    {currentScene.subtitle}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Interactive Overlay Touch feedback logo in center */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={togglePlayback}
                className="w-16 h-16 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
                id="movie-overlay-play-button"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Informative Live Captions Frame (gcols 5) */}
        <div className="lg:col-span-5 h-full flex flex-col justify-between py-2 text-left">
          <div className="space-y-6">
            
            {/* Animated scene facts */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFrame}
                initial={{ opacity: 0, x: 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -25 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
                    <IconComponent className={`w-6 h-6 ${currentScene.iconColor}`} />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-primary font-black uppercase">FRESCO REEL ACTIVO</span>
                    <h3 className="font-sans font-black text-xl text-white leading-tight">{currentScene.subtitle}</h3>
                  </div>
                </div>

                <p className="text-zinc-350 text-sm leading-relaxed pt-2">
                  {currentScene.description}
                </p>

                {/* Bullets List */}
                <div className="border-t border-white/10 pt-4 mt-2 space-y-3">
                  {currentScene.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="mt-1 shrink-0 bg-primary/10 p-1 rounded-lg">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-xs text-zinc-400 font-medium leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Core Footer CTA & Timeline */}
          <div className="pt-8 space-y-4">
            
            {/* Playback Controls & Frame Navigation Bar */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlayback}
                  className="p-2 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
                  id="ctrl-toggle-play"
                  title={isPlaying ? "Pausar video" : "Reproducir video"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>

                <button
                  onClick={() => {
                    setCurrentFrame(0);
                    setProgress(0);
                    setIsPlaying(true);
                  }}
                  className="p-2 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
                  title="Reiniciar reproducción"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Direct CTA */}
            <button
              onClick={onBackToStore}
              className="w-full py-4 bg-primary hover:bg-primary/95 text-white font-extrabold text-sm rounded-2xl tracking-wider uppercase transition-all shadow-xl shadow-primary/20 transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              id="confirm-welcome-video-viewed"
            >
              ¡Refrescar Mi Mundo Ahora!
            </button>
            {/* QR Code area - always visible */}
            <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-4">
                <div className="shrink-0 w-[220px] h-[220px] bg-white/5 rounded-md flex items-center justify-center">
                  {qrGenerating ? (
                    <div className="text-sm text-zinc-300">Generando...</div>
                  ) : qrDataUrl ? (
                    <img src={qrDataUrl} alt="QR Sebas Frost" className="w-[210px] h-[210px] object-contain" />
                  ) : (
                    <div className="text-sm text-zinc-400">QR no generado</div>
                  )}
                </div>

                <div className="flex-1 text-sm text-zinc-300">
                  <div className="font-bold text-white">Ir a Sebas Frost</div>
                  <div className="text-xs break-all mt-1">{QR_TARGET}</div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <button
                      onClick={async () => {
                        if (qrDataUrl) return;
                        setQrGenerating(true);
                        try {
                          const QR = await import('qrcode');
                          const dataUrl = await QR.toDataURL(QR_TARGET, { width: 800, margin: 1 });
                          setQrDataUrl(dataUrl);
                        } catch (e) {
                          console.error('QR generation error', e);
                        } finally {
                          setQrGenerating(false);
                        }
                      }}
                      className="px-3 py-2 bg-primary text-white rounded-lg font-semibold"
                    >
                      Generar QR
                    </button>
                    <button
                      onClick={() => {
                        if (qrDataUrl) {
                          navigator.clipboard?.writeText(QR_TARGET);
                        }
                      }}
                      className="px-3 py-2 bg-white/6 text-white rounded-lg border border-white/10 font-medium"
                    >
                      Copiar enlace
                    </button>
                    <button
                      onClick={() => {
                        if (qrDataUrl) {
                          const a = document.createElement('a');
                          a.href = qrDataUrl;
                          a.download = 'sebas-frost-qr.png';
                          document.body.appendChild(a);
                          a.click();
                          a.remove();
                        }
                      }}
                      className="px-3 py-2 bg-white/6 text-white rounded-lg border border-white/10 font-medium"
                      disabled={!qrDataUrl}
                    >
                      Descargar QR
                    </button>
                  </div>

                  {/* Attribution block: CC0 1.0 */}
                  <div className="mt-4 text-xs text-zinc-400 flex items-center gap-2 flex-wrap">
                    <span dangerouslySetInnerHTML={{ __html: `<a href="https://sebas-frost.vercel.app/">Sebas Frost</a> by <a href="https://github.com/Hoyuse">Sebastian Morelo</a> is marked <a href="https://creativecommons.org/publicdomain/zero/1.0/">CC0 1.0</a>` }} />
                    <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" alt="cc" style={{ maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em' }} />
                    <img src="https://mirrors.creativecommons.org/presskit/icons/zero.svg" alt="zero" style={{ maxWidth: '1em', maxHeight: '1em', marginLeft: '.2em' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Progress Timetrack Frame on bottom */}
      <div className="relative z-10 w-full max-w-7xl mx-auto mt-8">
        <div className="flex justify-between items-center text-[11px] text-zinc-500 font-mono mb-2.5">
          <span>0:00</span>
          <span className="text-zinc-650 font-bold tracking-wide uppercase">DURACIÓN TOTAL</span>
          <span>{formatTimerValue(totalDurationSec)}</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-75 shadow-[0_0_8px_rgba(var(--color-primary),0.5)]"
            style={{ width: `${globalProgressPercent}%` }}
          />
        </div>
      </div>

    </div>
  );
}
