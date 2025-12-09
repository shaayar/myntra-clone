const links = {
  MEN: "/men.html",
  WOMEN: "/women.html",
  KIDS: "/kids.html",
  HOME: "/home.html",
  BEAUTY: "/beauty.html",
  GENZ: "/genz.html",
  STUDIO: "/studio.html",
};

// Render header HTML into #site-header so it can be reused across pages
function renderHeader() {
  const container = document.getElementById("site-header");
  const html = `
        <header class="container-fluid">
            <nav class="navbar navbar-expand-lg navbar-light bg-light py-3">
                <div class="container-fluid">
                    <div class="d-flex align-items-center w-100">
                        <div class="d-flex align-items-center me-3">
                            <a class="navbar-brand" href="/">
                                <img src="images/logo-light.jpg" height="45px" alt="logo" />
                            </a>
                        </div>
                        <div class="d-flex align-items-center justify-content-center flex-grow-1">
                            <div class="collapse navbar-collapse" id="navbarNav">
                                <ul class="navbar-nav d-flex flex-row gap-3" id="nav-container"></ul>
                            </div>
                            <div class="ms-3 d-none d-lg-block">
                                <form class="d-flex" role="search">
                                    <input class="form-control me-2" type="search" placeholder="Search for products, brands and more" aria-label="Search" style="min-width:420px;" />
                                    <button class="btn btn-outline-secondary" type="submit">Search</button>
                                </form>
                            </div>
                        </div>
                        <div class="d-flex align-items-center ms-3 gap-4">
<div class="text-center d-none d-md-block">
    <a href="/profile.html" class="text-decoration-none text-dark position-relative" id="profile-dropdown">
        <div style="font-size:20px">👤</div>
        <small class="d-block">Profile</small>
        <div class="dropdown-menu dropdown-menu-end" id="profile-menu" style="display: none;">
            <a class="dropdown-item" href="/profile.html">My Profile</a>
            <a class="dropdown-item" href="#" id="logout-btn">Logout</a>
        </div>
    </a>
</div>
                            <div class="text-center d-none d-md-block">
                                <a href="#" class="text-decoration-none text-dark">
                                    <div style="font-size:20px">♡</div>
                                    <small class="d-block">Wishlist</small>
                                </a>
                            </div>
                            <div class="text-center position-relative">
                                <a href="/cart.html" class="text-decoration-none text-dark">
                                    <div style="font-size:20px">🛍️</div>
                                    <span id="cart-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">0</span>
                                    <small class="d-block">Bag</small>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
        `;
  if (container) container.innerHTML = html;
}

function populateNav() {
  const navContainer = document.getElementById("nav-container");
  if (!navContainer) return;
  navContainer.innerHTML = "";
  Object.entries(links).forEach(([text, href]) => {
    const li = document.createElement("li");
    li.className = "nav-item";
    li.innerHTML = `<a class="nav-link" href="${href}">${text}</a>`;
    navContainer.appendChild(li);
  });
}

// Cart persistence
const CART_KEY = "aether_cart_v1";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const el = document.getElementById("cart-count");
  if (!el) return;
  const count = getCart().reduce((s, it) => s + (it.qty || 0), 0);
  el.textContent = count;
}

function addToCart(product) {
  try {
    clearError();
    const cart = getCart();
    
    // Check if size is selected
    if (!product.size) {
      showError("Please select a size before adding to cart.");
      return false;
    }

    // Ensure the product has a valid image URL
    if (!product.img && !product.imgSrc) {
      // If neither img nor imgSrc is provided, use a placeholder
      product.img = "https://via.placeholder.com/150";
    } else if (product.img && !product.img.startsWith('http') && !product.img.startsWith('/')) {
      // If img exists but doesn't start with http or /, make it an absolute path
      product.img = '/' + product.img;
    } else if (product.imgSrc && !product.img) {
      // If only imgSrc exists, use it
      product.img = product.imgSrc;
    }

    // Check if product already exists in cart with same size
    const existingIndex = cart.findIndex(
      (p) => p.id === product.id && p.size === product.size
    );
    
    if (existingIndex >= 0) {
      // Product exists, update quantity
      if (cart[existingIndex].qty >= 10) {
        showError("Maximum quantity of 10 units allowed for this product size.");
        return false;
      }
      cart[existingIndex].qty += 1;
    } else {
      // Add new product to cart
      cart.push({
        ...product,
        qty: 1,
        addedAt: new Date().toISOString()
      });
    }
    
    // Save updated cart
    saveCart(cart);

    // Update UI feedback
    updateCartCount();
    
    // Show success feedback
    const addToBagBtn = document.getElementById("add-to-bag-btn");
    if (addToBagBtn) {
      const originalText = addToBagBtn.innerHTML;
      addToBagBtn.disabled = true;
      addToBagBtn.innerHTML = '<i class="bi bi-check-circle"></i> Added to Cart';
      addToBagBtn.classList.add('added-to-cart');
      
      // Revert button state after delay
      setTimeout(() => {
        if (addToBagBtn) {
          addToBagBtn.innerHTML = originalText;
          addToBagBtn.disabled = false;
          addToBagBtn.classList.remove('added-to-cart');
        }
      }, 2000);
    }
    
    // Show toast notification
    if (typeof showAddToast === "function") {
      showAddToast(product);
    }
    
    return true;
    
  } catch (error) {
    console.error('Error adding to cart:', error);
    showError("An error occurred while adding the item to your cart. Please try again.");
    return false;
  }
}

// Show inline error message near add to bag button
function showError(message) {
  let errorEl = document.getElementById("size-error-msg");
  if (!errorEl) {
    errorEl = document.createElement("div");
    errorEl.id = "size-error-msg";
    errorEl.style.color = "red";
    errorEl.style.marginTop = "0.5rem";
    const addToBagBtn = document.getElementById("add-to-bag-btn");
    addToBagBtn.parentNode.insertBefore(errorEl, addToBagBtn.nextSibling);
  }
  errorEl.textContent = message;
}

// Clear inline error message
function clearError() {
  const errorEl = document.getElementById("size-error-msg");
  if (errorEl) errorEl.textContent = "";
}

// Utility function to get selected size from UI
function getSelectedSize() {
  const sizeButtons = document.querySelectorAll(
    ".btn-outline-secondary[data-size]"
  );
  for (const btn of sizeButtons) {
    if (btn.classList.contains("selected")) {
      return btn.getAttribute("data-size");
    }
  }
  return null;
}

// Check stock availability for a given size (stub function, customize as needed)
function isSizeInStock(size) {
  // For demonstration, assume size "42" has limited stock and others are available
  if (size === "42") return false;
  return true;
}

// Update Add to Bag button state based on size selection and stock
function updateAddToBagButtonState() {
  const addToBagBtn = document.getElementById("add-to-bag-btn");
  if (!addToBagBtn) return;

  const selectedSize = getSelectedSize();
  if (!selectedSize || !isSizeInStock(selectedSize)) {
    addToBagBtn.disabled = true;
    if (!selectedSize) {
      showError("Please select a size before adding to cart.");
    } else {
      showError("Selected size is out of stock.");
    }
  } else {
    addToBagBtn.disabled = false;
    clearError();
  }
}

// Add event listeners to size buttons to toggle selection
function setupSizeSelection() {
  const sizeButtons = document.querySelectorAll(
    ".btn-outline-secondary[data-size]"
  );
  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sizeButtons.forEach((b) => b.classList.remove("selected", "btn-danger"));
      btn.classList.add("selected", "btn-danger");
      updateAddToBagButtonState();
    });
  });
}

// Main initialization function
function initializePage() {
  try {
    // Always render header and navigation first
    renderHeader();
    populateNav();
    updateCartCount();
    
    // Initialize UI components
    setupSizeSelection();
    updateAddToBagButtonState();
    
    // Initialize add to bag button
    const addToBagBtn = document.getElementById("add-to-bag-btn");
    if (addToBagBtn) {
      addToBagBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const selectedSize = getSelectedSize();
        if (!selectedSize) {
          showError("Please select a size before adding to cart.");
          return;
        }
        // Build product object with selected size
        const product = {
          id: addToBagBtn.getAttribute("data-id"),
          title: addToBagBtn.getAttribute("data-title") || 'Product',
          price: Number(addToBagBtn.getAttribute("data-price") || 0),
          img: addToBagBtn.getAttribute("data-img"),
          size: selectedSize,
        };
        addToCart(product);
      });
    }
    
    // Initialize cart page if on cart page
    const cartContainer = document.getElementById("cart-container");
    if (cartContainer) {
      renderCartPage();
      
      // Initialize address modal
      initAddressModal();
      
      // Set up checkout button handler
      const checkoutBtn = document.getElementById('checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          
          // Double check authentication and profile before checkout
          if (!ensureLoggedIn()) {
            return;
          }
          
          // Show address confirmation
          if (typeof showAddressConfirmation === 'function') {
            showAddressConfirmation();
          } else {
            // Fallback if showAddressConfirmation is not defined
            if (confirm('Proceed to checkout?')) {
              processOrder();
            }
          }
        });
      }
    }
    
    // Initialize carousel if it exists
    const productCarousel = document.getElementById("productCarousel");
    if (productCarousel && productCarousel.addEventListener) {
      productCarousel.addEventListener("slid.bs.carousel", function (event) {
        const activeItem = event.relatedTarget;
        if (!activeItem) return;
        const cards = activeItem.querySelectorAll(".card");
        cards.forEach((card, index) => {
          card.classList.remove("animate__fadeInUp");
          card.style.removeProperty("animation-delay");
          void card.offsetWidth;
          card.classList.add("animate__fadeInUp");
          card.style.setProperty("animation-delay", `${index * 0.2}s`);
        });
      });
    }
    
  } catch (error) {
    console.error('Error initializing page:', error);
  }
}

// Initialize the page when DOM is fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializePage);
} else {
  // DOMContentLoaded has already fired
  initializePage();
}

  // carousel listener (safe)
  const productCarousel = document.getElementById("productCarousel");
  if (productCarousel && productCarousel.addEventListener) {
    productCarousel.addEventListener("slid.bs.carousel", function (event) {
      const activeItem = event.relatedTarget;
      if (!activeItem) return;
      const cards = activeItem.querySelectorAll(".card");
      cards.forEach((card, index) => {
        card.classList.remove("animate__fadeInUp");
        card.style.removeProperty("animation-delay");
        void card.offsetWidth;
        card.classList.add("animate__fadeInUp");
        card.style.setProperty("animation-delay", `${index * 0.2}s`);
      });
    });
  }

  renderGrid();
  updateCartCount();
  renderCartPage();

  // Handle add to cart buttons in product grid
  document.addEventListener('click', function(e) {
    // Check if clicked element is an add-to-bag button or inside one
    const addToBagBtn = e.target.closest('.add-to-bag-btn');
    if (addToBagBtn && !addToBagBtn.classList.contains('added-to-cart')) {
      e.preventDefault();
      
      // Get product data from data attributes
      const product = {
        id: addToBagBtn.getAttribute('data-id'),
        title: addToBagBtn.getAttribute('data-title'),
        price: Number(addToBagBtn.getAttribute('data-price') || 0),
        img: addToBagBtn.getAttribute('data-img'),
        link: addToBagBtn.getAttribute('data-link'),
        size: 'M' // Default size for quick add
      };
      
      // Add to cart
      addToCart(product);
    }
  });

  // Handle profile dropdown and navigation
  document.addEventListener("click", function (e) {
    // Handle logout
    const logoutBtn = e.target.closest("#logout-btn");
    if (logoutBtn) {
      e.preventDefault();
      if (window.Auth && typeof window.Auth.logoutUser === "function") {
        // Show logout success toast
        const toast = document.createElement("div");
        toast.className = "position-fixed top-0 end-0 p-3";
        toast.style.zIndex = "1100";
        toast.innerHTML = `
          <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header bg-success text-white">
              <strong class="me-auto">Success</strong>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
              You have been successfully logged out.
            </div>
          </div>
        `;
        document.body.appendChild(toast);

        // Auto-remove toast after 3 seconds
        setTimeout(() => {
          toast.remove();
        }, 3000);

        // Logout and redirect after a short delay to show the toast
        setTimeout(() => {
          window.Auth.logoutUser();
          window.location.href = "/";
        }, 500);
      }
      return;
    }

    // Handle profile link click
    const profileLink = e.target.closest('.dropdown-item[href="/profile.html"]');
    if (profileLink) {
      e.preventDefault();
      window.location.href = "/profile.html";
      return;
    }

    // Toggle profile dropdown
    const profileDropdown = e.target.closest("#profile-dropdown");
    if (profileDropdown) {
      e.preventDefault();
      const menu = document.getElementById("profile-menu");
      if (menu) {
        const isHidden = menu.style.display === "none" || !menu.style.display;
        menu.style.display = isHidden ? "block" : "none";
      }
      return;
    }

    // Close dropdown when clicking outside
    const menu = document.getElementById("profile-menu");
    if (menu && !e.target.closest("#profile-menu") && !e.target.closest("#profile-dropdown")) {
      menu.style.display = "none";
    }
  });

  // Toast helper: ensure a container exists and provide showAddToast
  (function setupToasts() {
    function ensureContainer() {
      let c = document.getElementById("toast-container-bag");
      if (c) return c;
      c = document.createElement("div");
      c.id = "toast-container-bag";
      c.style.position = "fixed";
      c.style.zIndex = 1080;
      c.style.right = "24px";
      c.style.bottom = "24px";
      document.body.appendChild(c);
      return c;
    }

    window.showAddToast = function (product) {
      const container = ensureContainer();
      const toastId = "toast-" + Date.now();
      const img = product.imgSrc
        ? `<img src="${product.imgSrc}" style="width:48px;height:48px;object-fit:cover;border-radius:6px;margin-right:8px;">`
        : "";
      const title = product.title
        ? escapeHtml(product.title)
        : "Item added to bag";
      const toast = document.createElement("div");
      toast.className = "toast align-items-center text-bg-light border";
      toast.id = toastId;
      toast.setAttribute("role", "alert");
      toast.setAttribute("aria-live", "assertive");
      toast.setAttribute("aria-atomic", "true");
      toast.style.minWidth = "280px";
      toast.style.marginTop = "8px";
      toast.innerHTML = `
                <div class="d-flex">
                    <div class="toast-body d-flex align-items-center">
                        ${img}
                        <div>
                            <div class="fw-bold">Added to bag</div>
                            <div class="small text-muted">${title}</div>
                        </div>
                    </div>
                    <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            `;
      container.appendChild(toast);
      // initialize bootstrap toast and show
      try {
        const bsToast = bootstrap.Toast.getOrCreateInstance(toast, {
          delay: 2500,
        });
        bsToast.show();
        toast.addEventListener("hidden.bs.toast", () => toast.remove());
      } catch (e) {
        // fallback: remove after timeout
        setTimeout(() => toast.remove(), 2500);
      }

      // If we're on the detail page (add button present), redirect to cart after short delay
      if (document.getElementById("add-to-bag-btn")) {
        setTimeout(() => {
          window.location.href = "/cart.html";
        }, 1200);
      }
    };

    // small helper to escape HTML for toast
    function escapeHtml(str) {
      return String(str).replace(/[&<>\"]/g, function (s) {
        return (
          { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[s] || s
        );
      });
    }
  })();

  // Attach detail page Add to Bag handler (reads product data-* from the button)
  (function attachDetailAddHandler() {
    const addBtn = document.getElementById("add-to-bag-btn");
    if (!addBtn) return;
    addBtn.addEventListener("click", () => {
      const d = addBtn.dataset;
      const product = {
        id: d.id || "detail-" + Date.now(),
        title:
          d.title ||
          (document.querySelector("h1")
            ? document.querySelector("h1").innerText.trim()
            : "Product"),
        price: Number(d.price) || 0,
        imgSrc:
          d.img ||
          (document.querySelector(".col-12 img")
            ? document.querySelector(".col-12 img").src
            : ""),
        link: window.location.pathname,
      };
      addToCart(product);
      // brief UI feedback on the button
      const original = addBtn.innerHTML;
      addBtn.innerHTML = '<i class="bi bi-bag-plus-fill me-2"></i> Added ✓';
      addBtn.disabled = true;
      setTimeout(() => {
        addBtn.innerHTML = original;
        addBtn.disabled = false;
      }, 1200);
    });
  })();
// });

// Sample product data (id, title, price, imgSrc)
const productData = [
  {
    id: "p1",
    title: "Casual Tops",
    link: "/product.html",
    imgSrc:
      "https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/DECEMBER/3/itQ6JXn9_b9dadf736c1646edbc282fcaa3a2f51e.jpg",
  },
  {
    id: "p2",
    title: "Summer Dress",
    link: "/product.html",
    imgSrc:
      "https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/DECEMBER/3/VzJLi8hZ_a6b3063eff284b23b9a32be04cf2ece3.jpg",
  },
  {
    id: "p3",
    title: "Sneakers",
    link: "/product.html",
    imgSrc:
      "https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/DECEMBER/3/mDW9k3p2_75d383227e534eaabd3c199ae64741be.jpg",
  },
  {
    id: "p4",
    title: "Formal Shirt",
    link: "/product.html",
    imgSrc:
      "https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/DECEMBER/3/qFMCHNPo_7fca5484801c4d3a8a82684f9b6fade0.jpg",
  },
  {
    id: "p5",
    title: "Jeans",
    link: "/product.html",
    imgSrc:
      "https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/DECEMBER/3/vvBa6N1n_1139ebfa996543bea239e0e10901e4ca.jpg",
  },
  {
    id: "p6",
    title: "Sunglasses",
    link: "/product.html",
    imgSrc:
      "https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/DECEMBER/3/W49F1n96_2420ec7ad1734a1bb8e71bcb4d758089.jpg",
  },
  {
    id: "p7",
    title: "Wrist Watch",
    link: "/product.html",
    imgSrc:
      "https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/DECEMBER/3/nSf8jSgM_019f49fba1b64d4da75502cad100ff86.jpg",
  },
  {
    id: "p8",
    title: "Backpack",
    link: "/product.html",
    imgSrc:
      "https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/DECEMBER/3/XR80788V_b4e05ac2326e46169cda6a7b80df3b12.jpg",
  },
  {
    id: "p9",
    title: "Cap",
    link: "/product.html",
    imgSrc:
      "https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/DECEMBER/3/87mh6rXM_42f453263d94420789c75c51386138f3.jpg",
  },
  {
    id: "p10",
    title: "Ankle Boots",
    link: "/product.html",
    imgSrc:
      "https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/DECEMBER/3/QH6Ef8dN_cb59a6614c84457c8d2f5278355a3e1a.jpg",
  },
  {
    id: "p11",
    title: "Dress",
    link: "/product.html",
    imgSrc:
      "https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/DECEMBER/3/WedGaK3d_cfbfd5dbfa984eaebcd22bb34be12f41.jpg",
  },
  {
    id: "p12",
    title: "T-shirt",
    link: "/product.html",
    imgSrc:
      "https://assets.myntassets.com/f_webp,w_163,c_limit,fl_progressive,dpr_2.0/assets/images/2025/DECEMBER/3/sYiMbNUP_403328dfcdb24934b41b7ccbeb5c8080.jpg",
  },
];

function createCards(data) {
  return data
    .map(
      (item) => `
        <div class="col-6 col-md-4 col-lg-2 g-0">
            <div class="card h-100 border-0 shadow-sm text-center">
                <a href="${item.link}"><img src="${item.imgSrc}" class="card-img-top img-fluid" alt="${item.title}"></a>
            </div>
        </div>
    `
    )
    .join("");
}

function renderGrid() {
  const container = document.getElementById("product-grid-container");
  if (!container) return;
  container.innerHTML = createCards(productData);
}

function ensureLoggedIn() {
  // If no Auth object is available, redirect to login
  if (!window.Auth) {
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    window.location.href = "login.html";
    return false;
  }

  // Check if user is logged in
  if (!window.Auth.isUserLoggedIn()) {
    // Only set redirect if we're not already on the login page
    if (!window.location.pathname.endsWith("login.html")) {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    }
    window.location.href = "login.html";
    return false;
  }

  // Check if profile is complete
  if (!window.Auth.hasCompleteProfile()) {
    // Only redirect to profile if we're not already there
    if (!window.location.pathname.endsWith("profile.html")) {
      sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
      window.location.href = "profile.html";
      return false;
    }
  }

  return true;
}

function renderCartPage() {
  const el = document.getElementById("cart-container");
  if (!el) return;

  // Check if we're already on the login page to prevent loops
  if (window.location.pathname.endsWith("login.html")) {
    return;
  }

  // Check authentication
  if (!window.Auth || !window.Auth.isUserLoggedIn()) {
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    window.location.href = "login.html";
    return;
  }

  // Check if profile is complete
  if (!window.Auth.hasCompleteProfile()) {
    sessionStorage.setItem("redirectAfterLogin", window.location.pathname);
    window.location.href = "profile.html";
    return;
  }

  // If we get here, user is logged in and profile is complete
  const cart = getCart();
  if (!cart.length) {
    el.innerHTML = `
      <div class="text-center py-5">
        <div class="mb-4">
          <i class="bi bi-cart-x" style="font-size: 3rem; color: #ddd;"></i>
        </div>
        <h4 class="mb-3">Your cart is empty</h4>
        <p class="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
        <a href="/" class="btn btn-primary px-4">
          <i class="bi bi-arrow-left me-2"></i>Continue Shopping
        </a>
      </div>`;
    return;
  }

  let subtotal = 0;
  const cartItems = cart
    .map((item) => {
      const lineTotal = (item.price || 0) * (item.qty || 1);
      subtotal += lineTotal;

      return `
        <div class="card mb-3 cart-item" data-id="${item.id}">
             <div class="row g-0">
               <!-- Product Image -->
               <div class="col-4 col-md-2">
                 <img src="${item.img || item.imgSrc || 'https://via.placeholder.com/150'}" 
                      class="img-fluid rounded-start" 
                       alt="${item.title || 'Product image'}" 
                       style="height: 140px; object-fit: cover;">
                </div>

          <!-- Product Details -->
          <div class="col-8 col-md-5">
            <div class="card-body h-100 d-flex flex-column">
              <div class="mb-2">
                <h5 class="card-title mb-1">${item.title}</h5>
                <p class="text-muted small mb-2">Size: ${
                  item.size || "One Size"
                }</p>
              </div>
              
              <!-- Quantity Selector -->
              <div class="d-flex align-items-center mb-2">
                <span class="me-2 small">Qty:</span>
                <div class="input-group input-group-sm" style="width: 120px;">
                  <button class="btn btn-outline-secondary px-2 quantity-btn" data-action="decrease" data-id="${
                    item.id
                  }">-</button>
                  <input type="number" class="form-control text-center cart-qty" value="${
                    item.qty
                  }" min="1" max="10" data-id="${item.id}">
                  <button class="btn btn-outline-secondary px-2 quantity-btn" data-action="increase" data-id="${
                    item.id
                  }">+</button>
                </div>
              </div>
              
              <div class="mt-auto">
                <button class="btn btn-sm btn-outline-danger btn-remove" data-id="${
                  item.id
                }">
                  <i class="bi bi-trash"></i> Remove
                </button>
              </div>
            </div>
          </div>
          
          <!-- Price and Total -->
          <div class="col-12 col-md-5">
            <div class="card-body h-100 d-flex flex-column justify-content-between">
              <div class="text-md-end">
                <div class="mb-2">
                  <span class="text-muted">Price:</span>
                  <span class="fw-bold ms-2">₹${item.price.toFixed(2)}</span>
                </div>
                <div class="mb-2">
                  <span class="text-muted">Total:</span>
                  <span class="fw-bold ms-2">₹${lineTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                <small class="text-muted">Free delivery</small>
                <div class="text-success">
                  <i class="bi bi-check-circle-fill me-1"></i>
                  <small>In Stock</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  el.innerHTML = `
    <div class="row">
      <div class="col-lg-8">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="mb-0">Shopping Cart (${cart.length})</h4>
          <a href="/" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-arrow-left me-1"></i> Continue Shopping
          </a>
        </div>
        
        <div class="cart-items">
          ${cartItems}
        </div>
      </div>
      
      <div class="col-lg-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title mb-4">Order Summary</h5>
            
            <div class="d-flex justify-content-between mb-2">
              <span>Subtotal (${cart.reduce(
                (sum, item) => sum + (item.qty || 1),
                0
              )} items)</span>
              <span>₹${subtotal.toFixed(2)}</span>
            </div>
            
            <div class="d-flex justify-content-between mb-2">
              <span>Delivery</span>
              <span class="text-success">Free</span>
            </div>
            
            <div class="d-flex justify-content-between fw-bold mt-3 pt-3 border-top">
              <span>Total Amount</span>
              <span>₹${subtotal.toFixed(2)}</span>
            </div>
            
            <div class="d-grid mt-4">
              <button id="checkout-btn" class="btn btn-primary btn-lg">
                Proceed to Checkout
              </button>
            </div>
            
            <div class="text-center mt-3">
              <img src="https://www.logo.wine/a/logo/Visa_Inc./Visa_Inc.-Logo.wine.svg" alt="Visa" style="height: 24px;" class="me-2">
              <img src="https://www.logo.wine/a/logo/Mastercard/Mastercard-Logo.wine.svg" alt="Mastercard" style="height: 24px;">
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add event listeners for quantity buttons
  el.querySelectorAll('.quantity-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const action = e.target.getAttribute('data-action');
      const id = e.target.getAttribute('data-id');
      const cart = getCart();
      const item = cart.find(item => item.id === id);
      
      if (!item) return;
      
      if (action === 'increase' && item.qty < 10) {
        item.qty += 1;
      } else if (action === 'decrease' && item.qty > 1) {
        item.qty -= 1;
      }
      
      saveCart(cart);
      renderCartPage();
    });
  });
  
  // Add event listeners for quantity inputs
  el.querySelectorAll('.cart-qty').forEach(input => {
    input.addEventListener('change', (e) => {
      const id = e.target.getAttribute('data-id');
      let qty = parseInt(e.target.value, 10) || 1;
      if (qty < 1) qty = 1;
      if (qty > 10) qty = 10;
      
      const cart = getCart();
      const item = cart.find(item => item.id === id);
      if (item) {
        item.qty = qty;
        saveCart(cart);
        renderCartPage();
      }
    });
  });
  
  // Add event listeners for remove buttons
  el.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id') || e.target.closest('[data-id]')?.getAttribute('data-id');
      if (!id) return;
      
      const cart = getCart().filter(item => item.id !== id);
      saveCart(cart);
      renderCartPage();
    });
  });
      
      // Update the input field immediately for better UX
      const qtyInput = document.querySelector(`.cart-qty[data-id="${id}"]`);
      if (qtyInput) {
        qtyInput.value = item.qty;
      }
      
      saveCart(cart);
      renderCartPage();
    };
  
  // listeners for direct quantity input
  el.querySelectorAll(".cart-qty").forEach((input) => {
    input.addEventListener("change", (e) => {
      const id = e.target.dataset.id;
      let qty = parseInt(e.target.value, 10);
      if (isNaN(qty) || qty < 1) qty = 1;
      if (qty > 10) qty = 10; // Enforce max quantity
      const cart = getCart();
      const it = cart.find((x) => x.id === id);
      if (it) {
        it.qty = qty;
        saveCart(cart);
        renderCartPage();
      }
    });
  });

  el.querySelectorAll(".btn-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.target.dataset.id;
      let cart = getCart();
      cart = cart.filter((x) => x.id !== id);
      saveCart(cart);
      renderCartPage();
    });
  });

  // Function to format address for display
  function formatAddress(profile) {
    if (!profile || !profile.address) return 'No address saved. Please update your profile.';
    
    const { line1, line2, city, state, pincode } = profile.address;
    let address = `<div><strong>${profile.name || 'User'}</strong></div>`;
    address += `<div>${line1 || ''}</div>`;
    if (line2) address += `<div>${line2}</div>`;
    address += `<div>${city || ''}, ${state || ''} ${pincode || ''}</div>`;
    if (profile.phone) address += `<div class="mt-1"><i class="bi bi-telephone"></i> ${profile.phone}</div>`;
    return address;
  }

  // Show address confirmation modal
  function showAddressConfirmation() {
    try {
      console.log('showAddressConfirmation called');
      const profile = Auth.getUserProfile();
      
      // Check if profile has complete address
      if (!profile || !profile.address || !profile.address.line1) {
        console.log('No address found, redirecting to profile page');
        window.location.href = 'profile.html?redirect=cart';
        return;
      }

      // Populate address display
      const addressDisplay = document.getElementById('address-details');
      if (!addressDisplay) {
        console.error('Address display element not found');
        return;
      }
      addressDisplay.innerHTML = formatAddress(profile);
      
      // Populate form fields for editing
      if (profile.address) {
        const setValue = (id, value) => {
          const el = document.getElementById(id);
          if (el) el.value = value || '';
        };
        
        setValue('edit-address-line1', profile.address.line1);
        setValue('edit-address-line2', profile.address.line2);
        setValue('edit-city', profile.address.city);
        setValue('edit-state', profile.address.state);
        setValue('edit-pincode', profile.address.pincode);
      }

      // Show the modal using Bootstrap 5's modal
      const modalEl = document.getElementById('addressModal');
      if (!modalEl) {
        console.error('Address modal element not found');
        // Fallback to simple confirmation
        if (confirm('Proceed to checkout with your saved address?')) {
          processOrder();
        }
        return;
      }
      
      // Try to show the modal using Bootstrap 5's modal
      try {
        // Check if Bootstrap is available
        if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
          const modal = new bootstrap.Modal(modalEl);
          modal.show();
          console.log('Bootstrap modal shown successfully');
        } else {
          // Fallback to direct style manipulation
          console.log('Bootstrap not available, using fallback');
          modalEl.classList.add('show');
          modalEl.style.display = 'block';
          modalEl.setAttribute('aria-modal', 'true');
          modalEl.setAttribute('role', 'dialog');
          document.body.classList.add('modal-open');
          
          // Add backdrop
          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop fade show';
          document.body.appendChild(backdrop);
          
          // Handle close button
          const closeButtons = modalEl.querySelectorAll('[data-bs-dismiss="modal"]');
          closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
              modalEl.classList.remove('show');
              modalEl.style.display = 'none';
              document.body.classList.remove('modal-open');
              const backdrop = document.querySelector('.modal-backdrop');
              if (backdrop) backdrop.remove();
            });
          });
        }
      } catch (error) {
        console.error('Error showing modal:', error);
        // Fallback to simple confirmation
        if (confirm('Proceed to checkout with your saved address?')) {
          processOrder();
        }
      }
      
    } catch (error) {
      console.error('Error in showAddressConfirmation:', error);
      // Final fallback to simple confirmation
      if (confirm('Proceed to checkout with your saved address?')) {
        processOrder();
      }
    }
  }

  // Initialize address modal event listeners
  function initAddressModal() {
    const modal = document.getElementById('addressModal');
    if (!modal) return;

    // Edit address button
    document.getElementById('edit-address-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('address-display').classList.add('d-none');
      document.getElementById('address-form').classList.remove('d-none');
    });

    // Cancel edit button
    document.getElementById('cancel-edit-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('address-display').classList.remove('d-none');
      document.getElementById('address-form').classList.add('d-none');
    });

    // Save address form
    document.getElementById('address-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const profile = Auth.getUserProfile();
      if (!profile) return;
      
      // Update address
      profile.address = {
        line1: document.getElementById('edit-address-line1').value.trim(),
        line2: document.getElementById('edit-address-line2').value.trim(),
        city: document.getElementById('edit-city').value.trim(),
        state: document.getElementById('edit-state').value,
        pincode: document.getElementById('edit-pincode').value.trim()
      };
      
      // Save the updated profile
      Auth.saveUserProfile(profile);
      
      // Update the displayed address
      document.getElementById('address-details').innerHTML = formatAddress(profile);
      
      // Switch back to display mode
      document.getElementById('address-display').classList.remove('d-none');
      document.getElementById('address-form').classList.add('d-none');
      
      // Show success message
      const successAlert = document.createElement('div');
      successAlert.className = 'alert alert-success alert-dismissible fade show mt-3';
      successAlert.innerHTML = `
        <span>Address updated successfully!</span>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.querySelector('.modal-body').prepend(successAlert);
      
      // Remove the alert after 3 seconds
      setTimeout(() => {
        successAlert.remove();
      }, 3000);
    });

    // Proceed to payment button
    document.getElementById('proceed-to-payment')?.addEventListener('click', () => {
      modal.querySelector('.btn-close').click(); // Close the modal
      processOrder();
    });
  }

  // Process the order after address confirmation
  function processOrder() {
    if (!confirm("Proceed to place order with Cash on Delivery?")) return;

      // Get user profile for order details
      const userProfile = Auth.getUserProfile();
      const cart = getCart();

      // In a real app, you would send this to your backend
      console.log("Order placed with shipping info:", {
        user: {
          name: userProfile.name,
          email: userProfile.email,
          phone: userProfile.phone,
        },
        shippingAddress: userProfile.address,
        items: cart,
        total: cart.reduce((sum, item) => sum + item.price * item.qty, 0),
        paymentMethod: "Cash on Delivery",
        orderDate: new Date().toISOString(),
      });

      // Clear cart and show success
      saveCart([]);

      // Show order confirmation
      el.innerHTML = `
                <div class="alert alert-success">
                    <h4 class="alert-heading">Order Placed Successfully!</h4>
                    <p>Your order has been placed successfully with Cash on Delivery.</p>
                    <hr>
                    <p class="mb-0">Order will be delivered to: <strong>${userProfile.address.line1}, ${userProfile.address.city}, ${userProfile.address.state} - ${userProfile.address.pincode}</strong></p>
                    <p class="mt-3"><a href="/" class="btn btn-primary">Continue Shopping</a></p>
                </div>
            `;
    }
  