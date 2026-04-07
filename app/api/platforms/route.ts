import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const platforms = db.prepare('SELECT * FROM platforms ORDER BY id').all();
    return NextResponse.json(platforms);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch platforms' }, { status: 500 });
  }
}
