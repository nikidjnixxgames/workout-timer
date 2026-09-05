import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text accessibilityRole="header" style={styles.title}>Workout Timer</Text>
      <Text style={styles.subtitle}>Основната структура е подготвена.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#111827",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#CBD5E1",
    textAlign: "center",
  },
});
