// src/app/pets/add/page.tsx
import { Suspense } from 'react';
import { PetFormScreen } from '@features/pets';

/**
 * El formulario lee `?petId` para saber si edita o da de alta, y
 * `useSearchParams` obliga a envolverlo en Suspense: sin esto la página no
 * se puede prerenderizar y el build falla.
 */
export default function PetAddPage() {
  return (
    <Suspense fallback={null}>
      <PetFormScreen />
    </Suspense>
  );
}
