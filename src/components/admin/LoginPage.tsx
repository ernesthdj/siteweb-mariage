/**
 * LoginPage — Page de connexion admin pour /admin
 * Meme esthetique que le site (bg-[#faf8f5], wall-texture, Cormorant Garamond)
 * Formulaire email/mot de passe avec gestion d'erreurs discrete
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { login, loading, error: authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const error = localError || authError;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setLocalError(null);

      if (!email.trim() || !password.trim()) {
        setLocalError('Veuillez remplir tous les champs.');
        return;
      }

      const success = await login(email.trim(), password);
      if (!success) {
        setLocalError('Identifiants incorrects.');
      }
    },
    [email, password, login]
  );

  return (
    <div className="min-h-screen bg-[#faf8f5] wall-texture flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md"
      >
        {/* En-tete */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="text-4xl md:text-5xl serif italic mb-3 text-[#1a1a1a]"
          >
            Administration
          </motion.h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="h-[1px] bg-black/10 mx-auto mb-4"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-[9px] uppercase tracking-[0.4em] text-zinc-400"
          >
            Ernest H. Photography
          </motion.p>
        </div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="bg-white p-8 md:p-12 shadow-[20px_20px_60px_rgba(0,0,0,0.05)] border border-zinc-50"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="admin-email"
                className="block text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@atypique-studio.com"
                autoComplete="email"
                className="w-full border-b border-zinc-100 py-3 outline-none focus:border-black transition-colors text-sm font-light bg-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-[9px] uppercase tracking-[0.3em] text-zinc-400 mb-2"
              >
                Mot de passe
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                autoComplete="current-password"
                className="w-full border-b border-zinc-100 py-3 outline-none focus:border-black transition-colors text-sm font-light bg-transparent"
              />
            </div>

            {/* Message d'erreur discret */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] text-red-400 tracking-wide"
                role="alert"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-4 text-[9px] uppercase tracking-[0.4em] mt-6 transition-all duration-500 hover:bg-[#2a2a2a] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden group"
            >
              <span className="relative z-10">
                {loading ? 'Connexion...' : 'Se connecter'}
              </span>
              <div className="absolute inset-0 bg-[#2a2a2a] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </button>
          </form>
        </motion.div>

        {/* Lien retour discret */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-center mt-8"
        >
          <a
            href="/"
            className="text-[8px] uppercase tracking-[0.3em] text-zinc-300 hover:text-zinc-500 transition-colors"
          >
            Retour au site
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
