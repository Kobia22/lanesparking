import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import ParkingDetailScreen from './ParkingDetailScreen';
import { fetchParkingSpaces } from '@/src/firebase/database';
import { View, ActivityIndicator, Button, Text } from 'react-native';
import type { ParkingSpace } from './ParkingListScreen';

export default function HomeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [parkingSpace, setParkingSpace] = useState<ParkingSpace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const spaces = await fetchParkingSpaces();
      const found = spaces.find((s) => s.id === id);
      setParkingSpace(found ?? null);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (!parkingSpace) return <View><Button title="Back" onPress={() => router.back()} /><Text>Parking space not found.</Text></View>;

  return (
    <>
      <Button title="Back" onPress={() => router.back()} />
      <ParkingDetailScreen parkingSpace={parkingSpace} />
    </>
  );
}
