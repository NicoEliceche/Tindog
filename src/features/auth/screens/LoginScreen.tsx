'use client';

import { fetchGoogleAuthConfig, GoogleAuthRequestFailure, loginWithEmailPassword, loginWithGoogleIdToken, requestEmailCode, restoreAuthSession, verifyEmailCode } from '@core/data/services/authService';
import { useWebApp } from '@core/providers/WebAppProvider';
import { withPublicBasePath } from '@core/routing/publicPath';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AtSign, KeyRound, Mail, Smartphone } from 'lucide-react';
import {
  Screen, Layout, Hero, Card, Google, GoogleStatus, ErrorMessage, Auto, Divider,
  MethodList, MethodButton, Form, Field, Submit, BackLink, CodeHint, GoogleSlot,
} from './LoginScreenStyled';

/** Métodos alternativos a Google, en el orden en que se ofrecen. */
type Method = 'none' | 'password' | 'code' | 'phone';

declare global { interface Window { google?: { accounts: { id: { initialize: (config: { client_id: string; callback: (response: { credential?: string }) => void }) => void; renderButton: (parent: HTMLElement, options: { theme: 'outline' | 'filled_blue' | 'filled_black'; size: 'large' | 'medium' | 'small'; text: 'continue_with' | 'signin_with'; shape: 'pill' | 'rectangular'; width: number }) => void; } } } } }

const GOOGLE_SCRIPT_ID = 'google-identity-services';
let googleIdentityScriptPromise: Promise<void> | undefined;

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google) return Promise.resolve();
  if (googleIdentityScriptPromise) return googleIdentityScriptPromise;

  googleIdentityScriptPromise = new Promise<void>((resolve, reject) => {
    let script = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;

    const handleLoad = () => {
      if (script) script.dataset.loaded = 'true';
      if (window.google) resolve();
      else reject(new Error('Google Identity Services did not initialize'));
    };
    const handleError = () => {
      script?.remove();
      googleIdentityScriptPromise = undefined;
      reject(new Error('Google Identity Services could not be loaded'));
    };

    if (!script) {
      script = document.createElement('script');
      script.id = GOOGLE_SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    if (script.dataset.loaded === 'true') handleLoad();
  });

  return googleIdentityScriptPromise;
}

function waitForGoogleButton(container: HTMLElement, timeoutMs = 15_000): Promise<void> {
  if (container.childElementCount > 0) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const observer = new MutationObserver(() => {
      if (container.childElementCount > 0) {
        clearTimeout(timeout);
        observer.disconnect();
        resolve();
      }
    });
    const timeout = window.setTimeout(() => {
      observer.disconnect();
      reject(new Error('Google button rendering timed out'));
    }, timeoutMs);

    observer.observe(container, { childList: true });
  });
}

export function LoginScreen() {
  const router = useRouter(); const buttonRef = useRef<HTMLDivElement>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  // El botón lo dibuja Google, no nosotros: hay que pedirle la variante
  // oscura explícitamente o queda un rectángulo blanco sobre el fondo.
  const { resolvedTheme } = useWebApp();
  // Métodos alternativos. Viven en el mismo panel: se reemplaza la lista por
  // el formulario elegido en vez de navegar a otra pantalla.
  const [method, setMethod] = useState<Method>('none');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(''); const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState(''); const [busy, setBusy] = useState(false);

  const resetMethod = () => { setMethod('none'); setError(''); setSentCode(''); setCode(''); };

  const submitPassword = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setBusy(true);
    try { await loginWithEmailPassword(email, password); router.push('/discovery'); }
    catch (err) { setError(err instanceof Error ? err.message : 'No pudimos iniciar sesión.'); }
    finally { setBusy(false); }
  };

  const submitCode = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      if (!sentCode) { setSentCode(await requestEmailCode(email)); }
      else { await verifyEmailCode(email, code, sentCode); router.push('/discovery'); }
    } catch (err) { setError(err instanceof Error ? err.message : 'No pudimos continuar.'); }
    finally { setBusy(false); }
  };
  const googleButtonTheme = resolvedTheme === 'light' ? 'outline' : 'filled_black';
  useEffect(() => { let cancelled = false;
    const boot = async () => { const session = await restoreAuthSession(); if (cancelled) return; if (session) { router.replace('/discovery'); setLoading(false); return; } try { const [{ webClientId }] = await Promise.all([fetchGoogleAuthConfig(), loadGoogleIdentityScript()]); if (cancelled) return; if (!webClientId || !window.google || !buttonRef.current) throw new Error('Google Identity Services is unavailable'); window.google.accounts.id.initialize({ client_id: webClientId, callback: async ({ credential }) => { if (!credential) return setError('Google no devolvió una credencial válida.'); setError(''); try { await loginWithGoogleIdToken(credential); router.push('/discovery'); } catch (loginError) { setError(loginError instanceof GoogleAuthRequestFailure ? loginError.message : 'No pudimos iniciar sesión con Google.'); } } }); const width = Math.min(320, Math.floor(buttonRef.current.getBoundingClientRect().width || 320)); buttonRef.current.innerHTML = ''; window.google.accounts.id.renderButton(buttonRef.current, { theme: googleButtonTheme, size: 'large', text: 'continue_with', shape: 'pill', width }); await waitForGoogleButton(buttonRef.current); } catch { if (!cancelled) setError('No pudimos cargar el acceso con Google. Revisá la conexión e intentá nuevamente.'); } finally { if (!cancelled) setLoading(false); } };
    boot(); return () => { cancelled = true; };
  }, [router, googleButtonTheme]);
  return <Screen><Layout><Hero><div className="logo"><img src={withPublicBasePath('/assets/tindog_patita_logo.png')} alt="Tindog" /></div><span className="kicker">Conectá, cruzá y encontrá su pareja ideal</span><h1>¡Bienvenido a Tindog!</h1><p>Conecta patitas, una tarjeta a la vez.</p></Hero><Card>
      <h2>Acceso rápido</h2>
      {error ? <ErrorMessage>{error}</ErrorMessage> : null}

      {/* Google dibuja su botón dentro de este nodo una sola vez. Si lo
          desmontamos al abrir un formulario, al volver queda vacío: por eso
          se oculta con CSS en lugar de sacarlo del árbol. */}
      <GoogleSlot $hidden={method !== 'none'}>
        <Google ref={buttonRef} />
        {loading ? <GoogleStatus>Verificando sesión y cargando Google…</GoogleStatus> : null}
        <Auto>Tu cuenta se crea automáticamente al continuar.</Auto>
      </GoogleSlot>

      {method === 'none' ? (<>
        <Divider>O CONTINUÁ CON</Divider>
        <MethodList>
          <MethodButton type="button" onClick={() => { setMethod('code'); setError(''); }}>
            <Mail size={18} /> Continuar con email
          </MethodButton>
          <MethodButton type="button" onClick={() => { setMethod('password'); setError(''); }}>
            <KeyRound size={18} /> Email y contraseña
          </MethodButton>
          <MethodButton type="button" onClick={() => { setMethod('phone'); setError(''); }}>
            <Smartphone size={18} /> Continuar con teléfono
          </MethodButton>
        </MethodList>
      </>) : null}

      {method === 'password' ? (
        <Form onSubmit={submitPassword}>
          <Field>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@ejemplo.com" autoComplete="email" required /></Field>
          <Field>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="current-password" required /></Field>
          <Submit type="submit" disabled={busy}>{busy ? 'Ingresando…' : 'Iniciar sesión'}</Submit>
          <BackLink type="button" onClick={resetMethod}>Volver a las otras opciones</BackLink>
        </Form>
      ) : null}

      {method === 'code' ? (
        <Form onSubmit={submitCode}>
          <Field>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vos@ejemplo.com" autoComplete="email" required disabled={!!sentCode} /></Field>
          {sentCode ? (<>
            <CodeHint>Todavía no enviamos mails de verdad, así que tu código es <b>{sentCode}</b>.</CodeHint>
            <Field>Código<input inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="6 dígitos" required /></Field>
          </>) : null}
          <Submit type="submit" disabled={busy}>{busy ? 'Un momento…' : sentCode ? 'Verificar código' : 'Enviarme un código'}</Submit>
          <BackLink type="button" onClick={resetMethod}>Volver a las otras opciones</BackLink>
        </Form>
      ) : null}

      {method === 'phone' ? (
        <Form onSubmit={(e) => { e.preventDefault(); setError('El acceso por teléfono necesita un proveedor de SMS todavía no conectado.'); }}>
          <Field>Teléfono<input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+54 9 11 1234 5678" autoComplete="tel" /></Field>
          <Submit type="submit">Enviarme un código</Submit>
          <BackLink type="button" onClick={resetMethod}>Volver a las otras opciones</BackLink>
        </Form>
      ) : null}
    </Card></Layout></Screen>;
}
