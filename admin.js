function toggleSaleField(type){
  const checkbox = document.getElementById(`${type}-on-sale`);
  const field    = document.getElementById(`${type}-sale-price`);
  if(checkbox.checked){
    field.classList.remove("hidden");
  } else {
    field.classList.add("hidden");
    field.value = "";
  }
}

function priceDisplay(product){
  if(product.on_sale && product.sale_price){
    return `<span class="old-price">₹${product.price}</span> ₹${product.sale_price}`;
  }
  return `₹${product.price}`;
}

async function loadAdminProducts(){

  const { data, error } =
    await supabaseClient
      .from("products")
      .select("*")
      .order("id", {
        ascending:false
      });

  if(error){
    console.log(error);
    return;
  }

  const el =
    document.getElementById(
      "admin-products"
    );

  el.innerHTML = "";

  data.forEach(product => {

    el.innerHTML += `

      <div class="admin-card">

        <img
          src="${product.image}"
          class="admin-img"
        >

        <div class="admin-info">

          <h3>
            ${product.name}
          </h3>

          <p>
            ${product.description}
          </p>

          <h4>
            ${priceDisplay(product)}
          </h4>

          <p class="admin-category">

            ${product.category || "Uncategorized"}

          </p>

          <div class="admin-actions">

            <button
              class="admin-edit-btn"
              onclick="editProduct('${product.id}')"
            >
              Edit
            </button>

            <button
              class="admin-variant-btn"
              onclick="openVariantManager('${product.id}')"
            >
              Variants
            </button>

            <button
              class="admin-delete-btn"
              onclick="deleteProduct('${product.id}')"
            >
              Delete
            </button>

          </div>

        </div>

      </div>

    `;
  });
}

function openAddProductModal(){

  document
    .getElementById(
      "product-modal"
    )
    .classList
    .remove("hidden");
}

function closeProductModal(){

  editingProductId = null;

  clearProductForm();

  document
    .getElementById(
      "product-modal"
    )
    .classList
    .add("hidden");
}

async function addProduct(){

  const name =
    document.getElementById(
      "product-name"
    ).value;

  const description =
    document.getElementById(
      "product-description"
    ).value;

  const price =
    document.getElementById(
      "product-price"
    ).value;

  const image =
    document.getElementById(
      "product-image"
    ).value;

  const category =
    document.getElementById(
      "product-category"
    ).value;

  const has_variants =
    document.getElementById(
      "product-has-variants"
    ).checked;

  const on_sale =
    document.getElementById(
      "product-on-sale"
    ).checked;

  const sale_price =
    document.getElementById(
      "product-sale-price"
    ).value || null;

  if(editingProductId){

    const { error } =
      await supabaseClient
        .from("products")
        .update({

          name,
          description,
          price,
          image,
          category,
          has_variants,
          on_sale,
          sale_price

        })
        .eq(
          "id",
          editingProductId
        );

    if(error){

      console.log(error);

      return;
    }

  } else {

    const { error } =
      await supabaseClient
        .from("products")
        .insert([{

          name,
          description,
          price,
          image,
          category,
          has_variants,
          on_sale,
          sale_price

        }]);

    if(error){

      console.log(error);

      return;
    }
  }

  editingProductId = null;

  clearProductForm();

  closeProductModal();

  loadAdminProducts();
}

async function editProduct(id){

  const { data, error } =
    await supabaseClient
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

  if(error){

    console.log(error);

    return;
  }

  editingProductId = id;

  document.getElementById(
    "product-name"
  ).value = data.name;

  document.getElementById(
    "product-description"
  ).value = data.description;

  document.getElementById(
    "product-price"
  ).value = data.price;

  document.getElementById(
    "product-image"
  ).value = data.image;

  document.getElementById(
    "product-category"
  ).value =
    data.category || "";

  document.getElementById(
    "product-image-preview"
  ).src = data.image;

  document.getElementById(
    "product-image-preview"
  ).classList.remove("hidden");

  document.getElementById(
    "product-has-variants"
  ).checked =
    data.has_variants;

  document.getElementById(
    "product-on-sale"
  ).checked =
    data.on_sale || false;

  document.getElementById(
    "product-sale-price"
  ).value =
    data.sale_price || "";

  toggleSaleField("product");

  openAddProductModal();
}

function clearProductForm(){

  document.getElementById(
    "product-image-file"
  ).value = "";

  document.getElementById(
    "product-image-preview"
  ).src = "";

  document.getElementById(
    "product-image-preview"
  ).classList.add("hidden");

  document.getElementById(
    "product-name"
  ).value = "";

  document.getElementById(
    "product-description"
  ).value = "";

  document.getElementById(
    "product-price"
  ).value = "";

  document.getElementById(
    "product-image"
  ).value = "";

  document.getElementById(
    "product-category"
  ).value = "";

  document.getElementById(
    "product-has-variants"
  ).checked = false;

  document.getElementById(
    "product-on-sale"
  ).checked = false;

  document.getElementById(
    "product-sale-price"
  ).value = "";

  document.getElementById(
    "product-sale-price"
  ).classList.add("hidden");
}

async function uploadProductImage(){

  const file =
    document.getElementById(
      "product-image-file"
    ).files[0];

  if(!file) return;

  const fileName =
    `${Date.now()}-${file.name}`;

  const { error } =
    await supabaseClient
      .storage
      .from("product-images")
      .upload(fileName, file);

  if(error){

    console.log(error);

    return;
  }

  const {
    data: { publicUrl }
  } =
    supabaseClient
      .storage
      .from("product-images")
      .getPublicUrl(fileName);

  document.getElementById(
    "product-image"
  ).value = publicUrl;

  const preview =
    document.getElementById(
      "product-image-preview"
    );

  preview.src = publicUrl;

  preview.classList.remove("hidden");
}

document
  .getElementById(
    "product-image-file"
  )
  .addEventListener(
    "change",
    uploadProductImage
  );

let editingProductId = null;
let currentVariantProductId = null;
let editingVariantId = null;

async function deleteProduct(id){

  const yes =
    confirm(
      "Delete product?"
    );

  if(!yes) return;

  const { error } =
    await supabaseClient
      .from("products")
      .delete()
      .eq("id", id);

  if(error){

    console.log(error);

    return;
  }

  loadAdminProducts();
}

async function openVariantManager(productId){

  currentVariantProductId =
    productId;

  document
    .getElementById(
      "variant-manager-modal"
    )
    .classList
    .remove("hidden");

  const {
    data: product
  } =
    await supabaseClient
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

  document.getElementById(
    "variant-manager-title"
  ).innerText =
    `${product.name} Variants`;

  loadVariants(productId);
}

async function loadVariants(productId){

  const {
    data,
    error
  } =
    await supabaseClient
      .from("product_variants")
      .select("*")
      .eq(
        "product_id",
        productId
      )
      .order(
        "created_at",
        {
          ascending:false
        }
      );

  if(error){

    console.log(error);

    return;
  }

  const el =
    document.getElementById(
      "admin-variants"
    );

  el.innerHTML = "";

  data.forEach(variant => {

    el.innerHTML += `

      <div class="admin-variant-card">

        <div>

          <h4>
            ${variant.name}
          </h4>

          <p>

            ${variant.on_sale && variant.sale_price
              ? `<span class="old-price">₹${variant.price}</span> ₹${variant.sale_price}`
              : `₹${variant.price}`}

            •

            Stock:
            ${variant.stock}

          </p>

        </div>

        <div class="admin-variant-actions">

          <button
            class="admin-edit-btn"
            onclick="editVariant('${variant.id}')"
          >
            Edit
          </button>

          <button
            class="admin-delete-btn"
            onclick="deleteVariant('${variant.id}')"
          >
            Delete
          </button>

        </div>

      </div>

    `;
  });
}

async function saveVariant(){

  const name =
    document.getElementById(
      "variant-name"
    ).value;

  const price =
    document.getElementById(
      "variant-price"
    ).value;

  const stock =
    document.getElementById(
      "variant-stock"
    ).value;

  const image =
    document.getElementById(
      "variant-image"
    ).value;

  const on_sale =
    document.getElementById(
      "variant-on-sale"
    ).checked;

  const sale_price =
    document.getElementById(
      "variant-sale-price"
    ).value || null;

  if(editingVariantId){

    const { error } =
      await supabaseClient
        .from("product_variants")
        .update({
          name,
          price,
          stock,
          image,
          on_sale,
          sale_price
        })
        .eq("id", editingVariantId);

    if(error){
      console.log(error);
      return;
    }

  } else {

    const { error } =
      await supabaseClient
        .from("product_variants")
        .insert([{
          product_id:
            currentVariantProductId,
          name,
          price,
          stock,
          image,
          on_sale,
          sale_price
        }]);

    if(error){
      console.log(error);
      return;
    }
  }

  editingVariantId = null;

  document.getElementById(
    "variant-save-btn"
  ).innerText = "Add Variant";

  clearVariantForm();

  loadVariants(
    currentVariantProductId
  );
}

async function editVariant(id){

  const { data, error } =
    await supabaseClient
      .from("product_variants")
      .select("*")
      .eq("id", id)
      .single();

  if(error){
    console.log(error);
    return;
  }

  editingVariantId = id;

  document.getElementById(
    "variant-name"
  ).value = data.name;

  document.getElementById(
    "variant-price"
  ).value = data.price;

  document.getElementById(
    "variant-stock"
  ).value = data.stock;

  document.getElementById(
    "variant-image"
  ).value = data.image || "";

  document.getElementById(
    "variant-on-sale"
  ).checked = data.on_sale || false;

  document.getElementById(
    "variant-sale-price"
  ).value = data.sale_price || "";

  toggleSaleField("variant");

  document.getElementById(
    "variant-save-btn"
  ).innerText = "Update Variant";

  document
    .getElementById(
      "variant-manager-modal"
    )
    .classList
    .remove("hidden");
}

async function deleteVariant(id){

  const yes =
    confirm(
      "Delete variant?"
    );

  if(!yes) return;

  const { error } =
    await supabaseClient
      .from("product_variants")
      .delete()
      .eq("id", id);

  if(error){

    console.log(error);

    return;
  }

  loadVariants(
    currentVariantProductId
  );
}

function clearVariantForm(){

  document.getElementById(
    "variant-name"
  ).value = "";

  document.getElementById(
    "variant-price"
  ).value = "";

  document.getElementById(
    "variant-stock"
  ).value = "";

  document.getElementById(
    "variant-image"
  ).value = "";

  document.getElementById(
    "variant-on-sale"
  ).checked = false;

  document.getElementById(
    "variant-sale-price"
  ).value = "";

  document.getElementById(
    "variant-sale-price"
  ).classList.add("hidden");

  document.getElementById(
    "variant-save-btn"
  ).innerText = "Add Variant";

  editingVariantId = null;
}

function closeVariantManager(){

  clearVariantForm();

  document
    .getElementById(
      "variant-manager-modal"
    )
    .classList
    .add("hidden");
}

loadAdminProducts();

/* GLOBAL */

window.toggleSaleField = toggleSaleField;

window.openAddProductModal =
  openAddProductModal;

window.closeProductModal =
  closeProductModal;

window.addProduct =
  addProduct;

window.deleteProduct =
  deleteProduct;

window.editProduct =
  editProduct;

window.openVariantManager =
  openVariantManager;

window.closeVariantManager =
  closeVariantManager;

window.saveVariant =
  saveVariant;

window.editVariant =
  editVariant;

window.deleteVariant =
  deleteVariant;
