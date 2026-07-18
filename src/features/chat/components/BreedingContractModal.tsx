'use client';

import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, FileText, CheckCircle } from 'lucide-react';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled(motion.div)`
  background: white;
  width: 100%;
  max-width: 450px;
  border-radius: 2rem;
  padding: 2rem;
  position: relative;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 1rem;
`;

const ContractBody = styled.div`
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 1rem;
  border: 1px dashed #ccc;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #444;
  margin-bottom: 1.5rem;
`;

const Term = styled.div`
  margin-bottom: 12px;
  display: flex;
  gap: 8px;
`;

const Button = styled(motion.button)<{ variant?: 'primary' | 'secondary' }>`
  width: 100%;
  height: 56px;
  background: ${({ variant, theme }) => variant === 'secondary' ? '#eee' : theme.color.primary};
  color: ${({ variant }) => variant === 'secondary' ? '#333' : 'white'};
  border-radius: 1.2rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
`;

interface ContractProps {
  isOpen: boolean;
  onClose: () => void;
  pet1Name: string;
  pet2Name: string;
  onSign: () => void;
}

export const BreedingContractModal: React.FC<ContractProps> = ({ 
  isOpen, 
  onClose, 
  pet1Name, 
  pet2Name,
  onSign 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Modal
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px' }}>
              <X size={24} color="#888" />
            </button>

            <Title>
              <ShieldCheck color="#4CAF50" size={32} />
              Contrato de Cruza
            </Title>

            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1.5rem' }}>
              Estás por formalizar el acuerdo de cruza para <strong>{pet1Name}</strong> y <strong>{pet2Name}</strong>.
            </p>

            <ContractBody>
              <Term>
                <FileText size={18} color="#FF6B6B" />
                <div>
                  <strong>Términos:</strong> Se acuerda la cruza bajo términos de "Elección de Cachorro" (Pick of the Litter) para el dueño del macho.
                </div>
              </Term>
              <Term>
                <CheckCircle size={18} color="#4CAF50" />
                <div>
                  <strong>Salud:</strong> Ambas partes confirman que las mascotas tienen sus vacunas al día y no presentan enfermedades infectocontagiosas.
                </div>
              </Term>
              <div style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.8rem' }}>
                * Este es un acuerdo digital preliminar. Tindog recomienda la firma de un documento físico legal durante el encuentro.
              </div>
            </ContractBody>

            <Button onClick={onSign} whileTap={{ scale: 0.95 }}>
              <ShieldCheck size={20} /> Firmar Digitalmente
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};
