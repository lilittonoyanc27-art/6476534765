import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Trophy,
} from 'lucide-react';
import { QUESTIONS_DATA, TONGUE_TWISTERS_DATA, TongueTwister } from './gameData';
import { RoscoRing, QuestionStatus } from './RoscoRing';
import { TongueTwisterModal } from './TongueTwisterModal';
import { TrabalenguasDrawer } from './TrabalenguasDrawer';
import { sound } from './sound';

export default function App() {
  // State
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [statuses, setStatuses] = useState<Record<number, QuestionStatus>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [revealedTranslations, setRevealedTranslations] = useState<Record<number, boolean>>({});
  const [ringMode, setRingMode] = useState<'all50' | 'part1' | 'part2'>('part1');

  // Modal states
  const [activeModalTwister, setActiveModalTwister] = useState<TongueTwister | null>(null);
  const [isTwisterModalOpen, setIsTwisterModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);

  // Audio speaking & mute state
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.isMuted());
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState(false);

  const toggleSound = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
    if (!nextMuted) {
      sound.playClick();
    }
  };

  const currentQ = QUESTIONS_DATA[currentIndex];
  const currentStatus = statuses[currentQ.id] || 'pending';
  const isAnswered = currentStatus === 'correct' || currentStatus === 'wrong';
  const isTranslationRevealed = !!revealedTranslations[currentQ.id];

  // Unlocked tongue twisters set
  const unlockedTwisterIds = useMemo(() => {
    const ids = new Set<number>();
    Object.entries(statuses).forEach(([qId, st]) => {
      if (st === 'correct') {
        ids.add(Number(qId));
      }
    });
    return ids;
  }, [statuses]);

  // Statistics
  const correctCount = useMemo(
    () => Object.values(statuses).filter((s) => s === 'correct').length,
    [statuses]
  );
  const wrongCount = useMemo(
    () => Object.values(statuses).filter((s) => s === 'wrong').length,
    [statuses]
  );
  const pendingCount = 50 - correctCount - wrongCount;

  // Sync ringMode when jumping between parts
  useEffect(() => {
    if (ringMode === 'part1' && currentIndex >= 25) {
      setRingMode('part2');
    } else if (ringMode === 'part2' && currentIndex < 25) {
      setRingMode('part1');
    }
  }, [currentIndex, ringMode]);

  // Check victory condition
  useEffect(() => {
    if (correctCount + wrongCount === 50 && !isVictoryModalOpen) {
      sound.playVictory();
      setIsVictoryModalOpen(true);
    }
  }, [correctCount, wrongCount, isVictoryModalOpen]);

  // Toggle Armenian translation for the current question
  const toggleTranslation = useCallback(() => {
    sound.playClick();
    setRevealedTranslations((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  }, [currentQ.id]);

  // Handle Spanish sentence read aloud
  const handleSpeakQuestion = () => {
    setIsSpeakingQuestion(true);
    // Replace underscores with blank/pause for natural speech
    const cleanText = currentQ.spanish.replace(/___+/g, '...');
    sound.speakSpanish(cleanText, () => {
      setIsSpeakingQuestion(false);
    });
  };

  // Find next pending question in circular order
  const getNextPendingIndex = useCallback(
    (fromIdx: number): number => {
      for (let step = 1; step <= 50; step++) {
        const nextIdx = (fromIdx + step) % 50;
        const qId = QUESTIONS_DATA[nextIdx].id;
        const st = statuses[qId];
        if (st !== 'correct' && st !== 'wrong') {
          return nextIdx;
        }
      }
      return (fromIdx + 1) % 50;
    },
    [statuses]
  );

  // Navigate to next
  const handleNext = useCallback(() => {
    sound.playClick();
    setCurrentIndex((prev) => (prev + 1) % 50);
  }, []);

  // Navigate to previous
  const handlePrev = useCallback(() => {
    sound.playClick();
    setCurrentIndex((prev) => (prev - 1 + 50) % 50);
  }, []);

  // "Pasapalabra" / Skip current question to circle back later
  const handlePasarPalabra = () => {
    sound.playPass();
    if (currentStatus === 'pending') {
      setStatuses((prev) => ({
        ...prev,
        [currentQ.id]: 'passed',
      }));
    }
    const nextPending = getNextPendingIndex(currentIndex);
    setCurrentIndex(nextPending);
  };

  // Select an answer option
  const handleSelectOption = (key: 'A' | 'B' | 'C' | 'D') => {
    if (isAnswered) return; // Prevent changing after confirmed

    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: key }));

    const isCorrect = key === currentQ.correctKey;

    if (isCorrect) {
      setStatuses((prev) => ({ ...prev, [currentQ.id]: 'correct' }));
      // Automatically reveal translation on correct answer
      setRevealedTranslations((prev) => ({ ...prev, [currentQ.id]: true }));

      // Find matching tongue twister
      const twister = TONGUE_TWISTERS_DATA.find((t) => t.id === currentQ.id);
      if (twister) {
        setActiveModalTwister(twister);
        setIsTwisterModalOpen(true);
      }
    } else {
      sound.playWrong();
      setStatuses((prev) => ({ ...prev, [currentQ.id]: 'wrong' }));
      // Also reveal translation to help learn
      setRevealedTranslations((prev) => ({ ...prev, [currentQ.id]: true }));
    }
  };

  // Restart game
  const handleRestart = () => {
    if (window.confirm('Ցանկանո՞ւմ եք վերսկսել խաղը սկզբից (Reiniciar el juego)?')) {
      sound.playClick();
      setStatuses({});
      setSelectedAnswers({});
      setRevealedTranslations({});
      setCurrentIndex(0);
      setIsVictoryModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-radial from-sky-800 via-sky-950 to-slate-950 text-white flex flex-col justify-between selection:bg-amber-400 selection:text-slate-900 relative overflow-x-hidden">
      {/* Background studio ambient lights (just like Pasapalabra TV set) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HEADER */}
      <header className="relative z-10 border-b border-sky-600/25 bg-sky-950/60 backdrop-blur-md px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center font-black text-slate-950 text-sm sm:text-base border-2 border-white">
              P
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>PASAPALABRA</span>
                <span className="text-xs sm:text-sm font-semibold text-amber-300 px-2 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30">
                  Հայերեն · Español
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-sky-200">
                50 հարց առանց ժամանակի · Սեղմեք իսպաներենին՝ թարգմանությունը տեսնելու համար
              </p>
            </div>
          </div>

          {/* Controls: Sound Mute, Trabalenguas Vault & Reset */}
          <div className="flex items-center gap-2">
            {/* Global Sound Mute/Unmute Toggle Button */}
            <button
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/50 text-rose-300'
                  : 'bg-emerald-950/70 hover:bg-emerald-900/80 border-emerald-500/50 text-emerald-300'
              }`}
              title={isMuted ? 'Միացնել ձայնը (Включить звук)' : 'Անջատել ձայնը (Отключить звук)'}
              aria-label={isMuted ? 'Включить звук' : 'Отключить звук'}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="hidden sm:inline">Ձայնը՝ Անջատ</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="hidden sm:inline">Ձայնը՝ Միաց</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold shadow-sm transition-all"
              title="Բացված շուտասելուկների ցանկ"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">Շուտասելուկներ:</span>
              <span>{unlockedTwisterIds.size}/50</span>
            </button>

            <button
              onClick={handleRestart}
              className="p-2 rounded-xl bg-sky-900/50 hover:bg-sky-800 text-sky-200 hover:text-white border border-sky-700/50 transition-colors"
              title="Վերսկսել խաղը"
              aria-label="Վերսկսել"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN GAME ARENA */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-3 sm:px-6 py-4 sm:py-6 flex-1 flex flex-col justify-center">
        {/* Rosco Part Navigation Tabs & Score Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-sky-900/40 border border-sky-500/20 rounded-2xl p-2.5 backdrop-blur-sm">
          {/* Segmented View Mode Tabs */}
          <div className="flex items-center gap-1 bg-sky-950/60 p-1 rounded-xl border border-sky-700/40 text-xs">
            <button
              onClick={() => setRingMode('part1')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                ringMode === 'part1'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-sky-200 hover:text-white'
              }`}
            >
              Մաս 1 (1–25 Բայեր)
            </button>
            <button
              onClick={() => setRingMode('part2')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                ringMode === 'part2'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-sky-200 hover:text-white'
              }`}
            >
              Մաս 2 (26–50 Մրգեր)
            </button>
            <button
              onClick={() => setRingMode('all50')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                ringMode === 'all50'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-sky-200 hover:text-white'
              }`}
            >
              Բոլոր 50-ը
            </button>
          </div>

          {/* Score Counter Badges (Like in Pasapalabra) */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{correctCount} ճիշտ</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-400">
              <XCircle className="w-4 h-4" />
              <span>{wrongCount} սխալ</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-950/70 border border-sky-500/40 text-sky-300">
              <span>⏳ {pendingCount} մնացած</span>
            </div>
          </div>
        </div>

        {/* Studio Grid: Left = Pasapalabra Rosco Wheel, Right = Question & Options */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* LEFT: THE PASAPALABRA ROSCO */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <RoscoRing
              questions={QUESTIONS_DATA}
              currentIndex={currentIndex}
              statuses={statuses}
              onSelectQuestion={(idx) => {
                sound.playClick();
                setCurrentIndex(idx);
              }}
              ringMode={ringMode}
            />

            {/* Quick Helper under Rosco */}
            <div className="mt-2 text-center text-xs text-sky-300/80">
              Կտտացրեք ցանկացած շրջանակի՝ հարցն ընտրելու համար
            </div>
          </div>

          {/* RIGHT: THE ACTIVE QUESTION CARD */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="bg-sky-950/80 border-2 border-sky-400/30 rounded-3xl p-5 sm:p-7 shadow-[0_10px_40px_rgba(2,132,199,0.25)] backdrop-blur-md relative overflow-hidden">
              {/* Category & Status Header */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-sky-700/40">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg text-sm font-black bg-amber-400 text-slate-950 flex items-center justify-center shadow-md">
                    {currentQ.letter}
                  </span>
                  <span className="px-2 py-1 rounded-lg text-xs font-bold bg-sky-900/80 border border-sky-600/40 text-sky-200">
                    Հարց #{currentQ.id}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-sky-200">
                    {currentQ.categoryLabelHy}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentStatus === 'correct' && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ճիշտ է
                    </span>
                  )}
                  {currentStatus === 'wrong' && (
                    <span className="text-xs font-bold text-rose-400 bg-rose-950/80 border border-rose-500/40 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Սխալ է
                    </span>
                  )}
                  {currentStatus === 'passed' && (
                    <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2.5 py-1 rounded-full">
                      Բաց թողնված
                    </span>
                  )}
                </div>
              </div>

              {/* Spanish Question / Sentence (Interactive - click opens Armenian translation!) */}
              <div className="my-5">
                <div className="text-[11px] uppercase tracking-wider text-amber-300/90 font-bold mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>🇪🇸</span> Իսպաներեն հարց (Սեղմեք տեքստին՝ թարգմանությունը տեսնելու համար)
                  </span>
                  <button
                    onClick={handleSpeakQuestion}
                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md transition-colors ${
                      isMuted
                        ? 'opacity-60 text-slate-400 bg-sky-950/60'
                        : isSpeakingQuestion
                        ? 'bg-amber-400 text-slate-950 font-bold animate-pulse'
                        : 'text-sky-300 hover:text-white bg-sky-900/60'
                    }`}
                    title={isMuted ? 'Ձայնն անջատված է (Звук выключен)' : 'Լսել իսպաներեն'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isMuted ? 'Անջատ' : isSpeakingQuestion ? 'Հնչում է...' : 'Լսել'}</span>
                  </button>
                </div>

                {/* THE CLICKABLE SPANISH SENTENCE CARD */}
                <div
                  onClick={toggleTranslation}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleTranslation();
                    }
                  }}
                  className="cursor-pointer group relative bg-sky-900/40 hover:bg-sky-900/60 active:bg-sky-900/80 border-2 border-sky-400/40 hover:border-amber-400 rounded-2xl p-4 sm:p-5 transition-all shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
                  title="Սեղմեք հայերեն թարգմանությունը բացելու համար"
                >
                  <p className="text-xl sm:text-2xl font-bold text-white tracking-normal leading-relaxed">
                    {currentQ.spanish}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-amber-300/80 group-hover:text-amber-300 font-medium">
                    <span className="flex items-center gap-1">
                      👆 Կտտացրեք իսպաներենին՝ հայերեն թարգմանության համար
                    </span>
                    <span className="flex items-center gap-1">
                      {isTranslationRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{isTranslationRevealed ? 'Թաքցնել' : 'Բացել'}</span>
                    </span>
                  </div>
                </div>

                {/* REVEALABLE ARMENIAN TRANSLATION */}
                {isTranslationRevealed ? (
                  <div className="mt-3 p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-400/40 text-amber-200 animate-in fade-in slide-in-from-top-2 duration-200 shadow-md">
                    <div className="text-[11px] uppercase font-bold text-amber-400 tracking-wider mb-1 flex items-center gap-1.5">
                      <span>🇦🇲</span> Հայերեն թարգմանություն՝
                    </div>
                    <p className="text-lg sm:text-xl font-semibold text-white leading-relaxed">
                      {currentQ.armenian}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={toggleTranslation}
                    className="mt-2 text-xs text-sky-300 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ցուցադրել հայերեն թարգմանությունը (🇦🇲)</span>
                  </button>
                )}
              </div>

              {/* 4 MULTIPLE CHOICE OPTIONS (A, B, C, D) */}
              <div className="space-y-2.5 my-4">
                <div className="text-xs uppercase font-bold text-sky-300/80 tracking-wider mb-1">
                  Ընտրեք ճիշտ տարբերակը (Elige la opción correcta)՝
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentQ.options.map((opt) => {
                    const isSelected = selectedAnswers[currentQ.id] === opt.key;
                    const isCorrectKey = opt.key === currentQ.correctKey;

                    let btnStyle =
                      'bg-sky-900/40 border-sky-600/40 text-white hover:bg-sky-800/60 hover:border-sky-400';

                    if (isAnswered) {
                      if (isCorrectKey) {
                        btnStyle =
                          'bg-emerald-900/80 border-emerald-400 text-white font-bold ring-2 ring-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
                      } else if (isSelected && !isCorrectKey) {
                        btnStyle =
                          'bg-rose-950/80 border-rose-500 text-rose-200 ring-2 ring-rose-500';
                      } else {
                        btnStyle = 'bg-sky-950/40 border-sky-800/30 text-sky-400 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectOption(opt.key)}
                        disabled={isAnswered}
                        className={`p-3.5 rounded-2xl border-2 text-left flex items-center gap-3 transition-all cursor-pointer disabled:cursor-default ${btnStyle}`}
                      >
                        <span
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 shadow-sm ${
                            isAnswered && isCorrectKey
                              ? 'bg-emerald-400 text-slate-950'
                              : isAnswered && isSelected && !isCorrectKey
                              ? 'bg-rose-500 text-white'
                              : 'bg-sky-800 text-sky-200 border border-sky-500/40'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="text-base font-medium truncate">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Explanatory Note if already answered */}
              {isAnswered && currentQ.correctNote && (
                <div className="mt-3 p-3 rounded-xl bg-sky-900/30 border border-sky-500/30 text-xs text-sky-200 flex items-center justify-between gap-2">
                  <span>
                    💡 Ճիշտ պատասխան՝ <strong className="text-amber-300 font-bold">{currentQ.correctNote}</strong>
                  </span>
                  {currentStatus === 'correct' && (
                    <button
                      onClick={() => {
                        const tw = TONGUE_TWISTERS_DATA.find((t) => t.id === currentQ.id);
                        if (tw) {
                          setActiveModalTwister(tw);
                          setIsTwisterModalOpen(true);
                        }
                      }}
                      className="text-amber-300 hover:underline flex items-center gap-1 shrink-0 font-semibold"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Բացել շուտասելուկը
                    </button>
                  )}
                </div>
              )}

              {/* BOTTOM ACTIONS BAR: PASAR PALABRA & NAVIGATION */}
              <div className="pt-5 mt-5 border-t border-sky-700/40 flex flex-wrap items-center justify-between gap-3">
                {/* Prev / Next */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    className="p-2.5 rounded-xl bg-sky-900/60 hover:bg-sky-800 border border-sky-600/40 text-sky-200 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Նախորդ հարցը"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Նախորդ</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2.5 rounded-xl bg-sky-900/60 hover:bg-sky-800 border border-sky-600/40 text-sky-200 hover:text-white transition-colors flex items-center gap-1 text-xs font-semibold"
                    title="Հաջորդ հարցը"
                  >
                    <span className="hidden sm:inline">Հաջորդ</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* THE FAMOUS "PASAPALABRA" BUTTON */}
                <button
                  onClick={handlePasarPalabra}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 active:scale-95 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/30 transition-all flex items-center gap-2"
                >
                  <span>PASAPALABRA</span>
                  <span className="text-xs font-bold text-slate-900 opacity-80">(Բաց թողնել)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-sky-700/30 bg-sky-950/60 backdrop-blur-sm py-2.5 px-4 text-center text-xs text-sky-300/80">
        Pasapalabra Hispano-Armenio · 50 հարց և շուտասելուկներ · Իսպաներենի ինտերակտիվ ուսուցում
      </footer>

      {/* TONGUE TWISTER POPUP MODAL (Trabalenguas) ON CORRECT ANSWER */}
      <TongueTwisterModal
        twister={activeModalTwister}
        questionId={currentQ.id}
        isOpen={isTwisterModalOpen}
        onClose={() => setIsTwisterModalOpen(false)}
        onNext={() => {
          setIsTwisterModalOpen(false);
          const nextPending = getNextPendingIndex(currentIndex);
          setCurrentIndex(nextPending);
        }}
        totalUnlocked={unlockedTwisterIds.size}
      />

      {/* TRABALENGUAS VAULT DRAWER */}
      <TrabalenguasDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        unlockedIds={unlockedTwisterIds}
        onSelectTwister={(tw) => {
          setActiveModalTwister(tw);
          setIsDrawerOpen(false);
          setIsTwisterModalOpen(true);
        }}
      />

      {/* ALL 50 QUESTIONS COMPLETED VICTORY MODAL */}
      {isVictoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-gradient-to-b from-sky-900 via-sky-950 to-slate-950 border-2 border-amber-400 rounded-3xl p-6 sm:p-8 text-center text-white shadow-[0_0_60px_rgba(245,158,11,0.4)]">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-300">
              <Trophy className="w-8 h-8 animate-bounce" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight mb-2">
              ¡FELICIDADES! · ՇՆՈՐՀԱՎՈՐ!
            </h2>
            <p className="text-sm text-sky-200 mb-6">
              Դուք ավարտեցիք բոլոր 50 հարցերը Pasapalabra-ում!
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40">
                <div className="text-3xl font-black text-emerald-400">{correctCount}</div>
                <div className="text-xs text-emerald-200 font-semibold mt-1">Ճիշտ պատասխան</div>
              </div>
              <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-500/40">
                <div className="text-3xl font-black text-rose-400">{wrongCount}</div>
                <div className="text-xs text-rose-200 font-semibold mt-1">Սխալ պատասխան</div>
              </div>
            </div>

            <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-300 text-sm font-semibold flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Բացված է {unlockedTwisterIds.size} շուտասելուկ 50-ից!</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setIsVictoryModalOpen(false);
                  setIsDrawerOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-sky-800 hover:bg-sky-700 text-sm font-bold transition-colors"
              >
                Դիտել շուտասելուկները
              </button>
              <button
                onClick={handleRestart}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-sm font-black shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
              >
                Խաղալ նորից
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
