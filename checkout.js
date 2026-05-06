let cart = JSON.parse(localStorage.getItem("cart")) || [];

let total = 0;

cart.forEach(item => {
  total += item.price * item.qty;
});

document.getElementById("checkout-total").innerText = total;