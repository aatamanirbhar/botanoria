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