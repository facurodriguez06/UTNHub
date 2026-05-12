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

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useScrollLock(isOpen);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
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

  const modalContent = (
    <div 
      className={cn(
        "fixed inset-0 z-[10000] flex items-center justify-center p-4 transition-all duration-200",
        isClosing ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm animate-fade-in" onClick={handleClose} />

      <div className={cn(
        "relative w-full max-w-4xl bg-white border-4 border-zinc-900 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 transform pointer-events-auto",
        isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'
      )}>
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute -top-6 -right-6 w-12 h-12 bg-white border-4 border-zinc-900 flex items-center justify-center text-zinc-900 hover:bg-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all z-50 group"
        >
          <X className="w-6 h-6 group-hover:rotate-90 transition-transform" strokeWidth={4} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: Branding */}
          <div className="bg-emerald-400 p-8 border-b-4 md:border-b-0 md:border-r-4 border-zinc-900 flex flex-col justify-center items-center text-center">
            <div className="w-24 h-24 bg-white border-4 border-zinc-900 flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6 animate-bounce-slow">
              <Image src="/utn-logo-optimized.webp" alt="UTN Logo" width={64} height={64} className="w-16 h-16 object-contain" />
            </div>

            <h2 className="text-4xl font-black text-zinc-900 tracking-tighter leading-none mb-4 uppercase italic">
              UTN<span className="text-white">HUB</span>
            </h2>
            <p className="text-zinc-900 text-lg font-black uppercase tracking-widest bg-white border-2 border-zinc-900 px-4 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              Apoyá el proyecto
            </p>
            
            <div className="mt-8 space-y-2">
              <p className="text-zinc-900 text-sm font-black uppercase tracking-tighter italic">
                Mantener los servidores no es gratis.
              </p>
              <p className="text-zinc-900 text-sm font-black uppercase tracking-tighter italic">
                Tu aporte nos ayuda a seguir creciendo.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div className="p-8 bg-white flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-yellow-400 border-4 border-zinc-900 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <DollarSign className="w-6 h-6 text-zinc-900" strokeWidth={4} />
              </div>
              <div>
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Elegir monto</h3>
                <p className="text-xl font-black text-zinc-900 uppercase tracking-tighter">Colaborá ahora</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setSelectedPreset(amount);
                    setCustomAmount("");
                  }}
                  className={cn(
                    "py-4 text-lg font-black transition-all border-4 border-zinc-900 uppercase tracking-tighter",
                    selectedPreset === amount 
                      ? "bg-zinc-900 text-white shadow-none translate-x-[2px] translate-y-[2px]"
                      : "bg-white text-zinc-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-zinc-50 active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                  )}
                >
                  ${amount}
                </button>
              ))}
            </div>

            <div className="relative mb-8">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-900 font-black text-xl">$</div>
              <input
                type="text"
                placeholder="OTRO MONTO..."
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value.replace(/[^0-9]/g, ""));
                  setSelectedPreset(null);
                }}
                className="w-full pl-10 pr-6 py-4 bg-white border-4 border-zinc-900 text-lg font-black uppercase tracking-tighter outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] transition-all placeholder:text-zinc-300"
              />
            </div>

            <button
              onClick={handleDonate}
              disabled={currentAmount <= 0 || isLoading}
              className={cn(
                "w-full flex items-center justify-center gap-4 py-5 border-4 border-zinc-900 font-black text-xl uppercase tracking-widest transition-all",
                currentAmount > 0 && !isLoading
                  ? "bg-emerald-400 text-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed border-zinc-200 shadow-none"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-4 border-zinc-900 border-t-transparent animate-spin" />
                  <span>PROCESANDO</span>
                </div>
              ) : (
                <>
                  <Wallet className="w-6 h-6" strokeWidth={3} />
                  <span>DONAR ${currentAmount}</span>
                </>
              )}
            </button>

            <div className="mt-8 flex items-center justify-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" strokeWidth={3} />
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                Seguro vía MERCADO PAGO
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
