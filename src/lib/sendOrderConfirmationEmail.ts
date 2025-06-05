import emailjs from "@emailjs/browser";

type OrderConfirmationPayload = {
  name: string;
  email: string;
  orderUrl: string;
};

export async function sendOrderConfirmationEmail({
  name,
  email,
  orderUrl,
}: OrderConfirmationPayload) {
  try {
    const response = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        name,
        email, // este se usa como {{email}} en el template
        order_url: orderUrl,
      },
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    );

    console.log("✅ Email enviado:", response.status, response.text);
  } catch (err) {
    console.error("❌ Error al enviar el email:", err);
  }
}
