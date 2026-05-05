async function loadProducts() {
  const { data } = await supabase.from("products").select("*");

  let el = document.getElementById("products");
  el.innerHTML = "";

  data.forEach(p => {
    el.innerHTML += `
      <div>
        ${p.name} ₹${p.price}
        <button onclick="del('${p.id}')">Delete</button>
      </div>
    `;
  });
}

async function addProduct() {
  await supabase.from("products").insert([{
    name: name.value,
    price: price.value,
    image: image.value,
    description: description.value
  }]);

  loadProducts();
}

async function del(id) {
  await supabase.from("products").delete().eq("id", id);
  loadProducts();
}

async function loadOrders() {
  const { data } = await supabase.from("orders").select("*");

  let el = document.getElementById("orders");

  data.forEach(o => {
    el.innerHTML += `<p>${o.name} - ₹${o.total}</p>`;
  });
}

loadProducts();
loadOrders();