import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from "./src/Navigation";
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';

export default function App() {
  const theme = useColorScheme();
  const isDarkMode = theme === "dark";

  return (
    <SafeAreaProvider>
      <Navigation theme = {isDarkMode ? DarkTheme : DefaultTheme}/>
    </SafeAreaProvider>
  );
}