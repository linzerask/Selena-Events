const products = [
    {
        "id": 1,
        "title": "Themed Decoration with Balloon Arch",
        "img": "../assets/shop/ballonbogen1.png",
        "price": 180,
        "category": "Balloon Decoration",
        "tags": [
            "Decoration",
            "Premium"
        ],
        "shortDesc": "Decorative balloon arch for events.",
        "longDesc": "<h2>Description</h2>\n<p>Transform your event into a dreamlike setting with our decorative balloon arch, perfect for birthdays, children's parties, christenings, anniversaries, or corporate events.</p>"
    },
    {
        "id": 2,
        "title": "Themed Decoration with Balloon Arch 2",
        "img": "../assets/shop/ballonbogen2.png",
        "price": 180,
        "category": "Balloon Decoration",
        "tags": [
            "Decoration",
            "Premium"
        ],
        "shortDesc": "Decorative balloon arch for events.",
        "longDesc": "<h2>Description</h2>\n<p>Transform your event into a dreamlike setting with our decorative balloon arch, perfect for birthdays, children's parties, christenings, anniversaries, or corporate events.</p>"
    },
    {
        "id": 3,
        "title": "Event Decoration",
        "img": "../assets/shop/deko1.png",
        "price": 180,
        "category": "Balloon Decoration",
        "tags": [
            "Decoration",
            "Premium"
        ],
        "shortDesc": "Elegant event decoration.",
        "longDesc": "<h2>Description</h2>\n<p>Transform your event into a dreamlike setting with our elegant decoration, perfect for birthdays, children's parties, christenings, anniversaries, or corporate events.</p>"
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

    const modalShareBtn = document.getElementById('modal-share-btn');
    if (modalShareBtn) {
        modalShareBtn.onclick = () => {
            window.shareCatalogItem(encodeURIComponent(product.title), product.id, product.source || (window.location.pathname.includes('verleih') ? 'verleih' : 'shop'));
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
            <div class="bg-white shadow-sm hover:shadow-md transition-shadow group flex flex-col fade-in cursor-pointer overflow-hidden rounded-xl border border-gray-100" onclick="window.location.href='shop-items/product?id=${p.id}'">
                <div class="overflow-hidden relative aspect-square bg-gray-50 flex items-center justify-center p-4">
                    ${p.tags.includes('Premium') ? '<div class="absolute top-2 right-2 bg-gold text-white text-xs px-2 py-1 z-10 uppercase tracking-widest rounded shadow-sm">Premium</div>' : ''}
                    <img src="${p.img}" alt="${p.title}" class="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-lg mb-2 font-semibold text-gray-900 group-hover:text-gold transition-colors">${p.title}</h3>
                    <p class="text-sm text-gray-500 line-clamp-2 mb-4">${p.shortDesc}</p>
                    <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                        ${(() => {
                            if (p.priceMode === 'from') {
                                return `<span class="text-gold font-serif text-xl font-medium"><span class="text-xs text-gray-500 mr-1 font-normal">from</span>${p.price} €</span>`;
                            }
                            const isReq = p.priceMode === 'request' || String(p.price) === '0' || p.price === 'Auf Anfrage' || p.price === 'On Request' || p.price === 'La Cerere';
                            if (isReq) {
                                return '<span class="text-gold font-serif text-base font-semibold">On Request</span>';
                            }
                            return `<span class="text-gold font-serif text-xl font-medium">${p.price} €</span>`;
                        })()}
                        <div class="flex space-x-3 items-center">
                            <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gold transition-colors">Details &rarr;</span>
                            ${(() => {
                                const inWishlist = window.userWishlist && window.userWishlist.some(item => item.id == p.id && item.type == currentSource);
                                const heartFill = inWishlist ? 'currentColor' : 'none';
                                const heartClass = inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500 transition-colors';
                                return `
                            <button onclick="event.stopPropagation(); addToWishlist('${p.id}')" class="${heartClass}" title="${inWishlist ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}">
                                <svg class="w-6 h-6" fill="${heartFill}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                            </button>`;
                            })()}
                            <button onclick="event.stopPropagation(); window.shareCatalogItem(encodeURIComponent(p.title), p.id, 'shop')" class="bg-gray-100 hover:bg-gold hover:text-white text-gray-600 rounded-full w-8 h-8 flex items-center justify-center transition-colors" title="Produkt teilen">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                            </button>
                            ${(() => {
                                const isReq = p.priceMode === 'request' || p.priceMode === 'from' || String(p.price) === '0' || p.price === 'Auf Anfrage' || p.price === 'On Request' || p.price === 'La Cerere';
                                if (isReq) {
                                    return `
                                    <button onclick="event.stopPropagation(); window.openProductInquiryModal('${p.id}', 'shop')" class="bg-gold hover:bg-black text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-sm" title="Send Inquiry">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                    </button>`;
                                }
                                return `
                                <button onclick="event.stopPropagation(); addToCart('${p.id}')" class="bg-gray-900 hover:bg-gold text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-sm" title="Add to Cart">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                                </button>`;
                            })()}
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
    const checkItem = (typeof products !== 'undefined') ? products.find(p => String(p.id) === String(id)) : null;
    if (checkItem && (checkItem.priceMode === 'request' || String(checkItem.price) === '0' || checkItem.price === 'Auf Anfrage')) {
        if (typeof window.openProductInquiryModal === 'function') {
            window.openProductInquiryModal(id, 'shop');
        }
        return;
    }
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
    const checkoutSubtotalDisplay = document.getElementById('checkout-subtotal');
    if (checkoutSubtotalDisplay) checkoutSubtotalDisplay.textContent = total + ' €';
    const hasTransport = cart.some(i => i.transportEnabled && (i.pricePerKm > 0 || i.transportFlatFee > 0 || i.transportMode === 'distance'));
    const transportLine = document.getElementById('checkout-transport');
    if (transportLine) {
        if (hasTransport) {
            transportLine.textContent = "Calculated by address";
            transportLine.className = "text-xs font-semibold text-amber-600";
        } else {
            transportLine.textContent = "0 € (Free / Self-pickup)";
            transportLine.className = "text-sm text-gray-600";
        }
    }
    
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
                    window.currentUserProfileData = userData;
                    if (nameField && !nameField.value && userData.name) nameField.value = userData.name;
                    const phoneField = document.getElementById('checkout-phone');
                    if (phoneField && !phoneField.value && userData.phone) phoneField.value = userData.phone;
                    const addressField = document.getElementById('checkout-address');
                    const postcodeField = document.getElementById('checkout-postcode');
                    const sameAddrWrap = document.getElementById('checkout-same-address-wrapper');
                    const sameAddrCheckbox = document.getElementById('checkout-same-address');
                    if (sameAddrWrap && userData.address) {
                        sameAddrWrap.classList.remove('hidden');
                        if (sameAddrCheckbox) {
                            sameAddrCheckbox.checked = true;
                            if (addressField) addressField.value = userData.address || '';
                            if (postcodeField && userData.postcode) postcodeField.value = userData.postcode;
                        }
                    }
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

    document.body.classList.remove('mobile-cart-open');
    document.body.classList.remove('mobile-filter-open');
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
        const email = (window.currentUser && window.currentUser.email) ? window.currentUser.email : document.getElementById('checkout-email').value;
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
            
            checkoutSubmit.textContent = "Redirecting to Stripe...";
            
            const response = await fetch('https://us-central1-selena-events-dashboard.cloudfunctions.net/createStripeCheckout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: cart,
                    customer: { name, email, address, postcode, phone, eventDate, notes }, orderId: docRef.id,
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
            <span class="text-sm font-medium">Cart</span>
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
        if (storedStr) {
            const stored = JSON.parse(storedStr);
            if (Array.isArray(stored)) return stored;
            if (stored && stored.timestamp) {
                if (Date.now() - stored.timestamp <= CART_EXPIRY_MS) {
                    return stored.items || [];
                } else {
                    localStorage.removeItem('selena_cart');
                }
            }
        }
        const leg = localStorage.getItem('cart');
        if (leg) {
            const parsed = JSON.parse(leg);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch (e) {
        console.error("Error loading cart", e);
    }
    return [];
}

cart = loadCart();

function saveCart() {
    const data = JSON.stringify({ items: cart, timestamp: Date.now() });
    localStorage.setItem('selena_cart', data);
    localStorage.setItem('cart', JSON.stringify(cart));
}

const isShopPage = true;
const currentSource = isShopPage ? 'shop' : 'verleih';

addToCart = function(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const existingItem = cart.find(item => String(item.id) === String(id) && (item.source === currentSource || item.source === 'custom' || item.source === 'package'));
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1, source: product.source || currentSource });
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
    cart = cart.filter(item => !(String(item.id) === String(id) && (item.source === currentSource || item.source === 'custom' || item.source === 'package')));
    saveCart();
    updateCartUI();
};

updateCartUI = function() {
    if (!cartItemsContainer) return;

    // Filter to ONLY show items for the current page context
    const visibleItems = cart.filter(i => (i.source === currentSource || i.source === 'custom' || i.source === 'package'));
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
        const itemsToCheckout = cart.filter(i => (i.source === currentSource || i.source === 'custom' || i.source === 'package'));
        if (itemsToCheckout.length === 0) return;
        originalOpenCheckout();
        
        // Update checkout total display for this source only
        const total = itemsToCheckout.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (checkoutTotalDisplay) checkoutTotalDisplay.textContent = total + ' €';
    const checkoutSubtotalDisplay = document.getElementById('checkout-subtotal');
    if (checkoutSubtotalDisplay) checkoutSubtotalDisplay.textContent = total + ' €';
    const hasTransport = cart.some(i => i.transportEnabled && (i.pricePerKm > 0 || i.transportFlatFee > 0 || i.transportMode === 'distance'));
    const transportLine = document.getElementById('checkout-transport');
    if (transportLine) {
        if (hasTransport) {
            transportLine.textContent = "Calculated by address";
            transportLine.className = "text-xs font-semibold text-amber-600";
        } else {
            transportLine.textContent = "0 € (Free / Self-pickup)";
            transportLine.className = "text-sm text-gray-600";
        }
    }
        
        queueLiveTransportCalc();
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
                    cart = cart.filter(i => (i.source !== currentSource && i.source !== 'custom' && i.source !== 'package'));
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
            
            let pkgTags = Array.isArray(pkg.tags) && pkg.tags.length > 0 ? [...pkg.tags] : ["Premium", "Spezialpaket"];
            if (!pkgTags.includes('Spezialpaket')) pkgTags.push('Spezialpaket');

            newPackages.push({
                id: doc.id,
                title: pkg.title,
                img: imgUrl,
                price: pkg.price,
                category: "Spezialangebote",
                tags: pkgTags,
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
            const fixImgPath = (url) => {
                if (!url) return '../assets/logo_dark.png';
                if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
                if (url.startsWith('../')) return url;
                return '../' + url.replace(/^\.?\//, '');
            };
            const cleanImg = fixImgPath(prod.img);
            const cleanImages = (prod.images && Array.isArray(prod.images) && prod.images.length > 0) 
                ? prod.images.map(fixImgPath) 
                : [cleanImg];
            
            // Build long description with features
            let featuresHtml = '';
            if (prod.features && prod.features.length > 0) {
                featuresHtml = '<h3>Eigenschaften:</h3><ul>' + prod.features.map(f => '<li>' + f + '</li>').join('') + '</ul>';
            }
            
            let prodTags = Array.isArray(prod.tags) && prod.tags.length > 0 ? [...prod.tags] : [];
            if (!prodTags.includes('Custom')) prodTags.push('Custom');
            if (prod.isPremium && !prodTags.includes('Premium')) prodTags.unshift('Premium');

            newProducts.push({
                id: doc.id,
                title: prod.title,
                img: cleanImg,
                price: prod.price,
                priceMode: prod.priceMode || (prod.price == 0 ? 'request' : 'fixed'),
                category: prod.category || "Neu",
                tags: prodTags,
                images: cleanImages,
                shortDesc: prod.subtitle || "",
                longDesc: '<h2>Beschreibung</h2><p>' + (prod.subtitle || '') + '</p>' + featuresHtml,
                source: "custom",
                transportEnabled: prod.transportEnabled || false,
                pricePerKm: prod.pricePerKm !== undefined ? Number(prod.pricePerKm) : 0.50,
                transportFlatFee: prod.transportFlatFee ? Number(prod.transportFlatFee) : 0,
                transportMode: prod.transportMode || (prod.transportEnabled ? 'distance' : 'none')
            });
        });
        
        if (newProducts.length > 0) {
            // 1. Identify all IDs, legacy IDs, and normalized titles from Firestore products
            const importedKeys = new Set();
            newProducts.forEach(p => {
                if (p.id) {
                    importedKeys.add(String(p.id).toLowerCase());
                    const m = String(p.id).match(/^catalog_(?:shop|verleih)_(.*)$/i);
                    if (m) importedKeys.add(String(m[1]).toLowerCase());
                }
                if (p.legacyId) importedKeys.add(String(p.legacyId).toLowerCase());
                if (p.title) importedKeys.add(p.title.trim().toLowerCase());
            });

            // 2. Remove hardcoded/static clones from the products array
            for (let i = products.length - 1; i >= 0; i--) {
                const item = products[i];
                if (item.source !== 'custom' && item.source !== 'package') {
                    const strId = String(item.id).toLowerCase();
                    const strTitle = item.title ? item.title.trim().toLowerCase() : '';
                    if (importedKeys.has(strId) || importedKeys.has(strTitle)) {
                        products.splice(i, 1);
                    }
                }
            }

            // 3. Prevent duplicates among newProducts themselves
            const existingIds = new Set(products.map(p => String(p.id)));
            const uniqueNew = newProducts.filter(p => !existingIds.has(String(p.id)));

            // 4. Prepend live Firestore products so they are fully manageable
            products.unshift(...uniqueNew);
            if (typeof applyFilters === 'function') applyFilters();
        }
    } catch (error) {
        console.error("Error fetching custom products:", error);
    }
};

// Auto open modal if ?item= parameter present
document.addEventListener('DOMContentLoaded', () => {
    const itemParam = new URLSearchParams(window.location.search).get('item');
    if (itemParam && typeof openModal === 'function') {
        setTimeout(() => openModal(itemParam), 400);
    }
});

// --- Checkout Same-Address & Transport Display Hook ---
document.addEventListener('DOMContentLoaded', () => {
    const sameAddr = document.getElementById('checkout-same-address');
    if (sameAddr) {
        sameAddr.addEventListener('change', () => {
            const addressField = document.getElementById('checkout-address');
            const postcodeField = document.getElementById('checkout-postcode');
            if (sameAddr.checked && window.currentUserProfileData) {
                if (addressField) addressField.value = window.currentUserProfileData.address || '';
                if (postcodeField && window.currentUserProfileData.postcode) postcodeField.value = window.currentUserProfileData.postcode;
            }
        });
    }
});

// --- Auto-open checkout modal if ?checkout=open parameter is present ---
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'open' || params.get('openCheckout') === 'true') {
        setTimeout(() => {
            if (typeof openCheckout === 'function') {
                openCheckout();
            }
        }, 500);
    }
});

// ==============================================================
// --- LIVE DYNAMIC TRANSPORT CALCULATION & ADDRESS TOGGLE ---
// ==============================================================
let liveTransportTimer = null;

async function triggerLiveTransportCalc() {
    const sameAddr = document.getElementById('checkout-same-address');
    const diffContainer = document.getElementById('checkout-diff-address-container');
    const diffAddrInput = document.getElementById('checkout-diff-address');
    const diffPostcodeInput = document.getElementById('checkout-diff-postcode');
    const diffCityInput = document.getElementById('checkout-diff-city');

    const primaryAddrInput = document.getElementById('checkout-address');
    const primaryPostcodeInput = document.getElementById('checkout-postcode');

    const transportLine = document.getElementById('checkout-transport');
    const totalLine = document.getElementById('checkout-total');
    const subtotalLine = document.getElementById('checkout-subtotal');

    const currentCart = (typeof cart !== 'undefined') ? cart : [];
    if (!currentCart || currentCart.length === 0) return;

    const subtotal = currentCart.reduce((sum, item) => {
        const pMatch = item.price ? item.price.toString().match(/[0-9.,]+/) : null;
        const pVal = pMatch ? parseFloat(pMatch[0].replace(',', '.')) : 0;
        return sum + (pVal * (item.quantity || 1));
    }, 0);

    if (subtotalLine) subtotalLine.textContent = subtotal.toFixed(2).replace('.', ',') + ' €';

    const hasTransport = currentCart.some(i => i.transportEnabled && (i.pricePerKm > 0 || i.transportFlatFee > 0 || i.transportMode === 'distance'));

    if (!hasTransport) {
        if (transportLine) {
            transportLine.textContent = "0 € (Kostenlos / Abholung)";
            transportLine.className = "text-sm text-gray-600";
        }
        if (totalLine) totalLine.textContent = subtotal.toFixed(2).replace('.', ',') + ' €';
        window._liveTransportFee = 0;
        return;
    }

    // Determine effective delivery address
    let effAddr = '';
    let effPlz = '';

    if (sameAddr && !sameAddr.checked && diffAddrInput && diffAddrInput.value.trim()) {
        effAddr = diffAddrInput.value.trim();
        effPlz = diffPostcodeInput ? diffPostcodeInput.value.trim() : '';
        const city = diffCityInput ? diffCityInput.value.trim() : '';
        if (city) effAddr += ', ' + city;
    } else if (primaryAddrInput) {
        effAddr = primaryAddrInput.value.trim();
        effPlz = primaryPostcodeInput ? primaryPostcodeInput.value.trim() : '';
    }

    if (!effAddr || effAddr.length < 3) {
        if (transportLine) {
            transportLine.textContent = "Wird nach Adresse berechnet";
            transportLine.className = "text-xs font-semibold text-amber-600";
        }
        if (totalLine) totalLine.textContent = subtotal.toFixed(2).replace('.', ',') + ' €';
        window._liveTransportFee = 0;
        return;
    }

    if (transportLine) {
        transportLine.innerHTML = '<span class="animate-pulse text-amber-600">Berechne Fahrtstrecke...</span>';
    }

    try {
        const queryStr = `${effAddr}, ${effPlz}, Österreich`.trim();
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(queryStr)}`);
        const geoData = await geoRes.json();

        if (!geoData || geoData.length === 0) {
            if (transportLine) {
                transportLine.textContent = "Wird bei Kasse ermittelt";
                transportLine.className = "text-xs font-semibold text-amber-600";
            }
            return;
        }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;

        // OSRM Driving Distance from Traun HQ (14.2393, 48.2215)
        const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/14.2393,48.2215;${lon},${lat}?overview=false`);
        const osrmData = await osrmRes.json();

        if (!osrmData.routes || osrmData.routes.length === 0) {
            if (transportLine) {
                transportLine.textContent = "Wird bei Kasse ermittelt";
                transportLine.className = "text-xs font-semibold text-amber-600";
            }
            return;
        }

        const distanceKm = osrmData.routes[0].distance / 1000;

        let maxPricePerKm = 0.50;
        let maxFlatFee = 0;
        currentCart.forEach(i => {
            if (i.transportEnabled) {
                if (i.pricePerKm !== undefined && Number(i.pricePerKm) > 0) maxPricePerKm = Math.max(maxPricePerKm, Number(i.pricePerKm));
                if (i.transportFlatFee !== undefined && Number(i.transportFlatFee) > 0) maxFlatFee = Math.max(maxFlatFee, Number(i.transportFlatFee));
            }
        });

        // Roundtrip factor 2 (Lieferung + Abholung)
        const transportFee = (distanceKm * maxPricePerKm * 2) + maxFlatFee;
        window._liveTransportFee = transportFee;

        if (transportLine) {
            transportLine.innerHTML = `<span class="text-gold font-bold">${transportFee.toFixed(2).replace('.', ',')} €</span> <span class="text-xs text-gray-500">(${distanceKm.toFixed(1).replace('.', ',')} km Hin- & Rückfahrt)</span>`;
        }

        const grandTotal = subtotal + transportFee;
        if (totalLine) {
            totalLine.textContent = grandTotal.toFixed(2).replace('.', ',') + ' €';
        }

    } catch (err) {
        console.warn("Live transport calculation fallback:", err);
        if (transportLine) {
            transportLine.textContent = "Wird nach Adresse berechnet";
            transportLine.className = "text-xs font-semibold text-amber-600";
        }
    }
}

function queueLiveTransportCalc() {
    clearTimeout(liveTransportTimer);
    liveTransportTimer = setTimeout(triggerLiveTransportCalc, 400);
}

document.addEventListener('DOMContentLoaded', () => {
    const sameAddr = document.getElementById('checkout-same-address');
    const diffContainer = document.getElementById('checkout-diff-address-container');
    const diffAddrInput = document.getElementById('checkout-diff-address');
    const diffPostcodeInput = document.getElementById('checkout-diff-postcode');
    const diffCityInput = document.getElementById('checkout-diff-city');
    const primaryAddrInput = document.getElementById('checkout-address');
    const primaryPostcodeInput = document.getElementById('checkout-postcode');

    if (sameAddr) {
        sameAddr.addEventListener('change', () => {
            if (sameAddr.checked) {
                if (diffContainer) diffContainer.classList.add('hidden');
                if (window.currentUserProfileData) {
                    if (primaryAddrInput) primaryAddrInput.value = window.currentUserProfileData.address || '';
                    if (primaryPostcodeInput && window.currentUserProfileData.postcode) primaryPostcodeInput.value = window.currentUserProfileData.postcode;
                }
            } else {
                if (diffContainer) {
                    diffContainer.classList.remove('hidden');
                    if (diffAddrInput) diffAddrInput.focus();
                }
            }
            queueLiveTransportCalc();
        });
    }

    [primaryAddrInput, primaryPostcodeInput, diffAddrInput, diffPostcodeInput, diffCityInput].forEach(input => {
        if (input) {
            input.addEventListener('input', queueLiveTransportCalc);
            input.addEventListener('change', queueLiveTransportCalc);
        }
    });

    // Also close modal without issues
    const closeBtn = document.getElementById('checkout-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof closeCheckout === 'function') closeCheckout();
        });
    }
});
