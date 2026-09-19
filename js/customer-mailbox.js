import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, query, orderBy, onSnapshot, updateDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

const config={apiKey:"AIzaSyAw_TmBCgvAwFPZkJ8RQ7_jSFB62KgQVqc",authDomain:"selena-events-dashboard.firebaseapp.com",projectId:"selena-events-dashboard",storageBucket:"selena-events-dashboard.firebasestorage.app",messagingSenderId:"535842804912",appId:"1:535842804912:web:7464adf97bcdf456131775"};
const app=getApps().length?getApp():initializeApp(config), auth=getAuth(app), db=getFirestore(app), storage=getStorage(app);
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fmt=t=>t?.toDate?t.toDate().toLocaleString('de-DE'):'';

onAuthStateChanged(auth,user=>{
  if(!user)return;
  const q=query(collection(db,'customer_mailboxes',user.uid,'messages'),orderBy('createdAt','desc'));
  onSnapshot(q,snap=>{
    const list=document.getElementById('customer-mailbox-list'), badge=document.getElementById('customer-mail-badge');
    if(!list)return;
    let unread=0;
    const isEn = window.location.pathname.includes('/en/');
    const isRo = window.location.pathname.includes('/ro/');
    const emptyText = isEn ? 'Your mailbox is empty.' : isRo ? 'Căsuța dvs. poștală este goală.' : 'Ihr Postfach ist leer.';
    const invoiceBtnText = isEn ? 'Download PDF Invoice' : isRo ? 'Descarcă Factura PDF' : 'PDF-Rechnung herunterladen';
    
    list.innerHTML=snap.empty?`<p class="text-sm text-gray-500">${emptyText}</p>`:snap.docs.map(d=>{
      const m=d.data(); if(!m.readByCustomer)unread++;
      return `<article data-id="${d.id}" class="mailbox-message border ${m.readByCustomer?'border-gray-100':'border-gold bg-yellow-50/40'} rounded-xl p-5 cursor-pointer"><div class="flex justify-between gap-3"><h4 class="font-semibold text-gray-900">${esc(m.subject)}</h4><time class="text-xs text-gray-400">${fmt(m.createdAt)}</time></div><p class="text-sm text-gray-700 whitespace-pre-wrap mt-3">${esc(m.body)}</p>${m.invoicePath?`<button type="button" data-path="${esc(m.invoicePath)}" class="invoice-download inline-flex mt-4 px-4 py-2 bg-gray-900 text-white text-xs rounded-md">${invoiceBtnText}</button>`:''}</article>`;
    }).join('');
    if(badge){badge.textContent=String(unread);badge.classList.toggle('hidden',unread===0);}
    list.querySelectorAll('.mailbox-message').forEach(el=>el.addEventListener('click',()=>updateDoc(doc(db,'customer_mailboxes',user.uid,'messages',el.dataset.id),{readByCustomer:true}).catch(console.error)));
    list.querySelectorAll('.invoice-download').forEach(btn=>btn.addEventListener('click',async e=>{e.stopPropagation();const url=await getDownloadURL(ref(storage,btn.dataset.path));window.open(url,'_blank','noopener');}));
  },err=>{document.getElementById('customer-mailbox-list').innerHTML='<p class="text-sm text-red-600">Postfach konnte nicht geladen werden.</p>';console.error(err);});
});
