let cart = JSON.parse(localStorage.getItem("cart")) || [];
let total = 0;

const summary = document.getElementById("summary");

cart.forEach(i => {
  summary.innerHTML += `<p>${i.name} x${i.qty}</p>`;
  total += i.price * i.qty;
});

document.getElementById("total").innerText = "Total ₹" + total;

async function pay() {
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

      alert("Order placed successfully!");
      localStorage.removeItem("cart");
      window.location.href = "/";
    }
  };

  new Razorpay(options).open();
}