import { buildOrderWhatsappMessage } from "../utils/orderMessage.js";

export const sendWhatsappNotification = async (order) => {
  const apiBaseUrl = process.env.WHATSAPP_API_BASE_URL;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const notifyTo = process.env.WHATSAPP_NOTIFY_TO;

  if (!apiBaseUrl || !phoneNumberId || !accessToken || !notifyTo) {
    return { status: "skipped", reason: "WhatsApp environment variables are missing." };
  }

  const response = await fetch(`${apiBaseUrl}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: notifyTo,
      type: "text",
      text: {
        preview_url: false,
        body: buildOrderWhatsappMessage(order),
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`WhatsApp notification failed: ${await response.text()}`);
  }

  return { status: "sent" };
};
