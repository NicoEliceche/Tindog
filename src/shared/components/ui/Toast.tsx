'use client';

import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Stack, Item, Copy, Close } from './ToastStyled';

export type ToastTone = 'info' | 'success' | 'error';

export interface ToastInput {
  title: string;
  body?: string;
  tone?: ToastTone;
  /** Milisegundos hasta cerrarse solo. 0 lo deja hasta que se cierre a mano. */
  duration?: number;
}

interface Toast extends Required<Omit<ToastInput, 'body'>> {
  id: number;
  body?: string;
}

const ToastContext = createContext<((input: ToastInput) => void) | null>(null);

const ICON: Record<ToastTone, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  error: XCircle,
};

/**
 * Avisos breves que no interrumpen. Reemplazan a `alert()`, que bloquea la
 * pestaña entera y se ve como un cuadro del navegador, ajeno a la aplicación.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const reduceMotion = useReducedMotion();

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const show = useCallback((input: ToastInput) => {
    const id = nextId.current;
    nextId.current += 1;
    const toast: Toast = {
      id,
      title: input.title,
      body: input.body,
      tone: input.tone ?? 'info',
      // Diez segundos: cinco daban justo para leer un aviso con cuerpo.
      duration: input.duration ?? 10000,
    };
    setToasts((current) => [...current, toast]);
    if (toast.duration > 0) {
      window.setTimeout(() => dismiss(id), toast.duration);
    }
  }, [dismiss]);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Stack aria-live="polite" aria-atomic="false">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon = ICON[toast.tone];
            return (
              <Item
                key={toast.id}
                $tone={toast.tone}
                role="status"
                initial={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                transition={reduceMotion ? { duration: 0.12 } : { type: 'spring', stiffness: 420, damping: 32 }}
              >
                <Icon size={18} />
                <Copy $tone={toast.tone}>
                  <strong>{toast.title}</strong>
                  {toast.body ? <p>{toast.body}</p> : null}
                </Copy>
                <Close type="button" onClick={() => dismiss(toast.id)} aria-label="Cerrar aviso">
                  <X size={15} />
                </Close>
              </Item>
            );
          })}
        </AnimatePresence>
      </Stack>
    </ToastContext.Provider>
  );
}

export function useToast(): (input: ToastInput) => void {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast necesita estar dentro de ToastProvider');
  return context;
}
