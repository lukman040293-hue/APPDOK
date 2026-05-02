import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Camera, Trash2, Image as ImageIcon, Upload, FileDown, Presentation, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, ShieldAlert, 
  Sun, Droplets, Target, ClipboardList, Cloud, FolderOpen, Plus, 
  ArrowLeft, Calendar, Briefcase, FileText, Loader2, WifiOff, 
  HardDrive, UploadCloud, Lock, User, LogOut, ZoomIn, ZoomOut, 
  Maximize, Palette, Filter, Save, FileStack, Layers, Activity, 
  BarChart3, PieChart, Users, Share2, Check
} from 'lucide-react';

// --- ID Sesi Unik Untuk Real-Time Sync Antar Perangkat ---
const TAB_SESSION_ID = Math.random().toString(36).substring(2, 15);

// --- ALGORITMA "SMART FINGERPRINT" UNTUK MEMPERCEPAT DETEKSI SINKRONISASI ---
const createPageHash = (pageData) => {
  if (!pageData) return "null";
  try {
    const lightData = pageData.map(p => ({
      n: p.note, b: p.brightness, s: p.saturation, z: p.zoom, x: p.panX, y: p.panY, prog: p.progress,
      id: p.src ? p.src.substring(0, 30) + p.src.length : null 
    }));
    return JSON.stringify(lightData);
  } catch (e) {
    return "error";
  }
};

// --- FUNGSI TEMA WARNA UNIK PER USER ---
const getUserColorTheme = (email) => {
  if (!email || email === 'Anonim') return { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', solid: 'bg-slate-500', initial: '?' };
  const colors = [
    { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', solid: 'bg-red-500' },
    { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', solid: 'bg-orange-500' },
    { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', solid: 'bg-emerald-500' },
    { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', solid: 'bg-blue-500' },
    { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', solid: 'bg-indigo-500' },
    { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200', solid: 'bg-purple-500' },
    { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200', solid: 'bg-pink-500' },
    { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200', solid: 'bg-cyan-500' },
    { bg: 'bg-teal-100', text: 'text-teal-700', border: 'border-teal-200', solid: 'bg-teal-500' },
    { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200', solid: 'bg-rose-500' },
    { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', solid: 'bg-violet-500' },
    { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', solid: 'bg-amber-500' },
    { bg: 'bg-fuchsia-100', text: 'text-fuchsia-700', border: 'border-fuchsia-200', solid: 'bg-fuchsia-500' },
    { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-200', solid: 'bg-sky-500' },
  ];
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    // Algoritma perkalian yang jauh lebih sensitif terhadap perubahan 1 huruf/angka
    hash += email.charCodeAt(i) * (i + 1) * 11;
  }
  const theme = colors[hash % colors.length];
  return { ...theme, initial: email.charAt(0).toUpperCase() };
};

// --- MENCEGAH LOG ERROR KUOTA FIREBASE AGAR TIDAK MUNCUL DI LAYAR ---
const originalConsoleError = console.error;
console.error = (...args) => {
  try {
    const combined = args.map(a => {
      if (typeof a === 'string') return a;
      if (a instanceof Error) return a.message;
      if (a && typeof a === 'object' && a.message) return a.message;
      return String(a);
    }).join(' ');
    
    if (combined.includes('resource-exhausted') || 
        combined.includes('Quota') || 
        combined.includes('quota') ||
        combined.includes('maximum backoff delay')) {
      return; 
    }
  } catch (e) {}
  originalConsoleError.apply(console, args);
};

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, deleteDoc, onSnapshot, writeBatch, terminate } from 'firebase/firestore';

// --- INISIALISASI FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCvMuSGrojku0-UM4tWaNTK2EDlgqjWAlM",
  authDomain: "apdok-f9052.firebaseapp.com",
  projectId: "apdok-f9052",
  storageBucket: "apdok-f9052.firebasestorage.app",
  messagingSenderId: "839994843119",
  appId: "1:839994843119:web:2590957adb4e6f1ce7a01a",
  measurementId: "G-MQX0Q3ZPC0"
};

let app, auth, db, appId;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = firebaseConfig.projectId;
} catch (e) {
  originalConsoleError("Gagal inisialisasi Firebase", e);
}

const DEFAULT_EMAIL_IZIN = ['at.file2020@gmail.com', 'admin@gmail.com'];
const DEFAULT_ADMIN = ['admin@gmail.com', 'at.file2020@gmail.com'];

const PhotoCard = ({ pIdx, sIdx, p, reportType, updatePhoto, clearPhoto, handleFileUpload }) => {
  const [tab, setTab] = useState('filter');
  const { zoom = 100, panX = 50, panY = 50, brightness = 100, saturation = 100, progress = 0 } = p;

  return (
    <div className="bg-white rounded-[32px] sm:rounded-[48px] shadow-xl overflow-hidden flex flex-col group border-2 border-transparent hover:border-blue-500 transition-all duration-500 hover:shadow-2xl relative">
      <div className="h-52 sm:h-60 bg-slate-50 flex items-center justify-center relative border-b border-slate-100 overflow-hidden">
        {p?.src ? (
          <>
            <img 
              src={p.src} 
              className="w-full h-full object-cover transition-all duration-300" 
              style={p.isBaked ? {} : { filter: `brightness(${brightness}%) saturate(${saturation}%)`, transform: `scale(${zoom / 100})`, transformOrigin: `${panX}% ${panY}%` }} 
              alt="" 
            />
            <button onClick={clearPhoto} className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-red-500 text-white p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-xl hover:bg-red-600 transition-all active:scale-90 z-10">
              <Trash2 size={18} className="sm:w-5 sm:h-5"/>
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-3 w-full px-6 sm:px-10 text-center">
            <label className={`w-full text-white py-3 sm:py-4 rounded-2xl sm:rounded-3xl text-[10px] font-black uppercase cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${reportType === 'progres' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
              <Camera size={18} className="sm:w-5 sm:h-5"/> AMBIL KAMERA
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
            </label>
            <label className="w-full cursor-pointer bg-slate-100 text-slate-500 py-3 sm:py-3.5 rounded-2xl sm:rounded-3xl text-[10px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 hover:bg-slate-200 transition-all">
              <ImageIcon size={16} className="sm:w-4 sm:h-4"/> PILIH GALERI
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}
        
        {reportType === 'progres' && p?.src && (
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl shadow-xl animate-in zoom-in z-10">
            {progress}% PROGRES
          </div>
        )}
      </div>
      
      <div className="p-4 sm:p-6 flex-grow flex flex-col space-y-3 sm:space-y-4">
        {p?.src && (
          <>
            <div className="flex bg-slate-100 p-1 rounded-xl sm:rounded-2xl">
              <button onClick={() => setTab('filter')} className={`flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase rounded-lg sm:rounded-xl transition-all ${tab === 'filter' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>🎨 Filter</button>
              <button onClick={() => setTab('crop')} className={`flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase rounded-lg sm:rounded-xl transition-all ${tab === 'crop' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}>📐 Posisi</button>
            </div>

            <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-300">
              {tab === 'filter' && (
                <>
                  {reportType === 'progres' && (
                    <div className="bg-emerald-50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-inner">
                      <div className="flex items-center justify-between mb-2 text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                         <div className="flex items-center gap-1.5"><Target size={12}/> PROGRES (%)</div>
                         <input type="number" min="0" max="100" value={progress} onChange={(e) => updatePhoto('progress', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))} className="w-12 sm:w-16 p-0.5 sm:p-1 text-center bg-white border border-emerald-200 rounded-md font-black text-xs outline-none" />
                      </div>
                      <input type="range" min="0" max="100" value={progress} onChange={(e) => updatePhoto('progress', parseInt(e.target.value))} className="w-full h-1.5 sm:h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                    </div>
                  )}
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-inner">
                    <div className="flex items-center justify-between mb-2 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5"><Sun size={12} className="text-orange-400" /> KECERAHAN</div>
                      <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">{brightness}%</span>
                    </div>
                    <input type="range" min="50" max="250" value={brightness} onChange={(e) => updatePhoto('brightness', parseInt(e.target.value))} className="w-full h-1.5 sm:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-inner">
                    <div className="flex items-center justify-between mb-2 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5"><Droplets size={12} className="text-blue-400" /> SATURASI</div>
                      <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">{saturation}%</span>
                    </div>
                    <input type="range" min="0" max="250" value={saturation} onChange={(e) => updatePhoto('saturation', parseInt(e.target.value))} className="w-full h-1.5 sm:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  </div>
                </>
              )}
              {tab === 'crop' && (
                <>
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-inner">
                    <div className="flex items-center justify-between mb-2 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">🔍 ZOOM</div>
                      <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">{(zoom/100).toFixed(1)}x</span>
                    </div>
                    <input type="range" min="100" max="300" value={zoom} onChange={(e) => updatePhoto('zoom', parseInt(e.target.value))} className="w-full h-1.5 sm:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-inner">
                    <div className="flex items-center justify-between mb-2 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">↔️ GESER HORIZONTAL</div>
                    </div>
                    <input type="range" min="0" max="100" value={panX} onChange={(e) => updatePhoto('panX', parseInt(e.target.value))} className="w-full h-1.5 sm:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600" />
                  </div>
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-inner">
                    <div className="flex items-center justify-between mb-2 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">↕️ GESER VERTIKAL</div>
                    </div>
                    <input type="range" min="0" max="100" value={panY} onChange={(e) => updatePhoto('panY', parseInt(e.target.value))} className="w-full h-1.5 sm:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600" />
                  </div>
                </>
              )}
            </div>
          </>
        )}
        <div className="flex flex-col gap-2">
          <textarea 
            value={p?.note || ''} 
            onChange={e => updatePhoto('note', e.target.value)} 
            placeholder={reportType === 'progres' ? "Detail progres..." : "Keterangan foto..."} 
            className="w-full p-4 sm:p-5 bg-slate-50 rounded-2xl sm:rounded-[28px] text-xs sm:text-sm h-24 sm:h-28 resize-none border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all leading-relaxed outline-none shadow-inner" 
          />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const createNewPage = () => Array(6).fill(null).map(() => ({ id: Date.now() + Math.random(), src: null, note: '', brightness: 100, saturation: 100, progress: 0, zoom: 100, panX: 50, panY: 50 }));
  const defaultReportInfo = { 
    title: 'LAPORAN DOKUMENTASI LAPANGAN', 
    project: '', 
    department: '', 
    contractor: '', 
    consultant: '', 
    date: new Date().getFullYear().toString(), 
    logos: [null, null, null], 
    template: 'klasik',
    customMeta: [
      { id: 'm1', label: 'Pekerjaan', value: '' },
      { id: 'm2', label: 'Instansi', value: '' },
      { id: 'm3', label: 'Kontraktor', value: '' },
      { id: 'm4', label: 'Konsultan', value: '' }
    ]
  };

  const [activeEmail, setActiveEmail] = useState(null); 
  const [emailInput, setEmailInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [debugError, setDebugError] = useState(''); 
  const [user, setUser] = useState(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); 
  const [view, setView] = useState('dashboard'); 
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projectAuthor, setProjectAuthor] = useState('');
  const [projectTime, setProjectTime] = useState(0);
  const isInitialLoad = useRef(true);
  const [reportType, setReportType] = useState('umum'); 
  const [reportInfo, setReportInfo] = useState(defaultReportInfo);
  const [pagesData, setPagesData] = useState({ umum: [], progres: [] });
  const pages = pagesData[reportType] || [];

  const setPages = (updater) => {
    setPagesData(prev => ({ ...prev, [reportType]: typeof updater === 'function' ? updater(prev[reportType]) : updater }));
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfAction, setPdfAction] = useState('download'); 
  const [isPptLoading, setIsPptLoading] = useState(false);
  const [isLibraryReady, setIsLibraryReady] = useState({ pdf: false, ppt: false });
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [bakedPages, setBakedPages] = useState(null);
  const [shouldTriggerDownload, setShouldTriggerDownload] = useState(false);
  
  const lastSavedHashRef = useRef({}); 
  const latestDataRef = useRef({ reportInfo, pagesData, reportType }); 
  const [isOfflineMode, setIsOfflineMode] = useState(false); 
  const isNewlyCreatedRef = useRef(false); 
  const isSavingRef = useRef(false); 
  const queuedSaveDataRef = useRef(null); 
  const projectCacheRef = useRef({}); 
  
  const [showClearModal, setShowClearModal] = useState(false);
  const [showDeleteProjectModal, setShowDeleteProjectModal] = useState({ show: false, project: null });
  const [showReminderModal, setShowReminderModal] = useState(false); 
  const [showDeletePageModal, setShowDeletePageModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); 

  const [retryTrigger, setRetryTrigger] = useState(0);
  const [accessData, setAccessData] = useState({ allowed: [], admins: [] });
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [newEmailUser, setNewEmailUser] = useState('');
  const [newEmailAdmin, setNewEmailAdmin] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [filterEmail, setFilterEmail] = useState('all'); 

  // --- Merekam Data Terkini untuk Keperluan Autosave tanpa mereset timer ---
  useEffect(() => {
    latestDataRef.current = { reportInfo, pagesData, reportType };
  }, [reportInfo, pagesData, reportType]);

  const currentAllowed = useMemo(() => Array.from(new Set([...DEFAULT_EMAIL_IZIN.map(e=>e.toLowerCase()), ...(accessData?.allowed || []).map(e=>e.toLowerCase())])), [accessData?.allowed]);
  const currentAdmins = useMemo(() => Array.from(new Set([...DEFAULT_ADMIN.map(e=>e.toLowerCase()), ...(accessData?.admins || []).map(e=>e.toLowerCase())])), [accessData?.admins]);
  const isAdmin = currentAdmins.includes(activeEmail?.toLowerCase() || '');

  const triggerOfflineMode = () => {
    setIsOfflineMode(prev => {
        if (!prev) {
            setStatusMsg({ text: 'Gagal Konek! Mode Lokal Aktif.', type: 'error' });
            setTimeout(() => setStatusMsg({ text: '', type: '' }), 4000);
            return true;
        }
        return prev;
    });
  };

  const isProjectEmpty = (info, pagesObj) => {
    if (!info || !pagesObj) return true;
    const hasText = !!(info.project || info.department || info.contractor || info.consultant || (info.title && info.title !== 'LAPORAN DOKUMENTASI LAPANGAN'));
    const hasMeta = !!(info.customMeta && info.customMeta.some(m => m.value && m.value.trim() !== ''));
    const hasMedia = [...(pagesObj.umum || []), ...(pagesObj.progres || [])].flat().some(p => p && (p.src !== null || (p.note && p.note.trim() !== '')));
    const hasLogo = !!(info.logos && info.logos.some(l => l !== null));
    return !hasText && !hasMeta && !hasMedia && !hasLogo;
  };

  const checkHasChanges = (id, info, pagesObj) => {
    if (!lastSavedHashRef.current.reportInfo) return true; 
    if (JSON.stringify(info) !== lastSavedHashRef.current.reportInfo) return true;
    if (pagesObj.umum.length !== (lastSavedHashRef.current.umumLength || 0)) return true;
    if (pagesObj.progres.length !== (lastSavedHashRef.current.progresLength || 0)) return true;

    for (let i = 0; i < pagesObj.umum.length; i++) {
        if (createPageHash(pagesObj.umum[i]) !== lastSavedHashRef.current[`${id}_umum_${i}`]) return true;
    }
    for (let i = 0; i < pagesObj.progres.length; i++) {
        if (createPageHash(pagesObj.progres[i]) !== lastSavedHashRef.current[`${id}_progres_${i}`]) return true;
    }
    return false;
  };

  const uniqueAuthors = useMemo(() => {
    const authors = new Set();
    projects.forEach(p => {
      if (p.authorEmail) authors.add(p.authorEmail);
    });
    return Array.from(authors);
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!isAdmin || filterEmail === 'all') return projects;
    return projects.filter(p => p.authorEmail === filterEmail);
  }, [projects, filterEmail, isAdmin]);

  const dashboardStats = useMemo(() => {
    let totalPages = 0;
    let tCounts = { klasik: 0, modern: 0 };
    filteredProjects.forEach(p => {
      const pagesInProject = p.lastActiveTab === 'progres' ? (p.pageCountProgres || 1) : (p.pageCountUmum || p.pageCount || 1);
      totalPages += pagesInProject;
      const t = p.reportInfo?.template || 'klasik';
      if (tCounts[t] !== undefined) tCounts[t]++;
    });
    return { totalPages, templateCounts: tCounts };
  }, [filteredProjects]);

  useEffect(() => {
    document.title = "Aplikasi Dokumentasi"; 
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
        setDebugError(''); 
      } catch (err) {
        setDebugError(err.message); 
      }
    };
    if (auth) initAuth();

    let unsubscribe = () => {};
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (u) => { 
        setUser(u); 
        setIsAppReady(true); 
      });
    } else {
      setIsAppReady(true);
    }
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || isOfflineMode || !db) return;
    const fetchSession = async () => {
      try {
        const snap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'active'));
        if (snap.exists() && snap.data().email) {
          setActiveEmail(snap.data().email);
        }
      } catch (e) {
          if (e.code === 'resource-exhausted' || e.message?.includes('Quota') || e.message?.includes('quota')) triggerOfflineMode();
      }
    };
    fetchSession();
  }, [user, isOfflineMode]);

  useEffect(() => {
    if (!user || isOfflineMode || !db) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_settings', 'access_list');
    
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setAccessData(snap.data());
      } else {
        const initialData = { allowed: DEFAULT_EMAIL_IZIN, admins: DEFAULT_ADMIN };
        setDoc(docRef, initialData).catch(e => {
            if (e.code === 'resource-exhausted' || e.message?.includes('Quota') || e.message?.includes('quota')) triggerOfflineMode();
        });
        setAccessData(initialData);
      }
    }, (error) => {
       if (error.code === 'resource-exhausted' || error.message?.includes('Quota') || error.message?.includes('quota')) {
           triggerOfflineMode();
       }
    });

    return () => unsubscribe();
  }, [user, isOfflineMode]);

  useEffect(() => {
    if (!user || !activeEmail || isOfflineMode || !db) return;
    
    const projCol = collection(db, 'artifacts', appId, 'public', 'data', 'docufield_projects');
    const unsubscribe = onSnapshot(projCol, (snap) => {
      const loaded = [];
      const adminAktif = currentAdmins.includes(activeEmail.toLowerCase());

      snap.forEach(d => {
        const data = d.data();
        if (adminAktif || data.authorEmail === activeEmail || !data.authorEmail) {
          loaded.push({ id: d.id, ...data });
        }
      });
      loaded.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      setProjects(loaded);
    }, (err) => { 
      if(err.code === 'resource-exhausted' || err.message?.includes('Quota') || err.message?.includes('quota')) {
         triggerOfflineMode();
      }
    });

    return () => unsubscribe();
  }, [user, activeEmail, currentAdmins, isOfflineMode]);

  useEffect(() => {
    if (!user || !activeProjectId || view === 'dashboard' || isOfflineMode || !db) return;

    const projRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_projects', activeProjectId);
    const unsubscribe = onSnapshot(projRef, async (snap) => {
        if (!snap.exists()) {
            if (isNewlyCreatedRef.current) return;
            setStatusMsg({ text: 'Proyek dihapus oleh orang lain.', type: 'error' });
            setView('dashboard'); setActiveProjectId(null); return;
        }

        isNewlyCreatedRef.current = false;
        const data = snap.data();
        if (data.lastSavedBy && data.lastSavedBy !== TAB_SESSION_ID) {
            setStatusMsg({ text: 'Menyinkronkan Kolaborasi...', type: 'info' });
            
            try {
                let loadedInfo = data.reportInfo || defaultReportInfo;
                if (!loadedInfo.customMeta) {
                    loadedInfo = { ...loadedInfo, customMeta: [
                        { id: 'm1', label: 'Pekerjaan', value: loadedInfo.project || '' },
                        { id: 'm2', label: 'Instansi', value: loadedInfo.department || '' },
                        { id: 'm3', label: 'Kontraktor', value: loadedInfo.contractor || '' },
                        { id: 'm4', label: 'Konsultan', value: loadedInfo.consultant || '' }
                    ]};
                }

                const umumPromises = []; const progresPromises = [];
                for(let i=0; i < (data.pageCountUmum || 0); i++) umumPromises.push(getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${activeProjectId}_umum_page_${i}`)));
                for(let i=0; i < (data.pageCountProgres || 0); i++) progresPromises.push(getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${activeProjectId}_progres_page_${i}`)));

                const [umumSnaps, progresSnaps] = await Promise.all([Promise.all(umumPromises), Promise.all(progresPromises)]);
                
                let loadedUmum = []; let loadedProgres = [];
                const initialHash = {};
                
                umumSnaps.forEach((pSnap, idx) => { 
                    if(pSnap.exists()) { 
                        const pData = pSnap.data().data; loadedUmum.push(pData); initialHash[`${activeProjectId}_umum_${idx}`] = createPageHash(pData);
                    } else {
                        const blankPage = createNewPage(); loadedUmum.push(blankPage); initialHash[`${activeProjectId}_umum_${idx}`] = createPageHash(blankPage);
                    }
                });
                
                progresSnaps.forEach((pSnap, idx) => { 
                    if(pSnap.exists()) { 
                        const pData = pSnap.data().data; loadedProgres.push(pData); initialHash[`${activeProjectId}_progres_${idx}`] = createPageHash(pData);
                    } else {
                        const blankPage = createNewPage(); loadedProgres.push(blankPage); initialHash[`${activeProjectId}_progres_${idx}`] = createPageHash(blankPage);
                    }
                });

                lastSavedHashRef.current = initialHash;
                lastSavedHashRef.current.reportInfo = JSON.stringify(loadedInfo);
                lastSavedHashRef.current.umumLength = loadedUmum.length;
                lastSavedHashRef.current.progresLength = loadedProgres.length;

                setReportInfo(loadedInfo);
                setProjectAuthor(data.authorEmail || activeEmail);
                setProjectTime(data.updatedAt || Date.now());
                setPagesData({
                    umum: loadedUmum.length > 0 ? loadedUmum : [createNewPage()],
                    progres: loadedProgres.length > 0 ? loadedProgres : [createNewPage()]
                });

                setStatusMsg({ text: 'Tersinkronisasi Real-time!', type: 'success' });
                setTimeout(() => setStatusMsg({ text: '', type: '' }), 2500);
            } catch (e) { console.error("Gagal Live Sync", e); }
        }
    });

    return () => unsubscribe();
  }, [user, activeProjectId, view, isOfflineMode, activeEmail]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    setStatusMsg({ text: 'Memeriksa Izin...', type: 'info' });
    setLoginError('');

    if (!user) {
       setLoginError('Koneksi ke server belum siap. Mohon tunggu...');
       setStatusMsg({ text: '', type: '' });
       return;
    }

    try {
       if (isOfflineMode || !db) throw { code: 'resource-exhausted' };
       const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_settings', 'access_list');
       const snap = await getDoc(docRef);
       
       let serverAllowed = [];
       if (snap.exists() && snap.data().allowed && Array.isArray(snap.data().allowed)) { 
           serverAllowed = snap.data().allowed.map(em => em.toLowerCase());
       }
       
       const combinedAllowed = Array.from(new Set([...DEFAULT_EMAIL_IZIN.map(e=>e.toLowerCase()), ...serverAllowed]));
       const isAllowed = combinedAllowed.includes(email); 

       if (isAllowed) {
          setActiveEmail(email);
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'active'), { email }).catch(()=>{});
          setStatusMsg({ text: '', type: '' });
       } else {
          setLoginError(`Akses Ditolak: Email "${email}" tidak terdaftar.`); 
          setStatusMsg({ text: '', type: '' });
       }
    } catch (err) { 
       if (err.code === 'resource-exhausted' || err.message?.includes('Quota') || err.message?.includes('offline') || err.message?.includes('quota')) {
           triggerOfflineMode();
           const combinedAllowed = DEFAULT_EMAIL_IZIN.map(e=>e.toLowerCase());
           if (combinedAllowed.includes(email)) {
              setActiveEmail(email);
              setStatusMsg({ text: 'MODE LOKAL AKTIF', type: 'error' });
              setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
           } else {
              setLoginError(`Gagal akses Cloud. Hanya email bawaan yang bisa masuk saat mode luring.`); 
              setStatusMsg({ text: '', type: '' });
           }
       } else {
           setLoginError('Terjadi kesalahan membaca data server.');
           setStatusMsg({ text: '', type: '' });
       }
    }
  };

  const handleLogout = async () => { 
      setActiveEmail(null); 
      try {
          if (user && !isOfflineMode && db) await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'active'));
      } catch (e) {}
  };

  const handleAddNewEmail = () => {
    const email = newEmailUser.trim().toLowerCase();
    if (!email) return;
    
    const formattedAllowed = currentAllowed.map(e => e.toLowerCase());
    
    if (formattedAllowed.includes(email)) { 
        setStatusMsg({ text: 'Email sudah terdaftar!', type: 'error' }); 
        setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000); 
        return; 
    }
    
    const newData = { allowed: [...currentAllowed, email], admins: [...currentAdmins] };
    if (newEmailAdmin && !newData.admins.map(e => e.toLowerCase()).includes(email)) {
        newData.admins.push(email);
    }
    
    saveAccessToCloud(newData);
    setNewEmailUser(''); setNewEmailAdmin(false);
  };

  const handleRemoveAccessEmail = (emailToRemove) => {
    if (emailToRemove === activeEmail) { setStatusMsg({ text: 'Tidak bisa menghapus akun sendiri!', type: 'error' }); setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000); return; }
    if (DEFAULT_EMAIL_IZIN.includes(emailToRemove.toLowerCase())) {
        setStatusMsg({ text: 'Email bawaan KODE tidak bisa dihapus.', type: 'error' }); 
        setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000); 
        return;
    }

    const newData = {
       allowed: currentAllowed.filter(e => e.toLowerCase() !== emailToRemove.toLowerCase()),
       admins: currentAdmins.filter(e => e.toLowerCase() !== emailToRemove.toLowerCase())
    };
    saveAccessToCloud(newData);
  };

  const saveAccessToCloud = async (newData) => {
    if (isOfflineMode || !db) { setStatusMsg({ text: 'Tidak bisa kelola akses di Mode Lokal', type: 'error' }); setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000); return; }
    try {
      setStatusMsg({ text: 'Menyimpan Pengaturan...', type: 'info' });
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_settings', 'access_list'), newData);
      setStatusMsg({ text: 'Akses Diperbarui!', type: 'success' });
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000);
    } catch (e) { setStatusMsg({ text: 'Gagal memperbarui', type: 'error' }); }
  };

  useEffect(() => {
    if (view === 'preview') {
      const screenW = window.innerWidth;
      if (screenW < 850) {
        setPreviewZoom((screenW - 32) / 794); 
      } else {
        setPreviewZoom(1);
      }
    }
  }, [view]);

  const saveToCloudNow = async (id, info, pagesObj, type, emailToSave, timeToSave) => {
    if (!user || !id) return Promise.resolve(false);
    if (isOfflineMode || !db) return Promise.resolve(false);
    
    projectCacheRef.current[id] = { info, pagesObj, type, timeToSave };

    if (isSavingRef.current) {
        queuedSaveDataRef.current = { id, info, pagesObj, type, emailToSave, timeToSave };
        return Promise.resolve(false); 
    }
    
    if (isProjectEmpty(info, pagesObj)) {
        return Promise.resolve(false); 
    }
    
    try {
      isSavingRef.current = true;
      queuedSaveDataRef.current = null; 
      setSaveStatus('saving');
      
      let currentBatch = writeBatch(db);
      let opsCount = 0;

      const commitBatch = async () => {
          if (opsCount > 0) {
              await currentBatch.commit();
              currentBatch = writeBatch(db);
              opsCount = 0;
          }
      };

      const addToBatch = async (ref, data, isDelete) => {
          if (isDelete) currentBatch.delete(ref);
          else currentBatch.set(ref, data);
          opsCount++;

          if (opsCount >= 5) {
              await commitBatch();
          }
      };
      
      const projRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_projects', id);
      await addToBatch(projRef, { 
        reportInfo: info, 
        lastActiveTab: type, 
        pageCountUmum: pagesObj.umum.length, 
        pageCountProgres: pagesObj.progres.length, 
        updatedAt: timeToSave || Date.now(), 
        authorEmail: emailToSave,
        lastSavedBy: TAB_SESSION_ID 
      }, false);

      const isPageBlank = (pageData) => !pageData || pageData.every(p => !p.src && (!p.note || p.note.trim() === ''));

      const processPagesToBatch = async (pages, typeStr, oldLength) => {
          for (let i = 0; i < pages.length; i++) {
              const currentHash = createPageHash(pages[i]);
              
              if (lastSavedHashRef.current[`${id}_${typeStr}_${i}`] !== currentHash) {
                  const pageRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${id}_${typeStr}_page_${i}`);
                  if (isPageBlank(pages[i])) {
                      await addToBatch(pageRef, null, true);
                  } else {
                      await addToBatch(pageRef, { index: i, projectId: id, type: typeStr, data: pages[i] }, false);
                  }
                  lastSavedHashRef.current[`${id}_${typeStr}_${i}`] = currentHash;
              }
          }
          
          for (let i = pages.length; i < oldLength; i++) {
              if (lastSavedHashRef.current[`${id}_${typeStr}_${i}`] !== undefined) {
                  const pageRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${id}_${typeStr}_page_${i}`);
                  await addToBatch(pageRef, null, true);
                  delete lastSavedHashRef.current[`${id}_${typeStr}_${i}`];
              }
          }
      };

      const oldUmumLength = lastSavedHashRef.current.umumLength || pagesObj.umum.length;
      const oldProgresLength = lastSavedHashRef.current.progresLength || pagesObj.progres.length;

      await processPagesToBatch(pagesObj.umum, 'umum', oldUmumLength);
      await processPagesToBatch(pagesObj.progres, 'progres', oldProgresLength);
      
      await commitBatch();

      lastSavedHashRef.current.reportInfo = JSON.stringify(info);
      lastSavedHashRef.current.umumLength = pagesObj.umum.length;
      lastSavedHashRef.current.progresLength = pagesObj.progres.length;
      
      isNewlyCreatedRef.current = false;

      setSaveStatus('saved');
      return true;
    } catch (error) { 
      setSaveStatus('error'); 
      if (error.code === 'resource-exhausted' || (error.message && (error.message.includes('Quota') || error.message.includes('quota')))) {
         triggerOfflineMode();
      }
      return false;
    } finally {
      isSavingRef.current = false; 
      
      if (queuedSaveDataRef.current) {
          const q = queuedSaveDataRef.current;
          queuedSaveDataRef.current = null; 
          saveToCloudNow(q.id, q.info, q.pagesObj, q.type, q.emailToSave, q.timeToSave);
      }
    }
  };

  useEffect(() => {
    if (!user || !activeProjectId || view === 'dashboard' || isOfflineMode) return;
    
    const interval = setInterval(() => {
      if (isSavingRef.current) return; 
      
      const currentData = latestDataRef.current;
      if (!isProjectEmpty(currentData.reportInfo, currentData.pagesData)) {
          if (checkHasChanges(activeProjectId, currentData.reportInfo, currentData.pagesData)) {
              const isOwner = activeEmail === projectAuthor;
              saveToCloudNow(activeProjectId, currentData.reportInfo, currentData.pagesData, currentData.reportType, projectAuthor, isOwner ? Date.now() : projectTime);
          }
      }
    }, 30000); 

    return () => clearInterval(interval);
  }, [activeProjectId, user, view, activeEmail, projectAuthor, projectTime, isOfflineMode]);

  const createNewProject = async () => {
    const newId = `proj_${Date.now()}`;
    const newInfo = {...defaultReportInfo, title: 'LAPORAN DOKUMENTASI LAPANGAN'};
    const newPages = { umum: [createNewPage()], progres: [createNewPage()] };
    const now = Date.now();
    
    isNewlyCreatedRef.current = true; 
    
    lastSavedHashRef.current = {
        reportInfo: JSON.stringify(newInfo),
        umumLength: 1,
        progresLength: 1,
        [`${newId}_umum_0`]: createPageHash(newPages.umum[0]),
        [`${newId}_progres_0`]: createPageHash(newPages.progres[0])
    }; 
    
    setActiveProjectId(newId);
    setReportInfo(newInfo);
    setReportType('umum');
    setPagesData(newPages);
    setCurrentPage(1);
    setProjectAuthor(activeEmail);
    setProjectTime(now);
    setView('edit');
    isInitialLoad.current = false;
  };

  const openProject = async (project, sessionData = null) => {
    if (!user) { setStatusMsg({ text: 'Mode Offline', type: 'error' }); return; }
    if (isOfflineMode || !db) { setStatusMsg({ text: 'Mode Offline Aktif', type: 'error' }); setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000); return; }
    
    isNewlyCreatedRef.current = false; 
    
    setActiveProjectId(project.id);
    setStatusMsg({ text: 'Menarik Foto...', type: 'info' });
    setSaveStatus('loading');
    try {
      const projSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_projects', project.id));
      const freshProjectData = projSnap.exists() ? projSnap.data() : project;
      const pAuthor = freshProjectData.authorEmail || project.authorEmail || activeEmail;
      const pTime = freshProjectData.updatedAt || project.updatedAt || Date.now();

      const cache = projectCacheRef.current[project.id];
      if (cache && cache.timeToSave >= pTime) {
          setProjectAuthor(pAuthor);
          setProjectTime(cache.timeToSave);
          isInitialLoad.current = true;

          setReportInfo(cache.info);
          setReportType(cache.type);
          setPagesData(cache.pagesObj);

          const initialHash = {};
          cache.pagesObj.umum.forEach((pData, idx) => { initialHash[`${project.id}_umum_${idx}`] = createPageHash(pData); });
          cache.pagesObj.progres.forEach((pData, idx) => { initialHash[`${project.id}_progres_${idx}`] = createPageHash(pData); });

          lastSavedHashRef.current = initialHash;
          lastSavedHashRef.current.reportInfo = JSON.stringify(cache.info);
          lastSavedHashRef.current.umumLength = cache.pagesObj.umum.length;
          lastSavedHashRef.current.progresLength = cache.pagesObj.progres.length;

          setView(sessionData?.view || 'edit');
          setCurrentPage(sessionData?.currentPage || 1);
          setSaveStatus('saved');
          setStatusMsg({ text: '', type: '' });
          return; 
      }

      setProjectAuthor(pAuthor);
      setProjectTime(pTime);
      isInitialLoad.current = true;
      let loadedInfo = sessionData?.reportInfo || freshProjectData.reportInfo || defaultReportInfo;
      if (!loadedInfo.customMeta) {
          loadedInfo = { ...loadedInfo, customMeta: [
              { id: 'm1', label: 'Pekerjaan', value: loadedInfo.project || '' },
              { id: 'm2', label: 'Instansi', value: loadedInfo.department || '' },
              { id: 'm3', label: 'Kontraktor', value: loadedInfo.contractor || '' },
              { id: 'm4', label: 'Konsultan', value: loadedInfo.consultant || '' }
          ]};
      }
      setReportInfo(loadedInfo);
      const freshType = sessionData?.reportType || freshProjectData.lastActiveTab || freshProjectData.reportType || 'umum';
      setReportType(freshType);
      setView(sessionData?.view || 'edit');
      setCurrentPage(sessionData?.currentPage || 1); 
      let loadedUmum = []; let loadedProgres = [];
      const umumPromises = []; const progresPromises = [];
      for(let i=0; i < (freshProjectData.pageCountUmum || 0); i++) umumPromises.push(getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${project.id}_umum_page_${i}`)));
      for(let i=0; i < (freshProjectData.pageCountProgres || 0); i++) progresPromises.push(getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${project.id}_progres_page_${i}`)));
      const [umumSnaps, progresSnaps] = await Promise.all([Promise.all(umumPromises), Promise.all(progresPromises)]);
      const initialHash = {};

      umumSnaps.forEach((pSnap, idx) => { 
          if(pSnap.exists()) { 
              const data = pSnap.data().data; 
              loadedUmum.push(data); 
              initialHash[`${project.id}_umum_${idx}`] = createPageHash(data); 
          } else {
              const blankPage = createNewPage();
              loadedUmum.push(blankPage);
              initialHash[`${project.id}_umum_${idx}`] = createPageHash(blankPage);
          }
      });
      progresSnaps.forEach((pSnap, idx) => { 
          if(pSnap.exists()) { 
              const data = pSnap.data().data; 
              loadedProgres.push(data); 
              initialHash[`${project.id}_progres_${idx}`] = createPageHash(data); 
          } else {
              const blankPage = createNewPage();
              loadedProgres.push(blankPage);
              initialHash[`${project.id}_progres_${idx}`] = createPageHash(blankPage);
          }
      });
      
      lastSavedHashRef.current = initialHash;
      lastSavedHashRef.current.reportInfo = JSON.stringify(loadedInfo);
      lastSavedHashRef.current.umumLength = loadedUmum.length;
      lastSavedHashRef.current.progresLength = loadedProgres.length;

      setPagesData({ umum: loadedUmum.length > 0 ? loadedUmum : [createNewPage()], progres: loadedProgres.length > 0 ? loadedProgres : [createNewPage()] });
      setSaveStatus('saved');
      setStatusMsg({ text: '', type: '' });
    } catch (e) { 
      setSaveStatus('error'); 
      if (e.code === 'resource-exhausted' || e.message?.includes('Quota')) triggerOfflineMode();
      else setStatusMsg({ text: 'Gagal menarik foto', type: 'error' });
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 4000);
    }
  };

  const executeDeleteProject = () => {
    if (!user || !showDeleteProjectModal.project || isOfflineMode || !db) return;
    const proj = showDeleteProjectModal.project;
    setShowDeleteProjectModal({ show: false, project: null });
    
    setStatusMsg({ text: 'Proyek Dihapus!', type: 'success' }); 
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000);

    const backgroundDelete = async () => {
        try {
            const batch = writeBatch(db);
            batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_projects', proj.id));

            const uCount = proj.pageCountUmum || 20;
            const pCount = proj.pageCountProgres || 20;

            for (let i = 0; i < uCount; i++) batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${proj.id}_umum_page_${i}`));
            for (let i = 0; i < pCount; i++) batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${proj.id}_progres_page_${i}`));

            await batch.commit();
        } catch (e) {
            console.error("Penghapusan latar belakang selesai dengan peringatan:", e);
        }
    };
    
    backgroundDelete(); 
  };

  useEffect(() => {
    if (!user || !isAppReady) return;
    if (view === 'dashboard') {
        const sessionStr = sessionStorage.getItem('docufield_active_session');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                const restore = async () => {
                    if (isOfflineMode || !db) return;
                    setSaveStatus('loading');
                    try {
                        const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_projects', session.projectId));
                        if (snap.exists()) await openProject({ id: snap.id, ...snap.data() }, session);
                        else sessionStorage.removeItem('docufield_active_session');
                    } catch {}
                };
                restore();
            } catch {}
        }
    }
  }, [user, isAppReady, isOfflineMode]);

  useEffect(() => {
    if ((view === 'edit' || view === 'preview') && activeProjectId) {
        sessionStorage.setItem('docufield_active_session', JSON.stringify({
            projectId: activeProjectId, reportType, currentPage, reportInfo, view, projectAuthor, projectTime
        }));
    } else if (view === 'dashboard') sessionStorage.removeItem('docufield_active_session');
  }, [view, activeProjectId, reportType, currentPage, reportInfo, projectAuthor, projectTime]);

  const saveCurrentProject = async () => {
    if (activeProjectId) {
      if (isProjectEmpty(reportInfo, pagesData)) {
         setStatusMsg({ text: 'Proyek Masih Kosong!', type: 'info' });
         setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000);
         return;
      }
      
      if (!checkHasChanges(activeProjectId, reportInfo, pagesData)) {
          setStatusMsg({ text: 'Sudah Tersimpan!', type: 'success' });
          setTimeout(() => setStatusMsg({ text: '', type: '' }), 1500);
          return;
      }

      const isOwner = activeEmail === projectAuthor;
      setStatusMsg({ text: 'Menyinkronkan...', type: 'info' });
      
      const success = await saveToCloudNow(activeProjectId, reportInfo, pagesData, reportType, projectAuthor, isOwner ? Date.now() : projectTime);
      
      if (success) {
          setStatusMsg({ text: 'Tersimpan!', type: 'success' });
      } else if (queuedSaveDataRef.current) {
          setStatusMsg({ text: 'Antrean Tersimpan!', type: 'success' });
      }
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 2500);
    }
  };

  const triggerPdfBaking = async (action = 'download') => {
    setPdfAction(action);
    setIsPdfLoading(true); 
    setStatusMsg({ text: action === 'share' ? 'Menyiapkan File...' : 'Menyiapkan PDF...', type: 'info' });
    try {
      const processed = await Promise.all(pages.map(async (page) => {
        return await Promise.all(page.map(async (photo) => {
          if (!photo.src) return photo;
          const isModified = photo.brightness !== 100 || photo.saturation !== 100 || photo.zoom !== 100 || photo.panX !== 50 || photo.panY !== 50;
          if (isModified) {
              const finalSrc = await bakeImageFilters(photo.src, photo.brightness, photo.saturation, photo.zoom, photo.panX, photo.panY);
              return { ...photo, src: finalSrc, isBaked: true }; 
          } else {
              return { ...photo, isBaked: true };
          }
        }));
      }));
      setBakedPages(processed); setShouldTriggerDownload(true);
    } catch (err) { setIsPdfLoading(false); setStatusMsg({ text: 'Gagal proses', type: 'error' }); }
  };

  useEffect(() => {
    const loadScript = (src, id) => new Promise((resolve) => {
      if (document.getElementById(id)) return resolve();
      const s = document.createElement('script');
      s.src = src; s.id = id; s.async = true; s.onload = resolve; s.onerror = () => resolve();
      document.body.appendChild(s);
    });
    if(!isLibraryReady.pdf) {
      Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', 'lib-jspdf'),
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js', 'lib-h2c'),
        loadScript('https://cdn.jsdelivr.net/gh/gitbrent/PptxGenJS@3.12.0/dist/pptxgen.bundle.js', 'lib-ppt')
      ]).then(() => setIsLibraryReady({ pdf: !!window.jspdf && !!window.html2canvas, ppt: !!window.PptxGenJS }));
    }
  }, [isLibraryReady.pdf]);

  useEffect(() => {
    if (shouldTriggerDownload && bakedPages) {
      const generatePDF = async () => {
        const element = document.getElementById('pdf-render-area');
        const images = element.querySelectorAll('img');
        await Promise.all(Array.from(images).map(img => img.complete ? Promise.resolve() : new Promise(r => img.onload = r)));
        const cleanTitle = reportInfo.title.replace(/ /g, '_');
        
        const clonedContainer = document.createElement('div');
        clonedContainer.style.position = 'absolute';
        clonedContainer.style.top = '-10000px';
        const clonedElement = element.cloneNode(true);
        clonedContainer.appendChild(clonedElement);
        document.body.appendChild(clonedContainer);

        try { 
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF('p', 'mm', 'a4');
            const pagesElements = clonedElement.querySelectorAll('.report-page-final');

            for (let i = 0; i < pagesElements.length; i++) {
                setStatusMsg({ text: `Memproses ${i + 1}/${pagesElements.length}...`, type: 'info' });
                await new Promise(r => setTimeout(r, 50));
                const canvas = await window.html2canvas(pagesElements[i], { scale: 2.5, useCORS: true, width: 794, windowWidth: 794, logging: false });
                const imgData = canvas.toDataURL('image/jpeg', 0.98);
                if (i > 0) doc.addPage();
                doc.addImage(imgData, 'JPEG', 0, 0, 210, 296.7);
            }

            if (pdfAction === 'share') {
                setStatusMsg({ text: 'Menyiapkan File Share...', type: 'info' });
                const pdfBlob = doc.output('blob');
                const file = new File([pdfBlob], `${cleanTitle}.pdf`, { type: 'application/pdf' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: reportInfo.title, text: 'Berikut adalah laporan dokumentasi lapangan.' });
                    setStatusMsg({ text: 'Berhasil dibagikan!', type: 'success' });
                } else {
                    doc.save(`${cleanTitle}.pdf`);
                    setStatusMsg({ text: 'Otomatis Mengunduh...', type: 'info' });
                }
            } else {
                setStatusMsg({ text: 'Mengunduh PDF...', type: 'info' });
                doc.save(`${cleanTitle}.pdf`); 
                setStatusMsg({ text: 'PDF Diunduh!', type: 'success' }); 
            }
        } catch (e) {
            setStatusMsg({ text: e.name === 'AbortError' ? 'Batal Dibagikan' : 'Dibatalkan / Selesai', type: 'info' });
        } finally { 
            if (document.body.contains(clonedContainer)) document.body.removeChild(clonedContainer);
            setIsPdfLoading(false); setBakedPages(null); setShouldTriggerDownload(false); 
            setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000); 
        }
      };
      generatePDF();
    }
  }, [shouldTriggerDownload, bakedPages, reportInfo, pdfAction]);

  const downloadMentahan = () => {
    try {
      const data = { docufield_mentahan: true, reportInfo, reportType, pagesData };
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `Mentahan_${reportInfo.project || 'Data'}.json`; a.click();
      setStatusMsg({ text: 'Mentahan Disimpan!', type: 'success' });
    } catch { setStatusMsg({ text: 'Gagal simpan', type: 'error' }); }
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000);
  };

  const loadMentahan = (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setStatusMsg({ text: 'Membaca File...', type: 'info' });
    const reader = new FileReader();
    
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.docufield_mentahan) return;
        const newId = `proj_${Date.now()}`;
        const now = Date.now();
        setActiveProjectId(newId);
        
        isNewlyCreatedRef.current = true; 
        
        let loadedInfo = data.reportInfo || defaultReportInfo;
        
        const initialHash = { reportInfo: JSON.stringify(loadedInfo), umumLength: data.pagesData?.umum?.length || 0, progresLength: data.pagesData?.progres?.length || 0 }; 
        lastSavedHashRef.current = initialHash;

        setReportInfo(loadedInfo); setReportType(data.reportType || 'umum'); setPagesData(data.pagesData);
        setCurrentPage(1); setProjectAuthor(activeEmail); setProjectTime(now); setView('edit');
        
        setStatusMsg({ text: 'Berhasil Dibuka!', type: 'success' });
        setTimeout(() => setStatusMsg({ text: '', type: '' }), 1500);
        
        if (user && !isOfflineMode && !isProjectEmpty(loadedInfo, data.pagesData)) {
            saveToCloudNow(newId, loadedInfo, data.pagesData, data.reportType || 'umum', activeEmail, now);
        }
      } catch (err) { 
        console.error("Kesalahan muat:", err);
        setStatusMsg({ text: 'Gagal / File Rusak', type: 'error' }); 
        setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000); 
      }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const executePendingAction = () => {
    setShowReminderModal(false);
    if (pendingAction === 'dashboard') {
      setStatusMsg({ text: 'Kembali ke Dashboard...', type: 'info' });
      if (activeProjectId && !isOfflineMode) {
        if (!isProjectEmpty(reportInfo, pagesData)) {
            if (checkHasChanges(activeProjectId, reportInfo, pagesData)) {
                const isOwner = activeEmail === projectAuthor;
                const timeToSave = isOwner ? Date.now() : projectTime;
                saveToCloudNow(activeProjectId, reportInfo, pagesData, reportType, projectAuthor, timeToSave); 
            }
        }
      }
      setView('dashboard'); setPagesData({ umum: [], progres: [] }); setBakedPages(null); setActiveProjectId(null); 
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 1000);
    } else if (pendingAction === 'logout') handleLogout();
    setPendingAction(null);
  };

  const saveMentahanAndProceed = () => { downloadMentahan(); setTimeout(() => executePendingAction(), 300); };

  const processInitialUpload = (dataUrl) => {
    return new Promise((r) => {
      const img = new Image(); img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas'); 
        const max = 500; 
        let w = img.width, h = img.height;
        if (w > max || h > max) { if (w > h) { h = Math.round((max / w) * h); w = max; } else { w = Math.round((max / h) * w); h = max; } }
        canvas.width = w; canvas.height = h; 
        const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
        r(canvas.toDataURL('image/jpeg', 0.5)); 
      };
      img.onerror = () => r(null);
    });
  };

  const processLogoUpload = (dataUrl) => {
    return new Promise((r) => {
      const img = new Image(); img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas'); const max = 300;
        let w = img.width, h = img.height;
        if (w > max || h > max) { if (w > h) { h = Math.round((max / w) * h); w = max; } else { w = Math.round((max / h) * w); h = max; } }
        canvas.width = w; canvas.height = h; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
        r(canvas.toDataURL('image/png'));
      };
      img.onerror = () => r(null);
    });
  };

  const bakeImageFilters = (dataUrl, brightness, saturation, zoom = 100, panX = 50, panY = 50) => {
    if (!dataUrl) return Promise.resolve(null);
    return new Promise((resolve) => {
      const img = new Image(); img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetW = 810, targetH = 492; canvas.width = targetW; canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        ctx.filter = `brightness(${brightness}%) saturate(${saturation}%)`;
        const targetRatio = targetW / targetH; const imgRatio = img.width / img.height;
        let sX, sY, sW, sH;
        if (imgRatio > targetRatio) { sH = img.height; sW = img.height * targetRatio; sX = (img.width - sW) / 2; sY = 0; } 
        else { sW = img.width; sH = img.width / targetRatio; sX = 0; sY = (img.height - sH) / 2; }
        const scale = 100 / zoom; const nw = sW * scale; const nh = sH * scale;
        const finalX = sX + ((sW - nw) * (panX / 100)); const finalY = sY + ((sH - nh) * (panY / 100));
        ctx.drawImage(img, finalX, finalY, nw, nh, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', 0.9)); 
      };
      img.onerror = () => resolve(dataUrl);
    });
  };

  const updateSpecificPhoto = (pIdx, sIdx, key, val) => {
    setPages(prev => {
      const n = [...prev]; if (!n[pIdx]) return prev;
      const npo = [...n[pIdx]]; npo[sIdx] = { ...npo[sIdx], [key]: val };
      n[pIdx] = npo; return n;
    });
  };

  const clearSpecificPhoto = (pIdx, sIdx) => {
    setPages(prev => {
      const n = [...prev]; if (!n[pIdx]) return prev; const np = [...n[pIdx]];
      np[sIdx] = { id: np[sIdx].id, src: null, note: np[sIdx].note, brightness: 100, saturation: 100, progress: 0, zoom: 100, panX: 50, panY: 50 };
      n[pIdx] = np; return n;
    });
  };

  const handleFileUpload = async (pIdx, sIdx, e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setStatusMsg({ text: 'Mengolah Foto...', type: 'info' });
    const objectUrl = URL.createObjectURL(file);
    const cropped = await processInitialUpload(objectUrl);
    URL.revokeObjectURL(objectUrl); 
    if (cropped) {
      setPages(prev => {
        const n = [...prev]; const np = [...n[pIdx]];
        np[sIdx] = { ...np[sIdx], src: cropped, brightness: 100, saturation: 100, zoom: 100, panX: 50, panY: 50 };
        n[pIdx] = np; return n;
      });
      setStatusMsg({ text: 'Siap!', type: 'success' });
    } else {
      setStatusMsg({ text: 'Gagal muat foto', type: 'error' });
    }
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000);
    e.target.value = '';
  };

  const handleMegaUpload = async (e) => {
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    const curIdx = currentPage - 1; let updatedPages = [...pages]; let newPageRef = [...updatedPages[curIdx]];
    const emptySlots = []; newPageRef.forEach((s, i) => { if (!s.src) emptySlots.push(i); });
    if (emptySlots.length === 0) { setStatusMsg({ text: 'Penuh!', type: 'error' }); setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000); return; }
    const limit = Math.min(files.length, emptySlots.length);
    setStatusMsg({ text: `Proses ${limit} foto...`, type: 'info' });
    for (let i = 0; i < limit; i++) {
      const objectUrl = URL.createObjectURL(files[i]);
      const cropped = await processInitialUpload(objectUrl);
      URL.revokeObjectURL(objectUrl);
      if (cropped) newPageRef[emptySlots[i]] = { ...newPageRef[emptySlots[i]], src: cropped, brightness: 100, saturation: 100, zoom: 100, panX: 50, panY: 50 };
    }
    updatedPages[curIdx] = newPageRef; setPages(updatedPages);
    setStatusMsg({ text: 'Selesai!', type: 'success' }); setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000);
    e.target.value = '';
  };

  const executeDeleteAllPhotos = () => {
    setPages(prev => { const n = [...prev]; n[currentPage - 1] = createNewPage(); return n; });
    setStatusMsg({ text: 'Dikosongkan!', type: 'success' }); setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000); setShowClearModal(false);
  };

  const handleAddPage = () => {
    if (pages.length >= 50) { setStatusMsg({ text: 'Maksimal 50 Halaman!', type: 'error' }); setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000); return; }
    setPages([...pages, createNewPage()]);
    setCurrentPage(pages.length + 1);
  };

  const executeDeletePage = () => {
    setShowDeletePageModal(false);
    if (pages.length <= 1) { executeDeleteAllPhotos(); return; }
    const newPages = pages.filter((_, idx) => idx !== currentPage - 1);
    setPages(newPages);
    if (currentPage > newPages.length) setCurrentPage(newPages.length);
    setStatusMsg({ text: 'Halaman Dihapus!', type: 'success' });
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000);
  };

  const handleLogoUpload = async (idx, e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setStatusMsg({ text: 'Memproses...', type: 'info' });
    const objectUrl = URL.createObjectURL(file);
    const cropped = await processLogoUpload(objectUrl);
    URL.revokeObjectURL(objectUrl);
    if (cropped) { const n = [...(reportInfo.logos || [null, null, null])]; n[idx] = cropped; setReportInfo({...reportInfo, logos: n}); setStatusMsg({ text: 'Logo Terpasang!', type: 'success' }); }
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000);
    e.target.value = '';
  };

  const removeLogo = (idx) => { const n = [...(reportInfo.logos || [null, null, null])]; n[idx] = null; setReportInfo({...reportInfo, logos: n}); };
  
  const switchTab = (targetMode) => { 
      if (targetMode === reportType) return; 
      setReportType(targetMode); 
      setReportInfo({ ...reportInfo, title: targetMode === 'progres' ? 'LAPORAN DOKUMENTASI PROGRES LAPANGAN' : 'LAPORAN DOKUMENTASI LAPANGAN' }); 
      setCurrentPage(1); 
  };

  const downloadPPTX = async () => {
    if (!isLibraryReady.ppt) return;
    setIsPptLoading(true); setStatusMsg({ text: 'Membangun PPTX Identik...', type: 'info' });
    try {
      const pptx = new window.PptxGenJS(); pptx.defineLayout({ name: 'A4', width: 8.27, height: 11.69 }); pptx.layout = 'A4';
      const PAGE_MARGIN_TOP = 0.236, PAGE_MARGIN_SIDE = 0.59, CONTENT_W = 7.09;
      const gridStartY = 2.5, BOX_W = 3.44, BOX_H = 2.85, GAP = 0.21;
      const masterName = 'MASTER_' + Date.now();
      const masterObjects = [];
      for (let i = 0; i < 6; i++) {
        const col = i % 2, row = Math.floor(i / 2);
        const x = PAGE_MARGIN_SIDE + (col * (BOX_W + GAP)), y = gridStartY + (row * (BOX_H + 0.15));
        const imgX = x + 0.1, imgY = y + 0.1, imgW = BOX_W - 0.2, imgH = 1.97;
        masterObjects.push({ rect: { x, y, w: BOX_W, h: BOX_H, fill: { color: 'FFFFFF' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.05 } });
        masterObjects.push({ placeholder: { options: { name: `pic${i}`, type: 'pic', x: imgX, y: imgY, w: imgW, h: imgH }, text: '' } });
      }
      pptx.defineSlideMaster({ title: masterName, bkgd: 'FFFFFF', objects: masterObjects });
      for (const pData of pages) {
        const slide = pptx.addSlide({ masterName });
        let curY = PAGE_MARGIN_TOP;
        if (reportInfo.logos?.some(l => l !== null)) {
          const lh = 0.55;
          let currentX = PAGE_MARGIN_SIDE;
          for (let i = 0; i < 3; i++) { if (reportInfo.logos[i]) { slide.addImage({ data: reportInfo.logos[i], x: currentX, y: curY, w: 1.5, h: lh, sizing: { type: 'contain' } }); currentX += 1.65; } }
        }
        curY += 0.65;
        slide.addText(reportInfo.title.toUpperCase(), { x: PAGE_MARGIN_SIDE, y: curY, w: CONTENT_W, fontSize: 16, bold: true, align: 'center', color: '0F172A' });
        curY += 0.45;
        const cMeta = reportInfo.customMeta || [];
        const meta = [...cMeta.map(m => ({ l: (m.label || '').toUpperCase(), v: m.value })), { l: "TAHUN", v: reportInfo.date }];
        meta.forEach(m => {
          slide.addText(m.l, { x: PAGE_MARGIN_SIDE, y: curY, w: 1.0, fontSize: 7, bold: true, color: '94A3B8' });
          slide.addText(":", { x: PAGE_MARGIN_SIDE + 1.0, y: curY, w: 0.1, fontSize: 7, bold: true, color: '475569' });
          slide.addText(m.v || '-', { x: PAGE_MARGIN_SIDE + 1.15, y: curY, w: CONTENT_W - 1.15, fontSize: 8, bold: true, color: '1E293B' });
          curY += (m.v?.length > 80) ? 0.22 : 0.14;
        });
        const isModernTemplate = reportInfo.template === 'modern';
        let lineColor = '0F172A'; 
        if (isModernTemplate) lineColor = '3730A3'; 
        if (reportType === 'progres' && !isModernTemplate) lineColor = '10B981'; 
        slide.addShape(pptx.ShapeType.line, { x: PAGE_MARGIN_SIDE, y: curY + 0.05, w: CONTENT_W, h: 0, line: { color: lineColor, width: isModernTemplate ? 3 : 2 } });
        for (let i = 0; i < pData.length; i++) {
          const photo = pData[i]; const col = i % 2, row = Math.floor(i / 2);
          const x = PAGE_MARGIN_SIDE + (col * (BOX_W + GAP)), y = gridStartY + (row * (BOX_H + 0.15));
          const imgW = BOX_W - 0.2, imgH = 1.97;
          if (photo && photo.src) {
            const finalImg = await bakeImageFilters(photo.src, photo.brightness, photo.saturation, photo.zoom, photo.panX, photo.panY);
            slide.addImage({ placeholder: `pic${i}`, data: finalImg, sizing: { type: 'cover', w: imgW, h: imgH } }); 
          }
          const noteLineColor = reportType === 'progres' ? '10B981' : (isModernTemplate ? '6366F1' : '3B82F6'), noteY = y + imgH + 0.2;
          slide.addShape(pptx.ShapeType.rect, { x: x + 0.1, y: noteY, w: 0.04, h: 0.55, fill: { color: noteLineColor } });
          slide.addText('KETERANGAN:', { x: x + 0.2, y: noteY, w: 1.0, h: 0.15, fontSize: 6, bold: true, color: 'CBD5E1' });
          if (reportType === 'progres' && photo?.src) {
             slide.addShape(pptx.ShapeType.rect, { x: x + BOX_W - 0.9, y: noteY, w: 0.8, h: 0.15, fill: { color: 'F8FAFC' }, line: { color: 'E2E8F0', width: 1 }, rectRadius: 0.02 });
             slide.addText(`PROGRES: ${photo.progress || 0}%`, { x: x + BOX_W - 0.9, y: noteY, w: 0.8, h: 0.15, fontSize: 6.5, bold: true, color: '0F172A', align: 'center' });
          }
          slide.addText(photo?.note || '-', { x: x + 0.2, y: noteY + 0.15, w: BOX_W - 0.3, h: 0.4, fontSize: 8.5, italic: true, color: '334155', valign: 'top' });
        }
      }
      await pptx.writeFile({ fileName: `${reportInfo.title.replace(/ /g, '_')}.pptx` });
      setIsPptLoading(false); setStatusMsg({ text: 'PPTX Identik Siap!', type: 'success' });
    } catch { setIsPptLoading(false); setStatusMsg({ text: 'Gagal PPTX', type: 'error' }); }
  };

  const activePageData = useMemo(() => pages[currentPage - 1] || [], [pages, currentPage]);

  const ReportPage = ({ data, isFinal = false }) => {
    const template = reportInfo.template || 'klasik';
    const cMeta = reportInfo.customMeta || [];
    const meta = [...cMeta.map(m => ({ l: m.label, v: m.value })), { l: "Tahun", v: reportInfo.date }];
    const isModern = template === 'modern';
    const baseFontClass = isModern ? 'font-serif text-slate-800' : 'font-sans text-black';
    const headerTitleClass = isModern ? 'text-indigo-950 tracking-wide font-bold' : 'text-slate-900 font-black';
    let headerBorderClass = isModern ? (reportType === 'progres' ? 'border-b-4 border-emerald-700' : 'border-b-4 border-indigo-800') : (reportType === 'progres' ? 'border-b-2 border-emerald-500' : 'border-b-2 border-slate-900');
    const cardContainerClass = isModern ? 'border border-indigo-100 shadow-md rounded-2xl' : 'border border-slate-200 shadow-sm rounded-xl';
    const imgContainerClass = isModern ? `rounded-xl border-2 ${reportType === 'progres' ? 'border-emerald-500' : 'border-indigo-500'}` : 'rounded-lg border border-slate-100';
    let noteBorderClass = isModern ? (reportType === 'progres' ? 'border-emerald-600' : 'border-indigo-500') : (reportType === 'progres' ? 'border-emerald-500' : 'border-blue-500');
    return (
      <div className={`bg-white w-[210mm] flex flex-col ${baseFontClass} relative box-border ${isFinal ? 'report-page-final' : 'mb-10 shadow-2xl rounded-2xl border border-slate-200 shrink-0'}`} style={{ height: '296.7mm', padding: '6mm 15mm 15mm 15mm', margin: '0 auto', pageBreakAfter: 'always' }}>
        <div className={`text-center pb-4 mb-5 flex-none ${headerBorderClass}`}>
          <div className="flex justify-start items-center gap-4 mb-3 h-14">
            {reportInfo.logos?.map((l, i) => l && <img key={i} src={l} className="h-full max-w-[45mm] w-auto object-contain object-left" alt="" />)}
          </div>
          <h2 className={`text-xl uppercase mb-4 leading-tight ${headerTitleClass}`}>{reportInfo.title}</h2>
          <div className="text-left space-y-0.5">
            {meta.map((m, idx) => (
              <div key={idx} className="flex items-start uppercase text-[7pt] tracking-tight">
                <span className="w-24 shrink-0 font-bold text-slate-400">{m.l}</span><span className="mr-2 font-bold text-slate-600">:</span><span className="font-black flex-1 break-words leading-tight text-slate-800">{m.v || '-'}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 flex-grow content-start">
          {data.map((p, i) => (
            <div key={i} className={`p-2.5 flex flex-col h-[72mm] bg-white box-border ${cardContainerClass}`}>
              <div className={`h-[50mm] bg-slate-50 relative overflow-hidden flex items-center justify-center ${imgContainerClass}`}>
                {p?.src ? <img src={p.src} className="w-full h-full object-cover" style={{ filter: `brightness(${p.brightness || 100}%) saturate(${p.saturation || 100}%)`, transform: `scale(${(p.zoom || 100) / 100})`, transformOrigin: `${p.panX ?? 50}% ${p.panY ?? 50}%` }} alt="" /> : <ImageIcon size={30} className="text-slate-200" />}
              </div>
              <div className={`mt-2.5 border-l-4 pl-3 overflow-hidden flex-1 ${noteBorderClass}`}>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-[6pt] font-black text-slate-300 uppercase tracking-tighter">KETERANGAN:</div>
                  {reportType === 'progres' && p?.src && <div className="text-[7pt] font-black text-slate-900 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">PROGRES: {p.progress || 0}%</div>}
                </div>
                <p className={`text-[8.5pt] leading-tight italic line-clamp-2 ${isModern ? 'text-slate-800' : 'text-slate-700 font-medium'}`}>{p?.note || '-'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!activeEmail) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-pulse"></div>
        <div className="bg-white p-8 sm:p-10 rounded-[32px] sm:rounded-[40px] shadow-2xl w-full max-w-md z-10 border border-slate-200">
          <div className="flex justify-center mb-6"><div className="bg-blue-600 p-4 rounded-full shadow-lg text-white"><Lock size={32} /></div></div>
          <h1 className="text-2xl font-black text-center text-slate-800 mb-2 uppercase">Akses Terbatas</h1>
          <p className="text-center text-slate-500 text-sm mb-8 font-medium">Masukkan email yang terdaftar.</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Alamat Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400"><User size={18} /></div>
                <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl sm:rounded-3xl font-medium outline-none transition-all shadow-inner text-sm" placeholder="admin@proyek.com" />
              </div>
            </div>
            {loginError && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-start gap-2"><AlertCircle size={16} className="shrink-0 mt-0.5" /><span>{loginError}</span></div>}
            <button type="submit" disabled={!isAppReady} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl sm:rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 active:scale-95 transition-all text-sm disabled:opacity-50">
              {isAppReady ? 'Masuk' : 'Memuat...'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAppReady) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center">
        <Cloud size={56} className="text-blue-500 mb-6 animate-pulse" /><Loader2 size={32} className="animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-black tracking-widest uppercase text-sm">Menghubungkan Sesi...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-20 overflow-x-hidden relative">
      <header className="bg-slate-900 text-white p-3 sm:p-4 sticky top-0 z-50 flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between shadow-2xl border-b border-white/5">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <Cloud size={22} className={reportType === 'progres' ? 'text-emerald-400' : 'text-blue-400'}/>
            <h1 className="font-black text-sm uppercase tracking-[0.2em]">Aplikasi Dokumentasi</h1>
          </div>
          <div className="flex items-center gap-2 text-[9px] sm:text-[10px] uppercase font-black tracking-widest sm:ml-4">
            {!user ? <span className="flex items-center gap-1.5 text-orange-400"><WifiOff size={12} /> OFFLINE</span> : 
             isOfflineMode ? <span className="flex items-center gap-1.5 text-red-500"><WifiOff size={12} /> LOKAL</span> : (
              <>
                {saveStatus === 'loading' && <span className="flex items-center gap-1.5 text-blue-400"><Loader2 size={12} className="animate-spin" /> Load...</span>}
                {saveStatus === 'saving' && <span className="flex items-center gap-1.5 text-blue-400"><Loader2 size={12} className="animate-spin" /> Mengirim...</span>}
                {saveStatus === 'saved' && <span className="flex items-center gap-1.5 text-emerald-400"><CheckCircle2 size={12} /> OK</span>}
                {saveStatus === 'error' && <button onClick={() => setRetryTrigger(r => r + 1)} className="text-red-400 hover:text-red-300 transition-all flex items-center gap-1 bg-red-400/10 px-2 py-1 rounded-md"><AlertCircle size={12} /> Gagal</button>}
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {view !== 'dashboard' && (
            <>
              <button onClick={() => { setPendingAction('dashboard'); setShowReminderModal(true); }} className="shrink-0 flex items-center gap-1.5 sm:gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold transition-all">
                <ArrowLeft size={14} /> <span className="hidden sm:inline">KEMBALI</span>
              </button>
              <button onClick={saveCurrentProject} disabled={saveStatus === 'saving' || isOfflineMode} className="shrink-0 flex items-center gap-1.5 sm:gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/30">
                {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} 
                <span className="hidden sm:inline">SIMPAN CLOUD</span>
              </button>
              <div className="w-px h-6 bg-white/20 mx-1 shrink-0"></div>
              <button onClick={() => setView('edit')} className={`shrink-0 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black transition-all ${view === 'edit' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>EDITOR</button>
              <button onClick={() => setView('preview')} className={`shrink-0 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black transition-all ${view === 'preview' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>PREVIEW</button>
              <div className="w-px h-6 bg-white/20 mx-1 shrink-0"></div>
              <button onClick={() => triggerPdfBaking('share')} disabled={isPdfLoading} className="shrink-0 bg-blue-500 hover:bg-blue-400 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs text-white flex items-center gap-1.5 sm:gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50">
                {isPdfLoading && pdfAction === 'share' ? <Loader2 size={16} className="animate-spin w-4 h-4 sm:w-5 sm:h-5"/> : <Share2 size={16} className="w-4 h-4 sm:w-5 sm:h-5"/>} BAGIKAN
              </button>
              <button onClick={() => triggerPdfBaking('download')} disabled={isPdfLoading} className="shrink-0 bg-emerald-600 hover:bg-emerald-500 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs text-white flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-50">
                {isPdfLoading && pdfAction === 'download' ? <Loader2 size={16} className="animate-spin"/> : <FileDown size={16}/>} PDF
              </button>
              <button onClick={downloadMentahan} className="shrink-0 bg-slate-700 hover:bg-slate-600 px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs text-white flex items-center gap-1.5 sm:gap-2 shadow-lg transition-all" title="Simpan Mentahan (.json)"><HardDrive size={16} /><span className="hidden lg:inline">MENTAHAN</span></button>
              <button onClick={downloadPPTX} disabled={isPptLoading} className="shrink-0 bg-orange-600 hover:bg-orange-500 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs text-white flex items-center gap-1.5 shadow-lg active:scale-95 disabled:opacity-50">{isPptLoading ? <Loader2 size={16} className="animate-spin"/> : <Presentation size={16}/>} PPTX</button>
            </>
          )}
          {view === 'dashboard' && (
            <button onClick={() => { setPendingAction('logout'); setShowReminderModal(true); }} className="shrink-0 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase flex items-center gap-1.5 transition-all ml-auto"><LogOut size={14}/> Keluar</button>
          )}
        </div>
      </header>

      {statusMsg.text && <div className={`fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 font-black text-[10px] sm:text-xs text-white uppercase tracking-widest animate-in slide-in-from-top-6 ${statusMsg.type === 'error' ? 'bg-red-600' : 'bg-blue-600 border border-white/20'}`}>{statusMsg.type === 'info' && <Loader2 size={16} className="animate-spin" />} {statusMsg.text}</div>}

      {view === 'dashboard' && (
        <main className="max-w-6xl mx-auto p-4 sm:p-8 animate-in fade-in duration-500">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 gap-6">
            <div className="w-full lg:w-auto">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 flex items-center gap-2.5"><FolderOpen className="text-blue-600 w-8 h-8" /> Arsip Laporan</h2>
              <div className="flex items-center gap-2">
                 <p className="text-slate-500 font-medium text-xs sm:text-sm">Masuk sebagai: <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold">{activeEmail}</span>{isAdmin && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold text-[9px] shadow-sm">👑 Admin</span>}</p>
              </div>

              {/* FITUR BARU: FILTER USER PILLS (TAMPILAN PREMIUM) */}
              {isAdmin && projects.length > 0 && (
                <div className="mt-6 flex flex-col gap-2 animate-in fade-in slide-in-from-left-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Filter size={14} className="text-blue-500" /> FILTER PENGGUNA:</div>
                  <div className="flex flex-wrap gap-2">
                     <button onClick={() => setFilterEmail('all')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border shadow-sm ${filterEmail === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700'}`}>Semua ({projects.length})</button>
                     {uniqueAuthors.map(email => {
                       const theme = getUserColorTheme(email);
                       const isActive = filterEmail === email;
                       const userProjectCount = projects.filter(p => p.authorEmail === email).length;
                       return (
                         <button key={email} onClick={() => setFilterEmail(email)} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all border shadow-sm ${isActive ? `${theme.bg} ${theme.text} ${theme.border} ring-2 ring-offset-2 ring-${theme.border.split('-')[1]}-400` : `bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-slate-700`}`}>
                           <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white shadow-sm ${theme.solid}`}>{theme.initial}</span>
                           <span className="max-w-[120px] truncate">{email.split('@')[0]}</span>
                           <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] ${isActive ? 'bg-white/50' : 'bg-slate-100 text-slate-400'}`}>{userProjectCount}</span>
                         </button>
                       );
                     })}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto mt-4 lg:mt-0 shrink-0">
              {isAdmin && <button onClick={() => setShowAccessModal(true)} className="w-full sm:w-auto bg-slate-800 text-white px-4 sm:px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"><User size={16}/> AKSES</button>}
              <label className="w-full sm:w-auto bg-white text-blue-600 border-2 border-blue-600 px-4 sm:px-6 py-3.5 rounded-2xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-95"><UploadCloud size={16}/> BUKA MENTAHAN<input type="file" accept=".json" onChange={loadMentahan} className="hidden" /></label>
              <button onClick={createNewProject} className="w-full sm:w-auto bg-blue-600 text-white px-4 sm:px-8 py-3.5 rounded-2xl font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30 transition-all active:scale-95"><Plus size={16}/> BUAT LAPORAN</button>
            </div>
          </div>

          {isAdmin && (
            <div className="mb-10 space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><FileStack size={24}/></div>
                   <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Laporan</p><h3 className="text-xl font-black text-slate-800">{filteredProjects.length}</h3></div>
                </div>
                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Layers size={24}/></div>
                   <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Halaman</p><h3 className="text-xl font-black text-slate-800">{dashboardStats.totalPages}</h3></div>
                </div>
                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0"><Users size={24}/></div>
                   <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Kontributor</p><h3 className="text-xl font-black text-slate-800">{uniqueAuthors.length}</h3></div>
                </div>
                <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0"><Activity size={24}/></div>
                   <div className="overflow-hidden w-full"><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 truncate">Aktivitas Terbaru</p>
                     <h3 className="text-[11px] font-bold text-slate-800 leading-tight">
                       {filteredProjects.length > 0 && filteredProjects[0] ? new Date(filteredProjects[0].updatedAt || Date.now()).toLocaleString('id-ID', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'}) : '-'}
                     </h3>
                     {filteredProjects.length > 0 && filteredProjects[0]?.authorEmail && (<p className="text-[9px] text-slate-500 font-medium truncate mt-0.5">Oleh: <span className="text-blue-600">{filteredProjects[0].authorEmail.split('@')[0]}</span></p>)}
                   </div>
                </div>
              </div>
            </div>
          )}

          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-[32px] border-2 border-dashed border-slate-300 p-10 flex flex-col items-center justify-center text-center mt-10">
              <ClipboardList size={48} className="text-slate-300 mb-4" />
              <h3 className="text-lg font-black text-slate-600 mb-2">Belum Ada Laporan</h3>
              <p className="text-slate-400 text-xs sm:text-sm">{filterEmail !== 'all' ? 'Pengguna ini belum memiliki laporan.' : 'Klik buat laporan baru untuk memulai.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-6">
              {filteredProjects.map(p => {
                const uTheme = getUserColorTheme(p.authorEmail);
                return (
                  <div key={p.id} onClick={() => openProject(p)} className="bg-white rounded-[24px] p-5 shadow-sm hover:shadow-xl border border-slate-200 hover:border-blue-400 transition-all flex flex-col hover:-translate-y-1 cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                       <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border ${uTheme.bg} ${uTheme.text} ${uTheme.border}`}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center font-black text-[10px] text-white shadow-sm ${uTheme.solid}`}>
                            {uTheme.initial}
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider max-w-[120px] truncate" title={p.authorEmail}>
                            {(p.authorEmail || 'Anonim').split('@')[0]}
                          </span>
                       </div>
                       <button onClick={(e) => { e.stopPropagation(); setShowDeleteProjectModal({show: true, project: p}); }} className="p-1.5 bg-white border border-slate-100 text-slate-400 hover:text-white hover:bg-red-500 hover:border-red-500 rounded-lg transition-all shadow-sm"><Trash2 size={14}/></button>
                    </div>
                    
                    <h3 className="text-sm font-black text-slate-800 mb-4 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{p.reportInfo?.title || 'Laporan Tanpa Judul'}</h3>
                    
                    <div className="space-y-2.5 mb-5 flex-grow text-[10px] text-slate-500 font-medium">
                      {p.reportInfo?.customMeta?.[0]?.value && (
                         <div className="flex items-center gap-2 truncate bg-slate-50 px-2.5 py-2 rounded-lg border border-slate-100">
                           <Briefcase size={12} className="text-slate-400 shrink-0" /> 
                           <span className="truncate">{p.reportInfo.customMeta[0].value}</span>
                         </div>
                      )}
                      <div className="flex items-center justify-between px-1 pt-1 mt-1 border-t border-slate-50">
                         <div className="flex items-center gap-1.5" title="Waktu Update Terakhir">
                           <Calendar size={12} className="text-blue-400 shrink-0"/> 
                           <span className="text-[9px] tracking-tight">{new Date(p.updatedAt || Date.now()).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                         </div>
                         <div className="flex items-center gap-1.5" title="Jumlah Halaman">
                           <FileText size={12} className={p.lastActiveTab === 'progres' ? 'text-emerald-400 shrink-0' : 'text-blue-400 shrink-0'}/> 
                           <span>{p.lastActiveTab === 'progres' ? (p.pageCountProgres || 1) : (p.pageCountUmum || 1)} Hal</span>
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      )}

      {view === 'edit' && (
        <main className="max-w-6xl mx-auto p-4 sm:p-8 animate-in fade-in duration-700">
          <div className="flex bg-white p-1.5 rounded-[24px] mb-6 shadow-xl max-w-md mx-auto border border-slate-200">
             <button onClick={() => switchTab('umum')} className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-2xl text-[9px] font-black uppercase transition-all ${reportType === 'umum' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}><ClipboardList size={14}/> Umum</button>
             <button onClick={() => switchTab('progres')} className={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-2xl text-[9px] font-black uppercase transition-all ${reportType === 'progres' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}><Target size={14}/> Progres</button>
          </div>
          
          <section className="bg-white rounded-[32px] p-5 sm:p-8 shadow-2xl mb-8 border border-slate-200/60">
            <div className="mb-6">
              <label className="text-[9px] font-black text-slate-400 tracking-widest ml-2 block mb-2 uppercase">Logo Header (Berbaris Rata Kiri)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[0, 1, 2].map(idx => (
                  <div key={idx} className="relative h-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center overflow-hidden group">
                    {reportInfo.logos?.[idx] ? (
                      <>
                        <img src={reportInfo.logos[idx]} className="h-full w-full object-contain p-1" alt="" />
                        <button onClick={() => removeLogo(idx)} className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-slate-400 hover:bg-slate-100 transition-all">
                        <Upload size={14} className="mb-0.5" /><span className="text-[7px] font-black uppercase">Slot {idx+1}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(idx, e)} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 uppercase">
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-slate-400 ml-2">Judul Laporan</label>
                <input type="text" value={reportInfo.title} onChange={e => setReportInfo({...reportInfo, title: e.target.value})} className="w-full p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-800 focus:border-blue-500 outline-none transition-all shadow-inner text-sm" />
              </div>
              {(reportInfo.customMeta || []).map((meta, idx) => (
                <div key={meta.id} className={`${idx === 0 ? 'md:col-span-2' : ''} group relative`}>
                  <div className="flex items-center justify-between mb-1 ml-2 pr-2">
                    <input type="text" value={meta.label} onChange={e => {
                        const newMeta = [...reportInfo.customMeta]; newMeta[idx].label = e.target.value; setReportInfo({...reportInfo, customMeta: newMeta});
                      }} className="text-[9px] font-black text-blue-600 uppercase bg-transparent outline-none border-b border-dashed border-blue-300 w-2/3" />
                    <button onClick={() => {
                        const newMeta = reportInfo.customMeta.filter(m => m.id !== meta.id); setReportInfo({...reportInfo, customMeta: newMeta});
                      }} className="text-[9px] text-red-400 font-bold opacity-0 group-hover:opacity-100 bg-red-50 px-2 py-0.5 rounded">HAPUS</button>
                  </div>
                  <input type="text" value={meta.value} onChange={e => {
                      const newMeta = [...reportInfo.customMeta]; newMeta[idx].value = e.target.value; setReportInfo({...reportInfo, customMeta: newMeta});
                    }} className="w-full p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-800 focus:border-blue-500 outline-none shadow-inner text-sm" />
                </div>
              ))}
              <div className="md:col-span-2 mt-1 mb-2">
                <button onClick={() => setReportInfo({...reportInfo, customMeta: [...(reportInfo.customMeta || []), { id: `m${Date.now()}`, label: 'KOLOM BARU', value: '' }]})} className="bg-blue-50 text-blue-600 text-[9px] font-black uppercase py-2 px-4 rounded-xl transition-all flex items-center gap-1.5"><Plus size={14}/> Tambah Info</button>
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-slate-400 ml-2 block mb-1">Tahun (Tetap)</label>
                <input type="text" value={reportInfo.date} onChange={e => setReportInfo({...reportInfo, date: e.target.value})} className="w-full p-3.5 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-slate-800 outline-none shadow-inner text-sm" />
              </div>
              <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-100">
                <label className="text-[9px] font-black text-blue-500 ml-2 flex items-center gap-1.5 mb-2"><Palette size={14} /> TEMA TAMPILAN PDF</label>
                <div className="flex gap-2 bg-slate-50 p-2 rounded-2xl shadow-inner border border-slate-200 overflow-x-auto">
                   {['klasik', 'modern'].map(t => (
                     <button key={t} onClick={() => setReportInfo({...reportInfo, template: t})} className={`min-w-[90px] flex-1 py-3 rounded-xl text-[10px] font-black capitalize transition-all ${reportInfo.template === t ? 'bg-white shadow-md text-blue-600 border border-blue-200' : 'text-slate-400'}`}>{t}</button>
                   ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-4 bg-slate-900 rounded-[24px] p-4 text-white mt-8 shadow-xl border border-white/5 w-full">
               <div className="flex items-center justify-between w-full lg:w-max shrink-0">
                 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2.5 bg-white/10 rounded-xl"><ChevronLeft size={20}/></button>
                 <span className="font-black text-lg mx-4 whitespace-nowrap">{currentPage} / {pages.length}</span>
                 <button onClick={() => setCurrentPage(p => Math.min(pages.length, p + 1))} className="p-2.5 bg-white/10 rounded-xl"><ChevronRight size={20}/></button>
               </div>
               <div className="flex gap-2 w-full lg:justify-end lg:ml-auto flex-wrap">
                 {pages.length > 1 && <button onClick={() => setShowDeletePageModal(true)} className="flex-1 sm:flex-none bg-red-600 text-white px-3 py-3 rounded-xl text-[9px] font-black uppercase">HAPUS HAL</button>}
                 <button onClick={executeDeleteAllPhotos} className="flex-1 sm:flex-none bg-orange-500 text-white px-3 py-3 rounded-xl text-[9px] font-black uppercase">KOSONGKAN</button>
                 <label className="flex-1 sm:flex-none bg-white text-slate-900 px-3 py-3 rounded-xl text-[9px] font-black uppercase cursor-pointer flex items-center justify-center gap-1.5"><Upload size={14}/> MEGA UPLOAD<input type="file" multiple accept="image/*" className="hidden" onChange={handleMegaUpload} /></label>
                 <button onClick={handleAddPage} className={`w-full sm:w-auto flex-1 text-white px-4 py-3 rounded-xl text-[9px] font-black uppercase ${reportType === 'progres' ? 'bg-emerald-600' : 'bg-blue-600'}`}>+ HALAMAN BARU</button>
               </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {activePageData.map((p, i) => (
              <PhotoCard key={`${currentPage}-${i}`} pIdx={currentPage-1} sIdx={i} p={p} reportType={reportType} updatePhoto={(k, v) => updateSpecificPhoto(currentPage-1, i, k, v)} clearPhoto={() => clearSpecificPhoto(currentPage-1, i)} handleFileUpload={(e) => handleFileUpload(currentPage-1, i, e)} />
            ))}
          </section>
        </main>
      )}

      {view === 'preview' && (
        <main className="w-full flex flex-col items-center bg-slate-200/50 min-h-screen relative overflow-x-hidden">
          <div className="sticky top-2 z-40 bg-slate-900/80 backdrop-blur-xl px-5 py-3 rounded-full flex items-center gap-5 shadow-2xl text-white mt-4 mb-4 border border-white/20 transition-all">
            <button onClick={() => setPreviewZoom(z => Math.max(0.3, z - 0.1))} className="p-1"><ZoomOut size={18}/></button>
            <span className="text-[10px] font-black w-8 text-center">{Math.round(previewZoom * 100)}%</span>
            <button onClick={() => setPreviewZoom(z => Math.min(2, z + 0.1))} className="p-1"><ZoomIn size={18}/></button>
            <div className="w-px h-4 bg-white/30"></div>
            <button onClick={() => setPreviewZoom(window.innerWidth < 850 ? (window.innerWidth - 20) / 794 : 1)} className="p-1 text-[10px] font-black flex items-center gap-1.5"><Maximize size={14}/> FIT</button>
          </div>
          <div className="flex flex-col items-center gap-10 py-4 transition-transform duration-300 origin-top" style={{ transform: `scale(${previewZoom})`, width: '210mm', marginBottom: `${(previewZoom - 1) * pages.length * 1122}px` }}>
            {pages.map((p, i) => <ReportPage key={`preview-${i}`} data={p} />)}
          </div>
        </main>
      )}

      <div style={{ height: 0, overflow: 'hidden', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: -1 }}>
         <div id="pdf-render-area" style={{ width: '210mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           {(bakedPages || pages).map((p, i) => <ReportPage key={`render-${i}`} data={p} isFinal={true} />)}
         </div>
      </div>

      {showReminderModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 border-2 border-orange-100">
            <div className="flex items-center gap-3 text-orange-500 mb-4"><div className="bg-orange-100 p-2 rounded-full"><HardDrive size={24} /></div><h3 className="text-lg font-black uppercase tracking-widest">Backup</h3></div>
            <p className="text-slate-600 font-medium mb-6 text-xs leading-relaxed">Disarankan mengunduh <strong>File Mentahan (.json)</strong> sebelum {pendingAction === 'logout' ? 'keluar' : 'kembali'}.</p>
            <div className="flex flex-col gap-2.5">
              <button onClick={saveMentahanAndProceed} className="w-full py-3.5 font-black bg-blue-600 text-white rounded-xl uppercase text-[10px] shadow-lg flex justify-center items-center gap-2"><HardDrive size={16} /> Simpan Mentahan & Lanjut</button>
              <div className="flex gap-2.5">
                <button onClick={() => { setShowReminderModal(false); setPendingAction(null); }} className="flex-1 py-3 font-black bg-slate-100 text-slate-500 rounded-xl uppercase text-[10px]">Batal</button>
                <button onClick={executePendingAction} className="flex-1 py-3 font-black bg-white border-2 border-slate-200 text-slate-400 rounded-xl uppercase text-[10px]">Abaikan</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteProjectModal.show && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-4"><ShieldAlert size={28}/><h3 className="text-lg font-black uppercase tracking-widest">Hapus Proyek</h3></div>
            <p className="text-slate-600 mb-6 text-xs">Hapus laporan dari Cloud?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteProjectModal({show: false, project: null})} className="flex-1 py-3 font-black bg-slate-100 rounded-xl uppercase text-[10px] text-slate-500">Batal</button>
              <button onClick={executeDeleteProject} className="flex-1 py-3 font-black bg-red-600 text-white rounded-xl uppercase text-[10px]">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {showDeletePageModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-4"><Trash2 size={28}/><h3 className="text-lg font-black uppercase tracking-widest">Hapus Halaman</h3></div>
            <p className="text-slate-600 mb-6 text-xs">Hapus <strong>Halaman {currentPage}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeletePageModal(false)} className="flex-1 py-3 font-black bg-slate-100 rounded-xl uppercase text-[10px] text-slate-500">Batal</button>
              <button onClick={executeDeletePage} className="flex-1 py-3 font-black bg-red-600 text-white rounded-xl uppercase text-[10px]">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {showAccessModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] p-6 max-w-lg w-full shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3"><div className="flex items-center gap-2 text-slate-800"><ShieldAlert size={24} className="text-blue-600" /><h3 className="text-lg font-black uppercase tracking-widest">Kelola Akses</h3></div></div>
            <div className="mb-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
              <label className="block text-[9px] font-black text-slate-500 uppercase mb-1.5 ml-1">Tambah Email Baru</label>
              <div className="flex gap-2"><input type="email" value={newEmailUser} onChange={(e) => setNewEmailUser(e.target.value)} placeholder="email@proyek.com" className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none" /></div>
              <div className="flex items-center justify-between mt-2.5 px-1">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={newEmailAdmin} onChange={e => setNewEmailAdmin(e.target.checked)} className="w-3.5 h-3.5 accent-blue-600" /><span className="text-[10px] font-bold text-slate-600">Jadikan Admin</span></label>
                <button onClick={handleAddNewEmail} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase shadow-md">Tambah</button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 mb-3">
              {currentAllowed.map((em, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 overflow-hidden">
                     <div className={`p-1.5 rounded-lg ${currentAdmins.includes(em) ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}><User size={14}/></div>
                     <div className="flex flex-col truncate"><span className="text-[10px] font-bold text-slate-700 truncate">{em}</span><span className="text-[8px] font-black uppercase text-slate-400">{currentAdmins.includes(em) ? 'Administrator' : 'Pengguna Biasa'}</span></div>
                  </div>
                  {!DEFAULT_EMAIL_IZIN.includes(em.toLowerCase()) && em !== activeEmail && (
                    <button onClick={() => handleRemoveAccessEmail(em)} className="text-red-400 hover:text-red-600 p-1.5 transition-all"><Trash2 size={14}/></button>
                  )}
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-100"><button onClick={() => setShowAccessModal(false)} className="w-full py-3 rounded-xl font-black text-[10px] uppercase text-slate-500 bg-slate-100 hover:bg-slate-200">Tutup</button></div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media print { @page { size: A4 portrait; margin: 0 !important; } .report-page-final { page-break-after: always !important; border: none !important; box-shadow: none !important; margin: 0 !important; width: 210mm !important; } }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%; background: currentColor; cursor: pointer; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default App;
