document.addEventListener("DOMContentLoaded", function () {

const BASE_URL = "https://oscarmtz28.github.io/LAB-IV/";

// ================= PRODUCTOS =================
const products = [
  { id: 1, title: "iPhone 15 Pro", category: "celulares", price: 15999, image: BASE_URL + "imgs/iphone.jpg" },
  { id: 2, title: "Samsung Galaxy S24 Ultra", category: "celulares", price: 15999, image: BASE_URL + "imgs/samsung.jpg" },
  { id: 3, title: 'MacBook Pro 16" M3 Max', category: "computadoras", price: 17999, image: BASE_URL + "imgs/macbook.jpg" },
  { id: 4, title: "Dell XPS 15", category: "computadoras", price: 13000, image: BASE_URL + "imgs/dell.jpg" },
  { id: 5, title: 'iPad Pro 12.9"', category: "tablets", price: 9999, image: BASE_URL + "imgs/ipad.jpg" },
  { id: 6, title: "Samsung Galaxy Tab S9", category: "tablets", price: 7699, image: BASE_URL + "imgs/huevo.jpg" }
];

// ================= CARRITO =================
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("techstore_cart") || "[]");
} catch (e) { cart = []; }

// ================= ELEMENTOS DOM =================
const productsGrid = document.getElementById("products-grid");
const cartIcon = document.getElementById("cart-icon");
const cartSidebar = document.getElementById("cart-sidebar");
const closeCart = document.getElementById("close-cart");
const cartOverlay = document.getElementById("cart-overlay");
const cartItemsContainer = document.getElementById("cart-items");
const cartCountElements = document.querySelectorAll(".cart-count");
const totalPriceElement = document.getElementById("total-price");
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const checkoutButton = document.querySelector(".checkout-button");

// ================= INIT =================
function init() {
  const category = document.body.getAttribute("data-category") || "all";
  if (productsGrid) {
    const filtered = category === "all" ? products : products.filter(p => p.category === category);
    renderProducts(filtered);
  }
  setupEventListeners();
  updateCart();
}

// ================= RENDER PRODUCTOS =================
function renderProducts(list) {
  productsGrid.innerHTML = "";
  list.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${product.image}" class="product-image">
      <div class="product-category">${product.category}</div>
      <h3>${product.title}</h3>
      <div class="product-price">$${product.price.toLocaleString()}</div>
      <button onclick="addToCart(${product.id})">Agregar al Carrito</button>
    `;
    productsGrid.appendChild(card);
  });
}

// ================= EVENTOS =================
function setupEventListeners() {

  if (menuToggle && navLinks)
    menuToggle.addEventListener("click", () => navLinks.classList.toggle("active"));

  if (cartIcon) cartIcon.addEventListener("click", toggleCart);
  if (closeCart) closeCart.addEventListener("click", toggleCart);
  if (cartOverlay) cartOverlay.addEventListener("click", toggleCart);

  // ⭐ CHECKOUT ADAPTADO PARA MIT
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      if (cart.length === 0) {
        showToast("Tu carrito está vacío.");
        return;
      }

      // Si está dentro de MIT
      if (window.AppInventor) {
        window.AppInventor.setWebViewString("ir_checkout");
      } 
      // Navegador normal
      else {
        window.location.href = BASE_URL + "checkout.html";
      }
    });
  }
}

function toggleCart() {
  cartSidebar.classList.toggle("open");
  cartOverlay.classList.toggle("show");
}

// ================= FUNCIONES GLOBALES =================
window.addToCart = function (productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(item => item.id === productId);

  if (existing) existing.quantity++;
  else cart.push({ ...product, quantity: 1 });

  updateCart();

  // Avisar a MIT que agregaron producto
  if (window.AppInventor)
    window.AppInventor.setWebViewString("producto_" + productId);
};

window.changeQuantity = function (id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) cart = cart.filter(p => p.id !== id);
  updateCart();
};

window.removeItem = function (id) {
  cart = cart.filter(p => p.id !== id);
  updateCart();
};

// ================= ACTUALIZAR CARRITO =================
function updateCart() {
  try { localStorage.setItem("techstore_cart", JSON.stringify(cart)); } catch(e){}

  const count = cart.reduce((t,i)=>t+i.quantity,0);
  cartCountElements.forEach(el => el.textContent = count);

  if (!cartItemsContainer) return;
  cartItemsContainer.innerHTML = "";

  cart.forEach(item => {
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <img src="${item.image}">
      <div>
        <div>${item.title}</div>
        <div>$${item.price.toLocaleString()}</div>
        <button onclick="changeQuantity(${item.id},-1)">-</button>
        ${item.quantity}
        <button onclick="changeQuantity(${item.id},1)">+</button>
        <button onclick="removeItem(${item.id})">Eliminar</button>
      </div>
    `;
    cartItemsContainer.appendChild(el);
  });

  const total = cart.reduce((s,i)=>s+i.price*i.quantity,0);
  if (totalPriceElement) totalPriceElement.textContent = "$"+total.toLocaleString();
}

// ================= CHECKOUT =================
function initCheckout() {
  if (document.body.getAttribute("data-category") !== "checkout") return;

  if (cart.length === 0) {
    window.location.href = BASE_URL + "index.html";
    return;
  }

  const form = document.getElementById("checkout-form");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const total = cart.reduce((s,i)=>s+i.price*i.quantity,0);

    // Avisar compra a MIT
    if (window.AppInventor)
      window.AppInventor.setWebViewString("compra_realizada:" + total);

    cart = [];
    updateCart();
    alert("Compra realizada con éxito");
  });
}

// ================= INICIAR =================
init();
initCheckout();

});