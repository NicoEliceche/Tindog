'use client';

import { useWebApp, webMyPets } from '@core/providers/WebAppProvider';
import { ArrowLeft, BarChart3, CalendarDays, Dumbbell, Edit3, Heart, Lightbulb, ShieldCheck, Stethoscope } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Page, Top, DesktopLayout, MainColumn, SideColumn, Hero, Grid, Stat, Next, Tip,
} from './BreedingDashboardScreenStyled';

export function BreedingDashboardScreen({ petId }: { petId: string }) {
  const router = useRouter();
  const { appointments } = useWebApp();
  const pet = webMyPets.find((item) => item.id === petId) ?? webMyPets[0];
  const next = appointments.find((item) => item.status === 'scheduled' && item.petNames.includes(pet.name));
  const docs = (pet.paper_types?.length ?? 0) + (pet.health_records?.length ?? 0);

  return (
    <Page>
      <Top>
        <button onClick={() => router.back()} aria-label="Volver"><ArrowLeft /></button>
        <h1>Panel de mascota</h1>
        <button aria-label="Editar mascota"><Edit3 size={19} /></button>
      </Top>

      <Hero>
        <img src={pet.photos[0]} alt={pet.name} />
        <div className="copy">
          <small>PANEL DE {pet.name.toUpperCase()}</small>
          <h2>{pet.name}</h2>
          <p>{pet.breed} · {pet.age} años · {pet.weight} kg</p>
          <span className="verified"><ShieldCheck size={13} /> Perfil y documentación verificados</span>
        </div>
      </Hero>

      <DesktopLayout>
        <MainColumn>
          <Grid>
            <Stat>
              <div className="top"><strong>Conexiones</strong><Heart size={18} /></div>
              <b>8</b>
              <p>2 nuevas esta semana</p>
            </Stat>
            <Stat>
              <div className="top"><strong>Actividad</strong><Dumbbell size={18} /></div>
              <b>4/5</b>
              <p>Paseos completados</p>
            </Stat>
            <Stat>
              <div className="top"><strong>Compatibilidad</strong><BarChart3 size={18} /></div>
              <b>{pet.coi_percentage}%</b>
              <p>COI estimado · bajo</p>
            </Stat>
            <Stat>
              <div className="top"><strong>Salud</strong><Stethoscope size={18} /></div>
              <b>{docs}</b>
              <p>Controles y documentos</p>
            </Stat>
          </Grid>
        </MainColumn>

        <SideColumn>
          <Next onClick={() => next && router.push(`/appointments/location?appointment=${next.id}`)}>
            <span className="icon"><CalendarDays size={21} /></span>
            <span className="copy">
              <small>{next ? 'PRÓXIMA CITA' : 'SIGUIENTE PASO'}</small>
              <strong>{next ? `${next.petNames.join(' + ')} · ${new Date(next.startAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}` : 'Completá el control veterinario'}</strong>
              <p>{next?.location.name ?? 'Mantener los estudios al día mejora conexiones responsables.'}</p>
            </span>
          </Next>
          <Tip>
            <Lightbulb size={20} />
            <span><strong>Consejo Tindog:</strong> compartí estudios de salud antes de coordinar una cruza.</span>
          </Tip>
        </SideColumn>
      </DesktopLayout>
    </Page>
  );
}
