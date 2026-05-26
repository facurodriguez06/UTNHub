"use client";

import Link from "next/link";
import Image from "next/image";
import { Upload, Menu, X, ChevronRight, Heart, User, Settings, LogOut, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { DonationModal } from "@/components/DonationModal";
import { useAuth } from "@/context/AuthContext";
import { useScrollLock } from "@/hooks/useScrollLock";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { user, logout } = useAuth();

  useScrollLock(menuOpen);

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
  
  // Cerrar menús al hacer scroll (especialmente útil en móviles)
  useEffect(() => {
    if (!userMenuOpen) return;

    const handleScroll = () => {
      setUserMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
        "sticky top-0 z-50 w-full transition-all duration-300 py-3 border-b",
        scrolled 
          ? "bg-white shadow-sm border-[#EDE6DD]"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-12">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3.5 group" onClick={() => setMenuOpen(false)}>
            <div className="relative flex items-center justify-center w-11 h-11 transition-all duration-300 group-hover:scale-105 group-active:scale-95">
              <Image 
                src="/icon-optimized.webp" 
                alt="Logo UTNHub" 
                width={44}
                height={44}
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            
            <div className="flex flex-col -gap-0.5">
              <span className="font-extrabold text-[22px] tracking-tight text-[#3D3229] leading-none">
                UTN<span className="text-[#8BAA91]">Hub</span>
              </span>
              <span className="text-[9px] font-bold text-[#A89F95] tracking-[0.22em] leading-normal group-hover:text-[#7A6E62] transition-colors uppercase pt-0.5">
                Subi tu apunte!
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-2 p-1.5 bg-white/60 shadow-sm rounded-2xl border border-[#EDE6DD]/80 shadow-sm shadow-[#EDE6DD]/30">
            <Link 
              href="/#carreras" 
              onClick={handleExploreClick}
              className="relative text-[13px] font-bold text-[#7A6E62] hover:text-[#3D3229] px-4 py-2 rounded-xl transition-all duration-300 group hover:bg-[#F5F0EA]/50"
            >
              Explorar
              <span className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-[#8BAA91] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full opacity-60" />
            </Link>
            <Link 
              href="/planes" 
              className="relative text-[13px] font-bold text-[#7A6E62] hover:text-[#3D3229] px-4 py-2 rounded-xl transition-all duration-300 group hover:bg-[#F5F0EA]/50"
            >
              Planes de Estudio
              <span className="absolute bottom-1.5 left-4 right-4 h-[2px] bg-[#8BAA91] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full opacity-60" />
            </Link>
            <button 
              onClick={() => setShowDonationModal(true)}
              className="relative flex items-center gap-1.5 text-[12px] font-bold text-[#8B7355] hover:text-[#3D3229] px-3 py-2 rounded-xl transition-all duration-300 group hover:bg-[#F5EFE5]/50"
            >
              <Heart className="w-3.5 h-3.5 opacity-70 group-hover:scale-110 group-hover:text-red-400 transition-all duration-300" />
              Apoyar
              <span className="absolute bottom-1.5 left-3 right-3 h-[2px] bg-[#8B7355] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full opacity-40" />
            </button>
            <Link 
              href="/upload" 
              className="group relative flex items-center gap-2 text-[13px] font-bold text-white bg-[#8BAA91] hover:bg-[#6A8F70] shadow-sm border border-[#597A5E] px-4 py-2 rounded-xl overflow-hidden active:scale-[0.97] transition-all duration-300"
            >
              <Upload className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Subir apunte</span>
            </Link>
            
            {/* Auth: Dropdown del usuario o botón de Ingresar */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`relative flex items-center gap-2 text-[12px] font-bold text-[#3D3229] hover:bg-[#F5F0EA] px-3 py-2 rounded-xl transition-all duration-300 border bg-white group ${isAdmin ? 'border-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.4)]' : 'border-[#EDE6DD]'}`}
                  id="user-menu-button"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black uppercase shadow-sm ${isAdmin ? 'bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C]' : 'bg-gradient-to-br from-[#8BAA91] to-[#6A8F70]'}`}>
                    {displayName.charAt(0)}
                  </div>
                  <span className="hidden sm:block text-[11px] truncate max-w-[160px]">{displayName}</span>
                  <svg className={`w-3 h-3 text-[#A89F95] transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>

                {/* Dropdown del usuario */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#EDE6DD] rounded-2xl shadow-xl shadow-black/8 animate-fade-in-up overflow-hidden z-[60]">
                    {/* Info del usuario */}
                    <div className="px-4 py-3 border-b border-[#EDE6DD] bg-[#FAFAF8]">
                      <p className="text-[13px] font-bold text-[#3D3229] truncate">{displayName}</p>
                      {user.email && (
                        <p className="text-[11px] text-[#A89F95] font-medium truncate mt-0.5">{user.email}</p>
                      )}
                    </div>

                    {/* Opciones del menú */}
                    <div className="p-1.5">
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-[#D4AF37] hover:text-[#AA8C2C] hover:bg-[#FCF9F0] transition-all group"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#D4AF37] group-hover:text-[#AA8C2C] transition-all duration-300" />
                          Panel de Moderación
                        </Link>
                      )}
                      <Link
                        href="/configuracion"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-[#7A6E62] hover:text-[#3D3229] hover:bg-[#F5F0EA] transition-all group"
                        id="user-menu-settings"
                      >
                        <Settings className="w-4 h-4 text-[#A89F95] group-hover:text-[#8BAA91] group-hover:rotate-45 transition-all duration-300" />
                        Configuración
                      </Link>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-bold text-[#E57A7A] hover:text-[#C55A5A] hover:bg-[#FEF5F5] transition-all group"
                        id="user-menu-logout"
                      >
                        <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
               <Link href="/auth" className="relative flex items-center justify-center gap-1.5 text-[12px] font-bold text-[#3D3229] hover:bg-[#F5F0EA] px-4 py-2 rounded-xl transition-all duration-300 border border-[#EDE6DD] bg-white group">
                  <svg className="w-4 h-4 text-[#8BAA91]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                  <span>Ingresar</span>
               </Link>
            )}
          </nav>
          
          {/* Mobile Menu Toggle */}
          <button 
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            className="flex sm:hidden text-[#7A6E62] bg-white border border-[#EDE6DD] hover:text-[#3D3229] p-2 rounded-xl shadow-sm hover:bg-[#F5F0EA] transition-all active:scale-95"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Lateral Menu (Drawer) */}
        {menuOpen && (
          <>
            {/* Backdrop overlay */}
            <div 
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99] sm:hidden animate-fade-in" 
              onClick={() => setMenuOpen(false)}
            />
            
            {/* Slide-out Drawer */}
            <div className="fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white border-l border-[#EDE6DD] z-[100] sm:hidden shadow-2xl p-6 flex flex-col justify-between animate-slide-in-right overflow-y-auto">
              <div className="flex flex-col gap-6">
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[#EDE6DD]">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[19px] tracking-tight text-[#3D3229]">
                      UTN<span className="text-[#8BAA91]">Hub</span>
                    </span>
                  </div>
                  <button 
                    onClick={() => setMenuOpen(false)}
                    className="p-1.5 rounded-xl border border-[#EDE6DD] hover:bg-[#F5F0EA] text-[#7A6E62] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* User card profile */}
                {user ? (
                  <div className={cn(
                    "flex items-center gap-3 p-3.5 rounded-2xl border bg-white",
                    isAdmin ? "border-[#F2E5C2] bg-[#FCF9F0]" : "border-[#EDE6DD]"
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black uppercase shadow-sm shrink-0",
                      isAdmin ? "bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C]" : "bg-gradient-to-br from-[#8BAA91] to-[#6A8F70]"
                    )}>
                      {displayName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#3D3229] truncate">{displayName}</p>
                      {user.email && (
                        <p className={cn(
                          "text-[10px] truncate font-medium",
                          isAdmin ? "text-[#D4AF37]" : "text-[#A89F95]"
                        )}>
                          {user.email}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link
                    href="/auth"
                    className="flex items-center justify-between text-sm font-bold text-[#3D3229] bg-[#FAFAF8] px-4 py-3 rounded-2xl border border-[#EDE6DD] hover:bg-[#F5F0EA] transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#8BAA91]" /> Ingresar
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                )}

                {/* Navigation Links */}
                <nav className="flex flex-col gap-2">
                  <Link 
                    href="/#carreras" 
                    className="flex items-center justify-between text-sm font-bold text-[#7A6E62] hover:text-[#3D3229] px-4 py-3 rounded-xl hover:bg-[#F5F0EA]/50 transition-all"
                    onClick={handleExploreClick}
                  >
                    Explorar materias <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                  <Link 
                    href="/planes" 
                    className="flex items-center justify-between text-sm font-bold text-[#7A6E62] hover:text-[#3D3229] px-4 py-3 rounded-xl hover:bg-[#F5F0EA]/50 transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Planes de Estudio <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                  <Link 
                    href="/upload" 
                    className="flex items-center justify-between text-sm font-bold text-[#4A7A52] bg-[#E8F0EA] hover:bg-[#D5E8DB] px-4 py-3 rounded-xl transition-all border border-[#D5E8DB]"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" /> Subir nuevo apunte
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                  <button 
                    onClick={() => {
                      setMenuOpen(false);
                      setShowDonationModal(true);
                    }}
                    className="flex w-full items-center justify-between text-sm font-bold text-[#8B7355] bg-[#F5EFE5] hover:bg-[#E2D6C2]/30 px-4 py-3 rounded-xl transition-all border border-[#E2D6C2]"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" /> Apoyar proyecto
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-30" />
                  </button>
                </nav>
              </div>

              {/* Drawer footer options for user session settings */}
              {user && (
                <div className="flex flex-col gap-2 pt-4 border-t border-[#EDE6DD] mt-auto">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center justify-between text-sm font-bold text-[#D4AF37] hover:text-[#AA8C2C] px-4 py-3 rounded-xl hover:bg-[#FCF9F0] transition-all"
                      onClick={() => setMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Panel de Moderación
                      </div>
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </Link>
                  )}
                  <Link
                    href="/configuracion"
                    className="flex items-center justify-between text-sm font-bold text-[#7A6E62] hover:text-[#3D3229] px-4 py-3 rounded-xl hover:bg-[#F5F0EA]/50 transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Configuración
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center justify-between text-sm font-bold text-[#E57A7A] bg-[#FEF5F5] hover:bg-[#FEEDED] px-4 py-3 rounded-xl transition-all border border-[#FCDCDC]"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </div>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      <DonationModal 
        isOpen={showDonationModal} 
        onClose={() => setShowDonationModal(false)} 
      />
    </header>
  );
}
