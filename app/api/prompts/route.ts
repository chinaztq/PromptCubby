import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: Request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const categoryId = searchParams.get('category_id');

    let sql = `
      SELECT p.*, c.name as category_name, c.emoji as category_emoji, c.icon as category_icon,
        (SELECT COUNT(*) FROM variables v WHERE v.prompt_id = p.id) as variable_count
      FROM prompts p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (categoryId && categoryId !== 'all') {
      sql += ' AND p.category_id = ?';
      params.push(Number(categoryId));
    }

    if (q) {
      sql += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.content LIKE ? OR c.name LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }

    sql += ' ORDER BY p.updated_at DESC';

    const prompts = db.prepare(sql).all(...params) as any[];

    // Attach platforms
    const getPlatforms = db.prepare(`
      SELECT pl.* FROM platforms pl
      JOIN prompt_platforms pp ON pp.platform_id = pl.id
      WHERE pp.prompt_id = ?
    `);

    const result = prompts.map(p => ({
      ...p,
      platforms: getPlatforms.all(p.id),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { title, description, content, category_id, platform_ids, variables } = body;

    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    if (!content) return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    if (!category_id) return NextResponse.json({ error: 'Category is required' }, { status: 400 });

    const createPrompt = db.transaction(() => {
      const result = db.prepare(
        'INSERT INTO prompts (title, description, content, category_id) VALUES (?, ?, ?, ?)'
      ).run(title, description || '', content, category_id);
      const promptId = result.lastInsertRowid as number;

      if (platform_ids?.length) {
        const insertPP = db.prepare('INSERT INTO prompt_platforms (prompt_id, platform_id) VALUES (?, ?)');
        platform_ids.forEach((pid: number) => insertPP.run(promptId, pid));
      }

      if (variables?.length) {
        const insertVar = db.prepare(`
          INSERT INTO variables (prompt_id, name, hint, type, options, default_value, required, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        variables.forEach((v: any, i: number) => {
          insertVar.run(promptId, v.name, v.hint || '', v.type || 'text', v.options || null, v.default_value || '', v.required ? 1 : 0, i);
        });
      }

      return promptId;
    });

    const promptId = createPrompt();
    const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(promptId);
    return NextResponse.json(prompt, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}
