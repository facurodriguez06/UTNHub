"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { doc, increment, setDoc, type FieldValue } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export function MetricsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Si entramos al panel admin, no contamos la visita
    if (pathname?.startsWith('/admin')) return;

    const track = async () => {
      try {
        // Ignorar en entorno localhost para no ensuciar datos
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') return;

        const d = new Date();
        const baTime = new Date(d.toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
        const today = baTime.getFullYear() + '-' + String(baTime.getMonth() + 1).padStart(2, '0') + '-' + String(baTime.getDate()).padStart(2, '0');
        const isNewSession = !sessionStorage.getItem("tracked_session");
        
        const updateData: {
          pageViews: FieldValue;
          lastActive: string;
          uniqueVisitors?: FieldValue;
        } = { 
          pageViews: increment(1), 
          lastActive: new Date().toISOString() 
        };
        
        if (isNewSession) {
          updateData.uniqueVisitors = increment(1);
          sessionStorage.setItem("tracked_session", "true");
        }

        await setDoc(doc(db, "metrics", today), updateData, { merge: true });
        await setDoc(doc(db, "metrics", "total"), updateData, { merge: true });
      } catch (e) {
        console.error("No se pudo registrar la métrica", e);
      }
    };

    track();
  }, [pathname]);

  return null;
}
