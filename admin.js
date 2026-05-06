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
    document.getElementById("admin-products");

  el.innerHTML = "";

  data.forEach(product => {

    el.innerHTML += `

      <div class="admin-card">

        <img
          src="${product.image}"
          class="admin-img"
        >

        <div class="admin-info">

          <h3>${product.name}</h3>

          <p>${product.description}</p>

          <h4>₹${product.price}</h4>

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
    .getElementById("product-modal")
    .classList
    .remove("hidden");
}

function closeProductModal(){

  editingProductId = null;
  

  clearProductForm();

  document
    .getElementById("product-modal")
    .classList
    .add("hidden");
}

async function addProduct(){

  const name =
    document.getElementById("product-name").value;

  const description =
    document.getElementById("product-description").value;

  const price =
    document.getElementById("product-price").value;

  const image =
    document.getElementById("product-image").value;

    const has_variants =
  document.getElementById(
    "product-has-variants"
  ).checked;

  if(editingProductId){

    const { error } =
      await supabaseClient
        .from("products")
      .update({
  name,
  description,
  price,
  image,
  has_variants
})
        .eq("id", editingProductId);

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
  has_variants
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
  "product-image-preview"
).src = data.image;

document.getElementById(
  "product-image-preview"
).classList.remove("hidden");

  document.getElementById(
  "product-has-variants"
).checked =
  data.has_variants;

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
  "product-has-variants"
).checked = false;
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



async function deleteProduct(id){

  const yes =
    confirm("Delete product?");

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

  currentVariantProductId = productId;

  document
    .getElementById(
      "variant-manager-modal"
    )
    .classList
    .remove("hidden");

  const { data: product } =
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

  const { data, error } =
    await supabaseClient
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", {
        ascending:false
      });

  if(error){
    console.log(error);
    return;
  }

  const el =
    document.getElementById("admin-variants");

  el.innerHTML = "";

  data.forEach(variant => {

    el.innerHTML += `

      <div class="admin-variant-card">

        <div>

          <h4>${variant.name}</h4>

          <p>
            ₹${variant.price}
            •
            Stock: ${variant.stock}
          </p>

        </div>

        <button
          class="admin-delete-btn"
          onclick="deleteVariant('${variant.id}')"
        >
          Delete
        </button>

      </div>

    `;
  });
}

async function addVariant(){

  const name =
    document.getElementById("variant-name").value;

  const price =
    document.getElementById("variant-price").value;

  const stock =
    document.getElementById("variant-stock").value;

  const image =
    document.getElementById("variant-image").value;

  const { error } =
    await supabaseClient
      .from("product_variants")
      .insert([{
        product_id:
          currentVariantProductId,

        name,
        price,
        stock,
        image
      }]);

  if(error){
    console.log(error);
    return;
  }

  clearVariantForm();

  loadVariants(currentVariantProductId);
}

async function deleteVariant(id){

  const yes =
    confirm("Delete variant?");

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

  loadVariants(currentVariantProductId);
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

window.addVariant =
  addVariant;

window.deleteVariant =
  deleteVariant;