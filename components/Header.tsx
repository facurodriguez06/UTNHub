"use client";

import Link from "next/link";
import Image from "next/image";
import { Upload, Menu, X, ChevronRight, Heart, User, Settings, LogOut, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { DonationModal } from "@/components/DonationModal";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user, logout } = useAuth();

  const handleExploreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === "/") {
      e.preventDefault();
      const section = document.getElementById("carreras");
      if (section) {
        const y = section.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
      setMenuOpen(false);
    }
  };

  // Nombre a mostrar del usuario logueado
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Usuario";
  const isAdmin = user?.email?.toLowerCase() === "facundorodriguezsp@gmail.com";

  // Cerrar el menú mobile al hacer click fuera del header
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [menuOpen]);

  // Cerrar el dropdown del usuario al hacer click fuera
  useEffect(() => {
    if (!userMenuOpen) return;

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [userMenuOpen]);

  useEffect(() => {
    // Check initial scroll position immediately on mount
    const checkScrolled = () => setScrolled(window.scrollY > 0 || document.body.style.position === 'fixed');
    
    checkScrolled();
    
    window.addEventListener("scroll", checkScrolled);
    return () => window.removeEventListener("scroll", checkScrolled);
  }, []);

  return (
    <header
      ref={headerRef}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 py-3",
        scrolled 
          ? "bg-white border-b-4 border-zinc-900 shadow-[0_4px_0px_0px_rgba(24,24,27,1)]"
          : "bg-transparent border-b-4 border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-14">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setMenuOpen(false)}>
            <div className="w-10 h-10 bg-white border-4 border-zinc-900 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] group-hover:shadow-none group-hover:translate-x-[1px] group-hover:translate-y-[1px] transition-all">
              <Image 
                src="/icon-optimized.webp" 
                alt="Logo UTNHub" 
                width={24}
                height={24}
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-zinc-900 leading-none uppercase italic">
                UTN<span className="text-emerald-500">Hub</span>
              </span>
              <span className="text-[8px] font-black text-zinc-400 tracking-[0.25em] uppercase leading-tight">
                Subí tu apunte!
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-1.5 bg-white border-4 border-zinc-900 px-3 py-1.5 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
            <Link 
              href="/#carreras" 
              onClick={handleExploreClick}
              className="text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 px-3 py-2 hover:bg-emerald-400 hover:border-2 hover:border-zinc-900 transition-all"
            >
              Explorar
            </Link>
            <Link 
              href="/planes" 
              className="text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 px-3 py-2 hover:bg-emerald-400 hover:border-2 hover:border-zinc-900 transition-all"
            >
              Planes
            </Link>
            <button 
              onClick={() => setShowDonationModal(true)}
              className="text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 px-3 py-2 hover:bg-yellow-400 hover:border-2 hover:border-zinc-900 transition-all flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5" strokeWidth={3} />
              Apoyar
            </button>
            <Link 
              href="/upload" 
              className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white bg-zinc-900 border-4 border-zinc-900 px-4 py-2 shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <Upload className="w-3.5 h-3.5" strokeWidth={3} />
              Subir
            </Link>
            
            {/* Auth: Dropdown del usuario o botón de Ingresar */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest px-3 py-2 border-4 border-zinc-900 bg-white hover:bg-zinc-100 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all ${isAdmin ? 'bg-yellow-400 hover:bg-yellow-300' : ''}`}
                  id="user-menu-button"
                >
                  <div className={`w-6 h-6 border-2 border-zinc-900 flex items-center justify-center text-zinc-900 text-[10px] font-black uppercase ${isAdmin ? 'bg-white' : 'bg-emerald-400'}`}>
                    {displayName.charAt(0)}
                  </div>
                  <span className="hidden sm:block truncate max-w-[200px]">{displayName}</span>
                  <svg className={`w-3 h-3 text-zinc-500 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>

                {/* Dropdown del usuario */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] animate-fade-in-up overflow-hidden z-[60]">
                    {/* Info del usuario */}
                    <div className="px-4 py-3 border-b-4 border-zinc-900 bg-emerald-400">
                      <p className="text-sm font-black text-zinc-900 uppercase tracking-widest truncate">{displayName}</p>
                      {user.email && (
                        <p className="text-[11px] font-bold text-zinc-700 truncate mt-0.5">{user.email}</p>
                      )}
                    </div>

                    {/* Opciones del menú */}
                    <div className="flex flex-col">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-900 bg-yellow-400 border-b-4 border-zinc-900 hover:bg-yellow-300 transition-all"
                        >
                          <ShieldCheck className="w-4 h-4" strokeWidth={3} />
                          Moderación
                        </Link>
                      )}
                      <Link
                        href="/configuracion"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-900 hover:bg-zinc-200 transition-all border-b-4 border-zinc-900"
                      >
                        <Settings className="w-4 h-4" strokeWidth={3} />
                        Ajustes
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-900 bg-red-400 hover:bg-red-500 transition-all"
                      >
                        <LogOut className="w-4 h-4" strokeWidth={3} />
                        Salir
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
               <Link href="/auth" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-900 bg-emerald-400 border-4 border-zinc-900 px-4 py-2 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all">
                  <User className="w-4 h-4" strokeWidth={3} />
                  Ingresar
               </Link>
            )}
          </nav>
          
          {/* Mobile Menu Toggle */}
          <button 
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="flex sm:hidden text-zinc-600 bg-white border-4 border-zinc-900 p-2 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all active:bg-zinc-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" strokeWidth={4} /> : <Menu className="w-5 h-5" strokeWidth={4} />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="sm:hidden absolute top-full left-0 w-full px-4 pt-2 pb-4 mt-2 animate-fade-in-up">
            <div className="flex flex-col gap-1.5 bg-white border-4 border-zinc-900 p-2 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)]">
              <Link 
                href="/#carreras" 
                className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-900 px-4 py-3 border-2 border-transparent hover:border-zinc-900 hover:bg-emerald-400 transition-all"
                onClick={handleExploreClick}
              >
                Explorar materias <ChevronRight className="w-4 h-4" strokeWidth={3} />
              </Link>
              <Link 
                href="/planes" 
                className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-900 px-4 py-3 border-2 border-transparent hover:border-zinc-900 hover:bg-emerald-400 transition-all"
                onClick={() => setMenuOpen(false)}
              >
                Planes de Estudio <ChevronRight className="w-4 h-4" strokeWidth={3} />
              </Link>
              <Link 
                href="/upload" 
                className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-900 bg-emerald-400 border-4 border-zinc-900 px-4 py-3 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                onClick={() => setMenuOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4" strokeWidth={3} /> Subir apunte
                </div>
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
              </Link>
              <button 
                onClick={() => {
                  setMenuOpen(false);
                  setShowDonationModal(true);
                }}
                className="flex w-full items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-900 px-4 py-3 border-2 border-transparent hover:border-zinc-900 hover:bg-yellow-400 transition-all"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" strokeWidth={3} /> Apoyar proyecto
                </div>
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
              </button>

              {/* Sección de usuario en mobile */}
              {user ? (
                <>
                  <div className="border-t-4 border-zinc-900 my-1" />
                  <div className={`flex items-center gap-3 px-4 py-3 border-4 border-zinc-900 bg-zinc-50 ${isAdmin ? 'bg-yellow-100' : ''}`}>
                    <div className={`w-8 h-8 border-2 border-zinc-900 flex items-center justify-center text-zinc-900 text-xs font-black uppercase ${isAdmin ? 'bg-white' : 'bg-emerald-400'}`}>
                      {displayName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-zinc-900 uppercase tracking-widest truncate">{displayName}</p>
                      {user.email && <p className={`text-[10px] font-bold truncate ${isAdmin ? 'text-yellow-700' : 'text-zinc-500'}`}>{user.email}</p>}
                    </div>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-900 bg-yellow-400 border-4 border-zinc-900 px-4 py-3 hover:bg-yellow-300 transition-all"
                      onClick={() => setMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" strokeWidth={3} /> Moderación
                      </div>
                      <ChevronRight className="w-4 h-4" strokeWidth={3} />
                    </Link>
                  )}
                  <Link
                    href="/configuracion"
                    className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-900 px-4 py-3 border-2 border-transparent hover:border-zinc-900 hover:bg-zinc-200 transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" strokeWidth={3} /> Configuración
                    </div>
                    <ChevronRight className="w-4 h-4" strokeWidth={3} />
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center justify-between text-xs font-black uppercase tracking-widest text-white bg-red-500 border-4 border-zinc-900 px-4 py-3 hover:bg-red-600 transition-all shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" strokeWidth={3} /> Cerrar sesión
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t-4 border-zinc-900 my-1" />
                  <Link
                    href="/auth"
                    className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-zinc-900 bg-emerald-400 border-4 border-zinc-900 px-4 py-3 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" strokeWidth={3} /> Ingresar
                    </div>
                    <ChevronRight className="w-4 h-4" strokeWidth={3} />
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      
      <DonationModal 
        isOpen={showDonationModal} 
        onClose={() => setShowDonationModal(false)} 
      />
    </header>
  );
}
