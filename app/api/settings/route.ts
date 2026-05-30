import { NextResponse } from 'next/server';
import { serverState } from '../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ success: true, data: serverState });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.telegramToken !== undefined) serverState.telegramToken = body.telegramToken;
    if (body.telegramChatId !== undefined) serverState.telegramChatId = body.telegramChatId;
    return NextResponse.json({ success: true, message: "Settings saved", data: serverState });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
}
