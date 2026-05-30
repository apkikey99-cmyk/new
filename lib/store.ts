const globalAny: any = globalThis;
if (!globalAny.serverState) {
  globalAny.serverState = {
    telegramToken: process.env.TELEGRAM_BOT_TOKEN || "",
    telegramChatId: process.env.TELEGRAM_CHAT_ID || ""
  };
}
export const serverState = globalAny.serverState;
