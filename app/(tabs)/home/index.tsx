import { useRouter } from 'expo-router';
import ParkingListScreen from './ParkingListScreen';

export default function HomeListScreen() {
  const router = useRouter();

  // We'll pass a navigation handler to ParkingListScreen
  return (
    <ParkingListScreen
      onParkingSelect={(parkingSpace) =>
        router.push({ pathname: '/(tabs)/home/detail', params: { id: parkingSpace.id } })
      }
    />
  );
}
