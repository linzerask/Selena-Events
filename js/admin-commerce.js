import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, getDocs, getDoc, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

const config = { apiKey:"AIzaSyAw_TmBCgvAwFPZkJ8RQ7_jSFB62KgQVqc", authDomain:"selena-events-dashboard.firebaseapp.com", projectId:"selena-events-dashboard", storageBucket:"selena-events-dashboard.firebasestorage.app", messagingSenderId:"535842804912", appId:"1:535842804912:web:7464adf97bcdf456131775" };
const app = getApps().length ? getApp() : initializeApp(config);
const auth = getAuth(app), db = getFirestore(app), storage = getStorage(app);
let customers = [], activeCustomer = null, unsubscribeThread = null;

const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fmt = ts => ts?.toDate ? ts.toDate().toLocaleString('de-DE') : '';

async function isStaff(uid) {
  const snap = await window.firebaseGetDoc(window.firebaseDoc(window.db, 'user_roles', uid));
  return snap.exists() && ['owner','dev'].includes(snap.data().role);
}

async function loadCustomers() {
  const list = document.getElementById('customer-mail-users');
  const snap = await getDocs(collection(db, 'users'));
  customers = snap.docs.map(d => ({ uid:d.id, ...d.data() })).sort((a,b) => String(a.name||a.email).localeCompare(String(b.name||b.email)));
  renderCustomers(customers);
  if (!customers.length) list.innerHTML = '<p class="text-sm text-gray-500">Keine registrierten Kunden.</p>';
}

async function loadTransportSettings(){const snap=await getDoc(doc(db,'settings','transport'));if(!snap.exists())return;const s=snap.data();document.getElementById('transport-origin').value=s.origin||'';document.getElementById('transport-included-km').value=Number(s.includedKm||0);document.getElementById('transport-price-km').value=Number(s.pricePerKm||0);document.getElementById('transport-roundtrip').checked=s.roundTrip!==false;}
document.getElementById('transport-settings-form')?.addEventListener('submit',async e=>{e.preventDefault();const status=document.getElementById('transport-settings-status');await setDoc(doc(db,'settings','transport'),{origin:document.getElementById('transport-origin').value.trim(),includedKm:Number(document.getElementById('transport-included-km').value||0),pricePerKm:Number(document.getElementById('transport-price-km').value||0),roundTrip:document.getElementById('transport-roundtrip').checked,updatedAt:serverTimestamp(),updatedBy:auth.currentUser.uid},{merge:true});status.textContent='Transportcode gespeichert.';status.className='md:col-span-5 text-xs text-green-600';});

function renderCustomers(items) {
  const list = document.getElementById('customer-mail-users');
  if (!list) return;
  list.innerHTML = items.map(u => `<button type="button" data-uid="${esc(u.uid)}" class="customer-mail-user w-full text-left p-3 border rounded-lg hover:border-gold hover:bg-yellow-50"><span class="block text-sm font-medium">${esc(u.name || 'Kunde')}</span><span class="block text-xs text-gray-500">${esc(u.email || '')}</span></button>`).join('');
  list.querySelectorAll('.customer-mail-user').forEach(b => b.addEventListener('click', () => selectCustomer(customers.find(u => u.uid === b.dataset.uid))));
}

function selectCustomer(user) {
  activeCustomer = user;
  document.getElementById('customer-mail-title').textContent = `${user.name || 'Kunde'} · ${user.email || ''}`;
  document.getElementById('customer-mail-uid').value = user.uid;
  document.getElementById('customer-mail-form').classList.remove('hidden');
  if (unsubscribeThread) unsubscribeThread();
  unsubscribeThread = onSnapshot(query(collection(db, 'customer_mailboxes', user.uid, 'messages'), orderBy('createdAt','asc')), snap => {
    const thread = document.getElementById('customer-mail-thread');
    thread.innerHTML = snap.empty ? '<p class="text-sm text-gray-500">Noch keine Nachrichten.</p>' : snap.docs.map(d => {
      const m=d.data();
      return `<article class="bg-white border rounded-lg p-4"><div class="flex justify-between gap-3"><strong class="text-sm">${esc(m.subject)}</strong><span class="text-xs text-gray-400">${fmt(m.createdAt)}</span></div><p class="text-sm text-gray-700 whitespace-pre-wrap mt-2">${esc(m.body)}</p>${m.invoicePath ? `<span class="inline-block mt-3 text-sm text-blue-600">PDF: ${esc(m.invoiceName || 'Rechnung')}</span>`:''}</article>`;
    }).join('');
    thread.scrollTop = thread.scrollHeight;
  });
}

async function sendMessage(e) {
  e.preventDefault();
  if (!activeCustomer) return;
  const status = document.getElementById('customer-mail-status');
  const subject = document.getElementById('customer-mail-subject').value.trim();
  const body = document.getElementById('customer-mail-body').value.trim();
  const file = document.getElementById('customer-mail-invoice').files[0];
  if (file && (file.type !== 'application/pdf' || file.size > 10 * 1024 * 1024)) { status.textContent='Nur PDF-Dateien bis 10 MB sind erlaubt.'; status.className='text-sm text-red-600'; return; }
  status.textContent='Wird gesendet...'; status.className='text-sm text-gray-500';
  const mailboxRef = doc(db, 'customer_mailboxes', activeCustomer.uid);
  await setDoc(mailboxRef, { customerUid:activeCustomer.uid, customerEmail:activeCustomer.email || '', customerName:activeCustomer.name || '', updatedAt:serverTimestamp(), lastSubject:subject }, {merge:true});
  const msgRef = await addDoc(collection(mailboxRef, 'messages'), { customerUid:activeCustomer.uid, subject, body, senderRole:'staff', senderUid:auth.currentUser.uid, readByCustomer:false, createdAt:serverTimestamp(), invoicePath:null, invoiceName:null });
  if (file) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const fileRef = ref(storage, `customer-documents/${activeCustomer.uid}/${msgRef.id}/${safeName}`);
    await uploadBytes(fileRef, file, { contentType:'application/pdf', customMetadata:{ customerUid:activeCustomer.uid, messageId:msgRef.id } });
    await updateDoc(msgRef, { invoicePath:fileRef.fullPath, invoiceName:file.name });
  }
  e.target.reset(); document.getElementById('customer-mail-uid').value=activeCustomer.uid;
  status.textContent='Nachricht wurde privat gesendet.'; status.className='text-sm text-green-600';
}

document.getElementById('customer-mail-search')?.addEventListener('input', e => { const q=e.target.value.toLowerCase(); renderCustomers(customers.filter(u => `${u.name||''} ${u.email||''}`.toLowerCase().includes(q))); });
document.getElementById('customer-mail-form')?.addEventListener('submit', e => sendMessage(e).catch(err => { const s=document.getElementById('customer-mail-status'); s.textContent=err.message; s.className='text-sm text-red-600'; }));

document.getElementById('import-catalog-btn')?.addEventListener('click',async e=>{if(!confirm('Produsele existente vor fi importate o singură dată și vor deveni editabile. Continuăm?'))return;e.currentTarget.disabled=true;try{const catalog=await fetch('functions/catalog.json').then(r=>r.json());for(const p of catalog){const id=`catalog_${p.source}_${p.id}`;await setDoc(doc(db,'custom_products',id),{category:p.category||'Katalog',title:p.title,subtitle:p.shortDesc||'',price:Number(p.price||0),priceMode:'fixed',decorationService:(p.tags||[]).includes('Dekoration'),features:[],longDesc:p.longDesc||'',target:p.source==='verleih'?'verleih':'shop',visible:true,isPremium:(p.tags||[]).includes('Premium'),tags:p.tags||[],img:p.img,images:p.images||[p.img],legacySource:p.source,legacyId:String(p.id),trackStock:false,transportEnabled:false,transportMode:'none',createdAt:serverTimestamp()},{merge:true});}alert(`${catalog.length} produse au fost importate/actualizate.`);}catch(err){alert(err.message)}finally{e.currentTarget.disabled=false;}});

// ==========================================
// PORTFOLIO / EVENT-GALERIE MANAGER WITH LIVE COVER SELECTOR
// ==========================================
let portfolioExistingImages = [];
let portfolioNewFiles = [];
let portfolioSelectedCover = null;

function resetPortfolioForm() {
  const form = document.getElementById('portfolio-event-form');
  if (form) form.reset();
  const idEl = document.getElementById('portfolio-id');
  if (idEl) idEl.value = '';
  const visEl = document.getElementById('portfolio-visible');
  if (visEl) visEl.checked = true;
  const formTitle = document.getElementById('portfolio-form-title');
  if (formTitle) formTitle.textContent = 'Neue Event-Galerie';
  const submitBtn = document.getElementById('portfolio-submit-btn');
  if (submitBtn) submitBtn.textContent = 'Galerie speichern';
  const cancelBtn = document.getElementById('portfolio-cancel-btn');
  if (cancelBtn) cancelBtn.classList.add('hidden');
  const status = document.getElementById('portfolio-status');
  if (status) { status.textContent = ''; status.className = 'text-sm font-medium'; }
  
  portfolioExistingImages = [];
  portfolioNewFiles = [];
  portfolioSelectedCover = null;
  renderPortfolioImagePreviews();
}

function renderPortfolioImagePreviews() {
  const container = document.getElementById('portfolio-images-preview-grid');
  const previewWrapper = document.getElementById('portfolio-images-preview-wrapper');
  if (!container) return;

  const totalItemsCount = portfolioExistingImages.length + portfolioNewFiles.length;
  if (totalItemsCount === 0) {
    if (previewWrapper) previewWrapper.classList.add('hidden');
    container.innerHTML = '';
    return;
  }
  if (previewWrapper) previewWrapper.classList.remove('hidden');

  // Ensure a valid cover is selected (default to first available image)
  const isCoverValid = (portfolioSelectedCover && (
    portfolioExistingImages.includes(portfolioSelectedCover) ||
    portfolioNewFiles.some((_, i) => portfolioSelectedCover === `file_${i}`)
  ));

  if (!isCoverValid) {
    if (portfolioExistingImages.length > 0) {
      portfolioSelectedCover = portfolioExistingImages[0];
    } else if (portfolioNewFiles.length > 0) {
      portfolioSelectedCover = 'file_0';
    } else {
      portfolioSelectedCover = null;
    }
  }

  let html = '';

  // 1. Existing images from Firestore / Storage
  portfolioExistingImages.forEach((url, idx) => {
    const isCover = portfolioSelectedCover === url;
    html += `
      <div class="gallery-preview-item ${isCover ? 'is-cover' : ''}" data-cover-type="url" data-cover-id="${esc(url)}" title="Klicken, um als Titelbild festzulegen">
        <img src="${esc(url)}" class="w-full h-full object-cover" alt="Galerie Foto">
        ${isCover ? '<div class="cover-badge">★ TITELBILD</div>' : '<div class="set-cover-overlay">Als Titelbild festlegen</div>'}
        <button type="button" class="remove-img-btn" title="Bild entfernen" data-img-type="existing" data-idx="${idx}">✕</button>
      </div>
    `;
  });

  // 2. Newly selected local files (instant client-side blob preview)
  portfolioNewFiles.forEach((fileObj, idx) => {
    const fileId = `file_${idx}`;
    const isCover = portfolioSelectedCover === fileId;
    const blobUrl = fileObj._blobUrl || (fileObj._blobUrl = URL.createObjectURL(fileObj));
    html += `
      <div class="gallery-preview-item ${isCover ? 'is-cover' : ''}" data-cover-type="file" data-cover-id="${fileId}" title="Klicken, um als Titelbild festzulegen">
        <img src="${blobUrl}" class="w-full h-full object-cover" alt="Neues Foto">
        ${isCover ? '<div class="cover-badge">★ TITELBILD</div>' : '<div class="set-cover-overlay">Als Titelbild festlegen</div>'}
        <span class="absolute bottom-1.5 right-1.5 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded font-mono z-10 pointer-events-none">Neu</span>
        <button type="button" class="remove-img-btn" title="Bild entfernen" data-img-type="new" data-idx="${idx}">✕</button>
      </div>
    `;
  });

  container.innerHTML = html;

  // Clicking anywhere on the thumbnail selects it as the Cover Image
  container.querySelectorAll('.gallery-preview-item').forEach(item => {
    item.onclick = (e) => {
      if (e.target.closest('.remove-img-btn')) return;
      portfolioSelectedCover = item.dataset.coverId;
      renderPortfolioImagePreviews();
    };
  });

  // Clicking the remove button deletes the image
  container.querySelectorAll('.remove-img-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const type = btn.dataset.imgType;
      const idx = parseInt(btn.dataset.idx, 10);
      if (type === 'existing') {
        const removedUrl = portfolioExistingImages[idx];
        portfolioExistingImages.splice(idx, 1);
        if (portfolioSelectedCover === removedUrl) {
          portfolioSelectedCover = null;
        }
      } else if (type === 'new') {
        const removedId = `file_${idx}`;
        portfolioNewFiles.splice(idx, 1);
        if (portfolioSelectedCover === removedId) {
          portfolioSelectedCover = null;
        }
      }
      renderPortfolioImagePreviews();
    };
  });
}

function initPortfolioManager() {
  const imagesInput = document.getElementById('portfolio-images');
  if (imagesInput) {
    imagesInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length > 0) {
        portfolioNewFiles = [...portfolioNewFiles, ...files];
        if (!portfolioSelectedCover && portfolioExistingImages.length === 0) {
          portfolioSelectedCover = 'file_0';
        }
        renderPortfolioImagePreviews();
      }
      imagesInput.value = '';
    });
  }

  const cancelBtn = document.getElementById('portfolio-cancel-btn');
  if (cancelBtn) {
    cancelBtn.onclick = (e) => {
      e.preventDefault();
      resetPortfolioForm();
    };
  }

  const form = document.getElementById('portfolio-event-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = document.getElementById('portfolio-status');
      const submitBtn = document.getElementById('portfolio-submit-btn');

      const totalImages = portfolioExistingImages.length + portfolioNewFiles.length;
      if (totalImages === 0) {
        if (status) {
          status.textContent = 'Bitte lade mindestens ein Bild für die Galerie hoch.';
          status.className = 'text-sm text-red-600 font-medium';
        }
        return;
      }

      try {
        if (submitBtn) submitBtn.disabled = true;
        if (status) {
          status.textContent = 'Bilder werden verarbeitet und hochgeladen...';
          status.className = 'text-sm text-blue-600 font-medium';
        }

        let id = document.getElementById('portfolio-id')?.value.trim();
        const isEditing = Boolean(id);
        if (!id) {
          id = doc(collection(db, 'portfolio_events')).id;
        }

        const newlyUploadedUrls = [];
        let newFilesCoverUrl = null;

        for (let i = 0; i < portfolioNewFiles.length; i++) {
          const file = portfolioNewFiles[i];
          const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const fileRef = ref(storage, `portfolio/${id}/${Date.now()}_${i}_${safe}`);
          await uploadBytes(fileRef, file);
          const dlUrl = await getDownloadURL(fileRef);
          newlyUploadedUrls.push(dlUrl);

          if (portfolioSelectedCover === `file_${i}`) {
            newFilesCoverUrl = dlUrl;
          }
        }

        const finalImages = [...portfolioExistingImages, ...newlyUploadedUrls];

        let finalCoverImage = '';
        if (portfolioSelectedCover && portfolioExistingImages.includes(portfolioSelectedCover)) {
          finalCoverImage = portfolioSelectedCover;
        } else if (newFilesCoverUrl) {
          finalCoverImage = newFilesCoverUrl;
        } else if (finalImages.length > 0) {
          finalCoverImage = finalImages[0];
        }

        // Reorder finalImages so the selected cover is always at index 0 (guarantees backward compatibility)
        if (finalCoverImage && finalImages.includes(finalCoverImage)) {
          const coverIdx = finalImages.indexOf(finalCoverImage);
          if (coverIdx > 0) {
            finalImages.splice(coverIdx, 1);
            finalImages.unshift(finalCoverImage);
          }
        }

        const payload = {
          title: document.getElementById('portfolio-title').value.trim(),
          eventDate: document.getElementById('portfolio-date').value,
          category: document.getElementById('portfolio-category').value,
          description: document.getElementById('portfolio-description').value.trim(),
          images: finalImages,
          coverImage: finalCoverImage,
          visible: document.getElementById('portfolio-visible').checked,
          updatedAt: serverTimestamp()
        };

        if (!isEditing) {
          payload.createdAt = serverTimestamp();
          payload.createdBy = auth.currentUser ? auth.currentUser.uid : 'admin';
        }

        await setDoc(doc(db, 'portfolio_events', id), payload, { merge: true });

        if (status) {
          status.textContent = isEditing ? 'Galerie erfolgreich aktualisiert!' : 'Galerie erfolgreich gespeichert!';
          status.className = 'text-sm text-green-600 font-medium';
        }

        resetPortfolioForm();
      } catch (err) {
        console.error('Portfolio save error:', err);
        if (status) {
          status.textContent = 'Fehler beim Speichern: ' + err.message;
          status.className = 'text-sm text-red-600 font-medium';
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
}

function loadPortfolioAdmin() {
  onSnapshot(query(collection(db, 'portfolio_events'), orderBy('eventDate', 'desc')), snap => {
    const list = document.getElementById('portfolio-admin-list');
    if (!list) return;

    if (snap.empty) {
      list.innerHTML = '<p class="text-sm text-gray-500 py-4 text-center">Keine Event-Galerien vorhanden.</p>';
      return;
    }

    const categoryLabels = {
      'hochzeiten': 'Hochzeit',
      'taufen': 'Taufe',
      'geburtstage': 'Geburtstag',
      'events': 'Event'
    };

    list.innerHTML = snap.docs.map(docSnap => {
      const p = docSnap.data();
      const eventId = docSnap.id;
      const cover = p.coverImage || (p.images && p.images[0]) || p.image || '';
      const cat = categoryLabels[p.category] || p.category || 'Event';
      const imgCount = (p.images || []).length;

      return `
        <div class="bg-white border border-gray-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm hover:shadow transition-shadow">
          <div class="flex items-center gap-3.5 flex-1 min-w-0">
            <div class="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
              ${cover ? `<img src="${esc(cover)}" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center text-xs text-gray-400">Kein Bild</div>`}
              <span class="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] text-center font-bold tracking-wider uppercase py-0.5">Titelbild</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-semibold text-gray-900">${esc(p.title)}</span>
                <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">${esc(cat)}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full font-medium ${p.visible ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600'}">${p.visible ? 'Öffentlich' : 'Entwurf'}</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">${esc(p.eventDate)} &bull; ${imgCount} Bilder</p>
              ${p.description ? `<p class="text-xs text-gray-400 truncate mt-0.5">${esc(p.description)}</p>` : ''}
            </div>
          </div>
          <div class="flex items-center gap-2 self-end sm:self-center">
            <button class="portfolio-edit bg-gray-100 hover:bg-gold hover:text-white text-gray-700 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1" data-id="${eventId}">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              Bearbeiten
            </button>
            <button class="portfolio-delete text-red-500 hover:text-red-700 hover:bg-red-50 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors" data-id="${eventId}" title="Galerie löschen">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    list.querySelectorAll('.portfolio-edit').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        const docSnap = snap.docs.find(d => d.id === id);
        if (!docSnap) return;
        const data = docSnap.data();

        document.getElementById('portfolio-id').value = id;
        document.getElementById('portfolio-title').value = data.title || '';
        document.getElementById('portfolio-date').value = data.eventDate || '';
        document.getElementById('portfolio-category').value = data.category || 'hochzeiten';
        document.getElementById('portfolio-description').value = data.description || '';
        document.getElementById('portfolio-visible').checked = data.visible !== false;

        portfolioExistingImages = Array.isArray(data.images) ? [...data.images] : (data.coverImage ? [data.coverImage] : []);
        portfolioNewFiles = [];
        portfolioSelectedCover = data.coverImage || (portfolioExistingImages[0] || null);

        document.getElementById('portfolio-form-title').textContent = 'Event-Galerie bearbeiten';
        document.getElementById('portfolio-submit-btn').textContent = 'Galerie aktualisieren';
        document.getElementById('portfolio-cancel-btn').classList.remove('hidden');

        renderPortfolioImagePreviews();

        document.getElementById('portfolio-event-form')?.scrollIntoView({ behavior: 'smooth' });
      };
    });

    list.querySelectorAll('.portfolio-delete').forEach(btn => {
      btn.onclick = () => {
        if (confirm('Möchtest du diese Event-Galerie wirklich unwiderruflich löschen?')) {
          deleteDoc(doc(db, 'portfolio_events', btn.dataset.id));
        }
      };
    });
  });
}

document.getElementById('site-images-form')?.addEventListener('submit',async e=>{e.preventDefault();const status=document.getElementById('site-images-status');status.textContent='Wird hochgeladen...';const changes={};for(const input of e.target.querySelectorAll('input[type=file][data-slot]')){const file=input.files[0];if(!file)continue;const fileRef=ref(storage,`site-content/${input.dataset.slot}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`);await uploadBytes(fileRef,file);changes[input.dataset.slot]=await getDownloadURL(fileRef);}if(Object.keys(changes).length)await setDoc(doc(db,'settings','site_images'),{...changes,updatedAt:serverTimestamp(),updatedBy:auth.currentUser.uid},{merge:true});e.target.reset();status.textContent='Bilder gespeichert.';status.className='mt-2 text-sm text-green-600';});

function loadCancellations(){onSnapshot(query(collection(db,'cancellation_requests'),orderBy('createdAt','desc')),snap=>{const list=document.getElementById('cancellation-admin-list');if(!list)return;list.innerHTML=snap.empty?'<p class="text-sm text-gray-500">Keine Anfragen.</p>':snap.docs.map(x=>{const c=x.data();return `<div class="border rounded p-2 text-xs"><strong>${esc(c.eventDate)} · ${esc(c.customerEmail)}</strong><p>${esc(c.reason)}</p><select data-id="${x.id}" class="cancel-status mt-2 border rounded"><option ${c.status==='Neu'?'selected':''}>Neu</option><option ${c.status==='In Prüfung'?'selected':''}>In Prüfung</option><option ${c.status==='Bestätigt'?'selected':''}>Bestätigt</option><option ${c.status==='Abgelehnt'?'selected':''}>Abgelehnt</option></select></div>`}).join('');list.querySelectorAll('.cancel-status').forEach(s=>s.onchange=()=>updateDoc(doc(db,'cancellation_requests',s.dataset.id),{status:s.value,updatedAt:serverTimestamp(),updatedBy:auth.currentUser.uid}));});}

async function setupMediaManager(){const anchor=document.getElementById('site-images-form');if(!anchor||document.getElementById('media-override-form'))return;const form=document.createElement('form');form.id='media-override-form';form.className='mt-6 bg-white border rounded-xl p-6';form.innerHTML='<h3 class="text-xl font-serif mb-2">Alle Website-Bilder ersetzen</h3><p class="text-sm text-gray-500 mb-4">Aktuellen relativen Bildpfad eingeben, z.B. <code>assets/1.png</code> (Partner 1), <code>assets/logo_dark.png</code> (Logo) oder <code>assets/luiza.jpg</code> (Teamfoto). Die neue Datei wird überall auf der Website verwendet.</p><div class="grid md:grid-cols-3 gap-3"><input id="media-original-path" required class="border rounded px-3 py-2" placeholder="assets/1.png"><input id="media-new-file" required type="file" accept="image/*" class="border rounded px-3 py-2"><button class="bg-gold text-white rounded px-4 py-2">Global ersetzen</button></div><p id="media-override-status" class="mt-2 text-sm"></p><div id="media-overrides-list" class="mt-4 grid md:grid-cols-2 gap-2"></div>';anchor.insertAdjacentElement('afterend',form);const render=async()=>{const snap=await getDoc(doc(db,'settings','media_overrides'));const data=snap.exists()?snap.data().items||{}:{};document.getElementById('media-overrides-list').innerHTML=Object.entries(data).map(([path,url])=>`<div class="border rounded p-2 flex items-center gap-3"><img src="${esc(url)}" class="w-12 h-12 object-cover"><span class="text-xs break-all">${esc(path)}</span></div>`).join('')||'<p class="text-sm text-gray-500">Noch keine globalen Ersetzungen.</p>';};form.onsubmit=async e=>{e.preventDefault();const path=document.getElementById('media-original-path').value.trim().replace(/^\.\//,'').replace(/^\//,'');const file=document.getElementById('media-new-file').files[0];const fileRef=ref(storage,`site-content/global_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`);await uploadBytes(fileRef,file);const url=await getDownloadURL(fileRef);const existing=await getDoc(doc(db,'settings','media_overrides'));const items=existing.exists()?existing.data().items||{}:{};items[path]=url;await setDoc(doc(db,'settings','media_overrides'),{items,updatedAt:serverTimestamp(),updatedBy:auth.currentUser.uid});form.reset();document.getElementById('media-override-status').textContent='Bild wurde auf der gesamten Website ersetzt.';await render();};await render();}

async function setupTeamManager(){const anchor=document.getElementById('media-override-form')||document.getElementById('site-images-form');if(!anchor||document.getElementById('team-admin-form'))return;const defaults=[{id:'selena',name:'Selena A. Ochian',role:'Chief Happiness Officer',description:'Hallo! Ich bin Selena! Ich bin 3 Jahre alt. Ich liebe spielen, lachen und tanzen.',image:'assets/selena.jpg',order:1},{id:'luiza',name:'Luiza I. Ochian',role:'Co-Founder',description:'Organisation, Kreativität und Liebe zum Detail für unvergessliche Events.',image:'assets/luiza.jpg',order:2},{id:'adelin',name:'Ochian C. Adelin',role:'Founder',description:'Gründer von Selena Events mit Leidenschaft für Details und echte Emotionen.',image:'assets/adelin.jpg',order:3},{id:'cristina',name:'Cristina L.',role:'Eventsaal-Designer',description:'Expertin für Ästhetik, Farben und die Gestaltung traumhafter Veranstaltungssäle.',image:'assets/cristina.jpg',order:4}];const existing=await getDocs(collection(db,'team_members'));if(existing.empty)for(const m of defaults)await setDoc(doc(db,'team_members',m.id),{...m,visible:true,createdAt:serverTimestamp()});const wrap=document.createElement('div');wrap.className='mt-6 grid lg:grid-cols-2 gap-6';wrap.innerHTML='<form id="team-admin-form" class="bg-white border rounded-xl p-6 space-y-3"><h3 class="text-xl font-serif">Team verwalten</h3><input id="team-id" type="hidden"><input id="team-name" required class="w-full border rounded px-3 py-2" placeholder="Name"><input id="team-role" required class="w-full border rounded px-3 py-2" placeholder="Funktion / Grad"><textarea id="team-description" required rows="4" class="w-full border rounded px-3 py-2" placeholder="Beschreibung"></textarea><input id="team-order" type="number" min="0" value="1" class="w-full border rounded px-3 py-2" placeholder="Reihenfolge"><label class="block text-sm">Neues Foto (bei Bearbeitung optional)<input id="team-image" type="file" accept="image/*" class="block mt-1"></label><label class="text-sm"><input id="team-visible" type="checkbox" checked> Sichtbar</label><div class="flex gap-2"><button class="bg-gold text-white px-4 py-2 rounded">Speichern</button><button id="team-reset" type="button" class="border px-4 py-2 rounded">Neu</button></div><p id="team-status" class="text-sm"></p></form><div class="bg-white border rounded-xl p-6"><h3 class="font-semibold mb-3">Aktuelles Team</h3><div id="team-admin-list" class="space-y-2"></div></div>';anchor.insertAdjacentElement('afterend',wrap);const form=wrap.querySelector('form');const reset=()=>{form.reset();document.getElementById('team-id').value='';document.getElementById('team-visible').checked=true;};document.getElementById('team-reset').onclick=reset;onSnapshot(collection(db,'team_members'),snap=>{const members=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>Number(a.order||0)-Number(b.order||0));document.getElementById('team-admin-list').innerHTML=members.map(m=>`<div class="border rounded p-2 flex items-center gap-3"><img src="${esc(m.image)}" class="w-12 h-12 rounded-full object-cover"><div class="flex-1"><strong>${esc(m.name)}</strong><p class="text-xs">${esc(m.role)}</p></div><button class="team-edit text-blue-600 text-xs" data-id="${m.id}">Edit</button><button class="team-delete text-red-600 text-xs" data-id="${m.id}">Delete</button></div>`).join('');wrap.querySelectorAll('.team-edit').forEach(b=>b.onclick=()=>{const m=members.find(x=>x.id===b.dataset.id);document.getElementById('team-id').value=m.id;document.getElementById('team-name').value=m.name;document.getElementById('team-role').value=m.role;document.getElementById('team-description').value=m.description;document.getElementById('team-order').value=m.order||0;document.getElementById('team-visible').checked=m.visible!==false;});wrap.querySelectorAll('.team-delete').forEach(b=>b.onclick=()=>confirm('Teammitglied löschen?')&&deleteDoc(doc(db,'team_members',b.dataset.id)));});form.onsubmit=async e=>{e.preventDefault();let id=document.getElementById('team-id').value||doc(collection(db,'team_members')).id;const old=await getDoc(doc(db,'team_members',id));let image=old.exists()?old.data().image:'';const file=document.getElementById('team-image').files[0];if(file){const fileRef=ref(storage,`team/${id}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`);await uploadBytes(fileRef,file);image=await getDownloadURL(fileRef);}if(!image)return alert('Bitte ein Foto auswählen.');await setDoc(doc(db,'team_members',id),{name:document.getElementById('team-name').value.trim(),role:document.getElementById('team-role').value.trim(),description:document.getElementById('team-description').value.trim(),order:Number(document.getElementById('team-order').value||0),visible:document.getElementById('team-visible').checked,image,updatedAt:serverTimestamp()},{merge:true});reset();document.getElementById('team-status').textContent='Teammitglied gespeichert.';};}

onAuthStateChanged(auth, async user => {
    if (user && await isStaff(user.uid)) {
        loadCustomers().catch(console.error);
        loadTransportSettings().catch(console.error);
        initPortfolioManager();
        loadPortfolioAdmin();
        loadCancellations();
        setupMediaManager().catch(console.error);
        setupTeamManager().catch(console.error);
        setupFeaturedItemsManager().catch(console.error);
    }
});




let cachedFeaturedItems = [];

async function setupFeaturedItemsManager() {
    const standaloneContainer = document.getElementById('featured-admin-standalone-container');
    const anchor = document.getElementById('media-override-form') || document.getElementById('site-images-form');

    // Build complete catalog
    const allCatalog = [];

    // 1. Static Shop Defaults
    const staticShop = [
        { id: '1', type: 'shop', title: 'Themen-Dekoration mit Ballonbogen', img: 'assets/shop/ballonbogen1.png', price: 180, priceMode: 'fixed', category: 'Ballondekoration', shortDesc: 'Dekorativer Ballonbogen für Events.' },
        { id: '2', type: 'shop', title: 'Themen-Dekoration mit Ballonbogen 2', img: 'assets/shop/ballonbogen2.png', price: 180, priceMode: 'fixed', category: 'Ballondekoration', shortDesc: 'Dekorativer Ballonbogen für Events.' },
        { id: '3', type: 'shop', title: 'Event Dekoration', img: 'assets/shop/deko1.png', price: 180, priceMode: 'fixed', category: 'Ballondekoration', shortDesc: 'Elegante Dekoration für Events.' }
    ];

    // 2. Static Verleih Defaults
    const staticVerleih = [
        { id: '1', type: 'verleih', title: 'Audio Gästebuch Telefon', img: 'assets/verleih/audiogaestebuchtelefon1.png', price: 45, priceMode: 'fixed', category: 'Fotoecke', shortDesc: 'Audio Gästebuch Telefon mit unbegrenzten Sprachaufnahmen.' },
        { id: '2', type: 'verleih', title: 'Video & Audio Gästebuch Telefon', img: 'assets/verleih/videoaudiogaestebuchtelefon1.png', price: 130, priceMode: 'fixed', category: 'Fotoecke', shortDesc: 'Video & Audio Gästebuch Telefon mit unbegrenzten Video- und Sprachaufnahmen.' },
        { id: '3', type: 'verleih', title: 'Hüpfburg Drachen & Schloss mit Rutsche', img: 'assets/verleih/hupfburg1.png', price: 180, priceMode: 'fixed', category: 'Hüpfburg', shortDesc: 'Hüpfburg Drachen & Schloss mit integrierter Rutsche für Kindergeburtstage.' },
        { id: '4', type: 'verleih', title: 'Premium Fotospiegel', img: 'assets/verleih/fotospiegel1.png', price: 89, priceMode: 'fixed', category: 'Fotoecke', shortDesc: 'Interaktiver Magischer Fotospiegel mit Touchscreen und Sofortdruck.' },
        { id: '5', type: 'verleih', title: 'Event Maskottchen 1', img: 'assets/verleih/Maskott1_1.png', price: 45, priceMode: 'fixed', category: 'Maskottchen', shortDesc: 'Hochwertiges Event Maskottchen Kostüm für Kindergeburtstage.' },
        { id: '6', type: 'verleih', title: 'Event Maskottchen 2', img: 'assets/verleih/Maskott2_1.png', price: 45, priceMode: 'fixed', category: 'Maskottchen', shortDesc: 'Hochwertiges Event Maskottchen Kostüm für Feiern.' },
        { id: '7', type: 'verleih', title: 'Event Maskottchen 3', img: 'assets/verleih/Maskott3_1.png', price: 45, priceMode: 'fixed', category: 'Maskottchen', shortDesc: 'Hochwertiges Event Maskottchen Kostüm.' },
        { id: '8', type: 'verleih', title: 'Event Maskottchen 4', img: 'assets/verleih/Maskott4_1.png', price: 45, priceMode: 'fixed', category: 'Maskottchen', shortDesc: 'Hochwertiges Event Maskottchen Kostüm.' },
        { id: '9', type: 'verleih', title: 'Event Maskottchen 5', img: 'assets/verleih/Maskott5_1.png', price: 45, priceMode: 'fixed', category: 'Maskottchen', shortDesc: 'Hochwertiges Event Maskottchen Kostüm.' },
        { id: '10', type: 'verleih', title: 'Event Maskottchen 6', img: 'assets/verleih/Maskott6_1.png', price: 45, priceMode: 'fixed', category: 'Maskottchen', shortDesc: 'Hochwertiges Event Maskottchen Kostüm.' },
        { id: '11', type: 'verleih', title: 'Event Maskottchen 7', img: 'assets/verleih/Maskott7_1.png', price: 45, priceMode: 'fixed', category: 'Maskottchen', shortDesc: 'Hochwertiges Event Maskottchen Kostüm.' },
        { id: '12', type: 'verleih', title: 'Bubble House Dome', img: 'assets/verleih/bubblehouse1.png', price: 130, priceMode: 'fixed', category: 'Attraktionen', shortDesc: 'Transparenter Bubble House Kuppel-Pavillon.' },
        { id: '13', type: 'verleih', title: 'Trampolin Hüpfburg', img: 'assets/verleih/trampolin1.png', price: 90, priceMode: 'fixed', category: 'Hüpfburgen', shortDesc: 'Kompakte Hüpfburg mit Trampolin-Sprungfläche.' },
        { id: '14', type: 'verleih', title: 'Happy Hop Schloss Hüpfburg', img: 'assets/verleih/happyhupfburg1.png', price: 110, priceMode: 'fixed', category: 'Hüpfburgen', shortDesc: 'Bunte Schloss Hüpfburg mit Rutsche.' }
    ];

    allCatalog.push(...staticShop, ...staticVerleih);

    // 3. Custom Products from Firestore
    try {
        const prodSnap = await getDocs(collection(db, 'custom_products'));
        prodSnap.forEach(d => {
            const p = d.data();
            allCatalog.push({
                id: d.id,
                type: p.target || p.type || 'shop',
                title: p.title,
                img: p.img || (p.images && p.images[0]) || 'assets/logo_dark.png',
                price: p.price,
                priceMode: p.priceMode || (p.price == 0 ? 'request' : 'fixed'),
                category: p.category || 'Eigene Artikel',
                shortDesc: p.subtitle || p.shortDesc || '',
                source: 'custom'
            });
        });
    } catch(e) { console.error('Error loading custom products for featured:', e); }

    // 4. Custom Packages from Firestore
    try {
        const pkgSnap = await getDocs(collection(db, 'custom_packages'));
        pkgSnap.forEach(d => {
            const pk = d.data();
            let firstImg = 'assets/logo_dark.png';
            if (pk.items && pk.items.length > 0) {
                const f = pk.items[0];
                firstImg = (f.images && f.images[0]) || f.img || firstImg;
            }
            allCatalog.push({
                id: d.id,
                type: 'shop',
                title: pk.title,
                img: firstImg,
                price: pk.price,
                priceMode: 'fixed',
                category: 'Spezialangebote',
                shortDesc: pk.description || 'Spezialpaket',
                source: 'package'
            });
        });
    } catch(e) { console.error('Error loading custom packages for featured:', e); }

    window.allFeaturedCatalog = allCatalog;

    // Load saved settings or use defaults
    let selectedItems = [
        allCatalog.find(x => x.id === '3' && x.type === 'verleih') || allCatalog[0],
        allCatalog.find(x => x.id === '1' && x.type === 'shop') || allCatalog[1],
        allCatalog.find(x => x.id === '4' && x.type === 'verleih') || allCatalog[2]
    ];

    try {
        const savedSnap = await getDoc(doc(db, 'settings', 'featured_items'));
        if (savedSnap.exists() && savedSnap.data().items && savedSnap.data().items.length > 0) {
            const savedList = savedSnap.data().items;
            selectedItems = [0, 1, 2].map(i => {
                const sv = savedList[i];
                if (!sv) return null;
                const match = allCatalog.find(c => String(c.id) === String(sv.id) && c.type === sv.type);
                return match || sv;
            });
        }
    } catch(e) { console.error('Error loading saved featured items:', e); }

    cachedFeaturedItems = selectedItems;
    window.cachedFeaturedItems = cachedFeaturedItems;

    function getManagerHtml() {
        return `
            <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                    <div>
                        <h3 class="text-xl font-serif text-gray-900 flex items-center gap-2">
                            <span>⭐</span> 3 Startseiten-Highlights auswählen
                        </h3>
                        <p class="text-xs text-gray-500 mt-1">Wählen Sie für Slot 1, 2 und 3 jeweils einen beliebigen Artikel aus dem gesamten Katalog oder leeren Sie den Slot.</p>
                    </div>
                    <button type="button" class="save-featured-btn bg-gold hover:bg-yellow-600 text-white font-semibold text-sm px-6 py-2.5 rounded-lg shadow-sm transition-all flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        Highlights speichern
                    </button>
                </div>
                <div class="featured-slots-grid grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${[0, 1, 2].map(slotIdx => {
                        const current = selectedItems[slotIdx];
                        const isVerleih = current && current.type === 'verleih';
                        const priceDisplay = current
                            ? ((current.priceMode === 'request' || String(current.price) === '0' || current.price === 'Auf Anfrage') ? 'Auf Anfrage' : `${current.priceMode === 'from' ? 'ab ' : ''}${current.price} €`)
                            : '-';

                        return `
                            <div class="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-xs font-bold uppercase tracking-wider text-gold">Highlight Slot ${slotIdx + 1}</span>
                                        ${current ? `<span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded ${isVerleih ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}">${current.type === 'verleih' ? 'Verleih' : (current.source === 'package' ? 'Paket' : 'Shop')}</span>` : '<span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-600">Leer</span>'}
                                    </div>
                                    <select data-slot="${slotIdx}" class="featured-slot-select w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium bg-white focus:border-gold focus:outline-none mb-3">
                                        <option value="">-- Kein Highlight (Slot leeren) --</option>
                                        ${allCatalog.map(item => {
                                            const isSel = current && String(item.id) === String(current.id) && item.type === current.type;
                                            const tag = item.source === 'package' ? '[Paket]' : (item.type === 'verleih' ? '[Verleih]' : '[Shop]');
                                            return `<option value="${item.type}:${item.id}" ${isSel ? 'selected' : ''}>${tag} ${esc(item.title)} (${item.price || 'Auf Anfrage'} €)</option>`;
                                        }).join('')}
                                    </select>
                                    
                                    ${current ? `
                                        <div class="bg-white rounded-lg p-3 border border-gray-200 flex items-center gap-3 relative group">
                                            <img src="${esc(current.img || 'assets/logo_dark.png')}" class="w-14 h-14 object-contain rounded bg-gray-50 border p-1 shrink-0" onerror="this.src='assets/logo_dark.png'">
                                            <div class="flex-1 min-w-0">
                                                <h4 class="text-xs font-bold text-gray-900 truncate">${esc(current.title)}</h4>
                                                <p class="text-[11px] text-gray-500 truncate">${esc(current.category || '')}</p>
                                                <p class="text-xs font-bold text-gold mt-1">${priceDisplay}</p>
                                            </div>
                                            <button type="button" data-clear-slot="${slotIdx}" class="clear-slot-btn text-xs text-red-500 hover:text-red-700 font-bold p-1 bg-red-50 hover:bg-red-100 rounded ml-1" title="Diesen Slot leeren">
                                                ✕
                                            </button>
                                        </div>
                                    ` : `
                                        <div class="bg-white rounded-lg p-4 border border-dashed border-gray-300 text-center text-xs text-gray-400">
                                            Kein Produkt ausgewählt.
                                        </div>
                                    `}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
                <p class="featured-status-msg mt-4 text-xs font-semibold"></p>
            </div>
        `;
    }

    function renderAllManagers() {
        const container = document.getElementById('featured-admin-standalone-container');
        if (container) {
            container.innerHTML = getManagerHtml();
        }

        // Attach listeners
        document.querySelectorAll('.featured-slot-select').forEach(sel => {
            sel.onchange = () => {
                const slotIdx = Number(sel.dataset.slot);
                if (!sel.value) {
                    selectedItems[slotIdx] = null;
                } else {
                    const [selType, selId] = sel.value.split(':');
                    const found = allCatalog.find(c => c.type === selType && String(c.id) === String(selId));
                    selectedItems[slotIdx] = found || null;
                }
                cachedFeaturedItems = selectedItems;
                window.cachedFeaturedItems = cachedFeaturedItems;
                renderAllManagers();
            };
        });

        document.querySelectorAll('.clear-slot-btn').forEach(btn => {
            btn.onclick = () => {
                const slotIdx = Number(btn.dataset.clearSlot);
                selectedItems[slotIdx] = null;
                cachedFeaturedItems = selectedItems;
                window.cachedFeaturedItems = cachedFeaturedItems;
                renderAllManagers();
            };
        });

        document.querySelectorAll('.save-featured-btn').forEach(btn => {
            btn.onclick = async () => {
                document.querySelectorAll('.featured-status-msg').forEach(msg => {
                    msg.className = 'featured-status-msg mt-4 text-xs font-semibold text-blue-600';
                    msg.textContent = 'Speichere Startseiten-Highlights...';
                });
                try {
                    const cleanPayload = selectedItems.filter(Boolean).map(item => ({
                        id: String(item.id),
                        type: item.type,
                        title: item.title,
                        img: item.img || 'assets/logo_dark.png',
                        price: item.price,
                        priceMode: item.priceMode || 'fixed',
                        category: item.category || '',
                        shortDesc: item.shortDesc || '',
                        source: item.source || (item.type === 'verleih' ? 'verleih' : 'shop')
                    }));

                    await setDoc(doc(db, 'settings', 'featured_items'), {
                        items: cleanPayload,
                        updatedAt: serverTimestamp(),
                        updatedBy: auth.currentUser ? auth.currentUser.uid : 'admin'
                    });

                    document.querySelectorAll('.featured-status-msg').forEach(msg => {
                        msg.className = 'featured-status-msg mt-4 text-xs font-semibold text-green-600';
                        msg.textContent = '✅ Highlights erfolgreich gespeichert! Die Startseite zeigt nun die neuen Artikel an.';
                        setTimeout(() => { msg.textContent = ''; }, 4000);
                    });
                } catch (err) {
                    console.error('Error saving featured items:', err);
                    document.querySelectorAll('.featured-status-msg').forEach(msg => {
                        msg.className = 'featured-status-msg mt-4 text-xs font-semibold text-red-600';
                        msg.textContent = 'Fehler beim Speichern: ' + err.message;
                    });
                }
            };
        });
    }

    renderAllManagers();
    window.renderFeaturedManagers = renderAllManagers;
}

window.setupFeaturedItemsManager = setupFeaturedItemsManager;

// Helper to check if an item is currently featured (0, 1, 2 or -1)
window.getFeaturedSlotForItem = function(type, id) {
    if (!window.cachedFeaturedItems || !Array.isArray(window.cachedFeaturedItems)) return -1;
    return window.cachedFeaturedItems.findIndex(it => it && String(it.id) === String(id) && it.type === type);
};

window.setFeaturedSlotFromModal = async function(slotIdx, item) {
    let list = window.cachedFeaturedItems || [null, null, null];
    while (list.length < 3) list.push(null);
    
    // If setting to empty, remove from any existing slot
    if (slotIdx === '' || slotIdx === null || slotIdx === undefined) {
        list = list.map(it => (it && String(it.id) === String(item.id) && it.type === item.type) ? null : it);
    } else {
        const idx = Number(slotIdx);
        // Remove from other slot first if already present
        list = list.map((it, i) => (i !== idx && it && String(it.id) === String(item.id) && it.type === item.type) ? null : it);
        list[idx] = item;
    }
    
    window.cachedFeaturedItems = list;
    if (window.renderFeaturedManagers) window.renderFeaturedManagers();

    try {
        const cleanPayload = list.filter(Boolean).map(it => ({
            id: String(it.id),
            type: it.type,
            title: it.title,
            img: it.img || 'assets/logo_dark.png',
            price: it.price,
            priceMode: it.priceMode || 'fixed',
            category: it.category || '',
            shortDesc: it.shortDesc || '',
            source: it.source || (it.type === 'verleih' ? 'verleih' : 'shop')
        }));
        await setDoc(doc(db, 'settings', 'featured_items'), {
            items: cleanPayload,
            updatedAt: serverTimestamp(),
            updatedBy: auth.currentUser ? auth.currentUser.uid : 'admin'
        });
    } catch(e) { console.error('Error auto-syncing featured items:', e); }
};
