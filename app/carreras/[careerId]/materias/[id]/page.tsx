import { Fragment } from "react";
import { subjectsData, careersData, yearConfig, type Note } from "@/lib/data";
import { DocumentListItem, type CustomStyle } from "@/components/DocumentListItem";
import { BulkDownloadButton } from "@/components/BulkDownloadButton";
import { EmptyState } from "@/components/EmptyState";
import {
  ChevronRight,
  ArrowLeft,
  FileText,
  Plus,
  Sprout,
  BookOpen,
  Microscope,
  Rocket,
  GraduationCap,
  Award,
  FolderOpen,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

const yearIcons: Record<string, React.ElementType> = { Sprout, BookOpen, Microscope, Rocket, GraduationCap, Award };
const CREATOR_AUTHOR = "facundo rodriguez";

const getNoteScore = (note: Note) => (note.upvotes ?? 0) - (note.downvotes ?? 0);
const normalizeFolderName = (value?: string | null) => value?.replace(/\s+/g, " ").trim() ?? "";
const normalizeAuthorName = (value?: string | null) =>
  (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

type DisplayItem = 
  | { type: "note"; note: Note; date: string }
  | { type: "folder"; label: string; notes: Note[]; date: string; key: string };

type YearStyle = (typeof yearConfig)[keyof typeof yearConfig];

const typeOrder: Record<string, number> = {
  "Resumen": 1,
  "Trabajo Práctico": 2,
  "Guía de Ejercicios": 3,
  "Examen": 4,
};
const getTypeWeight = (type: string) => typeOrder[type] || 5;

const buildDisplayList = (notes: Note[], order: string = "newest"): DisplayItem[] => {
  const items: DisplayItem[] = [];
  const folderGroups = new Map<string, Note[]>();

  notes.forEach((note) => {
    const folderLabel = normalizeFolderName(note.folderName);
    if (!folderLabel) {
      items.push({ type: "note", note, date: note.uploadDate || "" });
    } else {
      const typeLabel = note.type || "Otros";
      const groupKey = `${folderLabel}||${typeLabel}`;
      if (!folderGroups.has(groupKey)) {
        folderGroups.set(groupKey, []);
      }
      folderGroups.get(groupKey)!.push(note);
    }
  });

  folderGroups.forEach((notes, key) => {
    const label = key.split("||")[0];
    const typeLabel = key.split("||")[1];
    let dateValue = "";
    if (order === "score") {
      // Para score, usamos un placeholder que no rompa localeCompare o usamos otro criterio?
      // En realidad el sort final usa el criterio global.
      // Vamos a calcular el "valor representativo" de la carpeta según el criterio.
      const bestNote = notes.reduce((best, cur) => (getNoteScore(cur) > getNoteScore(best) ? cur : best), notes[0]);
      dateValue = bestNote.uploadDate || ""; // Fallback a fecha para mantener consistencia de tipo string
    } else {
      dateValue = notes.reduce((max, n) => (n.uploadDate > (max || "") ? n.uploadDate : max), "");
    }
    
    items.push({ 
      type: "folder", 
      label, 
      notes, 
      date: dateValue || "", 
      key: `folder-${label}-${typeLabel}` 
    });
  });

  return items.sort((a, b) => {
    const typeA = a.type === "note" ? (a.note.type || "Otros") : (a.notes[0]?.type || "Otros");
    const typeB = b.type === "note" ? (b.note.type || "Otros") : (b.notes[0]?.type || "Otros");
    const weightA = getTypeWeight(typeA);
    const weightB = getTypeWeight(typeB);
    if (weightA !== weightB) return weightA - weightB;

    const priorityA = a.type === "note" ? (a.note.priority || 0) : Math.max(...a.notes.map(n => n.priority || 0));
    const priorityB = b.type === "note" ? (b.note.priority || 0) : Math.max(...b.notes.map(n => n.priority || 0));
    if (priorityA !== priorityB) return priorityB - priorityA;

    if (order === "oldest") return a.date.localeCompare(b.date);
    if (order === "alphabetical") {
      const labelA = a.type === "folder" ? a.label : (a.note.title || "");
      const labelB = b.type === "folder" ? b.label : (b.note.title || "");
      return labelA.localeCompare(labelB, "es-AR", { numeric: true });
    }
    if (order === "score") {
      const scoreA = a.type === "note" ? getNoteScore(a.note) : Math.max(...a.notes.map(getNoteScore));
      const scoreB = b.type === "note" ? getNoteScore(b.note) : Math.max(...b.notes.map(getNoteScore));
      if (scoreA !== scoreB) return scoreB - scoreA;
      return b.date.localeCompare(a.date);
    }
    // Default newest
    return b.date.localeCompare(a.date);
  });
};

// Componente para renderizar una carpeta
function FolderItem({ 
  group, 
  itemIndex, 
  openFoldersByDefault, 
  yc, 
  customStyles 
}: { 
  group: { label: string; notes: Note[]; key: string };
  itemIndex: number;
  openFoldersByDefault: boolean;
  yc: YearStyle;
  customStyles: Record<string, CustomStyle>;
}) {
  const normLabel = normalizeAuthorName(group.label);
  const allSameAuthor = group.notes.length > 0 && group.notes.every((note) => normalizeAuthorName(note.author) === normalizeAuthorName(group.notes[0].author)) ? normalizeAuthorName(group.notes[0].author) : null;
  const isCreatorFolder = normLabel === CREATOR_AUTHOR || allSameAuthor === CREATOR_AUTHOR;
  const customStyleFolder = customStyles[normLabel] || (allSameAuthor ? customStyles[allSameAuthor] : null);

  let buttonHex = yc.accent;
  if (isCreatorFolder) buttonHex = "#D4AF37";
  else if (customStyleFolder) buttonHex = customStyleFolder.color;

  let wrapperClass = "border-[3px] border-zinc-900 bg-white shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] open:shadow-[6px_6px_0px_0px_rgba(16,185,129,1)]";
  let textClass = "text-zinc-900";
  let iconClass = "text-emerald-600";
  let badgeClass = "bg-emerald-400 text-zinc-900 border-2 border-zinc-900";
  let chevronClass = "text-zinc-600";
  let innerBorderClass = "border-zinc-300";

  if (isCreatorFolder) {
    wrapperClass = "border-[3px] border-amber-500 bg-amber-50 shadow-[4px_4px_0px_0px_rgba(245,158,11,1)] open:shadow-[6px_6px_0px_0px_rgba(245,158,11,1)]";
    textClass = "text-amber-900";
    iconClass = "text-amber-600";
    badgeClass = "bg-amber-500 text-white border-2 border-amber-700";
    chevronClass = "text-amber-600";
    innerBorderClass = "border-amber-300";
  } else if (customStyleFolder) {
    wrapperClass = "border-transparent bg-white"; 
    badgeClass = "text-white";
  }

  return (
    <details
      open={openFoldersByDefault}
      className={`animate-fade-in-up rounded-xl transition-all hover:-translate-y-0.5 group/folder z-10 relative ${wrapperClass}`}
      style={{ 
        animationDelay: `${itemIndex * 50}ms`,
        ...(customStyleFolder && !isCreatorFolder ? {
          backgroundColor: customStyleFolder.color + "10",
          borderColor: customStyleFolder.color + "40"
        } : {})
      }}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl px-4 py-3">
        <div className={`flex items-center gap-2 ${textClass}`} style={customStyleFolder && !isCreatorFolder ? { color: customStyleFolder.color } : {}}>
          <FolderOpen className={`w-4 h-4 ${iconClass}`} style={customStyleFolder && !isCreatorFolder ? { color: customStyleFolder.color } : {}} />
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold">{group.label}</h3>
            {customStyleFolder && !isCreatorFolder && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: customStyleFolder.color }}>
                {customStyleFolder.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BulkDownloadButton notes={group.notes} label="Descargar" compact={true} customHex={buttonHex} />
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badgeClass}`} style={customStyleFolder && !isCreatorFolder ? { backgroundColor: customStyleFolder.color } : {}}>
            {group.notes.length}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 group-open/folder:rotate-180 ${chevronClass}`} style={customStyleFolder && !isCreatorFolder ? { color: customStyleFolder.color } : {}} />
        </div>
      </summary>
      <div className={`border-t px-3 pb-2 pt-4 ${innerBorderClass}`} style={customStyleFolder && !isCreatorFolder ? { borderColor: customStyleFolder.color + "33" } : {}}>
        <div className="flex flex-col gap-2.5">
          {group.notes.map((note, index) => (
            <div key={note.id} className="animate-fade-in-up" style={{ animationDelay: `${(index % 10) * 40 + 200}ms` }}>
              <DocumentListItem note={note} index={index} customStyles={customStyles} />
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

export default async function SubjectProfile({ params }: { params: Promise<{ careerId: string; id: string }> }) {
  const resolvedParams = await params;
  const subject = subjectsData.find((item) => item.id === resolvedParams.id);
  const career = careersData.find((item) => item.id === resolvedParams.careerId);

  if (!subject || !career) return notFound();

  let realNotes: Note[] = [];
  let customStyles: Record<string, { color: string; label: string }> = {};
  let noteSortingOrder = "newest";
  
  try {
    const globalSnap = await getDoc(doc(db, "settings", "global"));
    if (globalSnap.exists()) {
      customStyles = globalSnap.data().authorStyles || {};
      noteSortingOrder = globalSnap.data().noteSortingOrder || "newest";
    }
    
    const notesQuery = query(
      collection(db, "notes"),
      where("subjectId", "==", resolvedParams.id),
      where("status", "==", "approved")
    );
    const querySnapshot = await getDocs(notesQuery);

    realNotes = querySnapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        type: data.type === "Examen Resuelto" ? "Examen" : data.type,
      };
    }) as Note[];

    realNotes.sort((a, b) => {
      const typeDiff = getTypeWeight(a.type) - getTypeWeight(b.type);
      if (typeDiff !== 0) return typeDiff;

      const priorityDiff = (b.priority || 0) - (a.priority || 0);
      if (priorityDiff !== 0) return priorityDiff;

      if (noteSortingOrder === "oldest") return (a.uploadDate || "").localeCompare(b.uploadDate || "");
      if (noteSortingOrder === "score") {
        const scoreDiff = getNoteScore(b) - getNoteScore(a);
        if (scoreDiff !== 0) return scoreDiff;
        return (b.uploadDate || "").localeCompare(a.uploadDate || ""); // Tie-breaker newest
      }
      if (noteSortingOrder === "alphabetical") {
        return (a.title || "").localeCompare(b.title || "", "es-AR", { numeric: true });
      }
      // Default: newest
      const dateA = a.uploadDate || "";
      const dateB = b.uploadDate || "";
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      
      const scoreDiff = getNoteScore(b) - getNoteScore(a);
      if (scoreDiff !== 0) return scoreDiff;

      return (a.title || "").localeCompare(b.title || "", "es-AR", { numeric: true });
    });
  } catch (err) {
    console.error("Error fetching data:", err);
  }

  const yc = yearConfig[subject.year];
  const YearIcon = yearIcons[yc.icon];
  const notesCount = realNotes.length;
  const displayList = buildDisplayList(realNotes, noteSortingOrder);
  const openFoldersByDefault = displayList.length === 1 && displayList[0].type === "folder";

  return (
    <div className="relative flex-1 flex flex-col bg-[#F7F5F0] selection:bg-emerald-200 selection:text-emerald-900">
      {/* Neo-Brutalist Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>

      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center text-sm text-zinc-500 gap-1.5 flex-wrap font-bold">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/carreras/${career.id}`} className="hover:text-emerald-600 transition-colors">{career.shortName}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-zinc-900 font-black uppercase">{subject.name}</span>
          </div>
          <Link href={`/carreras/${career.id}`} className="inline-flex items-center text-sm font-black text-zinc-700 hover:text-emerald-600 transition-colors group uppercase tracking-wider">
            <ArrowLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-1 transition-transform" /> Volver
          </Link>
        </div>

        <div className="bg-white rounded-xl border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] overflow-hidden mb-8 z-10 relative">
          <div className="h-2 w-full bg-emerald-400" />
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl border-[3px] border-zinc-900 bg-emerald-100 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)] flex items-center justify-center">
                  {YearIcon && <YearIcon className="w-6 h-6 text-zinc-900" />}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-zinc-900 mb-1 uppercase tracking-tight">{subject.name}</h1>
                  <p className="text-sm text-zinc-600 font-semibold">{career.shortName} · Material compartido por la comunidad</p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-black px-3 py-1.5 bg-zinc-900 text-emerald-400 border-2 border-zinc-900 uppercase tracking-wider self-start">
                {yc.label}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2 uppercase tracking-tight">
            <FileText className="w-5 h-5 text-emerald-600" />
            Apuntes
            <span className="text-xs font-black px-2.5 py-1 bg-emerald-400 text-zinc-900 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">{notesCount}</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            {realNotes.length > 0 && <BulkDownloadButton notes={realNotes} label="Descargar todos" />}
            <Link
              href={`/upload?carrera=${career.id}&materia=${subject.id}&anio=${subject.year}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-black text-zinc-900 uppercase tracking-wider bg-white border-[3px] border-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(16,185,129,1)] active:translate-y-0 active:shadow-[1px_1px_0px_0px_rgba(24,24,27,1)] transition-all duration-200"
            >
              <Plus className="w-4 h-4" /> Subir nuevo
            </Link>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {realNotes.length > 0 ? (
            displayList.map((item, itemIndex) => {
              const currentType = item.type === "note" ? (item.note.type || "Otros") : (item.notes[0]?.type || "Otros");
              const prevItem = itemIndex > 0 ? displayList[itemIndex - 1] : null;
              const prevType = prevItem ? (prevItem.type === "note" ? (prevItem.note.type || "Otros") : (prevItem.notes[0]?.type || "Otros")) : null;
              const showSeparator = currentType !== prevType;

              return (
                <Fragment key={item.type === "note" ? item.note.id : item.key}>
                  {showSeparator && (
                    <div className={`flex items-center gap-3 w-full mb-1 ${itemIndex === 0 ? "mt-0" : "mt-4"}`}>
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-zinc-900 px-3 py-1.5 bg-emerald-100 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
                        {currentType}
                      </span>
                      <div className="h-[2px] flex-1 bg-zinc-300" />
                    </div>
                  )}
                  <div className="animate-fade-in-up" style={{ animationDelay: `${(itemIndex % 10) * 40 + 100}ms` }}>
                    {item.type === "note" ? (
                      <DocumentListItem note={item.note} index={itemIndex} customStyles={customStyles} />
                    ) : (
                      <FolderItem group={item} itemIndex={itemIndex} openFoldersByDefault={openFoldersByDefault} yc={yc} customStyles={customStyles} />
                    )}
                  </div>
                </Fragment>
              );
            })
          ) : (
            <EmptyState careerId={career.id} subjectId={subject.id} year={subject.year} />
          )}
        </div>
      </div>
    </div>
  );
}
