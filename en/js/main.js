document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('script[data-selena-consent]')) {
        const consentScript = document.createElement('script');
        consentScript.dataset.selenaConsent = '1';
        consentScript.src = (document.querySelector('script[src*="main.js"]')?.src || '').replace('main.js', 'consent.js');
        document.body.appendChild(consentScript);
    }
    const currentPath = window.location.pathname;
    let currentLang = 'de';
    if (currentPath.includes('/en/')) currentLang = 'en';
    else if (currentPath.includes('/ro/')) currentLang = 'ro';

    const t = {
        de: {
            home: "Startseite", services: "Leistungen", portfolio: "Portfolio", shop: "Shop", rental: "Verleih", team: "Team", blog: "Blog", contact: "Kontakt", login: "Login", account: "Mein Konto",
            footerDesc: "Unvergessliche Momente durch elegante Eventplanung, luxuriöse Dekoration und personalisierte Erlebnisse.",
            navigation: "Navigation", legal: "Rechtliches", impressum: "Impressum", agb: "AGB", privacy: "Datenschutz", withdrawal: "Widerruf", rights: "Alle Rechte vorbehalten.",
            langLabel: "DE"
        },
        en: {
            home: "Home", services: "Services", portfolio: "Portfolio", shop: "Shop", rental: "Rental", team: "Team", blog: "Blog", contact: "Contact", login: "Login", account: "My Account",
            footerDesc: "Unforgettable moments through elegant event planning, luxury decoration, and personalized experiences.",
            navigation: "Navigation", legal: "Legal", impressum: "Imprint", agb: "Terms & Conditions", privacy: "Privacy Policy", withdrawal: "Withdrawal", rights: "All rights reserved.",
            langLabel: "EN"
        },
        ro: {
            home: "Acasă", services: "Servicii", portfolio: "Portofoliu", shop: "Magazin", rental: "Închirieri", team: "Echipă", blog: "Blog", contact: "Contact", login: "Autentificare", account: "Contul meu",
            footerDesc: "Momente de neuitat prin planificare elegantă, decorațiuni de lux și experiențe personalizate.",
            navigation: "Navigație", legal: "Legal", impressum: "Imprint", agb: "Termeni și Condiții", privacy: "Confidențialitate", withdrawal: "Retragere", rights: "Toate drepturile rezervate.",
            langLabel: "RO"
        }
    };
    // Accurately determine depth relative to site root and language
    const normPath = window.location.pathname.toLowerCase();
    const isDeepSubdir = normPath.includes('/service-details/') || normPath.includes('/shop-items/') || normPath.includes('/verleih-items/');
    const isLangSubdir = currentLang !== 'de';

    let pathToRoot = '';
    if (isLangSubdir && isDeepSubdir) {
        pathToRoot = '../../';
    } else if (isLangSubdir || isDeepSubdir) {
        pathToRoot = '../';
    } else {
        pathToRoot = '';
    }

    const scriptPrefix = pathToRoot;
    const l = t[currentLang];
    // Navigation links within the CURRENT language stay in current language (no redundant ro/ro/ or en/en/)
    const basePath = isDeepSubdir ? '../' : '';
    const cleanPath = window.location.pathname;
    let initialReturnPath = cleanPath.split('/').pop() || 'index.html';
    if (isDeepSubdir) {
        const segs = cleanPath.split('/').filter(Boolean);
        initialReturnPath = segs.slice(-2).join('/');
    }
    const initialSearch = window.location.search || '';
    const initialShouldRedirect = initialReturnPath && !initialReturnPath.includes('login') && !initialReturnPath.includes('register');
    const initialLoginHref = initialShouldRedirect 
        ? (`${basePath}login.html?redirect=` + encodeURIComponent(initialReturnPath + initialSearch))
        : `${basePath}login.html`;
    if (!document.querySelector('script[data-site-content]')) { 
        const mediaScript = document.createElement('script'); 
        mediaScript.type = 'module'; 
        mediaScript.dataset.siteContent = '1'; 
        mediaScript.src = scriptPrefix + 'js/site-content.js'; 
        document.body.appendChild(mediaScript); 
    }

    const headerHTML = `
<nav class="bg-white/90 backdrop-blur-md fixed w-full z-50 top-0 border-b border-gray-100 shadow-sm transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-20 items-center">
            <div class="flex-shrink-0 flex items-center mr-16 lg:mr-24">
                <a href="${basePath}index.html">
                    <img class="h-12 w-auto scale-[2.5] origin-left" src="${scriptPrefix}assets/logo_dark.png" alt="Selena Events Logo">
                </a>
            </div>
            
            <!-- Desktop Menu -->
            <div class="hidden lg:flex lg:items-center lg:space-x-4 xl:space-x-6">
                <a href="${basePath}index.html" class="nav-link text-gray-800 hover:text-gold px-2 py-2 text-sm uppercase tracking-widest">${l.home}</a>
                <a href="${basePath}leistungen.html" class="nav-link text-gray-800 hover:text-gold px-2 py-2 text-sm uppercase tracking-widest">${l.services}</a>
                <a href="${basePath}portfolio.html" class="nav-link text-gray-800 hover:text-gold px-2 py-2 text-sm uppercase tracking-widest">${l.portfolio}</a>
                <a href="${basePath}shop.html" class="nav-link text-gray-800 hover:text-gold px-2 py-2 text-sm uppercase tracking-widest">${l.shop}</a>
                <a href="${basePath}verleih.html" class="nav-link text-gray-800 hover:text-gold px-2 py-2 text-sm uppercase tracking-widest">${l.rental}</a>
                <a href="${basePath}team.html" class="nav-link text-gray-800 hover:text-gold px-2 py-2 text-sm uppercase tracking-widest">${l.team}</a>
                <a href="${basePath}blog.html" class="nav-link text-gray-800 hover:text-gold px-2 py-2 text-sm uppercase tracking-widest">${l.blog}</a>
                <a href="${basePath}contact.html" class="nav-link text-gray-800 hover:text-gold px-2 py-2 text-sm uppercase tracking-widest">${l.contact}</a>
                
                <!-- Custom Globe Translator -->
                <div class="relative group flex items-center ml-2 border-l border-gray-200 pl-4 h-full py-2 cursor-pointer">
                    <svg class="w-4 h-4 text-gray-600 mr-1 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span id="current-lang-text-desktop" class="text-sm text-gray-600 font-medium group-hover:text-gold transition-colors uppercase">${l.langLabel}</span>
                    <svg class="w-3 h-3 ml-1 text-gray-400 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    
                    <!-- Dropdown Menu -->
                    <div class="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top border border-gray-100 z-50 overflow-hidden">
                        <div class="py-1">
                            <button onclick="setLang('de')" class="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors"><img src="https://flagcdn.com/at.svg" alt="DE" class="w-4 h-auto inline-block mr-2 shadow-sm rounded-sm">Deutsch</button>
                            <button onclick="setLang('en')" class="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors"><img src="https://flagcdn.com/gb.svg" alt="EN" class="w-4 h-auto inline-block mr-2 shadow-sm rounded-sm">English</button>
                            <button onclick="setLang('ro')" class="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors"><img src="https://flagcdn.com/ro.svg" alt="RO" class="w-4 h-auto inline-block mr-2 shadow-sm rounded-sm">Română</button>
                        </div>
                    </div>
                </div>
                <!-- Hidden Google Translate Dropdown -->
                <div id="google_translate_element" style="width:0;height:0;overflow:hidden;opacity:0;"></div>
                
                <div class="relative group ml-4 transition-all duration-300" id="auth-dropdown-wrapper">
                    <a href="${initialLoginHref}" id="nav-auth-link" class="nav-link flex items-center text-gray-800 hover:text-gold px-3 py-2 text-sm uppercase tracking-widest border border-gray-200 rounded hover:border-gold transition-colors">
                        ${l.login}
                    </a>
                    <!-- Dropdown Menu (Hidden by default) -->
                    <div id="auth-dropdown" class="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl opacity-0 invisible transition-all duration-200 transform origin-top-left border border-gray-100 z-50 overflow-hidden hidden group-hover:opacity-100 group-hover:visible">
                        <div class="py-1">
                            <a href="${basePath}customer-dashboard.html#cart" class="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors">Warenkorb</a>
                            <a href="${basePath}customer-dashboard.html#dashboard" class="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors">Dashboard</a>
                            <a href="${basePath}customer-dashboard.html#orders" class="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors">Meine Bestellungen</a>
                            <a href="${basePath}customer-dashboard.html#loyalty" class="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors">Treueprogramm</a>
                            <hr class="my-1 border-gray-100">
                            <button id="header-logout-btn" class="block w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors">Abmelden</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mobile menu button -->
            <div class="flex items-center lg:hidden">
                <!-- Mobile Custom Globe Translator -->
                <div class="relative group flex items-center mr-4 cursor-pointer py-2">
                    <svg class="w-5 h-5 text-gray-600 mr-1 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span id="current-lang-text-mobile" class="text-sm text-gray-600 font-medium group-hover:text-gold transition-colors uppercase">${l.langLabel}</span>
                    <svg class="w-3 h-3 ml-1 text-gray-400 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    
                    <!-- Dropdown Menu -->
                    <div class="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top border border-gray-100 z-50 overflow-hidden">
                        <div class="py-1">
                            <button onclick="setLang('de')" class="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors"><img src="https://flagcdn.com/at.svg" alt="DE" class="w-4 h-auto inline-block mr-2 shadow-sm rounded-sm">Deutsch</button>
                            <button onclick="setLang('en')" class="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors"><img src="https://flagcdn.com/gb.svg" alt="EN" class="w-4 h-auto inline-block mr-2 shadow-sm rounded-sm">English</button>
                            <button onclick="setLang('ro')" class="block w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gold transition-colors"><img src="https://flagcdn.com/ro.svg" alt="RO" class="w-4 h-auto inline-block mr-2 shadow-sm rounded-sm">Română</button>
                        </div>
                    </div>
                </div>
                <!-- Hidden Mobile Google Translate -->
                <div id="google_translate_element_mobile" style="width:0;height:0;overflow:hidden;opacity:0;"></div>
                
                <button id="mobile-menu-btn" type="button" class="inline-flex items-center justify-center p-2.5 rounded-lg text-gray-800 hover:text-gold bg-gray-100/80 hover:bg-gold/10 border border-gray-200 transition-all focus:outline-none shadow-sm cursor-pointer" aria-controls="mobile-menu" aria-expanded="false">
                    <span class="sr-only">Menü öffnen</span>
                    <svg class="block h-6 w-6 text-gray-800 group-hover:text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Menu -->
    <div class="lg:hidden hidden bg-white border-t border-gray-100 shadow-2xl max-h-[85vh] overflow-y-auto w-full transition-all" id="mobile-menu">
        <div class="px-4 pt-3 pb-6 space-y-1">
            <a href="${basePath}index.html" class="block px-4 py-3 text-base font-bold text-gray-800 hover:text-gold hover:bg-gray-50 rounded-lg uppercase tracking-wider border-b border-gray-50 transition-colors">${l.home}</a>
            <a href="${basePath}leistungen.html" class="block px-4 py-3 text-base font-bold text-gray-800 hover:text-gold hover:bg-gray-50 rounded-lg uppercase tracking-wider border-b border-gray-50 transition-colors">${l.services}</a>
            <a href="${basePath}portfolio.html" class="block px-4 py-3 text-base font-bold text-gray-800 hover:text-gold hover:bg-gray-50 rounded-lg uppercase tracking-wider border-b border-gray-50 transition-colors">${l.portfolio}</a>
            <a href="${basePath}shop.html" class="block px-4 py-3 text-base font-bold text-gray-800 hover:text-gold hover:bg-gray-50 rounded-lg uppercase tracking-wider border-b border-gray-50 transition-colors">${l.shop}</a>
            <a href="${basePath}verleih.html" class="block px-4 py-3 text-base font-bold text-gray-800 hover:text-gold hover:bg-gray-50 rounded-lg uppercase tracking-wider border-b border-gray-50 transition-colors">${l.rental}</a>
            <a href="${basePath}team.html" class="block px-4 py-3 text-base font-bold text-gray-800 hover:text-gold hover:bg-gray-50 rounded-lg uppercase tracking-wider border-b border-gray-50 transition-colors">${l.team}</a>
            <a href="${basePath}blog.html" class="block px-4 py-3 text-base font-bold text-gray-800 hover:text-gold hover:bg-gray-50 rounded-lg uppercase tracking-wider border-b border-gray-50 transition-colors">${l.blog}</a>
            <a href="${basePath}contact.html" class="block px-4 py-3 text-base font-bold text-gray-800 hover:text-gold hover:bg-gray-50 rounded-lg uppercase tracking-wider border-b border-gray-50 transition-colors">${l.contact}</a>
            <a href="${initialLoginHref}" id="mobile-nav-auth-link" class="block px-4 py-3 text-base font-bold text-gold hover:text-white hover:bg-gold rounded-lg uppercase tracking-wider border border-gold/40 mt-3 text-center transition-all shadow-sm">${l.login}</a>
        </div>
    </div>
</nav>
`;

    const footerHTML = `
<footer class="bg-[#1A1A1A] text-white pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div class="col-span-1 md:col-span-1">
                <img src="${scriptPrefix}assets/logo_dark.png" alt="Selena Events" class="h-12 mb-6 filter invert scale-[2.5] origin-left">
                <p class="text-gray-400 text-sm leading-relaxed mb-6 font-sans">
                    ${l.footerDesc}
                </p>
                <div class="flex space-x-4">
                    <a href="https://www.instagram.com/events.selena/" target="_blank" class="text-gray-400 hover:text-gold transition-colors">
                        <span class="sr-only">Instagram</span>
                        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd" />
                        </svg>
                    </a>
                    <a href="https://www.facebook.com/p/Selena-Events-61551559913637/" target="_blank" class="text-gray-400 hover:text-gold transition-colors">
                        <span class="sr-only">Facebook</span>
                        <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                            <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" />
                        </svg>
                    </a>
                </div>
            </div>
            
            <div>
                <h3 class="text-sm font-semibold tracking-wider uppercase mb-4 text-white">${l.navigation}</h3>
                <ul class="grid grid-cols-2 gap-x-8 gap-y-3 font-sans text-sm">
                    <li><a href="${basePath}index.html" class="text-gray-400 hover:text-gold transition-colors">${l.home}</a></li>
                    <li><a href="${basePath}verleih.html" class="text-gray-400 hover:text-gold transition-colors">${l.rental}</a></li>
                    <li><a href="${basePath}leistungen.html" class="text-gray-400 hover:text-gold transition-colors">${l.services}</a></li>
                    <li><a href="${basePath}team.html" class="text-gray-400 hover:text-gold transition-colors">${l.team}</a></li>
                    <li><a href="${basePath}portfolio.html" class="text-gray-400 hover:text-gold transition-colors">${l.portfolio}</a></li>
                    <li><a href="${basePath}blog.html" class="text-gray-400 hover:text-gold transition-colors">${l.blog}</a></li>
                    <li><a href="${basePath}shop.html" class="text-gray-400 hover:text-gold transition-colors">${l.shop}</a></li>
                    <li><a href="${basePath}contact.html" class="text-gray-400 hover:text-gold transition-colors">${l.contact}</a></li>
                </ul>
            </div>
            
            <div>
                <h3 class="text-sm font-semibold tracking-wider uppercase mb-4 text-white">${l.legal}</h3>
                <ul class="space-y-3 font-sans text-sm">
                    <li><a href="${basePath}impressum.html" class="text-gray-400 hover:text-gold transition-colors">${l.impressum}</a></li>
                    <li><a href="${basePath}agb.html" class="text-gray-400 hover:text-gold transition-colors">${l.agb}</a></li>
                    <li><a href="${basePath}datenschutz.html" class="text-gray-400 hover:text-gold transition-colors">${l.privacy}</a></li>
                    <li><a href="${scriptPrefix}widerruf.html" class="text-gray-400 hover:text-gold transition-colors">${l.withdrawal}</a></li>
                </ul>
            </div>
            
            <div>
                <h3 class="text-sm font-semibold tracking-wider uppercase mb-4 text-white">${l.contact}</h3>
                <ul class="space-y-3 font-sans text-sm text-gray-400">
                    <li>Firma Ochian Clement Adelin</li>
                    <li>Riesterstraße 8, Tür 2, 4050 Traun</li>
                    <li>ATU82315709 | GLN 9110031920411</li>
                    <li><a href="mailto:info@selena.events" class="hover:text-gold transition-colors">Email Us</a></li>
                    <li><a href="tel:+436609688601" class="hover:text-gold transition-colors">+43 660 9688 601</a></li>
                </ul>
            </div>
        </div>
        
        <div class="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div class="text-sm text-gray-500 font-sans text-center md:text-left">
                <p>&copy; 2026 Selena Events. ${l.rights}</p>
                <p class="mt-1">Designed by <a href="https://anonymcreator.online" target="_blank" class="text-gray-400 hover:text-gold transition-colors">AnonymCreator - Digitalstudio</a></p>
            </div>
            <div class="mt-4 md:mt-0 flex items-center justify-center md:justify-end gap-6">
                <img src="${scriptPrefix}assets/Wirtschaftskammer_Österreich_logo.svg.webp" onerror="this.onerror=null;this.src='${scriptPrefix}assets/Wirtschaftskammer_Oesterreich_logo.svg.webp';" alt="WKO" class="h-8 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                <img src="${scriptPrefix}assets/qualitaet.png" alt="Qualität Handwerk" class="h-8 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
                <img src="${scriptPrefix}assets/jw.jpg" alt="Junge Wirtschaft" class="h-8 w-auto object-contain opacity-50 hover:opacity-100 transition-opacity rounded-sm grayscale hover:grayscale-0">
            </div>
        </div>
    </div>
</footer>
`;

    // Inject Header and Footer
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');
    
    if (headerContainer) headerContainer.innerHTML = headerHTML;
    if (footerContainer) footerContainer.innerHTML = footerHTML;

    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileBtn && mobileMenu) {
        mobileBtn.onclick = (e) => {
            e.stopPropagation();
            mobileMenu.classList.toggle('hidden');
        };
        document.addEventListener('click', (e) => {
            if (!mobileMenu.classList.contains('hidden') && !mobileMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
                mobileMenu.classList.add('hidden');
            }
        });
    }

    const loadTranslate = () => {
        if (document.querySelector('script[data-selena-translate]')) return;
        const addScript = document.createElement('script');
        addScript.dataset.selenaTranslate = '1';
        addScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(addScript);
    };
    if (localStorage.getItem('selena_optional_consent') === 'accepted') loadTranslate();
    window.addEventListener('selena-consent-accepted', loadTranslate);

    // --- Firebase Auth Navigation Sync ---
    const authScript = document.createElement('script');
    authScript.type = 'module';
    authScript.textContent = `
        import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

        const firebaseConfig = {
            apiKey: "AIzaSyAw_TmBCgvAwFPZkJ8RQ7_jSFB62KgQVqc",
            authDomain: "selena-events-dashboard.firebaseapp.com",
            projectId: "selena-events-dashboard",
            storageBucket: "selena-events-dashboard.firebasestorage.app",
            messagingSenderId: "535842804912",
            appId: "1:535842804912:web:7464adf97bcdf456131775",
            measurementId: "G-6CXF223NQE"
        };
        const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        const auth = getAuth(app);
        onAuthStateChanged(auth, (user) => {
            window.currentUser = user;
            
            const curNormPath = window.location.pathname.toLowerCase();
            const curIsDeep = curNormPath.includes('/service-details/') || curNormPath.includes('/shop-items/') || curNormPath.includes('/verleih-items/');
            const curCleanPath = window.location.pathname;
            let curReturnPath = curCleanPath.split('/').pop() || 'index.html';
            if (curIsDeep) {
                const segs = curCleanPath.split('/').filter(Boolean);
                curReturnPath = segs.slice(-2).join('/');
            }
            const curSearch = window.location.search || '';
            const shouldRedirect = curReturnPath && !curReturnPath.includes('login') && !curReturnPath.includes('register');
            const dynamicLoginHref = shouldRedirect ? ('${basePath}login.html?redirect=' + encodeURIComponent(curReturnPath + curSearch)) : '${basePath}login.html';
        
            const navLink = document.getElementById('nav-auth-link');
            const authWrapper = document.getElementById('auth-dropdown-wrapper');
            const dropdown = document.getElementById('auth-dropdown');
            const mobileNavLink = document.getElementById('mobile-nav-auth-link');
            
            if (user) {
                if (navLink) { 
                    navLink.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>'; 
                    navLink.href = "${basePath}customer-dashboard.html"; 
                    navLink.classList.add('px-2');
                    navLink.classList.remove('px-3');
                }
                if (dropdown) dropdown.classList.remove('hidden');
                
                // Add logout event listener if not already added
                const logoutBtn = document.getElementById('header-logout-btn');
                if (logoutBtn && !logoutBtn.dataset.bound) {
                    logoutBtn.addEventListener('click', () => {
                        signOut(auth).then(() => {
                            window.location.href = 'index.html';
                        });
                    });
                    logoutBtn.dataset.bound = 'true';
                }
                
                if (mobileNavLink) { mobileNavLink.textContent = "${l.account}"; mobileNavLink.href = "${basePath}customer-dashboard.html"; }
            } else {
                if (navLink) { 
                    navLink.textContent = "${l.login}"; 
                    navLink.href = dynamicLoginHref; 
                    navLink.classList.add('px-3');
                    navLink.classList.remove('px-2');
                }
                if (dropdown) dropdown.classList.add('hidden');
                if (mobileNavLink) { mobileNavLink.textContent = "${l.login}"; mobileNavLink.href = dynamicLoginHref; }
            }
            
            // Show the wrapper now that auth state is resolved
            if (authWrapper) {
                authWrapper.classList.remove('opacity-0', 'pointer-events-none');
                authWrapper.classList.add('opacity-100', 'pointer-events-auto');
            }
        });
    `;
    document.body.appendChild(authScript);

});

// Google Translate Initialization
window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
        pageLanguage: 'de', 
        includedLanguages: 'de,en,ro', 
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
    
    // Also init for mobile if the element exists
    if (document.getElementById('google_translate_element_mobile')) {
         new google.translate.TranslateElement({
            pageLanguage: 'de', 
            includedLanguages: 'de,en,ro', 
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false
        }, 'google_translate_element_mobile');
    }
};

// URL Extension Management
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are running on a server (http/https) instead of local file system (file://)
    if (false) {
        
        // 1. Rewrite the current URL in the address bar to hide .html
        if (window.location.pathname.endsWith('.html')) {
            let cleanPath = window.location.pathname.replace(/\.html$/, '');
            // Optional: If it's index, we can just point to /
            if (cleanPath.endsWith('/index')) {
                cleanPath = cleanPath.replace(/\/index$/, '/');
            }
            window.history.replaceState(null, '', cleanPath + window.location.search + window.location.hash);
        }

        // 2. Intercept all internal links to prevent .html from showing up on hover and click
        const links = document.querySelectorAll('a[href$=".html"]');
        links.forEach(link => {
            try {
                const url = new URL(link.href, window.location.href);
                // Only modify links that point to our own domain
                if (url.origin === window.location.origin) {
                    let newHref = link.getAttribute('href').replace(/\.html$/, '');
                    if (newHref === 'index') newHref = './';
                    link.setAttribute('href', newHref);
                }
            } catch (e) {
                // Ignore invalid URLs
            }
        });
    }
});


// Custom Flag Translator Function
window.setLang = function(lang) {
    let currentPath = window.location.pathname;
    let fileName = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';
    if (!fileName.includes('.')) fileName += '.html';

    const normPath = currentPath.toLowerCase();
    const isDeep = normPath.includes('/service-details/') || normPath.includes('/shop-items/') || normPath.includes('/verleih-items/');
    const isLang = normPath.includes('/en/') || normPath.includes('/ro/');

    let toRoot = '';
    if (isLang && isDeep) toRoot = '../../';
    else if (isLang || isDeep) toRoot = '../';

    let subDir = '';
    if (normPath.includes('/service-details/')) subDir = 'service-details/';
    else if (normPath.includes('/shop-items/')) subDir = 'shop-items/';
    else if (normPath.includes('/verleih-items/')) subDir = 'verleih-items/';

    const targetLangPrefix = lang === 'de' ? '' : (lang + '/');
    window.location.href = toRoot + targetLangPrefix + subDir + fileName + window.location.search;
};
document.addEventListener('DOMContentLoaded', () => {
    let currentPath = window.location.pathname;
    let currentLang = 'de';
    if (currentPath.includes('/en/')) currentLang = 'en';
    if (currentPath.includes('/ro/')) currentLang = 'ro';
    
    const desktopLabel = document.getElementById('current-lang-text-desktop');
    const mobileLabel = document.getElementById('current-lang-text-mobile');
    const labelText = currentLang.toUpperCase();
    
    if (desktopLabel) desktopLabel.innerText = labelText;
    if (mobileLabel) mobileLabel.innerText = labelText;
});





// Stripe Feedback
window.addEventListener('DOMContentLoaded', () => { const urlParams = new URLSearchParams(window.location.search); if (urlParams.get('checkout') === 'success') { const successModal = document.getElementById('success-modal'); if (successModal) { successModal.classList.remove('hidden'); window.history.replaceState({}, document.title, window.location.pathname); } } else if (urlParams.get('checkout') === 'cancelled') { const errorModal = document.getElementById('error-modal'); const errMsg = document.getElementById('error-modal-msg'); if (errorModal && errMsg) { errMsg.textContent = 'Der Zahlungsvorgang wurde abgebrochen.'; errorModal.classList.remove('hidden'); const errClose = document.getElementById('error-modal-close'); if(errClose) errClose.onclick = () => errorModal.classList.add('hidden'); window.history.replaceState({}, document.title, window.location.pathname); } } });

// Global Product Share & Toast Helpers
window.showToast = function(msg) {
    let t = document.getElementById('selena-global-toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'selena-global-toast';
        t.className = 'fixed bottom-6 right-6 z-[9999] bg-gray-900/95 text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm border border-gold/40 text-sm font-medium transition-all duration-300 transform translate-y-10 opacity-0 pointer-events-none flex items-center gap-2';
        document.body.appendChild(t);
    }
    t.innerHTML = `<span>${msg}</span>`;
    t.classList.remove('translate-y-10', 'opacity-0', 'pointer-events-none');
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => {
        t.classList.add('translate-y-10', 'opacity-0', 'pointer-events-none');
    }, 3000);
};

window.shareCatalogItem = async function(encodedTitle, id, type) {
    const title = decodeURIComponent(encodedTitle || '');
    const isEn = window.location.pathname.includes('/en/');
    const isRo = window.location.pathname.includes('/ro/');
    const langPrefix = isEn ? 'en/' : (isRo ? 'ro/' : '');
    const isVerleih = type === 'verleih' || window.location.pathname.includes('verleih');
    const folder = isVerleih ? 'verleih-items' : 'shop-items';
    const origin = window.location.origin;
    const url = `${origin}/${langPrefix}${folder}/product?id=${id}`;
    
    const shareData = {
        title: (title ? title + " | " : "") + "Selena Events",
        text: title ? `${title} - Selena Events` : "Selena Events",
        url: url
    };
    
    if (navigator.share) {
        try {
            let dataToShare = shareData;
            if (typeof navigator.canShare === 'function') {
                if (!navigator.canShare(shareData)) {
                    dataToShare = { title: shareData.title, url: shareData.url };
                }
            }
            await navigator.share(dataToShare);
            return;
        } catch(e) {
            if (e.name === 'AbortError') return;
            console.warn('Share failed, fallback to clipboard:', e);
        }
    }
    
    try {
        await navigator.clipboard.writeText(url);
        const copiedMsg = isRo ? "✓ Link copiat în clipboard!" : (isEn ? "✓ Link copied to clipboard!" : "✓ Link in Zwischenablage kopiert!");
        window.showToast(copiedMsg);
    } catch(err) {
        prompt(isRo ? "Copiază linkul:" : (isEn ? "Copy link:" : "Link kopieren:"), url);
    }
};
