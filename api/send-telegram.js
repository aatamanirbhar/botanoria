module.exports =
  async function handler(
    req,
    res
  ){

    try{

      const {
        customerName,
        customerPhone,
        customerEmail,
        customerAddress,
        finalTotal,
        paymentId,
        cart
      } = req.body;

      const itemsText =
        cart.map(item => `

• ${item.name}
  Qty: ${item.qty}

`).join("");

      const message = `

📦 NEW BOTANORIA ORDER

👤 ${customerName}

📞 ${customerPhone}

📧 ${customerEmail}

🏠 ${customerAddress}

━━━━━━━━━━

🛍 ITEMS

${itemsText}

━━━━━━━━━━

💰 Total:
₹${finalTotal}

🆔 Payment:
${paymentId}

`;

      await fetch(

        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,

        {

          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            chat_id:
              process.env
                .TELEGRAM_CHAT_ID,

            text:message
          })
        }
      );

      return res
        .status(200)
        .json({
          success:true
        });

    } catch(error){

      console.log(error);

      return res
        .status(500)
        .json({
          error:error.message
        });
    }
  };