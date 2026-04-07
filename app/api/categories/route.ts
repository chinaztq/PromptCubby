import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const categories = db.prepare(`
      SELECT c.*, COUNT(p.id) as prompt_count
      FROM categories c
      LEFT JOIN prompts p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.sort_order, c.id
    `).all();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const { name, emoji, icon } = await request.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    const maxOrder = (db.prepare('SELECT MAX(sort_order) as m FROM categories').get() as { m: number }).m || 0;
    const result = db.prepare(
      'INSERT INTO categories (name, emoji, icon, sort_order) VALUES (?, ?, ?, ?)'
    ).run(name, emoji || '📋', icon || 'file', maxOrder + 1);
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(cat, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
