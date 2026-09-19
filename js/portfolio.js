import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const cfg = { apiKey:'AIzaSyAw_TmBCgvAwFPZkJ8RQ7_jSFB62KgQVqc', authDomain:'selena-events-dashboard.firebaseapp.com', projectId:'selena-events-dashboard', storageBucket:'selena-events-dashboard.firebasestorage.app', messagingSenderId:'535842804912', appId:'1:535842804912:web:7464adf97bcdf456131775' };
const app = getApps().length ? getApp() : initializeApp(cfg);
const db = getFirestore(app);

const esc = v => String(v ?? '').replace(/[&<>'"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[c]));

const isEn = window.location.pathname.includes('/en/');
const isRo = window.location.pathname.includes('/ro/');
const txtPhotos = isEn ? "Photos" : (isRo ? "Fotografii" : "Fotos");
const txtOpen = isEn ? "Open Gallery" : (isRo ? "Deschide galeria" : "Galerie öffnen");
const txtEmpty = isEn ? "No event galleries published yet." : (isRo ? "Nicio galerie publicată încă." : "Noch keine Event-Galerien veröffentlicht.");
const txtCategory = {
    'hochzeiten': isEn ? 'Weddings' : (isRo ? 'Nunți' : 'Hochzeit'),
    'taufen': isEn ? 'Christenings' : (isRo ? 'Botezuri' : 'Taufe'),
    'geburtstage': isEn ? 'Birthdays' : (isRo ? 'Zile de naștere' : 'Geburtstag'),
    'events': 'Event'
};

try {
    const snap = await getDocs(query(collection(db, 'portfolio_events'), where('visible', '==', true)));
    const events = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => String(b.eventDate || '').localeCompare(String(a.eventDate || '')));
    const grid = document.getElementById('portfolio-events-grid');

    if (grid) {
        if (!events.length) {
            grid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-8">${txtEmpty}</p>`;
        } else {
            grid.innerHTML = events.map(e => {
                const cover = e.coverImage || (Array.isArray(e.images) && e.images[0]) || e.image || '';
                const catKey = (e.category || 'events').toLowerCase();
                const catLabel = txtCategory[catKey] || esc(e.category || "Event");
                const imgCount = (Array.isArray(e.images) ? e.images.length : (cover ? 1 : 0));

                return `
                    <button class="portfolio-event filter-item ${esc(catKey)} text-left bg-white shadow-md hover:shadow-xl rounded-2xl overflow-hidden group transition-all duration-300 border border-gray-100 flex flex-col cursor-pointer" data-id="${e.id}" data-category="${esc(catKey)}">
                        <div class="relative w-full h-64 sm:h-72 overflow-hidden bg-gray-100">
                            ${cover ? `<img src="${esc(cover)}" alt="${esc(e.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">` : `<div class="w-full h-full flex items-center justify-center text-gray-400">Kein Bild</div>`}
                            <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div class="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <div class="flex justify-between items-center gap-2 mb-2">
                                    <span class="text-xs text-gold uppercase tracking-wider font-semibold">${esc(e.eventDate || '')}</span>
                                    <span class="text-[11px] bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full uppercase font-medium tracking-wide">${catLabel}</span>
                                </div>
                                <h3 class="text-xl font-serif text-gray-900 group-hover:text-gold transition-colors line-clamp-1">${esc(e.title || '')}</h3>
                                ${e.description ? `<p class="text-xs text-gray-500 mt-2 line-clamp-2">${esc(e.description)}</p>` : ''}
                            </div>
                            <div class="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between text-xs text-gray-500 font-medium">
                                <span>${imgCount} ${txtPhotos}</span>
                                <span class="text-gold group-hover:underline flex items-center gap-1 font-semibold">${txtOpen} &rarr;</span>
                            </div>
                        </div>
                    </button>
                `;
            }).join('');
        }
    }

    const modal = document.getElementById('portfolio-gallery-modal');
    if (modal && grid) {
        grid.querySelectorAll('.portfolio-event').forEach(b => {
            b.onclick = () => {
                const e = events.find(x => x.id === b.dataset.id);
                if (!e) return;
                const titleEl = document.getElementById('portfolio-modal-title');
                if (titleEl) titleEl.textContent = `${e.eventDate ? e.eventDate + ' – ' : ''}${e.title || ''}`;
                
                const descEl = document.getElementById('portfolio-modal-description');
                if (descEl) descEl.textContent = e.description || '';

                const imgs = Array.isArray(e.images) && e.images.length ? e.images : (e.coverImage ? [e.coverImage] : []);
                const modalImages = document.getElementById('portfolio-modal-images');
                if (modalImages) {
                    modalImages.innerHTML = imgs.map((u, i) => `
                        <div class="mb-4 overflow-hidden rounded-xl bg-gray-900/50 shadow-lg">
                            <img src="${esc(u)}" alt="${esc(e.title || '')} ${i + 1}" class="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-300">
                        </div>
                    `).join('');
                }
                modal.classList.remove('hidden');
                document.body.style.overflow = 'hidden';
            };
        });

        const closeBtn = document.getElementById('portfolio-modal-close');
        if (closeBtn) {
            closeBtn.onclick = () => {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            };
        }

        modal.onclick = (ev) => {
            if (ev.target === modal) {
                modal.classList.add('hidden');
                document.body.style.overflow = '';
            }
        };
    }

    // Connect Filter Buttons to both dynamic and static portfolio items
    const filterBtns = document.querySelectorAll('#portfolio-filters .filter-btn');
    if (filterBtns.length) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterVal = (btn.getAttribute('data-filter') || 'all').toLowerCase();
                const eventCards = document.querySelectorAll('#portfolio-events-grid .portfolio-event');
                eventCards.forEach(card => {
                    const cardCat = (card.getAttribute('data-category') || '').toLowerCase();
                    if (filterVal === 'all' || cardCat === filterVal) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

} catch (err) {
    console.error('Error loading portfolio events:', err);
}

