let cart = JSON.parse(localStorage.getItem("cart")) || [];

const el = document.getElementById("cart-items");

function renderCart() {

  el.innerHTML = "";

  let total = 0;

  cart.forEach(item => {

    total += item.price * item.qty;

    el.innerHTML += `

      <div class="cart-card">

        <img src="${item.image}" class="cart-img">

        <div class="cart-info">

          <h3>${item.name}</h3>

          <p>₹${item.price}</p>

          <div class="qty-row">

      <button
  class="qty-btn"
  onclick="decreaseQty('${item.id}')"
>
  -
</button>

<span>${item.qty}</span>

<button
  class="qty-btn"
  onclick="increaseQty('${item.id}')"
>
  +
</button>

          </div>

        </div>

      </div>

    `;
  });

  document.getElementById("total").innerText = total;
}

function increaseQty(id) {

  cart = JSON.parse(localStorage.getItem("cart")) || [];

  let item = cart.find(i => String(i.id) === String(id));

  if (item) {
    item.qty += 1;
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();
}

function decreaseQty(id) {

  cart = JSON.parse(localStorage.getItem("cart")) || [];

  let item = cart.find(i => String(i.id) === String(id));

  if (!item) return;

  item.qty -= 1;

  if (item.qty <= 0) {
    cart = cart.filter(i => String(i.id) !== String(id));
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  renderCart();
}

function goToCheckout() {
  window.location.href = "checkout.html";
}

renderCart();


window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.goToCheckout = goToCheckout;