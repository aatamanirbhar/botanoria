let cart =
  JSON.parse(
    localStorage.getItem("cart")
  ) || [];

const itemsEl =
  document.getElementById(
    "checkout-items"
  );

let subtotal = 0;

let discount = 0;

let shipping = 0;

let finalTotal = 0;

let appliedCoupon = null;

/* COUPONS */

const coupons = {

 BOTAN10: {
  type:"percent",
  value:10,
  minOrder:999
},

  FLAT100: {
    type:"flat",
    value:100,
    minOrder:1499
  }
};

/* RENDER ITEMS */

itemsEl.innerHTML = "";

cart.forEach(item => {

  const itemTotal =
    item.price * item.qty;

  subtotal += itemTotal;

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

/* UPDATE TOTALS */

function updateCheckoutTotal(){

  shipping =
    subtotal >= 1000
      ? 0
      : 49;

  finalTotal =
    subtotal - discount + shipping;

  if(finalTotal < 0){
    finalTotal = 0;
  }

  document.getElementById(
    "checkout-subtotal"
  ).innerText = subtotal;

  document.getElementById(
    "checkout-shipping"
  ).innerText =
    shipping === 0
      ? "FREE"
      : `₹${shipping}`;

  document.getElementById(
    "checkout-total"
  ).innerText = finalTotal;
}

/* APPLY COUPON */

function applyCoupon(){

  const code =
    document
      .getElementById(
        "coupon-input"
      )
      .value
      .trim()
      .toUpperCase();

  const coupon =
    coupons[code];

  const message =
    document.getElementById(
      "coupon-message"
    );

  if(!coupon){

    discount = 0;

    appliedCoupon = null;

    message.innerText =
      "Invalid coupon";

    updateCheckoutTotal();

    return;
  }

  if(
    coupon.minOrder &&
    subtotal < coupon.minOrder
  ){

    message.innerText =
      `Coupon valid above ₹${coupon.minOrder}`;

    return;
  }

  appliedCoupon = code;

  if(coupon.type === "percent"){

    discount =
      (subtotal * coupon.value) / 100;

  } else {

    discount = coupon.value;
  }

  message.innerHTML = `
  🎉 Congratulations! You saved ₹${discount} ✨
`;

message.classList.remove("coupon-success");

void message.offsetWidth;

message.classList.add("coupon-success");

  updateCheckoutTotal();
}

/* INITIAL TOTAL */

updateCheckoutTotal();

/* GLOBALS */

window.applyCoupon =
  applyCoupon;


  /* PAYMENT */

async function startPayment(){

  try{

    const customerName =
      document.getElementById(
        "customer-name"
      ).value;

    const customerPhone =
      document.getElementById(
        "customer-phone"
      ).value;

    const customerEmail =
      document.getElementById(
        "customer-email"
      ).value;

    const customerAddress =
      document.getElementById(
        "customer-address"
      ).value;

    /* BASIC VALIDATION */

    if(
      !customerName ||
      !customerPhone ||
      !customerEmail ||
      !customerAddress
    ){

      alert(
        "Please fill all fields"
      );

      return;
    }

    /* CREATE ORDER */

    const response =
      await fetch(
        "/api/create-order",
        {

          method:"POST",

          headers:{
            "Content-Type":
              "application/json"
          },

          body:JSON.stringify({

            amount:finalTotal
          })
        }
      );

    const order =
      await response.json();

    /* RAZORPAY OPTIONS */

    const options = {

      key:
        "rzp_test_SayxRYG9e6D0Gv",

      amount:
        order.amount,

      currency:
        order.currency,

      name:
        "BOTANORIA",

      description:
        "Herbal Care Order",

      order_id:
        order.id,

      prefill:{

        name:
          customerName,

        email:
          customerEmail,

        contact:
          customerPhone
      },

      theme:{
        color:"#111111"
      },

   handler: async function(response){

  try{

    const cart =
      JSON.parse(
        localStorage.getItem("cart")
      ) || [];

    const customerName =
      document
        .querySelectorAll(".input")[0]
        .value;

    const customerPhone =
      document
        .querySelectorAll(".input")[1]
        .value;

    const customerEmail =
      document
        .getElementById(
          "customer-email"
        )
        .value;

    const customerAddress =
      document
        .querySelectorAll(".input")[3]
        .value;

    /* SAVE ORDER */

    const {
      data:orderData,
      error:orderError
    } = await supabaseClient
      .from("orders")
      .insert([{

        customer_name:
          customerName,

        phone:
          customerPhone,

        email:
          customerEmail,

        address:
          customerAddress,

        total:
          finalTotal,

        payment_id:
          response
            .razorpay_payment_id

      }])
      .select()
      .single();

    if(orderError){

      console.log(orderError);

      alert(
        "Order save failed"
      );

      return;
    }

    /* SAVE ITEMS */

    const items =
      cart.map(item => ({

        order_id:
          orderData.id,

        product_id:
          item.id,

        product_name:
          item.name,

        image:
          item.image,

        qty:
          item.qty,

        price:
          item.price

      }));

    const {
      error:itemError
    } = await supabaseClient
      .from("order_items")
      .insert(items);

    if(itemError){

      console.log(itemError);
    }

const orderMessage = `

📦 NEW BOTANORIA ORDER

👤 ${customerName}

📞 ${customerPhone}

📧 ${customerEmail}

🏠 ${customerAddress}

💰 Total: ₹${finalTotal}

🆔 Payment:
${response.razorpay_payment_id}

`;

const itemsText =
  cart.map(item => `

• ${item.name}
  Qty: ${item.qty}

`).join("");

const telegramMessage = `

📦 NEW BOTANORIA ORDER

👤 ${customerName}

📞 ${customerPhone}

📧 ${customerEmail}

🏠 ${customerAddress}

━━━━━━━━━━

🛍 ITEMS

${itemsText}

━━━━━━━━━━

💰 Total:
₹${finalTotal}

🆔 Payment:
${response.razorpay_payment_id}

`;

await fetch(

  "https://api.telegram.org/bot8701949299:AAFQVSadaAa6ZOs4NJ3WOf0hzrzBFtDyRXc/sendMessage",

  {

    method:"POST",

    headers:{
      "Content-Type":
        "application/json"
    },

    body:JSON.stringify({

      chat_id:
        "1033075051",

      text:
        telegramMessage
    })
  }
);;


    /* CLEAR CART */

    localStorage.removeItem(
      "cart"
    );

    /* SUCCESS PAGE */

    window.location.href =
      "success.html";

  } catch(error){

    console.log(error);

    alert(
      "Something went wrong"
    );
  }
}
    };

    const razorpay =
      new Razorpay(options);

    razorpay.open();

  } catch(error){

    console.log(error);

    alert(
      "Payment Failed"
    );
  }
}

/* BUTTON */

document
  .getElementById("pay-btn")
  .addEventListener(
    "click",
    startPayment
  );