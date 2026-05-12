"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, ShieldAlert, Sparkles } from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useScrollLock } from '@/hooks/useScrollLock';

interface SubjectRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: { id: string; name: string } | null;
  careerId: string;
  onRatingUpdated: () => void;
}

export default function SubjectRatingModal({ isOpen, onClose, subject, careerId, onRatingUpdated }: SubjectRatingModalProps) {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [difficulty, setDifficulty] = useState(0);
  const [utility, setUtility] = useState(0);
  const [hoverDiff, setHoverDiff] = useState(0);
  const [hoverUtil, setHoverUtil] = useState(0);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previousRating, setPreviousRating] = useState<{difficulty: number, utility: number} | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useScrollLock(isOpen);

  const loadUserRating = useCallback(async () => {
    if (!user || !subject) return;

    setIsLoading(true);
    setDifficulty(0);
    setUtility(0);
    setPreviousRating(null);

    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const ratings = userDoc.data().subjectRatings || {};
        const ratingId = `${careerId}_${subject.id}`;
        const rating = ratings[ratingId] as { difficulty: number; utility: number } | undefined;
        if (rating) {
          setDifficulty(rating.difficulty);
          setUtility(rating.utility);
          setPreviousRating(rating);
        }
      }
    } catch (error) {
      console.error("Error loading user rating:", error);
    } finally {
      setIsLoading(false);
    }
  }, [careerId, subject, user]);

  useEffect(() => {
    if (isOpen && subject && user) {
      loadUserRating();
    } else {
      setDifficulty(0);
      setUtility(0);
      setPreviousRating(null);
    }
  }, [isOpen, subject, user, loadUserRating]);

  const handleSave = async () => {
    if (!user || !subject || difficulty === 0 || utility === 0) {
      showToast("Por favor califica ambas categorías.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const ratingId = `${careerId}_${subject.id}`;
      const globalRef = doc(db, 'subject_aggregates', ratingId);
      const globalDoc = await getDoc(globalRef);
      
      let diffDiff = difficulty;
      let utilDiff = utility;
      let countDiff = 1;

      if (previousRating) {
        diffDiff = difficulty - previousRating.difficulty;
        utilDiff = utility - previousRating.utility;
        countDiff = 0;
      }

      if (globalDoc.exists()) {
        await updateDoc(globalRef, {
          totalDifficulty: increment(diffDiff),
          totalUtility: increment(utilDiff),
          count: increment(countDiff)
        });
      } else {
        await setDoc(globalRef, {
          totalDifficulty: difficulty,
          totalUtility: utility,
          count: 1
        });
      }

      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const currentRatings = userDoc.exists() ? (userDoc.data().subjectRatings || {}) : {};
      
      currentRatings[ratingId] = { difficulty, utility };
      await setDoc(userRef, { subjectRatings: currentRatings }, { merge: true });

      showToast("¡Gracias por calificar la materia!", "success");
      onRatingUpdated();
      onClose();
    } catch (error: unknown) {
      console.error("Error saving rating:", error);
      showToast(`Error: ${error instanceof Error ? error.message : 'al guardar la calificación'}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !subject || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-200">
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-fade-in" 
        onClick={() => !isSubmitting && onClose()}
      />
      <div className="relative bg-white border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full animate-fade-in-scale flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-400 border-b-4 border-zinc-900 p-6 flex justify-between items-start">
          <div className="flex-1 pr-6">
            <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter leading-none italic">Calificar Materia</h3>
            <p className="text-[10px] text-zinc-900 font-black uppercase tracking-widest mt-2 bg-white/50 border-2 border-zinc-900 px-2 py-1 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {subject.name}
            </p>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="w-10 h-10 bg-white border-4 border-zinc-900 flex items-center justify-center text-zinc-900 hover:bg-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
          >
            <X className="w-6 h-6" strokeWidth={4} />
          </button>
        </div>
        
        <div className="p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-12 h-12 border-8 border-zinc-900 border-t-emerald-400 animate-spin" />
              <p className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Cargando datos...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Dificultad */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-400 border-4 border-zinc-900 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <ShieldAlert className="w-6 h-6 text-zinc-900" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Dificultad</h4>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-tight italic leading-none">¿Qué tan desafiante te resultó?</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 bg-zinc-50 border-4 border-zinc-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setDifficulty(star)}
                        onMouseEnter={() => setHoverDiff(star)}
                        onMouseLeave={() => setHoverDiff(0)}
                        className="transition-all hover:scale-125 active:scale-95"
                      >
                        <Star 
                          className={`w-10 h-10 transition-colors ${(hoverDiff || difficulty) >= star ? 'fill-yellow-400 text-zinc-900' : 'fill-transparent text-zinc-200'}`} 
                          strokeWidth={3}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-[10px] font-black text-zinc-900 uppercase tracking-widest min-h-[1.5em] italic">
                    {difficulty === 1 ? 'Muy fácil' : difficulty === 2 ? 'Fácil' : difficulty === 3 ? 'Normal' : difficulty === 4 ? 'Difícil' : difficulty === 5 ? 'Muy difícil' : 'SIN SELECCIONAR'}
                  </p>
                </div>
              </div>

              {/* Utilidad */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-400 border-4 border-zinc-900 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Sparkles className="w-6 h-6 text-zinc-900" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-zinc-900 uppercase tracking-widest">Utilidad</h4>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-tight italic leading-none">¿Qué tanto te aportó?</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 bg-zinc-50 border-4 border-zinc-900 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUtility(star)}
                        onMouseEnter={() => setHoverUtil(star)}
                        onMouseLeave={() => setHoverUtil(0)}
                        className="transition-all hover:scale-125 active:scale-95"
                      >
                        <Star 
                          className={`w-10 h-10 transition-colors ${(hoverUtil || utility) >= star ? 'fill-emerald-400 text-zinc-900' : 'fill-transparent text-zinc-200'}`} 
                          strokeWidth={3}
                        />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-[10px] font-black text-zinc-900 uppercase tracking-widest min-h-[1.5em] italic">
                    {utility === 1 ? 'Nada útil' : utility === 2 ? 'Poco útil' : utility === 3 ? 'Útil' : utility === 4 ? 'Muy útil' : utility === 5 ? 'Clave' : 'SIN SELECCIONAR'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSubmitting || difficulty === 0 || utility === 0}
                className="w-full mt-6 bg-zinc-900 border-4 border-zinc-900 text-white font-black text-xl py-5 uppercase tracking-widest transition-all shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-6 h-6 border-4 border-white border-t-transparent animate-spin" />
                    <span>ENVIANDO...</span>
                  </div>
                ) : (
                  previousRating ? "ACTUALIZAR VOTO" : "ENVIAR VOTO"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
