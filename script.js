let cart = JSON.parse(localStorage.getItem("cart")) || [];

let selectedVariant = null;
let currentProduct = null;

/* SAVE CART */
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* ADD NORMAL PRODUCT TO CART */
function addToCart(product) {

  let existing = cart.find(item =>
    String(item.id) === String(product.id)
  );

  if (existing) {

    existing.qty += 1;

  } else {

    product.qty = 1;

    cart.push(product);
  }

  saveCart();

  showCartPopup();
}

/* ADD VARIANT TO CART */
function addVariantToCart(){

  if(!selectedVariant) return;

  let cart =
    JSON.parse(
      localStorage.getItem("cart")
    ) || [];

  const existingItem =
    cart.find(item =>
      item.variantId === selectedVariant.id
    );

  if(existingItem){

    existingItem.qty += 1;

  } else {

    cart.push({

      productId:
        currentProduct.id,

      variantId:
        selectedVariant.id,

      variantName:
        selectedVariant.name,

      name:
        currentProduct.name,

      price:
        selectedVariant.price,

      image:
        selectedVariant.image ||
        currentProduct.image,

      qty:1
    });
  }

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  closeVariantModal();

  showCartPopup();
}

/* SHOW CART DRAWER */
function showCartPopup() {

  cart = JSON.parse(localStorage.getItem("cart")) || [];

  const drawer =
    document.getElementById("cart-drawer");

  const items =
    document.getElementById("drawer-items");

  items.innerHTML = "";

  let total = 0;

  cart.forEach(item => {

    total += item.price * item.qty;

    items.innerHTML += `

      <div class="drawer-item">

        <img
          src="${item.image}"
          class="drawer-img"
        >

        <div class="drawer-info">

          <h4>${item.name}</h4>

          ${
            item.variantName
              ? `<p>${item.variantName}</p>`
              : ""
          }

          <p>₹${item.price}</p>

          <div class="qty-row">

            <button
              class="qty-btn"
              onclick="decreaseQty('${
                item.variantId || item.id
              }')"
            >
              -
            </button>

            <span>${item.qty}</span>

            <button
              class="qty-btn"
              onclick="increaseQty('${
                item.variantId || item.id
              }')"
            >
              +
            </button>

          </div>

        </div>

      </div>

    `;
  });

  document.getElementById(
    "drawer-total"
  ).innerText = total;

  drawer.classList.remove("hidden");
}

/* CLOSE DRAWER */
function closeDrawer() {

  document
    .getElementById("cart-drawer")
    .classList
    .add("hidden");
}

/* GO TO CART */
function goToCart() {

  window.location.href = "cart.html";
}

/* INCREASE QTY */
function increaseQty(id) {

  cart = JSON.parse(localStorage.getItem("cart")) || [];

  let item = cart.find(item =>
    String(item.variantId || item.id)
      === String(id)
  );

  if(item){
    item.qty += 1;
  }

  saveCart();

  showCartPopup();
}

/* DECREASE QTY */
function decreaseQty(id) {

  cart = JSON.parse(localStorage.getItem("cart")) || [];

  let item = cart.find(item =>
    String(item.variantId || item.id)
      === String(id)
  );

  if(!item) return;

  item.qty -= 1;

  if(item.qty <= 0){

    cart = cart.filter(item =>
      String(item.variantId || item.id)
        !== String(id)
    );
  }

  saveCart();

  showCartPopup();
}

/* LOAD PRODUCTS */
async function loadProducts() {

  const { data, error } =
    await supabaseClient
      .from("products")
      .select("*");

  if(error){
    console.log(error);
    return;
  }

  const productsEl =
    document.getElementById("products");

  productsEl.innerHTML = "";

  data.forEach(product => {

    productsEl.innerHTML += `

      <div class="card">

        <img src="${product.image}">

        <h3>${product.name}</h3>

        <p>${product.description}</p>

        <p class="price">
          ₹${product.price}
        </p>

        ${
          product.has_variants

          ? `

            <button
              class="btn"
              onclick="openVariantModal('${product.id}')"
            >
              Choose Options
            </button>

          `

          : `

            <button
              class="btn"
              onclick='addToCart(${JSON.stringify(product)})'
            >
              Add To Cart
            </button>

          `
        }

      </div>

    `;
  });
}

/* GET VARIANTS */
async function getVariants(productId){

  const { data, error } =
    await supabaseClient
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .eq("active", true);

  if(error){

    console.log(error);

    return [];
  }

  return data;
}

/* OPEN VARIANT MODAL */
async function openVariantModal(productId){

  const variants =
    await getVariants(productId);

  if(!variants.length) return;

  const { data: product } =
    await supabaseClient
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

  currentProduct = product;

  document
    .getElementById("variant-modal")
    .classList
    .remove("hidden");

  document.getElementById(
    "variant-title"
  ).innerText = product.name;

  document.getElementById(
    "variant-image"
  ).src = product.image;

  selectedVariant = variants[0];

  document.getElementById(
    "variant-price"
  ).innerText =
    `₹${selectedVariant.price}`;

  const options =
    document.getElementById(
      "variant-options"
    );

  options.innerHTML = "";

  variants.forEach((variant, index) => {

    const btn =
      document.createElement("button");

    btn.className =
      "variant-option";

    if(index === 0){
      btn.classList.add("active");
    }

    btn.innerText = variant.name;

    btn.onclick = () => {

      selectedVariant = variant;

      document.getElementById(
        "variant-price"
      ).innerText =
        `₹${variant.price}`;

      document
        .querySelectorAll(
          ".variant-option"
        )
        .forEach(el => {
          el.classList.remove("active");
        });

      btn.classList.add("active");
    };

    options.appendChild(btn);
  });
}

/* CLOSE VARIANT MODAL */
function closeVariantModal(){

  document
    .getElementById("variant-modal")
    .classList
    .add("hidden");
}

/* INITIAL LOAD */
loadProducts();

/* GLOBAL FUNCTIONS */
window.addToCart = addToCart;
window.addVariantToCart = addVariantToCart;
window.closeDrawer = closeDrawer;
window.goToCart = goToCart;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.openVariantModal = openVariantModal;
window.closeVariantModal = closeVariantModal;