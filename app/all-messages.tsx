import { Redirect } from 'expo-router';

// Redirect old standalone messages to the new tab route
export default function AllMessagesRedirect() {
  return <Redirect href="/(tabs)/messages" />;
}
