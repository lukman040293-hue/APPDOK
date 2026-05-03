import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Camera, Trash2, Image as ImageIcon, Upload, FileDown, Presentation, 
  ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, ShieldAlert, 
  Sun, Droplets, Target, ClipboardList, Cloud, FolderOpen, Plus, 
  ArrowLeft, Calendar, Briefcase, FileText, Loader2, WifiOff, 
  HardDrive, UploadCloud, Lock, User, LogOut, ZoomIn, ZoomOut, 
  Maximize, Palette, Filter, Save, FileStack, Layers, Activity, 
  Users, Share2 
} from 'lucide-react';

// --- ID Sesi Unik untuk Tab ini ---
const TAB_SESSION_ID = Math.random().toString(36).substring(2, 15);

// --- AKSES DEFAULT (Didefinisikan untuk memperbaiki ReferenceError) ---
const DEFAULT_EMAIL_IZIN = ['at.file2020@gmail.com', 'admin@gmail.com'];
const DEFAULT_ADMIN = ['admin@gmail.com', 'at.file2020@gmail.com'];

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';

// --- INISIALISASI FIREBASE (Konfigurasi Proyek Anda: apdok-f9052) ---
const firebaseConfig = {
    apiKey: "AIzaSyCvMuSGrojku0-UM4tWaNTK2EDlgqjWAlM",
    authDomain: "apdok-f9052.firebaseapp.com",
    projectId: "apdok-f9052",
    storageBucket: "apdok-f9052.firebasestorage.app",
    messagingSenderId: "839994843119",
    appId: "1:839994843119:web:2590957adb4e6f1ce7a01a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'apdok-f9052'; // Menggunakan ID Proyek Anda sebagai Folder Utama

// --- HELPER UNTUK TRACKING PERUBAHAN DATA ---
const createPageHash = (pageData) => {
  if (!pageData || !Array.isArray(pageData)) return "null";
  try {
    const lightData = pageData.map(p => ({
      n: p?.note, b: p?.brightness, s: p?.saturation, z: p?.zoom, x: p?.panX, y: p?.panY, prog: p?.progress,
      id: p?.src ? p.src.substring(0, 30) + p.src.length : null 
    }));
    return JSON.stringify(lightData);
  } catch (e) { return "error"; }
};

// --- KOMPONEN KARTU FOTO ---
const PhotoCard = ({ pIdx, sIdx, p, reportType, updatePhoto, clearPhoto, handleFileUpload }) => {
  const [tab, setTab] = useState('filter');
  const { zoom = 100, panX = 50, panY = 50, brightness = 100, saturation = 100, progress = 0 } = p || {};

  return (
    <div className="bg-white rounded-[32px] sm:rounded-[48px] shadow-xl overflow-hidden flex flex-col border-2 border-transparent hover:border-blue-500 transition-all duration-500">
      <div className="h-52 sm:h-60 bg-slate-50 flex items-center justify-center relative border-b border-slate-100 overflow-hidden">
        {p?.src ? (
          <>
            <img 
              src={p.src} 
              className="w-full h-full object-cover" 
              style={{ filter: `brightness(${brightness}%) saturate(${saturation}%)`, transform: `scale(${zoom / 100})`, transformOrigin: `${panX}% ${panY}%` }} 
              alt="" 
            />
            <button onClick={clearPhoto} className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-xl shadow-xl hover:bg-red-600 transition-all active:scale-90 z-10">
              <Trash2 size={18}/>
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-3 w-full px-6 text-center">
            <label className={`w-full text-white py-3 rounded-2xl text-[10px] font-black uppercase cursor-pointer flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${reportType === 'progres' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
              <Camera size={18}/> AMBIL KAMERA
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
            </label>
            <label className="w-full cursor-pointer bg-slate-100 text-slate-500 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 hover:bg-slate-200 transition-all">
              <ImageIcon size={16}/> PILIH GALERI
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}
        
        {reportType === 'progres' && p?.src && (
          <div className="absolute bottom-3 right-3 bg-emerald-600 text-white text-[9px] font-black px-2.5 py-1 rounded-lg shadow-xl animate-in zoom-in z-10">
            {progress}% PROGRES
          </div>
        )}
      </div>
      
      <div className="p-4 sm:p-6 flex-grow flex flex-col space-y-3 sm:space-y-4">
        {p?.src && (
          <>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setTab('filter')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${tab === 'filter' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>🎨 Filter</button>
              <button onClick={() => setTab('crop')} className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${tab === 'crop' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>📐 Posisi</button>
            </div>

            <div className="space-y-3 animate-in fade-in">
              {tab === 'filter' && (
                <>
                  {reportType === 'progres' && (
                    <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                      <div className="flex items-center justify-between mb-2 text-[9px] font-black text-emerald-600 uppercase">
                         <div className="flex items-center gap-1.5"><Target size={12}/> PROGRES (%)</div>
                         <span className="bg-white px-2 py-0.5 rounded border border-emerald-200 text-xs">{progress}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={progress} onChange={(e) => updatePhoto('progress', parseInt(e.target.value))} className="w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600" />
                    </div>
                  )}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2 text-[9px] font-black text-slate-400 uppercase">
                      <div className="flex items-center gap-1.5"><Sun size={12}/> KECERAHAN</div>
                      <span className="text-blue-600 font-bold">{brightness}%</span>
                    </div>
                    <input type="range" min="50" max="200" value={brightness} onChange={(e) => updatePhoto('brightness', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2 text-[9px] font-black text-slate-400 uppercase">
                      <div className="flex items-center gap-1.5"><Droplets size={12}/> SATURASI</div>
                      <span className="text-emerald-600 font-bold">{saturation}%</span>
                    </div>
                    <input type="range" min="0" max="200" value={saturation} onChange={(e) => updatePhoto('saturation', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  </div>
                </>
              )}
              {tab === 'crop' && (
                <>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-inner">
                    <div className="flex items-center justify-between mb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">🔍 ZOOM</div>
                      <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">{(zoom/100).toFixed(1)}x</span>
                    </div>
                    <input type="range" min="100" max="300" value={zoom} onChange={(e) => updatePhoto('zoom', parseInt(e.target.value))} className="w-full h-1.5 sm:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-inner">
                    <div className="flex items-center justify-between mb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1.5">↔️ GESER HORIZONTAL</div>
                    </div>
                    <input type="range" min="0" max="100" value={panX} onChange={(e) => updatePhoto('panX', parseInt(e.target.value))} className="w-full h-1.5 sm:h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-600" />
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-inner">
                    <div className="flex items-center justify-between mb-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
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
          placeholder="Keterangan foto..." 
          className="w-full p-4 bg-slate-50 rounded-2xl text-xs h-24 resize-none border-2 border-transparent focus:bg-white focus:border-blue-100 transition-all outline-none shadow-inner" 
        />
      </div>
    </div>
  );
};

// --- APLIKASI UTAMA ---
const App = () => {
  const createNewPage = () => Array(6).fill(null).map(() => ({ id: Date.now() + Math.random(), src: null, note: '', brightness: 100, saturation: 100, progress: 0, zoom: 100, panX: 50, panY: 50 }));
  const defaultReportInfo = { 
    title: 'LAPORAN DOKUMENTASI LAPANGAN', 
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
  const [user, setUser] = useState(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); 
  const [view, setView] = useState('dashboard'); 
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [reportType, setReportType] = useState('umum'); 
  const [reportInfo, setReportInfo] = useState(defaultReportInfo);
  const [pagesData, setPagesData] = useState({ umum: [createNewPage()], progres: [createNewPage()] });
  
  const pages = pagesData[reportType];
  const [currentPage, setCurrentPage] = useState(1);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const lastSavedHashRef = useRef({});
  const latestDataRef = useRef({ reportInfo, pagesData, reportType });

  useEffect(() => {
    latestDataRef.current = { reportInfo, pagesData, reportType };
  }, [reportInfo, pagesData, reportType]);

  // --- AUTHENTICATION ---
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.error("Auth Gagal:", err);
        setIsOfflineMode(true);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { 
      setUser(u); 
      setIsAppReady(true); 
    });
    return () => unsubscribe();
  }, []);

  // --- MEMUAT SESI AKTIF ---
  useEffect(() => {
    if (!user || isOfflineMode) return;
    const fetchSession = async () => {
      try {
        const snap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'active'));
        if (snap.exists()) setActiveEmail(snap.data().email);
      } catch (e) {}
    };
    fetchSession();
  }, [user, isOfflineMode]);

  // --- MEMUAT DAFTAR PROYEK ---
  useEffect(() => {
    if (!user || !activeEmail || isOfflineMode) return;
    const projCol = collection(db, 'artifacts', appId, 'public', 'data', 'docufield_projects');
    const unsubscribe = onSnapshot(projCol, (snap) => {
      const loaded = [];
      snap.forEach(d => {
        const data = d.data();
        if (data.authorEmail === activeEmail || DEFAULT_ADMIN.includes(activeEmail)) {
          loaded.push({ id: d.id, ...data });
        }
      });
      setProjects(loaded.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
    });
    return () => unsubscribe();
  }, [user, activeEmail, isOfflineMode]);

  // --- LOGIN HANDLER ---
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = emailInput.trim().toLowerCase();
    setActiveEmail(email);
    if (user && !isOfflineMode) {
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'active'), { email });
    }
  };

  const handleLogout = async () => {
    setActiveEmail(null);
    if (user && !isOfflineMode) {
      await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'session', 'active'));
    }
  };

  // --- FUNGSI SAVE ---
  const saveToCloudNow = async (id, info, pagesObj, type, emailToSave) => {
    if (!user || isOfflineMode) return;
    setSaveStatus('saving');
    try {
      const batch = writeBatch(db);
      const projRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_projects', id);
      
      batch.set(projRef, { 
        reportInfo: info, 
        lastActiveTab: type, 
        pageCountUmum: pagesObj.umum.length, 
        pageCountProgres: pagesObj.progres.length, 
        updatedAt: Date.now(), 
        authorEmail: emailToSave,
        lastSavedBy: TAB_SESSION_ID 
      });

      // Simpan halaman-halaman
      for (let i = 0; i < pagesObj.umum.length; i++) {
        const pageRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${id}_umum_page_${i}`);
        batch.set(pageRef, { data: pagesObj.umum[i], index: i, type: 'umum' });
      }
      for (let i = 0; i < pagesObj.progres.length; i++) {
        const pageRef = doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${id}_progres_page_${i}`);
        batch.set(pageRef, { data: pagesObj.progres[i], index: i, type: 'progres' });
      }

      await batch.commit();
      setSaveStatus('saved');
    } catch (e) {
      setSaveStatus('error');
      console.error(e);
    }
  };

  // --- AUTO SAVE ---
  useEffect(() => {
    if (!activeProjectId || view === 'dashboard' || isOfflineMode) return;
    const interval = setInterval(() => {
      const d = latestDataRef.current;
      saveToCloudNow(activeProjectId, d.reportInfo, d.pagesData, d.reportType, activeEmail);
    }, 15000);
    return () => clearInterval(interval);
  }, [activeProjectId, view, activeEmail, isOfflineMode]);

  // --- CRUD OPERASI ---
  const createNewProject = () => {
    const id = `proj_${Date.now()}`;
    setActiveProjectId(id);
    setReportInfo(defaultReportInfo);
    setPagesData({ umum: [createNewPage()], progres: [createNewPage()] });
    setView('edit');
  };

  const openProject = async (p) => {
    setActiveProjectId(p.id);
    setReportInfo(p.reportInfo || defaultReportInfo);
    setSaveStatus('loading');
    
    try {
      const umumPromises = []; const progresPromises = [];
      for(let i=0; i < (p.pageCountUmum || 1); i++) umumPromises.push(getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${p.id}_umum_page_${i}`)));
      for(let i=0; i < (p.pageCountProgres || 1); i++) progresPromises.push(getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_pages', `${p.id}_progres_page_${i}`)));
      
      const [uSnaps, pSnaps] = await Promise.all([Promise.all(umumPromises), Promise.all(progresPromises)]);
      
      setPagesData({
        umum: uSnaps.map(s => s.exists() ? s.data().data : createNewPage()),
        progres: pSnaps.map(s => s.exists() ? s.data().data : createNewPage())
      });
      setSaveStatus('saved');
      setView('edit');
    } catch (e) {
      setSaveStatus('error');
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Hapus proyek ini selamanya?')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'docufield_projects', id));
      setStatusMsg({ text: 'Terhapus!', type: 'success' });
      setTimeout(() => setStatusMsg({ text: '', type: '' }), 2000);
    } catch (e) {}
  };

  // --- IMAGE HELPERS ---
  const handleFileUpload = async (pIdx, sIdx, e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPagesData(prev => {
        const n = {...prev};
        const updatedPage = [...n[reportType][pIdx]];
        updatedPage[sIdx] = { ...updatedPage[sIdx], src: ev.target.result };
        n[reportType][pIdx] = updatedPage;
        return n;
      });
    };
    reader.readAsDataURL(file);
  };

  // --- RENDER DASHBOARD ---
  if (!activeEmail) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-md border border-slate-200">
          <div className="flex justify-center mb-6"><div className="bg-blue-600 p-4 rounded-full text-white"><Lock size={32} /></div></div>
          <h1 className="text-2xl font-black text-center text-slate-800 mb-2 uppercase">Akses Terbatas</h1>
          <p className="text-center text-slate-500 text-sm mb-6">Masukkan email Anda untuk memulai.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-3xl outline-none transition-all" placeholder="email@anda.com" />
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-3xl font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all">Masuk</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20">
      <header className="bg-slate-900 text-white p-4 sticky top-0 z-50 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Cloud size={20} className="text-blue-400" />
          <h1 className="font-black text-xs uppercase tracking-widest">DocuField v2.0</h1>
        </div>
        <div className="flex items-center gap-2">
          {view !== 'dashboard' && (
            <button onClick={() => setView('dashboard')} className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-bold">KEMBALI</button>
          )}
          <button onClick={handleLogout} className="bg-red-500/20 text-red-400 px-4 py-2 rounded-xl text-[10px] font-bold">KELUAR</button>
        </div>
      </header>

      {statusMsg.text && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] px-6 py-2 bg-blue-600 text-white rounded-full font-bold text-xs uppercase animate-bounce">
          {statusMsg.text}
        </div>
      )}

      {view === 'dashboard' ? (
        <main className="max-w-6xl mx-auto p-6 sm:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3"><FolderOpen className="text-blue-600" /> Arsip Laporan</h2>
              <p className="text-slate-500 font-bold text-xs mt-1">User: {activeEmail}</p>
            </div>
            <button onClick={createNewProject} className="bg-blue-600 text-white px-8 py-4 rounded-3xl font-black uppercase text-xs shadow-xl flex items-center gap-2 active:scale-95 transition-all"><Plus size={18}/> BUAT LAPORAN</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-100 hover:-translate-y-1 transition-all flex flex-col">
                <div className="flex justify-between mb-4">
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase">LAPORAN</span>
                  <button onClick={() => deleteProject(p.id)} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                </div>
                <h3 className="text-lg font-black text-slate-800 mb-2 line-clamp-2">{p.reportInfo?.title || 'Judul Kosong'}</h3>
                <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase flex items-center gap-1.5"><Calendar size={12}/> {new Date(p.updatedAt).toLocaleDateString()}</p>
                <button onClick={() => openProject(p)} className="w-full bg-slate-50 py-3 rounded-2xl font-black text-[10px] uppercase text-slate-600 hover:bg-slate-100 transition-colors">Buka Proyek</button>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <main className="max-w-6xl mx-auto p-4 sm:p-8">
          {/* Menu Tab */}
          <div className="flex bg-white p-1.5 rounded-[24px] mb-8 shadow-lg max-w-sm mx-auto border border-slate-200">
             <button onClick={() => setReportType('umum')} className={`flex-1 py-2.5 rounded-2xl text-[9px] font-black uppercase transition-all ${reportType === 'umum' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400'}`}>UMUM</button>
             <button onClick={() => setReportType('progres')} className={`flex-1 py-2.5 rounded-2xl text-[9px] font-black uppercase transition-all ${reportType === 'progres' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400'}`}>PROGRES</button>
          </div>

          <section className="bg-white rounded-[40px] p-8 shadow-xl mb-10 border border-slate-100">
            <h3 className="text-[10px] font-black text-blue-600 uppercase mb-6 tracking-widest">Informasi Proyek</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="sm:col-span-2">
                 <label className="text-[9px] font-black text-slate-400 ml-2 mb-1 block uppercase">Judul Laporan Utama</label>
                 <input type="text" value={reportInfo.title} onChange={e => setReportInfo({...reportInfo, title: e.target.value})} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-black outline-none shadow-inner" />
               </div>
               {reportInfo.customMeta.map((m, i) => (
                 <div key={m.id}>
                   <input type="text" value={m.label} onChange={e => {
                     const nm = [...reportInfo.customMeta]; nm[i].label = e.target.value; setReportInfo({...reportInfo, customMeta: nm});
                   }} className="text-[9px] font-black text-slate-400 ml-2 mb-1 outline-none uppercase bg-transparent" />
                   <input type="text" value={m.value} onChange={e => {
                     const nm = [...reportInfo.customMeta]; nm[i].value = e.target.value; setReportInfo({...reportInfo, customMeta: nm});
                   }} className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold outline-none shadow-inner" />
                 </div>
               ))}
            </div>

            {/* Navigasi Halaman */}
            <div className="flex items-center justify-between mt-10 bg-slate-900 p-4 rounded-3xl text-white shadow-xl">
               <button onClick={() => setCurrentPage(c => Math.max(1, c-1))} className="p-2 bg-white/10 rounded-xl"><ChevronLeft/></button>
               <span className="font-black text-lg">{currentPage} / {pages.length}</span>
               <button onClick={() => setCurrentPage(c => Math.min(pages.length + 1, c+1))} className="p-2 bg-white/10 rounded-xl"><ChevronRight/></button>
               <button onClick={() => setPagesData(prev => {
                 const n = {...prev}; n[reportType].push(createNewPage()); return n;
               })} className="bg-blue-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase">+ HALAMAN</button>
            </div>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages[currentPage-1]?.map((p, i) => (
              <PhotoCard 
                key={i} 
                p={p} 
                reportType={reportType} 
                updatePhoto={(k, v) => setPagesData(prev => {
                  const n = {...prev};
                  const updatedPage = [...n[reportType][currentPage-1]];
                  updatedPage[i] = { ...updatedPage[i], [k]: v };
                  n[reportType][currentPage-1] = updatedPage;
                  return n;
                })}
                clearPhoto={() => setPagesData(prev => {
                  const n = {...prev};
                  const updatedPage = [...n[reportType][currentPage-1]];
                  updatedPage[i] = { ...updatedPage[i], src: null, note: '' };
                  n[reportType][currentPage-1] = updatedPage;
                  return n;
                })}
                handleFileUpload={(e) => handleFileUpload(currentPage-1, i, e)}
              />
            ))}
          </section>
        </main>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        input[type=range] { -webkit-appearance: none; background: #e2e8f0; height: 6px; border-radius: 3px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%; background: currentColor; cursor: pointer; border: 3px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.1); }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
      `}} />
    </div>
  );
};

export default App;
