"use client";
import { useEffect, useRef, useState } from "react";
type Pred = { className: string; probability: number };

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [preds, setPreds] = useState<Pred[] | null>(null);
  const [serverResp, setServerResp] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [model, setModel] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const tf = await import("@tensorflow/tfjs");
      await tf.ready();
      const mobilenet = await import("@tensorflow-models/mobilenet");
      const m = await mobilenet.load({ version: 2, alpha: 1.0 });
      setModel(m);
    })();
  }, []);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] || null;
    setFile(f); setPreds(null); setServerResp(null);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function classifyClient() {
    if (!model || !imgRef.current) return null;
    const top = (await model.classify(imgRef.current, 5)) as Pred[];
    setPreds(top);
    return top;
  }

  async function sendToServer(withLabels: Pred[] | null) {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    if (withLabels) fd.append("labels", JSON.stringify(withLabels));
    const res = await fetch("/api/classify", { method: "POST", body: fd });
    const json = await res.json(); setServerResp(json);
  }

  async function handleAnalyze() {
    if (!file) return;
    setLoading(true);
    try { const top = await classifyClient(); await sendToServer(top); }
    catch { setServerResp({ ok:false, error:"Erreur d'analyse" }); }
    finally { setLoading(false); }
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1>📦 CustomsVision Pro — Démo</h1>
      <p>Charge une image puis clique « Analyser ». Les prédictions s’affichent et sont envoyées au serveur.</p>
      <input type="file" accept="image/*" onChange={onPick} />

      {preview && (
        <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
          <img ref={imgRef} src={preview} alt="preview" style={{ maxWidth: 320, borderRadius: 8, border: "1px solid #eee" }} />
          <div style={{ flex: 1 }}>
            <button onClick={handleAnalyze} disabled={!file || !model || loading} style={{ padding: "10px 16px" }}>
              {loading ? "Analyse…" : "Analyser l’image"}
            </button>

            {preds && (
              <div style={{ marginTop: 16 }}>
                <h3>Prédictions (client)</h3>
                <ol>{preds.map((p,i)=><li key={i}>{p.className} — {(p.probability*100).toFixed(1)}%</li>)}</ol>
              </div>
            )}

            {serverResp && (
              <div style={{ marginTop: 16 }}>
                <h3>Réponse serveur</h3>
                <pre style={{ background:"#f6f6f6", padding:12, borderRadius:8 }}>{JSON.stringify(serverResp, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
