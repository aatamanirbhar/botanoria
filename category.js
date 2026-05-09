const productsGrid =
  document.getElementById(
    "products-grid"
  );

const category =
  document.body.dataset.category;

async function loadProducts(){

  const {
    data: products,
    error
  } = await supabaseClient

    .from("products")

    .select("*")

    .eq(
      "category",
      category
    );

  if(error){

    console.log(error);

    return;
  }

  if(!productsGrid) return;

  productsGrid.innerHTML = "";

  products.forEach(product => {

    productsGrid.innerHTML += `

      <div class="premium-product-card">

        <div class="product-image-wrap">

          <img
            src="${product.image}"
            alt="${product.name}"
          >

        </div>

        <div class="premium-product-info">

          <h3>
            ${product.name}
          </h3>

          <p class="premium-price">
            ₹${product.price}
          </p>

          ${
            product.has_variants

            ? `

              <button
                class="premium-btn"
                onclick="openVariantModal('${product.id}')"
              >
                Choose Options
              </button>

            `

            : `

              <button
                class="premium-btn"
                onclick='addToCart(${JSON.stringify(product)})'
              >
                Add To Cart
              </button>

            `
          }

        </div>

      </div>

    `;
  });
}

loadProducts();