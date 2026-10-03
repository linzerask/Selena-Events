import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore, doc, getDoc, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const cfg = {
    apiKey: 'AIzaSyAw_TmBCgvAwFPZkJ8RQ7_jSFB62KgQVqc',
    authDomain: 'selena-events-dashboard.firebaseapp.com',
    projectId: 'selena-events-dashboard',
    storageBucket: 'selena-events-dashboard.firebasestorage.app',
    messagingSenderId: '535842804912',
    appId: '1:535842804912:web:7464adf97bcdf456131775'
};

const app = getApps().length ? getApp() : initializeApp(cfg);
const db = getFirestore(app);

// 1. Hero & Highlight Slider Overrides
(async () => {
    try {
        const snap = await getDoc(doc(db, 'settings', 'site_images'));
        if (snap.exists()) {
            const s = snap.data();
            document.querySelectorAll('.hero-slide img').forEach((img, i) => {
                if (s[`hero${i+1}`]) img.src = s[`hero${i+1}`];
            });
            document.querySelectorAll('#highlight-slider img').forEach((img, i) => {
                if (s[`highlight${i+1}`]) img.src = s[`highlight${i+1}`];
            });
        }
    } catch (e) {
        console.warn('Could not load site images:', e);
    }
})();

// 2. Global Media Overrides
(async () => {
    try {
        const media = await getDoc(doc(db, 'settings', 'media_overrides'));
        if (media.exists()) {
            const items = media.data().items || {};
            document.querySelectorAll('img[src]').forEach(img => {
                const raw = img.getAttribute('src').replace(/^\.\//, '').replace(/^\.\.\//, '');
                for (const [path, url] of Object.entries(items)) {
                    if (raw === path || raw.endsWith('/' + path) || decodeURI(new URL(img.src, location.href).pathname).endsWith('/' + path)) {
                        img.src = url;
                        break;
                    }
                }
            });
        }
    } catch (e) {
        console.warn('Could not load media overrides:', e);
    }
})();

// 3. Dynamic Partners & Sponsors Marquee
(async () => {
    try {
        const marqueeTrack = document.getElementById('partners-marquee-track') || document.querySelector('.animate-scroll');
        if (marqueeTrack) {
            let partnersSnap;
            try {
                partnersSnap = await getDocs(query(collection(db, 'partners')));
            } catch (err) {
                partnersSnap = await getDocs(query(collection(db, 'partners'), where('visible', '==', true)));
            }

            if (partnersSnap && !partnersSnap.empty) {
                let partners = [];
                partnersSnap.forEach(d => {
                    const data = d.data();
                    if (data.visible !== false) {
                        partners.push({ id: d.id, ...data });
                    }
                });
                partners.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

                if (partners.length > 0) {
                    const isSubfolder = window.location.pathname.includes('/en/') || window.location.pathname.includes('/ro/') || window.location.pathname.includes('/shop-items/') || window.location.pathname.includes('/verleih-items/');
                    const prefix = isSubfolder ? '../' : '';

                    let renderList = [...partners];
                    while (renderList.length < 16) {
                        renderList = renderList.concat(partners);
                    }

                    const generateGroupHTML = (list) => {
                        return `<div class="flex items-center gap-16 pr-16 min-w-max">` +
                            list.map(p => {
                                let imgUrl = p.logoUrl || '';
                                if (imgUrl.startsWith('assets/')) {
                                    imgUrl = prefix + imgUrl;
                                }
                                const imgTag = `<img src="${imgUrl}" class="h-40 md:h-48 w-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer drop-shadow-sm object-contain" alt="${p.name || 'Partner'}">`;
                                const rawUrl = (p.websiteUrl || p.url || '').trim();
                                if (rawUrl !== '') {
                                    let href = rawUrl;
                                    if (!href.startsWith('http://') && !href.startsWith('https://')) {
                                        href = 'https://' + href;
                                    }
                                    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="inline-block hover:scale-105 transition-transform cursor-pointer" title="${p.name || ''}">${imgTag}</a>`;
                                }
                                return imgTag;
                            }).join('') +
                        `</div>`;
                    };

                    const group1 = generateGroupHTML(renderList);
                    const group2 = generateGroupHTML(renderList);
                    marqueeTrack.innerHTML = group1 + group2;
                }
            }
        }
    } catch (e) {
        console.warn('Could not load dynamic partners:', e);
    }
})();
