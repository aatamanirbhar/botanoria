async function pay() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((a, b) => a + b.price * b.qty, 0);

  const res = await fetch("/api/create-order", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ total })
  });

  const order = await res.json();

  const options = {
    key: "YOUR_RAZORPAY_KEY",
    amount: order.amount,
    order_id: order.id,

    handler: async function (response) {
      await fetch("/api/verify-payment", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          ...response,
          cart,
          total,
          name: name.value,
          phone: phone.value,
          address: address.value
        })
      });

      alert("Order placed!");
      localStorage.removeItem("cart");
      window.location.href = "/";
    }
  };

  new Razorpay(options).open();
}