const products = [
  {
    id: 1,
    title: "iPhone 15 Pro",
    category: "celulares",
    price: 15999,
    image:
      "imgs/iphone.jpg",
  },
  {
    id: 2,
    title: "Samsung Galaxy S24 Ultra",
    category: "celulares",
    price: 15999,
    image:
      "imgs/samsung.jpg",
  },
  {
    id: 3,
    title: 'MacBook Pro 16" M3 Max',
    category: "computadoras",
    price: 17999,
    image:
      "imgs/macbook.jpg",
  },
  {
    id: 4,
    title: "Dell XPS 15",
    category: "computadoras",
    price: 13000,
    image:
      "imgs/dell.jpg",
  },
  {
    id: 5,
    title: 'iPad Pro 12.9"',
    category: "tablets",
    price: 9999,
    image:
      "imgs/ipad.jpg",
  },
  {
    id: 6,
    title: "Samsung Galaxy Tab S9",
    category: "tablets",
    price: 7699,
    image:
      "imgs/huevo.jpg",
  },
];

let cart = JSON.parse(localStorage.getItem("techstore_cart") || "[]");

// DOM Elements
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

// Initialize the application
function init() {
  const category = document.body.getAttribute("data-category") || "all";
  if (category === "all") {
    renderProducts(products);
  } else {
    renderProducts(products.filter((p) => p.category === category));
  }
  setupEventListeners();
  updateCart();

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// Render Products Grid
function renderProducts(productsToRender) {
  productsGrid.innerHTML = "";

  if (productsToRender.length === 0) {
    productsGrid.innerHTML =
      '<p style="text-align:center; grid-column: 1 / -1; color: var(--text-secondary);">No hay productos en esta categoría.</p>';
    return;
  }

  productsToRender.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    // Add staggered animation delay
    card.style.animationDelay = `${index * 0.1}s`;

    card.innerHTML = `
            <img src="${product.image}" alt="${product.title}" class="product-image" loading="lazy">
            <div class="product-category">${product.category}</div>
            <h3 class="product-title">${product.title}</h3>
            <div class="product-price">$${product.price.toLocaleString()}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">Agregar al Carrito</button>
        `;
    productsGrid.appendChild(card);
  });
}

// Event Listeners setup
function setupEventListeners() {
  // Mobile Menu Toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      navLinks.classList.toggle("active");
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      navLinks &&
      navLinks.classList.contains("active") &&
      !navLinks.contains(e.target)
    ) {
      navLinks.classList.remove("active");
    }
  });

  // Cart Sidebar Toggle
  cartIcon.addEventListener("click", toggleCart);
  closeCart.addEventListener("click", toggleCart);
  cartOverlay.addEventListener("click", toggleCart);
}

function toggleCart() {
  cartSidebar.classList.toggle("open");
  cartOverlay.classList.toggle("show");
}

// Global functions for inline HTML calls
window.addToCart = function (productId) {
  const product = products.find((p) => p.id === productId);
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
    showToast(`Cantidad aumentada: ${product.title}`);
  } else {
    cart.push({ ...product, quantity: 1 });
    showToast(`Agregado: ${product.title}`);
  }

  // Small animation on cart icon
  cartIcon.style.transform = "scale(1.2)";
  setTimeout(() => (cartIcon.style.transform = "scale(1)"), 200);

  updateCart();
};

window.changeQuantity = function (productId, delta) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter((p) => p.id !== productId);
    }
    updateCart();
  }
};

window.removeItem = function (productId) {
  cart = cart.filter((p) => p.id !== productId);
  updateCart();
};

// Update DOM based on cart state
function updateCart() {
  localStorage.setItem("techstore_cart", JSON.stringify(cart));

  // Update red badge count
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCountElements.forEach((el) => (el.textContent = count));

  // Update Cart Sidebar HTML
  cartItemsContainer.innerHTML = "";

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; color: var(--text-secondary); opacity: 0.7;">
            <svg style="width:64px; height:64px; margin-bottom:1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <p>Tu carrito está vacío</p>
        </div>`;
  } else {
    cart.forEach((item) => {
      const el = document.createElement("div");
      el.className = "cart-item";
      el.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                    <div class="cart-item-actions">
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                        <button class="remove-item" onclick="removeItem(${item.id})">Eliminar</button>
                    </div>
                </div>
            `;
      cartItemsContainer.appendChild(el);
    });
  }

  // Update total cost
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  totalPriceElement.textContent = `$${total.toLocaleString()}`;
}

// Simple Toast Notification System
function showToast(message) {
  // Remove existing toast if any
  const existingToast = document.querySelector(".toast");
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger slide up animation
  setTimeout(() => toast.classList.add("show"), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400); // Wait for transition
  }, 3000);
}

// Boot up
init();
