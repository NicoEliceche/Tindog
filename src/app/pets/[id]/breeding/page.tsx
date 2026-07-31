import { BreedingDashboardScreen } from '@/features/pets/screens/BreedingDashboardScreen';

export function generateStaticParams() {
  return [{ id: 'mine-1' }, { id: 'mine-2' }, { id: '1' }, { id: '2' }, { id: '3' }];
}

export default async function BreedingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BreedingDashboardScreen petId={id} />;
}
