import Razorpay from "razorpay";

export default async function handler(req, res) {
  const razorpay = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
  });

  const order = await razorpay.orders.create({
    amount: req.body.total * 100,
    currency: "INR"
  });

  res.json(order);
}