"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { Heart, DollarSign, ArrowRight, Wallet, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESET_AMOUNTS = [500, 1000, 5000];

export function DonationSection() {
  const { showToast } = useToast();
  const [selectedPreset, setSelectedPreset] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePresetClick = (amount: number) => {
    setSelectedPreset(amount);
    setCustomAmount("");
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    setCustomAmount(value);
    setSelectedPreset(null);
  };

  const currentAmount = selectedPreset || parseInt(customAmount) || 0;

  const handleDonate = async () => {
    if (currentAmount <= 0 || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: currentAmount }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Error al generar el link:", data.error);
        showToast(`Error al generar el pago: ${data.error}`, "error");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      showToast("Error de conexión con el servidor.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="mt-20 mb-16 w-full animate-fade-in-up">
      <div 
        className="relative overflow-hidden rounded-none border-4 border-zinc-900 bg-white p-8 md:p-12 shadow-[10px_10px_0px_0px_rgba(24,24,27,1)] transition-all duration-700"
      >

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest mb-6 border-2 border-red-400 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)]">
              <Heart className="h-3 w-3 fill-current" />
              Apoyá el proyecto
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-[1.05] mb-6 uppercase">
              Ayudanos a seguir <br /> 
              <span className="text-emerald-500">creciendo juntos.</span>
            </h2>
            <p className="text-lg text-zinc-600 leading-relaxed mb-8 font-semibold">
              Tu colaboración voluntaria nos permite costear los servidores y seguir mejorando la plataforma para todos. ¡Cualquier monto suma!
            </p>
            
            <div className="flex items-center gap-4 text-sm font-black text-zinc-500">
              <span className="uppercase tracking-wider text-xs">Tu aporte hace la diferencia</span>
            </div>
          </div>

          {/* Donation Control Card */}
          <div className="bg-zinc-50 rounded-none border-[3px] border-zinc-900 p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)]">
            <h3 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <DollarSign className="w-4 h-4 text-emerald-600" /> Elegí un monto
            </h3>

            {/* Grid de montos sugeridos */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handlePresetClick(amount)}
                  className={cn(
                    "py-3 px-2 text-sm font-black transition-all duration-200 border-[3px] active:scale-95",
                    selectedPreset === amount 
                      ? "bg-zinc-900 text-emerald-400 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] -translate-y-1"
                      : "bg-white text-zinc-700 border-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(16,185,129,1)]"
                  )}
                >
                  ${amount}
                </button>
              ))}
            </div>

            {/* Input Manual */}
            <div className="relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-sm">$</span>
              <input
                type="text"
                placeholder="Otro monto..."
                value={customAmount}
                onChange={handleCustomChange}
                className={cn(
                  "w-full pl-8 pr-4 py-3 border-[3px] bg-white text-sm font-black transition-all outline-none",
                  !selectedPreset && customAmount 
                    ? "border-emerald-500 shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]" 
                    : "border-zinc-900 focus:border-emerald-500 focus:shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]"
                )}
              />
            </div>

            <button
              onClick={handleDonate}
              disabled={currentAmount <= 0 || isLoading}
              className={cn(
                "group w-full flex items-center justify-center gap-3 py-4 font-black text-sm transition-all duration-200 border-[3px] uppercase tracking-wider",
                currentAmount > 0 && !isLoading
                  ? "bg-emerald-400 text-zinc-900 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]"
                  : "bg-zinc-200 text-zinc-500 border-zinc-400 cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
                  <span>Procesando...</span>
                </div>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  Donar con Mercado Pago
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
            
            <p className="mt-4 text-[10px] text-center text-zinc-500 font-black uppercase tracking-widest flex items-center justify-center gap-1.5">
              Redirigiendo a sitio seguro <ExternalLink className="w-2.5 h-2.5" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
