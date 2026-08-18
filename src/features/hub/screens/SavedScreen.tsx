'use client';

import { useRouter } from 'next/navigation';

import { useWebApp, type WebSavedPet } from '@core/providers/WebAppProvider';
import { BookmarkX } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DEFAULT_FILTERS, FilterBar, monthLabel, withinRange, type FilterState,
} from '../components/FilterBar';
import { MonthHeading } from '../components/FilterBarStyled';
import {
  BackButton,
  Page, Shell, Header, Section, Grid, Card, Thumb, Copy, Row, Action, Empty,
} from './HubStyled';

/**
 * Perfiles guardados desde Discovery.
 *
 * El botón "Guardar" existía en Discovery desde antes y prometía que se
 * podría "volver a ver desde favoritos", pero descartaba la mascota sin
 * guardarla en ningún lado. Esta pantalla es el destino que faltaba.
 */
export function SavedScreen() {
  const router = useRouter();
  const { savedPets, unsavePet, sendRequest, restorePet } = useWebApp();
  const [sent, setSent] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const groups = useMemo(() => {
    const needle = filters.query.trim().toLowerCase();
    const visible = savedPets
      .filter((item) => {
        if (!withinRange(new Date(item.savedAt), filters.range)) return false;
        if (!needle) return true;
        return `${item.pet.name} ${item.pet.breed}`.toLowerCase().includes(needle);
      })
      .sort((a, b) => {
        const diff = new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime();
        return filters.order === 'recent' ? diff : -diff;
      });

    // Agrupado por mes: con muchas guardadas, la fecha sola no ubica.
    const byMonth = new Map<string, WebSavedPet[]>();
    for (const item of visible) {
      const key = monthLabel(new Date(item.savedAt));
      byMonth.set(key, [...(byMonth.get(key) ?? []), item]);
    }
    return Array.from(byMonth.entries());
  }, [savedPets, filters]);

  const connect = (id: string) => {
    const saved = savedPets.find((item) => item.pet.id === id);
    if (!saved) return;
    sendRequest(saved.pet);
    setSent((current) => [...current, id]);
  };

  return (
    <Page>
      <Shell>
        <Header>
          <BackButton onClick={() => router.back()}>← Volver</BackButton>
          <h1>Guardados</h1>
          <p>Los perfiles que apartaste para decidir con calma. Podés enviarles una solicitud o devolverlos al mazo.</p>
        </Header>

        <FilterBar value={filters} onChange={setFilters} placeholder="Buscar por nombre o raza" />

        <Section>
          {groups.length > 0 ? groups.map(([month, items]) => (
            <div key={month}>
              <MonthHeading>{month}</MonthHeading>
              <Grid>
                {items.map(({ pet, savedAt }: WebSavedPet) => (
                  <Card key={pet.id}>
                    <Thumb><img src={pet.photos[0]} alt={pet.name} /></Thumb>
                    <Copy>
                      <strong>{pet.name} · {pet.age}</strong>
                      <p>
                        {pet.breed} · guardado el{' '}
                        {new Date(savedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      </p>
                    </Copy>
                    <Row>
                      <Action $variant="primary" onClick={() => connect(pet.id)} disabled={sent.includes(pet.id)}>
                        {sent.includes(pet.id) ? 'Enviada' : 'Conectar'}
                      </Action>
                      <Action
                        $variant="ghost"
                        onClick={() => { restorePet(pet); unsavePet(pet.id); }}
                        title="Devolver al mazo de Discovery"
                      >
                        Al mazo
                      </Action>
                    </Row>
                  </Card>
                ))}
              </Grid>
            </div>
          )) : (
            <Empty>
              <BookmarkX size={30} />
              <p>
                {savedPets.length === 0
                  ? 'Todavía no guardaste ningún perfil. Usá el botón Guardar en Discovery.'
                  : 'Ningún perfil guardado coincide con la búsqueda.'}
              </p>
            </Empty>
          )}
        </Section>
      </Shell>
    </Page>
  );
}
