import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}><StatusBar style="auto"/><Text style={{ fontSize: 28, fontWeight: "700" }}>CHAT FINI</Text><Text style={{ marginTop: 8, color: "#667085" }}>Communication unifiée.</Text></View>;
}
