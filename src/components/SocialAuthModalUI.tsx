/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SocialAuthModalUI.tsx
 * Offline-first Supabase & Social Auth component.
 * Allows instant offline guest work (persisted locally on device) with optional
 * Supabase cloud sync for project backup and cross-device editing.
 */

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Cloud, 
  CloudOff, 
  Check, 
  Lock, 
  Smartphone, 
  Database,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface SocialAuthModalUIProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
  onLoginSuccess?: (email: string) => void;
  onContinueAsGuest?: () => void;
}

export const SocialAuthModalUI: React.FC<SocialAuthModalUIProps> = ({
  isOpen,
  onClose,
  userEmail,
  onLoginSuccess,
  onContinueAsGuest
}) => {
  const [currentUser, setCurrentUser] = useState<string | null>(userEmail || null);
  const [inputEmail, setInputEmail] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSkipOrGuest = () => {
    if (onContinueAsGuest) {
      onContinueAsGuest();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleSimulateLogin = (provider: string) => {
    setIsSyncing(true);
    setTimeout(() => {
      const email = inputEmail || `${provider.toLowerCase()}_creator@android.dev`;
      setCurrentUser(email);
      setIsSyncing(false);
      onLoginSuccess?.(email);
    }, 600);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-[#131318] border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-[#16161d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Database size={16} />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">Supabase Cloud Sync</h3>
              <p className="text-[11px] text-zinc-400">Offline-First Local Storage + Cloud Backup</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSkipOrGuest}
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[11px] font-bold transition flex items-center gap-1"
            >
              <span>Skip</span>
              <ArrowRight size={12} />
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Offline Status Badge */}
          <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 mt-0.5">
              <ShieldCheck size={16} />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">100% Offline Capable</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-emerald-400/10 text-emerald-400 border border-emerald-400/30">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                All video edits, Skia shaders, and multi-track timelines are stored locally in SQLite / MMKV on your Samsung A15 internal storage.
              </p>
            </div>
          </div>

          {/* Prominent Skip / Continue as Guest Action Box */}
          {!currentUser && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-[#FF9500]/10 to-amber-500/10 border border-[#FF9500]/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-[#FF9500]" />
                  Instant Offline Editing
                </span>
                <span className="text-[10px] text-zinc-400 font-medium">No account required</span>
              </div>
              <button
                onClick={handleSkipOrGuest}
                className="w-full py-2.5 px-3 rounded-xl bg-[#FF9500] hover:bg-[#e08500] text-zinc-950 font-black text-xs transition shadow-lg flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>Skip / Continue as Guest</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          )}

          {currentUser ? (
            /* Logged in state */
            <div className="space-y-3 pt-2">
              <div className="p-4 rounded-2xl bg-zinc-850 border border-zinc-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-400 flex items-center justify-center font-bold">
                    <UserCheck size={18} />
                  </div>
                  <div>
                    <span className="font-bold text-white block">{currentUser}</span>
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <Cloud size={11} />
                      Supabase Cloud Connected
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 font-bold text-xs transition"
                >
                  Log Out
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-black text-xs transition"
                >
                  Continue Editing
                </button>
              </div>
            </div>
          ) : (
            /* Auth Providers */
            <div className="space-y-3 pt-2">
              <div className="text-[11px] text-zinc-400 font-medium">
                Or sign in to automatically sync your presets and backup projects:
              </div>

              {/* Provider Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handleSimulateLogin('Google')}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 flex items-center justify-center gap-2 font-bold text-white transition hover:border-zinc-600"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  onClick={() => handleSimulateLogin('GitHub')}
                  disabled={isSyncing}
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 flex items-center justify-center gap-2 font-bold text-white transition hover:border-zinc-600"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>Continue with GitHub</span>
                </button>
              </div>

              {/* Guest button */}
              <button
                onClick={handleSkipOrGuest}
                className="w-full mt-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs border border-zinc-800 transition flex items-center justify-center gap-1.5"
              >
                <Smartphone size={14} className="text-[#FF9500]" />
                <span>Continue as Guest (Galaxy A15 Local Storage)</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SocialAuthModalUI;
