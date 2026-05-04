"use client";

import { useEffect } from "react";

export function AntiDevtools() {
  useEffect(() => {
    const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    if (!isProd) return;

    // 1. Silenciar consola
    const noop = () => undefined;
    const methods: Array<"log" | "debug" | "info" | "warn" | "error" | "table" | "dir"> = ['log', 'debug', 'info', 'warn', 'error', 'table', 'dir'];
    methods.forEach((method) => { console[method] = noop; });

    // 2. Bloqueo de teclado e inspección
    const preventContext = (e: MouseEvent) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', preventContext);
    document.addEventListener('keydown', preventKeys);

    return () => {
      document.removeEventListener('contextmenu', preventContext);
      document.removeEventListener('keydown', preventKeys);
    };
  }, []);

  return null;
}
