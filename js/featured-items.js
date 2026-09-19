/**
 * featured-items.js
 * Selena Events - Dynamic Homepage Featured Items Loader (Shop & Verleih)
 */

(function () {
    const isLangSubdir = window.location.pathname.includes('/en/') || window.location.pathname.includes('/ro/');
    const lang = window.location.pathname.includes('/ro/') ? 'ro' : (window.location.pathname.includes('/en/') ? 'en' : 'de');
    const prefix = isLangSubdir ? '../' : '';

    const i18n = {
        de: {
            shopBadge: "Shop",
            verleihBadge: "Verleih",
            packageBadge: "Spezialpaket",
            fromPrice: "ab",
            requestPrice: "Auf Anfrage",
            viewDetails: "Details ansehen"
        },
        en: {
            shopBadge: "Shop",
            verleihBadge: "Rental",
            packageBadge: "Special Package",
            fromPrice: "from",
            requestPrice: "On Request",
            viewDetails: "View Details"
        },
        ro: {
            shopBadge: "Magazin",
            verleihBadge: "Închirieri",
            packageBadge: "Pachet Special",
            fromPrice: "de la",
            requestPrice: "La Cerere",
            viewDetails: "Vezi Detalii"
        }
    };

    const t = i18n[lang] || i18n.de;

    // Accurate default 3 items with exact image files in assets/verleih and assets/shop
    const defaultItems = [
        {
            id: 3,
            type: "verleih",
            title: lang === 'ro' ? "Castel Gonflabil Dragon & Castel cu Tobogan" : (lang === 'en' ? "Bouncy Castle Dragon & Castle with Slide" : "Hüpfburg Drachen & Schloss mit Rutsche"),
            img: "assets/verleih/hupfburg1.png",
            price: 180,
            priceMode: "fixed",
            category: "Hüpfburg",
            shortDesc: lang === 'ro' ? "Castel gonflabil distractiv pentru petreceri de neuitat." : (lang === 'en' ? "Fun bouncy castle for unforgettable parties." : "Großer Spielspaß für jedes Kinderfest mit Rutsche und Kletterbereich.")
        },
        {
            id: 1,
            type: "shop",
            title: lang === 'ro' ? "Decor Tematic cu Arcada de Baloane" : (lang === 'en' ? "Themed Decoration with Balloon Arch" : "Themen-Dekoration mit Ballonbogen"),
            img: "assets/shop/ballonbogen1.png",
            price: 180,
            priceMode: "fixed",
            category: "Ballondekoration",
            shortDesc: lang === 'ro' ? "Arcadă decorativă de baloane pentru evenimente speciale." : (lang === 'en' ? "Decorative balloon arch for special events." : "Verwandeln Sie Ihr Event in eine traumhafte Kulisse.")
        },
        {
            id: 4,
            type: "verleih",
            title: lang === 'ro' ? "Oglindă Foto Premium (Photo Mirror)" : (lang === 'en' ? "Premium Photo Mirror" : "Premium Fotospiegel"),
            img: "assets/verleih/fotospiegel1.png",
            price: 89,
            priceMode: "fixed",
            category: "Fotoecke",
            shortDesc: lang === 'ro' ? "Oglindă foto interactivă cu touch screen și print instant." : (lang === 'en' ? "Interactive photo mirror with touch screen and instant prints." : "Interaktiver Fotospiegel mit Touchscreen und Sofortdruck.")
        }
    ];

    function fixImagePath(url) {
        if (!url) return prefix + 'assets/logo_dark.png';
        if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
            return url;
        }
        const clean = url.replace(/^(\.\.\/)+/, '').replace(/^\//, '');
        return prefix + clean;
    }

    function renderCard(item) {
        const isVerleih = item.type === 'verleih';
        const targetUrl = isVerleih ? `${prefix}verleih-items/product?id=${item.id}` : `${prefix}shop-items/product?id=${item.id}`;
        const finalImg = fixImagePath(item.img);

        let badgeText = isVerleih ? t.verleihBadge : t.shopBadge;
        if (item.source === 'package' || (item.tags && item.tags.includes('Spezialpaket'))) {
            badgeText = t.packageBadge;
        }

        let priceText = '';
        const isReq = item.priceMode === 'request' || String(item.price) === '0' || item.price === 'Auf Anfrage' || item.price === 'On Request' || item.price === 'La Cerere';
        if (isReq) {
            priceText = `<span class="text-gold font-serif text-base font-bold">${t.requestPrice}</span>`;
        } else {
            const prefixWord = item.priceMode === 'from' ? `<span class="text-[11px] text-gray-500 mr-1 font-normal">${t.fromPrice}</span>` : '';
            priceText = `<span class="text-gold font-serif text-lg font-bold">${prefixWord}${item.price} €</span>`;
        }

        return `
            <div class="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-400 border border-gray-100 flex flex-col group cursor-pointer transform hover:-translate-y-1.5" onclick="window.location.href='${targetUrl}'">
                <div class="relative h-48 sm:h-52 bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
                    <span class="absolute top-3 left-3 bg-gray-900/80 backdrop-blur-md text-gold text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider z-10 shadow-sm">${badgeText}</span>
                    <img src="${finalImg}" alt="${item.title || 'Produkt'}" class="w-full h-full object-contain transform group-hover:scale-106 transition-transform duration-500 ease-out" onerror="this.onerror=null;this.src='${prefix}assets/logo_dark.png';">
                </div>
                <div class="p-5 flex flex-col flex-grow bg-white">
                    <h3 class="text-base font-bold text-gray-900 group-hover:text-gold transition-colors duration-200 mb-1.5 line-clamp-1">${item.title}</h3>
                    <p class="text-xs text-gray-500 line-clamp-2 font-light mb-4 flex-grow leading-relaxed">${item.shortDesc || item.description || ''}</p>
                    <div class="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                        <div>${priceText}</div>
                        <span class="inline-flex items-center text-[11px] font-bold uppercase tracking-wider text-gray-400 group-hover:text-gold transition-colors">
                            ${t.viewDetails} <svg class="w-3.5 h-3.5 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    async function loadFeaturedItems() {
        const grid = document.getElementById('featured-homepage-grid');
        if (!grid) return;

        // Render defaults immediately
        grid.innerHTML = defaultItems.map(renderCard).join('');

        try {
            const firebaseModule = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
            const { getFirestore, doc, getDoc } = firebaseModule;
            const appModule = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
            const { getApp, getApps, initializeApp } = appModule;

            const firebaseConfig = {
                apiKey: "AIzaSyAw_TmBCgvAwFPZkJ8RQ7_jSFB62KgQVqc",
                authDomain: "selena-events-dashboard.firebaseapp.com",
                projectId: "selena-events-dashboard",
                storageBucket: "selena-events-dashboard.firebasestorage.app",
                messagingSenderId: "535842804912",
                appId: "1:535842804912:web:7464adf97bcdf456131775"
            };

            const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
            const db = getFirestore(app);

            const docSnap = await getDoc(doc(db, "settings", "featured_items"));
            if (docSnap.exists() && docSnap.data().items && Array.isArray(docSnap.data().items) && docSnap.data().items.length > 0) {
                const liveItems = docSnap.data().items;
                grid.innerHTML = liveItems.map(renderCard).join('');
            }
        } catch (e) {
            console.log("Using default featured items fallback:", e);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadFeaturedItems);
    } else {
        loadFeaturedItems();
    }
})();
