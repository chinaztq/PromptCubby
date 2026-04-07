import { NextResponse } from "next/server";
import getDb from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const db = getDb();
    const prompt = db.prepare(`
      SELECT p.*, c.name as category_name, c.emoji as category_emoji, c.icon as category_icon
      FROM prompts p LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = ?
    `).get(Number(id)) as any;

    if (!prompt) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const platforms = db.prepare(`
      SELECT pl.* FROM platforms pl
      JOIN prompt_platforms pp ON pp.platform_id = pl.id
      WHERE pp.prompt_id = ?
    `).all(prompt.id);

    const variables = db.prepare(
      "SELECT * FROM variables WHERE prompt_id = ? ORDER BY sort_order"
    ).all(prompt.id);

    return NextResponse.json({ ...prompt, platforms, variables });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch prompt" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const numId = Number(id);
    const db = getDb();
    const body = await request.json();
    const { title, description, content, category_id, platform_ids, variables } = body;

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

    const updatePrompt = db.transaction(() => {
      db.prepare(`
        UPDATE prompts SET title=?, description=?, content=?, category_id=?,
        updated_at=CURRENT_TIMESTAMP WHERE id=?
      `).run(title, description || "", content, category_id, numId);

      db.prepare("DELETE FROM prompt_platforms WHERE prompt_id = ?").run(numId);
      if (platform_ids?.length) {
        const insertPP = db.prepare("INSERT INTO prompt_platforms (prompt_id, platform_id) VALUES (?, ?)");
        platform_ids.forEach((pid: number) => insertPP.run(numId, pid));
      }

      db.prepare("DELETE FROM variables WHERE prompt_id = ?").run(numId);
      if (variables?.length) {
        const insertVar = db.prepare(`
          INSERT INTO variables (prompt_id, name, hint, type, options, default_value, required, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        variables.forEach((v: any, i: number) => {
          insertVar.run(numId, v.name, v.hint || "", v.type || "text", v.options || null, v.default_value || "", v.required ? 1 : 0, i);
        });
      }
    });

    updatePrompt();
    const prompt = db.prepare("SELECT * FROM prompts WHERE id = ?").get(numId);
    return NextResponse.json(prompt);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update prompt" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const db = getDb();
    db.prepare("DELETE FROM prompts WHERE id = ?").run(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 });
  }
}
