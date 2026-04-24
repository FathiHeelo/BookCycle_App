import { Redirect } from 'expo-router';

// Redirect old standalone requests to the new tab route
export default function MyRequestsRedirect() {
  return <Redirect href="../(tabs)/my-requests" />;
}
