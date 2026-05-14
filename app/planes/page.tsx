"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calculator, Atom, BookOpen, Binary, Cpu, Network, Database, 
  Building2, FlaskConical, Zap, ArrowLeft, FileText, Calendar, Star, LogIn, ShieldAlert,
  CheckCircle2, AlertTriangle, Unlock, Info, Layers, Sparkles, X,
  Code2, LineChart, Briefcase, ShieldCheck, GraduationCap, Lock, Trophy, Rocket, Layout
} from 'lucide-react';

import { planesData } from './data';
import Link from 'next/link';
import { useScrollLock } from '@/hooks/useScrollLock';
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import SubjectRatingModal from '@/components/SubjectRatingModal';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { useToast } from '@/context/ToastContext';
import { cn } from "@/lib/utils";

type SubjectId = string | number;
type UserProgress = { aprobadas: SubjectId[]; regulares: SubjectId[] };
const hasProgressId = (items: SubjectId[], id: SubjectId) => items.some((item) => String(item) === String(id));
const countProgressIds = (items: SubjectId[], ids: SubjectId[]) => ids.filter((id) => hasProgressId(items, id)).length;
type UserProfileSummary = {
  role?: string;
  providerId?: string;
  lastLoginAt?: string;
  preferredCareerId?: string;
  preferredSemester?: string;
  notificationsEnabled?: boolean;
};
type RatingAggregate = { diffAvg: number; utilAvg: number; count: number };
type RatingModalSubject = { id: string; name: string };

export interface Subject {
  isElectiva?: boolean;
  docente?: string;
  horario?: string;
  weekly_hours?: number;
  total_hours?: number;
  id: string | number;
  year: number;
  semester?: string;
  note?: string;
  name: string;
  regulares: (string | number)[];
  aprobadas: (string | number)[];
  rendir?: (string | number)[];
}

export interface Career {
  id: string;
  name: string;
  shortName: string;
  years: number;
  icon: React.ReactElement;
  color: string;
  requiredElectiveHours?: number;
  curriculum: Subject[];
}

const SubjectStatusRibbon = ({
  label,
  tone,
}: {
  label: string;
  tone: 'approved' | 'regular';
}) => {
  const toneClasses =
    tone === 'approved'
      ? 'bg-emerald-400 border-4 border-zinc-900 shadow-neo text-zinc-900'
      : 'bg-yellow-400 border-4 border-zinc-900 shadow-neo text-zinc-900';

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-300 opacity-100 group-hover:opacity-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 flex w-[146%] -translate-x-1/2 -translate-y-1/2 items-center justify-center select-none"
      >
        <div
          className={`relative flex w-full items-center justify-center overflow-hidden border-zinc-900 px-4 text-center font-black uppercase whitespace-nowrap animate-stamp ${toneClasses}`}
          style={{
            fontSize: 'clamp(0.72rem, 5.6cqw, 1.75rem)',
            paddingTop: 'clamp(0.35rem, 1cqw, 0.6rem)',
            paddingBottom: 'clamp(0.35rem, 1cqw, 0.6rem)',
            letterSpacing: '0.1em',
          }}
        >
          <span className="relative z-10">{label}</span>
        </div>
      </div>
    </div>
  );
};

type InteractiveProgressButtonsProps = {
  subject: Subject;
  userProgress: UserProgress;
  onToggle: (subjectId: SubjectId, state: 'aprobadas' | 'regulares') => void;
  user: User | null;
  setShowLoginPrompt: (show: boolean) => void;
};

const InteractiveProgressButtons = ({
  subject,
  userProgress,
  onToggle,
  user,
  setShowLoginPrompt,
  }: InteractiveProgressButtonsProps) => {
  const isApproved = user ? hasProgressId(userProgress.aprobadas, subject.id) : false;
  const isRegular = user ? hasProgressId(userProgress.regulares, subject.id) : false;

  const missingAprobadas = subject.aprobadas.some((id: string | number) => !hasProgressId(userProgress.aprobadas, id));
  const missingRegulares = subject.regulares.some((id: string | number) => !hasProgressId(userProgress.aprobadas, id) && !hasProgressId(userProgress.regulares, id));
  const canTake = !missingAprobadas && !missingRegulares;

  const handleAction = (type: 'aprobadas' | 'regulares') => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    onToggle(subject.id, type);
  };

  return (
    <div className="bg-white p-5 border-4 border-zinc-900 shadow-neo flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-black uppercase text-zinc-900 tracking-widest">Mi Progreso</h4>
          {!isApproved && !isRegular && (
            canTake 
              ? <span className="text-[10px] font-black px-2 py-0.5 border-2 border-zinc-900 text-zinc-900 bg-emerald-400 uppercase tracking-tighter">Disponible</span>
              : <span className="text-[10px] font-black px-2 py-0.5 border-2 border-zinc-900 text-zinc-900 bg-yellow-400 uppercase tracking-tighter">Bloqueada</span>
          )}
        </div>
        {(isApproved || isRegular) && user && (
          <button
            onClick={() => handleAction(isApproved ? 'aprobadas' : 'regulares')}
            className="text-[10px] sm:text-xs font-black text-red-500 hover:text-white hover:bg-red-500 px-2 py-1 flex items-center gap-1 transition-all border-2 border-transparent hover:border-zinc-900 uppercase tracking-widest italic"       
          >
            <X className="w-3 h-3" strokeWidth={3} /> Desmarcar
          </button>
        )}
      </div>
      <div className="flex gap-2 w-full">
        <button
          onClick={() => handleAction('aprobadas')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-black transition-all border-4 border-zinc-900 uppercase tracking-widest italic
            ${isApproved ? 'bg-emerald-400 text-zinc-900 shadow-none translate-x-[4px] translate-y-[4px]' : 'bg-white text-zinc-900 shadow-neo hover:-translate-y-1 hover:-translate-x-1 hover:shadow-neo-xl active:translate-y-[4px] active:translate-x-[4px] active:shadow-none'}
          `}
        >
          <CheckCircle2 className="w-4 h-4" strokeWidth={3} /> {isApproved ? 'Aprobada!' : 'Aprobar'}
        </button>
        <button
          onClick={() => handleAction('regulares')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-black transition-all border-4 border-zinc-900 uppercase tracking-widest italic
            ${isRegular ? 'bg-yellow-400 text-zinc-900 shadow-none translate-x-[4px] translate-y-[4px]' : 'bg-white text-zinc-900 shadow-neo hover:-translate-y-1 hover:-translate-x-1 hover:shadow-neo-xl active:translate-y-[4px] active:translate-x-[4px] active:shadow-none'}
          `}
        >
          <AlertTriangle className="w-4 h-4" strokeWidth={3} /> {isRegular ? 'Regular!' : 'Regularizar'}
        </button>
      </div>
    </div>
  );
};

export default function PlanesPage() {
  const careerOptions = useMemo(() => Object.values(planesData), []);
  const [activeCareer, setActiveCareer] = useState<Career>(careerOptions[0]);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  // States for Ratings
  const [globalRatings, setGlobalRatings] = useState<Record<string, RatingAggregate>>({});
  const [ratingModalSubject, setRatingModalSubject] = useState<RatingModalSubject | null>(null);
  const [ratingModalCareer, setRatingModalCareer] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress>({ aprobadas: [], regulares: [] });
  const router = useRouter();
  const { showToast } = useToast();

  const loadGlobalRatings = async (careerId: string): Promise<Record<string, RatingAggregate>> => {
    const querySnapshot = await getDocs(collection(db, 'subject_aggregates'));
    const ratings: Record<string, RatingAggregate> = {};

    querySnapshot.forEach((snapshotDoc) => {
      if (!snapshotDoc.id.startsWith(`${careerId}_`)) return;

      const subjectId = snapshotDoc.id.replace(`${careerId}_`, '');
      const data = snapshotDoc.data();
      const totalDifficulty = typeof data.totalDifficulty === 'number' ? data.totalDifficulty : 0;
      const totalUtility = typeof data.totalUtility === 'number' ? data.totalUtility : 0;
      const count = typeof data.count === 'number' && data.count > 0 ? data.count : 0;

      if (count > 0) {
        ratings[subjectId] = {
          diffAvg: totalDifficulty / count,
          utilAvg: totalUtility / count,
          count,
        };
      }
    });

    return ratings;
  };

  const refreshGlobalRatings = () => {
    loadGlobalRatings(activeCareer.id)
      .then(setGlobalRatings)
      .catch((error) => {
        console.error("Error fetching ratings", error);
      });
  };

  useEffect(() => {
    let isCurrent = true;

    loadGlobalRatings(activeCareer.id)
      .then((ratings) => {
        if (isCurrent) setGlobalRatings(ratings);
      })
      .catch((error) => {
        console.error("Error fetching ratings", error);
      });

    return () => {
      isCurrent = false;
    };
  }, [activeCareer.id]);

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef)
        .then((docSnap) => {
          if (!docSnap.exists()) return;

          const data = docSnap.data() as UserProfileSummary & { progress?: UserProgress };
          setUserProgress(data.progress || { aprobadas: [], regulares: [] });
        })
        .catch((error) => {
          console.error('Error al leer el progreso resumen:', error);
        });
    } else {
      setUserProgress({ aprobadas: [], regulares: [] });
    }
  }, [user]);

  const openRatingModal = (subject: Pick<Subject, 'id' | 'name'>) => {
    setRatingModalCareer(activeCareer.id);
    setRatingModalSubject({ id: String(subject.id), name: subject.name });
  };

  const handleRatingUpdated = () => {
    refreshGlobalRatings();
  };

  return (
    <React.Fragment>
      {/* Soft Grid Pattern */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.4] pointer-events-none z-0" />

      {/* Main Content */}
      <div ref={containerRef} className="flex-grow flex flex-col pt-10 sm:pt-12 relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        <div className="flex flex-col gap-6 sm:gap-8 mb-12 sm:mb-16 animate-slide-right-neo" style={{ animationDelay: '100ms' }}>
          <div className="space-y-6 max-w-3xl">
            <Link href="/" className="neo-btn-outline w-fit animate-slide-right-neo" style={{ animationDelay: '200ms' }}>
              <ArrowLeft className="w-4 h-4" strokeWidth={3} />
              Volver al inicio
            </Link>
            <div>
              <h1 className="text-4xl sm:text-7xl font-black text-zinc-900 uppercase tracking-tighter leading-none mb-4 italic animate-slide-right-neo" style={{ animationDelay: '300ms' }}>
                Planes de <span className="text-emerald-400">Estudio</span>
              </h1>
              <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest max-w-xl border-l-4 border-zinc-900 pl-4 animate-slide-right-neo" style={{ animationDelay: '400ms' }}>
                Visualizá tu progreso académico, consultá correlativas y planificá tu semestre con el sistema de trazado interactivo de UTNHUB.
              </p>
            </div>
          </div>


        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 mb-10 sm:mb-12 animate-pop-in-neo" style={{ animationDelay: '300ms' }}>
          <div className="lg:col-span-8 bg-white border-4 border-zinc-900 shadow-neo-xl p-4 sm:p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
            <div className="relative flex-grow w-full">
              <Info className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" strokeWidth={3} />
              <input
                type="text"
                placeholder="BUSCAR MATERIA (EJ: ANÁLISIS I)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border-4 border-zinc-900 pl-12 pr-4 py-4 text-sm font-black uppercase tracking-widest focus:bg-white focus:outline-none focus:ring-0 transition-colors"
              />
            </div>
            <div className="flex gap-3 sm:gap-4 shrink-0 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none flex flex-col items-center justify-center px-4 sm:px-6 py-2 bg-zinc-900 text-white border-4 border-zinc-900">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Materias</span>
                <span className="text-xl font-black">{activeCareer.curriculum.filter(s => !s.isElectiva).length}</span>
              </div>
              <div className="flex-1 sm:flex-none flex flex-col items-center justify-center px-4 sm:px-6 py-2 bg-emerald-400 text-zinc-900 border-4 border-zinc-900 shadow-neo">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Aprobadas</span>
                <span className="text-xl font-black">
                  {user ? activeCareer.curriculum.filter(s => !s.isElectiva && hasProgressId(userProgress.aprobadas, s.id)).length : 0}
                </span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-4 flex bg-white p-2 flex-nowrap sm:flex-wrap overflow-x-auto justify-start items-center border-4 border-zinc-900 w-full gap-2 relative z-20 shadow-neo-xl">
            {careerOptions.map((career, idx) => (
              <button
                key={career.id}
                onClick={() => setActiveCareer(career)}
                style={{ animationDelay: `${400 + idx * 100}ms` }}
                className={cn(
                  "flex-1 min-w-[110px] px-4 py-3 font-black uppercase tracking-widest text-xs border-4 transition-all duration-300 active:translate-y-[4px] active:translate-x-[4px] active:shadow-none italic whitespace-nowrap animate-slide-right-neo",
                  activeCareer.id === career.id 
                    ? "bg-emerald-400 text-zinc-900 border-zinc-900 shadow-none translate-y-[4px] translate-x-[4px]" 
                    : "bg-white text-zinc-600 border-transparent hover:border-zinc-900 hover:text-zinc-900 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]"
                )}
              >
                {career.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* Curriculum Viewer Container */}
          <div className="flex-grow relative flex flex-col min-h-[540px] sm:min-h-[600px] mb-8">
          <div className="absolute inset-0 bg-white border-b   border-[3px] border-zinc-900  pointer-events-none z-0" />
          <div className="relative z-10 flex-grow flex flex-col min-h-[600px]  overflow-hidden">
            <CurriculumViewer
              career={activeCareer}
              globalRatings={globalRatings}
              openRatingModal={openRatingModal}
              setShowLoginPrompt={setShowLoginPrompt}
              setSearchTerm={setSearchTerm}
              userProgress={userProgress}
              setUserProgress={setUserProgress}
            />
          </div>
        </div>

    </div>

      {/* Modals placed outside main flow */}
      <SubjectRatingModal 
        isOpen={!!ratingModalSubject} 
        onClose={() => setRatingModalSubject(null)} 
        subject={ratingModalSubject} 
        careerId={ratingModalCareer}
        onRatingUpdated={handleRatingUpdated}
      />

      {/* Login Prompt Modal */}
      {showLoginPrompt && typeof document !== 'undefined' && createPortal(
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowLoginPrompt(false)}
          />
          <div className="relative bg-white border-[3px] border-zinc-900 max-w-sm w-full outline-none transform transition-all overflow-hidden animate-fade-in-scale p-5 sm:p-6 text-center mx-2 sm:mx-4">
            <div className="w-14 h-14 bg-zinc-100  flex items-center justify-center mb-6  text-amber-600 mx-auto">
              <LogIn className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">Iniciá sesión</h3>
            <p className="text-sm font-medium text-zinc-600 mb-6">
              Para calificar materias y ayudar a otros estudiantes, necesitas tener una cuenta. ¡Es gratis y rápido!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="neo-btn-outline flex-1 py-3 text-xs"
              >
                Cancelar
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="neo-btn-primary flex-1 py-3 text-xs"
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
  </React.Fragment>
);
}

// ----------------------------------------------------------------------
// CurriculumViewer & Child Components
// ----------------------------------------------------------------------

// Icon Mapper Helper
// ----------------------------------------------------------------------
const getSubjectIcon = (name: string, className: string) => {
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('matemática') || lowerName.includes('álgebra') || lowerName.includes('cálculo') || lowerName.includes('numérico')) return <Calculator className={className} />;
  if (lowerName.includes('física') || lowerName.includes('mecánica') || lowerName.includes('dinámica')) return <Atom className={className} />;
  if (lowerName.includes('química')) return <FlaskConical className={className} />;
  if (lowerName.includes('termodinámica')) return <Zap className={className} />;
  if (lowerName.includes('programación') || lowerName.includes('algoritmo') || lowerName.includes('software')) return <Code2 className={className} />;
  if (lowerName.includes('datos') || lowerName.includes('información')) return <Database className={className} />;
  if (lowerName.includes('redes') || lowerName.includes('comunicación')) return <Network className={className} />;
  if (lowerName.includes('sistemas') || lowerName.includes('arquitectura') || lowerName.includes('operativos')) return <Cpu className={className} />;
  if (lowerName.includes('electrónica') || lowerName.includes('eléctrica') || lowerName.includes('circuitos')) return <Binary className={className} />;
  if (lowerName.includes('civil') || lowerName.includes('estructuras') || lowerName.includes('construcción') || lowerName.includes('materiales')) return <Building2 className={className} />;
  if (lowerName.includes('economía') || lowerName.includes('gestión') || lowerName.includes('administración')) return <LineChart className={className} />;
  if (lowerName.includes('legal') || lowerName.includes('legislación')) return <Briefcase className={className} />;
  if (lowerName.includes('seguridad') || lowerName.includes('calidad')) return <ShieldCheck className={className} />;
  if (lowerName.includes('proyecto') || lowerName.includes('seminario')) return <Layers className={className} />;

  // Default fallback
  return <BookOpen className={className} />;
};

type CurriculumViewerProps = {
  career: Career;
  globalRatings: Record<string, RatingAggregate>;
  openRatingModal: (subject: Pick<Subject, 'id' | 'name'>) => void;
  setShowLoginPrompt: (show: boolean) => void;
  setSearchTerm: (term: string) => void;
  userProgress: UserProgress;
  setUserProgress: React.Dispatch<React.SetStateAction<UserProgress>>;
};

const CurriculumViewer = ({
  career,
  globalRatings,
  openRatingModal,
  setShowLoginPrompt,
  setSearchTerm,
  userProgress,
  setUserProgress,
}: CurriculumViewerProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profileSummary, setProfileSummary] = useState<UserProfileSummary>({});
  const [celebrationModal, setCelebrationModal] = useState<{ isOpen: boolean; year: string | number }>({ isOpen: false, year: '' });

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfileSummary;
          setProfileSummary({
            role: data.role || (user.email?.toLowerCase() === 'facundorodriguezsp@gmail.com' ? 'admin' : 'user'),
            providerId: data.providerId || user.providerData[0]?.providerId || 'unknown',
            lastLoginAt: data.lastLoginAt || user.metadata.lastSignInTime || undefined,
            preferredCareerId: data.preferredCareerId || '',
            preferredSemester: data.preferredSemester || '',
            notificationsEnabled: typeof data.notificationsEnabled === 'boolean' ? data.notificationsEnabled : true,
          });
        }
      }).catch((error) => {
        console.error("Error al leer el perfil:", error);
      });
    } else {
      setProfileSummary({});
    }
  }, [user]);

  const handleBulkToggle = async (yearSubjects: Subject[], state: 'aprobadas' | 'regulares') => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    const subjectIds = yearSubjects.map(s => s.id);
    const nextProgress = { ...userProgress };
    
    if (state === 'aprobadas') {
      const uniqueApproved = new Set([...nextProgress.aprobadas, ...subjectIds]);
      nextProgress.aprobadas = Array.from(uniqueApproved);
      nextProgress.regulares = nextProgress.regulares.filter(id => !subjectIds.includes(id));
    } else {
      const uniqueRegular = new Set([...nextProgress.regulares, ...subjectIds]);
      nextProgress.regulares = Array.from(uniqueRegular);
      nextProgress.aprobadas = nextProgress.aprobadas.filter(id => !subjectIds.includes(id));
    }

    setUserProgress(nextProgress);
    
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, { progress: nextProgress }).catch(e => console.error("Error updating progress", e));
    
    if (state === 'aprobadas') {
      setCelebrationModal({ isOpen: true, year: yearSubjects[0]?.year || '' });
    } else {
      showToast("Año marcado como regularizado correctamente.", "success");
    }
  };

  const handleToggleState = async (subjectId: string | number, state: 'aprobadas' | 'regulares') => {
    if (!user) return;
    
    const nextProgress = { ...userProgress };
    
    if (state === 'aprobadas') {
      if (nextProgress.aprobadas.includes(subjectId)) {
        nextProgress.aprobadas = nextProgress.aprobadas.filter(id => id !== subjectId);
      } else {
        nextProgress.aprobadas = [...nextProgress.aprobadas, subjectId];
        nextProgress.regulares = nextProgress.regulares.filter(id => id !== subjectId);
      }
    } else if (state === 'regulares') {
      if (nextProgress.regulares.includes(subjectId)) {
        nextProgress.regulares = nextProgress.regulares.filter(id => id !== subjectId);
      } else {
        nextProgress.regulares = [...nextProgress.regulares, subjectId];
        nextProgress.aprobadas = nextProgress.aprobadas.filter(id => id !== subjectId);
      }
    }
    
    setUserProgress(nextProgress);
    
    const userRef = doc(db, 'users', user.uid);
    updateDoc(userRef, { progress: nextProgress }).catch(e => console.error("Error updating progress", e));

    // Check if this action completed the entire year as approved
    if (state === 'aprobadas' && nextProgress.aprobadas.includes(subjectId)) {
      const subject = career.curriculum.find(s => s.id === subjectId);
      if (subject && !subject.isElectiva) {
        const yearSubjects = career.curriculum.filter(s => s.year === subject.year && !s.isElectiva);
        const allApproved = yearSubjects.every(s => hasProgressId(nextProgress.aprobadas, s.id));
        if (allApproved) {
          setCelebrationModal({ isOpen: true, year: subject.year });
        }
      }
    }
  };

  const [hoveredSubject, setHoveredSubject] = useState<string | number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | 'electivas'>(1);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset seleccion si cambiamos de carrera
  useEffect(() => {
    setSelectedSubject(null);
    setSelectedYear(1);
  }, [career.id]);

  // Bloquear el scroll de la página cuando el panel está abierto
  useScrollLock(!!selectedSubject);

  // Group by year
    const subjectsByYear = useMemo(() => {
    const years: { [key: string]: Subject[] } = {};
    for (let i = 1; i <= career.years; i++) years[i] = [];
    years['electivas'] = [];
    career.curriculum.forEach(s => {
      if (s.isElectiva) {
        years['electivas'].push(s);
      } else if (s.semester === 'Electiva' || s.name === 'Materias Electivas') {
        // Skip placeholder cards
      } else if (years[s.year]) {
        years[s.year].push(s);
      }
    });
    return years;
  }, [career]);

  const yearsOptions = [
    ...Array.from({ length: career.years }, (_, i) => i + 1),
    ...(subjectsByYear['electivas'] && subjectsByYear['electivas'].length > 0 ? ['electivas'] : [])
  ];

  const displayedYears = Object.entries(subjectsByYear).filter(([yearStr]) =>
    yearStr === 'electivas' ? selectedYear === 'electivas' : Number(yearStr) === selectedYear
  );
  const hoveredData = hoveredSubject ? career.curriculum.find(s => s.id === hoveredSubject) : null;
  const hoveredRegulares = new Set(hoveredData?.regulares || []);
  const hoveredAprobadas = new Set(hoveredData?.aprobadas || []);
  const preferredCareer = profileSummary.preferredCareerId ? planesData[profileSummary.preferredCareerId as keyof typeof planesData] : null;
  const providerLabel = profileSummary.providerId === 'google.com' ? 'Google' : profileSummary.providerId === 'password' ? 'Email/Contraseña' : 'No detectado';
  const roleLabel = profileSummary.role === 'admin' ? 'Administrador' : profileSummary.role === 'moderator' ? 'Moderador' : 'Usuario';

  const YearCelebrationModal = ({ 
    isOpen, 
    onClose, 
    userName, 
    year 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    userName: string; 
    year: number | string 
  }) => {
    if (!isOpen) return null;

    return createPortal(
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-zinc-900/60 backdrop-blur-md" 
          onClick={onClose}
        />
        <div className="relative bg-white border-8 border-zinc-900 shadow-[16px_16px_0px_0px_rgba(16,185,129,1)] max-w-md w-full p-10 text-center overflow-hidden">
          {/* Brutalist Decor */}
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-400" />
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400 border-l-4 border-b-4 border-zinc-900 -rotate-12 translate-x-4 -translate-y-4" />
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] flex items-center justify-center mb-8 mx-auto rotate-3">
              <Trophy className="w-12 h-12 text-emerald-500" strokeWidth={3} />
            </div>

            <h2 className="text-4xl font-black text-zinc-900 mb-4 uppercase tracking-tighter italic">
              ¡Año {year} <span className="text-emerald-500 underline decoration-8">Completado</span>!
            </h2>
            
            <p className="text-sm font-bold text-zinc-500 mb-8 uppercase tracking-widest leading-relaxed">
              Felicitaciones <span className="text-zinc-900 underline decoration-zinc-900 underline-offset-4">{userName}</span>. Cada vez estás más cerca de tu objetivo académico. Seguí así, ¡el esfuerzo vale la pena! 
            </p>

            <button
              onClick={onClose}
              className="w-full bg-zinc-900 text-white font-black uppercase tracking-widest text-lg px-8 py-5 border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] transition-all duration-300 ease-out hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(16,185,129,1)] active:translate-y-[8px] active:translate-x-[8px] active:shadow-none"
            >
              ¡VAMOS POR MÁS!
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

    return (
      <div className="flex flex-col lg:flex-row h-full w-full relative">
      {/* Main Grid View */}
      <div className={cn(
        "flex-grow overflow-x-auto p-4 sm:p-6 lg:p-8 custom-scrollbar transition-[padding-right] duration-300",
        selectedSubject && "lg:pr-[38rem]"
      )}>
        
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6 lg:mb-8 pb-6 border-b-4 border-zinc-900">
          <div className="space-y-2 max-w-3xl animate-slide-right-neo" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-400 border-4 border-zinc-900 flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]">
                <GraduationCap className="w-5 h-5 text-zinc-900" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 uppercase tracking-tighter italic leading-none">Estructura del Plan</h2>
                <p className="text-xs sm:text-sm font-bold text-zinc-600 mt-2">
                  {career.curriculum.filter(s => !s.isElectiva).length} troncales{career.requiredElectiveHours ? ` + ${career.requiredElectiveHours} hs electivas` : ''}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(() => {
                const coreSubjects = career.curriculum.filter(s => !s.isElectiva);
                const electiveSubjects = career.curriculum.filter(s => s.isElectiva);
                const approvedCore = coreSubjects.filter(s => hasProgressId(userProgress.aprobadas, s.id)).length;

                if (career.requiredElectiveHours) {
                  const approvedHs = electiveSubjects.filter(s => hasProgressId(userProgress.aprobadas, s.id)).reduce((acc, s) => acc + (s.weekly_hours || s.total_hours || 0), 0);
                  const remainingCore = coreSubjects.length - approvedCore;
                  return (
                    <>
                      <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 bg-emerald-400 px-3 py-1.5 border-2 border-zinc-900 inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {approvedCore} / {coreSubjects.length}
                      </span>
                      {remainingCore > 0 && (
                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 bg-yellow-400 px-3 py-1.5 border-2 border-zinc-900 inline-flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> {remainingCore} restantes
                        </span>
                      )}
                      <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 bg-white px-3 py-1.5 border-2 border-zinc-900 inline-flex items-center gap-1.5">
                        <Atom className="w-3.5 h-3.5 text-emerald-500" /> {approvedHs} hs electivas
                      </span>
                    </>
                  );
                }

                const careerSubjectIds = new Set(career.curriculum.map(s => s.id));
                const approvedInCareer = countProgressIds(userProgress.aprobadas, Array.from(careerSubjectIds));
                const remaining = career.curriculum.length - approvedInCareer;
                return (
                  <>
                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 bg-emerald-400 px-3 py-1.5 border-2 border-zinc-900 inline-flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {approvedInCareer} aprobadas
                    </span>
                    {remaining > 0 && (
                      <span className="text-[11px] font-black uppercase tracking-widest text-zinc-900 bg-yellow-400 px-3 py-1.5 border-2 border-zinc-900 inline-flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> {remaining} restantes
                      </span>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto xl:mr-2">
            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar bg-white border-4 border-zinc-900 p-1 max-w-full animate-slide-right-neo" style={{ animationDelay: '300ms' }}>
              {yearsOptions.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year as number | 'electivas')}
                  className={cn(
                    "px-4 sm:px-5 py-2 text-xs sm:text-sm font-black uppercase tracking-widest border-2 border-zinc-900 whitespace-nowrap transition-all",
                    selectedYear === year
                      ? "bg-emerald-400 text-zinc-900"
                      : "bg-white text-zinc-600 hover:bg-zinc-100"
                  )}
                >
                  {year === 'electivas' ? 'Electivas' : `Año ${year}`}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                const previewWindow = window.open('', '_blank');

                if (!previewWindow) return;

                previewWindow.focus();
                previewWindow.document.write(`
                  <title>Generando PDF...</title>
                  <body style="margin:0;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#fcf9f4;color:#3d3229;">
                    <p style="font-size:16px;font-weight:600;">Generando plan de estudio...</p>
                  </body>
                `);
                import('@/lib/pdfGenerator').then(({ generateStudyPlanPDF }) => {
                  generateStudyPlanPDF(career, career.curriculum).then(url => {
                    previewWindow.location.href = url;
                  });
                }).catch(error => {
                  console.error('Error generando el PDF', error);
                  previewWindow.close();
                });
              }}
              className="flex shrink-0 items-center justify-center gap-2 bg-zinc-900 text-white px-4 py-2.5 border-4 border-zinc-900 text-[11px] sm:text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all duration-300 hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none animate-slide-right-neo" style={{ animationDelay: '400ms' }}
            >
              <FileText className="w-3.5 h-3.5" strokeWidth={3} />
              Descargar Plan
            </button>
          </div>
        </div>


        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-8 px-6 py-4 bg-white border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] w-fit">
          <span className="text-xs font-black text-zinc-900 uppercase tracking-[0.15em] mr-2">Sistema de Control</span>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-emerald-400 border-2 border-zinc-900 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-zinc-900" strokeWidth={3} />
            </div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-900">Puedes Cursar</span>
          </div>
          <div className="w-1.5 h-1.5 bg-zinc-900 hidden sm:block"></div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-yellow-400 border-2 border-zinc-900 flex items-center justify-center">
              <Lock className="w-4 h-4 text-zinc-900" strokeWidth={3} />
            </div>
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-zinc-900">Bloqueada</span>
          </div>
        </div>

        {/* Years Grid */}
        <div className={`flex flex-col gap-6 pb-8 ${selectedSubject ? 'mb-0 lg:mb-0' : ''}`}>
          {displayedYears.map(([yearStr, subjects]) => (
            <div key={yearStr} className="flex flex-col gap-4 w-full">
              <div className={`grid gap-4 pr-3 pb-3 ${
                selectedSubject 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
              }`}>
                {subjects.map((subject, index) => {
                  const isSelected = selectedSubject?.id === subject.id;

                   const isApproved = hasProgressId(userProgress.aprobadas, subject.id);
                   const isRegular = hasProgressId(userProgress.regulares, subject.id);
                  const isReqOfHovered = hoveredData ? hoveredRegulares.has(subject.id) : false;
                  const unlocksHovered = hoveredData ? hoveredAprobadas.has(subject.id) : false;

                  let canTake = false;
                  if (user && !isApproved && !isRegular && subject.name !== "Materias Electivas") {
                     const missingAprobadas = subject.aprobadas.some((id: string | number) => !hasProgressId(userProgress.aprobadas, id));
                     const missingRegulares = subject.regulares.some((id: string | number) => !hasProgressId(userProgress.aprobadas, id) && !hasProgressId(userProgress.regulares, id));
                    canTake = !missingAprobadas && !missingRegulares;
                  }

                  let cardStyle = "bg-white border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]";
                  let iconColor = "text-zinc-900";
                  let spanClass = "";

                  if (isApproved) {
                    cardStyle = "bg-emerald-400 border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] opacity-90 grayscale-[0.3]";
                  } else if (isRegular) {
                    cardStyle = "bg-yellow-400 border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] opacity-90";
                  } else if (user && subject.name !== "Materias Electivas") {
                    if (canTake) {
                      cardStyle = "bg-white border-4 border-emerald-500 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]";
                      iconColor = "text-emerald-500";
                    } else {
                      cardStyle = "bg-white border-4 border-yellow-400 shadow-[4px_4px_0px_0px_rgba(250,204,21,1)] opacity-95";
                      iconColor = "text-zinc-900";
                    }
                  }

                  if (subject.name === "Materias Electivas") {
                    spanClass = "col-span-full border-dashed border-4 border-zinc-400";
                  }

                  if (isReqOfHovered || unlocksHovered || isSelected) {
                    cardStyle = cardStyle.replace('shadow-[4px_4px_0px_0px', 'shadow-[8px_8px_0px_0px');
                    cardStyle += " -translate-y-1 -translate-x-1 z-10 animate-wiggle-neo";
                  }

                  return (
                    <div 
                      key={subject.id}
                      role="button"
                      onMouseEnter={() => setHoveredSubject(subject.id)}
                      onMouseLeave={() => setHoveredSubject(null)}
                      onClick={() => setSelectedSubject(subject)}
                      style={{ animationDelay: `${index * 35}ms` }}
                      className={`
                        relative p-5 transition-all duration-300 group min-h-[140px] flex flex-col overflow-hidden animate-pop-in-neo
                        hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none
                        ${cardStyle}
                        ${spanClass}
                      `}
                    >
                      {/* Watermark Labels */}
                      {isApproved && (
                        <SubjectStatusRibbon label="APROBADA" tone="approved" />
                      )}

                      {isRegular && !isApproved && (
                        <SubjectStatusRibbon label="REGULAR" tone="regular" />
                      )}

                      <div className="flex items-start justify-between mb-3 relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black font-mono text-zinc-900 bg-zinc-100 border-2 border-zinc-900 px-2 py-0.5">
                            ID {subject.id.toString().padStart(3, '0')}
                          </span>
                          {subject.semester && subject.semester !== 'Electiva' && (
                            <span className={`
                              text-[10px] font-black uppercase tracking-widest px-2 py-0.5 border-2 border-zinc-900
                              ${subject.semester === 'Anual'
                                ? 'bg-purple-400 text-zinc-900'
                                : subject.semester.includes('1')
                                  ? 'bg-emerald-400 text-zinc-900'
                                  : 'bg-yellow-400 text-zinc-900'
                              }
                            `}>
                              {subject.semester === 'Anual' ? 'Anual' : subject.semester.includes('1') ? '1C' : '2C'}
                            </span>
                          )}
                        </div>
                        <div className="shrink-0">{getSubjectIcon(subject.name, `w-6 h-6 ${iconColor} group-hover:scale-125 group-hover:-rotate-12 group-hover:animate-wiggle-neo transition-all duration-300 ease-out`)}</div>
                      </div>

                      <div className="relative z-10 flex flex-col gap-1">
                        <h4 className="font-black text-sm uppercase tracking-tight leading-tight text-zinc-900">
                          {subject.name}
                        </h4>
                        {subject.note && (
                          <p className="text-[10px] uppercase tracking-widest font-black text-emerald-600">
                            {subject.note}
                          </p>
                        )}
                      </div>

                      {/* Hover action hint & Rating */}
                      <div className="relative z-10 mt-4 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!user) {
                              setShowLoginPrompt(true);
                            } else {
                              openRatingModal(subject);
                            }
                          }}
                          className={`
                            flex items-center gap-1.5 px-2.5 py-1.5  text-[11px] font-bold transition-all duration-150 z-20 border
                            ${globalRatings[subject.id] 
                              ? 'bg-zinc-50 text-zinc-900 border-zinc-300 hover:bg-zinc-100 hover:border-emerald-500/50' 
                              : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-50 hover:text-emerald-500 hover:border-zinc-300'}
                          `}
                        >
                          {!globalRatings[subject.id] ? (
                            <>
                              <Star className="w-3.5 h-3.5" />
                              <span className="hidden @[160px]:inline">Calificar</span>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-amber-600">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                {globalRatings[subject.id].diffAvg.toFixed(1)}
                              </span>
                              <span className="w-1 h-1  bg-emerald-100" />
                              <span className="flex items-center gap-1 text-emerald-500">
                                <Sparkles className="w-3.5 h-3.5" />
                                {globalRatings[subject.id].utilAvg.toFixed(1)}
                              </span>
                              <span className="w-1 h-1  bg-emerald-100" />
                              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
                                {globalRatings[subject.id].count} {globalRatings[subject.id].count === 1 ? 'voto' : 'votos'}
                              </span>
                            </div>
                          )}
                        </button>

                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-emerald-500 opacity-0 group-hover:opacity-100 transition-all duration-150 translate-y-2 group-hover:translate-y-0 text- pointer-events-none whitespace-nowrap overflow-hidden">
                          <Info className="w-3 h-3 flex-shrink-0" /> <span className="hidden @[220px]:inline">Ver correlativas</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bulk Actions for the year */}
              {yearStr !== 'electivas' && user && (
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center justify-between gap-4 mt-6 px-5 py-4 bg-white border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-zinc-900" strokeWidth={3} />
                    <p className="text-[11px] sm:text-xs font-black text-zinc-900 uppercase tracking-widest">Acciones rápidas del año</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => handleBulkToggle(subjects, 'regulares')}
                      className="flex-1 sm:flex-none text-[10px] sm:text-[11px] font-black text-zinc-900 uppercase tracking-widest bg-yellow-400 px-4 py-2 border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" strokeWidth={3} /> Regularizar Año
                    </button>
                    <button
                      onClick={() => handleBulkToggle(subjects, 'aprobadas')}
                      className="flex-1 sm:flex-none text-[10px] sm:text-[11px] font-black text-zinc-900 uppercase tracking-widest bg-emerald-400 px-4 py-2 border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" strokeWidth={3} /> Aprobar Año
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Subject Detail Sidebar - Neo-Brutalist Drawer */}
      {selectedSubject && (
        <>
          {/* Overlay */}
          <div
            onClick={() => setSelectedSubject(null)}
            className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[90]"
          />
          
          {/* Drawer Panel */}
          <div className="fixed right-0 top-[88px] h-[calc(100vh-88px)] w-full max-w-full sm:max-w-xl bg-white border-l-8 border-zinc-900 z-[1000] shadow-[-12px_0px_0px_0px_rgba(24,24,27,1)] flex flex-col overflow-hidden">
              {/* Header */}
              <div className="p-6 sm:p-8 pb-5 sm:pb-6 border-b-4 border-zinc-900 bg-zinc-50 relative overflow-visible shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400 rotate-45 translate-x-16 -translate-y-16 border-l-4 border-zinc-900 opacity-20" />
                
                <button 
                  onClick={() => setSelectedSubject(null)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white border-4 border-zinc-900 hover:bg-red-400 transition-colors shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  <X className="w-6 h-6" strokeWidth={3} />
                </button>

                <div className="space-y-4 pr-10 sm:pr-12 pb-2 sm:pb-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <span className="px-3 py-1 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest">
                      Nivel {selectedSubject.year}
                    </span>
                    <span className="px-3 py-1 bg-emerald-400 border-2 border-zinc-900 text-zinc-900 text-[10px] font-black uppercase tracking-widest">
                      {selectedSubject.id}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 uppercase tracking-tighter leading-[1] break-words max-w-[18ch] sm:max-w-none">
                    {selectedSubject.name}
                  </h2>
                </div>
              </div>

              {/* Body */}
              <div className="flex-grow overflow-y-auto p-5 sm:p-8 space-y-8 sm:space-y-10 custom-scrollbar min-h-0">
                <InteractiveProgressButtons 
                  subject={selectedSubject} 
                  userProgress={userProgress} 
                  onToggle={handleToggleState} 
                  user={user}
                  setShowLoginPrompt={setShowLoginPrompt}
                />

                {/* Information Grid */}
                {(selectedSubject.weekly_hours || selectedSubject.total_hours) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedSubject.weekly_hours && (
                      <div className="bg-zinc-50 border-4 border-zinc-900 p-4 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Horas Semanales</span>
                        <span className="text-xl font-black text-zinc-900">{selectedSubject.weekly_hours}hs</span>
                      </div>
                    )}
                    {selectedSubject.total_hours && (
                      <div className="bg-zinc-50 border-4 border-zinc-900 p-4 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Horas Totales</span>
                        <span className="text-xl font-black text-zinc-900">{selectedSubject.total_hours}hs</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Requirements */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                    <Binary className="w-4 h-4" strokeWidth={3} /> CORRELATIVAS
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white border-4 border-zinc-900 p-5 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4 block">Para cursar necesitás (Regulares):</span>
                      {selectedSubject.regulares.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedSubject.regulares.map(id => {
                            const s = career.curriculum.find(subj => subj.id === id);
                            return s ? (
                                <button key={id} onClick={() => setSelectedSubject(s)} className="px-3 py-1.5 bg-zinc-100 border-2 border-zinc-900 text-[10px] font-bold uppercase hover:bg-yellow-400 transition-colors max-w-full break-words">
                                {s.name}
                              </button>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <p className="text-[10px] font-black uppercase text-zinc-300 italic">Sin requisitos previos</p>
                      )}
                    </div>

                    <div className="bg-white border-4 border-zinc-900 p-5 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 block">Para cursar necesitás (Aprobadas):</span>
                      {selectedSubject.aprobadas.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedSubject.aprobadas.map(id => {
                            const s = career.curriculum.find(subj => subj.id === id);
                            return s ? (
                                <button key={id} onClick={() => setSelectedSubject(s)} className="px-3 py-1.5 bg-zinc-100 border-2 border-zinc-900 text-[10px] font-bold uppercase hover:bg-emerald-400 transition-colors max-w-full break-words">
                                {s.name}
                              </button>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <p className="text-[10px] font-black uppercase text-zinc-300 italic">Sin requisitos previos</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ratings Summary */}
                <div className="bg-zinc-900 text-white border-4 border-zinc-900 p-8 shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-400">Insights de la Comunidad</h3>
                    <button 
                      onClick={() => openRatingModal(selectedSubject)}
                      className="text-[10px] font-black uppercase underline decoration-emerald-400 underline-offset-4 hover:text-emerald-400 transition-colors"
                    >
                      CALIFICAR MATERIA
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <ShieldAlert className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">DIFICULTAD</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black italic">{globalRatings[selectedSubject.id]?.diffAvg.toFixed(1) || '0.0'}</span>
                        <span className="text-xs font-bold text-zinc-500">/ 5.0</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">UTILIDAD</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black italic text-emerald-400">{globalRatings[selectedSubject.id]?.utilAvg.toFixed(1) || '0.0'}</span>
                        <span className="text-xs font-bold text-zinc-500">/ 5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 sm:p-6 border-t-4 border-zinc-900 bg-zinc-50 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => {
                    setSearchTerm(selectedSubject.year.toString());
                    setSelectedSubject(null);
                  }}
                  className="flex-1 py-4 bg-white border-4 border-zinc-900 text-zinc-900 font-black uppercase tracking-widest text-xs shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <Layout className="w-4 h-4" strokeWidth={3} />
                  Materias del Nivel
                </button>
                <button 
                  onClick={() => setSelectedSubject(null)}
                  className="px-6 py-4 bg-zinc-900 text-white font-black uppercase tracking-widest text-xs hover:bg-emerald-400 hover:text-zinc-900 transition-colors border-4 border-zinc-900"
                >
                  CERRAR
                </button>
              </div>
          </div>
        </>
      )}

      {/* Celebration Modal */}
      <YearCelebrationModal
        isOpen={celebrationModal.isOpen}
        onClose={() => setCelebrationModal({ ...celebrationModal, isOpen: false })}
        userName={user?.displayName?.split(' ')[0] || 'estudiante'}
        year={celebrationModal.year}
      />
    </div>
  );
}
