let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* SAVE CART */
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* ADD TO CART */
function addToCart(p) {

  let existing = cart.find(i => String(i.id) === String(p.id));

  if (existing) {
    existing.qty += 1;
  } else {
    p.qty = 1;
    cart.push(p);
  }

  saveCart();

  showCartPopup();
}


/* SHOW CART POPUP */
function showCartPopup() {

  cart = JSON.parse(localStorage.getItem("cart")) || [];

  const drawer = document.getElementById("cart-drawer");

  const items = document.getElementById("drawer-items");

  items.innerHTML = "";

  let total = 0;

  cart.forEach(item => {

    total += item.price * item.qty;

    items.innerHTML += `

      <div class="drawer-item">

        <img src="${item.image}" class="drawer-img">

        <div class="drawer-info">

          <h4>${item.name}</h4>

          <p>₹${item.price}</p>

          <div class="qty-row">

            <button class="qty-btn" onclick="decreaseQty('${item.id}')">
              -
            </button>

            <span>${item.qty}</span>

            <button class="qty-btn" onclick="increaseQty('${item.id}')">
              +
            </button>

          </div>

        </div>

      </div>

    `;
  });

  document.getElementById("drawer-total").innerText = total;

  drawer.classList.remove("hidden");
}


/* CLOSE DRAWER */
function closeDrawer() {

  document
    .getElementById("cart-drawer")
    .classList.add("hidden");
}


/* GO TO CART */
function goToCart() {

  window.location.href = "cart.html";
}


/* INCREASE QTY */
function increaseQty(id) {

  cart = JSON.parse(localStorage.getItem("cart")) || [];

  let item = cart.find(i => String(i.id) === String(id));

  if (item) {
    item.qty += 1;
  }

  saveCart();

  showCartPopup();
}


/* DECREASE QTY */
function decreaseQty(id) {

  cart = JSON.parse(localStorage.getItem("cart")) || [];

  let item = cart.find(i => String(i.id) === String(id));

  if (!item) return;

  item.qty -= 1;

  if (item.qty <= 0) {
    cart = cart.filter(i => String(i.id) !== String(id));
  }

  saveCart();

  showCartPopup();
}


/* LOAD PRODUCTS */
async function loadProducts() {

  const { data, error } = await supabaseClient
    .from("products")
    .select("*");

  if (error) {
    console.log(error);
    return;
  }

  const el = document.getElementById("products");

  el.innerHTML = "";

  data.forEach(p => {

    el.innerHTML += `

      <div class="card">

        <img src="${p.image}">

        <h3>${p.name}</h3>

        <p>${p.description}</p>

        <p class="price">₹${p.price}</p>

        ${
          p.has_variants
          ? `
            <button class="btn variant-btn">
              Choose options
            </button>
          `
          : `
            <button
              class="btn"
              onclick='addToCart(${JSON.stringify(p)})'
            >
              Add to Cart
            </button>
          `
        }

      </div>

    `;
  });
}

loadProducts();


/* GLOBAL */
window.addToCart = addToCart;
window.closeDrawer = closeDrawer;
window.goToCart = goToCart;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;