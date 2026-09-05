import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, Vibration, View } from "react-native";

type Phase = "WORK" | "REST";
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function beep() {
  Vibration.vibrate([0, 180, 100, 180]);
  const C = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
  if (!C) return;
  const c = new C(), o = c.createOscillator(), g = c.createGain();
  o.frequency.value = 880; g.gain.setValueAtTime(0.18, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
  o.connect(g); g.connect(c.destination); o.start(); o.stop(c.currentTime + 0.35);
}

export default function App() {
  const [work, setWork] = useState("30"), [rest, setRest] = useState("15"), [rounds, setRounds] = useState("8");
  const [phase, setPhase] = useState<Phase>("WORK"), [round, setRound] = useState(1);
  const [left, setLeft] = useState(30), [running, setRunning] = useState(false), [finished, setFinished] = useState(false);
  const end = useRef<number | null>(null);
  const w = Math.max(1, Number(work) || 30), r = Math.max(1, Number(rest) || 15), total = Math.max(1, Number(rounds) || 8);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const next = Math.max(0, Math.ceil(((end.current ?? Date.now()) - Date.now()) / 1000));
      setLeft(next);
      if (next !== 0) return;
      beep();
      if (phase === "WORK" && round < total) { setPhase("REST"); setLeft(r); end.current = Date.now() + r * 1000; }
      else if (phase === "REST" && round < total) { setRound(x => x + 1); setPhase("WORK"); setLeft(w); end.current = Date.now() + w * 1000; }
      else { setRunning(false); setFinished(true); end.current = null; }
    }, 200);
    return () => clearInterval(id);
  }, [running, phase, round, total, w, r]);

  const reset = () => { end.current = null; setRunning(false); setFinished(false); setPhase("WORK"); setRound(1); setLeft(w); };
  const start = () => { if (finished) reset(); end.current = Date.now() + left * 1000; setFinished(false); setRunning(true); };

  return <SafeAreaView style={styles.safe}><StatusBar style="light" /><View style={styles.container}>
    <Text style={styles.title}>Workout Timer</Text>
    <Text style={[styles.phase, { color: phase === "WORK" ? "#22C55E" : "#F59E0B" }]}>{finished ? "COMPLETE" : phase}</Text>
    <Text style={styles.timer}>{fmt(left)}</Text>
    <Text style={styles.round}>{finished ? "Workout complete" : `Round ${round} of ${total}`}</Text>
    <View style={styles.settings}>
      <Setting label="Work (sec)" value={work} onChange={setWork} />
      <Setting label="Rest (sec)" value={rest} onChange={setRest} />
      <Setting label="Rounds" value={rounds} onChange={setRounds} />
    </View>
    <View style={styles.buttons}>
      <Pressable style={[styles.button, styles.start]} onPress={start}><Text style={styles.buttonText}>{finished ? "Start again" : running ? "Running" : "Start"}</Text></Pressable>
      <Pressable style={[styles.button, styles.pause]} onPress={() => { if (running) { setLeft(Math.max(0, Math.ceil(((end.current ?? Date.now()) - Date.now()) / 1000))); end.current = null; setRunning(false); } }}><Text style={styles.buttonText}>Pause</Text></Pressable>
      <Pressable style={[styles.button, styles.reset]} onPress={reset}><Text style={styles.buttonText}>Reset</Text></Pressable>
    </View>
  </View></SafeAreaView>;
}

function Setting({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <View style={styles.setting}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} keyboardType="number-pad" maxLength={4} value={value} onChangeText={onChange} style={styles.input} /></View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#111827" }, container: { flex: 1, alignItems: "center", padding: 24, paddingTop: 42 },
  title: { color: "#FFF", fontSize: 32, fontWeight: "800" }, phase: { fontSize: 22, fontWeight: "800", marginTop: 42, letterSpacing: 2 },
  timer: { color: "#FFF", fontSize: 76, fontWeight: "800", marginTop: 8 }, round: { color: "#CBD5E1", fontSize: 17, marginTop: 4 },
  settings: { width: "100%", maxWidth: 520, flexDirection: "row", gap: 10, marginTop: 42 }, setting: { flex: 1 },
  label: { color: "#94A3B8", fontSize: 12, marginBottom: 6, textAlign: "center" }, input: { backgroundColor: "#1F2937", borderColor: "#374151", borderRadius: 10, borderWidth: 1, color: "#FFF", fontSize: 19, padding: 12, textAlign: "center" },
  buttons: { width: "100%", maxWidth: 520, gap: 12, marginTop: 30 }, button: { alignItems: "center", borderRadius: 12, padding: 16 },
  start: { backgroundColor: "#16A34A" }, pause: { backgroundColor: "#334155" }, reset: { backgroundColor: "#7F1D1D" }, buttonText: { color: "#FFF", fontSize: 18, fontWeight: "700" }
});