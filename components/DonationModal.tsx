"use client";

import { useScrollLock } from "@/hooks/useScrollLock";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useToast } from "@/context/ToastContext";
import { DollarSign, ArrowRight, Wallet, X, Star, Zap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_AMOUNTS = [500, 1000, 5000];

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const { showToast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Asegurar que el componente esté montado (para Portals en Next.js/SSR)
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Bloquear scroll del fondo cuando el modal esté abierto
  useScrollLock(isOpen);

  // Handle closing animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const currentAmount = selectedPreset || parseInt(customAmount) || 0;

  const handleDonate = async () => {
    if (currentAmount <= 0 || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: currentAmount }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      showToast("Error al conectar con Mercado Pago", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen && !isClosing) return null;
  if (!mounted) return null;

  // El contenido del Modal que se inyectará al final del body
  const modalContent = (
    <div 
      className={cn(
        "fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 transition-all duration-300 overscroll-none",
        isClosing ? "opacity-0" : "opacity-100"
      )}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* High-Impact Overlay (Sin acción de cierre para forzar el uso de la cruz) */}
      <div className="absolute inset-0 bg-black/75 bg-black/90 animate-fade-in" />

      {/* Modal Container */}
      <div className={cn(
        "relative w-full max-w-[calc(100vw-1rem)] sm:max-w-4xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[2rem] sm:rounded-[3rem] bg-white border-[4px] sm:border-[6px] border-[#8BAA91]/10 shadow-[0_45px_100px_-20px_rgba(0,0,0,0.5)] transition-all duration-700 transform",
        
        isClosing ? 'scale-90 opacity-0 translate-y-12' : 'scale-100 opacity-100 translate-y-0'
      )}>
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/80 shadow-lg border border-[#EDE6DD] text-[#3D3229] hover:bg-[#D84545] hover:text-white transition-all z-30 group"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-12 items-stretch min-h-[300px]">
          
          {/* LEFT COLUMN: Message & Branding */}
          <div className="hidden lg:flex lg:col-span-1 xl:col-span-5 relative bg-gradient-to-br from-[#8BAA91] via-[#D5E8DB] to-[#F5EFE5] p-6 lg:p-10 flex-col justify-center items-center text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-white shadow-xl border border-white/50 mb-6 animate-bounce-slow">
                <Image src="/utn-logo-optimized.webp" alt="UTN Logo" width={48} height={48} className="w-12 h-12 object-contain" />
                <div className="absolute -top-1 -right-1 bg-[#2C2825] p-2 rounded-xl shadow-lg">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                </div>
              </div>

              <div className="px-4 py-1.5 rounded-full bg-[#2C2825] text-white text-[9px] font-black uppercase tracking-[0.2em] mb-4 shadow-sm inline-block">
                Sumate a la plataforma
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#3D3229] tracking-tighter leading-none mb-4 uppercase">
                HOLA,<br />
                <span className="bg-gradient-to-r from-[#D84545] to-[#4A7A52] bg-clip-text text-transparent italic">ESTUDIANTE</span>
              </h2>
              
              <p className="text-[#6B5A50] text-lg lg:text-xl font-bold leading-tight">
                Apoya el crecimiento de la plataforma
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[#A89F95] mt-4">
                <div className="h-px w-8 bg-[#D5CAC0]" />
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Impulsá el proyecto</span>
                </div>
                <div className="h-px w-8 bg-[#D5CAC0]" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Donation Form */}
          <div className="lg:col-span-1 xl:col-span-7 bg-white p-5 sm:p-6 lg:p-10 flex flex-col justify-center">
            {/* Mobile Header: Logo & Branding (Only visible on mobile/tablet) */}
            <div className="flex lg:hidden items-center gap-3 mb-6 p-3.5 pr-12 rounded-2xl bg-gradient-to-r from-[#8BAA91]/10 via-[#D5E8DB]/5 to-[#F5EFE5]/10 border border-[#8BAA91]/15">
              <Image src="/utn-logo-optimized.webp" alt="UTN Logo" width={32} height={32} className="w-8 h-8 object-contain" />
              <div>
                <h2 className="text-sm font-black text-[#3D3229] uppercase tracking-tight">UTN Hub</h2>
                <p className="text-[10px] text-[#6B5A50] font-bold">Apoya el crecimiento de la plataforma</p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#F9F7F4] border border-[#EDE6DD] flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#8BAA91]" />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#8B7355] uppercase tracking-[0.2em]">Paso Seguro</h3>
                <p className="text-lg font-black text-[#3D3229]">Elegi el monto a donar</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedPreset(amount);
                    setCustomAmount("");
                  }}
                  className={cn(
                    "relative py-4 rounded-2xl text-base font-black transition-all duration-300 border-2",
                    selectedPreset === amount 
                      ? "bg-[#2C2825] text-white border-[#2C2825] shadow-xl scale-[1.05] z-10"
                      : "bg-white text-[#3D3229] border-[#EDE6DD] hover:border-[#8BAA91] hover:-translate-y-1"
                  )}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <div className="relative mb-6 group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[#8BAA91] font-black text-xl">$</span>
              <input
                type="text"
                placeholder="Introducir otro monto..."
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value.replace(/[^0-9]/g, ""));
                  setSelectedPreset(null);
                }}
                className={cn(
                  "w-full pl-10 pr-6 py-4 rounded-2xl border-2 bg-white text-base font-black transition-all outline-none text-[#3D3229] placeholder:text-[#D5CAC0]",
                  !selectedPreset && customAmount ? "border-[#8BAA91] ring-8 ring-[#8BAA91]/5" : "border-[#EDE6DD] focus:border-[#8BAA91]"
                )}
              />
            </div>

            <button
              onClick={handleDonate}
              disabled={currentAmount <= 0 || isLoading}
              className={cn(
                "group relative w-full flex items-center justify-center gap-4 py-5 rounded-[2rem] font-black text-lg transition-all duration-500 overflow-hidden shadow-2xl",
                currentAmount > 0 && !isLoading
                  ? "bg-[#2C2825] text-white hover:bg-black"
                  : "bg-[#EDE6DD] text-[#A89F95] cursor-not-allowed"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Procesando</span>
                </div>
              ) : (
                <>
                  <Wallet className="w-6 h-6 text-[#8BAA91]" />
                  <span>Donar Ahora</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2 text-[#8BAA91]" />
                </>
              )}
            </button>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-[#F5F1EB]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8BAA91]" />
                <span className="text-[9px] font-black text-[#A89F95] uppercase tracking-widest text-center sm:text-left">
                  Seguro via Mercado Pago
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
