import { NextResponse } from 'next/server';
import { serverState } from '../../../lib/store';

export const dynamic = 'force-dynamic';



// In-memory store for notifications (for demonstration purposes)
// In a real application, you would use a database like Firestore, PostgreSQL, etc.
let chatGroups = [
  {
    id: "WhatsApp-Mama",
    name: "Mama",
    appName: "WhatsApp",
    lastMessage: "Jangan lupa makan ya nak.",
    lastTime: new Date().toISOString(),
    unreadCount: 2,
    notifs: [
      { id: "1", message: "Halo nak", time: new Date().toISOString() },
      { id: "2", message: "Jangan lupa makan ya nak.", time: new Date().toISOString() }
    ]
  },
  {
    id: "SMS-Bank",
    name: "Bank BCA",
    appName: "SMS",
    lastMessage: "OTP Anda adalah 4921.",
    lastTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unreadCount: 1,
    notifs: [
      { id: "3", message: "OTP Anda adalah 4921. JANGAN BERIKAN KE SIAPAPUN.", time: new Date(Date.now() - 1000 * 60 * 5).toISOString() }
    ]
  }
];

export async function GET() {
  return NextResponse.json({ success: true, data: chatGroups });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { appName, message } = body;
    const sender = body.sender || body.title || "Unknown";

    if (!appName || !message) {
      return NextResponse.json({ success: false, error: "Missing required fields: appName, message" }, { status: 400 });
    }

    const groupId = `${appName}-${sender}`.replace(/\s+/g, '-');
    const existingGroupIndex = chatGroups.findIndex(g => g.id === groupId);
    const newNotif = {
      id: Date.now().toString(),
      message,
      time: new Date().toISOString()
    };

    if (existingGroupIndex >= 0) {
      // Update existing group
      chatGroups[existingGroupIndex].lastMessage = message;
      chatGroups[existingGroupIndex].lastTime = newNotif.time;
      chatGroups[existingGroupIndex].unreadCount += 1;
      chatGroups[existingGroupIndex].notifs.push(newNotif);
    } else {
      // Create new group
      chatGroups.push({
        id: groupId,
        name: sender,
        appName: appName,
        lastMessage: message,
        lastTime: newNotif.time,
        unreadCount: 1,
        notifs: [newNotif]
      });
    }

    // Sort groups by last time descending
    chatGroups.sort((a, b) => new Date(b.lastTime).getTime() - new Date(a.lastTime).getTime());

    // Forward to Telegram if configured
    const telegramToken = serverState.telegramToken;
    const telegramChatId = serverState.telegramChatId;

    if (telegramToken && telegramChatId) {
      const text = `*New Notif dari ${appName}*\n*${sender}*: \n${message}`;
      try {
        await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: text,
            parse_mode: 'Markdown'
          })
        });
      } catch (e) {
        console.error("Failed to forward to Telegram", e);
      }
    }

    return NextResponse.json({ success: true, message: "Notification mirrored", data: chatGroups }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }
}
