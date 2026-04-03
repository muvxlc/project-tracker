export const sendLineNotification = async (message: string, token: string) => {
  // Mock Line Notify
  console.log(`[LINE] Sending: ${message}`);
  // In production:
  // await $fetch('https://notify-api.line.me/api/notify', {
  //   method: 'POST',
  //   headers: { Authorization: `Bearer ${token}` },
  //   body: new URLSearchParams({ message })
  // });
};

export const sendDiscordNotification = async (message: string, webhookUrl: string) => {
  console.log(`[DISCORD] Sending: ${message}`);
  // await $fetch(webhookUrl, {
  //   method: 'POST',
  //   body: { content: message }
  // });
};

export const sendTelegramNotification = async (message: string, botToken: string, chatId: string) => {
  console.log(`[TELEGRAM] Sending: ${message}`);
  // await $fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
  //   method: 'POST',
  //   body: { chat_id: chatId, text: message }
  // });
};
