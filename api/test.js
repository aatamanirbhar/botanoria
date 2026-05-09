console.log("API FILE LOADED")

export default function handler(req, res) {
  console.log("ROUTE HIT")

  res.status(200).send("working")
}