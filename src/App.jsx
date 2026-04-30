import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Camera, Trash2, Image as ImageIcon, Upload, FileDown, Presentation, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, ShieldAlert, LifeBuoy, Sun, Droplets, Target, ClipboardList, Cloud, FolderOpen, Plus, ArrowLeft, Calendar, Briefcase, FileText, Loader2, WifiOff, HardDrive, UploadCloud, Lock, User, LogOut, ZoomIn, ZoomOut, Maximize, Smartphone, Palette, Filter } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
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

const PhotoCard = ({ pIdx, sIdx, p, reportType, updatePhoto, clearPhoto, handleFileUpload, showToast }) => {
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

  // --- STATE UTAMA ---
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
  const [filterEmail, setFilterEmail] = useState('all'); // State untuk filter user admin

  const currentAllowed = useMemo(() => Array.from(new Set([...DEFAULT_EMAIL_IZIN.map(e=>e.toLowerCase()), ...(accessData?.allowed || []).map(e=>e.toLowerCase())])), [accessData?.allowed]);
  const currentAdmins = useMemo(() => Array.from(new Set([...DEFAULT_ADMIN.map(e=>e.toLowerCase()), ...(accessData?.admins || []).map(e=>e.toLowerCase())])), [accessData?.admins]);
  const isAdmin = currentAdmins.includes(activeEmail?.toLowerCase() || '');

  // Menarik daftar pembuat laporan yang unik untuk dropdown filter
  const uniqueAuthors = useMemo(() => {
    const authors = new Set();
    projects.forEach(p => {
      if (p.authorEmail) authors.add(p.authorEmail);
    });
    return Array.from(authors);
  }, [projects]);

  // Daftar proyek yang sudah difilter
  const filteredProjects = useMemo(() => {
    if (!isAdmin || filterEmail === 'all') return projects;
    return projects.filter(p => p.authorEmail === filterEmail);
  }, [projects, filterEmail, isAdmin]);

  // --- PENGATURAN NAMA TAB BROWSER ---
  useEffect(() => {
    // SILAKAN GANTI TULISAN DI DALAM TANDA KUTIP INI SESUAI KEINGINAN ANDA
    document.title = "Aplikasi Dokumentasi"; 
  }, []);

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
        // Langsung menggunakan sistem autentikasi anonim mandiri milik Firebase Anda
        await signInAnonymously(auth);
        setDebugError(''); // Bersihkan peringatan error (jika sebelumnya ada)
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

  // SINKRONISASI LATAR BELAKANG: Selalu aktif di semua view (editor/dashboard)
  useEffect(() => {
    if (!user || !activeEmail) return;
    
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
      console.error("Gagal sinkron data:", err); 
    });

    return () => unsubscribe();
  }, [user, activeEmail, currentAdmins]);

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

  // =========================================================================
  // FUNGSI BATCH WRITE SUPER CEPAT DENGAN PROSES LATAR BELAKANG
  // =========================================================================
  const saveToCloudNow = async (id, info, pagesObj, type, emailToSave, timeToSave) => {
    if (!user || !id) return Promise.resolve();
    try {
      setSaveStatus('saving');
      
      const batch = writeBatch(db);
      
      const projRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_projects', id);
      batch.set(projRef, { 
        reportInfo: info, 
        lastActiveTab: type, 
        pageCountUmum: pagesObj.umum.length, 
        pageCountProgres: pagesObj.progres.length, 
        updatedAt: timeToSave || Date.now(), 
        authorEmail: emailToSave 
      });

      for (let i = 0; i < pagesObj.umum.length; i++) {
         const pageRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${id}_umum_page_${i}`);
         batch.set(pageRef, { index: i, projectId: id, type: 'umum', data: pagesObj.umum[i] });
      }
      for(let i = pagesObj.umum.length; i < 50; i++) {
         const pageRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${id}_umum_page_${i}`);
         batch.delete(pageRef);
      }

      for (let i = 0; i < pagesObj.progres.length; i++) {
         const pageRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${id}_progres_page_${i}`);
         batch.set(pageRef, { index: i, projectId: id, type: 'progres', data: pagesObj.progres[i] });
      }
      for(let i = pagesObj.progres.length; i < 50; i++) {
         const pageRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${id}_progres_page_${i}`);
         batch.delete(pageRef);
      }
      
      await batch.commit();
      
      setSaveStatus('saved');
      return true;
    } catch (error) { 
      setSaveStatus('error'); 
      console.error("Gagal Upload Latar Belakang:", error); 
      return false;
    }
  };

  const createNewProject = async () => {
    const newId = `proj_${Date.now()}`;
    const newInfo = {...defaultReportInfo, title: 'LAPORAN DOKUMENTASI LAPANGAN'};
    const newPages = { umum: [createNewPage()], progres: [createNewPage()] };
    const now = Date.now();
    
    setActiveProjectId(newId);
    setReportInfo(newInfo);
    setReportType('umum');
    setPagesData(newPages);
    setCurrentPage(1);
    setProjectAuthor(activeEmail);
    setProjectTime(now);
    setView('edit');
    isInitialLoad.current = false;

    if (user) saveToCloudNow(newId, newInfo, newPages, 'umum', activeEmail, now);
  };

  const openProject = async (project, sessionData = null) => {
    if (!user) { setStatusMsg({ text: 'Mode Offline', type: 'error' }); return; }
    
    setActiveProjectId(project.id);
    
    setStatusMsg({ text: 'Menarik Foto...', type: 'info' });
    setSaveStatus('loading');
    
    try {
      const projSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_projects', project.id));
      const freshProjectData = projSnap.exists() ? projSnap.data() : project;

      const pAuthor = freshProjectData.authorEmail || project.authorEmail || activeEmail;
      const pTime = freshProjectData.updatedAt || project.updatedAt || Date.now();
      
      setProjectAuthor(pAuthor);
      setProjectTime(pTime);
      isInitialLoad.current = true;

      let loadedInfo = sessionData?.reportInfo || freshProjectData.reportInfo || defaultReportInfo;
      // Memastikan laporan lama yang belum punya kolom kustom (customMeta) tetap bisa dibuka
      if (!loadedInfo.customMeta) {
          loadedInfo = {
             ...loadedInfo,
             customMeta: [
                 { id: 'm1', label: 'Pekerjaan', value: loadedInfo.project || '' },
                 { id: 'm2', label: 'Instansi', value: loadedInfo.department || '' },
                 { id: 'm3', label: 'Kontraktor', value: loadedInfo.contractor || '' },
                 { id: 'm4', label: 'Konsultan', value: loadedInfo.consultant || '' }
             ]
          };
      }
      setReportInfo(loadedInfo);
      const freshType = sessionData?.reportType || freshProjectData.lastActiveTab || freshProjectData.reportType || 'umum';
      setReportType(freshType);
      setView(sessionData?.view || 'edit');
      setCurrentPage(sessionData?.currentPage || 1); 

      let loadedUmum = []; 
      let loadedProgres = [];
      const isLegacy = freshProjectData.pageCount !== undefined && freshProjectData.pageCountUmum === undefined;
      
      if (isLegacy) {
        const promises = [];
        for(let i=0; i < freshProjectData.pageCount; i++) {
          promises.push(getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${project.id}_page_${i}`)));
        }
        const snaps = await Promise.all(promises);
        snaps.forEach(pSnap => {
          if(pSnap.exists()) {
            if (freshProjectData.reportType === 'progres') loadedProgres.push(pSnap.data().data);
            else loadedUmum.push(pSnap.data().data);
          }
        });
      } else {
        const umumPromises = [];
        const progresPromises = [];
        for(let i=0; i < (freshProjectData.pageCountUmum || 0); i++) {
          umumPromises.push(getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${project.id}_umum_page_${i}`)));
        }
        for(let i=0; i < (freshProjectData.pageCountProgres || 0); i++) {
          progresPromises.push(getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${project.id}_progres_page_${i}`)));
        }
        
        const [umumSnaps, progresSnaps] = await Promise.all([
           Promise.all(umumPromises),
           Promise.all(progresPromises)
        ]);

        umumSnaps.forEach(pSnap => { if(pSnap.exists()) loadedUmum.push(pSnap.data().data); });
        progresSnaps.forEach(pSnap => { if(pSnap.exists()) loadedProgres.push(pSnap.data().data); });
      }
      
      setPagesData({ 
        umum: loadedUmum.length > 0 ? loadedUmum : [createNewPage()], 
        progres: loadedProgres.length > 0 ? loadedProgres : [createNewPage()] 
      });
      setSaveStatus('saved');
      setStatusMsg({ text: '', type: '' });
    } catch (e) { 
      setSaveStatus('error'); 
      setStatusMsg({ text: 'Gagal menarik foto', type: 'error' });
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000);
    }
  };

  const executeDeleteProject = async () => {
    if (!user || !showDeleteProjectModal.project) return;
    const proj = showDeleteProjectModal.project;
    setShowDeleteProjectModal({ show: false, project: null });
    setStatusMsg({ text: 'Menghapus Proyek...', type: 'info' });
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_projects', proj.id));
      for (let i = 0; i < 50; i++) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${proj.id}_page_${i}`)).catch(()=>{});
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${proj.id}_umum_page_${i}`)).catch(()=>{});
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${proj.id}_progres_page_${i}`)).catch(()=>{});
      }
      setStatusMsg({ text: 'Proyek Dihapus!', type: 'success' }); 
    } catch (e) { setStatusMsg({ text: 'Gagal menghapus', type: 'error' }); }
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000);
  };

  useEffect(() => {
    if (!user || !isAppReady) return;
    if (view === 'dashboard') {
        const sessionStr = sessionStorage.getItem('docufield_active_session');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                const restore = async () => {
                    setSaveStatus('loading');
                    try {
                        const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_projects', session.projectId));
                        if (snap.exists()) {
                            await openProject({ id: snap.id, ...snap.data() }, session);
                        } else {
                            sessionStorage.removeItem('docufield_active_session');
                        }
                    } catch {}
                };
                restore();
            } catch {}
        }
    }
  }, [user, isAppReady]);

  useEffect(() => {
    if ((view === 'edit' || view === 'preview') && activeProjectId) {
        sessionStorage.setItem('docufield_active_session', JSON.stringify({
            projectId: activeProjectId, reportType, currentPage, reportInfo, view, projectAuthor, projectTime
        }));
    } else if (view === 'dashboard') {
        sessionStorage.removeItem('docufield_active_session');
    }
  }, [view, activeProjectId, reportType, currentPage, reportInfo, projectAuthor, projectTime]);

  // SINGLE AUTO SAVE: Menghapus auto-save ganda yang bentrok agar data konsisten
  useEffect(() => {
    if (!user || !activeProjectId || view === 'dashboard') return;
    
    if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
    }

    const timeoutId = setTimeout(() => {
        const isOwner = activeEmail === projectAuthor;
        const timeToSave = isOwner ? Date.now() : projectTime;

        saveToCloudNow(activeProjectId, reportInfo, pagesData, reportType, projectAuthor, timeToSave);
    }, 2500);
    return () => clearTimeout(timeoutId);
  }, [reportInfo, pagesData, reportType, activeProjectId, user, view, activeEmail, projectAuthor, projectTime, retryTrigger]);

  useEffect(() => {
    const loadScript = (src, id) => new Promise((resolve) => {
      if (document.getElementById(id)) return resolve();
      const s = document.createElement('script');
      s.src = src; s.id = id; s.async = true; s.onload = resolve; s.onerror = () => resolve();
      document.body.appendChild(s);
    });
    if(!isLibraryReady.pdf) {
      Promise.all([
        loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', 'lib-pdf'),
        loadScript('https://cdn.jsdelivr.net/gh/gitbrent/PptxGenJS@3.12.0/dist/pptxgen.bundle.js', 'lib-ppt')
      ]).then(() => setIsLibraryReady({ pdf: !!window.html2pdf, ppt: !!window.PptxGenJS }));
    }
  }, [isLibraryReady.pdf]);

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
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.docufield_mentahan) return;
        const newId = `proj_${Date.now()}`;
        const now = Date.now();
        setActiveProjectId(newId);
        
        let loadedInfo = data.reportInfo || defaultReportInfo;
        // Memastikan file mentahan lama tetap cocok dengan sistem baru
        if (!loadedInfo.customMeta) {
           loadedInfo = {
             ...loadedInfo,
             customMeta: [
                 { id: 'm1', label: 'Pekerjaan', value: loadedInfo.project || '' },
                 { id: 'm2', label: 'Instansi', value: loadedInfo.department || '' },
                 { id: 'm3', label: 'Kontraktor', value: loadedInfo.contractor || '' },
                 { id: 'm4', label: 'Konsultan', value: loadedInfo.consultant || '' }
             ]
           };
        }
        const loadedType = data.reportType || 'umum';
        let loadedPages = data.pagesData;
        if (!loadedPages) {
            loadedPages = data.reportType === 'progres' 
              ? { umum: [createNewPage()], progres: data.pages || [createNewPage()] }
              : { umum: data.pages || [createNewPage()], progres: [createNewPage()] };
        }
        
        setReportInfo(loadedInfo); setReportType(loadedType); setPagesData(loadedPages);
        setCurrentPage(1); 
        setProjectAuthor(activeEmail);
        setProjectTime(now);
        setView('edit');
        isInitialLoad.current = false;

        if (user) saveToCloudNow(newId, loadedInfo, loadedPages, loadedType, activeEmail, now);
      } catch { setStatusMsg({ text: 'File rusak', type: 'error' }); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  // =========================================================================
  // EKSEKUSI PENUTUPAN INSTAN (BACKGROUND PROCESSING)
  // =========================================================================
  const executePendingAction = () => {
    setShowReminderModal(false);
    if (pendingAction === 'dashboard') {
      setStatusMsg({ text: 'Menyimpan & Sinkronisasi...', type: 'info' });
      
      if (activeProjectId) {
        const isOwner = activeEmail === projectAuthor;
        const timeToSave = isOwner ? Date.now() : projectTime;
        // Simpan paksa ke cloud saat tombol kembali ditekan
        saveToCloudNow(activeProjectId, reportInfo, pagesData, reportType, projectAuthor, timeToSave); 
      }
      
      setView('dashboard'); 
      setPagesData({ umum: [], progres: [] }); 
      setBakedPages(null); 
      setActiveProjectId(null); 
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 1000);

    } else if (pendingAction === 'logout') {
      handleLogout();
    }
    setPendingAction(null);
  };

  const saveMentahanAndProceed = () => {
    downloadMentahan();
    setTimeout(() => {
      executePendingAction();
    }, 300); 
  };

  // =========================================================================
  // PENJAGA KUALITAS FOTO & PENCEGAH ERROR LIMIT 1MB FIRESTORE
  // =========================================================================
  const processInitialUpload = (dataUrl) => {
    return new Promise((r) => {
      const img = new Image(); img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas'); 
        // Firestore membatasi ukuran 1 dokumen maksimal 1MB.
        // 1 Halaman berisi 6 foto. Kita kompres ke max 640px dengan kualitas 0.65 
        // agar 6 foto aman masuk ke dalam 1 dokumen tanpa mengurangi ketajaman di PDF.
        const max = 640;
        let w = img.width, h = img.height;
        if (w > max || h > max) { 
          if (w > h) { h = Math.round((max / w) * h); w = max; } 
          else { w = Math.round((max / h) * w); h = max; } 
        }
        canvas.width = w; canvas.height = h; 
        const ctx = canvas.getContext('2d'); 
        ctx.drawImage(img, 0, 0, w, h);
        r(canvas.toDataURL('image/jpeg', 0.65)); // Kualitas 65% untuk menghemat ukuran
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
    
    // Gunakan ObjectURL (Lebih hemat memori, mencegah iPhone Crash)
    const objectUrl = URL.createObjectURL(file);
    const cropped = await processInitialUpload(objectUrl);
    URL.revokeObjectURL(objectUrl); // Bersihkan memori
    
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
    if (pages.length >= 50) {
      setStatusMsg({ text: 'Maksimal 50 Halaman!', type: 'error' });
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 3000);
      return;
    }
    setPages([...pages, createNewPage()]);
    setCurrentPage(pages.length + 1);
  };

  const executeDeletePage = () => {
    setShowDeletePageModal(false);
    if (pages.length <= 1) {
      executeDeleteAllPhotos();
      return;
    }
    const newPages = pages.filter((_, idx) => idx !== currentPage - 1);
    setPages(newPages);
    if (currentPage > newPages.length) {
      setCurrentPage(newPages.length);
    }
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

  const triggerPdfBaking = async () => {
    setIsPdfLoading(true); setStatusMsg({ text: 'Menyiapkan PDF...', type: 'info' });
    try {
      const processed = await Promise.all(pages.map(async (page) => {
        return await Promise.all(page.map(async (photo) => {
          if (!photo.src) return photo;
          const finalSrc = await bakeImageFilters(photo.src, photo.brightness, photo.saturation, photo.zoom, photo.panX, photo.panY);
          return { ...photo, src: finalSrc, isBaked: true }; 
        }));
      }));
      setBakedPages(processed); setShouldTriggerDownload(true);
    } catch (err) { setIsPdfLoading(false); setStatusMsg({ text: 'Gagal proses', type: 'error' }); }
  };

  useEffect(() => {
    if (shouldTriggerDownload && bakedPages) {
      const generatePDF = async () => {
        const element = document.getElementById('pdf-render-area');
        const images = element.querySelectorAll('img');
        await Promise.all(Array.from(images).map(img => img.complete ? Promise.resolve() : new Promise(r => img.onload = r)));
        const options = { margin: 0, filename: `${reportInfo.title.replace(/ /g, '_')}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, width: 794, windowWidth: 794, scrollX: 0, scrollY: 0, x: 0, y: 0 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } };
        try { await window.html2pdf().set(options).from(element).save(); setStatusMsg({ text: 'PDF Diunduh!', type: 'success' }); } 
        finally { setIsPdfLoading(false); setBakedPages(null); setShouldTriggerDownload(false); setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000); }
      };
      generatePDF();
    }
  }, [shouldTriggerDownload, bakedPages, reportInfo]);

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
          for (let i = 0; i < 3; i++) {
            if (reportInfo.logos[i]) {
              // Tempatkan logo berjejer rata kiri
              slide.addImage({ data: reportInfo.logos[i], x: currentX, y: curY, w: 1.8, h: lh, sizing: { type: 'contain' } });
              currentX += 1.9; 
            }
          }
        }
        curY += 0.65;
        slide.addText(reportInfo.title.toUpperCase(), { x: PAGE_MARGIN_SIDE, y: curY, w: CONTENT_W, fontSize: 16, bold: true, align: 'center', color: '0F172A' });
        curY += 0.45;
        
        const cMeta = reportInfo.customMeta || [
            { id: 'm1', label: 'Pekerjaan', value: reportInfo.project || '' },
            { id: 'm2', label: 'Instansi', value: reportInfo.department || '' },
            { id: 'm3', label: 'Kontraktor', value: reportInfo.contractor || '' },
            { id: 'm4', label: 'Konsultan', value: reportInfo.consultant || '' }
        ];
        const meta = [
            ...cMeta.map(m => ({ l: (m.label || '').toUpperCase(), v: m.value })),
            { l: "TAHUN", v: reportInfo.date }
        ];

        meta.forEach(m => {
          slide.addText(m.l, { x: PAGE_MARGIN_SIDE, y: curY, w: 1.0, fontSize: 7, bold: true, color: '94A3B8' });
          slide.addText(":", { x: PAGE_MARGIN_SIDE + 1.0, y: curY, w: 0.1, fontSize: 7, bold: true, color: '475569' });
          slide.addText(m.v || '-', { x: PAGE_MARGIN_SIDE + 1.15, y: curY, w: CONTENT_W - 1.15, fontSize: 8, bold: true, color: '1E293B' });
          curY += (m.v?.length > 80) ? 0.22 : 0.14;
        });
        
        // Sesuaikan warna garis bawah judul PPTX dengan template (opsional, default hitam/hijau)
        const isModernTemplate = reportInfo.template === 'modern';
        let lineColor = '0F172A'; // Default hitam
        if (isModernTemplate) lineColor = '3730A3'; // Indigo-800
        if (reportType === 'progres') lineColor = isModernTemplate ? '059669' : '10B981'; // Emerald
        
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
    const cMeta = reportInfo.customMeta || [
        { id: 'm1', label: 'Pekerjaan', value: reportInfo.project || '' },
        { id: 'm2', label: 'Instansi', value: reportInfo.department || '' },
        { id: 'm3', label: 'Kontraktor', value: reportInfo.contractor || '' },
        { id: 'm4', label: 'Konsultan', value: reportInfo.consultant || '' }
    ];
    const meta = [
        ...cMeta.map(m => ({ l: m.label, v: m.value })),
        { l: "Tahun", v: reportInfo.date }
    ];
    
    // --- TEMPLATE STYLING LOGIC ---
    const template = reportInfo.template || 'klasik';
    const isModern = template === 'modern';
    
    const baseFontClass = isModern ? 'font-serif text-slate-800' : 'font-sans text-black';
    const headerTitleClass = isModern ? 'text-indigo-950 tracking-wide font-bold' : 'text-slate-900 font-black';
    
    // Header Border Color based on Template and Report Type
    let headerBorderClass = 'border-b-2 border-slate-900';
    if (isModern) {
        headerBorderClass = reportType === 'progres' ? 'border-b-4 border-emerald-700' : 'border-b-4 border-indigo-800';
    } else {
        headerBorderClass = reportType === 'progres' ? 'border-b-2 border-emerald-500' : 'border-b-2 border-slate-900';
    }

    const cardContainerClass = isModern ? 'border border-indigo-100 shadow-md rounded-2xl' : 'border border-slate-200 shadow-sm rounded-xl';
    const imgContainerClass = isModern ? 'rounded-xl' : 'rounded-lg';
    
    // Note left-border line color
    let noteBorderClass = 'border-blue-500';
    if (isModern) {
        noteBorderClass = reportType === 'progres' ? 'border-emerald-600' : 'border-indigo-500';
    } else {
        noteBorderClass = reportType === 'progres' ? 'border-emerald-500' : 'border-blue-500';
    }

    return (
      <div className={`bg-white w-[210mm] flex flex-col ${baseFontClass} relative box-border ${isFinal ? 'report-page-final' : 'mb-10 shadow-2xl rounded-2xl border border-slate-200 shrink-0'}`} style={{ height: '296.7mm', padding: '6mm 15mm 15mm 15mm', margin: '0 auto', pageBreakAfter: 'always' }}>
        <div className={`text-center pb-4 mb-5 flex-none ${headerBorderClass}`}>
          <div className="flex justify-start items-center gap-6 mb-3 h-12">
            {reportInfo.logos?.[0] && <img src={reportInfo.logos[0]} className="h-full w-auto object-contain object-left" alt="" />}
            {reportInfo.logos?.[1] && <img src={reportInfo.logos[1]} className="h-full w-auto object-contain object-left" alt="" />}
            {reportInfo.logos?.[2] && <img src={reportInfo.logos[2]} className="h-full w-auto object-contain object-left" alt="" />}
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
              <div className={`h-[50mm] bg-slate-50 relative overflow-hidden flex items-center justify-center border border-slate-100 ${imgContainerClass}`}>
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
            
            {/* TAMPILAN ERROR DEBUG UNTUK MEMBANTU ANDA */}
            {debugError && (
              <div className="bg-orange-50 p-3 rounded-2xl text-[10px] text-orange-700 font-mono border border-orange-200 text-center break-words">
                <strong>Info Error Firebase:</strong> {debugError}
                <br/><br/>
                <em>Pastikan domain Vercel Anda sudah ditambahkan di menu "Authorized Domains" pada Firebase Authentication.</em>
              </div>
            )}

            <button type="submit" disabled={!isAppReady && !debugError} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl sm:rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/30 active:scale-95 transition-all text-sm disabled:opacity-50">
              {isAppReady ? 'Masuk' : (debugError ? 'Coba Lagi' : 'Memuat...')}
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
            {!user ? <span className="flex items-center gap-1.5 text-orange-400"><WifiOff size={12} /> OFFLINE</span> : (
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
              <div className="w-px h-6 bg-white/20 mx-1 shrink-0"></div>
              
              <button onClick={() => setView('edit')} className={`shrink-0 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black transition-all ${view === 'edit' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>EDITOR</button>
              <button onClick={() => setView('preview')} className={`shrink-0 px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black transition-all ${view === 'preview' ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}>PREVIEW</button>
              
              <div className="w-px h-6 bg-white/20 mx-1 shrink-0"></div>
              
              <button onClick={downloadMentahan} className="shrink-0 bg-slate-700 hover:bg-slate-600 px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs text-white flex items-center gap-1.5 sm:gap-2 shadow-lg transition-all" title="Simpan Mentahan (.json)">
                <HardDrive size={16} className="w-4 h-4 sm:w-5 sm:h-5"/> <span className="hidden lg:inline">MENTAHAN (.json)</span>
              </button>
              <button onClick={triggerPdfBaking} disabled={isPdfLoading} className="shrink-0 bg-emerald-600 hover:bg-emerald-500 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs text-white flex items-center gap-1.5 sm:gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50">
                {isPdfLoading ? <Loader2 size={16} className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : <FileDown size={16} className="w-4 h-4 sm:w-5 sm:h-5"/>} PDF
              </button>
              <button onClick={downloadPPTX} disabled={isPptLoading} className="shrink-0 bg-orange-600 hover:bg-orange-500 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs text-white flex items-center gap-1.5 sm:gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50">
                {isPptLoading ? <Loader2 size={16} className="animate-spin w-4 h-4 sm:w-5 sm:h-5" /> : <Presentation size={16} className="w-4 h-4 sm:w-5 sm:h-5"/>} PPTX
              </button>
            </>
          )}

          {view === 'dashboard' && (
            <button onClick={() => { setPendingAction('logout'); setShowReminderModal(true); }} className="shrink-0 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase flex items-center gap-1.5 sm:gap-2 transition-all ml-auto">
              <LogOut size={14} className="w-4 h-4 sm:w-5 sm:h-5"/> Keluar
            </button>
          )}
        </div>
      </header>

      {statusMsg.text && <div className={`fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-2xl sm:rounded-3xl shadow-2xl flex items-center gap-3 sm:gap-4 font-black text-[10px] sm:text-xs text-white uppercase tracking-widest animate-in slide-in-from-top-6 ${statusMsg.type === 'error' ? 'bg-red-600' : statusMsg.type === 'success' ? 'bg-emerald-600' : 'bg-blue-600 border border-white/20'}`}>{statusMsg.type === 'info' ? <Loader2 size={16} className="animate-spin" /> : statusMsg.type === 'success' ? <CheckCircle2 size={16} /> : null} {statusMsg.text}</div>}

      {view === 'dashboard' && (
        <main className="max-w-6xl mx-auto p-4 sm:p-8 animate-in fade-in duration-500">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 sm:mb-10 gap-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 flex items-center gap-2.5 sm:gap-3"><FolderOpen className="text-blue-600 w-8 h-8 sm:w-9 sm:h-9" /> Arsip Laporan</h2>
              <p className="text-slate-500 font-medium flex items-center gap-2 flex-wrap text-xs sm:text-sm">Masuk sebagai: <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold">{activeEmail}</span>{isAdmin && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold text-[9px] sm:text-[10px] uppercase shadow-sm">👑 Admin</span>}</p>
              
              {/* FILTER USER KHUSUS ADMIN */}
              {isAdmin && projects.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-left-4">
                  <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest">
                     <Filter size={14} className="text-blue-500" /> FILTER USER:
                  </div>
                  <select 
                    value={filterEmail} 
                    onChange={e => setFilterEmail(e.target.value)}
                    className="bg-white border-2 border-slate-200 focus:border-blue-500 text-slate-700 font-bold text-[10px] sm:text-xs rounded-xl px-3 py-2 outline-none shadow-sm cursor-pointer transition-all"
                  >
                    <option value="all">Tampilkan Semua</option>
                    {uniqueAuthors.map(email => (
                      <option key={email} value={email}>{email === activeEmail ? `${email} (Saya)` : email}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {isAdmin && <button onClick={() => setShowAccessModal(true)} className="w-full sm:w-auto bg-slate-800 text-white hover:bg-slate-700 px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl sm:rounded-[24px] font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"><User size={16} className="sm:w-[18px] sm:h-[18px]"/> AKSES</button>}
              <label className="w-full sm:w-auto bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 px-4 sm:px-6 py-3.5 sm:py-4 rounded-2xl sm:rounded-[24px] font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 shadow-lg cursor-pointer transition-all active:scale-95"><UploadCloud size={16} className="sm:w-5 sm:h-5"/> BUKA MENTAHAN<input type="file" accept=".json" onChange={loadMentahan} className="hidden" /></label>
              <button onClick={createNewProject} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl sm:rounded-[24px] font-black uppercase text-[10px] sm:text-xs flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-blue-500/30 transition-all active:scale-95"><Plus size={16} className="sm:w-5 sm:h-5"/> BUAT LAPORAN</button>
            </div>
          </div>
          {!user ? (
            <div className="bg-orange-50 rounded-[32px] sm:rounded-[40px] border-2 border-dashed border-orange-200 p-8 sm:p-10 flex flex-col items-center justify-center text-center">
              <WifiOff size={40} className="text-orange-400 mb-4 sm:mb-6 sm:w-12 sm:h-12" /><h3 className="text-lg sm:text-xl font-black text-orange-700 mb-2">Offline</h3>
              <p className="text-orange-600 max-w-lg mb-6 text-xs sm:text-sm">Pekerjaan tidak tersinkron. Gunakan BUKA MENTAHAN atau buat baru, dan ingat klik MENTAHAN untuk backup lokal.</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white rounded-[32px] sm:rounded-[40px] border-2 border-dashed border-slate-300 p-10 sm:p-16 flex flex-col items-center justify-center text-center">
              <ClipboardList size={48} className="text-slate-300 mb-4 sm:mb-6 sm:w-16 sm:h-16" />
              <h3 className="text-lg sm:text-xl font-black text-slate-600 mb-2">{filterEmail !== 'all' ? 'Tidak Ada Laporan' : 'Belum Ada Laporan'}</h3>
              <p className="text-slate-400 text-xs sm:text-sm">{filterEmail !== 'all' ? 'User ini belum membuat/menyimpan laporan.' : 'Klik buat laporan baru.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProjects.map(p => (
                <div key={p.id} className="bg-white rounded-[24px] sm:rounded-[32px] p-5 sm:p-6 shadow-xl border border-slate-200 hover:border-blue-400 transition-all flex flex-col hover:-translate-y-1">
                  <div className="flex justify-between items-start mb-3 sm:mb-4">
                     <span className="px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase bg-blue-100 text-blue-700">DOKUMENTASI</span>
                     <button onClick={(e) => { e.stopPropagation(); setShowDeleteProjectModal({show: true, project: p}); }} className="p-1.5 sm:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all"><Trash2 size={16} className="sm:w-[18px] sm:h-[18px]"/></button>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 mb-3 sm:mb-4 line-clamp-2">{p.reportInfo?.title || 'Laporan'}</h3>
                  <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 flex-grow text-[10px] sm:text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-2 truncate"><Briefcase size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400" /> {p.reportInfo?.customMeta?.[0]?.value || p.reportInfo?.project || '-'}</div>
                    <div className="flex items-center gap-2"><Palette size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400" /> Tema: <span className="capitalize">{p.reportInfo?.template || 'Klasik'}</span></div>
                    {isAdmin && (
                      <>
                        <div className="flex items-center gap-2 truncate"><User size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400" /> Oleh: <strong className="text-slate-600">{p.authorEmail || 'Anonim'}</strong></div>
                        <div className="flex items-center gap-2"><Calendar size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400" /> Diubah: {new Date(p.updatedAt || Date.now()).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</div>
                      </>
                    )}
                    <div className="flex items-center gap-2"><FileText size={12} className="sm:w-3.5 sm:h-3.5 text-slate-400" /> {((p.pageCountUmum || 0) + (p.pageCountProgres || 0)) || p.pageCount || 0} Halaman</div>
                  </div>
                  <button onClick={() => openProject(p)} className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase transition-all flex justify-center items-center gap-2">Buka Laporan <ChevronRight size={14} className="sm:w-4 sm:h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {view === 'edit' && (
        <main className="max-w-6xl mx-auto p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex bg-white p-1.5 sm:p-2 rounded-[24px] sm:rounded-[32px] mb-6 sm:mb-8 shadow-xl max-w-md mx-auto border border-slate-200">
             <button onClick={() => switchTab('umum')} className={`flex-1 flex justify-center items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-2xl sm:rounded-3xl text-[9px] sm:text-[10px] font-black uppercase transition-all ${reportType === 'umum' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}><ClipboardList size={14}/> Umum</button>
             <button onClick={() => switchTab('progres')} className={`flex-1 flex justify-center items-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 rounded-2xl sm:rounded-3xl text-[9px] sm:text-[10px] font-black uppercase transition-all ${reportType === 'progres' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}><Target size={14}/> Progres</button>
          </div>
          
          <section className="bg-white rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 shadow-2xl mb-8 sm:mb-10 border border-slate-200/60">
            <div className="mb-6 sm:mb-8">
              <label className="text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest ml-2 block mb-2 sm:mb-3 uppercase">Logo Header (3 Slot)</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[0, 1, 2].map(idx => (
                  <div key={idx} className="relative h-16 sm:h-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl sm:rounded-2xl flex items-center justify-center overflow-hidden group">
                    {reportInfo.logos?.[idx] ? (
                      <>
                        <img src={reportInfo.logos[idx]} className="h-full w-full object-contain p-1 sm:p-2" alt="" />
                        <button onClick={() => removeLogo(idx)} className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-red-500 text-white rounded-md sm:rounded-lg p-1 sm:p-1.5 shadow-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-slate-400 hover:bg-slate-100 transition-all">
                        <Upload size={14} className="mb-0.5 sm:mb-1 sm:w-4 sm:h-4" />
                        <span className="text-[7px] sm:text-[8px] font-black uppercase">Logo {idx === 0 ? 'Kiri' : idx === 1 ? 'Tengah' : 'Kanan'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(idx, e)} />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 uppercase">
              <div className="md:col-span-2">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest ml-2">Judul Laporan</label>
                <input type="text" value={reportInfo.title} onChange={e => setReportInfo({...reportInfo, title: e.target.value})} className="w-full p-3.5 sm:p-4 bg-slate-50 border-2 border-transparent rounded-2xl sm:rounded-3xl font-black text-slate-800 focus:border-blue-500 outline-none transition-all shadow-inner text-sm" />
              </div>
              
              {/* KOLOM KUSTOM (BISA DIEDIT/DIHAPUS/DITAMBAH) */}
              {(reportInfo.customMeta || []).map((meta, idx) => (
                <div key={meta.id} className={`${idx === 0 ? 'md:col-span-2' : ''} group relative`}>
                  <div className="flex items-center justify-between mb-1 ml-2 pr-2">
                    <input 
                      type="text" 
                      value={meta.label} 
                      onChange={e => {
                        const newMeta = [...reportInfo.customMeta];
                        newMeta[idx].label = e.target.value;
                        setReportInfo({...reportInfo, customMeta: newMeta});
                      }}
                      className="text-[9px] sm:text-[10px] font-black text-blue-600 tracking-widest uppercase bg-transparent outline-none border-b border-dashed border-blue-300 focus:border-blue-600 w-2/3 transition-all"
                      placeholder="NAMA KOLOM..."
                    />
                    <button 
                      onClick={() => {
                        const newMeta = reportInfo.customMeta.filter(m => m.id !== meta.id);
                        setReportInfo({...reportInfo, customMeta: newMeta});
                      }} 
                      className="text-[9px] text-red-400 hover:text-red-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 px-2 py-0.5 rounded"
                    >
                      HAPUS
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={meta.value} 
                    onChange={e => {
                      const newMeta = [...reportInfo.customMeta];
                      newMeta[idx].value = e.target.value;
                      setReportInfo({...reportInfo, customMeta: newMeta});
                    }} 
                    className="w-full p-3.5 sm:p-4 bg-slate-50 border-2 border-transparent rounded-2xl sm:rounded-3xl font-black text-slate-800 focus:border-blue-500 outline-none transition-all shadow-inner text-sm" 
                  />
                </div>
              ))}

              <div className="md:col-span-2 flex justify-start items-center mt-1 mb-2">
                <button 
                  onClick={() => {
                    const newMeta = [...(reportInfo.customMeta || []), { id: `m${Date.now()}`, label: 'KOLOM BARU', value: '' }];
                    setReportInfo({...reportInfo, customMeta: newMeta});
                  }} 
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest py-2.5 px-4 rounded-xl transition-all flex items-center gap-1.5"
                >
                  <Plus size={14}/> Tambah Info
                </button>
              </div>

              {/* TAHUN TETAP */}
              <div className="md:col-span-2">
                <label className="text-[9px] sm:text-[10px] font-black text-slate-400 tracking-widest ml-2 block mb-1 uppercase">Tahun (Tetap)</label>
                <input type="text" value={reportInfo.date} onChange={e => setReportInfo({...reportInfo, date: e.target.value})} className="w-full p-3.5 sm:p-4 bg-slate-50 border-2 border-transparent rounded-2xl sm:rounded-3xl font-black text-slate-800 focus:border-blue-500 outline-none transition-all shadow-inner text-sm" />
              </div>

              {/* TEMA TAMPILAN (TEMPLATE SELECTION) */}
              <div className="md:col-span-2 mt-4 pt-4 border-t border-slate-100">
                <label className="text-[9px] sm:text-[10px] font-black text-blue-500 tracking-widest ml-2 flex items-center gap-1.5 mb-2"><Palette size={14} /> TEMA TAMPILAN PDF</label>
                <div className="flex gap-2 sm:gap-3 bg-slate-50 p-2 rounded-2xl sm:rounded-3xl shadow-inner border border-slate-200 overflow-x-auto">
                   <button 
                      onClick={() => setReportInfo({...reportInfo, template: 'klasik'})} 
                      className={`min-w-[90px] flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black transition-all ${(!reportInfo.template || reportInfo.template === 'klasik') ? 'bg-white shadow-md text-blue-600 border border-blue-200' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                   >
                     Klasik
                   </button>
                   <button 
                      onClick={() => setReportInfo({...reportInfo, template: 'modern'})} 
                      className={`min-w-[90px] flex-1 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black transition-all ${reportInfo.template === 'modern' ? 'bg-indigo-600 shadow-md text-white border border-indigo-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                   >
                     Modern
                   </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-4 sm:gap-6 bg-slate-900 rounded-[24px] sm:rounded-[32px] p-4 sm:p-5 text-white mt-8 sm:mt-10 shadow-xl border border-white/5 w-full">
               <div className="flex items-center justify-between w-full lg:w-max shrink-0">
                 <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="p-2.5 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all active:scale-90"><ChevronLeft size={20} className="sm:w-6 sm:h-6"/></button>
                 <span className="font-black text-lg sm:text-xl tracking-tighter mx-4 whitespace-nowrap">{currentPage} <span className="text-slate-500 text-xs sm:text-sm">/</span> {pages.length}</span>
                 <button onClick={() => setCurrentPage(p => Math.min(pages.length, p + 1))} className="p-2.5 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl hover:bg-white/20 transition-all active:scale-90"><ChevronRight size={20} className="sm:w-6 sm:h-6"/></button>
               </div>
               <div className="flex gap-2 sm:gap-3 w-full lg:w-auto flex-wrap justify-center lg:justify-end lg:ml-auto">
                 {pages.length > 1 && (
                   <button onClick={() => setShowDeletePageModal(true)} className="flex-1 sm:flex-none bg-red-600 hover:bg-red-500 text-white px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase flex items-center justify-center gap-1.5 sm:gap-2 shadow-md transition-all active:scale-95 whitespace-nowrap">
                     <Trash2 size={14} className="sm:w-4 sm:h-4"/> HAPUS HAL
                   </button>
                 )}
                 <button onClick={executeDeleteAllPhotos} className="flex-1 sm:flex-none bg-orange-500 hover:bg-orange-400 text-white px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase flex items-center justify-center gap-1.5 sm:gap-2 shadow-md transition-all active:scale-95 whitespace-nowrap">
                   KOSONGKAN
                 </button>
                 <label className="flex-1 sm:flex-none bg-white text-slate-900 px-3 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase cursor-pointer flex items-center justify-center gap-1.5 sm:gap-3 transition-all active:scale-95 shadow-md whitespace-nowrap">
                   <Upload size={14} className="sm:w-4 sm:h-4 text-blue-600"/> MEGA UPLOAD
                   <input type="file" multiple accept="image/*" className="hidden" onChange={handleMegaUpload} />
                 </label>
                 <button onClick={handleAddPage} className={`w-full sm:w-auto flex-1 sm:flex-none text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase transition-all active:scale-95 shadow-lg whitespace-nowrap ${reportType === 'progres' ? 'bg-emerald-600' : 'bg-blue-600'}`}>+ HAL halaman BARU</button>
               </div>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {activePageData.map((p, i) => (
              <PhotoCard 
                key={`${currentPage}-${i}`} 
                pIdx={currentPage-1} 
                sIdx={i} 
                p={p} 
                reportType={reportType} 
                updatePhoto={(k, v) => updateSpecificPhoto(currentPage-1, i, k, v)} 
                clearPhoto={() => clearSpecificPhoto(currentPage-1, i)} 
                handleFileUpload={(e) => handleFileUpload(currentPage-1, i, e)} 
                showToast={(msg, type) => setStatusMsg({text: msg, type})}
              />
            ))}
          </section>
        </main>
      )}

      {view === 'preview' && (
        <main className="w-full flex flex-col items-center bg-slate-200/50 min-h-screen relative overflow-x-hidden">
          
          <div className="sticky top-2 sm:top-4 z-40 bg-slate-900/80 backdrop-blur-xl px-5 py-3 rounded-full flex items-center gap-5 shadow-[0_10px_40px_rgba(0,0,0,0.3)] text-white mt-2 sm:mt-4 mb-4 border border-white/20 transition-all hover:bg-slate-900">
            <button onClick={() => setPreviewZoom(z => Math.max(0.3, z - 0.1))} className="p-1 hover:text-blue-400 active:scale-90 transition-all"><ZoomOut size={18}/></button>
            <span className="text-[10px] font-black w-8 text-center">{Math.round(previewZoom * 100)}%</span>
            <button onClick={() => setPreviewZoom(z => Math.min(2, z + 0.1))} className="p-1 hover:text-blue-400 active:scale-90 transition-all"><ZoomIn size={18}/></button>
            <div className="w-px h-4 bg-white/30"></div>
            <button onClick={() => setPreviewZoom(window.innerWidth < 850 ? (window.innerWidth - 20) / 794 : 1)} className="p-1 hover:text-blue-400 active:scale-90 transition-all text-[10px] font-black tracking-widest flex items-center gap-1.5"><Maximize size={14}/> FIT</button>
          </div>

          <div 
             className="flex flex-col items-center gap-10 py-4 transition-transform duration-300 origin-top" 
             style={{ transform: `scale(${previewZoom})`, width: '210mm', marginBottom: `${(previewZoom - 1) * pages.length * 1122}px` }}
          >
            {pages.map((p, i) => <ReportPage key={`preview-${i}`} data={p} />)}
          </div>
        </main>
      )}

      {/* --- HIDDEN PDF RENDER AREA --- */}
      <div style={{ height: 0, overflow: 'hidden', position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: -1 }}>
         <div id="pdf-render-area" style={{ width: '210mm', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           {(bakedPages || pages).map((p, i) => <ReportPage key={`render-${i}`} data={p} isFinal={true} />)}
         </div>
      </div>

      {/* --- MODAL PENGINGAT BACKUP (SMART REMINDER) --- */}
      {showReminderModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 border-2 border-orange-100">
            <div className="flex items-center gap-3 sm:gap-4 text-orange-500 mb-4">
              <div className="bg-orange-100 p-2 sm:p-3 rounded-full">
                <HardDrive size={24} className="sm:w-7 sm:h-7 text-orange-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-black uppercase tracking-widest">Pengingat Backup</h3>
            </div>
            
            <p className="text-slate-600 font-medium mb-6 sm:mb-8 text-xs sm:text-sm leading-relaxed">
              Sangat disarankan untuk mengunduh <strong>File Mentahan (.json)</strong> ke perangkat Anda sebagai cadangan sebelum <strong className="text-slate-800">{pendingAction === 'logout' ? 'keluar dari aplikasi' : 'kembali ke arsip'}</strong>. File ini dapat dibuka kapan saja meskipun internet terputus.
            </p>
            
            <div className="flex flex-col gap-2.5 sm:gap-3">
              <button 
                onClick={saveMentahanAndProceed} 
                className="w-full py-3.5 sm:py-4 font-black bg-blue-600 text-white rounded-xl sm:rounded-2xl uppercase text-[10px] sm:text-xs shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex justify-center items-center gap-2"
              >
                <HardDrive size={16} /> Simpan Mentahan & Lanjutkan
              </button>
              
              <div className="flex gap-2.5 sm:gap-3">
                <button 
                  onClick={() => { setShowReminderModal(false); setPendingAction(null); }} 
                  className="flex-1 py-3 sm:py-3.5 font-black bg-slate-100 text-slate-500 rounded-xl sm:rounded-2xl uppercase text-[10px] sm:text-xs hover:bg-slate-200 active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={executePendingAction} 
                  className="flex-1 py-3 sm:py-3.5 font-black bg-white border-2 border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl sm:rounded-2xl uppercase text-[10px] sm:text-xs active:scale-95 transition-all"
                >
                  Abaikan Saja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL HAPUS PROYEK --- */}
      {showDeleteProjectModal.show && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] sm:rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 sm:gap-4 text-red-600 mb-4"><ShieldAlert size={28} className="sm:w-8 sm:h-8"/><h3 className="text-lg sm:text-xl font-black uppercase tracking-widest">Hapus Proyek</h3></div>
            <p className="text-slate-600 font-medium mb-6 sm:mb-8 text-xs sm:text-sm">Hapus laporan <strong>{showDeleteProjectModal.project?.reportInfo?.title}</strong> dari Cloud?</p>
            <div className="flex gap-3 sm:gap-4">
              <button onClick={() => setShowDeleteProjectModal({show: false, project: null})} className="flex-1 py-3 sm:py-3.5 font-black bg-slate-100 rounded-xl sm:rounded-2xl uppercase text-[10px] sm:text-xs active:scale-95 transition-all text-slate-500">Batal</button>
              <button onClick={executeDeleteProject} className="flex-1 py-3 sm:py-3.5 font-black bg-red-600 text-white rounded-xl sm:rounded-2xl uppercase text-[10px] sm:text-xs shadow-lg active:scale-95 transition-all">Hapus Total</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL HAPUS HALAMAN --- */}
      {showDeletePageModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] sm:rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3 sm:gap-4 text-red-600 mb-4"><Trash2 size={28} className="sm:w-8 sm:h-8"/><h3 className="text-lg sm:text-xl font-black uppercase tracking-widest">Hapus Halaman</h3></div>
            <p className="text-slate-600 font-medium mb-6 sm:mb-8 text-xs sm:text-sm">Apakah Anda yakin ingin menghapus <strong>Halaman {currentPage}</strong> beserta seluruh isinya?</p>
            <div className="flex gap-3 sm:gap-4">
              <button onClick={() => setShowDeletePageModal(false)} className="flex-1 py-3 sm:py-3.5 font-black bg-slate-100 rounded-xl sm:rounded-2xl uppercase text-[10px] sm:text-xs active:scale-95 transition-all text-slate-500">Batal</button>
              <button onClick={executeDeletePage} className="flex-1 py-3 sm:py-3.5 font-black bg-red-600 text-white rounded-xl sm:rounded-2xl uppercase text-[10px] sm:text-xs shadow-lg active:scale-95 transition-all">Hapus Halaman</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL KELOLA AKSES --- */}
      {showAccessModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-slate-100 pb-3 sm:pb-4"><div className="flex items-center gap-2 sm:gap-3 text-slate-800"><ShieldAlert size={24} className="sm:w-7 sm:h-7 text-blue-600" /><h3 className="text-lg sm:text-xl font-black uppercase tracking-widest">Kelola Akses</h3></div></div>
            
            <div className="mb-4 sm:mb-6 bg-slate-50 p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200">
              <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 sm:mb-2 ml-1 sm:ml-2">Tambah Email Baru</label>
              <div className="flex gap-2"><input type="email" value={newEmailUser} onChange={(e) => setNewEmailUser(e.target.value)} placeholder="email@proyek.com" className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm outline-none" /></div>
              <div className="flex items-center justify-between mt-2.5 sm:mt-3 px-1 sm:px-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newEmailAdmin} onChange={e => setNewEmailAdmin(e.target.checked)} className="w-3.5 h-3.5 sm:w-4 sm:h-4 accent-blue-600" />
                  <span className="text-[10px] sm:text-xs font-bold text-slate-600">Jadikan Admin</span>
                </label>
                <button onClick={handleAddNewEmail} className="bg-blue-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[9px] sm:text-xs font-black uppercase transition-all shadow-md">Tambah</button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
              <label className="block text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 sm:mb-3 ml-1 sm:ml-2">Daftar Terdaftar</label>
              {currentAllowed.map((em, idx) => {
                const isDAdmin = currentAdmins.includes(em);
                const isBawaan = DEFAULT_EMAIL_IZIN.includes(em.toLowerCase());
                return (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                       <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0 ${isDAdmin ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}><User size={14} className="sm:w-4 sm:h-4"/></div>
                       <div className="flex flex-col truncate">
                         <span className="text-[10px] sm:text-xs font-bold text-slate-700 truncate">{em}</span>
                         <span className="text-[8px] sm:text-[9px] font-black uppercase text-slate-400">{isDAdmin ? 'Administrator' : 'Pengguna Biasa'} {isBawaan && '(Bawaan)'}</span>
                       </div>
                    </div>
                    {!isBawaan && em !== activeEmail && (
                      <button onClick={() => handleRemoveAccessEmail(em)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all shrink-0"><Trash2 size={14} className="sm:w-[18px] sm:h-[18px]"/></button>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="pt-3 sm:pt-4 border-t border-slate-100">
                <button onClick={() => setShowAccessModal(false)} className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all">Tutup Jendela Ini</button>
            </div>
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
