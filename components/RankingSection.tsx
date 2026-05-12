"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Trophy, Medal, Star, ChevronRight } from "lucide-react";
import { RankingModal } from "./RankingModal";

type UploaderStat = {
  name: string;
  count: number;
};

export function RankingSection() {
  const [allUploaders, setAllUploaders] = useState<UploaderStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const notesQuery = query(collection(db, "notes"), where("status", "==", "approved"));

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        const counts: Record<string, number> = {};
        
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          let author = data.author as string | undefined;
          
          if (author) {
            author = author.trim();
            // Ignorar los que no tienen nombre o son "Anonimo"
            if (author.toLowerCase() !== "anonimo" && author.toLowerCase() !== "anónimo" && author !== "") {
              counts[author] = (counts[author] || 0) + 1;
            }
          }
        });

        const sorted: UploaderStat[] = Object.entries(counts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        setAllUploaders(sorted);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching notes for ranking:", error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (loading) return (
    <section className="mb-16 mt-8">
      <div className="h-12 bg-zinc-200 border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] w-64 rounded-xl mb-8 animate-pulse"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-white border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] rounded-2xl animate-pulse"></div>
        ))}
      </div>
    </section>
  );
  
  if (allUploaders.length === 0) return null;

  const topUploaders = allUploaders.slice(0, 5);

  return (
    <section className="mb-16 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 uppercase tracking-tight flex items-center gap-3">
            <Trophy className="w-10 h-10 text-emerald-500" strokeWidth={3} />
            Top Colaboradores
          </h2>
          <div className="w-24 h-2 bg-emerald-500 mt-2 mb-2"></div>
          <p className="text-zinc-600 font-bold uppercase tracking-widest text-sm">Los que más apuntes subieron</p>
        </div>
        
        {allUploaders.length > 5 && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 font-black text-zinc-900 bg-emerald-400 border-4 border-zinc-900 px-6 py-3 rounded-xl hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all active:translate-y-0 active:shadow-none uppercase tracking-widest"
          >
            Ver Ranking <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {topUploaders.map((uploader, index) => (
          <div 
            key={uploader.name} 
            className="group/rank flex items-center gap-4 bg-white p-4 rounded-2xl border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] hover:shadow-[8px_8px_0px_0px_rgba(16,185,129,1)] hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl transition-transform duration-300 group-hover/rank:scale-110 group-hover/rank:-rotate-6 border-4 border-zinc-900
              ${index === 0 ? 'bg-yellow-400 text-zinc-900' : 
                index === 1 ? 'bg-zinc-300 text-zinc-900' : 
                index === 2 ? 'bg-orange-400 text-zinc-900' : 
                'bg-emerald-400 text-zinc-900'}`}
            >
              #{index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-zinc-900 truncate uppercase text-lg group-hover/rank:text-emerald-600 transition-colors">{uploader.name}</h3>
              <p className="text-xs font-bold text-zinc-900 bg-emerald-200 border-2 border-zinc-900 inline-block px-2 py-0.5 rounded-md mt-1 uppercase tracking-wider">
                {uploader.count} {uploader.count === 1 ? 'apunte' : 'apuntes'}
              </p>
            </div>
            <div className="opacity-0 group-hover/rank:opacity-100 transition-opacity duration-300">
              {index < 3 ? (
                <Medal className={`w-6 h-6 animate-pulse
                  ${index === 0 ? 'text-yellow-500' : 
                    index === 1 ? 'text-zinc-500' : 
                    'text-orange-500'}`} strokeWidth={3}
                />
              ) : (
                <Star className="w-6 h-6 text-emerald-500" strokeWidth={3} />
              )}
            </div>
          </div>
        ))}
      </div>

      <RankingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        uploaders={allUploaders} 
      />
    </section>
  );
}
