"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/classify", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(JSON.stringify(data, null, 2));
    setLoading(false);
  };

  return (
    <main style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>📦 CustomsVision</h1>
      <p>Charge une photo de produit, et l’IA propose un code HS.</p>

      <input type="file" accept="image/*" onChange={handleFileChange} />

      {preview && (
        <div style={{ margin: "20px 0" }}>
          <img src={preview} alt="preview" width="200" />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || loading}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        {loading ? "Analyse en cours..." : "Analyser l’image"}
      </button>

      {result && (
        <pre
          style={{
            marginTop: 20,
            padding: 10,
            background: "#f0f0f0",
            borderRadius: 5,
          }}
        >
          {result}
        </pre>
      )}
    </main>
  );
}
