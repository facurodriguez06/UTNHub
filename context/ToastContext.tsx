"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((current) => [...current, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast List Container */}
      <div className="fixed bottom-6 right-6 z-[10001] flex flex-col gap-3 pointer-events-none max-w-[calc(100vw-1.5rem)]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "pointer-events-auto flex items-center gap-3 px-5 py-4 bg-white rounded-none border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] transition-all duration-500 animate-fade-in-up",
              toast.type === "success" && "text-zinc-900",
              toast.type === "error" && "text-zinc-900",
              toast.type === "info" && "text-zinc-900"
            )}
          >
            <div className={cn(
              "p-2 rounded-none border-2 border-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]",
              toast.type === "success" && "bg-emerald-400 text-zinc-900",
              toast.type === "error" && "bg-red-400 text-zinc-900",
              toast.type === "info" && "bg-yellow-300 text-zinc-900"
            )}>
              {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
              {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
              {toast.type === "info" && <Info className="w-5 h-5" />}
            </div>
            
            <p className="text-sm font-black uppercase tracking-tight pr-4">
              {toast.message}
            </p>

            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-auto p-1.5 hover:bg-zinc-900 hover:text-white rounded-none text-zinc-400 transition-colors border-2 border-transparent hover:border-zinc-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
