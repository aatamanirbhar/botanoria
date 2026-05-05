import crypto from "crypto";

export default async function handler(req, res) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    cart,
    total,
    name,
    phone,
    address
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return res.status(400).send("Invalid payment");
  }

  await fetch(process.env.SUPABASE_URL + "/rest/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": process.env.SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
    },
    body: JSON.stringify({
      name,
      phone,
      address,
      items: cart,
      total,
      payment_id: razorpay_payment_id,
      status: "paid"
    })
  });

  res.json({ success: true });
}