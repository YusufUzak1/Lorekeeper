import { useMemo, useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmSignUp, resendSignUpCode, signIn, signUp } from 'aws-amplify/auth';

import { useAuthStore } from '@/store/useAuthStore';

type Mode = 'login' | 'signup';

function buildUsernameFromEmail(email: string): string {
  const local = email.split('@')[0] ?? 'user';
  const normalized = local.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18) || 'user';
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${normalized}_${suffix}`;
}

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/hub', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const requestedMode = searchParams.get('mode');
  const initialMode: Mode = requestedMode === 'signup' ? 'signup' : 'login';

  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isVerificationStep = useMemo(() => pendingEmail !== null, [pendingEmail]);

  const switchMode = (nextMode: Mode) => {
    setMode(nextMode);
    setSearchParams({ mode: nextMode });
    setMessage(null);
    setError(null);
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await signIn({ username: email.trim(), password });
      login(email.trim());
      navigate('/hub', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Giris yapilamadi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const generatedUsername = buildUsernameFromEmail(email.trim());
      const result = await signUp({
        username: generatedUsername,
        password,
        options: {
          userAttributes: {
            email: email.trim(),
          },
        },
      });

      if (result.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setPendingUsername(generatedUsername);
        setPendingEmail(email.trim());
        setMessage('Dogrulama kodu e-posta adresine gonderildi.');
      } else {
        setMessage('Kayit tamamlandi. Simdi giris yapabilirsin.');
        switchMode('login');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kayit olusturulamadi.';
      
      if (msg.toLowerCase().includes('already exists') || msg.includes('AliasExistsException')) {
        setError('Bu e-posta adresi zaten kullaniliyor. Lutfen giris yapin.');
        switchMode('login');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    if (!pendingEmail || !pendingUsername) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await confirmSignUp({
        username: pendingUsername,
        confirmationCode: verificationCode.trim(),
      });
      setPendingUsername(null);
      setPendingEmail(null);
      setVerificationCode('');
      setMode('login');
      setSearchParams({ mode: 'login' });
      setMessage('E-posta dogrulandi. Artik giris yapabilirsin.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kod dogrulanamadi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!pendingEmail || !pendingUsername) return;

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await resendSignUpCode({ username: pendingUsername });
      setMessage('Yeni dogrulama kodu gonderildi.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kod tekrar gonderilemedi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-xl glass-panel rounded-2xl p-8 flex flex-col gap-5">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-serif text-white/90">Lorekeeper Kimlik Kapisi</h1>
          <p className="text-sm text-white/55">
            AWS Cognito ile guvenli giris, kayit ve e-posta dogrulama.
          </p>
        </div>

        {!isVerificationStep && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/25 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={[
                'flex-1 rounded-lg px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors',
                mode === 'login'
                  ? 'bg-mythos-accent/20 text-mythos-accent border border-mythos-accent/40'
                  : 'text-white/60 hover:bg-white/5',
              ].join(' ')}
            >
              Giris
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={[
                'flex-1 rounded-lg px-4 py-2 text-xs uppercase tracking-[0.2em] transition-colors',
                mode === 'signup'
                  ? 'bg-mythos-accent/20 text-mythos-accent border border-mythos-accent/40'
                  : 'text-white/60 hover:bg-white/5',
              ].join(' ')}
            >
              Kayit
            </button>
          </div>
        )}

        {isVerificationStep ? (
          <form onSubmit={handleConfirm} className="flex flex-col gap-3">
            <p className="text-xs text-white/70">
              <span className="text-mythos-accent">{pendingEmail}</span> adresine gelen 6 haneli kodu gir.
            </p>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Dogrulama kodu"
              className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-mythos-accent/70 focus:ring-1 focus:ring-mythos-accent/70"
              required
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-md bg-mythos-accent/85 px-4 py-2 text-xs uppercase tracking-[0.2em] text-black font-semibold hover:bg-mythos-accent transition-colors disabled:opacity-60"
              >
                {loading ? 'Dogrulaniyor...' : 'Onayla'}
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className="rounded-md border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/80 hover:bg-white/10 transition-colors disabled:opacity-60"
              >
                Kodu Tekrar Gonder
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={mode === 'login' ? handleLogin : handleSignUp} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta"
              className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-mythos-accent/70 focus:ring-1 focus:ring-mythos-accent/70"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sifre"
              className="w-full rounded-md bg-black/30 border border-white/10 px-3 py-2 text-sm text-white outline-none focus:border-mythos-accent/70 focus:ring-1 focus:ring-mythos-accent/70"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-mythos-accent/85 px-4 py-2 text-xs uppercase tracking-[0.2em] text-black font-semibold hover:bg-mythos-accent transition-colors disabled:opacity-60"
            >
              {loading ? 'Isleniyor...' : mode === 'login' ? 'Giris Yap' : 'Kayit Ol'}
            </button>
          </form>
        )}

        {(message || error) && (
          <p className={['text-xs', error ? 'text-red-300' : 'text-mythos-accent/90'].join(' ')}>
            {error ?? message}
          </p>
        )}

        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="self-start text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-white/80 transition-colors"
        >
          Ana sayfaya don
        </button>
      </div>
    </section>
  );
}
