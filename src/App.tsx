import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Swords, 
  Trophy, 
  Settings, 
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  Activity,
  History,
  ChevronRight,
  Sparkles,
  CheckCircle,
  Award,
  TrendingDown,
  Minus,
  LogOut,
  User as UserIcon
} from 'lucide-react';

import { auth, db } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  type User 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface RivalsStats {
  divOrRank: string;
  wins: number;
  draws: number;
  losses: number;
}

interface WLCampaign {
  id: string;
  name: string;
  startDate: string;
  wins: number;
  losses: number;
  isCompleted?: boolean;
}

interface Match {
  id: string;
  date: string;
  mode: 'Rivals' | 'WL';
  wlCampaignId?: string;
  result: 'V' | 'E' | 'D';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Login / Cadastro
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Estados da Aplicação
  const [activeTab, setActiveTab] = useState<'inicio' | 'rivals' | 'wl' | 'config'>('inicio');

  const [rivals, setRivals] = useState<RivalsStats>({ divOrRank: 'Divisão 5', wins: 0, draws: 0, losses: 0 });
  const [wlCampaigns, setWlCampaigns] = useState<WLCampaign[]>([
    { id: 'wl-1', name: 'WL #1', startDate: new Date().toLocaleDateString('pt-BR'), wins: 0, losses: 0, isCompleted: false }
  ]);
  const [activeWlId, setActiveWlId] = useState<string>('wl-1');
  const [matches, setMatches] = useState<Match[]>([]);

  const [showNewWlModal, setShowNewWlModal] = useState(false);
  const [newWlData, setNewWlData] = useState({ name: '', startDate: new Date().toLocaleDateString('pt-BR') });

  const [showAddMatch, setShowAddMatch] = useState(false);
  const [newMatch, setNewMatch] = useState<{ mode: 'Rivals' | 'WL'; wlCampaignId: string; result: 'V' | 'E' | 'D' }>({
    mode: 'Rivals',
    wlCampaignId: activeWlId,
    result: 'V'
  });

  const [editingRivals, setEditingRivals] = useState(false);
  const [tempRivals, setTempRivals] = useState<RivalsStats>(rivals);

  const [finishWlModal, setFinishWlModal] = useState<WLCampaign | null>(null);
  const [wlComparisonMessage, setWlComparisonMessage] = useState<{ title: string; desc: string; type: 'record' | 'better' | 'worse' | 'same' | 'first' } | null>(null);

  // Escuta alteração de login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.rivals) setRivals(data.rivals);
          if (data.wlCampaigns) setWlCampaigns(data.wlCampaigns);
          if (data.activeWlId) setActiveWlId(data.activeWlId);
          if (data.matches) setMatches(data.matches);
        }
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Sincroniza dados no Firestore
  useEffect(() => {
    if (!currentUser) return;
    const saveUserData = async () => {
      const userDocRef = doc(db, 'users', currentUser.uid);
      await setDoc(userDocRef, {
        rivals,
        wlCampaigns,
        activeWlId,
        matches
      }, { merge: true });
    };
    saveUserData();
  }, [rivals, wlCampaigns, activeWlId, matches, currentUser]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setAuthError(err.message.includes('auth/invalid-credential') ? 'E-mail ou senha incorretos.' : 'Erro ao autenticar.');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  if (loadingAuth) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#04070D] text-emerald-400 font-bold text-sm">
        Carregando...
      </div>
    );
  }

  // TELA DE LOGIN / CADASTRO
  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04070D] p-4 font-sans text-slate-100">
        <div className="w-full max-w-md bg-[#080C14] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-black flex items-center justify-center font-black text-sm mx-auto shadow-lg shadow-emerald-500/20">
              EA
            </div>
            <h2 className="text-2xl font-black text-white italic">FC 27 PRO TRACKER</h2>
            <p className="text-xs text-slate-400">Acesse com sua conta para carregar seu progresso.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs font-semibold text-center">
                {authError}
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-semibold">E-mail</label>
              <input 
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1 font-semibold">Senha</label>
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:border-emerald-500 text-white"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-3 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20">
              {isRegistering ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}
              className="text-xs text-slate-400 hover:text-emerald-400 font-semibold transition"
            >
              {isRegistering ? 'Já possui conta? Faça login' : 'Não tem conta? Cadastre-se aqui'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeWl = wlCampaigns.find(c => c.id === activeWlId) || wlCampaigns[0];

  const totalWlWins = wlCampaigns.reduce((acc, c) => acc + c.wins, 0);
  const totalWlLosses = wlCampaigns.reduce((acc, c) => acc + c.losses, 0);

  const rivalsTotalGames = rivals.wins + rivals.draws + rivals.losses;
  const rivalsEff = rivalsTotalGames > 0 ? Math.round((rivals.wins / rivalsTotalGames) * 100) : 0;

  const grandTotalWins = rivals.wins + totalWlWins;
  const grandTotalDraws = rivals.draws;
  const grandTotalLosses = rivals.losses + totalWlLosses;
  const grandTotalGames = grandTotalWins + grandTotalDraws + grandTotalLosses;
  const grandEff = grandTotalGames > 0 ? Math.round((grandTotalWins / grandTotalGames) * 100) : 0;

  const quickAddRivalsWin = () => {
    setRivals(prev => ({ ...prev, wins: prev.wins + 1 }));
    setMatches(prev => [{ id: Date.now().toString(), date: new Date().toLocaleDateString('pt-BR'), mode: 'Rivals', result: 'V' }, ...prev]);
  };

  const quickAddRivalsDraw = () => {
    setRivals(prev => ({ ...prev, draws: prev.draws + 1 }));
    setMatches(prev => [{ id: Date.now().toString(), date: new Date().toLocaleDateString('pt-BR'), mode: 'Rivals', result: 'E' }, ...prev]);
  };

  const quickAddRivalsLoss = () => {
    setRivals(prev => ({ ...prev, losses: prev.losses + 1 }));
    setMatches(prev => [{ id: Date.now().toString(), date: new Date().toLocaleDateString('pt-BR'), mode: 'Rivals', result: 'D' }, ...prev]);
  };

  const quickAddWlWin = () => {
    if (!activeWl || activeWl.isCompleted) return;
    const currentGames = activeWl.wins + activeWl.losses;
    if (currentGames >= 15) return;

    const updatedWins = activeWl.wins + 1;
    const updatedTotal = updatedWins + activeWl.losses;

    setWlCampaigns(prev => prev.map(c => c.id === activeWl.id ? { ...c, wins: updatedWins } : c));
    setMatches(prev => [{ id: Date.now().toString(), date: new Date().toLocaleDateString('pt-BR'), mode: 'WL', wlCampaignId: activeWl.id, result: 'V' }, ...prev]);

    if (updatedTotal >= 15) handleFinishWL({ ...activeWl, wins: updatedWins });
  };

  const quickAddWlLoss = () => {
    if (!activeWl || activeWl.isCompleted) return;
    const currentGames = activeWl.wins + activeWl.losses;
    if (currentGames >= 15) return;

    const updatedLosses = activeWl.losses + 1;
    const updatedTotal = activeWl.wins + updatedLosses;

    setWlCampaigns(prev => prev.map(c => c.id === activeWl.id ? { ...c, losses: updatedLosses } : c));
    setMatches(prev => [{ id: Date.now().toString(), date: new Date().toLocaleDateString('pt-BR'), mode: 'WL', wlCampaignId: activeWl.id, result: 'D' }, ...prev]);

    if (updatedTotal >= 15) handleFinishWL({ ...activeWl, losses: updatedLosses });
  };

  const handleCreateWL = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWlData.name.trim()) return;

    const newCampaign: WLCampaign = {
      id: 'wl-' + Date.now(),
      name: newWlData.name,
      startDate: newWlData.startDate || new Date().toLocaleDateString('pt-BR'),
      wins: 0,
      losses: 0,
      isCompleted: false
    };

    setWlCampaigns([newCampaign, ...wlCampaigns]);
    setActiveWlId(newCampaign.id);
    setShowNewWlModal(false);
    setNewWlData({ name: '', startDate: new Date().toLocaleDateString('pt-BR') });
  };

  const handleAddMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const match: Match = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR'),
      mode: newMatch.mode,
      wlCampaignId: newMatch.mode === 'WL' ? newMatch.wlCampaignId : undefined,
      result: newMatch.result
    };

    setMatches([match, ...matches]);

    if (newMatch.mode === 'Rivals') {
      setRivals(prev => ({
        ...prev,
        wins: newMatch.result === 'V' ? prev.wins + 1 : prev.wins,
        draws: newMatch.result === 'E' ? prev.draws + 1 : prev.draws,
        losses: newMatch.result === 'D' ? prev.losses + 1 : prev.losses
      }));
    } else {
      setWlCampaigns(prev => prev.map(c => {
        if (c.id === newMatch.wlCampaignId) {
          const newWins = newMatch.result === 'V' ? c.wins + 1 : c.wins;
          const newLosses = newMatch.result === 'D' ? c.losses + 1 : c.losses;
          const isComplete = (newWins + newLosses) >= 15;
          const updated = { ...c, wins: newWins, losses: newLosses, isCompleted: isComplete };
          if (isComplete) handleFinishWL(updated);
          return updated;
        }
        return c;
      }));
    }

    setShowAddMatch(false);
  };

  const deleteMatch = (id: string) => {
    const matchToDelete = matches.find(m => m.id === id);
    if (!matchToDelete) return;

    if (matchToDelete.mode === 'Rivals') {
      setRivals(prev => ({
        ...prev,
        wins: matchToDelete.result === 'V' ? Math.max(0, prev.wins - 1) : prev.wins,
        draws: matchToDelete.result === 'E' ? Math.max(0, prev.draws - 1) : prev.draws,
        losses: matchToDelete.result === 'D' ? Math.max(0, prev.losses - 1) : prev.losses
      }));
    } else if (matchToDelete.wlCampaignId) {
      setWlCampaigns(prev => prev.map(c => {
        if (c.id === matchToDelete.wlCampaignId) {
          return {
            ...c,
            wins: matchToDelete.result === 'V' ? Math.max(0, c.wins - 1) : c.wins,
            losses: matchToDelete.result === 'D' ? Math.max(0, c.losses - 1) : c.losses,
            isCompleted: false
          };
        }
        return c;
      }));
    }

    setMatches(matches.filter(m => m.id !== id));
  };

  const handleFinishWL = (wl: WLCampaign) => {
    setWlCampaigns(prev => prev.map(c => c.id === wl.id ? { ...c, isCompleted: true } : c));
    const otherWLs = wlCampaigns.filter(c => c.id !== wl.id && (c.wins > 0 || c.losses > 0));

    if (otherWLs.length === 0) {
      setWlComparisonMessage({
        title: 'Primeira WL Concluída!',
        desc: `Você terminou com ${wl.wins} Vitórias e ${wl.losses} Derrotas. Excelente início!`,
        type: 'first'
      });
    } else {
      const maxWinsPrevious = Math.max(...otherWLs.map(c => c.wins));
      const lastWL = otherWLs[0];

      if (wl.wins > maxWinsPrevious) {
        setWlComparisonMessage({
          title: '🔥 NOVO RECORDE PESSOAL!',
          desc: `Incrível! Esta foi a sua MELHOR Weekend League até agora com ${wl.wins} vitórias em 15 jogos!`,
          type: 'record'
        });
      } else if (wl.wins > lastWL.wins) {
        setWlComparisonMessage({
          title: '📈 Evolução em relação à última WL!',
          desc: `Bom trabalho! Você foi melhor que a semana anterior (${wl.wins} vitórias contra ${lastWL.wins}).`,
          type: 'better'
        });
      } else if (wl.wins < lastWL.wins) {
        setWlComparisonMessage({
          title: '📉 Abaixo da última WL',
          desc: `Você fez ${wl.wins} vitórias nesta semana (na anterior conquistou ${lastWL.wins}). Hora de focar para a próxima!`,
          type: 'worse'
        });
      } else {
        setWlComparisonMessage({
          title: '⚖️ Desempenho Mantido',
          desc: `Você manteve a mesma marca da última edição com ${wl.wins} vitórias.`,
          type: 'same'
        });
      }
    }

    setFinishWlModal(wl);
  };

  return (
    <div className="flex min-h-screen bg-[#04070D] text-slate-100 font-sans antialiased">
      <aside className="w-64 bg-[#080C14] border-r border-slate-800/60 p-6 flex flex-col justify-between hidden md:flex sticky top-0 h-screen">
        <div>
          <div 
            className="flex items-center gap-3 mb-10 pl-1 cursor-pointer group" 
            onClick={() => setActiveTab('inicio')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 text-black flex items-center justify-center font-black text-xs tracking-tighter shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              EA
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black italic text-xl tracking-wider text-white">FC 27</span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">PRO</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Performance Tracker</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button 
              onClick={() => setActiveTab('inicio')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'inicio' ? 'bg-gradient-to-r from-emerald-500/15 to-transparent text-emerald-400 border-l-4 border-emerald-400' : 'text-slate-400 hover:bg-[#0F1622] hover:text-slate-200'}`}
            >
              <Home className="w-4 h-4" /> Visão Geral (Início)
            </button>
            <button 
              onClick={() => setActiveTab('rivals')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'rivals' ? 'bg-gradient-to-r from-blue-500/15 to-transparent text-blue-400 border-l-4 border-blue-400' : 'text-slate-400 hover:bg-[#0F1622] hover:text-slate-200'}`}
            >
              <Trophy className="w-4 h-4 text-blue-400" /> Division Rivals
            </button>
            <button 
              onClick={() => setActiveTab('wl')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'wl' ? 'bg-gradient-to-r from-amber-500/15 to-transparent text-amber-400 border-l-4 border-amber-400' : 'text-slate-400 hover:bg-[#0F1622] hover:text-slate-200'}`}
            >
              <Swords className="w-4 h-4 text-amber-400" /> UT Champions (WL)
            </button>
            <button 
              onClick={() => setActiveTab('config')}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'config' ? 'bg-gradient-to-r from-emerald-500/15 to-transparent text-emerald-400 border-l-4 border-emerald-400' : 'text-slate-400 hover:bg-[#0F1622] hover:text-slate-200'}`}
            >
              <Settings className="w-4 h-4" /> Configurações
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800/60 space-y-3">
          <div className="flex items-center justify-between text-xs bg-[#05080E] border border-slate-800 p-2.5 rounded-xl">
            <span className="text-slate-400 truncate flex items-center gap-1.5 font-medium">
              <UserIcon className="w-3.5 h-3.5 text-emerald-400" /> {currentUser.email}
            </span>
            <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition ml-1" title="Sair">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-[#080C14]/80 p-6 rounded-2xl border border-slate-800/60 backdrop-blur-md">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              {activeTab === 'inicio' && 'Dashboard Principal'}
              {activeTab === 'rivals' && <><Trophy className="w-7 h-7 text-blue-400" /> Central Division Rivals</>}
              {activeTab === 'wl' && <><Swords className="w-7 h-7 text-amber-400" /> Central UT Champions (WL)</>}
              {activeTab === 'config' && 'Configurações do Sistema'}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1">
              {activeTab === 'inicio' && 'Visão agregada de todo o seu progresso no EA FC 27.'}
              {activeTab === 'rivals' && 'Acompanhe sua subida de divisão e vitórias semanais.'}
              {activeTab === 'wl' && 'Gerencie e compare suas edições de Weekend League (máx 15 jogos).'}
              {activeTab === 'config' && 'Opções de gerenciamento dos seus dados.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'wl' && (
              <button 
                onClick={() => setShowNewWlModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-black font-extrabold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-amber-500/20"
              >
                <Plus className="w-4 h-4 stroke-[3]" /> Nova WL
              </button>
            )}

            <button 
              onClick={() => setShowAddMatch(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold px-4 py-2.5 rounded-xl text-sm transition shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Registrar Partida
            </button>
          </div>
        </div>

        {activeTab === 'inicio' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => setActiveTab('rivals')}
                className="bg-gradient-to-b from-[#0B132B] to-[#070A12] border border-blue-500/30 hover:border-blue-400 rounded-2xl p-6 shadow-xl cursor-pointer group transition-all"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Trophy className="w-4 h-4" /> Division Rivals
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-3xl font-black text-white mb-1">{rivals.divOrRank}</div>
                <div className="text-xs text-slate-400 mb-4">{rivals.wins}V - {rivals.draws}E - {rivals.losses}D ({rivalsEff}% apr.)</div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all" style={{ width: `${rivalsEff}%` }}></div>
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('wl')}
                className="bg-gradient-to-b from-[#22160A] to-[#070A12] border border-amber-500/30 hover:border-amber-400 rounded-2xl p-6 shadow-xl cursor-pointer group transition-all"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Swords className="w-4 h-4" /> WL Atual ({activeWl?.name || 'Nenhuma'})
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-3xl font-black text-amber-400 mb-1">
                  {activeWl ? `${activeWl.wins} - ${activeWl.losses}` : '0 - 0'}
                </div>
                <div className="text-xs text-slate-400 mb-4">
                  Data: {activeWl?.startDate || '-'} | Total: {(activeWl?.wins || 0) + (activeWl?.losses || 0)}/15
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full transition-all" style={{ width: `${activeWl ? Math.round((activeWl.wins / Math.max((activeWl.wins + activeWl.losses), 1)) * 100) : 0}%` }}></div>
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#081C15] to-[#070A12] border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> Aproveitamento Global
                  </span>
                </div>
                <div className="text-3xl font-black text-emerald-400 mb-1">{grandEff}%</div>
                <div className="text-xs text-slate-400 mb-4">
                  Total: {grandTotalWins}V - {grandTotalDraws}E - {grandTotalLosses}D ({grandTotalGames} partidas)
                </div>
                <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full transition-all" style={{ width: `${grandEff}%` }}></div>
                </div>
              </div>
            </div>

            <div className="bg-[#080C14] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" /> Histórico Recente Completo
              </h3>

              <div className="space-y-2">
                {matches.length === 0 ? (
                  <p className="text-slate-500 text-xs py-4 text-center">Nenhuma partida registrada ainda.</p>
                ) : (
                  matches.slice(0, 8).map(m => (
                    <div key={m.id} className="flex items-center justify-between text-xs px-4 py-3 rounded-xl bg-[#05080E] border border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${m.result === 'V' ? 'bg-emerald-400' : m.result === 'E' ? 'bg-amber-400' : 'bg-rose-500'}`}></span>
                        <span className="text-slate-400 font-mono text-[11px]">{m.date}</span>
                        <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${m.mode === 'Rivals' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {m.mode}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-black text-xs ${m.result === 'V' ? 'text-emerald-400' : m.result === 'E' ? 'text-amber-400' : 'text-rose-500'}`}>
                          {m.result === 'V' ? 'Vitória' : m.result === 'E' ? 'Empate' : 'Derrota'}
                        </span>
                        <button onClick={() => deleteMatch(m.id)} className="text-slate-600 hover:text-rose-400 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* RIVALS */}
        {activeTab === 'rivals' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-b from-[#0B132B] to-[#080C14] border border-blue-500/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-wider">
                    Temporada Rivals
                  </span>
                  <h2 className="text-3xl font-black text-white mt-2">{rivals.divOrRank}</h2>
                </div>

                <button 
                  onClick={() => { setTempRivals(rivals); setEditingRivals(true); }}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Editar Divisão
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 mb-6 bg-[#05080E] p-3 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-bold ml-2">Ação Rápida:</span>
                <button onClick={quickAddRivalsWin} className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-black px-4 py-2 rounded-xl text-xs transition">
                  <Plus className="w-4 h-4 stroke-[3]" /> Vitória (+1)
                </button>
                <button onClick={quickAddRivalsDraw} className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/40 font-black px-4 py-2 rounded-xl text-xs transition">
                  <Plus className="w-4 h-4 stroke-[3]" /> Empate (+1)
                </button>
                <button onClick={quickAddRivalsLoss} className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-black px-4 py-2 rounded-xl text-xs transition">
                  <Plus className="w-4 h-4 stroke-[3]" /> Derrota (+1)
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#05080E] p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs block mb-1">Vitórias</span>
                  <span className="text-3xl font-black text-emerald-400">{rivals.wins}</span>
                </div>
                <div className="bg-[#05080E] p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs block mb-1">Empates</span>
                  <span className="text-3xl font-black text-amber-400">{rivals.draws}</span>
                </div>
                <div className="bg-[#05080E] p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs block mb-1">Derrotas</span>
                  <span className="text-3xl font-black text-rose-500">{rivals.losses}</span>
                </div>
                <div className="bg-[#05080E] p-4 rounded-xl border border-slate-800">
                  <span className="text-slate-400 text-xs block mb-1">Aproveitamento</span>
                  <span className="text-3xl font-black text-blue-400">{rivalsEff}%</span>
                </div>
              </div>
            </div>

            <div className="bg-[#080C14] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-400" /> Partidas do Division Rivals
              </h3>
              <div className="space-y-2">
                {matches.filter(m => m.mode === 'Rivals').length === 0 ? (
                  <p className="text-slate-500 text-xs py-4 text-center">Nenhuma partida registrada.</p>
                ) : (
                  matches.filter(m => m.mode === 'Rivals').map(m => (
                    <div key={m.id} className="flex items-center justify-between text-xs px-4 py-3 rounded-xl bg-[#05080E] border border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${m.result === 'V' ? 'bg-emerald-400' : m.result === 'E' ? 'bg-amber-400' : 'bg-rose-500'}`}></span>
                        <span className="text-slate-400 font-mono text-[11px]">{m.date}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-black text-xs ${m.result === 'V' ? 'text-emerald-400' : m.result === 'E' ? 'text-amber-400' : 'text-rose-500'}`}>
                          {m.result === 'V' ? 'Vitória' : m.result === 'E' ? 'Empate' : 'Derrota'}
                        </span>
                        <button onClick={() => deleteMatch(m.id)} className="text-slate-600 hover:text-rose-400 transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* WL */}
        {activeTab === 'wl' && (
          <div className="space-y-8">
            <div className="bg-gradient-to-b from-[#22160A] to-[#080C14] border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <span className="bg-amber-500/10 text-amber-400 text-xs font-bold px-3 py-1 rounded-full border border-amber-500/20 uppercase tracking-wider">
                    Edição Selecionada
                  </span>
                  <div className="flex items-center gap-3 mt-2">
                    <select 
                      value={activeWlId} 
                      onChange={e => setActiveWlId(e.target.value)}
                      className="bg-[#05080E] border border-amber-500/40 rounded-xl px-4 py-2 text-xl font-black text-amber-400 focus:outline-none"
                    >
                      {wlCampaigns.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.startDate}) {c.isCompleted ? '[Concluída]' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeWl && !activeWl.isCompleted && (
                    <button 
                      onClick={() => handleFinishWL(activeWl)}
                      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle className="w-4 h-4 stroke-[2.5]" /> Encerrar Esta WL
                    </button>
                  )}

                  <button 
                    onClick={() => setShowNewWlModal(true)}
                    className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold px-4 py-2.5 rounded-xl text-xs transition"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Nova WL
                  </button>
                </div>
              </div>

              {activeWl && !activeWl.isCompleted && (
                <div className="flex items-center gap-3 mb-6 bg-[#05080E] p-3 rounded-2xl border border-slate-800">
                  <span className="text-xs text-slate-400 font-bold ml-2">Registrar Resultado:</span>
                  <button onClick={quickAddWlWin} className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/40 font-black px-4 py-2 rounded-xl text-xs transition">
                    <Plus className="w-4 h-4 stroke-[3]" /> Vitória (+1)
                  </button>
                  <button onClick={quickAddWlLoss} className="flex items-center gap-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/40 font-black px-4 py-2 rounded-xl text-xs transition">
                    <Plus className="w-4 h-4 stroke-[3]" /> Derrota (+1)
                  </button>
                </div>
              )}

              {activeWl && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-[#05080E] p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-xs block mb-1">Vitórias</span>
                    <span className="text-3xl font-black text-emerald-400">{activeWl.wins}</span>
                  </div>
                  <div className="bg-[#05080E] p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-xs block mb-1">Derrotas</span>
                    <span className="text-3xl font-black text-rose-500">{activeWl.losses}</span>
                  </div>
                  <div className="bg-[#05080E] p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-xs block mb-1">Jogos Restantes</span>
                    <span className="text-3xl font-black text-amber-400">
                      {Math.max(0, 15 - (activeWl.wins + activeWl.losses))} / 15
                    </span>
                  </div>
                  <div className="bg-[#05080E] p-4 rounded-xl border border-slate-800">
                    <span className="text-slate-400 text-xs block mb-1">Data de Início</span>
                    <span className="text-xl font-black text-slate-200 mt-1 block">{activeWl.startDate}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#080C14] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-amber-400" /> Histórico Geral de WLs
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#05080E] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Nome</th>
                      <th className="p-3">Data</th>
                      <th className="p-3">Campanha</th>
                      <th className="p-3">Aproveitamento</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {wlCampaigns.map(c => {
                      const total = c.wins + c.losses;
                      const eff = total > 0 ? Math.round((c.wins / total) * 100) : 0;
                      return (
                        <tr key={c.id} className={`hover:bg-[#0C111C] ${c.id === activeWlId ? 'bg-amber-500/5 font-bold' : ''}`}>
                          <td className="p-3 text-white">{c.name}</td>
                          <td className="p-3 text-slate-400">{c.startDate}</td>
                          <td className="p-3 font-bold">{c.wins}V - {c.losses}D</td>
                          <td className="p-3 text-emerald-400 font-bold">{eff}%</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.isCompleted ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                              {c.isCompleted ? 'Finalizada' : 'Em Andamento'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button 
                              onClick={() => setActiveWlId(c.id)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold ${c.id === activeWlId ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'}`}
                            >
                              {c.id === activeWlId ? 'Ativa' : 'Selecionar'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="bg-[#080C14] border border-slate-800/80 rounded-2xl p-6 max-w-xl shadow-xl space-y-4">
            <h2 className="text-xl font-black text-white">Gerenciar Conta</h2>
            <p className="text-xs text-slate-400">Você está logado como: <strong className="text-emerald-400">{currentUser.email}</strong></p>
            <button 
              onClick={handleLogout}
              className="bg-rose-600 hover:bg-rose-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" /> Sair da Conta
            </button>
          </div>
        )}

      </main>

      {/* MODAL ENCERRAMENTO DA WL */}
      {finishWlModal && wlComparisonMessage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#080C14] border border-amber-500/40 rounded-2xl p-6 w-full max-w-md space-y-4 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              {wlComparisonMessage.type === 'record' && <Award className="w-8 h-8" />}
              {wlComparisonMessage.type === 'better' && <TrendingUp className="w-8 h-8 text-emerald-400" />}
              {wlComparisonMessage.type === 'worse' && <TrendingDown className="w-8 h-8 text-rose-500" />}
              {wlComparisonMessage.type === 'same' && <Minus className="w-8 h-8 text-amber-400" />}
              {wlComparisonMessage.type === 'first' && <Sparkles className="w-8 h-8 text-amber-400" />}
            </div>

            <h3 className="text-xl font-black text-white">{wlComparisonMessage.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{wlComparisonMessage.desc}</p>

            <div className="bg-[#05080E] border border-slate-800 rounded-xl p-4 my-2">
              <span className="text-xs text-slate-400 block mb-1">Campanha Final ({finishWlModal.name})</span>
              <span className="text-2xl font-black text-emerald-400">{finishWlModal.wins} Vitórias</span>
              <span className="text-slate-500 mx-2">-</span>
              <span className="text-2xl font-black text-rose-500">{finishWlModal.losses} Derrotas</span>
            </div>

            <button onClick={() => { setFinishWlModal(null); setWlComparisonMessage(null); }} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-extrabold py-2.5 rounded-xl text-xs transition">
              Entendido
            </button>
          </div>
        </div>
      )}

      {showNewWlModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateWL} className="bg-[#080C14] border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-black text-white">Nova WL</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Nome</label>
              <input type="text" required value={newWlData.name} onChange={e => setNewWlData({ ...newWlData, name: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Data</label>
              <input type="text" required value={newWlData.startDate} onChange={e => setNewWlData({ ...newWlData, startDate: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowNewWlModal(false)} className="px-4 py-2 text-xs text-slate-400">Cancelar</button>
              <button type="submit" className="bg-amber-500 text-black font-bold px-4 py-2 rounded-xl text-xs">Criar</button>
            </div>
          </form>
        </div>
      )}

      {showAddMatch && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddMatch} className="bg-[#080C14] border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-black text-white">Registrar Partida</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Modo de Jogo</label>
              <select value={newMatch.mode} onChange={e => setNewMatch({ ...newMatch, mode: e.target.value as 'Rivals' | 'WL', result: 'V' })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-sm">
                <option value="Rivals">Division Rivals</option>
                <option value="WL">UT Champions (WL)</option>
              </select>
            </div>

            {newMatch.mode === 'WL' && (
              <div>
                <label className="text-xs text-slate-400 block mb-1">WL Alvo</label>
                <select value={newMatch.wlCampaignId} onChange={e => setNewMatch({ ...newMatch, wlCampaignId: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-sm font-bold text-amber-400">
                  {wlCampaigns.map(c => <option key={c.id} value={c.id}>{c.name} {c.isCompleted ? '[Concluída]' : ''}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs text-slate-400 block mb-1">Resultado</label>
              <select value={newMatch.result} onChange={e => setNewMatch({ ...newMatch, result: e.target.value as 'V' | 'E' | 'D' })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-sm font-bold">
                <option value="V" className="text-emerald-400">Vitória</option>
                {newMatch.mode === 'Rivals' && <option value="E" className="text-amber-400">Empate</option>}
                <option value="D" className="text-rose-500">Derrota</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddMatch(false)} className="px-4 py-2 text-xs text-slate-400">Cancelar</button>
              <button type="submit" className="bg-emerald-500 text-black font-bold px-4 py-2 rounded-xl text-xs">Salvar Partida</button>
            </div>
          </form>
        </div>
      )}

      {editingRivals && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-[#080C14] border border-slate-800 rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-black text-white">Editar Rivals</h3>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Divisão</label>
              <input type="text" value={tempRivals.divOrRank} onChange={e => setTempRivals({ ...tempRivals, divOrRank: e.target.value })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2.5 text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-slate-400 block mb-1">V</label>
                <input type="number" value={tempRivals.wins} onChange={e => setTempRivals({ ...tempRivals, wins: Number(e.target.value) })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2 text-sm text-emerald-400" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">E</label>
                <input type="number" value={tempRivals.draws} onChange={e => setTempRivals({ ...tempRivals, draws: Number(e.target.value) })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2 text-sm text-amber-400" />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">D</label>
                <input type="number" value={tempRivals.losses} onChange={e => setTempRivals({ ...tempRivals, losses: Number(e.target.value) })} className="w-full bg-[#05080E] border border-slate-800 rounded-xl p-2 text-sm text-rose-500" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditingRivals(false)} className="px-4 py-2 text-xs text-slate-400">Cancelar</button>
              <button onClick={() => { setRivals(tempRivals); setEditingRivals(false); }} className="bg-blue-500 text-black font-bold px-4 py-2 rounded-xl text-xs">Salvar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}