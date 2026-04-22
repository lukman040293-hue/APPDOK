import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Camera, Trash2, Image as ImageIcon, Upload, FileDown, Presentation, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, ShieldAlert, LifeBuoy, Sun, Droplets, Target, ClipboardList, Cloud, FolderOpen, Plus, ArrowLeft, Calendar, Briefcase, FileText, Loader2, WifiOff, HardDrive, UploadCloud, Lock, User, LogOut, ZoomIn, ZoomOut, Maximize, Smartphone, Palette } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';

// --- INISIALISASI FIREBASE ---
// Kunci Firebase Anda sudah saya masukkan dengan benar di sini
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
      } catch { await signInAnonymously(auth); }
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

      setReportInfo(sessionData?.reportInfo || freshProjectData.reportInfo || defaultReportInfo);
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
    if (!user || !activeProjectId || view === 'dashboard') return;
    const timeoutId = setTimeout(() => {
        saveToCloudNow(activeProjectId, reportInfo, pagesData, reportType, activeEmail);
    }, 2500);
    return () => clearTimeout(timeoutId);
  }, [reportInfo, pagesData, reportType, activeProjectId, user, view, activeEmail, retryTrigger]);

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
        
        const loadedInfo = data.reportInfo || defaultReportInfo;
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
      setStatusMsg({ text: 'Menyimpan di Latar Belakang...', type: 'info' });
      
      if (activeProjectId) {
        const isOwner = activeEmail === projectAuthor;
        const timeToSave = isOwner ? Date.now() : projectTime;

        saveToCloudNow(activeProjectId, reportInfo, pagesData, reportType, projectAuthor, timeToSave); 
        
        setProjects(prevProjects => {
          const existingIdx = prevProjects.findIndex(p => p.id === activeProjectId);
          const updatedData = {
             id: activeProjectId,
             reportInfo: reportInfo,
             lastActiveTab: reportType,
             pageCountUmum: pagesData.umum.length,
             pageCountProgres: pagesData.progres.length,
             updatedAt: timeToSave,
             authorEmail: projectAuthor
          };
          let newArray = [...prevProjects];
          if (existingIdx >= 0) { newArray[existingIdx] = { ...newArray[existingIdx], ...updatedData }; } 
          else { newArray.push(updatedData); }
          return newArray.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        });
      }
      
      setView('dashboard'); 
      setPagesData({ umum: [], progres: [] }); 
      setBakedPages(null); 
      setActiveProjectId(null); 
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 1500);

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
  // PENJAGA KUALITAS FOTO TINGGI (HIGH-QUALITY JPEG)
  // =========================================================================
  const processInitialUpload = (dataUrl) => {
    return new Promise((r) => {
      const img = new Image(); img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas'); const max = 800;
        let w = img.width, h = img.height;
        if (w > max || h > max) { if (w > h) { h = Math.round((max / w) * h); w = max; } else { w = Math.round((max / h) * w); h = max; } }
        canvas.width = w; canvas.height = h; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
        r(canvas.toDataURL('image/jpeg', 0.8)); // Kualitas Tinggi 80%
      };
      img.onerror = () => r(null);
    });
  };

  const processLogoUpload = (dataUrl) => {
    return new Promise((r) => {
      const img = new Image(); img.src = dataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas'); const max = 400;
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
          const lw = 2.36, lh = 0.5;
          if (reportInfo.logos[0]) slide.addImage({ data: reportInfo.logos[0], x: PAGE_MARGIN_SIDE, y: curY, w: lw, h: lh, sizing: { type: 'contain' } });
          if (reportInfo.logos[1]) slide.addImage({ data: reportInfo.logos[1], x: 8.27/2-lw/2, y: curY, w: lw, h: lh, sizing: { type: 'contain' } });
          if (reportInfo.logos[2]) slide.addImage({ data: reportInfo.logos[2], x: 8.27-PAGE_MARGIN_SIDE-lw, y: curY, w: lw, h: lh, sizing: { type: 'contain' } });
        }
        curY += 0.65;
        slide.addText(reportInfo.title.toUpperCase(), { x: PAGE_MARGIN_SIDE, y: curY, w: CONTENT_W, fontSize: 16, bold: true, align: 'center', color: '0F172A' });
        curY += 0.45;
        const meta = [{ l: "PEKERJAAN", v: reportInfo.project }, { l: "INSTANSI", v: reportInfo.department }, { l: "KONTRAKTOR", v: reportInfo.contractor || reportInfo.company }, { l: "KONSULTAN", v: reportInfo.consultant }, { l: "TAHUN", v: reportInfo.date }];
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
    const meta = [{ l: "Pekerjaan", v: reportInfo.project }, { l: "Instansi", v: reportInfo.department }, { l: "Kontraktor", v: reportInfo.contractor || reportInfo.company }, { l: "Konsultan", v: reportInfo.consultant }, { l: "Tahun", v: reportInfo.date }];
    
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
          <div className="flex justify-between items-start mb-3 h-12">
            <div className="flex-1 flex justify-start h-full">{reportInfo.logos?.[0] && <img src={reportInfo.logos[0]} className="h-full w-auto max-w-full object-contain" alt="" />}</div>
            <div className="flex-1 flex justify-center h-full">{reportInfo.logos?.[1] && <img src={reportInfo.logos[1]} className="h-full w-auto max-w-full object-contain" alt="" />}</div>
            <div className="flex-1 flex justify-end h-full">{reportInfo.logos?.[2] && <img src={reportInfo.logos[2]} className="h-full w-auto max-w-full object-contain" alt="" />}</div>
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
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Alamat
