import { BreedingDashboardScreen } from '@/features/pets/screens/BreedingDashboardScreen';

export function generateStaticParams() {
  return [{ id: 'firulais' }, { id: 'mora' }, { id: 'mine-1' }, { id: 'mine-2' }];
}

export default async function BreedingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BreedingDashboardScreen petId={id} />;
}
