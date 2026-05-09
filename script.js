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

  cart =
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

  if(!drawer || !items) return;

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

  const totalEl =
    document.getElementById(
      "drawer-total"
    );

  if(totalEl){
    totalEl.innerText = total;
  }

  pushOverlayState();

  drawer.classList.remove("hidden");
}

/* CLOSE DRAWER */
function closeDrawer() {

  const drawer =
    document.getElementById(
      "cart-drawer"
    );

  if(drawer){
    drawer.classList.add("hidden");
  }
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

  const productsEl =
    document.getElementById("products");

  if(!productsEl) return;

  const { data, error } =
    await supabaseClient
      .from("products")
      .select("*").limit(8)

  if(error){
    console.log(error);
    return;
  }

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

  const modal =
    document.getElementById(
      "variant-modal"
    );

  if(!modal) return;

  pushOverlayState();

  modal.classList.remove("hidden");

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

async function heroShopNow(productId){

  const variants =
    await getVariants(productId);

  if(variants.length){

    openVariantModal(productId);

    return;
  }

  const { data: product } =
    await supabaseClient
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

  if(product){

    addToCart(product);
  }
}

window.heroShopNow = heroShopNow;

/* CLOSE VARIANT MODAL */
function closeVariantModal(){

  const modal =
    document.getElementById(
      "variant-modal"
    );

  if(modal){
    modal.classList.add("hidden");
  }
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

/* BACK BUTTON SUPPORT */
function pushOverlayState(){

  history.pushState(
    {
      overlay:true
    },
    ""
  );
}

window.addEventListener(
  "popstate",
  function(){

    const variantModal =
      document.getElementById(
        "variant-modal"
      );

    const cartDrawer =
      document.getElementById(
        "cart-drawer"
      );

    if(
      variantModal &&
      !variantModal.classList.contains(
        "hidden"
      )
    ){

      closeVariantModal();

      return;
    }

    if(
      cartDrawer &&
      !cartDrawer.classList.contains(
        "hidden"
      )
    ){

      closeDrawer();

      return;
    }
  }
);

/* CATEGORY CAROUSEL */
const categories = [

  {
    name:"Hair Care",
    description:"Nourish roots naturally",
    image:"https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=1200&auto=format&fit=crop",
    link:"hair.html"
  },

  {
    name:"Skin Care",
    description:"Timeless herbal glow",
    image:"https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1200&auto=format&fit=crop",
    link:"soap.html"
  },

  {
    name:"Wellness",
    description:"Rituals for mindful living",
    image:"https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop",
    link:"wellness.html"
  },

  {
    name:"Herbal Oils",
    description:"Ancient nourishment rituals",
    image:"https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=1200&auto=format&fit=crop",
    link:"oils.html"
  }

];

const categoryCarousel =
  document.getElementById(
    "category-carousel"
  );

if(categoryCarousel){

  categories.forEach(category => {

    categoryCarousel.innerHTML += `

      <a
        href="${category.link}"
        class="category-card"
      >

        <img
          src="${category.image}"
        >

        <div class="category-overlay">

          <h3>
            ${category.name}
          </h3>

          <p>
            ${category.description}
          </p>

        </div>

      </a>

    `;
  });

}

if(categoryCarousel){

  /* AUTO SLIDE */

  let autoScroll = 0;

  let autoSlide = setInterval(() => {

    autoScroll += 340;

    if(

      autoScroll >=

      categoryCarousel.scrollWidth -

      categoryCarousel.clientWidth

    ){

      autoScroll = 0;
    }

    categoryCarousel.scrollTo({

      left:autoScroll,

      behavior:"smooth"

    });

  }, 3000);

  /* DRAG SUPPORT */

  let isDown = false;

  let startX;

  let scrollLeft;

  categoryCarousel.addEventListener(
    "mousedown",
    (e) => {

      isDown = true;

      categoryCarousel.classList.add(
        "dragging"
      );

      clearInterval(autoSlide);

      startX =
        e.pageX -
        categoryCarousel.offsetLeft;

      scrollLeft =
        categoryCarousel.scrollLeft;
    }
  );

  categoryCarousel.addEventListener(
    "mouseleave",
    () => {

      isDown = false;

      categoryCarousel.classList.remove(
        "dragging"
      );
    }
  );

  categoryCarousel.addEventListener(
    "mouseup",
    () => {

      isDown = false;

      categoryCarousel.classList.remove(
        "dragging"
      );
    }
  );

  categoryCarousel.addEventListener(
    "mousemove",
    (e) => {

      if(!isDown) return;

      e.preventDefault();

      const x =
        e.pageX -
        categoryCarousel.offsetLeft;

      const walk =
        (x - startX) * 2;

      categoryCarousel.scrollLeft =
        scrollLeft - walk;
    }
  );

  /* TOUCH SUPPORT */

  categoryCarousel.addEventListener(
    "touchstart",
    () => {

      clearInterval(autoSlide);
    }
  );
}