import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Sparkles, 
  AlertCircle, 
  Check, 
  ArrowRight,
  LogOut
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }
    if (isSignUp && !displayName) {
      setError('Por favor, ingresa tu nombre de usuario.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Register User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: displayName
        });

        // Initialize user firestore document
        try {
          const stored = localStorage.getItem('sebas_frost_cart');
          const localCart = stored ? JSON.parse(stored) : [];
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: displayName,
            cart: localCart,
            updatedAt: serverTimestamp()
          });
        } catch (dbErr) {
          console.warn("Failed to precreate users record on signup:", dbErr);
        }

        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onAuthSuccess) onAuthSuccess();
          onClose();
        }, 1500);
      } else {
        // Login User
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          if (onAuthSuccess) onAuthSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      console.error("Auth process error:", err);
      let translateError = 'Ocurrió un error al procesar tu solicitud.';
      if (err.code === 'auth/email-already-in-use') {
        translateError = 'Este correo ya se encuentra registrado.';
      } else if (err.code === 'auth/invalid-credential') {
        translateError = 'Credenciales inválidas. Por favor intenta de nuevo.';
      } else if (err.code === 'auth/weak-password') {
        translateError = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        translateError = 'El formato de correo no es válido.';
      } else if (err.code === 'auth/operation-not-allowed') {
        translateError = 'El inicio de sesión por Email/Contraseña no está habilitado en Firebase Console. Por favor contáctanos o ingresa con Google.';
      }
      setError(translateError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        if (onAuthSuccess) onAuthSuccess();
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError('No pudimos conectar con tu cuenta de Google.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl border border-primary/25 z-10 p-6 md:p-8"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Content */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-sans font-black text-2xl text-on-surface">
                {isSignUp ? 'Crear una cuenta' : 'Iniciar Sesión'}
              </h3>
              <p className="text-xs text-on-surface-variant mt-1">
                Refresca tu vida con el perfil Sebas Frost
              </p>
            </div>

            {/* Notification alert about configuration requirements */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-6 flex gap-2 items-start">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[10px] text-amber-700 leading-normal">
                El inicio de sesión por <strong>Google</strong> está activo por defecto. Si usas Correo, asegúrate de tener activo <em>Email/Password</em> en tu consola Firebase de Google Cloud.
              </div>
            </div>

            {/* Success state */}
            {success ? (
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-3"
              >
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Check className="w-10 h-10 stroke-[3]" />
                </div>
                <h4 className="font-black text-lg text-emerald-600">¡Acceso Correcto!</h4>
                <p className="text-sm text-zinc-500">Cargando tu experiencia de usuario...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleEmailAuth} className="space-y-4">
                {/* Form fields */}
                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">Nombre Completo</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Sebas Delgado"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 outline-none text-sm transition-all focus:bg-white focus:border-primary/50"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      placeholder="sebas@ejemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 outline-none text-sm transition-all focus:bg-white focus:border-primary/50"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider pl-1">Contraseña</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-zinc-100 rounded-xl border border-zinc-200 outline-none text-sm transition-all focus:bg-white focus:border-primary/50"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                    {error}
                  </div>
                )}

                {/* Submit actions */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
                >
                  {loading ? 'Procesando...' : (isSignUp ? 'Registrarme' : 'Ingresar con Correo')}
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 my-4">
                  <div className="h-px bg-zinc-200 flex-grow"></div>
                  <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">o ingresa con</span>
                  <div className="h-px bg-zinc-200 flex-grow"></div>
                </div>

                {/* Google login action button */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full py-3 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl font-bold text-sm text-on-surface flex items-center justify-center gap-2.5 shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.19-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Iniciar Sólido con Google</span>
                </button>

                {/* Toggle tab auth mode */}
                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      clearForm();
                    }}
                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {isSignUp ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
