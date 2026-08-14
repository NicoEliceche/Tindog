// src/shared/components/ui/Modal.tsx
'use client';

import React from 'react';
import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { motion as motionTokens } from '@core/theme/motion';
import { IconButton } from './IconButton';
import { Backdrop, ModalCard, ModalHeader, ModalTitle } from './ModalStyled';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  const reduceMotion = useReducedMotion();
  const transition = { duration: reduceMotion ? 0 : motionTokens.duration.base, ease: motionTokens.easing.standard };

  return (
    <AnimatePresence>
      {open && (
        <Backdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          onClick={onClose}
        >
          <ModalCard
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: reduceMotion ? 1 : 0.96, y: reduceMotion ? 0 : 12 }}
            transition={transition}
            onClick={(event) => event.stopPropagation()}
          >
            {title && (
              <ModalHeader>
                <ModalTitle>{title}</ModalTitle>
                <IconButton icon={X} label="Cerrar" onClick={onClose} size="sm" />
              </ModalHeader>
            )}
            {children}
          </ModalCard>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}
