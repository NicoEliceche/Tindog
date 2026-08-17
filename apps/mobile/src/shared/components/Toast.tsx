import { Ionicons } from '@expo/vector-icons';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../../core/providers/AppPreferencesProvider';
import type { AppTheme } from '../../core/theme/tokens';

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

const ICON: Record<ToastTone, keyof typeof Ionicons.glyphMap> = {
  info: 'information-circle-outline',
  success: 'checkmark-circle-outline',
  error: 'close-circle-outline',
};

/**
 * Avisos breves, equivalentes a los de la web para que la experiencia sea la
 * misma en las dos plataformas. Reemplazan a `Alert.alert`, que abre un
 * cuadro del sistema, interrumpe y no sigue la identidad de la aplicación.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

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
      duration: input.duration ?? 5000,
    };
    setToasts((current) => [...current, toast]);
    if (toast.duration > 0) setTimeout(() => dismiss(id), toast.duration);
  }, [dismiss]);

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <View pointerEvents="box-none" style={[styles.stack, { top: insets.top + 10 }]}>
        {toasts.map((toast) => (
          <Animated.View
            key={toast.id}
            entering={FadeInDown.duration(220)}
            exiting={FadeOut.duration(160)}
            style={[
              styles.item,
              toast.tone === 'error' && { borderColor: theme.colors.danger },
            ]}
          >
            <Ionicons
              name={ICON[toast.tone]}
              size={20}
              color={toast.tone === 'error' ? theme.colors.danger : theme.colors.primary}
            />
            <View style={styles.copy}>
              <Text style={styles.title}>{toast.title}</Text>
              {toast.body ? <Text style={styles.body}>{toast.body}</Text> : null}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cerrar aviso"
              onPress={() => dismiss(toast.id)}
              hitSlop={8}
            >
              <Ionicons name="close" size={18} color={theme.colors.textMuted} />
            </Pressable>
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): (input: ToastInput) => void {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast necesita estar dentro de ToastProvider');
  return context;
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    stack: {
      position: 'absolute',
      left: 12,
      right: 12,
      gap: 8,
      zIndex: 4000,
    },
    item: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 13,
      borderRadius: 18,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: '#000',
      shadowOpacity: 0.3,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    copy: { flex: 1, minWidth: 0 },
    title: { color: theme.colors.text, fontSize: 14, fontWeight: '900' },
    body: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 17, marginTop: 2 },
  });
}
