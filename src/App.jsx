import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Camera, Trash2, Image as ImageIcon, Upload, FileDown, Presentation, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, ShieldAlert, LifeBuoy, Sun, Droplets, Target, ClipboardList, Cloud, FolderOpen, Plus, ArrowLeft, Calendar, Briefcase, FileText, Loader2, WifiOff, HardDrive, UploadCloud, Lock, User, LogOut, ZoomIn, ZoomOut, Maximize, Smartphone, Palette } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';

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
  console.error("Gagal inisialisasi Firebase", e);
}

// --- AKSES DEFAULT (KODE BAWAAN) ---
const DEFAULT_EMAIL_IZIN = ['at.file2020@gmail.com', 'admin@gmail.com'];
const DEFAULT_ADMIN = ['admin@gmail.com', 'at.file2020@gmail.com'];

const PhotoCard = ({ pIdx, sIdx, p, reportType, updatePhoto, clearPhoto, handleFileUpload }) => {
  const [tab, setTab] = useState('filter');
  const { zoom = 100, panX = 50, panY = 50, brightness = 100, saturation = 100, progress = 0 } = p;

  return (
    <div className="bg-white rounded-[32px] sm:rounded-[48px] shadow-xl overflow-hidden flex flex-col group border-2 border-transparent hover:border-blue-500 transition-all duration-500 hover:shadow-2xl">
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
              <input type="file" accept="image/jpeg, image/png, image/webp" capture="environment" className="hidden" onChange={handleFileUpload} />
            </label>
            <label className="w-full cursor-pointer bg-slate-100 text-slate-500 py-3 sm:py-3.5 rounded-2xl sm:rounded-3xl text-[10px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 hover:bg-slate-200 transition-all">
              <ImageIcon size={16} className="sm:w-4 sm:h-4"/> PILIH GALERI
              <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}
        
        {/* Label Progress Melayang */}
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
        <textarea 
          value={p?.note || ''} 
          onChange={e => updatePhoto('note', e.target.value)} 
          placeholder={reportType === 'progres' ? "Detail progres..." : "Keterangan foto..."} 
          className="w-full p-4 sm:p-5 bg-slate-50 rounded-2xl sm:rounded-[28px] text-xs sm:text-sm h-24 sm:h-28 resize-none border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all leading-relaxed outline-none shadow-inner" 
        />
      </div>
    </div>
  );
};

const App = () => {
  const createNewPage = () => Array(6).fill(null).map(() => ({ id: Date.now() + Math.random(), src: null, note: '', brightness: 100, saturation: 100, progress: 0, zoom: 100, panX: 50, panY: 50 }));
  const defaultReportInfo = { title: 'LAPORAN DOKUMENTASI LAPANGAN', project: '', department: '', contractor: '', consultant: '', date: new Date().getFullYear().toString(), logos: [null, null, null], template: 'klasik' };

  // --- STATE UTAMA ---
  const [activeEmail, setActiveEmail] = useState(null); 
  const [emailInput, setEmailInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [debugError, setDebugError] = useState(''); // Fitur Deteksi Error Tambahan
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
  const [isPptLoading, setIsPptLoading] = useState(false);
  const [isLibraryReady, setIsLibraryReady] = useState({ pdf: false, ppt: false });
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [bakedPages, setBakedPages] = useState(null);
  const [shouldTriggerDownload, setShouldTriggerDownload] = useState(false);
  
  // MODAL STATES
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

  const currentAllowed = useMemo(() => Array.from(new Set([...DEFAULT_EMAIL_IZIN.map(e=>e.toLowerCase()), ...(accessData?.allowed || []).map(e=>e.toLowerCase())])), [accessData?.allowed]);
  const currentAdmins = useMemo(() => Array.from(new Set([...DEFAULT_ADMIN.map(e=>e.toLowerCase()), ...(accessData?.admins || []).map(e=>e.toLowerCase())])), [accessData?.admins]);
  const isAdmin = currentAdmins.includes(activeEmail?.toLowerCase() || '');

  // =========================================================================
  // PELINDUNG TAB BROWSER SAAT PROSES PENYIMPANAN BERAT BERJALAN
  // =========================================================================
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (saveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = ''; // Memicu dialog "Are you sure you want to leave?" di browser
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { await signInWithCustomToken(auth, __initial_auth_token); } 
        else { await signInAnonymously(auth); }
      } catch (err) {
        setDebugError(err.message); // Tangkap error asli dari server
        await signInAnonymously(auth).catch(e => setDebugError(e.message));
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
    if (!user) return;
    const fetchSession = async () => {
      try {
        const snap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'active'));
        if (snap.exists() && snap.data().email) {
          setActiveEmail(snap.data().email);
        }
      } catch (e) {}
    };
    fetchSession();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_settings', 'access_list');
    
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setAccessData(snap.data());
      } else {
        const initialData = { allowed: DEFAULT_EMAIL_IZIN, admins: DEFAULT_ADMIN };
        setDoc(docRef, initialData).catch(console.error);
        setAccessData(initialData);
      }
    }, () => {});

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || view !== 'dashboard' || !activeEmail) return;
    setSaveStatus('loading');
    
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
      setSaveStatus('saved');
    }, () => { setSaveStatus('error'); });

    return () => unsubscribe();
  }, [user, view, activeEmail, currentAdmins]);


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
          await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'active'), { email });
          setStatusMsg({ text: '', type: '' });
       } else {
          setLoginError(`Akses Ditolak: Email "${email}" tidak terdaftar.`); 
          setStatusMsg({ text: '', type: '' });
       }
    } catch (err) { 
       setLoginError('Terjadi kesalahan membaca data server.');
       setStatusMsg({ text: '', type: '' });
    }
  };

  const handleLogout = async () => { 
      setActiveEmail(null); 
      try {
          if (user) await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'active'));
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
        newData.admins.push(email
