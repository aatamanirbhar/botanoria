let cart = JSON.parse(localStorage.getItem("cart")) || [];

function renderCart() {
  const container = document.getElementById("cart");
  const totalEl = document.getElementById("total");
  const shippingEl = document.getElementById("shipping");

  container.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.qty;

    container.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}">
        
        <div class="cart-info">
          <h4>${item.name}</h4>
          <p>₹${item.price}</p>

          <div class="qty">
            <button onclick="changeQty(${index}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${index}, 1)">+</button>
          </div>
        </div>
      </div>
    `;
  });

  totalEl.innerText = "Total ₹" + total;

  if (total < 600) {
    shippingEl.innerText = `Add ₹${600 - total} more for FREE shipping`;
  } else {
    shippingEl.innerText = "Free shipping unlocked 🎉";
  }

  localStorage.setItem("cart", JSON.stringify(cart));
}

function changeQty(index, change) {
  cart[index].qty += change;

  if (cart[index].qty <= 0) {
    cart.splice(index, 1);
  }

  renderCart();
}

renderCart();