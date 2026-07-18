import { BreedingDashboardScreen } from '@/features/pets/screens/BreedingDashboardScreen';

export default function BreedingPage({ params }: { params: { id: string } }) {
  return <BreedingDashboardScreen petId={params.id} />;
}
