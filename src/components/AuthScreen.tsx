import React, { useState } from 'react';
import { OwlMascot } from './OwlMascot';
import {
  loginUser,
  registerUser,
  getFriendlyAuthErrorMessage,
} from '../lib/firebase';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface AuthScreenProps {
  onSuccess?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Preencha seu e-mail e sua senha para continuar.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Por favor, informe seu nome para personalizarmos seu painel.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
        return;
      }
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        await registerUser(name, email, password);
      } else {
        await loginUser(email, password);
      }
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Erro na autenticação:', err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err?.code || '');
      setErrorMessage(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#edf3ef] flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Centered Auth Card Container */}
      <div className="w-full max-w-md bg-white rounded-3xl sm:rounded-[32px] border border-emerald-950/10 shadow-lg p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-teal-100/50 rounded-full blur-2xl pointer-events-none" />

        {/* Mascot & Brand Header */}
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-2">
            <OwlMascot size={76} mood={mode === 'register' ? 'celebrate' : 'wise'} />
            <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-white shadow-xs">
              <Cloud className="w-3.5 h-3.5" />
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Coruja Finanças
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
            Controle financeiro pessoal inteligente com sincronização em nuvem e persistência contínua.
          </p>

          {/* Mode Switcher Pills */}
          <div className="w-full grid grid-cols-2 p-1 bg-slate-100/80 rounded-2xl mt-5 border border-slate-200/80">
            <button
              type="button"
              id="auth-tab-login"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Já tenho conta
            </button>
            <button
              type="button"
              id="auth-tab-register"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Criar nova conta
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5 relative z-10">
          {errorMessage && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome completo ou como prefere ser chamado
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-name-input"
                  type="text"
                  placeholder="Ex: Maria Silva"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                  required={mode === 'register'}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email-input"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                Senha
              </label>
              {mode === 'register' && (
                <span className="text-[10px] text-slate-400">mínimo 6 dígitos</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password-input"
                type={showPassword ? 'text' : 'password'}
                placeholder={mode === 'register' ? 'Crie uma senha segura' : 'Digite sua senha'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{mode === 'register' ? 'Criando sua conta...' : 'Entrando...'}</span>
              </div>
            ) : (
              <>
                <span>{mode === 'register' ? 'Concluir Cadastro & Começar' : 'Entrar no Coruja Finanças'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Real-time sync benefits badge */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Sincronizado entre computador, tablet e celular</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Não coleta dados bancários ou CPF — 100% privado</span>
          </div>
        </div>
      </div>
    </div>
  );
};
