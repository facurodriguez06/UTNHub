"use client";

import React, { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, ShieldAlert, Sparkles, Trash2 } from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc, increment, deleteDoc, deleteField } from 'firebase/firestore';
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
      
      // Update global rating aggregates
      const globalRef = doc(db, 'subject_aggregates', ratingId);
      const globalDoc = await getDoc(globalRef);
      
      let diffDiff = difficulty;
      let utilDiff = utility;
      let countDiff = 1;

      if (previousRating) {
        // If updating an existing rating, subtract the old ones and don't increment count
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

      // Update user document
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      const currentRatings = userDoc.exists() ? (userDoc.data().subjectRatings || {}) : {};
      
      currentRatings[ratingId] = { difficulty, utility, ratedAt: new Date().toISOString() };
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

  const handleDeleteRating = async () => {
    if (!user || !subject || !previousRating) return;

    setIsSubmitting(true);
    try {
      const ratingId = `${careerId}_${subject.id}`;
      
      // Update global rating aggregates
      const globalRef = doc(db, 'subject_aggregates', ratingId);
      const globalDoc = await getDoc(globalRef);
      
      if (globalDoc.exists()) {
        const currentData = globalDoc.data();
        const currentCount = currentData.count || 0;
        
        if (currentCount <= 1) {
          // If this was the only rating, delete the aggregates document
          await deleteDoc(globalRef);
        } else {
          // Otherwise, decrement aggregate totals
          await updateDoc(globalRef, {
            totalDifficulty: increment(-previousRating.difficulty),
            totalUtility: increment(-previousRating.utility),
            count: increment(-1)
          });
        }
      }

      // Update user document
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        [`subjectRatings.${ratingId}`]: deleteField()
      });

      showToast("Calificación eliminada correctamente.", "success");
      onRatingUpdated();
      onClose();
    } catch (error: unknown) {
      console.error("Error deleting rating:", error);
      showToast(`Error: ${error instanceof Error ? error.message : 'al eliminar la calificación'}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !subject || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={() => !isSubmitting && onClose()}
      />
      <div className="relative bg-white rounded-3xl border border-[#EDE6DD] shadow-2xl max-w-sm w-[95vw] sm:w-full outline-none transform transition-all overflow-hidden animate-fade-in-scale">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-[#F5F0EA] rounded-full blur-2xl opacity-60 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 bg-[#8BAA91] rounded-full blur-3xl opacity-10 pointer-events-none"></div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-extrabold text-[#3D3229] pr-8 leading-tight">Calificar Materia</h3>
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full bg-[#FAFAF8] flex items-center justify-center text-[#A0A0A0] hover:text-[#3D3229] hover:bg-[#F5F0EA] transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-sm font-semibold text-[#8BAA91] bg-[#F4FBFA] px-3 py-1.5 rounded-lg border border-[#E8F0EA] w-fit mb-6">
            {subject.name}
          </p>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-[#8BAA91] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6 relative z-10">
              {/* Entender la lógica detrás del componente de estrellas es crucial: renderizamos 5 estrellas y la llenamos según el hover o el click activo. */}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#D4856A]" />
                  <span className="text-sm font-bold text-[#3D3229]">Dificultad</span>
                </div>
                <p className="text-xs text-[#A89F95] mb-2 leading-tight">¿Qué tan desafiante te resultó cursarla y aprobarla?</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setDifficulty(star)}
                      onMouseEnter={() => setHoverDiff(star)}
                      onMouseLeave={() => setHoverDiff(0)}
                      className="p-1 hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Star 
                        className={`w-7 h-7 ${(hoverDiff || difficulty) >= star ? 'fill-[#EAB308] text-[#EAB308]' : 'fill-transparent text-[#D1D5DB]'}`} 
                      />
                    </button>
                  ))}
                  <span className="ml-3 self-center text-xs font-bold text-[#A89F95] w-16">
                    {difficulty === 1 ? 'Muy fácil' : difficulty === 2 ? 'Fácil' : difficulty === 3 ? 'Normal' : difficulty === 4 ? 'Difícil' : difficulty === 5 ? 'Muy difícil' : ''}
                  </span>
                </div>
              </div>

              <div className="h-[1px] bg-[#EDE6DD]" />

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#8BAA91]" />
                  <span className="text-sm font-bold text-[#3D3229]">Utilidad</span>
                </div>
                <p className="text-xs text-[#A89F95] mb-2 leading-tight">¿Qué tanto te aportó para tu desarrollo profesional de los temas vistos?</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setUtility(star)}
                      onMouseEnter={() => setHoverUtil(star)}
                      onMouseLeave={() => setHoverUtil(0)}
                      className="p-1 hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Star 
                        className={`w-7 h-7 ${(hoverUtil || utility) >= star ? 'fill-[#8BAA91] text-[#8BAA91]' : 'fill-transparent text-[#D1D5DB]'}`} 
                      />
                    </button>
                  ))}
                  <span className="ml-3 self-center text-xs font-bold text-[#A89F95] w-16">
                    {utility === 1 ? 'Nada útil' : utility === 2 ? 'Poco útil' : utility === 3 ? 'Útil' : utility === 4 ? 'Muy útil' : utility === 5 ? 'Clave' : ''}
                  </span>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={isSubmitting || difficulty === 0 || utility === 0}
                className="w-full mt-4 bg-[#1A1A1A] hover:bg-[#3D3229] text-white font-bold text-sm px-4 py-3.5 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  previousRating ? "Actualizar calificación" : "Enviar calificación"
                )}
              </button>

              {previousRating && (
                <button
                  type="button"
                  onClick={handleDeleteRating}
                  disabled={isSubmitting}
                  className="w-full mt-2 bg-[#FEF5F5] hover:bg-[#FCECEC] border border-[#F5E5E5] text-[#E57A7A] hover:text-[#D46A6A] font-bold text-sm px-4 py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar calificación
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
