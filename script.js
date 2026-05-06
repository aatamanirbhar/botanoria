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
            <button
  class="btn variant-btn"
  onclick="openVariantModal('${p.id}')"
>
  Choose Options
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

async function getVariants(productId) {

  const { data, error } = await supabaseClient
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .eq("active", true);

  if (error) {
    console.log(error);
    return [];
  }

  return data;
}

loadProducts();

let selectedVariant = null;

async function openVariantModal(productId){

  const variants = await getVariants(productId);

  if(!variants.length) return;

  const { data: product } = await supabaseClient
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  document
    .getElementById("variant-modal")
    .classList
    .remove("hidden");

  document.getElementById("variant-title").innerText =
    product.name;

  document.getElementById("variant-image").src =
    product.image;

  selectedVariant = variants[0];

  document.getElementById("variant-price").innerText =
    `₹${selectedVariant.price}`;

  const options =
    document.getElementById("variant-options");

  options.innerHTML = "";

  variants.forEach((variant, index) => {

    const btn = document.createElement("button");

    btn.className = "variant-option";

    if(index === 0){
      btn.classList.add("active");
    }

    btn.innerText = variant.name;

    btn.onclick = () => {

      selectedVariant = variant;

      document.getElementById("variant-price").innerText =
        `₹${variant.price}`;

      document
        .querySelectorAll(".variant-option")
        .forEach(el =>
          el.classList.remove("active")
        );

      btn.classList.add("active");
    };

    options.appendChild(btn);
  });
}

function closeVariantModal(){

  document
    .getElementById("variant-modal")
    .classList
    .add("hidden");
}


/* GLOBAL */
window.addToCart = addToCart;
window.closeDrawer = closeDrawer;
window.goToCart = goToCart;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.openVariantModal = openVariantModal;
window.openVariantModal = openVariantModal;

window.closeVariantModal = closeVariantModal;