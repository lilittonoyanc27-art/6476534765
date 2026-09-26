import React, { useState } from 'react';
import { X, Volume2, Sparkles, BookOpen } from 'lucide-react';
import { TONGUE_TWISTERS_DATA, TongueTwister } from './gameData';
import { sound } from './sound';

interface TrabalenguasDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedIds: Set<number>;
  onSelectTwister: (twister: TongueTwister) => void;
}

export const TrabalenguasDrawer: React.FC<TrabalenguasDrawerProps> = ({
  isOpen,
  onClose,
  unlockedIds,
}) => {
  const [activeSpeechId, setActiveSpeechId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const handleSpeak = (t: TongueTwister) => {
    setActiveSpeechId(t.id);
    sound.speakSpanish(t.spanish, () => {
      setActiveSpeechId(null);
    });
  };

  const filtered = TONGUE_TWISTERS_DATA.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.spanish.toLowerCase().includes(q) ||
      t.armenian.toLowerCase().includes(q) ||
      t.id.toString() === q
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl h-[85vh] bg-gradient-to-b from-sky-950 via-slate-900 to-sky-950 border border-sky-500/40 rounded-3xl p-6 shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-sky-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Շուտասելուկների գանձարան
                <span className="text-sm font-normal text-sky-300">
                  (Colección de Trabalenguas)
                </span>
              </h2>
              <p className="text-xs text-sky-300">
                Բացված է՝ <strong className="text-amber-300">{unlockedIds.size}</strong> / 50 շուտասելուկ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-sky-900/60 hover:bg-sky-800 text-sky-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="my-4">
          <input
            type="text"
            placeholder="Փնտրել ըստ բառի կամ համարի (Buscar palabra o número)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-sky-900/40 border border-sky-700/50 text-white placeholder-sky-400 text-sm focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* List of 50 Trabalenguas */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {filtered.map((t) => {
            const isUnlocked = unlockedIds.has(t.id);
            const isSpeaking = activeSpeechId === t.id;

            return (
              <div
                key={t.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isUnlocked
                    ? 'bg-sky-900/30 border-sky-500/30 hover:border-sky-400/60'
                    : 'bg-slate-900/30 border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                      {t.id}
                    </span>
                    {isUnlocked ? (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Բացված է
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 font-normal">
                        Կբացվի #{t.id} հարցին ճիշտ պատասխանելիս
                      </span>
                    )}
                  </div>

                  {isUnlocked && (
                    <button
                      onClick={() => handleSpeak(t)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        isSpeaking
                          ? 'bg-amber-400 text-slate-950 font-bold'
                          : 'bg-sky-800 hover:bg-sky-700 text-sky-100'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isSpeaking ? 'Արտասանում է...' : 'Լսել'}</span>
                    </button>
                  )}
                </div>

                <div className="mt-2.5 space-y-1">
                  <p className="text-sm sm:text-base font-semibold text-white">
                    {t.spanish}
                  </p>
                  <p className="text-xs sm:text-sm text-sky-200/90 font-medium">
                    {t.armenian}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-sky-800/40 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-sky-800 hover:bg-sky-700 text-sm font-semibold transition-colors"
          >
            Փակել (Cerrar)
          </button>
        </div>
      </div>
    </div>
  );
};
