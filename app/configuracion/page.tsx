"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  User,
  Mail,
  Shield,
  Trash2,
  Save,
  LogOut,
  AlertTriangle,
  ChevronRight,
  Settings,
  BookOpen,
  CheckCircle2,
  Award,
  Star,
  Hash,
  RefreshCw,
  MoreVertical,
  X,
  CreditCard,
  MessageSquare,
  Lock,
  Moon,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { auth, db } from "@/lib/firebase/config";
import {
  updateEmail,
  updatePassword,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export default function ConfigurationPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("perfil");
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);

  // Perfil state
  const [displayName, setDisplayName] = useState("");

  // Stats for the clear progress section
  const [aprobadasCount, setAprobadasCount] = useState(0);
  const [regularesCount, setRegularesCount] = useState(0);
  const [ratingsCount, setRatingsCount] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        router.push("/auth");
        return;
      }

      setUser(user);
      setDisplayName(user.displayName || "");

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          // Fetch stats
          const approvedQuery = query(collection(db, `users/${user.uid}/materias_aprobadas`));
          const regularsQuery = query(collection(db, `users/${user.uid}/materias_regulares`));
          const ratingsQuery = query(collection(db, "ratings"), where("userId", "==", user.uid));

          const [approvedSnap, regularsSnap, ratingsSnap] = await Promise.allSettled([
            getDocs(approvedQuery),
            getDocs(regularsQuery),
            getDocs(ratingsQuery)
          ]);

          setAprobadasCount(approvedSnap.status === "fulfilled" ? approvedSnap.value.size : 0);
          setRegularesCount(regularsSnap.status === "fulfilled" ? regularsSnap.value.size : 0);
          setRatingsCount(ratingsSnap.status === "fulfilled" ? ratingsSnap.value.size : 0);
        }
      } catch (error) {
        console.error("Error loading configuration data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        updatedAt: new Date().toISOString(),
      });
      showToast("Perfil actualizado correctamente", "success");
    } catch (error: any) {
      showToast("Error al actualizar el perfil", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleClearAprobadas = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, `users/${user.uid}/materias_aprobadas`));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      setAprobadasCount(0);
      showToast("Materias aprobadas eliminadas", "success");
    } catch (error) {
      showToast("Error al limpiar materias", "error");
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(null);
    }
  };

  const handleClearRegulares = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, `users/${user.uid}/materias_regulares`));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      setRegularesCount(0);
      showToast("Materias regularizadas eliminadas", "success");
    } catch (error) {
      showToast("Error al limpiar materias", "error");
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(null);
    }
  };

  const handleClearAllProgress = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const batch = writeBatch(db);
      
      const approvedQuery = query(collection(db, `users/${user.uid}/materias_aprobadas`));
      const regularsQuery = query(collection(db, `users/${user.uid}/materias_regulares`));
      
      const [approvedSnap, regularsSnap] = await Promise.all([
        getDocs(approvedQuery),
        getDocs(regularsQuery)
      ]);

      approvedSnap.docs.forEach((doc) => batch.delete(doc.ref));
      regularsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      
      await batch.commit();
      setAprobadasCount(0);
      setRegularesCount(0);
      showToast("Todo el progreso ha sido reiniciado", "success");
    } catch (error) {
      showToast("Error al reiniciar progreso", "error");
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(null);
    }
  };

  const handleClearRatings = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      const q = query(collection(db, "ratings"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      setRatingsCount(0);
      showToast("Calificaciones eliminadas", "success");
    } catch (error) {
      showToast("Error al eliminar calificaciones", "error");
    } finally {
      setIsProcessing(false);
      setShowConfirmDialog(null);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] bg-texture-grain flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-900 border-t-emerald-400 rounded-full animate-spin shadow-neo"></div>
          <p className="font-black uppercase tracking-widest text-zinc-900 italic">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "perfil", label: "Perfil", icon: User, color: "bg-emerald-400" },
    { id: "seguridad", label: "Seguridad", icon: Shield, color: "bg-yellow-400" },
    { id: "datos", label: "Mis Datos", icon: RefreshCw, color: "bg-coral" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] bg-texture-grain flex flex-col font-sans text-zinc-900">
      <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 sm:gap-10 mb-14 sm:mb-20 animate-fade-in">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-6 sm:mb-8 shadow-[4px_4px_0px_0px_rgba(52,211,153,1)] transform -rotate-1">
                <Settings className="w-4 h-4" />
                CENTRO DE CONFIGURACIÓN
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-9xl font-black text-zinc-900 uppercase tracking-tighter italic leading-[0.85] mb-6 sm:mb-8">
                TU <span className="text-emerald-500 underline decoration-zinc-900 decoration-8 underline-offset-4">ESPACIO</span>
              </h1>
              <p className="text-zinc-600 font-black uppercase tracking-widest text-xs sm:text-sm md:text-base border-l-8 border-emerald-400 pl-4 sm:pl-8 py-3 max-w-2xl leading-relaxed">
                GESTIÓN INTEGRAL DE IDENTIDAD ELECTRÓNICA Y PROGRESO ACADÉMICO. <br/>
                SEGURIDAD: <span className="text-emerald-600 bg-emerald-50 px-2 border-2 border-emerald-200">NIVEL 1 VERIFICADO</span>
              </p>
            </div>
            
            <button
              onClick={handleLogout}
            className="neo-btn px-6 sm:px-8 py-4 sm:py-5 bg-white hover:bg-rose-50 text-rose-600 border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(194,139,139,1)] hover:shadow-[8px_8px_0px_0px_rgba(194,139,139,1)] active:shadow-none transition-all font-black uppercase tracking-widest text-xs sm:text-sm flex items-center justify-center gap-3 w-full lg:w-auto"
            >
              <LogOut className="w-6 h-6" strokeWidth={3} />
              CERRAR SESIÓN
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-3 space-y-6 animate-fade-in-up delay-100">
              <div className="bg-white border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4">
                <nav className="flex flex-row lg:flex-col gap-2 lg:gap-3 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-xs transition-all duration-300 border-4 whitespace-nowrap shrink-0 lg:shrink
                        ${activeTab === tab.id 
                          ? `${tab.color} text-zinc-900 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform translate-x-2` 
                          : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 border-transparent"
                        }
                      `}
                    >
                      <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "animate-wiggle" : ""}`} strokeWidth={3} />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Quick Info Card */}
              <div className="bg-zinc-900 border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(52,211,153,1)] p-6 sm:p-8 text-white transform rotate-1 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/10 rounded-full blur-3xl group-hover:bg-emerald-400/20 transition-all" />
                <h3 className="font-black uppercase tracking-[0.3em] text-[10px] mb-6 text-emerald-400 italic flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> ESTADO DE CUENTA
                </h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-emerald-400 border-4 border-white flex items-center justify-center text-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
                    <Award className="w-8 h-8" strokeWidth={3} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">CATEGORÍA</p>
                    <p className="font-black uppercase italic text-lg leading-none">MIEMBRO PRO</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-800 border-2 border-zinc-700 overflow-hidden shadow-inner">
                    <div className="h-full bg-emerald-400 border-r-2 border-zinc-900 transition-all duration-1000" style={{ width: "85%" }}></div>
                  </div>
                  <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest text-right">85% COMPLETADO / NIVEL 2</p>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-9 animate-fade-in-up delay-200">
              <div className="bg-white border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-h-[640px] sm:min-h-[700px]">
                {/* Content Header */}
                <div className="border-b-4 border-zinc-900 bg-zinc-50 p-5 sm:p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${tabs.find(t => t.id === activeTab)?.color}`}>
                      {(() => {
                        const Icon = tabs.find(t => t.id === activeTab)?.icon || User;
                        return <Icon className="w-8 h-8 text-zinc-900" strokeWidth={3} /> ;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase italic text-zinc-900 leading-none mb-2 tracking-tighter">
                        {tabs.find(t => t.id === activeTab)?.label}
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 bg-zinc-900" />
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">MÓDULO DE AJUSTES TÉCNICOS</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-5 sm:p-8 md:p-12 lg:p-16">
                  {activeTab === "perfil" && (
                    <div className="max-w-3xl space-y-10 sm:space-y-12">
                      <div className="grid grid-cols-1 gap-8 sm:gap-10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.25em] sm:tracking-[0.3em] text-zinc-900 flex items-center gap-2">
                            <span className="w-2 h-2 bg-zinc-900" /> NOMBRE DE USUARIO
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-emerald-500 transition-colors">
                              <User className="w-6 h-6" strokeWidth={3} />
                            </div>
                            <input
                              type="text"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="w-full pl-16 pr-6 py-4 sm:py-5 bg-white border-4 border-zinc-900 text-zinc-900 font-black uppercase tracking-widest text-sm placeholder:text-zinc-300 focus:outline-none focus:bg-zinc-50 focus:shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] transition-all"
                              placeholder="ESCRIBE TU NOMBRE..."
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 sm:pt-8 border-t-4 border-zinc-100">
                        <button
                          onClick={handleUpdateProfile}
                          disabled={saving}
                          className="neo-btn-primary w-full md:w-auto min-w-[280px] py-5 text-sm"
                        >
                          {saving ? (
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto" strokeWidth={3} />
                          ) : (
                            <div className="flex items-center justify-center gap-3">
                              <Save className="w-6 h-6" strokeWidth={3} />
                              GUARDAR CAMBIOS
                            </div>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "seguridad" && (
                    <div className="max-w-3xl space-y-12">
                      <div className="space-y-8">
                        <div className="flex items-center gap-4 mb-8">
                          <div className="w-14 h-14 bg-yellow-400 border-4 border-zinc-900 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Lock className="w-8 h-8 text-zinc-900" strokeWidth={3} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-black uppercase italic text-zinc-900 leading-none mb-1">AUTENTICACIÓN</h3>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">SISTEMA DE ACCESO SEGURO</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="p-8 border-4 border-zinc-900 bg-zinc-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:bg-white transition-colors">
                            <div className="absolute -top-6 -right-6 p-4 opacity-5 transform group-hover:scale-110 group-hover:-rotate-12 transition-all">
                              <Mail className="w-32 h-32 text-zinc-900" />
                            </div>
                            <div className="relative z-10 space-y-6">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">CANAL PRIMARIO</p>
                                <p className="text-base font-black text-zinc-900 break-all">{user?.email}</p>
                              </div>
                              <button className="w-full px-5 py-4 bg-white border-4 border-zinc-900 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                                CAMBIAR EMAIL
                              </button>
                            </div>
                          </div>

                          <div className="p-8 border-4 border-zinc-900 bg-zinc-50 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.05)] relative overflow-hidden group hover:bg-white transition-colors">
                            <div className="absolute -top-6 -right-6 p-4 opacity-5 transform group-hover:scale-110 group-hover:-rotate-12 transition-all">
                              <Shield className="w-32 h-32 text-zinc-900" />
                            </div>
                            <div className="relative z-10 space-y-6">
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">CLAVE DE ACCESO</p>
                                <p className="text-xl font-black text-zinc-900 tracking-[0.5em]">••••••••</p>
                              </div>
                              <button className="w-full px-5 py-4 bg-white border-4 border-zinc-900 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1">
                                ACTUALIZAR PASS
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-12 border-t-4 border-zinc-100">
                        <div className="p-10 bg-rose-50 border-4 border-rose-600 shadow-[10px_10px_0px_0px_rgba(225,29,72,1)] relative overflow-hidden group">
                           {/* Danger texture */}
                           <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity bg-[radial-gradient(#e11d48_2px,transparent_2px)] [background-size:20px_20px]" />
                           
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 relative z-10">
                            <div className="w-16 h-16 bg-rose-600 border-4 border-zinc-900 flex items-center justify-center text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] transform -rotate-3">
                              <AlertTriangle className="w-10 h-10" strokeWidth={3} />
                            </div>
                            <div>
                              <h4 className="text-2xl font-black uppercase italic text-rose-600 leading-none mb-1">PROTOCOLO DE BAJA</h4>
                              <p className="text-[10px] font-black text-rose-600/70 uppercase tracking-widest">ESTA ACCIÓN ES TOTALMENTE IRREVERSIBLE</p>
                            </div>
                          </div>
                          
                          <p className="text-sm text-rose-600/80 font-bold mb-10 leading-relaxed max-w-2xl relative z-10">
                            AL ELIMINAR TU CUENTA, SE BORRARÁ DE FORMA PERMANENTE TODO TU HISTORIAL DE MATERIAS, NOTAS COMPARTIDAS, REPUTACIÓN Y CONFIGURACIONES PERSONALIZADAS. NO PODRÁS RECUPERAR NADA.
                          </p>
                          
                          <button className="w-full md:w-auto px-10 py-5 bg-rose-600 text-white border-4 border-zinc-900 font-black uppercase tracking-[0.2em] text-xs shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] hover:shadow-[10px_10px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all relative z-10">
                            ELIMINAR MI CUENTA DEFINITIVAMENTE
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "datos" && (
                    <div className="max-w-4xl space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-emerald-400 p-8 border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 relative overflow-hidden group hover:rotate-0 transition-transform">
                          <BookOpen className="w-20 h-20 text-zinc-900/10 absolute -bottom-6 -right-6 transform group-hover:scale-125 transition-transform" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900/60 mb-2">APROBADAS</p>
                          <p className="text-6xl font-black text-zinc-900 italic leading-none">{aprobadasCount}</p>
                        </div>
                        <div className="bg-yellow-400 p-8 border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group hover:-translate-y-1 transition-all">
                          <Award className="w-20 h-20 text-zinc-900/10 absolute -bottom-6 -right-6 transform group-hover:scale-125 transition-transform" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900/60 mb-2">REGULARES</p>
                          <p className="text-6xl font-black text-zinc-900 italic leading-none">{regularesCount}</p>
                        </div>
                        <div className="bg-coral p-8 border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1 relative overflow-hidden group hover:rotate-0 transition-transform">
                          <Star className="w-20 h-20 text-zinc-900/10 absolute -bottom-6 -right-6 transform group-hover:scale-125 transition-transform" />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900/60 mb-2">RATINGS</p>
                          <p className="text-6xl font-black text-zinc-900 italic leading-none">{ratingsCount}</p>
                        </div>
                      </div>

                      <div className="space-y-8 pt-8">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 bg-zinc-900 text-white flex items-center justify-center border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(52,211,153,1)]">
                            <RefreshCw className="w-6 h-6" strokeWidth={3} />
                          </div>
                          <h3 className="text-2xl font-black uppercase italic text-zinc-900 leading-none">MANTENIMIENTO DE DATOS</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            { id: "aprobadas", label: "REINICIAR MATERIAS APROBADAS", icon: BookOpen, count: aprobadasCount, color: "hover:bg-emerald-50", accent: "bg-emerald-400" },
                            { id: "regulares", label: "REINICIAR MATERIAS REGULARES", icon: Award, count: regularesCount, color: "hover:bg-yellow-50", accent: "bg-yellow-400" },
                            { id: "ratings", label: "ELIMINAR MIS CALIFICACIONES", icon: Star, count: ratingsCount, color: "hover:bg-coral-light", accent: "bg-coral" },
                            { id: "todo", label: "REINICIAR TODO EL PROGRESO", icon: Trash2, count: null, color: "hover:bg-rose-50", text: "text-rose-600", accent: "bg-rose-600" }
                          ].map((action) => (
                            <button
                              key={action.id}
                              onClick={() => setShowConfirmDialog(action.id)}
                              className={`w-full group flex flex-col gap-6 p-8 bg-white border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] ${action.color} text-left`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className={`w-14 h-14 flex items-center justify-center border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${action.accent} transition-transform group-hover:rotate-6`}>
                                  <action.icon className={`w-7 h-7 ${action.id === 'todo' ? 'text-white' : 'text-zinc-900'}`} strokeWidth={3} />
                                </div>
                                <ChevronRight className="w-8 h-8 text-zinc-300 group-hover:text-zinc-900 transition-colors group-hover:translate-x-2" strokeWidth={3} />
                              </div>
                              <div>
                                <p className={`font-black uppercase tracking-[0.1em] text-base leading-tight mb-2 ${action.text || "text-zinc-900"}`}>{action.label}</p>
                                {action.count !== null && (
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 bg-zinc-900 rounded-full" />
                                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{action.count} REGISTROS ACTIVOS</p>
                                  </div>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Dialogs - Neo-Brutalist Extreme Version */}
      {showConfirmDialog && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-zinc-900/80 backdrop-blur-md transition-opacity animate-fade-in"
            onClick={() => !isProcessing && setShowConfirmDialog(null)}
          />
          <div className="relative bg-white border-4 border-zinc-900 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full p-10 animate-fade-in-scale z-10">
            {/* Header decor */}
            <div className="absolute -top-6 -left-6 w-12 h-12 bg-rose-500 border-4 border-zinc-900 rotate-12" />
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-rose-500 border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-zinc-900 transform -rotate-6">
                <AlertTriangle className="w-12 h-12" strokeWidth={3} />
              </div>
              <div>
                <h3 className="text-4xl font-black uppercase italic text-zinc-900 leading-[0.8] mb-2 tracking-tighter">¡ALERTA!</h3>
                <p className="text-[12px] font-black uppercase tracking-[0.3em] text-rose-500">ACCESOS RESTRINGIDOS REQUERIDOS</p>
              </div>
            </div>

            <div className="p-6 bg-zinc-900 text-white border-4 border-zinc-900 mb-10 transform rotate-1 shadow-[4px_4px_0px_0px_rgba(225,29,72,1)]">
              <p className="text-base font-black leading-relaxed italic uppercase tracking-tighter">
                {showConfirmDialog === "aprobadas" && (
                  <>VAS A ELIMINAR TODAS LAS MATERIAS MARCADAS COMO <span className="bg-emerald-400 text-zinc-900 px-2 py-0.5 ml-1">APROBADAS</span>.</>
                )}
                {showConfirmDialog === "regulares" && (
                  <>VAS A ELIMINAR TODAS LAS MATERIAS MARCADAS COMO <span className="bg-yellow-400 text-zinc-900 px-2 py-0.5 ml-1">REGULARES</span>.</>
                )}
                {showConfirmDialog === "todo" && (
                  <>VAS A <span className="bg-rose-500 text-white px-2 py-0.5 ml-1">WIPEAR</span> TODO TU PROGRESO ACADÉMICO DEL SISTEMA.</>
                )}
                {showConfirmDialog === "ratings" && (
                  <>VAS A ELIMINAR LAS <span className="bg-coral text-zinc-900 px-2 py-0.5 mx-1">{ratingsCount} CALIFICACIONES</span> REALIZADAS.</>
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={() => setShowConfirmDialog(null)}
                disabled={isProcessing}
                className="flex-1 neo-btn px-8 py-5 bg-white hover:bg-zinc-50 border-4 border-zinc-900 font-black uppercase tracking-widest text-xs shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] transition-all disabled:opacity-50"
              >
                ABORTAR ACCIÓN
              </button>
              <button
                onClick={() => {
                  if (showConfirmDialog === "aprobadas") handleClearAprobadas();
                  else if (showConfirmDialog === "regulares") handleClearRegulares();
                  else if (showConfirmDialog === "todo") handleClearAllProgress();
                  else if (showConfirmDialog === "ratings") handleClearRatings();
                }}
                disabled={isProcessing}
                className="flex-1 neo-btn px-8 py-5 bg-rose-600 text-white hover:bg-rose-500 border-4 border-zinc-900 font-black uppercase tracking-widest text-xs shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] hover:shadow-[10px_10px_0px_0px_rgba(24,24,27,1)] transition-all disabled:opacity-70"
              >
                {isProcessing ? (
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto" strokeWidth={3} />
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <Trash2 className="w-5 h-5" strokeWidth={3} />
                    CONFIRMAR BORRADO
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>

  );
}
