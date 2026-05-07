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
    email,
    address

  } = req.body;

  /* VERIFY PAYMENT */

  const body =
    razorpay_order_id +
    "|" +
    razorpay_payment_id;

  const expected =
    crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(body)
      .digest("hex");

  if(expected !== razorpay_signature){

    return res
      .status(400)
      .send("Invalid payment");
  }

  /* SAVE ORDER */

  await fetch(

    process.env.SUPABASE_URL +
    "/rest/v1/orders",

    {

      method:"POST",

      headers:{

        "Content-Type":
          "application/json",

        "apikey":
          process.env
            .SUPABASE_SERVICE_KEY,

        "Authorization":
          `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
      },

      body:JSON.stringify({

        name,
        phone,
        email,
        address,

        items:cart,

        total,

        payment_id:
          razorpay_payment_id,

        status:"paid"
      })
    }
  );

  /* TELEGRAM MESSAGE */

const telegramResponse =
  await fetch(

    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,

    {

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({

        chat_id:
          process.env.TELEGRAM_CHAT_ID,

        text:`

🛒 NEW ORDER

👤 Name: ${name}

📞 Phone: ${phone}

📧 Email: ${email}

🏠 Address: ${address}

💰 Total: ₹${total}

        `
      })
    }
  );

const telegramData =
  await telegramResponse.json();

console.log(
  "TELEGRAM:",
  telegramData
);

  return res
    .status(200)
    .json({
      success:true
    });
}