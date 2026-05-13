"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { FirebaseError } from "firebase/app";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Check,
  X,
  FileText,
  ShieldAlert,
  Lock,
  ExternalLink,
  LogOut,
  UserPlus,
  Loader2,
  Trash2,
  FolderOpen,
  DollarSign,
  Mail,
  UserCheck,
  Crown,
  Calendar,
  ArrowUpDown,
  BarChart3,
  TrendingUp,
  Download,
  BookOpen,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resolveStorageUrl } from "@/lib/storage";
import type { Note } from "@/lib/data";
import { careersData, subjectsData, yearConfig } from "@/lib/data";
import { useAuth } from "@/context/AuthContext";
import { EditNoteModal } from "@/components/EditNoteModal";
import { Edit, Megaphone, ChevronDown } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, app as primaryApp, db } from "@/lib/firebase/config";
import { initializeApp, getApps } from "firebase/app";
import { collection, query, where, onSnapshot, updateDoc, deleteDoc, doc, setDoc, getDocs, deleteField } from "firebase/firestore";

type AuthError = Partial<FirebaseError> & {
  message?: string;
};

type AdminRecord = {
  id: string;
  email: string;
  createdAt?: string;
};

const toAuthError = (error: unknown): AuthError =>
  (typeof error === "object" && error !== null ? error : {}) as AuthError;

const OWNER_ADMIN_EMAILS = new Set(["facundorodriguezsp@gmail.com"]);

const normalizeAdminEmail = (value?: string | null) => value?.trim().toLowerCase() ?? "";

const buildAdminRecord = (email: string, extra: Record<string, unknown> = {}) => ({
  email,
  createdAt: new Date().toISOString(),
  ...extra,
});

const formatAdminDate = (value?: string) => {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sin fecha" : date.toLocaleDateString();
};

const normalizeFolderName = (value: string) =>
  value.replace(/<[^>]*>/g, "").replace(/[<>"']/g, "").replace(/\s+/g, " ").trim().slice(0, 60);

const getFolderLabel = (note: Note) => normalizeFolderName(note.folderName ?? "");

const mapSnapshotToNotes = (snapshot: { docs: Array<{ id: string; data: () => object }> }, order: string = "newest") => {
  const notes = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as Note[];

  return notes.sort((a, b) => {
    const priorityDiff = (b.priority || 0) - (a.priority || 0);
    if (priorityDiff !== 0) return priorityDiff;

    switch (order) {
      case "oldest":
        return (a.uploadDate || "").localeCompare(b.uploadDate || "");
      case "score": {
        const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
        const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.uploadDate || "").localeCompare(a.uploadDate || "");
      }
      case "alphabetical":
        return (a.title || "").localeCompare(b.title || "", "es-AR", { numeric: true });
      case "newest":
      default: {
        const dateDiff = (b.uploadDate || "").localeCompare(a.uploadDate || "");
        if (dateDiff !== 0) return dateDiff;
        // Default tie-breaker
        return (a.title || "").localeCompare(b.title || "", "es-AR", { numeric: true });
      }
    }
  });
};

function NoteCard({
  note,
  actions,
  extraContent,
}: {
  note: Note;
  actions: ReactNode;
  extraContent?: ReactNode;
}) {
  const folderLabel = getFolderLabel(note);

  return (
    <div className="group flex flex-col gap-4 p-5 rounded-none border-4 border-zinc-900 bg-white shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-emerald-100 text-zinc-900 rounded-none flex items-center justify-center shrink-0 border-4 border-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-zinc-900 leading-tight mb-2 uppercase tracking-tight">{note.title}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-600">
              <span className="font-black text-[10px] uppercase tracking-[0.25em] bg-yellow-300 text-zinc-900 px-2.5 py-1 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">{note.type}</span>
              <span className="w-1.5 h-1.5 rounded-none bg-zinc-400"></span>
              <span className="font-medium uppercase tracking-tight">
                Subido por: <strong className="text-[#4A433C]">{note.author}</strong>
              </span>
              <span className="w-1.5 h-1.5 rounded-none bg-zinc-400"></span>
              <span className="font-black text-zinc-800">{note.uploadDate}</span>
              <span className="w-1.5 h-1.5 rounded-none bg-zinc-400"></span>
              <span className="font-black text-zinc-800">
                {note.fileType} ({note.fileSize})
              </span>
              <span className="w-1.5 h-1.5 rounded-none bg-zinc-400"></span>
              <span className="font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-none text-xs border border-zinc-900 shadow-[2px_2px_0px_0px_rgba(16,185,129,1)]">
                {careersData.find(c => c.id === note.careerId)?.shortName || note.careerId}
              </span>
              <span className="w-1.5 h-1.5 rounded-none bg-zinc-400"></span>
              <span className="font-black text-zinc-900 bg-white px-2 py-0.5 rounded-none text-xs border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(24,24,27,1)]">
                {subjectsData.find(s => s.id === note.subjectId)?.name || note.subjectId}
              </span>
              <span className="w-1.5 h-1.5 rounded-none bg-zinc-400"></span>
              <span className="font-black text-sky-700 bg-sky-100 px-2 py-0.5 rounded-none text-xs border border-zinc-900 shadow-[2px_2px_0px_0px_rgba(125,211,252,1)]">
                {yearConfig[note.year || 0]?.label || `Año ${note.year}`}
              </span>
              {folderLabel && (
                <>
                  <span className="w-1.5 h-1.5 rounded-none bg-zinc-400"></span>
                  <span className="inline-flex items-center gap-1 rounded-none bg-emerald-50 px-2 py-0.5 text-xs font-black text-zinc-900 border-2 border-zinc-900 shadow-[2px_2px_0px_0px_rgba(74,122,82,1)] uppercase tracking-tight">
                    <FolderOpen className="w-3 h-3" />
                    {folderLabel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full sm:w-auto items-center gap-2 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t-4 border-zinc-900 sm:border-0">
          {actions}
        </div>
      </div>

      {extraContent}
    </div>
  );
}

function EmptySection({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="w-20 h-20 bg-[#F9F7F4] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#EDE6DD]">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#2C2825] mb-2">{title}</h3>
      <p className="text-[#7A6E62]">{description}</p>
    </div>
  );
}

function SubjectGroup({
  subject,
  notes,
  onOpenFile,
  onEditNote,
  onDeleteNote,
}: {
  subject: string;
  notes: Note[];
  onOpenFile: (note: Note) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-none border-4 border-zinc-900 overflow-hidden transition-all shadow-[8px_8px_0px_0px_rgba(24,24,27,1)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 p-5 bg-zinc-900 hover:bg-zinc-800 transition-colors"
      >
        <h3 className="text-lg md:text-xl font-black text-white flex flex-wrap items-center gap-3 uppercase tracking-tight text-left">
          <span className="inline-flex items-center px-3 py-1 bg-emerald-400 text-zinc-900 border-2 border-black shadow-[3px_3px_0px_0px_rgba(16,185,129,1)]">
            {subject}
          </span>
          <span className="text-zinc-300 text-sm font-black uppercase tracking-[0.25em]">
            ({notes.length} {notes.length === 1 ? 'apunte' : 'apuntes'})
          </span>
        </h3>
        <span
          className={cn(
            "transform transition-transform duration-300 w-11 h-11 flex items-center justify-center bg-emerald-400 rounded-none border-4 border-black text-zinc-900 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        >
          <ChevronDown className="w-5 h-5" />
        </span>
      </button>
      
      {isOpen && (
        <div className="p-4 md:p-5 grid grid-cols-1 gap-4 bg-zinc-50 border-t-4 border-zinc-900 animate-fade-in-up">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              actions={
                <>
                  <button
                    onClick={() => onOpenFile(note)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-4 border-zinc-900 hover:bg-yellow-300 text-zinc-900 rounded-none font-black uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]"
                    title="Ver archivo"
                    disabled={!note.fileUrl}
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="text-xs">Ver</span>
                  </button>
                  <button
                    onClick={() => onEditNote(note)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-4 border-zinc-900 hover:bg-emerald-200 text-zinc-900 rounded-none font-black uppercase tracking-wider transition-all duration-200 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]"
                    title="Editar apunte"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-xs">Editar</span>
                  </button>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-400 hover:bg-red-300 text-zinc-900 border-4 border-zinc-900 rounded-none font-black uppercase tracking-wider transition-all duration-200 shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]"
                    title="Eliminar apunte aprobado"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-xs">Eliminar</span>
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

const compressImage = async (file: File, maxSizeMB: number = 4): Promise<File> => {
  if (file.size <= maxSizeMB * 1024 * 1024) return file;
  
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        
        const maxDim = 2048;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        
        ctx.drawImage(img, 0, 0, width, height);
        
        let quality = 0.8;
        const targetSize = maxSizeMB * 1024 * 1024;
        
        const tryCompress = () => {
          canvas.toBlob((blob) => {
            if (!blob) return resolve(file);
            
            if (blob.size > targetSize && quality > 0.4) {
              quality -= 0.1;
              tryCompress();
            } else {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            }
          }, "image/jpeg", quality);
        };
        tryCompress();
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const ownerRegistrationAttempted = useRef<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasAdminAccess, setHasAdminAccess] = useState(false);
  const [adminAccessLoading, setAdminAccessLoading] = useState(true);
  const [metrics, setMetrics] = useState({ pageViews: 0, uniqueVisitors: 0, todayViews: 0 });

  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [approvedNotes, setApprovedNotes] = useState<Note[]>([]);
  const [searchAuthor, setSearchAuthor] = useState("");
  const [folderInputs, setFolderInputs] = useState<Record<string, string>>({});
  const [selectedPendingNotes, setSelectedPendingNotes] = useState<string[]>([]);
  const [bulkFolderInput, setBulkFolderInput] = useState("");

  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [isDonationActive, setIsDonationActive] = useState(true);
  const [isDonationPopupActive, setIsDonationPopupActive] = useState(true);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [createAdminMsg, setCreateAdminMsg] = useState({ text: "", type: "" });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const { showToast } = useToast();
  const [adminList, setAdminList] = useState<AdminRecord[]>([]);
  const [adminError, setAdminError] = useState("");

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isImagePopupActive, setIsImagePopupActive] = useState(false);
  const [imagePopupUrl, setImagePopupUrl] = useState("");
  const [imagePopupLink, setImagePopupLink] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(false);
  const [activeTab, setActiveTab] = useState("apuntes");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

  const [authorStyles, setAuthorStyles] = useState<Record<string, {color: string, label: string}>>({});
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorColor, setNewAuthorColor] = useState("#4A7A52");
  const [newAuthorLabel, setNewAuthorLabel] = useState("Amigo");
  const [noteSortingOrder, setNoteSortingOrder] = useState("newest");

  // Custom confirmation state
  const [confirmDeleteAdmin, setConfirmDeleteAdmin] = useState<{ isOpen: boolean; adminMail: string }>({
    isOpen: false,
    adminMail: "",
  });

  const [confirmReset, setConfirmReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const [confirmResetSubjects, setConfirmResetSubjects] = useState(false);
  const [isResettingSubjects, setIsResettingSubjects] = useState(false);
  
  const [confirmResetNotes, setConfirmResetNotes] = useState(false);
  const [isResettingNotes, setIsResettingNotes] = useState(false);

  const [confirmResetDownloads, setConfirmResetDownloads] = useState(false);
  const [isResettingDownloads, setIsResettingDownloads] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState<any>(null);

  useEffect(() => {
    const currentEmail = normalizeAdminEmail(user?.email);

    if (!user) {
      setHasAdminAccess(false);
      setAdminAccessLoading(false);
      setAdminError("");
      return;
    }

    if (!currentEmail) {
      setHasAdminAccess(false);
      setAdminAccessLoading(false);
      setAdminError("Tu cuenta no tiene un correo asociado para validar permisos.");
      return;
    }

    setAdminAccessLoading(true);

    if (OWNER_ADMIN_EMAILS.has(currentEmail)) {
      setHasAdminAccess(true);
      setAdminAccessLoading(false);
      setAdminError("");

      if (ownerRegistrationAttempted.current !== currentEmail) {
        ownerRegistrationAttempted.current = currentEmail;
        setDoc(
          doc(db, "admins", currentEmail),
          buildAdminRecord(currentEmail, { source: "owner-email" }),
          { merge: true }
        ).catch((error) => {
          console.warn("No se pudo registrar el owner como admin automáticamente:", error);
          // Omitimos el setAdminError aquí para que no bloquee o muestre el cartel rojo al owner
          // si llega a fallar (por ej. por cuotas de Firestore excedidas temporalmente).
        });
      }

      return;
    }

    const unsubscribeAdminAccess = onSnapshot(
      doc(db, "admins", currentEmail),
      (docSnap) => {
        const canAccess = docSnap.exists();
        setHasAdminAccess(canAccess);
        setAdminAccessLoading(false);
        setAdminError(canAccess ? "" : "Esta cuenta no esta registrada como moderador.");
      },
      (error) => {
        console.warn("No se pudo validar el acceso admin:", error);
        setHasAdminAccess(false);
        setAdminAccessLoading(false);
        setAdminError("No se pudo validar si esta cuenta es moderador. Revisa las reglas de Firebase.");
      }
    );

    return () => unsubscribeAdminAccess();
  }, [user]);

  useEffect(() => {
    if (showReportModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showReportModal]);

  useEffect(() => {
    if (!user || !hasAdminAccess) {
      setPendingNotes([]);
      setApprovedNotes([]);
      setAdminList([]);
      return;
    }

    const pendingQuery = query(collection(db, "notes"), where("status", "==", "pending"));
    const approvedQuery = query(collection(db, "notes"), where("status", "==", "approved"));

    const unsubscribePending = onSnapshot(
      pendingQuery,
      (snapshot) => {
        setPendingNotes(mapSnapshotToNotes(snapshot, noteSortingOrder));
      },
      (error) => {
        console.warn("Error fetching notes:", error);
      }
    );

    const unsubscribeApproved = onSnapshot(
      approvedQuery,
      (snapshot) => {
        setApprovedNotes(mapSnapshotToNotes(snapshot, noteSortingOrder));
      },
      (error) => {
        console.warn("Error fetching approved notes:", error);
      }
    );

    // Listen for global settings
    const unsubscribeSettings = onSnapshot(
      doc(db, "settings", "global"),
      (docSnap) => {
        if (docSnap.exists()) {
          setIsDonationActive(docSnap.data().isDonationActive ?? true);
          setIsDonationPopupActive(docSnap.data().isDonationPopupActive ?? true);
          setIsAnnouncementActive(docSnap.data().isAnnouncementActive ?? false);
          setAnnouncementTitle(docSnap.data().announcementTitle ?? "");
          setAnnouncementMessage(docSnap.data().announcementMessage ?? "");
          setIsImagePopupActive(docSnap.data().isImagePopupActive ?? false);
          setImagePopupUrl(docSnap.data().imagePopupUrl ?? "");
          setImagePopupLink(docSnap.data().imagePopupLink ?? "");
          setAuthorStyles(docSnap.data().authorStyles || {});
          setNoteSortingOrder(docSnap.data().noteSortingOrder || "newest");
        }
      },
      (error) => console.warn("Error fetching settings:", error)
    );

    // Listen for admin list
    const unsubscribeAdmins = onSnapshot(
      collection(db, "admins"),
      (snapshot) => {
        setAdminList(snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            email: typeof data.email === "string" ? data.email : d.id,
            createdAt: typeof data.createdAt === "string" ? data.createdAt : undefined,
          };
        }));
      },
      (error) => console.warn("Error fetching admins:", error)
    );

    // Listen for metrics
    const unsubscribeMetrics = onSnapshot(collection(db, "metrics"), 
      (snapshot) => {
        let totalViews = 0;
        let totalUnique = 0;
        let todayViews = 0;
        const d = new Date();
        const baTime = new Date(d.toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
        const todayString = baTime.getFullYear() + '-' + String(baTime.getMonth() + 1).padStart(2, '0') + '-' + String(baTime.getDate()).padStart(2, '0');

        snapshot.forEach(d => {
          const data = d.data();
          if (d.id === "total") {
            totalViews = data.pageViews || 0;
            totalUnique = data.uniqueVisitors || 0;
          } else if (d.id === todayString) {
            todayViews = data.pageViews || 0;
          }
        });
        setMetrics({ pageViews: totalViews, uniqueVisitors: totalUnique, todayViews });
      },
      (error) => console.warn("Error fetching metrics:", error)
    );

    return () => {
      unsubscribePending();
      unsubscribeApproved();
      unsubscribeSettings();
      unsubscribeAdmins();
      unsubscribeMetrics();
    };
  }, [user, hasAdminAccess, noteSortingOrder]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      await signInWithEmailAndPassword(auth, normalizeAdminEmail(email), password);
    } catch (err: unknown) {
      const authError = toAuthError(err);
      console.warn(err);
      if(
        authError.code === "auth/invalid-credential" ||
        authError.code === "auth/user-not-found" ||
        authError.code === "auth/wrong-password"
      ) {
        setLoginError("Correo o contraseña incorrectos.");
      } else {
        setLoginError("Ocurrió un error al iniciar sesión.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const authError = toAuthError(err);
      console.warn(err);
      if (authError.code === "auth/popup-closed-by-user") {
        setLoginError("Se cerro el ingreso con Google antes de terminar.");
      } else if (authError.code === "auth/operation-not-allowed") {
        setLoginError("El ingreso con Google no esta habilitado en Firebase.");
      } else {
        setLoginError("No se pudo ingresar con Google.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn(err);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateAdminMsg({ text: "", type: "" });
    setIsCreatingAdmin(true);

    try {
      const adminEmail = normalizeAdminEmail(newAdminEmail);
      const adminPassword = newAdminPassword.trim();

      if (!adminEmail) {
        setCreateAdminMsg({ text: "Ingresa un correo valido.", type: "error" });
        return;
      }

      if (adminPassword) {
        const secondaryApp =
          getApps().find((app) => app.name === "SecondaryApp") ||
          initializeApp(primaryApp.options, "SecondaryApp");
        const secondaryAuth = getAuth(secondaryApp);

        try {
          await createUserWithEmailAndPassword(secondaryAuth, adminEmail, adminPassword);
          await secondaryAuth.signOut();
          await setDoc(doc(db, "admins", adminEmail), buildAdminRecord(adminEmail, { source: "created-from-panel" }), { merge: true });
          setCreateAdminMsg({ text: "Administrador creado y registrado.", type: "success" });
        } catch (err: unknown) {
          const authError = toAuthError(err);

          if (authError.code !== "auth/email-already-in-use") {
            throw err;
          }

          await setDoc(doc(db, "admins", adminEmail), buildAdminRecord(adminEmail, { source: "existing-auth-account" }), { merge: true });
          setCreateAdminMsg({
            text: "Ese correo ya existia: lo registre como moderador. Puede entrar con su cuenta actual.",
            type: "success",
          });
        }
      } else {
        await setDoc(doc(db, "admins", adminEmail), buildAdminRecord(adminEmail, { source: "existing-auth-account" }), { merge: true });
        setCreateAdminMsg({
          text: "Correo registrado como moderador. Si ya tenia cuenta, puede entrar con ese mismo acceso.",
          type: "success",
        });
      }

      setNewAdminEmail("");
      setNewAdminPassword("");

      setTimeout(() => setShowCreateAdmin(false), 3000);
    } catch (err: unknown) {
      const authError = toAuthError(err);
      console.warn(err);
      if (authError.code === "auth/email-already-in-use") {
        setCreateAdminMsg({ text: "Ese correo ya está registrado.", type: "error" });
      } else if (authError.code === "auth/weak-password") {
        setCreateAdminMsg({ text: "La contraseña debe tener al menos 6 caracteres.", type: "error" });
      } else {
        setCreateAdminMsg({ text: "Error al crear administrador.", type: "error" });
      }
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleFolderInputChange = (noteId: string, value: string) => {
    setFolderInputs((current) => ({
      ...current,
      [noteId]: value,
    }));
  };

  const handleUseAuthorFolder = (note: Note) => {
    const authorFolder = normalizeFolderName(note.author ?? "");
    if (!authorFolder || authorFolder.toLowerCase() === "anónimo" || authorFolder.toLowerCase() === "anonimo") {
      setAdminError("Para crear una carpeta por alumno, este apunte necesita un autor identificado.");
      return;
    }

    setAdminError("");
    handleFolderInputChange(note.id, authorFolder);
  };

  const getFolderSuggestions = (note: Note) =>
    Array.from(
      new Set(
        approvedNotes
          .filter((approvedNote) => approvedNote.subjectId === note.subjectId)
          .map((approvedNote) => normalizeFolderName(approvedNote.folderName ?? ""))
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b, "es-AR"));

  const handleApprove = async (note: Note) => {
    setAdminError("");
    const folderName = normalizeFolderName(folderInputs[note.id] ?? "");

    try {
      await updateDoc(doc(db, "notes", note.id), {
        status: "approved",
        folderName: folderName || null,
      });

      setFolderInputs((current) => {
        const next = { ...current };
        delete next[note.id];
        return next;
      });
    } catch (err: unknown) {
      const authError = toAuthError(err);
      console.warn("No se pudo aprobar:", err);
      setAdminError(`Error al aprobar (${authError.code || "unknown"}). Verificá las reglas de Firebase.`);
    }
  };

  const toggleNoteSelection = (id: string) => {
    setSelectedPendingNotes(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]);
  };

  const handleSelectAllPending = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedPendingNotes(filteredPendingNotes.map(n => n.id));
    else setSelectedPendingNotes([]);
  };

  const handleApplyBulkFolder = () => {
    setFolderInputs(prev => {
      const next = { ...prev };
      selectedPendingNotes.forEach(id => {
        next[id] = bulkFolderInput;
      });
      return next;
    });
    showToast("Carpeta aplicada a los seleccionados", "info");
  };

  const filteredPendingNotes = pendingNotes.filter(n => n.author?.toLowerCase().includes(searchAuthor.toLowerCase()));
  const filteredApprovedNotes = approvedNotes.filter(n => n.author?.toLowerCase().includes(searchAuthor.toLowerCase()));

  const handleBulkApprove = async () => {
    const toApprove = pendingNotes.filter(n => selectedPendingNotes.includes(n.id));
    if(toApprove.length === 0) return;
    setAdminError("");
    try {
      await Promise.all(toApprove.map(async (note) => {
        const folderName = normalizeFolderName(folderInputs[note.id] ?? "");
        await updateDoc(doc(db, "notes", note.id), {
          status: "approved",
          folderName: folderName || null,
        });
      }));
      setFolderInputs((current) => {
        const next = { ...current };
        toApprove.forEach(n => delete next[n.id]);
        return next;
      });
      setSelectedPendingNotes([]);
      setBulkFolderInput("");
      showToast(`Se aprobaron ${toApprove.length} apuntes masivamente.`, "success");
    } catch {
      setAdminError("Error al aprobar apuntes masivamente.");
    }
  };

  const handleEditNoteSave = async (updatedFields: Partial<Note>) => {
    if (!editingNote) return;
    try {
      await updateDoc(doc(db, "notes", editingNote.id), updatedFields);
      showToast("Apunte editado correctamente.", "success");
    } catch (error) {
      console.warn(error);
      showToast("Error al editar apunte.", "error");
    }
  };

  const saveImagePopupSettings = async () => {
    setIsUpdatingSettings(true);
    try {
      await setDoc(doc(db, "settings", "global"), {
        isImagePopupActive,
        imagePopupUrl,
        imagePopupLink,
      }, { merge: true });
      showToast("Ajustes de popup de imagen guardados.", "success");
    } catch (err) {
      console.warn(err);
      showToast("Error al guardar popup de imagen.", "error");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast("La imagen del anuncio no puede superar los 10 MB", "error");
      return;
    }

    setIsUploadingImage(true);
    try {
      const processedFile = await compressImage(file, 4);

      const formData = new FormData();
      formData.append("file", processedFile);
      formData.append("type", "image");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Fallo al subir: Error ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setImagePopupUrl(data.url);
      showToast("Imagen subida con éxito", "success");
    } catch (error: unknown) {
      console.warn(error);
      showToast(error instanceof Error ? error.message : "Error al subir imagen", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const saveAnnouncementSettings = async () => {
    setIsUpdatingSettings(true);
    try {
      await setDoc(doc(db, "settings", "global"), {
        isAnnouncementActive,
        announcementTitle,
        announcementMessage,
      }, { merge: true });
      showToast("Ajustes de anuncio guardados.", "success");
    } catch (err) {
      console.warn(err);
      showToast("Error al guardar anuncio.", "error");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const saveSortingSettings = async (order: string) => {
    setIsUpdatingSettings(true);
    setNoteSortingOrder(order);
    try {
      await setDoc(doc(db, "settings", "global"), {
        noteSortingOrder: order,
      }, { merge: true });
      showToast(`Orden actualizado: ${order === 'newest' ? 'Más nuevos' : order === 'oldest' ? 'Más antiguos' : order === 'score' ? 'Mejores puntuados' : 'Alfabético'}`, "success");
    } catch (err) {
      console.warn(err);
      showToast("Error al guardar el orden.", "error");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleSaveAuthorStyle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAuthorName.trim()) return;
    try {
      const normalizedName = newAuthorName
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ").trim().toLowerCase();
      
      await updateDoc(doc(db, "settings", "global"), {
        [`authorStyles.${normalizedName}`]: {
          color: newAuthorColor,
          label: newAuthorLabel
        }
      });
      setNewAuthorName("");
      setNewAuthorLabel("Amigo");
      showToast("Estilo asignado con éxito.", "success");
    } catch(err) { console.warn(err); showToast("Error al guardar.", "error"); }
  };

  const handleDeleteAuthorStyle = async (key: string) => {
    try {
      const { deleteField } = await import("firebase/firestore");
      await updateDoc(doc(db, "settings", "global"), {
        [`authorStyles.${key}`]: deleteField()
      });
      showToast("Estilo eliminado.", "success");
    } catch(err) { console.warn(err); showToast("Error.", "error"); }
  };

  const handleDelete = async (id: string) => {
    setAdminError("");
    try {
      await deleteDoc(doc(db, "notes", id));
    } catch (err: unknown) {
      const authError = toAuthError(err);
      console.warn("No se pudo eliminar:", err);
      setAdminError(`Error al eliminar (${authError.code || "unknown"}). Verificá las reglas de Firebase.`);
    }
  };

  const handleOpenFile = (note: Note) => {
    setAdminError("");

    if (!note.fileUrl) {
      setAdminError("Este apunte no tiene una URL válida para abrir.");
      return;
    }

    window.open(resolveStorageUrl(note.fileUrl), "_blank");
  };

  const toggleDonation = async (type: 'section' | 'popup') => {
    setIsUpdatingSettings(true);
    try {
      const field = type === 'section' ? 'isDonationActive' : 'isDonationPopupActive';
      const currentVal = type === 'section' ? isDonationActive : isDonationPopupActive;
      const newValue = !currentVal;
      
      if (type === 'section') setIsDonationActive(newValue);
      else setIsDonationPopupActive(newValue);
      
      await setDoc(doc(db, "settings", "global"), {
        [field]: newValue,
      }, { merge: true });
    } catch (err) {
      console.warn("Error updating settings:", err);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const toggleImagePopupState = async () => {
    setIsUpdatingSettings(true);
    const newValue = !isImagePopupActive;
    setIsImagePopupActive(newValue);
    try {
      await setDoc(doc(db, "settings", "global"), {
        isImagePopupActive: newValue,
      }, { merge: true });
      showToast(
        newValue ? "Anuncio con imagen activado" : "Anuncio con imagen desactivado", 
        "success"
      );
    } catch (err) {
      console.warn("Error updating settings:", err);
      setIsImagePopupActive(!newValue);
      showToast("Error al cambiar estado", "error");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const toggleAnnouncementState = async () => {
    setIsUpdatingSettings(true);
    const newValue = !isAnnouncementActive;
    setIsAnnouncementActive(newValue);
    try {
      await setDoc(doc(db, "settings", "global"), {
        isAnnouncementActive: newValue,
      }, { merge: true });
      showToast(
        newValue ? "Aviso de texto activado" : "Aviso de texto desactivado", 
        "success"
      );
    } catch (err) {
      console.warn("Error updating settings:", err);
      setIsAnnouncementActive(!newValue);
      showToast("Error al cambiar estado", "error");
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleDeleteAdmin = (adminMail: string) => {
    setConfirmDeleteAdmin({ isOpen: true, adminMail });
  };

  const confirmDeleteAdminAction = async () => {
    const adminMail = confirmDeleteAdmin.adminMail;
    try {
      await deleteDoc(doc(db, "admins", adminMail));
      showToast("Moderador eliminado correctamente", "success");
    } catch (err) {
      console.warn("Error deleting admin:", err);
      showToast("Error al eliminar administrador", "error");
    } finally {
      setConfirmDeleteAdmin({ isOpen: false, adminMail: "" });
    }
  };

  const handleResetPassword = async (email: string) => {
    const { sendPasswordResetEmail } = await import("firebase/auth");
    try {
      await sendPasswordResetEmail(auth, email);
      showToast(`Correo de restablecimiento enviado a ${email}`, "success");
    } catch (err) {
      console.warn("Error resetting password:", err);
      showToast("Error al enviar el correo de restablecimiento.", "error");
    }
  };

  const generateReport = () => {
    const allNotes = [...pendingNotes, ...approvedNotes];
    const now = new Date();
    const baTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Argentina/Buenos_Aires"}));
    const currentMonth = String(baTime.getMonth() + 1).padStart(2, '0');
    const currentYear = String(baTime.getFullYear());
    const monthPrefix = `${currentYear}-${currentMonth}`;

    const monthNotes = allNotes.filter(n => n.uploadDate?.startsWith(monthPrefix));
    
    if (monthNotes.length === 0) {
      showToast("No hay apuntes registrados este mes aún.", "info");
      return;
    }

    // Carrera con más apuntes
    const careerCounts = monthNotes.reduce((acc, n) => {
      acc[n.careerId || 'unknown'] = (acc[n.careerId || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topCareerId = Object.entries(careerCounts).sort((a,b) => b[1] - a[1])[0]?.[0];
    const topCareer = careersData.find(c => c.id === topCareerId)?.name || topCareerId;

    // Materia con más apuntes
    const subjectCounts = monthNotes.reduce((acc, n) => {
      acc[n.subjectId || 'unknown'] = (acc[n.subjectId || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topSubjectId = Object.entries(subjectCounts).sort((a,b) => b[1] - a[1])[0]?.[0];
    const topSubject = subjectsData.find(s => s.id === topSubjectId)?.name || topSubjectId;

    // Usuario que más subió
    const authorCounts = monthNotes.reduce((acc, n) => {
      acc[n.author || 'Anónimo'] = (acc[n.author || 'Anónimo'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topAuthor = Object.entries(authorCounts).sort((a,b) => b[1] - a[1])[0];

    // Más descargadas del mes (si tienen downloadCount)
    const topDownloaded = [...monthNotes].sort((a,b) => (b.downloadCount || 0) - (a.downloadCount || 0)).slice(0, 5);

    setMonthlyReport({
      monthName: baTime.toLocaleString('es-AR', { month: 'long', year: 'numeric' }),
      totalNotes: monthNotes.length,
      topCareer,
      topSubject,
      topAuthor: topAuthor ? { name: topAuthor[0], count: topAuthor[1] } : null,
      topDownloaded
    });
    setShowReportModal(true);
  };

  const downloadReportPDF = () => {
    if (!monthlyReport) return;

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      // Header
      doc.setFillColor(44, 40, 37); // #2C2825
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("UTN Hub - Reporte Mensual", 15, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(196, 168, 125); // #C4A87D
      doc.text(monthlyReport.monthName.toUpperCase(), 15, 30);

      // General Stats
      doc.setTextColor(44, 40, 37);
      doc.setFontSize(16);
      doc.text("Resumen General", 15, 55);
      doc.setLineWidth(0.5);
      doc.setDrawColor(237, 230, 221);
      doc.line(15, 58, pageWidth - 15, 58);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(122, 110, 98);

      const stats = [
        ["Apuntes subidos este mes:", monthlyReport.totalNotes.toString()],
        ["Carrera más activa:", monthlyReport.topCareer],
        ["Materia con más aportes:", monthlyReport.topSubject],
        ["Colaborador destacado:", `${monthlyReport.topAuthor?.name || 'N/A'} (${monthlyReport.topAuthor?.count || 0} aportes)`],
      ];

      autoTable(doc, {
        startY: 65,
        head: [],
        body: stats,
        theme: 'plain',
        styles: { fontSize: 11, cellPadding: 4 },
        columnStyles: { 0: { fontStyle: 'bold', minCellWidth: 60 } }
      });

      // Top Downloaded Table
      const finalY = (doc as any).lastAutoTable.finalY || 100;
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(44, 40, 37);
      doc.text("Top 5 Descargas del Mes", 15, finalY + 15);
      doc.line(15, finalY + 18, pageWidth - 15, finalY + 18);

      const tableData = monthlyReport.topDownloaded.map((note: any, index: number) => [
        index + 1,
        note.title,
        subjectsData.find(s => s.id === note.subjectId)?.name || note.subjectId,
        note.downloadCount || 0
      ]);

      autoTable(doc, {
        startY: finalY + 25,
        head: [['#', 'Título del Apunte', 'Materia', 'Descargas']],
        body: tableData,
        headStyles: { fillColor: [74, 122, 82], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 247, 244] },
        styles: { fontSize: 10, cellPadding: 5 },
        columnStyles: { 
          0: { cellWidth: 10 },
          3: { halign: 'center', fontStyle: 'bold' }
        }
      });

      // Footer
      const footerY = doc.internal.pageSize.height - 20;
      doc.setFontSize(9);
      doc.setTextColor(168, 159, 149);
      doc.text(`Generado el: ${new Date().toLocaleString('es-AR')}`, 15, footerY);
      doc.text("UTN Hub - Panel de Administración", pageWidth - 15, footerY, { align: 'right' });

      doc.save(`Reporte_Mensual_${monthlyReport.monthName.replace(' ', '_')}.pdf`);
      showToast("PDF generado correctamente", "success");
    } catch (error) {
      console.warn("Error generating PDF:", error);
      showToast("Error al generar el PDF. Reintentá en unos segundos.", "error");
    }
  };

  if (loading || adminAccessLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#C4A87D] animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EDE6DD] p-8 md:p-10 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#F5EFE5] rounded-full flex items-center justify-center border border-[#E2D6C2] shadow-sm">
              <Lock className="w-8 h-8 text-[#8B7355]" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center text-[#2C2825] mb-2 tracking-tight">Acceso Restringido</h1>
          <p className="text-center text-[#7A6E62] mb-8 text-sm">
            Panel de administración de Notes Hub. Ingresá con tus credenciales autorizadas.
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-semibold text-[#4A433C]">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#FCFAF8] border border-[#E5DCD3] focus:border-[#C4A87D] focus:ring-4 focus:ring-[#C4A87D]/10 text-[#4A433C] rounded-xl outline-none transition-all"
                placeholder="admin@noteshub.com"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="pass" className="text-sm font-semibold text-[#4A433C]">
                Contraseña
              </label>
              <input
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={cn(
                  "w-full px-4 py-3 bg-[#FCFAF8] border rounded-xl outline-none transition-all",
                  loginError
                    ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100"
                    : "border-[#E5DCD3] focus:border-[#C4A87D] focus:ring-4 focus:ring-[#C4A87D]/10 text-[#4A433C]"
                )}
                placeholder="••••••••"
                required
              />
              {loginError && <p className="text-red-500 text-sm mt-1 animate-fade-in">{loginError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-[#2C2825] hover:bg-[#1A1816] text-[#FDFCFB] font-medium py-3 rounded-xl transition-all duration-300 shadow-md transform active:scale-[0.98] flex justify-center items-center mt-2 disabled:opacity-70 disabled:active:scale-100"
            >
              {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : "Ingresar"}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full bg-white hover:bg-[#F9F7F4] text-[#4A433C] border border-[#EDE6DD] font-medium py-3 rounded-xl transition-all duration-300 shadow-sm transform active:scale-[0.98] flex justify-center items-center gap-2 disabled:opacity-70 disabled:active:scale-100"
            >
              <Mail className="w-4 h-4" />
              Ingresar con Google
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!hasAdminAccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#EDE6DD] p-8 md:p-10 text-center animate-fade-in-up">
          <div className="w-16 h-16 bg-[#FFF0F0] text-[#D84545] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FFDCDC]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#2C2825] mb-2 tracking-tight">Cuenta sin permisos</h1>
          <p className="text-[#7A6E62] mb-3 text-sm">
            Ingresaste como <strong className="text-[#3D3229]">{user.email}</strong>, pero ese correo no esta habilitado como moderador.
          </p>
          {adminError && <p className="text-red-500 text-sm mb-6">{adminError}</p>}
          <button
            onClick={handleLogout}
            className="w-full bg-[#2C2825] hover:bg-[#1A1816] text-[#FDFCFB] font-medium py-3 rounded-xl transition-all duration-300 shadow-md"
          >
            Salir e ingresar con otra cuenta
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-white border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)]">
            <ShieldAlert className="w-7 h-7 text-emerald-600" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Moderación</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tighter flex items-center gap-3 uppercase italic">
            <span className="inline-flex items-center justify-center w-12 h-12 bg-emerald-400 border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
              <ShieldAlert className="w-7 h-7 text-zinc-900" />
            </span>
            Panel de Moderación
          </h1>
          <p className="text-zinc-600 mt-3 max-w-2xl font-medium leading-relaxed">
            Revisá los aportes pendientes y ubicá los apuntes en carpetas para que cada materia quede más ordenada.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-4 sm:mr-4 bg-white border-4 border-zinc-900 rounded-none p-4 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] min-w-max hidden lg:flex">
            <div className="pr-4 border-r border-[#EDE6DD]">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-1">Visitas Hoy</p>
              <p className="text-2xl font-black text-zinc-900 leading-none">{metrics.todayViews}</p>
            </div>
            <div className="pr-4 border-r border-[#EDE6DD]">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-1">Vistas Totales</p>
              <p className="text-2xl font-black text-zinc-900 leading-none">{metrics.pageViews}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-1">Visitas Única</p>
              <p className="text-2xl font-black text-emerald-600 leading-none">{metrics.uniqueVisitors}</p>
            </div>
          </div>

          <button
            onClick={() => setShowCreateAdmin(!showCreateAdmin)}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-zinc-900 border-4 border-zinc-900 rounded-none font-black uppercase tracking-wider transition-all shadow-[5px_5px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 hover:-translate-x-1"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Admin
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 px-5 py-3 bg-white text-red-600 border-4 border-zinc-900 rounded-none font-black uppercase tracking-wider transition-all shadow-[5px_5px_0px_0px_rgba(24,24,27,1)] hover:-translate-y-1 hover:-translate-x-1"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>

      {showCreateAdmin && (
        <div className="bg-white rounded-none p-6 border-4 border-zinc-900 shadow-[10px_10px_0px_0px_rgba(24,24,27,1)] mb-8 animate-fade-in-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Invitar a un Moderador</h2>
            <button onClick={() => setShowCreateAdmin(false)} className="text-zinc-500 hover:text-zinc-900">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-zinc-600 text-sm mb-5 font-medium">
            Completa el correo para habilitarlo como moderador. La contrasena solo hace falta si queres crear una cuenta nueva.
          </p>

          <form onSubmit={handleCreateAdmin} className="flex flex-col sm:flex-row gap-4 items-start">
            <input
              type="email"
              placeholder="Correo electrónico"
              required
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              className="flex-1 w-full px-4 py-3 bg-white border-4 border-zinc-900 rounded-none outline-none shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] focus:-translate-y-0.5 focus:-translate-x-0.5 transition-all"
            />
            <input
              type="password"
              placeholder="Contrasena nueva (opcional)"
              value={newAdminPassword}
              onChange={(e) => setNewAdminPassword(e.target.value)}
              className="flex-1 w-full px-4 py-3 bg-white border-4 border-zinc-900 rounded-none outline-none shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] focus:-translate-y-0.5 focus:-translate-x-0.5 transition-all"
            />
            <button
              type="submit"
              disabled={isCreatingAdmin}
              className="w-full sm:w-auto bg-emerald-400 hover:bg-emerald-300 px-6 py-3 text-zinc-900 font-black uppercase tracking-wider border-4 border-zinc-900 rounded-none transition-all disabled:opacity-70 flex justify-center h-[52px] shadow-[5px_5px_0px_0px_rgba(24,24,27,1)]"
            >
              {isCreatingAdmin ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Moderador"}
            </button>
          </form>
          {createAdminMsg.text && (
            <p
              className={cn(
                "mt-3 text-sm font-medium animate-fade-in",
                createAdminMsg.type === "error" ? "text-red-500" : "text-green-600"
              )}
            >
              {createAdminMsg.text}
            </p>
          )}

          <div className="mt-8 border-t border-[#EDE6DD] pt-6">
            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Moderadores Registrados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminList.map((adm) => (
                <div key={adm.id} className="bg-white p-4 rounded-none border-4 border-zinc-900 shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] flex flex-col gap-3 group transition-all hover:-translate-y-1 hover:-translate-x-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-zinc-900 border-2 border-zinc-900 rounded-none">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-black text-zinc-900 truncate uppercase tracking-tight">{adm.email}</span>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 uppercase tracking-[0.2em]">
                        <Calendar className="w-3 h-3" /> {formatAdminDate(adm.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                    <button 
                      onClick={() => handleResetPassword(adm.email)}
                      className="flex-1 py-2 px-3 rounded-none border-4 border-zinc-900 text-[10px] font-black uppercase tracking-wider text-zinc-900 bg-white hover:bg-yellow-300 transition-all shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]"
                    >
                      Reset Clave
                    </button>
                    <button 
                      onClick={() => handleDeleteAdmin(adm.id)}
                      className="p-2 rounded-none border-4 border-zinc-900 bg-red-400 text-zinc-900 hover:bg-red-300 transition-all shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]"
                      title="Eliminar de la lista"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {adminList.length === 0 && (
                <p className="text-xs text-[#A89F95] italic">No hay otros administradores registrados en Firestore.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {adminError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium animate-fade-in">
          {adminError}
        </div>
      )}

      <div className="flex gap-2 mb-8 bg-white p-2 rounded-none border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] overflow-x-auto whitespace-nowrap">
        {[
          { id: 'apuntes', label: 'Apuntes' },
          { id: 'estadisticas', label: 'Estadísticas' },
          { id: 'autores', label: 'Autores' },
          { id: 'avisos', label: 'Avisos' },
          { id: 'sistema', label: 'Sistema' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 min-w-[120px] py-3 px-4 rounded-none font-black text-sm uppercase tracking-widest transition-all whitespace-nowrap border-2 border-transparent",
              activeTab === tab.id ? "bg-zinc-900 text-emerald-400 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(16,185,129,1)] -translate-y-1" : "text-zinc-600 hover:bg-emerald-100 hover:text-zinc-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'apuntes' && (
        <div className="animate-fade-in space-y-10">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-[#A89F95] group-focus-within:text-[#C4A87D] transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Buscar por autor..."
              value={searchAuthor}
              onChange={(e) => setSearchAuthor(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-4 border-zinc-900 focus:border-emerald-500 text-zinc-900 rounded-none outline-none transition-all shadow-[6px_6px_0px_0px_rgba(24,24,27,1)] font-black"
            />
          </div>

          <section>
            <h2 className="text-xl font-bold text-[#4A433C] mb-4 ml-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C4A87D]"></span>
              Bandeja de Pendientes ({filteredPendingNotes.length})
            </h2>

            <div className="bg-white rounded-none p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(24,24,27,1)] border-4 border-zinc-900 min-h-[300px]">
              {filteredPendingNotes.length === 0 ? (
                <EmptySection
                  title="¡Todo al día!"
                  description={searchAuthor ? "No hay apuntes pendientes que coincidan con la búsqueda." : "No hay apuntes pendientes de moderación en este momento."}
                  icon={<Check className="w-10 h-10 text-[#A8B8A0]" />}
                />
              ) : (
                <div className="flex flex-col">
                  <div className="mb-6 p-4 bg-zinc-50 border-4 border-zinc-900 rounded-none flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)]">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedPendingNotes.length > 0 && selectedPendingNotes.length === filteredPendingNotes.length}
                        onChange={handleSelectAllPending}
                        className="w-5 h-5 cursor-pointer accent-[#4A7A52] rounded"
                      />
                      <span className="text-sm font-bold text-[#4A433C]">
                        {selectedPendingNotes.length} seleccionados
                      </span>
                    </div>
                    
                    {selectedPendingNotes.length > 0 && (
                      <div className="flex flex-1 w-full sm:w-auto items-center gap-2">
                        <input
                          type="text"
                          placeholder="Carpeta masiva..."
                          value={bulkFolderInput}
                          onChange={(e) => setBulkFolderInput(e.target.value)}
                          className="flex-1 min-w-[120px] max-w-[200px] border-4 border-zinc-900 rounded-none px-3 py-2 text-sm focus:border-emerald-500 outline-none bg-white shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]"
                        />
                        <button
                          onClick={handleApplyBulkFolder}
                          className="text-xs bg-white border-4 border-zinc-900 px-4 py-2.5 rounded-none font-black uppercase tracking-wider hover:bg-yellow-300 transition-all shadow-[3px_3px_0px_0px_rgba(24,24,27,1)]"
                        >
                          Aplicar a todos
                        </button>
                        <button
                          onClick={handleBulkApprove}
                          className="ml-auto text-xs bg-emerald-400 text-zinc-900 px-5 py-2.5 rounded-none font-black uppercase tracking-wider hover:bg-emerald-300 border-4 border-zinc-900 shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Aprobar {selectedPendingNotes.length}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {filteredPendingNotes.map((note) => {
                      const folderSuggestions = getFolderSuggestions(note);
                      const datalistId = `folders-${note.id}`;
                      const authorFolder = normalizeFolderName(note.author ?? "");
                      const canUseAuthorFolder =
                        authorFolder.length > 0 &&
                        authorFolder.toLowerCase() !== "anónimo" &&
                        authorFolder.toLowerCase() !== "anonimo";

                      return (
                        <div key={note.id} className="flex gap-3">
                          <div className="pt-6 pl-2 hidden sm:block">
                            <input 
                              type="checkbox" 
                              checked={selectedPendingNotes.includes(note.id)}
                              onChange={() => toggleNoteSelection(note.id)}
                              className="w-5 h-5 cursor-pointer accent-[#4A7A52] rounded"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <NoteCard
                              note={note}
                              extraContent={
                                <div className="rounded-2xl border border-[#EDE6DD] bg-[#FFFBF7] p-4">
                                  <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-[#3D3229]">
                                      Carpeta en esta materia
                                    </label>
                                    <div className="flex flex-col lg:flex-row gap-2">
                                      <input
                                        list={folderSuggestions.length > 0 ? datalistId : undefined}
                                        value={folderInputs[note.id] ?? ""}
                                        onChange={(event) => handleFolderInputChange(note.id, event.target.value)}
                                        placeholder="Ej. Juan Pérez"
                                        className="flex-1 rounded-xl border border-[#E5DCD3] bg-white px-3.5 py-2.5 text-sm text-[#3D3229] placeholder:text-[#A89F95] focus:border-[#8BAA91] focus:outline-none focus:ring-2 focus:ring-[#8BAA91]/20"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleUseAuthorFolder(note)}
                                        disabled={!canUseAuthorFolder}
                                        className="inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold border border-[#D5E8DB] bg-[#F2F8F4] text-[#2E7D32] hover:bg-[#E6F0E9] disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        Usar autor
                                      </button>
                                    </div>
                                    {folderSuggestions.length > 0 && (
                                      <datalist id={datalistId}>
                                        {folderSuggestions.map((folderName) => (
                                          <option key={folderName} value={folderName} />
                                        ))}
                                      </datalist>
                                    )}
                                  </div>
                                </div>
                              }
                              actions={
                                <>
                                  <button
                                    onClick={() => handleOpenFile(note)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white border border-[#EDE6DD] hover:bg-[#F9F7F4] text-[#7A6E62] rounded-xl font-medium transition-all"
                                    disabled={!note.fileUrl}
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    <span className="text-xs">Ver</span>
                                  </button>
                                  <button
                                    onClick={() => handleDelete(note.id)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D84545] border border-[#FFDCDC] rounded-xl font-semibold transition-all"
                                  >
                                    <X className="w-4 h-4" />
                                    <span className="text-xs">Rechazar</span>
                                  </button>
                                  <button
                                    onClick={() => handleApprove(note)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#F2F8F4] hover:bg-[#E6F0E9] text-[#2E7D32] border border-[#D5E8DB] rounded-xl font-semibold transition-all"
                                  >
                                    <Check className="w-4 h-4" />
                                    <span className="text-xs">Aprobar</span>
                                  </button>
                                </>
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#4A433C] mb-4 ml-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8BAA91]"></span>
              Apuntes Aprobados ({filteredApprovedNotes.length})
            </h2>

            <div className="bg-white rounded-none p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(24,24,27,1)] border-4 border-zinc-900 min-h-[300px]">
              {filteredApprovedNotes.length === 0 ? (
                <EmptySection
                  title="Sin aprobados para revisar"
                  description={searchAuthor ? "No hay apuntes aprobados que coincidan con la búsqueda." : "Cuando apruebes apuntes, también vas a poder eliminarlos y ver en qué carpeta quedaron."}
                  icon={<FileText className="w-10 h-10 text-[#A8B8A0]" />}
                />
              ) : (
                <div className="flex flex-col gap-8">
                  {Object.entries(
                    filteredApprovedNotes.reduce((acc, note) => {
                      const subjectName = subjectsData.find(s => s.id === note.subjectId)?.name || note.subjectId || "General";
                      if (!acc[subjectName]) acc[subjectName] = [];
                      acc[subjectName].push(note);
                      return acc;
                    }, {} as Record<string, Note[]>)
                  ).sort((a, b) => a[0].localeCompare(b[0])).map(([subject, notes]) => (
                    <SubjectGroup key={subject} subject={subject} notes={notes} onOpenFile={handleOpenFile} onEditNote={setEditingNote} onDeleteNote={handleDelete} />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'estadisticas' && (
        <div className="animate-fade-in space-y-8">
          <section>
            <div className="bg-white rounded-none border-4 border-zinc-900 p-6 md:p-8 shadow-[10px_10px_0px_0px_rgba(24,24,27,1)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#F5EFE5] text-[#8B7355]">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#3D3229]">Panel de Estadísticas</h2>
                    <p className="text-[#7A6E62] text-sm">Los contenidos más populares y reportes de rendimiento.</p>
                  </div>
                </div>
                <button
                  onClick={generateReport}
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[#2C2825] hover:bg-black text-white font-bold rounded-2xl transition-all shadow-md active:scale-95 shrink-0"
                >
                  <BarChart3 className="w-5 h-5" />
                  Generar Reporte Mensual
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Apuntes */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-[#4A433C] flex items-center gap-2 px-2">
                    <FileText className="w-5 h-5 text-[#D4856A]" />
                    Top 10 Apuntes
                  </h3>
                  <div className="bg-[#F9F7F4] rounded-3xl border border-[#EDE6DD] overflow-hidden">
                    {[...approvedNotes]
                      .filter(n => (n.downloadCount || 0) > 0)
                      .sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0))
                      .slice(0, 10)
                      .map((note, idx) => (
                        <div key={note.id} className="flex items-center justify-between p-4 border-b border-[#EDE6DD] last:border-0 hover:bg-white transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-black text-[#A89F95] w-4">{idx + 1}</span>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-[#3D3229] truncate">{note.title}</p>
                              <p className="text-[10px] text-[#7A6E62] truncate">
                                {subjectsData.find(s => s.id === note.subjectId)?.name || note.subjectId}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-[#EDE6DD] shadow-sm shrink-0">
                            <Download className="w-3 h-3 text-[#D4856A]" />
                            <span className="text-xs font-black text-[#3D3229]">{note.downloadCount || 0}</span>
                          </div>
                        </div>
                      ))}
                    {[...approvedNotes].filter(n => (n.downloadCount || 0) > 0).length === 0 && (
                      <div className="p-10 text-center text-[#A89F95] text-sm">No hay datos aún</div>
                    )}
                  </div>
                </div>

                {/* Top Carpetas */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-[#4A433C] flex items-center gap-2 px-2">
                    <FolderOpen className="w-5 h-5 text-[#8BAA91]" />
                    Top 10 Carpetas
                  </h3>
                  <div className="bg-[#F9F7F4] rounded-3xl border border-[#EDE6DD] overflow-hidden">
                    {Object.entries(
                      approvedNotes.reduce((acc, note) => {
                        const folderName = normalizeFolderName(note.folderName || "");
                        if (!folderName) return acc;
                        acc[folderName] = (acc[folderName] || 0) + (note.downloadCount || 0);
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .filter(([, count]) => count > 0)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 10)
                      .map(([folder, count], idx) => (
                        <div key={folder} className="flex items-center justify-between p-4 border-b border-[#EDE6DD] last:border-0 hover:bg-white transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-black text-[#A89F95] w-4">{idx + 1}</span>
                            <p className="text-sm font-bold text-[#3D3229] truncate">{folder}</p>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-[#EDE6DD] shadow-sm shrink-0">
                            <Download className="w-3 h-3 text-[#8BAA91]" />
                            <span className="text-xs font-black text-[#3D3229]">{count}</span>
                          </div>
                        </div>
                      ))}
                    {Object.keys(approvedNotes.reduce((acc, note) => {
                        const folderName = normalizeFolderName(note.folderName || "");
                        if (!folderName) return acc;
                        acc[folderName] = (acc[folderName] || 0) + (note.downloadCount || 0);
                        return acc;
                      }, {} as Record<string, number>)).filter(f => f).length === 0 && (
                      <div className="p-10 text-center text-[#A89F95] text-sm">No hay datos aún</div>
                    )}
                  </div>
                </div>

                {/* Top Materias */}
                <div className="flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-[#4A433C] flex items-center gap-2 px-2">
                    <BookOpen className="w-5 h-5 text-[#7BA7C2]" />
                    Top 10 Materias
                  </h3>
                  <div className="bg-[#F9F7F4] rounded-3xl border border-[#EDE6DD] overflow-hidden">
                    {Object.entries(
                      approvedNotes.reduce((acc, note) => {
                        const subjectName = subjectsData.find(s => s.id === note.subjectId)?.name || note.subjectId || "General";
                        acc[subjectName] = (acc[subjectName] || 0) + (note.downloadCount || 0);
                        return acc;
                      }, {} as Record<string, number>)
                    )
                      .filter(([, count]) => count > 0)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 10)
                      .map(([subject, count], idx) => (
                        <div key={subject} className="flex items-center justify-between p-4 border-b border-[#EDE6DD] last:border-0 hover:bg-white transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs font-black text-[#A89F95] w-4">{idx + 1}</span>
                            <p className="text-sm font-bold text-[#3D3229] truncate">{subject}</p>
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-lg border border-[#EDE6DD] shadow-sm shrink-0">
                            <Download className="w-3 h-3 text-[#7BA7C2]" />
                            <span className="text-xs font-black text-[#3D3229]">{count}</span>
                          </div>
                        </div>
                      ))}
                    {Object.keys(approvedNotes.reduce((acc, note) => {
                        const subjectName = subjectsData.find(s => s.id === note.subjectId)?.name || note.subjectId || "General";
                        acc[subjectName] = (acc[subjectName] || 0) + (note.downloadCount || 0);
                        return acc;
                      }, {} as Record<string, number>)).length === 0 && (
                      <div className="p-10 text-center text-[#A89F95] text-sm">No hay datos aún</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'autores' && (
        <div className="animate-fade-in">
          <section className="mb-10 animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] border border-[#EDE6DD] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div className="max-w-xl">
                  <h2 className="text-xl font-black text-[#3D3229] mb-2 flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-[#E8F0EA] text-[#4A7A52]">
                      <Crown className="w-5 h-5" />
                    </span>
                    Personalizar Apuntes de Usuarios
                  </h2>
                  <p className="text-[#7A6E62] text-sm leading-relaxed">
                    Asigná un color especial y una etiqueta (ej: &quot;Amigo&quot;, &quot;VIP&quot;) a los apuntes subidos por alguien específico. Escribí el nombre exacto con el que subió el archivo.
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleSaveAuthorStyle} className="flex flex-col sm:flex-row gap-4 mb-6">
                <input 
                  type="text" 
                  placeholder="Nombre del Autor (ej: Juan Perez)" 
                  value={newAuthorName} 
                  onChange={(e) => setNewAuthorName(e.target.value)} 
                  required
                  className="flex-1 px-4 py-2.5 bg-white border border-[#E5DCD3] focus:border-[#4A7A52] rounded-xl outline-none"
                />
                <input 
                  type="text" 
                  placeholder="Etiqueta (ej: Amigo)" 
                  value={newAuthorLabel} 
                  onChange={(e) => setNewAuthorLabel(e.target.value)} 
                  required
                  className="w-full sm:w-1/4 px-4 py-2.5 bg-white border border-[#E5DCD3] focus:border-[#4A7A52] rounded-xl outline-none"
                />
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={newAuthorColor} 
                    onChange={(e) => setNewAuthorColor(e.target.value)} 
                    className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent p-0"
                  />
                  <button
                    type="submit"
                    className="bg-[#4A7A52] hover:bg-[#3d6644] px-6 py-2.5 text-white font-medium rounded-xl transition-all shadow-sm h-[46px]"
                  >
                    Agregar
                  </button>
                </div>
              </form>

              {Object.keys(authorStyles).length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 border-t border-[#EDE6DD] pt-6">
                  {Object.entries(authorStyles).map(([key, style]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl border border-[#EDE6DD] bg-[#F9F7F4]">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#3D3229] capitalize">{key}</span>
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 w-max text-white"
                          style={{ backgroundColor: style.color }}
                        >
                          {style.label}
                        </span>
                      </div>
                      <button 
                        onClick={() => handleDeleteAuthorStyle(key)}
                        className="p-2 text-[#D84545] hover:bg-[#FFE5E5] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'avisos' && (
        <div className="animate-fade-in space-y-10">
          <section className="animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] border border-[#EDE6DD] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div className="max-w-xl">
                  <h2 className="text-xl font-black text-[#3D3229] mb-2 flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-[#F5EFE5] text-[#8B7355]">
                      <Megaphone className="w-5 h-5" />
                    </span>
                    Popup de Imagen Promocional
                  </h2>
                  <p className="text-[#7A6E62] text-sm leading-relaxed">
                    Mostrá una imagen emergente. El usuario solo lo verá 1 vez por imagen.
                  </p>
                </div>
                
                <button
                  onClick={toggleImagePopupState}
                  disabled={isUpdatingSettings}
                  className={cn(
                    "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 disabled:opacity-50",
                    isImagePopupActive ? "bg-[#8BAA91]" : "bg-[#D5CAC0]"
                  )}
                >
                  <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300", isImagePopupActive ? "translate-x-6" : "translate-x-1")} />
                </button>
              </div>

              {isImagePopupActive && (
                <div className="flex flex-col gap-6 bg-[#F9F7F4] p-6 rounded-[2rem] border border-[#EDE6DD]">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[#4A433C]">Cargar Imagen</label>
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-[#D5CAC0] border-dashed rounded-[2rem] cursor-pointer bg-white hover:bg-[#F5EFE5] transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {isUploadingImage ? <Loader2 className="w-8 h-8 text-[#C4A87D] animate-spin" /> : <Download className="w-8 h-8 text-[#A89F95] group-hover:text-[#C4A87D] transition-colors" />}
                        <p className="mt-2 text-sm text-[#7A6E62]">Click para seleccionar archivo</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} />
                    </label>
                    {imagePopupUrl && (
                      <div className="relative inline-block mt-4">
                        <img src={imagePopupUrl} alt="Preview" className="max-h-48 rounded-2xl border border-[#EDE6DD] shadow-sm" />
                        <button onClick={() => setImagePopupUrl("")} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[#4A433C]">Link del Popup (Opcional)</label>
                    <input
                      type="url"
                      value={imagePopupLink}
                      onChange={(e) => setImagePopupLink(e.target.value)}
                      placeholder="https://ejemplo.com"
                      className="w-full px-4 py-3 bg-white border border-[#E5DCD3] focus:border-[#C4A87D] rounded-xl outline-none transition-all"
                    />
                  </div>

                  <button
                    onClick={saveImagePopupSettings}
                    disabled={isUpdatingSettings}
                    className="w-full bg-[#2C2825] hover:bg-black text-white font-bold py-3.5 rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                  >
                    Guardar Popup de Imagen
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] border border-[#EDE6DD] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
                <div className="max-w-xl">
                  <h2 className="text-xl font-black text-[#3D3229] mb-2 flex items-center gap-2">
                    <span className="p-2 rounded-lg bg-[#E5EFF5] text-[#4A6E82]">
                      <Megaphone className="w-5 h-5" />
                    </span>
                    Aviso de Texto (Banner)
                  </h2>
                  <p className="text-[#7A6E62] text-sm leading-relaxed">
                    Mostrá un anuncio informativo en la parte superior del dashboard.
                  </p>
                </div>
                
                <button
                  onClick={toggleAnnouncementState}
                  disabled={isUpdatingSettings}
                  className={cn(
                    "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-300 disabled:opacity-50",
                    isAnnouncementActive ? "bg-[#4A6E82]" : "bg-[#D5CAC0]"
                  )}
                >
                  <span className={cn("pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300", isAnnouncementActive ? "translate-x-6" : "translate-x-1")} />
                </button>
              </div>

              {isAnnouncementActive && (
                <div className="flex flex-col gap-6 bg-[#F5F8FA] p-6 rounded-[2rem] border border-[#D1E1EB]">
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[#4A433C]">Título del Aviso</label>
                    <input
                      type="text"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      placeholder="Ej: ¡Nuevos apuntes disponibles!"
                      className="w-full px-4 py-3 bg-white border border-[#D1E1EB] focus:border-[#4A6E82] rounded-xl outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[#4A433C]">Mensaje del Aviso</label>
                    <textarea
                      value={announcementMessage}
                      onChange={(e) => setAnnouncementMessage(e.target.value)}
                      placeholder="Escribí el detalle del aviso aquí..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-[#D1E1EB] focus:border-[#4A6E82] rounded-xl outline-none transition-all resize-none"
                    />
                  </div>
                  <button
                    onClick={saveAnnouncementSettings}
                    disabled={isUpdatingSettings}
                    className="w-full bg-[#4A6E82] hover:bg-[#3d5b6b] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                  >
                    Guardar Banner de Aviso
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'sistema' && (
        <div className="animate-fade-in space-y-10">
          <section className="animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] border border-[#f5c6c6] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
              {confirmReset && (
                <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <ShieldAlert className="w-10 h-10 text-[#8E5A5A] mb-3 animate-pulse" />
                  <p className="font-bold text-[#3D3229] mb-1">¿Estás seguro de borrar todas las visitas?</p>
                  <p className="text-xs text-[#8E5A5A] mb-4">Esta acción no se puede deshacer y los contadores volverán a 0.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmReset(false)} disabled={isResetting} className="px-4 py-2 font-bold text-xs bg-[#F5F0EA] text-[#7A6E62] rounded-xl hover:bg-[#EDE6DD] transition-colors disabled:opacity-50">Cancelar</button>
                    <button 
                      onClick={async () => {
                        setIsResetting(true);
                        try {
                          const qSnap = await getDocs(collection(db, "metrics"));
                          await Promise.all(qSnap.docs.map(d => deleteDoc(doc(db, "metrics", d.id))));
                          showToast("Métricas reiniciadas exitosamente a 0.", "success");
                        } catch (err: any) {
                           showToast(`Error: ${err.message || 'vaciando las visitas'}`, "error");
                           console.warn(err);
                        } finally {
                           setIsResetting(false);
                           setConfirmReset(false);
                        }
                      }}
                      disabled={isResetting}
                      className="px-4 py-2 font-bold text-xs bg-[#8E5A5A] text-white rounded-xl shadow-md hover:bg-[#734a4a] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isResetting ? <Loader2 className="w-3 h-3 animate-spin"/> : "Sí, borrar todo"}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="max-w-xl">
                  <h2 className="text-xl font-black text-[#8E5A5A] mb-2 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Reiniciar Estadísticas (Visitas / Vistas)
                  </h2>
                  <p className="text-[#8E5A5A]/80 text-sm leading-relaxed">Eliminá todos los registros de la base de datos para arrancar desde cero el lanzamiento de la web.</p>
                </div>
                <button onClick={() => setConfirmReset(true)} className="px-6 py-2.5 font-bold text-sm bg-[#8E5A5A] text-white rounded-xl hover:-translate-y-0.5 transition-all shadow-md">Borrar 100%</button>
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] border border-[#f5c6c6] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
              {confirmResetSubjects && (
                <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <ShieldAlert className="w-10 h-10 text-[#8E5A5A] mb-3 animate-pulse" />
                  <p className="font-bold text-[#3D3229] mb-1">¿Estás seguro de borrar las calificaciones de materias?</p>
                  <p className="text-xs text-[#8E5A5A] mb-4">Se eliminarán los puntajes globales y de todos los usuarios.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmResetSubjects(false)} disabled={isResettingSubjects} className="px-4 py-2 font-bold text-xs bg-[#F5F0EA] text-[#7A6E62] rounded-xl hover:bg-[#EDE6DD] transition-colors disabled:opacity-50">Cancelar</button>
                    <button 
                      onClick={async () => {
                        setIsResettingSubjects(true);
                        try {
                          const qSnap = await getDocs(collection(db, "subject_aggregates"));
                          await Promise.all(qSnap.docs.map(d => deleteDoc(doc(db, "subject_aggregates", d.id))));
                          
                          const usersSnap = await getDocs(collection(db, "users"));
                          await Promise.all(usersSnap.docs.map(d => {
                            if (d.data().subjectRatings) {
                              return updateDoc(doc(db, "users", d.id), { subjectRatings: deleteField() });
                            }
                            return Promise.resolve();
                          }));
                          
                          showToast("Calificaciones de materias reiniciadas.", "success");
                        } catch (err: any) {
                           showToast(`Error: ${err.message || 'vaciando calificaciones'}`, "error");
                           console.warn(err);
                        } finally {
                           setIsResettingSubjects(false);
                           setConfirmResetSubjects(false);
                        }
                      }}
                      disabled={isResettingSubjects}
                      className="px-4 py-2 font-bold text-xs bg-[#8E5A5A] text-white rounded-xl shadow-md hover:bg-[#734a4a] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isResettingSubjects ? <Loader2 className="w-3 h-3 animate-spin"/> : "Sí, borrar calificaciones"}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="max-w-xl">
                  <h2 className="text-xl font-black text-[#8E5A5A] mb-2 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Reiniciar Calificaciones de Materias
                  </h2>
                  <p className="text-[#8E5A5A]/80 text-sm leading-relaxed">Eliminá todas las calificaciones (Dificultad/Utilidad) de las materias en la base de datos.</p>
                </div>
                <button onClick={() => setConfirmResetSubjects(true)} className="px-6 py-2.5 font-bold text-sm bg-[#8E5A5A] text-white rounded-xl hover:-translate-y-0.5 transition-all shadow-md">Borrar Materias</button>
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] border border-[#f5c6c6] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
              {confirmResetNotes && (
                <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <ShieldAlert className="w-10 h-10 text-[#8E5A5A] mb-3 animate-pulse" />
                  <p className="font-bold text-[#3D3229] mb-1">¿Estás seguro de borrar las estrellas de apuntes?</p>
                  <p className="text-xs text-[#8E5A5A] mb-4">Se eliminarán las estrellas de la comunidad en cada archivo.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmResetNotes(false)} disabled={isResettingNotes} className="px-4 py-2 font-bold text-xs bg-[#F5F0EA] text-[#7A6E62] rounded-xl hover:bg-[#EDE6DD] transition-colors disabled:opacity-50">Cancelar</button>
                    <button 
                      onClick={async () => {
                        setIsResettingNotes(true);
                        try {
                          const notesSnap = await getDocs(collection(db, "notes"));
                          await Promise.all(notesSnap.docs.map(d => {
                            if (d.data().ratings && d.data().ratings.length > 0) {
                              return updateDoc(doc(db, "notes", d.id), { ratings: deleteField() });
                            }
                            return Promise.resolve();
                          }));
                          
                          showToast("Calificaciones de apuntes reiniciadas.", "success");
                        } catch (err: any) {
                           showToast(`Error: ${err.message || 'vaciando estrellas'}`, "error");
                           console.warn(err);
                        } finally {
                           setIsResettingNotes(false);
                           setConfirmResetNotes(false);
                        }
                      }}
                      disabled={isResettingNotes}
                      className="px-4 py-2 font-bold text-xs bg-[#8E5A5A] text-white rounded-xl shadow-md hover:bg-[#734a4a] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isResettingNotes ? <Loader2 className="w-3 h-3 animate-spin"/> : "Sí, borrar estrellas"}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="max-w-xl">
                  <h2 className="text-xl font-black text-[#8E5A5A] mb-2 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Reiniciar Calificaciones de Apuntes (Estrellas)
                  </h2>
                  <p className="text-[#8E5A5A]/80 text-sm leading-relaxed">Eliminá todas las valoraciones con estrellas que dejaron los usuarios en los apuntes.</p>
                </div>
                <button onClick={() => setConfirmResetNotes(true)} className="px-6 py-2.5 font-bold text-sm bg-[#8E5A5A] text-white rounded-xl hover:-translate-y-0.5 transition-all shadow-md">Borrar Estrellas</button>
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] border border-[#f5c6c6] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">
              {confirmResetDownloads && (
                <div className="absolute inset-0 z-20 bg-white/95 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                  <ShieldAlert className="w-10 h-10 text-[#8E5A5A] mb-3 animate-pulse" />
                  <p className="font-bold text-[#3D3229] mb-1">¿Estás seguro de borrar las estadísticas de descargas?</p>
                  <p className="text-xs text-[#8E5A5A] mb-4">Se reseteará a 0 el contador de descargas de todos los apuntes.</p>
                  <div className="flex gap-3">
                    <button onClick={() => setConfirmResetDownloads(false)} disabled={isResettingDownloads} className="px-4 py-2 font-bold text-xs bg-[#F5F0EA] text-[#7A6E62] rounded-xl hover:bg-[#EDE6DD] transition-colors disabled:opacity-50">Cancelar</button>
                    <button 
                      onClick={async () => {
                        setIsResettingDownloads(true);
                        try {
                          const notesSnap = await getDocs(collection(db, "notes"));
                          await Promise.all(notesSnap.docs.map(d => {
                            if (d.data().downloadCount) {
                              return updateDoc(doc(db, "notes", d.id), { downloadCount: deleteField() });
                            }
                            return Promise.resolve();
                          }));
                          
                          showToast("Contador de descargas reiniciado exitosamente.", "success");
                        } catch (err) {
                           showToast("Hubo un error reseteando las descargas.", "error");
                           console.warn(err);
                        } finally {
                           setIsResettingDownloads(false);
                           setConfirmResetDownloads(false);
                        }
                      }}
                      disabled={isResettingDownloads}
                      className="px-4 py-2 font-bold text-xs bg-[#8E5A5A] text-white rounded-xl shadow-md hover:bg-[#734a4a] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isResettingDownloads ? <Loader2 className="w-3 h-3 animate-spin"/> : "Sí, borrar descargas"}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="max-w-xl">
                  <h2 className="text-xl font-black text-[#8E5A5A] mb-2 flex items-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Reiniciar Estadísticas de Descargas
                  </h2>
                  <p className="text-[#8E5A5A]/80 text-sm leading-relaxed">Reseteá a cero el contador de descargas (`downloadCount`) de todos los apuntes del sistema.</p>
                </div>
                <button onClick={() => setConfirmResetDownloads(true)} className="px-6 py-2.5 font-bold text-sm bg-[#8E5A5A] text-white rounded-xl hover:-translate-y-0.5 transition-all shadow-md">Borrar Descargas</button>
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] border border-[#EDE6DD] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="max-w-xl">
                  <h2 className="text-xl font-black text-[#3D3229] mb-2 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Configuración de Donaciones
                  </h2>
                  <p className="text-[#7A6E62] text-sm leading-relaxed">Controlá la visibilidad de la sección de donaciones y el popup emergente.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => toggleDonation('section')} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", isDonationActive ? "bg-[#8BAA91] text-white" : "bg-[#EDE6DD] text-[#7A6E62]")}>Sección: {isDonationActive ? 'Visible' : 'Oculta'}</button>
                  <button onClick={() => toggleDonation('popup')} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all", isDonationPopupActive ? "bg-[#4A6E82] text-white" : "bg-[#EDE6DD] text-[#7A6E62]")}>Popup: {isDonationPopupActive ? 'Activo' : 'Inactivo'}</button>
                </div>
              </div>
            </div>
          </section>

          <section className="animate-fade-in-up">
            <div className="bg-white rounded-[2.5rem] border border-[#EDE6DD] p-6 md:p-8 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="max-w-xl">
                  <h2 className="text-xl font-black text-[#3D3229] mb-2 flex items-center gap-2">
                    <ArrowUpDown className="w-5 h-5" />
                    Ordenamiento de Apuntes
                  </h2>
                  <p className="text-[#7A6E62] text-sm leading-relaxed">Elegí cómo querés que se muestren los apuntes por defecto en todas las materias.</p>
                </div>
                <select
                  value={noteSortingOrder}
                  onChange={(e) => saveSortingSettings(e.target.value)}
                  disabled={isUpdatingSettings}
                  className="bg-[#F9F7F4] border border-[#EDE6DD] text-[#3D3229] rounded-2xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-[#C4A87D]/20 cursor-pointer"
                >
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                  <option value="score">Mejor puntuados</option>
                  <option value="alphabetical">Alfabético</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      )}

      {confirmDeleteAdmin.isOpen && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/50 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 shadow-2xl animate-fade-in-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-[#2C2825] text-center mb-3">¿Confirmar eliminación?</h3>
            <p className="text-[#7A6E62] text-center text-sm mb-8">Vas a quitar los permisos de moderación a <strong>{confirmDeleteAdmin.adminMail}</strong>.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDeleteAdminAction} className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl transition-all shadow-md">Eliminar Moderador</button>
              <button onClick={() => setConfirmDeleteAdmin({ isOpen: false, adminMail: "" })} className="w-full py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all">Cancelar</button>
            </div>
          </div>
        </div>
      )}

    </div>

    {showReportModal && monthlyReport && typeof document !== 'undefined' && createPortal(
      <div className="fixed inset-0 z-[1000000] flex justify-center items-start overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in py-8 px-4">
        <div className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-fade-in-up my-auto">
          <div className="sticky top-0 z-10 bg-[#2C2825] p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-6 h-6 text-[#C4A87D]" />
              <h3 className="text-xl font-black tracking-tight">Reporte Mensual: <span className="capitalize text-[#C4A87D]">{monthlyReport.monthName}</span></h3>
            </div>
            <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#F9F7F4] p-5 rounded-3xl border border-[#EDE6DD] flex flex-col items-center text-center">
                <span className="text-[#7A6E62] text-xs font-black uppercase tracking-widest mb-2">Apuntes Subidos</span>
                <span className="text-4xl font-black text-[#3D3229]">{monthlyReport.totalNotes}</span>
                <p className="text-[10px] text-[#A89F95] mt-1">Nuevos contenidos este mes</p>
              </div>
              <div className="bg-[#E8F0EA] p-5 rounded-3xl border border-[#C5DBC9] flex flex-col items-center text-center">
                <span className="text-[#4A7A52] text-xs font-black uppercase tracking-widest mb-2">Top Colaborador</span>
                <span className="text-xl font-black text-[#3D3229] truncate w-full">{monthlyReport.topAuthor?.name || 'N/A'}</span>
                <p className="text-[10px] text-[#4A7A52] mt-1">{monthlyReport.topAuthor?.count || 0} aportes realizados</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#EDE6DD]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#F5EFE5] text-[#8B7355]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-[#4A433C]">Carrera con más actividad</span>
                </div>
                <span className="text-sm font-black text-[#3D3229]">{monthlyReport.topCareer}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-[#EDE6DD]">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#EFEBF5] text-[#6B5A8E]">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-bold text-[#4A433C]">Materia con más aportes</span>
                </div>
                <span className="text-sm font-black text-[#3D3229]">{monthlyReport.topSubject}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-black text-[#3D3229] uppercase tracking-widest flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-[#D4856A]" /> Top 5 Descargadas del Mes
              </h4>
              {monthlyReport.topDownloaded.map((note: any, idx: number) => (
                <div key={note.id} className="flex items-center justify-between p-3 bg-[#FCFAF8] rounded-xl border border-[#EDE6DD]">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-[10px] font-black text-[#A89F95]">{idx + 1}</span>
                    <span className="text-xs font-bold text-[#3D3229] truncate">{note.title}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 bg-white rounded-lg border border-[#EDE6DD]">
                    <Download className="w-3 h-3 text-[#D4856A]" />
                    <span className="text-[10px] font-black text-[#3D3229]">{note.downloadCount || 0}</span>
                  </div>
                </div>
              ))}
              {monthlyReport.topDownloaded.length === 0 && (
                <p className="text-center text-xs text-[#A89F95] py-4 italic">No hay descargas registradas en estos apuntes.</p>
              )}
            </div>
          </div>

          <div className="p-6 bg-[#F9F7F4] border-t border-[#EDE6DD] flex flex-wrap gap-3">
            <button
              onClick={() => {
                const text = `REPORTE MENSUAL: ${monthlyReport.monthName}\n\n` +
                  `• Total de apuntes subidos: ${monthlyReport.totalNotes}\n` +
                  `• Carrera más activa: ${monthlyReport.topCareer}\n` +
                  `• Materia más aportada: ${monthlyReport.topSubject}\n` +
                  `• Top Colaborador: ${monthlyReport.topAuthor?.name} (${monthlyReport.topAuthor?.count} aportes)\n\n` +
                  `Top Descargadas del mes:\n` +
                  monthlyReport.topDownloaded.map((n: any, i: number) => `${i+1}. ${n.title} (${n.downloadCount || 0} descargas)`).join('\n');
                
                navigator.clipboard.writeText(text);
                showToast("Reporte copiado al portapapeles", "success");
              }}
              className="flex-1 min-w-[140px] py-3.5 bg-white border border-[#EDE6DD] hover:bg-[#EDE6DD] text-[#4A433C] font-bold rounded-2xl transition-all shadow-sm active:scale-95"
            >
              Copiar Texto
            </button>
            <button
              onClick={downloadReportPDF}
              className="flex-1 min-w-[140px] py-3.5 bg-[#4A7A52] hover:bg-[#3d6644] text-white font-bold rounded-2xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Descargar PDF
            </button>
            <button
              onClick={() => setShowReportModal(false)}
              className="flex-1 min-w-[140px] py-3.5 bg-[#2C2825] hover:bg-black text-white font-bold rounded-2xl transition-all shadow-md active:scale-95"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>,
      document.body
    )}

    {editingNote && typeof document !== 'undefined' && createPortal(
      <EditNoteModal
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        onSave={handleEditNoteSave}
        note={editingNote}
      />,
      document.body
    )}
    </>
  );
}

