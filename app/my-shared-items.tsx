import { Redirect } from 'expo-router';

// Redirect old standalone shared items to the new tab route
export default function MySharedItemsRedirect() {
  return <Redirect href="/(tabs)/my-shared-items" />;
}
