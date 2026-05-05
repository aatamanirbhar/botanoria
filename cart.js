let cart = JSON.parse(localStorage.getItem("cart")) || [];
let total = 0;

cart.forEach(i => {
  document.getElementById("cart").innerHTML += 
    `<p>${i.name} x${i.qty} - ₹${i.price * i.qty}</p>`;

  total += i.price * i.qty;
});

document.getElementById("total").innerText = "Total ₹" + total;

if (total < 600) {
  document.getElementById("shipping").innerText =
    `Add ₹${600 - total} more for FREE shipping`;
} else {
  document.getElementById("shipping").innerText =
    "Free shipping unlocked 🎉";
}