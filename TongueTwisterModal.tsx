import React, { useEffect, useState } from 'react';
import { Volume2, ArrowRight, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { TongueTwister } from './gameData';
import { sound } from './sound';

interface TongueTwisterModalProps {
  twister: TongueTwister | null;
  questionId: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  totalUnlocked: number;
}

export const TongueTwisterModal: React.FC<TongueTwisterModalProps> = ({
  twister,
  questionId,
  isOpen,
  onClose,
  onNext,
  totalUnlocked,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (isOpen && twister) {
      sound.playCorrect();
    }
    return () => {
      sound.stopSpeaking();
      setIsSpeaking(false);
    };
  }, [isOpen, twister]);

  if (!isOpen || !twister) return null;

  const handleSpeak = () => {
    setIsSpeaking(true);
    sound.speakSpanish(twister.spanish, () => {
      setIsSpeaking(false);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Confetti particles effect (CSS purely styled) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-1/4 w-3 h-3 bg-amber-400 rounded-full animate-bounce opacity-70" />
        <div className="absolute top-20 right-1/4 w-4 h-4 bg-emerald-400 rotate-45 animate-pulse opacity-70" />
        <div className="absolute top-32 left-1/3 w-3 h-3 bg-sky-400 rounded-full animate-ping opacity-60" />
        <div className="absolute top-16 right-1/3 w-2 h-4 bg-rose-400 rotate-12 animate-bounce opacity-70" />
      </div>

      <div className="relative w-full max-w-xl bg-gradient-to-b from-sky-900 via-sky-950 to-slate-950 border-2 border-emerald-400/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.35)] text-white overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-sky-200 hover:text-white rounded-full bg-sky-900/50 hover:bg-sky-800 transition-colors"
          aria-label="Փակել"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 mb-4 text-emerald-400 font-semibold tracking-wide uppercase text-xs sm:text-sm">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Ճիշտ պատասխան! · ¡Respuesta Correcta!</span>
          <span className="text-sky-300 font-normal ml-auto">
            Հարց #{questionId}
          </span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-2 mb-5">
          <Sparkles className="w-6 h-6 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight">
            Շուտասելուկ #{twister.id} (Trabalenguas)
          </h2>
        </div>

        {/* Tongue twister content */}
        <div className="space-y-4 my-4">
          {/* Spanish box */}
          <div className="bg-sky-950/70 border border-amber-400/40 rounded-2xl p-4 sm:p-5 relative group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
                <span>🇪🇸</span> Իսպաներեն (Español)
              </span>
              <button
                onClick={handleSpeak}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  isSpeaking
                    ? 'bg-amber-400 text-slate-950 animate-pulse'
                    : 'bg-sky-800 hover:bg-sky-700 text-sky-100 hover:text-white'
                }`}
                title="Լսել արտասանությունը"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{isSpeaking ? 'Արտասանում է...' : 'Լսել'}</span>
              </button>
            </div>
            <p className="text-lg sm:text-xl font-bold text-white leading-relaxed font-sans">
              "{twister.spanish}"
            </p>
          </div>

          {/* Armenian box */}
          <div className="bg-slate-900/60 border border-sky-600/30 rounded-2xl p-4 sm:p-5">
            <div className="text-xs uppercase font-bold text-sky-300 tracking-wider mb-2 flex items-center gap-1.5">
              <span>🇦🇲</span> Հայերեն թարգմանություն
            </div>
            <p className="text-base sm:text-lg font-medium text-slate-200 leading-relaxed">
              «{twister.armenian}»
            </p>
          </div>
        </div>

        {/* Footer info & Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-sky-800/40 mt-6">
          <div className="text-xs text-sky-300/80">
            Բացված է՝ <strong className="text-amber-300">{totalUnlocked}</strong> / 50 շուտասելուկ
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-sky-500/30 bg-sky-900/40 hover:bg-sky-800 text-sky-200 text-sm font-semibold transition-colors"
            >
              Վերանայել
            </button>
            <button
              onClick={() => {
                onNext();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Հաջորդ հարցը</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
