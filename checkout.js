let cart =
  JSON.parse(localStorage.getItem("cart")) || [];

const itemsEl =
  document.getElementById("checkout-items");

let total = 0;

itemsEl.innerHTML = "";

cart.forEach(item => {

  const itemTotal =
    item.price * item.qty;

  total += itemTotal;

  itemsEl.innerHTML += `

    <div class="checkout-item">

      <img
        src="${item.image}"
        class="checkout-item-img"
      >

      <div class="checkout-item-info">

        <h3>${item.name}</h3>

        ${
          item.variantName
          ? `
            <p class="checkout-variant">
              ${item.variantName}
            </p>
          `
          : ""
        }

        <p>
          Qty: ${item.qty}
        </p>

        <p class="checkout-item-price">
          ₹${itemTotal}
        </p>

      </div>

    </div>

  `;
});

document.getElementById(
  "checkout-total"
).innerText = total;