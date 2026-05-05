let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(p) {
  let existing = cart.find(i => i.id === p.id);

  if (existing) {
    existing.qty += 1;
  } else {
    p.qty = 1;
    cart.push(p);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart");
}

async function loadProducts() {
  const { data } = await supabaseClient.from("products").select("*");

  const el = document.getElementById("products");
  el.innerHTML = "";

  data.forEach(p => {
    el.innerHTML += `
      <div class="card">
        <img src="${p.image}" width="100%">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <p>₹${p.price}</p>
        <button class="btn" onclick='addToCart(${JSON.stringify(p)})'>
          Add to Cart
        </button>
      </div>
    `;
  });
}

loadProducts();