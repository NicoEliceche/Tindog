import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * { box-sizing: border-box; padding: 0; margin: 0; -webkit-tap-highlight-color: transparent; }
  /* Ocultar el desborde horizontal en html convierte al elemento raíz en
     contenedor de scroll, y eso anula el position:sticky de la barra
     lateral: sube con la página. Se aplica sólo en body, con clip, que
     recorta sin volverlo contenedor de scroll. */
  html { width: 100%; min-height: 100%; }
  /* Sin overflow-x en el body: aunque "clip" no crea contenedor de scroll,
     si crea bloque contenedor para position:fixed, y la barra inferior
     quedaba recortada junto con la tarjeta al arrastrarla fuera del borde.
     El recorte horizontal lo hace ahora el contenedor de la tarjeta. */
  body { width: 100%; min-height: 100%; max-width: 100vw; font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: ${({ theme }) => theme.color.background}; color: ${({ theme }) => theme.color.text}; }
  body { transition: background-color .2s ease, color .2s ease; }
  a { color: inherit; text-decoration: none; }
  button, input, textarea { font: inherit; }
  button { cursor: pointer; border: none; background: none; color: inherit; transition: opacity .18s ease, transform .18s ease; touch-action: manipulation; }
  button:active { transform: scale(.97); }
  button:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible { outline: 3px solid ${({ theme }) => theme.color.primaryFaded}; outline-offset: 2px; }
  ::selection { background: ${({ theme }) => theme.color.primary}; color: ${({ theme }) => theme.color.textInverse}; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: ${({ theme }) => theme.color.primaryFaded}; border-radius: 10px; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; transition-duration: .01ms !important; }
  }
`;
