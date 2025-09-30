import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const labels = formData.get("labels") as string | null;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file uploaded" }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      received: { name: file.name, size: file.size, type: file.type },
      labels: labels ? JSON.parse(labels) : null,
      note: "Upload OK. La classification est faite côté navigateur."
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
