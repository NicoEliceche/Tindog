import { BreedingDashboardScreen } from '@/features/pets/screens/BreedingDashboardScreen';

export function generateStaticParams() {
  return [{ id: 'mine-1' }, { id: 'mine-2' }, { id: '1' }, { id: '2' }, { id: '3' }];
}

export default function BreedingPage({ params }: { params: { id: string } }) {
  return <BreedingDashboardScreen petId={params.id} />;
}
