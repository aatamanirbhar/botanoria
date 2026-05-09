module.exports = async function handler(req, res) {

  try {

    console.log("BOT TOKEN:", process.env.TELEGRAM_BOT_TOKEN)
    console.log("CHAT ID:", process.env.TELEGRAM_CHAT_ID)

    if (req.method !== "POST") {
      return res.status(405).json({
        error: "Method not allowed"
      })
    }

    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return res.status(500).json({
        error: "Missing environment variables"
      })
    }

    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body

    const message = body.telegramMessage

    if (!message) {
      return res.status(400).json({
        error: "Message is required"
      })
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message
        })
      }
    )

    const data = await telegramResponse.json()

    console.log("TELEGRAM RESPONSE:", data)

    return res.status(200).json(data)

  } catch (err) {

    console.error("TELEGRAM ERROR:", err)

    return res.status(500).json({
      error: err.message
    })

  }

}