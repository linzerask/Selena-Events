import { initializeApp,getApps,getApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { getFirestore,collection,query,where,getDocs } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';
const cfg={apiKey:'AIzaSyAw_TmBCgvAwFPZkJ8RQ7_jSFB62KgQVqc',authDomain:'selena-events-dashboard.firebaseapp.com',projectId:'selena-events-dashboard',storageBucket:'selena-events-dashboard.firebasestorage.app',messagingSenderId:'535842804912',appId:'1:535842804912:web:7464adf97bcdf456131775'};
const app=getApps().length?getApp():initializeApp(cfg),db=getFirestore(app);
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));

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

const snap=await getDocs(query(collection(db,'portfolio_events'),where('visible','==',true)));
const events=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(b.eventDate).localeCompare(String(a.eventDate)));
const grid=document.getElementById('portfolio-events-grid');
if(grid) {
    grid.innerHTML=events.length?events.map(e=>`<button class="portfolio-event text-left bg-white shadow rounded-xl overflow-hidden group" data-id="${e.id}"><img src="${esc(e.coverImage||(e.images||[])[0])}" class="w-full h-72 object-cover group-hover:scale-105 transition"><div class="p-5"><div class="flex justify-between items-center"><p class="text-xs text-gold uppercase">${esc(e.eventDate)}</p><span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase font-medium tracking-wide">${txtCategory[e.category] || esc(e.category || "Event")}</span></div><h3 class="text-xl font-serif mt-1">${esc(e.title)}</h3><p class="text-sm text-gray-500 mt-2">${(e.images||[]).length} ${txtPhotos} &bull; ${txtOpen}</p></div></button>`).join(''):`<p class="col-span-full text-center text-gray-500">${txtEmpty}</p>`;
}

const modal=document.getElementById('portfolio-gallery-modal');
if(modal && grid) {
    grid.querySelectorAll('.portfolio-event').forEach(b=>b.onclick=()=>{
        const e=events.find(x=>x.id===b.dataset.id);
        document.getElementById('portfolio-modal-title').textContent=`${e.eventDate} - ${e.title}`;
        document.getElementById('portfolio-modal-description').textContent=e.description||'';
        document.getElementById('portfolio-modal-images').innerHTML=(e.images||[]).map((u,i)=>`<img src="${esc(u)}" alt="${esc(e.title)} ${i+1}" class="w-full rounded-lg shadow">`).join('');
        modal.classList.remove('hidden');
        document.body.style.overflow='hidden';
    });
    document.getElementById('portfolio-modal-close').onclick=()=>{
        modal.classList.add('hidden');
        document.body.style.overflow='';
    };
}
