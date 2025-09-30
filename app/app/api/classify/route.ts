import { NextResponse } from "next/server";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Lire le buffer du fichier
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Charger l’image avec canvas
    const { Image } = require("canvas");
    const img = new Image();
    img.src = buffer;

    // Charger MobileNet
    const model = await mobilenet.load();

    // Classifier l’image
    const predictions = await model.classify(img);

    return NextResponse.json({ predictions });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
