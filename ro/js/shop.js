const products = [
    {
        "id": 1,
        "title": "Decorațiune Tematică cu Arcadă de Baloane",
        "img": "../assets/shop/ballonbogen1.png",
        "price": 180,
        "category": "Decorațiuni din Baloane",
        "tags": [
            "Decorațiuni",
            "Premium"
        ],
        "shortDesc": "Arcadă decorativă din baloane pentru evenimente.",
        "longDesc": "<h2>Descriere</h2>\n<p>Transformă-ți evenimentul într-un cadru de vis cu arcada noastră decorativă din baloane, perfectă pentru zile de naștere, petreceri pentru copii, botezuri, aniversări sau evenimente corporative.</p>"
    },
    {
        "id": 2,
        "title": "Decorațiune Tematică cu Arcadă de Baloane 2",
        "img": "../assets/shop/ballonbogen2.png",
        "price": 180,
        "category": "Decorațiuni din Baloane",
        "tags": [
            "Decorațiuni",
            "Premium"
        ],
        "shortDesc": "Arcadă decorativă din baloane pentru evenimente.",
        "longDesc": "<h2>Descriere</h2>\n<p>Transformă-ți evenimentul într-un cadru de vis cu arcada noastră decorativă din baloane, perfectă pentru zile de naștere, petreceri pentru copii, botezuri, aniversări sau evenimente corporative.</p>"
    },
    {
        "id": 3,
        "title": "Decorațiuni pentru Evenimente",
        "img": "../assets/shop/deko1.png",
        "price": 180,
        "category": "Decorațiuni din Baloane",
        "tags": [
            "Decorațiuni",
            "Premium"
        ],
        "shortDesc": "Decorațiuni elegante pentru evenimente.",
        "longDesc": "<h2>Descriere</h2>\n<p>Transformă-ți evenimentul într-un cadru de vis cu decorațiunile noastre elegante, perfectă pentru zile de naștere, petreceri pentru copii, botezuri, aniversări sau evenimente corporative.</p>"
    }
];

let filteredProducts = [...products];
let currentPage = 1;
const itemsPerPage = 6;
let currentCategory = 'Alle';
let currentMaxPrice = 20000;
let currentTag = '';
let cart = [];

// DOM Elements
const productGrid = document.getElementById('product-grid');
const paginationContainer = document.getElementById('pagination-container');
const categoryLinks = document.querySelectorAll('.category-link');
const tagLinks = document.querySelectorAll('.tag-link');
const priceRange = document.getElementById('price-range');
const priceDisplay = document.getElementById('price-display');
const resultsCount = document.getElementById('results-count');

// Modal Elements
const productModal = document.getElementById('product-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalPrice = document.getElementById('modal-price');
const modalShortDesc = document.getElementById('modal-short-desc');
const modalLongDesc = document.getElementById('modal-long-desc');
const modalAddToCartBtn = document.getElementById('modal-add-to-cart');

// Cart Elements
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const emptyCartMsg = document.getElementById('empty-cart-msg');

function initShop() {
    renderProducts();
    setupEventListeners();
    updateCartUI();
}

function setupEventListeners() {
    // Category filtering
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            categoryLinks.forEach(l => l.classList.remove('text-gold', 'font-semibold'));
            e.target.classList.add('text-gold', 'font-semibold');
            currentCategory = e.target.dataset.category;
            currentTag = ''; // Reset tag
            tagLinks.forEach(l => l.classList.remove('bg-gold', 'text-white'));
            applyFilters();
        });
    });

    // Tag filtering
    tagLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Toggle tag
            if (currentTag === e.target.dataset.tag) {
                currentTag = '';
                e.target.classList.remove('bg-gold', 'text-white');
            } else {
                tagLinks.forEach(l => l.classList.remove('bg-gold', 'text-white'));
                currentTag = e.target.dataset.tag;
                e.target.classList.add('bg-gold', 'text-white');
            }
            applyFilters();
        });
    });

    // Price filtering
    if (priceRange) {
        priceRange.addEventListener('input', (e) => {
            currentMaxPrice = parseInt(e.target.value);
            priceDisplay.textContent = currentMaxPrice + ' €';
        });
        
        priceRange.addEventListener('change', () => {
            applyFilters();
        });
    }

    // Modal Close
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
}

function openModal(id) {
    const product = products.find(p => p.id === id);
    if (!product || !productModal) return;

    modalImg.src = product.img;
    modalTitle.textContent = product.title;
    modalPrice.textContent = product.price + ' €';
    modalShortDesc.textContent = product.shortDesc;
    
    // Inject long desc HTML
    modalLongDesc.innerHTML = product.longDesc;

    // Set Add to Cart action
    if (modalAddToCartBtn) {
        modalAddToCartBtn.onclick = () => {
            addToCart(product.id);
            closeModal();
        };
    }

    productModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeModal() {
    if (!productModal) return;
    productModal.classList.add('hidden');
    document.body.style.overflow = '';
}

function applyFilters() {
    filteredProducts = products.filter(p => {
        const matchCategory = currentCategory === 'Alle' || p.category === currentCategory;
        const matchTag = currentTag === '' || p.tags.includes(currentTag);
        const matchPrice = p.price <= currentMaxPrice;
        return matchCategory && matchTag && matchPrice;
    });

    currentPage = 1; // Reset to page 1
    renderProducts();
}

function renderProducts() {
    if (!productGrid) return;
    
    // Calculate pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageProducts = filteredProducts.slice(startIndex, endIndex);

    // Update count display
    if (resultsCount) {
        resultsCount.textContent = `Zeigt ${filteredProducts.length > 0 ? startIndex + 1 : 0}-${Math.min(endIndex, filteredProducts.length)} von ${filteredProducts.length} Ergebnissen`;
    }

    // Render Grid
    if (pageProducts.length === 0) {
        productGrid.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">Keine Produkte gefunden, die diesen Kriterien entsprechen.</div>';
    } else {
        productGrid.innerHTML = pageProducts.map(p => `
            <div class="bg-white shadow-sm hover:shadow-md transition-shadow group flex flex-col fade-in cursor-pointer overflow-hidden rounded-xl border border-gray-100" onclick="openModal(${p.id})">
                <div class="overflow-hidden relative aspect-square bg-gray-50 flex items-center justify-center p-4">
                    ${p.tags.includes('Premium') ? '<div class="absolute top-2 right-2 bg-gold text-white text-xs px-2 py-1 z-10 uppercase tracking-widest rounded shadow-sm">Premium</div>' : ''}
                    <img src="${p.img}" alt="${p.title}" class="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-lg mb-2 font-semibold text-gray-900 group-hover:text-gold transition-colors">${p.title}</h3>
                    <p class="text-sm text-gray-500 line-clamp-2 mb-4">${p.shortDesc}</p>
                    <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                        <span class="text-gold font-serif text-xl font-medium">${p.price} €</span>
                        <div class="flex space-x-3 items-center">
                            <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gold transition-colors">Details &rarr;</span>
                            <button onclick="event.stopPropagation(); addToCart(${p.id})" class="bg-gray-100 hover:bg-gold hover:text-white text-gray-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors" title="In den Warenkorb">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Render Pagination
    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    if (!paginationContainer) return;
    
    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="w-10 h-10 flex items-center justify-center border border-gold bg-gold text-white rounded-full mx-1 cursor-default shadow-md">${i}</button>`;
        } else {
            html += `<button class="page-btn w-10 h-10 flex items-center justify-center border border-gray-300 text-gray-500 rounded-full hover:bg-gold hover:text-white hover:border-gold transition-colors mx-1" data-page="${i}">${i}</button>`;
        }
    }
    
    paginationContainer.innerHTML = html;

    // Attach events to new buttons
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentPage = parseInt(e.target.dataset.page);
            renderProducts();
            // Scroll to top of grid
            window.scrollTo({ top: productGrid.offsetTop - 100, behavior: 'smooth' });
        });
    });
}

// Cart Logic
function addToCart(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    
    // Optional: visual feedback
    const btn = document.getElementById('checkout-btn');
    if(btn) {
        btn.classList.add('scale-105');
        setTimeout(() => btn.classList.remove('scale-105'), 200);
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function updateCartUI() {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        if (emptyCartMsg) emptyCartMsg.classList.remove('hidden');
        if (checkoutBtn) {
            checkoutBtn.classList.add('opacity-50', 'pointer-events-none');
            checkoutBtn.classList.remove('hover:bg-gold-dark');
        }
        if (cartTotalElement) cartTotalElement.textContent = '0 €';
        return;
    }

    if (emptyCartMsg) emptyCartMsg.classList.add('hidden');
    if (checkoutBtn) {
        checkoutBtn.classList.remove('opacity-50', 'pointer-events-none');
        checkoutBtn.classList.add('hover:bg-gold-dark');
    }

    let total = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `
            <div class="flex justify-between items-start border-b border-gray-100 pb-3 fade-in">
                <div class="flex-grow pr-2">
                    <p class="text-sm font-semibold text-gray-900 line-clamp-1" title="${item.title}">${item.title}</p>
                    <p class="text-xs text-gray-500">${item.quantity} x ${item.price} €</p>
                </div>
                <div class="flex flex-col items-end">
                    <button onclick="removeFromCart(${item.id})" class="text-gray-400 hover:text-red-500 transition-colors p-1" title="Entfernen">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <p class="text-sm font-medium text-gold mt-1">${item.price * item.quantity} €</p>
                </div>
            </div>
        `;
    }).join('');

    if (cartTotalElement) {
        cartTotalElement.textContent = total + ' €';
    }
}

document.addEventListener('DOMContentLoaded', initShop);


// --- Checkout Logic ---
const checkoutBtnMain = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const checkoutOverlay = document.getElementById('checkout-overlay');
const checkoutClose = document.getElementById('checkout-close');
const checkoutForm = document.getElementById('checkout-form');
const checkoutTotalDisplay = document.getElementById('checkout-total');
const checkoutSuccess = document.getElementById('checkout-success');
const checkoutSubmit = document.getElementById('checkout-submit');

function openCheckout() {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const checkoutTotalDisplay = document.getElementById('checkout-total');
    if (checkoutTotalDisplay) checkoutTotalDisplay.textContent = total + ' €';
    
    if (window.currentUser) {
        const emailField = document.getElementById('checkout-email');
        const nameField = document.getElementById('checkout-name');
        if (emailField) emailField.value = window.currentUser.email || '';
        if (nameField && window.currentUser.displayName) nameField.value = window.currentUser.displayName;
        
        const authP = document.getElementById('checkout-auth-prompt') || document.getElementById('auth-prompt');
        const persF = document.getElementById('checkout-personal-fields');
        const nameG = document.getElementById('name-group');
        const emailG = document.getElementById('email-group');
        
        if (authP) authP.classList.add('hidden');
        if (persF) persF.classList.remove('hidden');
        if (nameG) nameG.classList.remove('hidden');
        if (emailG) emailG.classList.remove('hidden');
        
        try {
            window.firebaseGetDoc(window.firebaseDoc(window.firebaseDb, "users", window.currentUser.uid)).then(docSnap => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    if (nameField && !nameField.value && userData.name) nameField.value = userData.name;
                    const phoneField = document.getElementById('checkout-phone');
                    if (phoneField && !phoneField.value && userData.phone) phoneField.value = userData.phone;
                    const addressField = document.getElementById('checkout-address');
                    if (addressField && !addressField.value && userData.address) addressField.value = userData.address;
                }
            }).catch(e => console.warn(e));
        } catch(e) {}
    } else {
        const authP = document.getElementById('checkout-auth-prompt') || document.getElementById('auth-prompt');
        const persF = document.getElementById('checkout-personal-fields');
        const nameG = document.getElementById('name-group');
        const emailG = document.getElementById('email-group');
        
        if (authP) authP.classList.remove('hidden');
        if (persF) persF.classList.add('hidden');
        if (nameG && emailG) {
            if (!authP) {
                nameG.classList.remove('hidden');
                emailG.classList.remove('hidden');
            }
        }
    }

    checkoutModal.classList.remove('hidden');
    checkoutSuccess.classList.add('hidden');
    checkoutSubmit.disabled = false;
    document.body.style.overflow = 'hidden';
}

function closeCheckout() {
    checkoutModal.classList.add('hidden');
    document.body.style.overflow = '';
}

if (checkoutBtnMain) checkoutBtnMain.addEventListener('click', openCheckout);
if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);
if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckout);

if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        checkoutSubmit.disabled = true;
        
        const name = document.getElementById('checkout-name').value;
        const email = document.getElementById('checkout-email').value;
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const orderData = {
            type: 'shop',
            customerName: name,
              customerEmail: email,
            totalPrice: total,
            items: cart,
            createdAt: window.firebaseServerTimestamp(),
            status: 'Neu'
        };

        try {
            orderData.status = 'Zahlung Ausstehend (Stripe)';
            const docRef = await window.firebaseAddDoc(window.firebaseCollection(window.firebaseDb, "orders"), orderData);
            
            checkoutSubmit.textContent = "Redirecționare către Stripe...";
            
            const response = await fetch('https://us-central1-selena-events-dashboard.cloudfunctions.net/createStripeCheckout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    customerEmail: email, orderId: docRef.id,
                    successUrl: window.location.origin + window.location.pathname + '?checkout=success',
                    cancelUrl: window.location.origin + window.location.pathname + '?checkout=cancelled'
                })
            });
            
            if (!response.ok) {
                throw new Error(await response.text());
            }
            
            const sessionData = await response.json();
            window.location.href = sessionData.url;
        } catch (error) {
            console.error("Error adding document: ", error);
            alert("Fehler beim Senden: " + error.message + " (Bitte Firebase Rules prüfen)");
            checkoutSubmit.disabled = false;
        }
    });
}


// --- Mobile Modals Logic ---
setTimeout(() => {
    const mobileNavActions = document.querySelector('.lg\\:hidden');
    if (mobileNavActions && !document.getElementById('mobile-cart-btn')) {
        const cartBtn = document.createElement('button');
        cartBtn.id = "mobile-cart-btn";
        cartBtn.className = "flex items-center mr-4 text-gray-800 hover:text-gold transition-colors";
        cartBtn.innerHTML = `
            <div class="relative">
                <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                <span id="mobile-cart-badge" class="absolute -top-2 -right-1 bg-gold text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center hidden">0</span>
            </div>
            <span class="text-sm font-medium">Coș</span>
        `;
        mobileNavActions.insertBefore(cartBtn, mobileNavActions.firstChild);

        cartBtn.addEventListener('click', () => {
            document.body.classList.toggle('mobile-cart-open');
            document.body.classList.remove('mobile-filter-open');
        });
    }

    const filterBtn = document.getElementById('mobile-filter-btn');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            document.body.classList.toggle('mobile-filter-open');
            document.body.classList.remove('mobile-cart-open');
        });
    }

    const aside = document.getElementById('sidebar-filters');
    if (aside) {
        aside.addEventListener('click', (e) => {
            if (e.target === aside) {
                document.body.classList.remove('mobile-cart-open');
                document.body.classList.remove('mobile-filter-open');
            }
        });
    }
    
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            document.body.classList.remove('mobile-cart-open');
        });
    }
}, 500);


// --- Mobile Cart Badge Logic ---
if (typeof updateCartUI === 'function') {
    const originalUpdateCartUI = updateCartUI;
    updateCartUI = function() {
        originalUpdateCartUI();
        const badge = document.getElementById('mobile-cart-badge');
        if (badge) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            if (totalItems > 0) {
                badge.textContent = totalItems;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    };
}


// --- Shared Persistent Cart Overrides ---
const CART_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function loadCart() {
    try {
        const storedStr = localStorage.getItem('selena_cart');
        if (!storedStr) return [];
        
        const stored = JSON.parse(storedStr);
        
        // Handle migration from previous array-only storage
        if (Array.isArray(stored)) {
            return stored;
        }
        
        if (stored && stored.timestamp) {
            if (Date.now() - stored.timestamp > CART_EXPIRY_MS) {
                localStorage.removeItem('selena_cart');
                return [];
            }
            return stored.items || [];
        }
    } catch (e) {
        console.error("Error loading cart", e);
    }
    return [];
}

cart = loadCart();

function saveCart() {
    localStorage.setItem('selena_cart', JSON.stringify({
        items: cart,
        timestamp: Date.now()
    }));
}

const isShopPage = true;
const currentSource = isShopPage ? 'shop' : 'verleih';

addToCart = function(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const existingItem = cart.find(item => String(item.id) === String(id) && item.source === currentSource);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1, source: currentSource });
    }

    saveCart();
    updateCartUI();
    
    // Optional: visual feedback
    const btn = document.getElementById('checkout-btn');
    if (btn) {
        btn.classList.add('bg-gold-dark');
        setTimeout(() => btn.classList.remove('bg-gold-dark'), 200);
    }
};

removeFromCart = function(id) {
    // Only remove matching ID for the current context
    cart = cart.filter(item => !(String(item.id) === String(id) && item.source === currentSource));
    saveCart();
    updateCartUI();
};

updateCartUI = function() {
    if (!cartItemsContainer) return;

    // Filter to ONLY show items for the current page context
    const visibleItems = cart.filter(i => i.source === currentSource);
    const totalItems = visibleItems.reduce((sum, item) => sum + item.quantity, 0);

    // Update Mobile Cart Badge
    const badge = document.getElementById('mobile-cart-badge');
    if (badge) {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }
    
    // Cleanup any dual buttons from previous iteration
    let actions = document.getElementById('cart-actions-container');
    if (actions) actions.remove();

    if (visibleItems.length === 0) {
        cartItemsContainer.innerHTML = '';
        if (emptyCartMsg) emptyCartMsg.classList.remove('hidden');
        if (checkoutBtn) {
            checkoutBtn.style.display = ''; // restore normal display
            checkoutBtn.classList.add('opacity-50', 'pointer-events-none');
            checkoutBtn.classList.remove('hover:bg-gold-dark');
        }
        if (cartTotalElement) cartTotalElement.textContent = '0 €';
        return;
    }

    if (emptyCartMsg) emptyCartMsg.classList.add('hidden');
    if (checkoutBtn) {
        checkoutBtn.style.display = ''; // restore normal display
        checkoutBtn.classList.remove('opacity-50', 'pointer-events-none');
        checkoutBtn.classList.add('hover:bg-gold-dark');
    }

    let html = '';
    let total = 0;

    visibleItems.forEach(item => {
        total += item.price * item.quantity;
        html += `
            <div class="flex justify-between items-start border-b border-gray-100 pb-3 mt-3 fade-in">
                <div class="flex-grow pr-2">
                    <p class="text-sm font-semibold text-gray-900 line-clamp-1" title="${item.title}">${item.title}</p>
                    <p class="text-xs text-gray-500">${item.quantity} x ${item.price} €</p>
                </div>
                <div class="flex flex-col items-end">
                    <button onclick="removeFromCart(${item.id})" class="text-gray-400 hover:text-red-500 transition-colors p-1" title="Entfernen">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    <p class="text-sm font-medium text-gold mt-1">${item.price * item.quantity} €</p>
                </div>
            </div>`;
    });

    cartItemsContainer.innerHTML = html;

    if (cartTotalElement) {
        cartTotalElement.textContent = total + ' €';
    }
};

// Override openCheckout to handle specific source items
const originalOpenCheckout = typeof openCheckout === 'function' ? openCheckout : null;
if (originalOpenCheckout) {
    openCheckout = function() {
        const itemsToCheckout = cart.filter(i => i.source === currentSource);
        if (itemsToCheckout.length === 0) return;
        
        // Update checkout total display for this source only
        const total = itemsToCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (checkoutTotalDisplay) checkoutTotalDisplay.textContent = total + ' €';
        
        if (checkoutModal) {
            checkoutModal.classList.remove('hidden');
            setTimeout(() => {
                checkoutModal.querySelector('div.relative').classList.add('scale-100', 'opacity-100');
                checkoutModal.querySelector('div.relative').classList.remove('scale-95', 'opacity-0');
            }, 10);
        }
    };
}

// Modify Submit Checkout to show Success Modal and clear partial cart
const hookCheckoutSuccess = () => {
    if (checkoutForm) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (checkoutSuccess && !checkoutSuccess.classList.contains('hidden')) {
                    // Order was successful!
                    checkoutSuccess.classList.add('hidden'); // Hide the inline text
                    if (checkoutModal) checkoutClose.click(); // Close checkout modal
                    
                    // Show success modal
                    const successModal = document.getElementById('success-modal');
                    if (successModal) {
                        successModal.classList.remove('hidden');
                        setTimeout(() => {
                            successModal.querySelector('div.relative').classList.add('scale-100', 'opacity-100');
                            successModal.querySelector('div.relative').classList.remove('scale-95', 'opacity-0');
                        }, 10);
                    }
                    
                    // Clear ONLY the items from the checked-out source
                    cart = cart.filter(i => i.source !== currentSource);
                    saveCart();
                    updateCartUI();
                }
            });
        });
        
        if (checkoutSuccess) {
            observer.observe(checkoutSuccess, { attributes: true, attributeFilter: ['class'] });
        }
    }
};
hookCheckoutSuccess();

// Initial render from localstorage
setTimeout(updateCartUI, 100);


// === CUSTOM PACKAGES LOGIC ===
window.fetchCustomPackages = async function() {
    try {
        const q = window.firebaseQuery(
            window.firebaseCollection(window.firebaseDb, "custom_packages"),
            window.firebaseWhere("visibleInShop", "==", true)
        );
        const querySnapshot = await window.firebaseGetDocs(q);
        
        let newPackages = [];
        querySnapshot.forEach((doc) => {
            const pkg = doc.data();
            
            // Build long description with items
            let itemsHtml = '<ul>';
            if (pkg.items && pkg.items.length > 0) {
                pkg.items.forEach(item => {
                    itemsHtml += '<li>' + item.title + '</li>';
                });
            }
            itemsHtml += '</ul>';
            
            // Get image from first item
            let imgUrl = '../assets/logo_dark.png'; // fallback
            if (pkg.items && pkg.items.length > 0) {
                const firstItem = pkg.items[0];
                if (firstItem.images && Array.isArray(firstItem.images)) {
                    imgUrl = firstItem.images[0];
                } else if (firstItem.img) {
                    imgUrl = firstItem.img;
                }
            }
            
            newPackages.push({
                id: doc.id,
                title: pkg.title,
                img: imgUrl,
                price: pkg.price,
                category: "Spezialangebote",
                tags: ["Premium", "Spezialpaket"],
                shortDesc: pkg.description || "Ein maßgeschneidertes Paket für Ihr Event.",
                longDesc: '<h2>Beschreibung</h2><p>' + (pkg.description || '') + '</p><h3>Beinhaltet:</h3>' + itemsHtml,
                source: "package"
            });
        });
        
        if (newPackages.length > 0) {
            // Check to avoid duplicates on re-fetch
            const existingPackageIds = products.filter(p => p.source === 'package').map(p => p.id);
            newPackages = newPackages.filter(p => !existingPackageIds.includes(p.id));
            
            products.push(...newPackages);
            applyFilters();
        }
    } catch (error) {
        console.error("Error fetching custom packages:", error);
    }
};


// === CUSTOM PRODUCTS LOGIC ===
window.fetchCustomProducts = async function() {
    try {
        const q = window.firebaseQuery(
            window.firebaseCollection(window.firebaseDb, "custom_products"),
            window.firebaseWhere("visible", "==", true),
            window.firebaseWhere("target", "==", "shop")
        );
        const querySnapshot = await window.firebaseGetDocs(q);
        
        let newProducts = [];
        querySnapshot.forEach((doc) => {
            const prod = doc.data();
            
            // Build long description with features
            let featuresHtml = '';
            if (prod.features && prod.features.length > 0) {
                featuresHtml = '<h3>Eigenschaften:</h3><ul>' + prod.features.map(f => '<li>' + f + '</li>').join('') + '</ul>';
            }
            
            newProducts.push({
                id: doc.id,
                title: prod.title,
                img: prod.img || '../assets/logo_dark.png',
                price: prod.price,
                category: prod.category || "Neu",
                tags: prod.isPremium ? ["Custom", "Premium"] : ["Custom"],
                images: prod.images || [prod.img || '../assets/logo_dark.png'],
                shortDesc: prod.subtitle || "",
                longDesc: '<h2>Beschreibung</h2><p>' + (prod.subtitle || '') + '</p>' + featuresHtml,
                source: "custom"
            });
        });
        
        if (newProducts.length > 0) {
            // Check to avoid duplicates on re-fetch
            const existingProductIds = products.filter(p => p.source === 'custom').map(p => p.id);
            newProducts = newProducts.filter(p => !existingProductIds.includes(p.id));
            
            products.unshift(...newProducts);
            if (typeof applyFilters === 'function') applyFilters();
        }
    } catch (error) {
        console.error("Error fetching custom products:", error);
    }
};
