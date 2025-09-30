import { NextResponse } from "next/server";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

// Initialiser le modèle en mémoire (singleton)
let model: mobilenet.MobileNet | null = null;
async function loadModel() {
  if (!model) {
    model = await mobilenet.load();
  }
  return model;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Lire le fichier en ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Décoder l’image en tensor
    const image = tf.node.decodeImage(buffer);

    // Charger le modèle
    const model = await loadModel();

    // Prédire
    const predictions = await model.classify(image);

    return NextResponse.json({ predictions });
  } catch (error: any) {
    console.error("Classification error:", error);
    return NextResponse.json(
      { error: "Failed to classify image", details: error.message },
      { status: 500 }
    );
  }
}
