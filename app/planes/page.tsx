"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calculator, Atom, BookOpen, Binary, Cpu, Network, Database, 
  Building2, FlaskConical, Zap, ArrowLeft, FileText, Calendar, Star, LogIn, ShieldAlert,
  CheckCircle2, AlertTriangle, Unlock, Info, Layers, Sparkles, X,
  Code2, LineChart, Briefcase, ShieldCheck, GraduationCap, Lock, Trophy, Rocket
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

type SubjectId = string | number;
type UserProgress = { aprobadas: SubjectId[]; regulares: SubjectId[] };
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
      ? 'bg-gradient-to-r from-[#6B8A72] via-[#8BAA91] to-[#4A7A52] shadow-[0_16px_32px_-18px_rgba(74,122,82,0.85)]'
      : 'bg-gradient-to-r from-[#C4A87D] via-[#D4856A] to-[#A9634C] shadow-[0_16px_32px_-18px_rgba(180,111,86,0.85)]';

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-300 opacity-100 group-hover:opacity-0 drop-shadow-[0_14px_18px_rgba(61,50,41,0.12)] overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 flex w-[146%] -translate-x-1/2 -translate-y-1/2 items-center justify-center select-none animate-stamp"
      >
        <div
          className={`relative flex w-full items-center justify-center overflow-hidden rounded-[1.35rem] border-t-2 border-b-4 border-white/75 px-4 text-center font-black uppercase whitespace-nowrap text-[#FFFBF7] ring-1 ring-white/45 ${toneClasses}`}
          style={{
            fontSize: 'clamp(0.72rem, 5.6cqw, 1.75rem)',
            paddingTop: 'clamp(0.35rem, 1cqw, 0.6rem)',
            paddingBottom: 'clamp(0.35rem, 1cqw, 0.6rem)',
            letterSpacing: '0',
            textShadow: '0 2px 10px rgba(61,50,41,0.28)',
          }}
        >
          <span className="absolute inset-0 bg-[linear-gradient(100deg,rgba(255,255,255,0.26)_0%,rgba(255,255,255,0.08)_44%,rgba(255,255,255,0)_100%)]" />
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
  const isApproved = user ? userProgress.aprobadas.includes(subject.id) : false;
  const isRegular = user ? userProgress.regulares.includes(subject.id) : false;

  const missingAprobadas = subject.aprobadas.some((id: string | number) => !userProgress.aprobadas.includes(id));
  const missingRegulares = subject.regulares.some((id: string | number) => !userProgress.aprobadas.includes(id) && !userProgress.regulares.includes(id));
  const canTake = !missingAprobadas && !missingRegulares;

  const handleAction = (type: 'aprobadas' | 'regulares') => {
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }
    onToggle(subject.id, type);
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-[#E8F0EA] shadow-sm flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-bold uppercase text-[#A0A0A0]">Mi Progreso</h4>
          {!isApproved && !isRegular && (
            canTake 
              ? <span className="text-[10px] font-bold px-2 py-0.5 rounded text-[#388E3C] bg-[#E8F5E9] border border-[#388E3C]/20">Puedes cursarla</span>
              : <span className="text-[10px] font-bold px-2 py-0.5 rounded text-[#D4856A] bg-[#FFF9F2] border border-[#D4856A]/20">Aún no podés cursarla</span>
          )}
        </div>
        {(isApproved || isRegular) && user && (
          <button
            onClick={() => handleAction(isApproved ? 'aprobadas' : 'regulares')}
            className="text-[10px] sm:text-xs font-bold text-[#D4856A] hover:bg-[#FFF9F2] px-2 py-1 flex items-center gap-1 rounded-md transition-colors"       
          >
            <X className="w-3 h-3" /> Desmarcar
          </button>
        )}
      </div>
      <div className="flex gap-2 w-full">
        <button
          onClick={() => handleAction('aprobadas')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
            ${isApproved ? 'bg-[#E8F5E9] text-[#388E3C] ring-1 ring-[#388E3C]/50 shadow-sm' : 'bg-[#FAFAFA] text-[#7A6E62] hover:bg-[#F5F0EA]'}
          `}
        >
          <CheckCircle2 className="w-4 h-4" /> Aprobada
        </button>
        <button
          onClick={() => handleAction('regulares')}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all
            ${isRegular ? 'bg-[#FFF3E0] text-[#E65100] ring-1 ring-[#E65100]/50 shadow-sm' : 'bg-[#FAFAFA] text-[#7A6E62] hover:bg-[#F5F0EA]'}
          `}
        >
          <AlertTriangle className="w-4 h-4" /> Regular
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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
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

  const openRatingModal = (subject: Pick<Subject, 'id' | 'name'>) => {
    setRatingModalCareer(activeCareer.id);
    setRatingModalSubject({ id: String(subject.id), name: subject.name });
  };

  const handleRatingUpdated = () => {
    refreshGlobalRatings();
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden text-[#3D3229] w-full">
      {/* Dynamic Background Effect */}
      <div 
        ref={bgRef}
        className="fixed inset-0 opacity-[0.25] pointer-events-none transition-opacity duration-300 z-0"
        style={{
          background: `radial-gradient(circle 100vh at 50% 0%, ${activeCareer.name === 'Ingeniería en Sistemas' ? 'rgba(139, 170, 145, 0.4)' : activeCareer.name === 'Ingeniería Civil' ? 'rgba(212, 133, 106, 0.3)' : activeCareer.name === 'Ingeniería Química' ? 'rgba(124, 194, 168, 0.3)' : 'rgba(160, 160, 160, 0.3)'}, transparent)`
        }}
      />
      
      {/* Soft Grid Pattern */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.4]  pointer-events-none z-0"></div>

      {/* Main Content */}
      <div ref={containerRef} className="flex-grow flex flex-col pt-12 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-8 mb-12">
          <div className="space-y-4 max-w-2xl">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#8BAA91] hover:text-[#7CC2A8] font-medium transition-colors mb-2">
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A1A1A]">
              Planes de <span className={`text-transparent bg-clip-text bg-gradient-to-r ${activeCareer.color}`}>Estudio Interactivos</span>
            </h1>
            <p className="text-lg text-[#5C5C5C] leading-relaxed">
              Explorá la currícula de tu carrera, su estructura por años y el diagrama de correlatividades habilitantes.
            </p>
          </div>
          
          {/* Career Selector */}
          <div className="flex bg-[#FCFBFA] p-2 rounded-2xl flex-wrap justify-start items-center border border-[#E8F0EA] shadow-sm w-fit gap-2 relative z-20">
            {careerOptions.map((career) => {
              const isActive = activeCareer.id === career.id;
              return (
                <button
                  key={career.id}
                  onClick={() => setActiveCareer(career)}
                  className={`
                    relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 flex items-center gap-2.5 active:scale-95
                    ${isActive 
                      ? 'bg-white text-[#3D3229] shadow-md shadow-[#8BAA91]/10 ring-1 ring-[#8BAA91]/40 z-10 scale-[1.02]' 
                      : 'text-[#7A6E62] hover:text-[#3D3229] hover:bg-white/60 hover:-translate-y-0.5'
                    }
                  `}
                >
                  <div className={`flex items-center justify-center p-1.5 rounded-lg transition-colors ${isActive ? `bg-gradient-to-r ${career.color} text-white shadow-sm` : 'bg-[#F5F0EA] text-[#8BAA91]'}`}>
                     {React.cloneElement(career.icon as React.ReactElement<{ className?: string }>, { className: "w-4 h-4" })}
                  </div>
                  {career.shortName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Curriculum Viewer Container */}
        <div className="flex-grow relative flex flex-col min-h-[600px] mb-8">
          <div className="absolute inset-0 bg-white border-b shadow-sm rounded-3xl border border-[#E8F0EA] shadow-xl pointer-events-none z-0" />
          <div className="relative z-10 flex-grow flex flex-col min-h-[600px] rounded-3xl overflow-hidden">
            <CurriculumViewer
              career={activeCareer}
              globalRatings={globalRatings}
              openRatingModal={openRatingModal}
              setShowLoginPrompt={setShowLoginPrompt}
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
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowLoginPrompt(false)}
          />
          <div className="relative bg-white rounded-3xl border border-[#EDE6DD] shadow-2xl max-w-sm w-full outline-none transform transition-all overflow-hidden animate-fade-in-scale p-6 text-center mx-4">
            <div className="w-14 h-14 bg-[#F5F0EA] rounded-2xl flex items-center justify-center mb-6 shadow-inner text-[#D4856A] mx-auto">
              <LogIn className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-[#3D3229] mb-2 tracking-tight">Iniciá sesión</h3>
            <p className="text-sm font-medium text-[#7A6E62] mb-6">
              Para calificar materias y ayudar a otros estudiantes, necesitas tener una cuenta. ¡Es gratis y rápido!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-[#7A6E62] border border-[#EDE6DD] hover:bg-[#FAFAF8] transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={() => router.push('/auth')}
                className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#1A1A1A] hover:bg-[#3D3229] transition-all shadow-lg active:scale-95"
              >
                Ingresar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
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
};

const CurriculumViewer = ({
  career,
  globalRatings,
  openRatingModal,
  setShowLoginPrompt,
}: CurriculumViewerProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [userProgress, setUserProgress] = useState<UserProgress>({ aprobadas: [], regulares: [] });
  const [profileSummary, setProfileSummary] = useState<UserProfileSummary>({});
  const [celebrationModal, setCelebrationModal] = useState<{ isOpen: boolean; year: string | number }>({ isOpen: false, year: '' });

  useEffect(() => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as UserProfileSummary & { progress?: UserProgress };
          setUserProgress(data.progress || { aprobadas: [], regulares: [] });
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
        console.error("Error al leer el progreso:", error);
      });
    } else {
      setUserProgress({ aprobadas: [], regulares: [] });
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
        const allApproved = yearSubjects.every(s => nextProgress.aprobadas.includes(s.id));
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

  // Bloquear el scroll de la página en celulares cuando el modal está abierto (Fix iOS)
  // Utilizamos el hook global para tener un comportamiento estandarizado entre Android e iOS
  // y prevenir problemas con el Header donde position=fixed resetearía el scrollY
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useScrollLock(!!selectedSubject && isMobile);

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

    return (
      <div className="flex flex-col lg:flex-row h-full w-full relative">
      {/* Main Grid View */}
      <div className="flex-grow overflow-x-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
        
        {/* Simple header inside viewer */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between mb-6 lg:mb-8 pb-6 border-b border-[#E8F0EA] gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-[#F5F0EA] flex items-center justify-center text-[#8BAA91] shadow-inner shrink-0">
                <GraduationCap className="w-5 h-5 lg:w-6 lg:h-6" />
              </div>
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-[#1A1A1A]">Estructura del Plan</h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <p className="text-xs lg:text-sm font-medium text-[#5C5C5C]">
                    {career.curriculum.filter(s => !s.isElectiva).length} troncales {career.requiredElectiveHours ? ` + ${career.requiredElectiveHours} hs electivas` : ''}
                  </p>
                  
                  {user ? (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E8F0EA] hidden sm:block"></div>
                      {(() => {
                        const coreSubjects = career.curriculum.filter(s => !s.isElectiva);
                        const electiveSubjects = career.curriculum.filter(s => s.isElectiva);
                        const approvedCore = coreSubjects.filter(s => userProgress.aprobadas.includes(s.id)).length;
                        
                        if (career.requiredElectiveHours) {
                           const approvedHs = electiveSubjects
                            .filter(s => userProgress.aprobadas.includes(s.id))
                            .reduce((acc, s) => acc + (s.weekly_hours || s.total_hours || 0), 0);
                            
                          const remainingCore = coreSubjects.length - approvedCore;
                            
                          return (
                            <div className="flex flex-wrap items-center gap-2">
                               <span className="text-[11px] lg:text-xs font-bold text-[#388E3C] bg-[#E8F5E9] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-[#388E3C]/20"><CheckCircle2 className="w-3.5 h-3.5" /> Troncales: {approvedCore} / {coreSubjects.length}</span>
                               {remainingCore > 0 && <span className="text-[11px] lg:text-xs font-bold text-[#D4856A] bg-[#FFF9F2] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-[#D4856A]/20"><AlertTriangle className="w-3.5 h-3.5" /> {remainingCore} restantes</span>}
                               
                               <span className="text-[11px] lg:text-xs font-bold text-[#8BAA91] bg-[#F5F9F6] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-[#8BAA91]/20"><Atom className="w-3.5 h-3.5" /> Electivas: {approvedHs} / {career.requiredElectiveHours} hs</span>
                            </div>
                          );
                        } else {
                          const careerSubjectIds = new Set(career.curriculum.map(s => s.id));
                          const approvedInCareer = userProgress.aprobadas.filter(id => careerSubjectIds.has(id)).length;
                          const remaining = career.curriculum.length - approvedInCareer;
                          
                          return (
                            <div className="flex flex-wrap items-center gap-2">
                               <span className="text-[11px] lg:text-xs font-bold text-[#388E3C] bg-[#E8F5E9] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-[#388E3C]/20"><CheckCircle2 className="w-3.5 h-3.5" /> {approvedInCareer} aprobadas</span>
                               {remaining > 0 && <span className="text-[11px] lg:text-xs font-bold text-[#D4856A] bg-[#FFF9F2] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-[#D4856A]/20"><AlertTriangle className="w-3.5 h-3.5" /> {remaining} restantes</span>}
                            </div>
                          );
                        }
                      })()}
                    </>
                  ) : (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#E8F0EA] hidden sm:block"></div>
                      <span className="text-[11px] lg:text-xs font-bold text-[#A0A0A0] bg-[#FAFAFA] px-2 py-1 rounded-md flex items-center gap-1 shadow-sm border border-[#E8F0EA] border-dashed"><LogIn className="w-3.5 h-3.5" /> Logueate para llevar tu progreso y horas electivas</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Download PDF Button */}
            <button
              onClick={() => {
                const previewWindow = window.open('', '_blank');

                if (!previewWindow) {
                  return;
                }

                previewWindow.focus();

                previewWindow.document.write(`
                  <title>Generando PDF...</title>
                  <body style="margin:0;display:flex;align-items:center;justify-content:center;font-family:system-ui,sans-serif;background:#fcf9f4;color:#3d3229;">
                    <p style="font-size:16px;font-weight:600;">Generando plan de estudio...</p>
                  </body>
                `);
                previewWindow.document.close();

                import('@/lib/pdfGenerator').then(async (mod) => {
                  const pdfUrl = await mod.generateStudyPlanPDF(career, career.curriculum.filter(s => !s.isElectiva));
                  previewWindow.location.href = pdfUrl;
                }).catch((error) => {
                  console.error('Error generando el PDF', error);
                  previewWindow.close();
                });
              }}
              className="flex items-center justify-center gap-2 bg-[#1A1A1A] hover:bg-[#3D3229] text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#1A1A1A]/20 transition-all duration-150 hover:-translate-y-1 group w-full sm:w-auto"
            >
              <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Descargar Plan</span>
            </button>
          </div>

          {/* Year Selector */}
          <div className="flex bg-[#F5F0EA]/50 p-1 rounded-xl overflow-x-auto custom-scrollbar w-full xl:w-auto mt-2 xl:mt-0">
            {yearsOptions.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year as number | 'electivas')}
                className={`
                  relative px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 whitespace-nowrap active:scale-95 flex-1 xl:flex-none text-center
                  ${selectedYear === year 
                    ? 'bg-white text-[#3D3229] shadow-md shadow-[#8BAA91]/10 ring-1 ring-[#8BAA91]/30 z-10 scale-105 xl:scale-[1.05]' 
                    : 'text-[#7A6E62] hover:text-[#3D3229] hover:bg-white'
                  }
                `}
              >
                {year === 'electivas' ? 'Electivas' : `Año ${year}`}
              </button>
            ))}
          </div>
        </div>


        {/* Status References */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-8 px-5 py-3.5 bg-gradient-to-r from-[#F4FBFA]/90 to-[#FFF5F5]/90 rounded-2xl border border-[#E8F0EA] shadow-sm w-fit border-l-4 border-l-[#8BAA91]">
          <span className="text-[10px] font-black text-[#8BAA91] uppercase tracking-[0.15em] mr-2">Referencias</span>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#F4FBFA] border-2 border-[#8BAA91] shadow-inner flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#8BAA91]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#3D3229]">Puedes Cursar</span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-[#D4856A]/20 hidden sm:block"></div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-[#FFF5F5] border-2 border-[#D4856A] shadow-inner flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-[#D4856A]" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#3D3229]">Bloqueada</span>
          </div>
        </div>

        {/* Years Grid */}
        <div className={`flex flex-col gap-6 pb-8 ${selectedSubject ? 'mb-[50vh] lg:mb-0' : ''}`}>
          {displayedYears.map(([yearStr, subjects]) => (
            <div key={yearStr} className="flex flex-col gap-4 w-full">
              <div className={`grid gap-4 ${
                selectedSubject 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3' 
                  : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
              }`}>
                {subjects.map((subject, index) => {
                  const isSelected = selectedSubject?.id === subject.id;

                  // Highlight logic much faster O(1)
                  const isReqOfHovered = hoveredSubject ? hoveredRegulares.has(subject.id) || hoveredAprobadas.has(subject.id) : false;
                  const unlocksHovered = hoveredSubject ? subject.regulares.includes(hoveredSubject) || subject.aprobadas.includes(hoveredSubject) : false;
                  let cardStyle = "bg-white border-[#E8F0EA] hover:border-[#8BAA91]/40 hover:shadow-xl hover:shadow-[#8BAA91]/10 hover:-translate-y-1";
                  let iconColor = "text-[#A0A0A0]";
                  let spanClass = "";

                    const isApproved = userProgress.aprobadas.includes(subject.id);
                    const isRegular = userProgress.regulares.includes(subject.id);

                    let canTake = false;
                    if (user && !isApproved && !isRegular && subject.name !== "Materias Electivas") {
                      const missingAprobadas = subject.aprobadas.some((id: string | number) => !userProgress.aprobadas.includes(id));
                      const missingRegulares = subject.regulares.some((id: string | number) => !userProgress.aprobadas.includes(id) && !userProgress.regulares.includes(id));
                      canTake = !missingAprobadas && !missingRegulares;
                    }

                    if (isApproved) {
                      cardStyle = "bg-[#F4FBFA] border-[#8BAA91]/55 shadow-sm relative overflow-hidden opacity-75 hover:opacity-100 transition-opacity";
                      iconColor = "text-[#6B8A72]";
                    } else if (isRegular) {
                      cardStyle = "bg-[#FFF9F2] border-[#D4856A]/40 shadow-sm relative overflow-hidden opacity-75 hover:opacity-100 transition-opacity";
                      iconColor = "text-[#A9634C]";
                    } else if (user && subject.name !== "Materias Electivas") {
                      if (canTake) {
                        cardStyle = "bg-[#F4FBFA] border-[#8BAA91] border-2 shadow-md hover:-translate-y-1 transition-all relative overflow-hidden";
                        iconColor = "text-[#8BAA91]";
                      } else {
                        cardStyle = "bg-[#FFF5F5] border-[#D4856A] border-2 shadow-sm hover:-translate-y-1 transition-all relative overflow-hidden opacity-90";
                        iconColor = "text-[#D4856A]";
                      }
                    }

                  if (subject.name === "Materias Electivas") {
                    spanClass = "col-span-full bg-[#F5F0EA]/30 border-dashed border-2";
                  }

                  if (isReqOfHovered) {
                    cardStyle = "bg-[#FFF9F2] ring-2 ring-[#D4856A] ring-offset-2 scale-[1.02] transition-all z-10 will-change-transform shadow-lg border-[#D4856A]/50";
                    iconColor = "text-[#D4856A]";
                  } else if (unlocksHovered) {
                    cardStyle = "bg-[#F4FBFA] ring-2 ring-[#8BAA91] ring-offset-2 scale-[1.02] transition-all z-10 will-change-transform shadow-lg border-[#8BAA91]/50";
                    iconColor = "text-[#8BAA91]";
                  } else if (isSelected) {
                    cardStyle += " ring-2 ring-[#8BAA91] ring-offset-2 scale-[1.02] z-10 shadow-lg";
                  }

                  return (
                    <div 
                      key={subject.id}
                      role="button"
                      onMouseEnter={() => setHoveredSubject(subject.id)}
                      onMouseLeave={() => setHoveredSubject(null)}
                      onClick={() => setSelectedSubject(subject)}
                      style={{ animationDelay: `${index * 8}ms`, animationDuration: '250ms' }}
                      className={`
                        relative p-4 rounded-2xl border transition-all duration-100 ease-out group min-h-[120px] flex flex-col overflow-hidden [container-type:inline-size]
                        z-0 hover:z-20 animate-fade-in-up
                        ${cardStyle}
                        ${spanClass}
                      `}
                    >
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-current opacity-[0.03] rounded-full group-hover:scale-[2.5] transition-transform duration-150 ease-out z-0 pointer-events-none" />
                      
                      {/* Watermark Labels */}
                      {isApproved && (
                        <SubjectStatusRibbon label="APROBADA" tone="approved" />
                      )}

                      {isRegular && !isApproved && (
                        <SubjectStatusRibbon label="REGULARIZADA" tone="regular" />
                      )}

                      <div className="flex items-start justify-between mb-2 relative z-10 bg-white/40 backdrop-blur-[1px] p-1 -m-1 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <span className="relative z-10 text-xs font-mono font-medium text-[#A0A0A0] bg-[#F5F5F5] px-2 py-1 rounded-md block w-fit">
                            Cod. {subject.id.toString().padStart(3, '0')}
                          </span>
                          {subject.semester && subject.semester !== 'Electiva' && (
                            <span className={`
                              relative z-10 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 w-fit
                              ${subject.semester === 'Anual'
                                ? 'bg-[#EDE9FE] text-[#7C3AED]'
                                : subject.semester.includes('1')
                                  ? 'bg-[#E8F5E9] text-[#388E3C]'
                                  : 'bg-[#FFF3E0] text-[#E65100]'
                              }
                            `}>
                              <Calendar className="w-3 h-3" />
                              {subject.semester === 'Anual' ? 'Anual' : subject.semester.includes('1') ? '1C' : '2C'}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2 items-center relative z-10 shrink-0">{getSubjectIcon(subject.name, `w-5 h-5 ${iconColor} group-hover:text-[#8BAA91] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-100 ease-out`)}</div>
                      </div>

                      <div className="relative z-10 mt-auto flex flex-col gap-1.5">
                        <h4 className="font-semibold text-sm leading-tight text-[#3D3229] transition-colors">
                          {subject.name}
                        </h4>
                        {subject.note && (
                          <p className="text-[9px] uppercase tracking-wide leading-tight text-[#8BAA91] font-bold">
                            *{subject.note}
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
                            flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all duration-150 z-20 border
                            ${globalRatings[subject.id] 
                              ? 'bg-[#FAFAF8] text-[#3D3229] border-[#EDE6DD] hover:bg-[#F5F0EA] hover:border-[#8BAA91]/50' 
                              : 'bg-transparent text-[#A0A0A0] border-transparent hover:bg-[#FAFAF8] hover:text-[#8BAA91] hover:border-[#EDE6DD]'}
                          `}
                        >
                          {!globalRatings[subject.id] ? (
                            <>
                              <Star className="w-3.5 h-3.5" />
                              <span className="hidden @[160px]:inline">Calificar</span>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 text-[#D4856A]">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                {globalRatings[subject.id].diffAvg.toFixed(1)}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-[#E8F0EA]" />
                              <span className="flex items-center gap-1 text-[#8BAA91]">
                                <Sparkles className="w-3.5 h-3.5" />
                                {globalRatings[subject.id].utilAvg.toFixed(1)}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-[#E8F0EA]" />
                              <span className="text-[9px] font-bold text-[#A0A0A0] uppercase tracking-tighter">
                                {globalRatings[subject.id].count} {globalRatings[subject.id].count === 1 ? 'voto' : 'votos'}
                              </span>
                            </div>
                          )}
                        </button>

                        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-[#8BAA91] opacity-0 group-hover:opacity-100 transition-all duration-150 translate-y-2 group-hover:translate-y-0 text-shadow-sm pointer-events-none whitespace-nowrap overflow-hidden">
                          <Info className="w-3 h-3 flex-shrink-0" /> <span className="hidden @[220px]:inline">Ver correlativas</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bulk Actions for the year */}
              {yearStr !== 'electivas' && user && (
                <div className="flex flex-wrap items-center gap-4 mt-6 px-4 py-3 bg-[#FCFBFA] rounded-2xl border border-[#EDE6DD] border-dashed">
                  <p className="text-[11px] font-bold text-[#A89F95] uppercase tracking-wider">Acciones rápidas para el año:</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleBulkToggle(subjects, 'regulares')}
                      className="text-[11px] font-bold text-[#D4856A] hover:text-[#A9634C] transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#FFF9F2] border border-transparent hover:border-[#D4856A]/20 active:scale-95"
                    >
                      <AlertTriangle className="w-3 h-3" /> Marcar todo el año regular
                    </button>
                    <button
                      onClick={() => handleBulkToggle(subjects, 'aprobadas')}
                      className="text-[11px] font-bold text-[#8BAA91] hover:text-[#6B8A72] transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-[#F4FBFA] border border-transparent hover:border-[#8BAA91]/20 active:scale-95"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Marcar todo el año aprobado
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Inspector Mobile (via Portal to escape container constraints) */}
      {selectedSubject && mounted && typeof document !== 'undefined' && createPortal(
        <div className="lg:hidden">
          {/* Mobile Overlay */}
          <div 
            className="fixed inset-0 bg-black/5 z-[100] transition-opacity" 
            onClick={() => setSelectedSubject(null)} 
          />
          
          {/* Mobile Bottom Sheet */}
          <div className="
            fixed bottom-0 left-0 right-0 z-[101] rounded-t-3xl max-h-[85vh] overflow-y-auto scrollbar-hide
            border-t border-[#E8F0EA] bg-[#FAFAFA] px-6 pt-6 pb-8
            transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]
          ">
            <div className="w-12 h-1.5 bg-[#E8F0EA] rounded-full mx-auto mb-6" />

            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#A0A0A0]">Detalle de Correlativas</h3>
              <button 
                onClick={() => setSelectedSubject(null)}
                className="p-2 hover:bg-[#E8F0EA] rounded-full text-[#5C5C5C] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-[#E8F0EA] shadow-sm">
                <h2 className="text-xl font-bold leading-tight mb-2 pr-4">{selectedSubject.name}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-mono font-medium text-[#A0A0A0] bg-[#F5F5F5] px-2 py-1 rounded-md">Cod. {selectedSubject.id.toString().padStart(3, '0')}</span>
                  {selectedSubject.semester && selectedSubject.semester !== 'Electiva' ? (
                    <span className="text-xs font-bold text-[#8BAA91] bg-[#F5F9F6] px-2 py-1 rounded-md">{selectedSubject.semester}</span>
                  ) : null}
                  {selectedSubject.isElectiva ? (
                    <span className="text-xs font-bold text-[#A0A0A0] bg-[#F5F5F5] px-2 py-1 rounded-md">Electiva</span>
                  ) : null}
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F5F0EA]">
                  {selectedSubject.weekly_hours ? (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Horas Semanales</h4>
                      <p className="text-sm font-semibold">{selectedSubject.weekly_hours} hs</p>
                    </div>
                  ) : null}
                  {selectedSubject.total_hours ? (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Horas Totales</h4>
                      <p className="text-sm font-semibold">{selectedSubject.total_hours} hs</p>
                    </div>
                  ) : null}
                </div>

                {globalRatings[selectedSubject.id] && (
                  <div className="mt-4 pt-4 border-t border-[#F5F0EA]">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-3">Estadísticas de alumnos</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#D4856A] uppercase tracking-tighter mb-1">Dificultad</span>
                        <div className="flex items-center gap-1.5 text-[#D4856A]">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span className="text-sm font-bold">{globalRatings[selectedSubject.id].diffAvg.toFixed(1)}/5</span>
                        </div>
                      </div>
                      <div className="w-px h-8 bg-[#F5F0EA]" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-[#8BAA91] uppercase tracking-tighter mb-1">Utilidad</span>
                        <div className="flex items-center gap-1.5 text-[#8BAA91]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="text-sm font-bold">{globalRatings[selectedSubject.id].utilAvg.toFixed(1)}/5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <InteractiveProgressButtons 
                subject={selectedSubject} 
                userProgress={userProgress} 
                onToggle={handleToggleState} 
                user={user}
                setShowLoginPrompt={setShowLoginPrompt}
              />

              <div className="bg-white p-5 rounded-2xl border border-[#E8F0EA] shadow-sm">
                <h4 className="text-xs font-bold uppercase text-[#A0A0A0] mb-4">Para cursarla necesitás:</h4>
                {selectedSubject.regulares.length === 0 && selectedSubject.aprobadas.length === 0 ? (
                  <div className="text-sm text-[#5C5C5C] flex items-center gap-2 bg-[#F9F9F9] p-3 rounded-lg border border-dashed border-[#E0E0E0]">
                    <Unlock className="w-4 h-4 text-[#8BAA91]" /> Sin correlativas previas
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedSubject.aprobadas.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-[#8BAA91] mb-2 block">Tener APROBADAS:</span>
                        <ul className="space-y-1">
                          {selectedSubject.aprobadas.map((reqId) => {
                            const reqSub = career.curriculum.find(s => s.id === reqId);
                            return (
                              <li key={reqId} className="flex items-start gap-2 text-sm text-[#3D3229] hover:text-[#8BAA91] p-1.5 -ml-1.5 rounded-lg transition-colors group cursor-pointer"
                                  onClick={() => reqSub && setSelectedSubject(reqSub)}>
                                <CheckCircle2 className="w-4 h-4 text-[#8BAA91] mt-0.5 shrink-0" />
                                <span className="group-hover:underline">{reqSub?.name}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    {selectedSubject.regulares.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-[#D4856A] mb-2 block">Tener REGULARES:</span>
                        <ul className="space-y-1">
                          {selectedSubject.regulares.map((reqId) => {
                            const reqSub = career.curriculum.find(s => s.id === reqId);
                            return (
                              <li key={reqId} className="flex items-start gap-2 text-sm text-[#3D3229] hover:text-[#D4856A] p-1.5 -ml-1.5 rounded-lg transition-colors group cursor-pointer"
                                  onClick={() => reqSub && setSelectedSubject(reqSub)}>
                                <AlertTriangle className="w-4 h-4 text-[#D4856A] mt-0.5 shrink-0" />
                                <span className="group-hover:underline">{reqSub?.name}</span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E8F0EA] shadow-sm">
                <h4 className="text-xs font-bold uppercase text-[#A0A0A0] mb-4">Esta materia te permite:</h4>
                {(() => {
                  const unlocksAsRegular = career.curriculum.filter(s => s.regulares.includes(selectedSubject.id));
                  const unlocksAsApproved = career.curriculum.filter(s => s.aprobadas.includes(selectedSubject.id));
                  if (unlocksAsRegular.length === 0 && unlocksAsApproved.length === 0) return <span className="text-sm text-[#A0A0A0] italic">No es correlativa de materias futuras.</span>;
                  return (
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide">
                        {unlocksAsRegular.length > 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-[#FFF9F2] text-[#D4856A] border border-[#D4856A]/20">
                            Regularizar habilita {unlocksAsRegular.length}
                          </span>
                        )}
                        {unlocksAsApproved.length > 0 && (
                          <span className="px-2.5 py-1 rounded-full bg-[#F4FBFA] text-[#8BAA91] border border-[#8BAA91]/20">
                            Aprobar habilita {unlocksAsApproved.length}
                          </span>
                        )}
                      </div>
                      {unlocksAsRegular.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-[#D4856A] mb-2 block">Si la REGULARIZÁS:</span>
                          <div className="flex flex-wrap gap-2">
                            {unlocksAsRegular.map(unlockedSub => (
                              <span key={unlockedSub.id} onClick={() => setSelectedSubject(unlockedSub)}
                                    className="text-xs font-medium bg-[#FFF9F2] border border-[#E8F0EA] text-[#3D3229] px-2.5 py-1.5 rounded-lg hover:border-[#D4856A] cursor-pointer">
                                {unlockedSub.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {unlocksAsApproved.length > 0 && (
                        <div>
                          <span className="text-xs font-semibold text-[#8BAA91] mb-2 block">Si la APROBÁS:</span>
                          <div className="flex flex-wrap gap-2">
                            {unlocksAsApproved.map(unlockedSub => (
                              <span key={unlockedSub.id} onClick={() => setSelectedSubject(unlockedSub)}
                                    className="text-xs font-medium bg-[#F4FBFA] border border-[#E8F0EA] text-[#3D3229] px-2.5 py-1.5 rounded-lg hover:border-[#8BAA91] cursor-pointer">
                                {unlockedSub.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Sidebar Inspector Desktop (Inline) */}
      {selectedSubject && (
        <div className="
          hidden lg:block w-[400px] border-l border-[#E8F0EA] bg-[#FAFAFA] p-6 
          transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[-10px_0_30px_rgba(0,0,0,0.02)]
          flex-shrink-0 h-auto overflow-y-auto custom-scrollbar
        ">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#A0A0A0]">Detalle de Correlativas</h3>
            <button 
              onClick={() => setSelectedSubject(null)}
              className="p-2 hover:bg-[#E8F0EA] rounded-full text-[#5C5C5C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6" key={selectedSubject.id}>
            <div className="bg-white p-5 rounded-2xl border border-[#E8F0EA] shadow-sm">
              <h2 className="text-xl font-bold leading-tight mb-2 pr-4">{selectedSubject.name}</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-mono font-medium text-[#A0A0A0] bg-[#F5F5F5] px-2 py-1 rounded-md">Cod. {selectedSubject.id.toString().padStart(3, '0')}</span>
                {selectedSubject.semester && selectedSubject.semester !== 'Electiva' ? (
                  <span className="text-xs font-bold text-[#8BAA91] bg-[#F5F9F6] px-2 py-1 rounded-md">{selectedSubject.semester}</span>
                ) : null}
                {selectedSubject.isElectiva ? (
                  <span className="text-xs font-bold text-[#A0A0A0] bg-[#F5F5F5] px-2 py-1 rounded-md">Electiva</span>
                ) : null}
              </div>
              
              {/* Information Grid Container */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#F5F0EA]">
                {selectedSubject.weekly_hours ? (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Horas Semanales</h4>
                    <p className="text-sm font-semibold">{selectedSubject.weekly_hours} hs</p>
                  </div>
                ) : null}
                {selectedSubject.total_hours ? (
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Horas Totales</h4>
                    <p className="text-sm font-semibold">{selectedSubject.total_hours} hs</p>
                  </div>
                ) : null}
              </div>
              
              {(selectedSubject.docente || selectedSubject.horario) && (
                <div className="grid grid-cols-1 gap-3 pt-3 mt-3 border-t border-[#F5F0EA]">
                  {selectedSubject.docente && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Cátedra / Docente</h4>
                      <p className="text-sm font-semibold">{selectedSubject.docente}</p>
                    </div>
                  )}
                  {selectedSubject.horario && (
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-1">Régimen y Horarios</h4>
                      <p className="text-sm font-semibold leading-relaxed">{selectedSubject.horario}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Rating Section in Sidebar Desktop */}
              {globalRatings[selectedSubject.id] && (
                <div className="mt-4 pt-4 border-t border-[#F5F0EA]">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0] mb-3">Calificaciones de Estudiantes</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#D4856A] uppercase tracking-tighter mb-1">Dificultad</span>
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded-md bg-[#FFF9F2] text-[#D4856A]">
                          <ShieldAlert className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-bold">{globalRatings[selectedSubject.id].diffAvg.toFixed(1)}/5</span>
                      </div>
                    </div>
                    <div className="w-px h-8 bg-[#F5F0EA]" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-[#8BAA91] uppercase tracking-tighter mb-1">Utilidad</span>
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded-md bg-[#F4FBFA] text-[#8BAA91]">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm font-bold">{globalRatings[selectedSubject.id].utilAvg.toFixed(1)}/5</span>
                      </div>
                    </div>
                    <div className="ml-auto flex flex-col items-end">
                      <span className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-tighter mb-1">Muestra</span>
                      <span className="text-xs font-bold text-[#7A6E62]">{globalRatings[selectedSubject.id].count} {globalRatings[selectedSubject.id].count === 1 ? 'estudiante' : 'estudiantes'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <InteractiveProgressButtons 
              subject={selectedSubject} 
              userProgress={userProgress} 
              onToggle={handleToggleState} 
              user={user}
              setShowLoginPrompt={setShowLoginPrompt}
            />

            {/* Requirements Section */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8F0EA] shadow-sm">
              <h4 className="text-xs font-bold uppercase text-[#A0A0A0] mb-4">Para cursarla necesitás:</h4>
              
              {selectedSubject.regulares.length === 0 && selectedSubject.aprobadas.length === 0 ? (
                <div className="text-sm text-[#5C5C5C] flex items-center gap-2 bg-[#F9F9F9] p-3 rounded-lg border border-dashed border-[#E0E0E0]">
                  <Unlock className="w-4 h-4 text-[#8BAA91]" /> Sin correlativas previas
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedSubject.aprobadas.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-[#8BAA91] mb-2 block">Tener APROBADAS:</span>
                      <ul className="space-y-1">
                        {selectedSubject.aprobadas.map((reqId, index) => {
                          const reqSub = career.curriculum.find(s => s.id === reqId);
                          return (
                            <li 
                              key={reqId} 
                              style={{ animationDelay: `${index * 50 + 100}ms` }}
                              className="flex items-start gap-2 text-sm text-[#3D3229] hover:text-[#8BAA91] hover:bg-[#F4FBFA] p-1.5 -ml-1.5 rounded-lg transition-colors group"
                              onClick={() => {
                                if (reqSub) {
                                  setSelectedSubject(reqSub);
                                  setSelectedYear(reqSub.isElectiva ? 'electivas' : reqSub.year);
                                }
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#8BAA91] mt-0.5 shrink-0" />
                              <span className="group-hover:underline underline-offset-2">{reqSub?.name}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {selectedSubject.regulares.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-[#D4856A] mb-2 block">Tener REGULARES:</span>
                      <ul className="space-y-1">
                        {selectedSubject.regulares.map((reqId, index) => {
                          const reqSub = career.curriculum.find(s => s.id === reqId);
                          return (
                            <li 
                              key={reqId} 
                              style={{ animationDelay: `${index * 50 + 200}ms` }}
                              className="flex items-start gap-2 text-sm text-[#3D3229] hover:text-[#D4856A] hover:bg-[#FFF9F2] p-1.5 -ml-1.5 rounded-lg transition-colors group"
                              onClick={() => {
                                if (reqSub) {
                                  setSelectedSubject(reqSub);
                                  setSelectedYear(reqSub.isElectiva ? 'electivas' : reqSub.year);
                                }
                              }}
                            >
                              <AlertTriangle className="w-4 h-4 text-[#D4856A] mt-0.5 shrink-0" />
                              <span className="group-hover:underline underline-offset-2">{reqSub?.name}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}

                  {selectedSubject.rendir && selectedSubject.rendir.length > 0 && (
                    <div>
                      <span className="text-xs font-semibold text-[#8B5CF6] mb-2 block mt-4">Para RENDIR (Aprobadas):</span>
                      <ul className="space-y-1">
                        {selectedSubject.rendir.map((reqId, index) => {
                          const reqSub = career.curriculum.find(s => s.id === reqId);
                          return (
                            <li 
                              key={reqId} 
                              style={{ animationDelay: `${index * 50 + 300}ms` }}
                              className="flex items-start gap-2 text-sm text-[#3D3229] hover:text-[#8B5CF6] hover:bg-[#F3E8FF] p-1.5 -ml-1.5 rounded-lg cursor-pointer transition-colors group"
                              onClick={() => {
                                if (reqSub) {
                                  setSelectedSubject(reqSub);
                                  setSelectedYear(reqSub.isElectiva ? 'electivas' : reqSub.year);
                                }
                              }}
                            >
                              <CheckCircle2 className="w-4 h-4 text-[#8B5CF6] mt-0.5 shrink-0" />
                              <span className="group-hover:underline underline-offset-2">{reqSub?.name}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="bg-white p-5 rounded-2xl border border-[#E8F0EA] shadow-sm">
              <h4 className="text-xs font-bold uppercase text-[#A0A0A0] mb-4">Esta materia te permite:</h4>
              {(() => {
                const unlocksAsRegular = career.curriculum.filter(s => s.regulares.includes(selectedSubject.id));
                const unlocksAsApproved = career.curriculum.filter(s => s.aprobadas.includes(selectedSubject.id));
                if (unlocksAsRegular.length === 0 && unlocksAsApproved.length === 0) return <span className="text-sm text-[#A0A0A0] italic">No es correlativa de materias futuras.</span>;
                return (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide">
                      {unlocksAsRegular.length > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-[#FFF9F2] text-[#D4856A] border border-[#D4856A]/20">
                          Regularizar habilita {unlocksAsRegular.length}
                        </span>
                      )}
                      {unlocksAsApproved.length > 0 && (
                        <span className="px-2.5 py-1 rounded-full bg-[#F4FBFA] text-[#8BAA91] border border-[#8BAA91]/20">
                          Aprobar habilita {unlocksAsApproved.length}
                        </span>
                      )}
                    </div>
                    {unlocksAsRegular.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-[#D4856A] mb-2 block">Si la REGULARIZÁS:</span>
                        <div className="flex flex-wrap gap-2">
                          {unlocksAsRegular.map(unlockedSub => (
                            <span key={unlockedSub.id} onClick={() => setSelectedSubject(unlockedSub)}
                                  className="text-xs font-medium bg-[#FFF9F2] border border-[#E8F0EA] text-[#3D3229] px-2.5 py-1.5 rounded-lg hover:border-[#D4856A] cursor-pointer">
                              {unlockedSub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {unlocksAsApproved.length > 0 && (
                      <div>
                        <span className="text-xs font-semibold text-[#8BAA91] mb-2 block">Si la APROBÁS:</span>
                        <div className="flex flex-wrap gap-2">
                          {unlocksAsApproved.map(unlockedSub => (
                            <span key={unlockedSub.id} onClick={() => setSelectedSubject(unlockedSub)}
                                  className="text-xs font-medium bg-[#F4FBFA] border border-[#E8F0EA] text-[#3D3229] px-2.5 py-1.5 rounded-lg hover:border-[#8BAA91] cursor-pointer">
                                {unlockedSub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          </div>
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
};

// ----------------------------------------------------------------------
// YearCelebrationModal Component
// ----------------------------------------------------------------------
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-hidden">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md animate-fade-in" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 text-center animate-celebrate overflow-hidden border border-[#EDE6DD]">
        {/* Animated Background Decor */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
           <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#8BAA91]/10 rounded-full blur-3xl animate-pulse" />
           <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#D4856A]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10">
          <div className="w-28 h-28 flex items-center justify-center mb-8 mx-auto rotate-3 animate-bounce-subtle">
            <img src="/icon.png" alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
          </div>

          <h2 className="text-3xl font-black text-[#3D3229] mb-4 tracking-tight leading-tight">
            ¡Año {year} Completado!
          </h2>
          
          <p className="text-lg font-medium text-[#7A6E62] mb-8 leading-relaxed flex items-center justify-center gap-2 flex-wrap">
            Felicitaciones <span className="text-[#3D3229] font-bold">{userName}</span>Cada vez estás más cerca de tu objetivo académico. Seguí así, ¡el esfuerzo vale la pena! 
            <Rocket className="w-6 h-6 text-[#D4856A] animate-pulse inline-block" />
          </p>

          <button
            onClick={onClose}
            className="w-full bg-[#1A1A1A] hover:bg-[#3D3229] text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all shadow-xl shadow-black/10 active:scale-[0.98] hover:shadow-2xl"
          >
            ¡Vamos por más!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
