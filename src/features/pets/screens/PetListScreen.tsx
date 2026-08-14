'use client';

import { webMyPets } from '@core/providers/WebAppProvider';
import { Plus, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { WebContent, WebHeading, WebScreen, WebSubtitle } from '@shared/components/layout/WebScreen';
import { Card } from '@shared/components/ui';
import { AddPetCard, Grid, PetCardBody, Verified } from './PetListScreenStyled';

export function PetListScreen() {
  const router = useRouter();

  return (
    <WebScreen>
      <WebContent>
        <div>
          <WebHeading>Mis perros</WebHeading>
          <WebSubtitle>Salud, compatibilidad, documentos y actividad en un solo panel.</WebSubtitle>
        </div>

        <Grid>
          {webMyPets.map((pet) => (
            <Card key={pet.id} padding="12px" interactive onClick={() => router.push(`/pets/${pet.id}/breeding`)}>
              <PetCardBody>
                <img src={pet.photos[0]} alt={pet.name} />
                <div className="body">
                  <h2>
                    {pet.name}
                    {pet.is_verified_breeder_pet ? <Verified><ShieldCheck size={12} /> Verificado</Verified> : null}
                  </h2>
                  <p className="meta">{pet.breed} · {pet.age} años</p>
                  <div className="chips">
                    {pet.personality_traits.slice(0, 2).map((trait) => (
                      <span key={trait}>{trait}</span>
                    ))}
                  </div>
                  <p className="status">{pet.breeding_preferences?.looking_for_pair ? 'Disponible para conectar' : 'Perfil en pausa'}</p>
                </div>
              </PetCardBody>
            </Card>
          ))}

          <AddPetCard onClick={() => router.push('/pets/add')}>
            <Plus size={19} /> Agregar mascota
          </AddPetCard>
        </Grid>
      </WebContent>
    </WebScreen>
  );
}
