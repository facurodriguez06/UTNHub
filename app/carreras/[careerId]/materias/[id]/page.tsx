import { Fragment } from "react";
import { subjectsData, careersData, yearConfig, type Note } from "@/lib/data";
import { DocumentListItem } from "@/components/DocumentListItem";
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
  yc: any;
  customStyles: any;
}) {
  const normLabel = normalizeAuthorName(group.label);
  const allSameAuthor = group.notes.length > 0 && group.notes.every((note) => normalizeAuthorName(note.author) === normalizeAuthorName(group.notes[0].author)) ? normalizeAuthorName(group.notes[0].author) : null;
  const isCreatorFolder = normLabel === CREATOR_AUTHOR || allSameAuthor === CREATOR_AUTHOR;
  const customStyleFolder = customStyles[normLabel] || (allSameAuthor ? customStyles[allSameAuthor] : null);

  let buttonHex = yc.accent;
  if (isCreatorFolder) buttonHex = "#D4AF37";
  else if (customStyleFolder) buttonHex = customStyleFolder.color;

  let wrapperClass = "border-[#EDE6DD] bg-[#FCFAF8] open:bg-white";
  let textClass = "text-[#4A433C]";
  let iconClass = "text-[#8BAA91]";
  let badgeClass = `${yc.bg} ${yc.text}`;
  let chevronClass = "text-[#A89F95]";
  let innerBorderClass = "border-[#EDE6DD]";

  if (isCreatorFolder) {
    wrapperClass = "border-[#E2C15F] bg-gradient-to-r from-[#FFF8E1] to-[#FFF4CC] open:bg-[#FFFDF5]";
    textClass = "text-[#7A5A0A]";
    iconClass = "text-[#D4AF37]";
    badgeClass = "bg-[#D4AF37] text-white";
    chevronClass = "text-[#B78D28]";
    innerBorderClass = "border-[#E7D39A]";
  } else if (customStyleFolder) {
    wrapperClass = "border-transparent bg-white"; 
    badgeClass = "text-white";
  }

  return (
    <details
      open={openFoldersByDefault}
      className={`animate-fade-in-up rounded-2xl border transition-all hover:shadow-md group/folder z-10 relative ${wrapperClass}`}
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
    <div className="relative flex-1 flex flex-col">
      <div className="blob w-72 h-72 top-10 -right-20 animate-blob" style={{ backgroundColor: yc.accent }} />

      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center text-sm text-[#A89F95] gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-[#4A7A52] transition-colors">Inicio</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href={`/carreras/${career.id}`} className="hover:text-[#4A7A52] transition-colors">{career.shortName}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#3D3229] font-semibold">{subject.name}</span>
          </div>
          <Link href={`/carreras/${career.id}`} className="inline-flex items-center text-sm font-semibold text-[#7A6E62] hover:text-[#4A7A52] transition-colors group">
            <ArrowLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-0.5 transition-transform" /> Volver
          </Link>
        </div>

        <div className="bg-white/80 shadow-sm rounded-3xl border border-[#EDE6DD] overflow-hidden mb-8 shadow-[0_8px_30px_rgba(61,50,41,0.04)] z-10 relative">
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(to right, ${yc.accent}, ${yc.accent}88)` }} />
          <div className="p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${yc.bg}`}>
                  {YearIcon && <YearIcon className={`w-5 h-5 ${yc.text}`} />}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#3D3229] mb-1">{subject.name}</h1>
                  <p className="text-sm text-[#A89F95]">{career.shortName} · Material compartido por la comunidad</p>
                </div>
              </div>
              <span className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded-full ${yc.bg} ${yc.text} self-start`}>
                {yc.label}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-extrabold text-[var(--text-primary)] flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--sage)]" />
            Apuntes
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${yc.bg} ${yc.text}`}>{notesCount}</span>
          </h2>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            {realNotes.length > 0 && <BulkDownloadButton notes={realNotes} label="Descargar todos" />}
            <Link
              href={`/upload?carrera=${career.id}&materia=${subject.id}&anio=${subject.year}`}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold text-[var(--sage-text)] bg-gradient-to-b from-[var(--bg-card)] to-[var(--bg-warm)] shadow-sm border border-[var(--border-soft)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:from-[var(--bg-cream)] hover:to-[var(--bg-warm)] hover:shadow-md transition-all duration-300 active:scale-95 group/btn hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> Subir nuevo
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
                      <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#A89F95] px-3 py-1.5 bg-[#F5F0EA]/80 shadow-[0_0_10px_rgba(0,0,0,0.02)] rounded-lg border border-[#EDE6DD]">
                        {currentType}
                      </span>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-[#EDE6DD] to-transparent" />
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
