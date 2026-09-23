/**
 * Selena Events - Product Inquiry Modal ("Preis auf Anfrage")
 * Handles direct inquiries for custom and request-priced items via Secure Cloud Function Gateway.
 */

(function() {
    let inquiryTurnstileWidgetId = null;

    function ensureTurnstileLoaded() {
        if (!document.querySelector('script[src*="turnstile"]')) {
            const s = document.createElement('script');
            s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
            s.async = true;
            s.defer = true;
            document.head.appendChild(s);
        }
    }

    function initInquiryTurnstile() {
        if (window.turnstile && document.getElementById('inquiry-turnstile-widget') && inquiryTurnstileWidgetId === null) {
            try {
                inquiryTurnstileWidgetId = window.turnstile.render('#inquiry-turnstile-widget', {
                    sitekey: '1x00000000000000000000AA',
                    theme: 'light',
                    size: 'flexible'
                });
            } catch(e) {
                console.warn('Inquiry Turnstile notice:', e);
            }
        }
    }

    function injectInquiryModalHTML() {
        if (document.getElementById('product-inquiry-modal')) return;

        ensureTurnstileLoaded();

        const isEn = window.location.pathname.includes('/en/');
        const isRo = window.location.pathname.includes('/ro/');

        const texts = {
            de: {
                modalTitle: "Unverbindliche Produkt-Anfrage",
                modalSubtitle: "Dieses Produkt ist auf Anfrage verfügbar. Senden Sie uns einfach Ihre Eckdaten und wir erstellen Ihnen ein maßgeschneidertes Angebot.",
                badge: "Preis auf Anfrage",
                name: "Ihr Name",
                email: "E-Mail-Adresse",
                phone: "Telefonnummer",
                date: "Veranstaltungsdatum",
                location: "Veranstaltungsort / PLZ",
                message: "Ihre Nachricht / Wünsche",
                messagePlaceholder: "z.B. Beginn der Feier, gewünschte Farbtöne, Zubehör...",
                submitBtn: "ANFRAGE JETZT ABSENDEN",
                submitting: "Wird gesendet...",
                successTitle: "Vielen Dank!",
                successMsg: "Ihre Anfrage wurde erfolgreich übermittelt. Unser Team wird sich in Kürze mit einem individuellen Angebot bei Ihnen melden.",
                closeBtn: "SCHLIEẞEN",
                errorMsg: "Ihre Anfrage konnte leider nicht übermittelt werden. Bitte versuchen Sie es erneut."
            },
            en: {
                modalTitle: "Non-binding Product Inquiry",
                modalSubtitle: "This item is available on request. Share your event details with us and we will send you a tailored proposal.",
                badge: "Price on Request",
                name: "Your Name",
                email: "Email Address",
                phone: "Phone Number",
                date: "Event Date",
                location: "Event Venue / Postcode",
                message: "Your Message / Wishes",
                messagePlaceholder: "e.g. Event schedule, color preferences, specific requirements...",
                submitBtn: "SUBMIT INQUIRY",
                submitting: "Submitting...",
                successTitle: "Thank You!",
                successMsg: "Your inquiry has been successfully sent. Our team will get back to you shortly with a customized offer.",
                closeBtn: "CLOSE",
                errorMsg: "Your inquiry could not be submitted. Please try again later."
            },
            ro: {
                modalTitle: "Cerere de ofertă personalizată",
                modalSubtitle: "Acest produs este disponibil la cerere. Trimiteți-ne detaliile evenimentului și vă vom pregăti o ofertă personalizată.",
                badge: "Preț la cerere",
                name: "Numele dumneavoastră",
                email: "Adresă de e-mail",
                phone: "Număr de telefon",
                date: "Data evenimentului",
                location: "Locație eveniment / Cod poștal",
                message: "Mesajul dumneavoastră",
                messagePlaceholder: "ex. Ora evenimentului, preferințe culori, cerințe speciale...",
                submitBtn: "TRIMITE CEREREA",
                submitting: "Se trimite...",
                successTitle: "Vă mulțumim!",
                successMsg: "Cererea dumneavoastră a fost transmisă cu succes. Echipa noastră vă va contacta în cel mai scurt timp cu o ofertă dedicată.",
                closeBtn: "ÎNCHIDE",
                errorMsg: "Cererea dumneavoastră nu a putut fi trimisă. Vă rugăm să încercați din nou."
            }
        };

        const t = isEn ? texts.en : (isRo ? texts.ro : texts.de);

        const modalHTML = `
        <div id="product-inquiry-modal" class="fixed inset-0 z-[80] hidden overflow-y-auto flex items-center justify-center p-4">
            <div id="product-inquiry-overlay" class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"></div>
            <div class="relative bg-white w-full max-w-lg mx-auto rounded-2xl shadow-2xl p-6 sm:p-8 transform transition-all border border-amber-100 max-h-[92vh] overflow-y-auto">
                <button type="button" id="product-inquiry-close" class="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors p-1">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                <div id="inquiry-form-container">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="bg-amber-100 text-amber-900 font-semibold text-[11px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">${t.badge}</span>
                    </div>
                    <h2 class="text-2xl font-serif text-gray-900 mb-2">${t.modalTitle}</h2>
                    <p class="text-xs text-gray-500 mb-6 leading-relaxed">${t.modalSubtitle}</p>

                    <!-- Selected Product Banner -->
                    <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                        <img id="inquiry-prod-img" src="" alt="" class="w-16 h-16 object-contain rounded-lg bg-white border border-gray-200">
                        <div class="flex-grow">
                            <h4 id="inquiry-prod-title" class="font-semibold text-gray-900 text-sm"></h4>
                            <p id="inquiry-prod-desc" class="text-xs text-gray-500 line-clamp-1"></p>
                            <span class="text-xs font-serif text-gold font-medium mt-0.5 inline-block">${t.badge}</span>
                        </div>
                    </div>

                    <form id="product-inquiry-form" class="space-y-4">
                        <input type="hidden" id="inquiry-prod-id" value="">
                        
                        <!-- Invisible Anti-Spam Honeypots (Off-screen) -->
                        <div style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; overflow: hidden;" aria-hidden="true">
                            <input type="text" id="inquiry-user-title" name="contact_user_title" tabindex="-1" autocomplete="new-password">
                            <input type="text" id="inquiry-company-url" name="company_website_url_val" tabindex="-1" autocomplete="new-password">
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-medium text-gray-700">${t.name} *</label>
                                <input type="text" id="inquiry-name" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold text-sm px-3 py-2 border bg-white">
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700">${t.email} *</label>
                                <input type="email" id="inquiry-email" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold text-sm px-3 py-2 border bg-white">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-xs font-medium text-gray-700">${t.phone}</label>
                                <input type="tel" id="inquiry-phone" placeholder="+43 ..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold text-sm px-3 py-2 border bg-white">
                            </div>
                            <div>
                                <label class="block text-xs font-medium text-gray-700">${t.date}</label>
                                <input type="date" id="inquiry-date" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold text-sm px-3 py-2 border bg-white">
                            </div>
                        </div>

                        <div>
                            <label class="block text-xs font-medium text-gray-700">${t.location}</label>
                            <input type="text" id="inquiry-location" placeholder="z.B. Linz, Eventlocation..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold text-sm px-3 py-2 border bg-white">
                        </div>

                        <div>
                            <label class="block text-xs font-medium text-gray-700">${t.message}</label>
                            <textarea id="inquiry-message" rows="3" placeholder="${t.messagePlaceholder}" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gold focus:ring-gold text-sm px-3 py-2 border bg-white"></textarea>
                        </div>

                        <!-- Cloudflare Turnstile Container -->
                        <div id="inquiry-turnstile-widget" class="my-2"></div>

                        <button type="submit" id="inquiry-submit-btn" class="btn-gold w-full justify-center text-center py-3.5 text-sm tracking-widest font-semibold flex items-center gap-2 mt-4 shadow-md">
                            <span>${t.submitBtn}</span>
                        </button>
                    </form>
                </div>

                <!-- Success State -->
                <div id="inquiry-success-container" class="hidden text-center py-8">
                    <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h3 class="text-2xl font-serif text-gray-900 mb-2">${t.successTitle}</h3>
                    <p class="text-sm text-gray-600 mb-6 leading-relaxed">${t.successMsg}</p>
                    <button type="button" id="inquiry-success-close-btn" class="btn-gold px-8 py-3 text-sm tracking-widest font-semibold">${t.closeBtn}</button>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Close handlers
        const modal = document.getElementById('product-inquiry-modal');
        const closeBtn = document.getElementById('product-inquiry-close');
        const overlay = document.getElementById('product-inquiry-overlay');
        const successCloseBtn = document.getElementById('inquiry-success-close-btn');

        function closeModal() {
            if (modal) modal.classList.add('hidden');
            document.body.style.overflow = '';
        }

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (overlay) overlay.addEventListener('click', closeModal);
        if (successCloseBtn) successCloseBtn.addEventListener('click', closeModal);

        // Submit Handler
        const form = document.getElementById('product-inquiry-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = document.getElementById('inquiry-submit-btn');
                const origText = submitBtn ? submitBtn.innerHTML : '';
                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<span>${t.submitting}</span>`;
                }

                const hpTitle = document.getElementById('inquiry-user-title')?.value || '';
                const hpUrl = document.getElementById('inquiry-company-url')?.value || '';

                // Honeypot check
                if (hpTitle || hpUrl) {
                    document.getElementById('inquiry-form-container').classList.add('hidden');
                    document.getElementById('inquiry-success-container').classList.remove('hidden');
                    form.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = origText;
                    }
                    return;
                }

                const prodId = document.getElementById('inquiry-prod-id').value;
                const prodTitle = document.getElementById('inquiry-prod-title').textContent;
                const prodImg = document.getElementById('inquiry-prod-img').src;

                const name = document.getElementById('inquiry-name').value.trim();
                const email = document.getElementById('inquiry-email').value.trim();
                const phone = document.getElementById('inquiry-phone').value.trim();
                const eventDate = document.getElementById('inquiry-date').value;
                const eventLocation = document.getElementById('inquiry-location').value.trim();
                const message = document.getElementById('inquiry-message').value.trim();

                let turnstileToken = '';
                if (window.turnstile && inquiryTurnstileWidgetId !== null) {
                    turnstileToken = window.turnstile.getResponse(inquiryTurnstileWidgetId);
                }
                if (!turnstileToken && window.turnstile) {
                    turnstileToken = window.turnstile.getResponse();
                }

                const inquiryPayload = {
                    type: 'product_inquiry',
                    productId: prodId,
                    productTitle: prodTitle,
                    productImg: prodImg,
                    name: name,
                    customerName: name,
                    firstName: name,
                    email: email,
                    customerEmail: email,
                    phone: phone,
                    customerPhone: phone,
                    date: eventDate,
                    eventDate: eventDate,
                    location: eventLocation,
                    eventLocation: eventLocation,
                    address: eventLocation,
                    message: message,
                    subject: `Produkt-Anfrage: ${prodTitle}`,
                    contact_user_title: hpTitle,
                    company_website_url_val: hpUrl,
                    turnstileToken: turnstileToken || '1x00000000000000000000AA'
                };

                try {
                    const res = await fetch('https://us-central1-selena-events-dashboard.cloudfunctions.net/submitContactInquiry', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(inquiryPayload)
                    });

                    const resData = await res.json().catch(() => ({}));
                    if (!res.ok) {
                        throw new Error(resData.error || t.errorMsg);
                    }

                    document.getElementById('inquiry-form-container').classList.add('hidden');
                    document.getElementById('inquiry-success-container').classList.remove('hidden');
                    form.reset();
                    if (window.turnstile && inquiryTurnstileWidgetId !== null) {
                        window.turnstile.reset(inquiryTurnstileWidgetId);
                    }
                } catch (err) {
                    console.error("Error submitting product inquiry:", err);
                    alert(err.message || t.errorMsg);
                    if (window.turnstile && inquiryTurnstileWidgetId !== null) {
                        window.turnstile.reset(inquiryTurnstileWidgetId);
                    }
                } finally {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = origText;
                    }
                }
            });
        }
    }

    window.openProductInquiryModal = function(productId, source) {
        injectInquiryModalHTML();

        const modal = document.getElementById('product-inquiry-modal');
        const formContainer = document.getElementById('inquiry-form-container');
        const successContainer = document.getElementById('inquiry-success-container');

        if (formContainer) formContainer.classList.remove('hidden');
        if (successContainer) successContainer.classList.add('hidden');

        // Find product
        let prod = null;
        if (window.currentLoadedProduct && String(window.currentLoadedProduct.id) === String(productId)) {
            prod = window.currentLoadedProduct;
        } else if (typeof products !== 'undefined' && Array.isArray(products)) {
            prod = products.find(p => String(p.id) === String(productId) || ('catalog_verleih_' + p.id) === String(productId) || ('catalog_shop_' + p.id) === String(productId));
        }

        if (prod) {
            document.getElementById('inquiry-prod-id').value = prod.id;
            document.getElementById('inquiry-prod-title').textContent = prod.title;
            document.getElementById('inquiry-prod-desc').textContent = prod.shortDesc || prod.subtitle || '';
            const imgEl = document.getElementById('inquiry-prod-img');
            if (imgEl) {
                const src = prod.img || 'assets/logo_dark.png';
                imgEl.src = src.startsWith('http') ? src : (src.startsWith('../') ? src : (window.location.pathname.includes('-items/') ? '../' + src : src));
            }
        }

        // Prefill user data if available
        if (window.currentUser) {
            const emailInput = document.getElementById('inquiry-email');
            const nameInput = document.getElementById('inquiry-name');
            if (emailInput && !emailInput.value && window.currentUser.email) {
                emailInput.value = window.currentUser.email;
            }
            if (nameInput && !nameInput.value && window.currentUser.displayName) {
                nameInput.value = window.currentUser.displayName;
            }
        }
        if (window.currentUserProfileData) {
            const phoneInput = document.getElementById('inquiry-phone');
            const nameInput = document.getElementById('inquiry-name');
            if (phoneInput && !phoneInput.value && window.currentUserProfileData.phone) {
                phoneInput.value = window.currentUserProfileData.phone;
            }
            if (nameInput && !nameInput.value && window.currentUserProfileData.name) {
                nameInput.value = window.currentUserProfileData.name;
            }
        }

        // Initialize turnstile if ready
        if (window.turnstile) {
            setTimeout(initInquiryTurnstile, 150);
        } else {
            window.addEventListener('load', () => setTimeout(initInquiryTurnstile, 600));
        }

        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    };

    // Auto-inject when DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectInquiryModalHTML);
    } else {
        injectInquiryModalHTML();
    }
})();
