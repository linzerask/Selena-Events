// Initialize Firebase Compat
const firebaseConfig = {
  apiKey: "AIzaSyAw_TmBCgvAwFPZkJ8RQ7_jSFB62KgQVqc",
  authDomain: "selena-events-dashboard.firebaseapp.com",
  projectId: "selena-events-dashboard",
  storageBucket: "selena-events-dashboard.firebasestorage.app",
  messagingSenderId: "535842804912",
  appId: "1:535842804912:web:7464adf97bcdf456131775"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

// Extract slug from URL to uniquely identify the post
const currentPath = window.location.pathname;
let slug = currentPath.split('/').pop() || 'index.html';
if(slug === '') slug = 'index.html';
slug = slug.replace('.html', '');

const postRef = db.collection('blog_posts').doc(slug);
const commentsRef = postRef.collection('comments');

// DOM Elements
const likeBtn = document.getElementById('like-btn');
const likeCountSpan = document.getElementById('like-count');
const commentsContainer = document.getElementById('comments-list');
const commentForm = document.getElementById('comment-form');
const commentsCountHeader = document.getElementById('comments-count-header');

// 1. Initialize Post in DB if not exists
async function initPost() {
    try {
        const docSnap = await postRef.get();
        if (!docSnap.exists) {
            await postRef.set({ likes: 0 });
        }
    } catch (e) {
        console.error("Firebase permission error on init. Make sure Firestore rules are updated!", e);
    }
}
initPost();

// 2. Real-time Likes
try {
    // Instantly load from cache to avoid delay
    const cachedLikes = localStorage.getItem(`cached_likes_${slug}`);
    if (cachedLikes && likeCountSpan) {
        likeCountSpan.innerText = `Gefällt mir (${cachedLikes})`;
    }

    postRef.onSnapshot((doc) => {
        if (doc.exists) {
            const data = doc.data();
            if(likeCountSpan) {
                likeCountSpan.innerText = `Gefällt mir (${data.likes || 0})`;
                localStorage.setItem(`cached_likes_${slug}`, data.likes || 0);
            }
        }
    }, (error) => {
        console.error("Firebase likes error.", error);
    });
} catch (e) {}

if(likeBtn) {
    if(localStorage.getItem(`liked_${slug}`)) {
        likeBtn.classList.add('text-red-500');
        const svg = likeBtn.querySelector('svg');
        if(svg) svg.classList.add('fill-current', 'text-red-500');
    }

    likeBtn.addEventListener('click', async () => {
        const isLiked = localStorage.getItem(`liked_${slug}`);
        
        try {
            if (isLiked) {
                // Unlike
                await postRef.update({
                    likes: firebase.firestore.FieldValue.increment(-1)
                });
                localStorage.removeItem(`liked_${slug}`);
                likeBtn.classList.remove('text-red-500');
                const svg = likeBtn.querySelector('svg');
                if(svg) svg.classList.remove('fill-current', 'text-red-500');
                
                // Optimistic UI update
                let current = parseInt(localStorage.getItem(`cached_likes_${slug}`) || "0");
                if(current > 0) current--;
                if(likeCountSpan) likeCountSpan.innerText = `Gefällt mir (${current})`;
                localStorage.setItem(`cached_likes_${slug}`, current);
            } else {
                // Like
                await postRef.update({
                    likes: firebase.firestore.FieldValue.increment(1)
                });
                localStorage.setItem(`liked_${slug}`, 'true');
                likeBtn.classList.add('text-red-500');
                const svg = likeBtn.querySelector('svg');
                if(svg) svg.classList.add('fill-current', 'text-red-500');
                
                // Optimistic UI update
                let current = parseInt(localStorage.getItem(`cached_likes_${slug}`) || "0");
                current++;
                if(likeCountSpan) likeCountSpan.innerText = `Gefällt mir (${current})`;
                localStorage.setItem(`cached_likes_${slug}`, current);
            }
        } catch (e) {
            console.error("Failed to toggle like:", e);
            alert("Fehler beim Speichern des Likes. Sind die Firebase Regeln aktualisiert?");
        }
    });
}

// 3. Real-time Comments
const mockCommentsData = {
    'blog-5-tipps-fr-die-perfekte-hochzeitsplanung': [
        { name: "Laura & Tim", text: "Die Tipps zur Budgetplanung haben uns echt gerettet! Danke Selena Events." },
        { name: "Marie", text: "Punkt 3 ist so wahr. Wir hätten fast den gleichen Fehler bei der Gästeliste gemacht." }
    ],
    'blog-9-schritte-zur-planung-einer-unvergesslichen-gebur': [
        { name: "Sandra", text: "Tolle Schritt-für-Schritt Anleitung! Mein 30. Geburtstag wird legendär!" },
        { name: "Kevin", text: "Das mit der Mottowahl hat super funktioniert. Die Party war ein voller Erfolg." },
        { name: "Elena", text: "Sehr inspirierend, besonders die Deko-Ideen!" }
    ],
    'blog-danke-fr-ein-wundervolles-jahr-2026': [
        { name: "Anna Schmidt", text: "Vielen Dank für die tollen Einblicke! Hat uns sehr inspiriert." },
        { name: "Julia & Tom", text: "Wir freuen uns schon so sehr auf unsere eigene Feier! Die Bilder sind einfach traumhaft." },
        { name: "Michael Weber", text: "Wahnsinn, die Deko ist wirklich außergewöhnlich. Tolle Arbeit vom ganzen Team!" }
    ],
    'blog-die-wahl-der-richtigen-location-fr-ihr-firmenevent': [
        { name: "Thomas Krüger", text: "Die Location ist wirklich das A und O für das Teambuilding. Sehr gut zusammengefasst." },
        { name: "Sarah M.", text: "Wir suchen gerade für unser Sommerfest. Das hilft sehr bei der Entscheidung!" }
    ],
    'blog-die-wichtigsten-deko-trends-fr-luxus-events-2026': [
        { name: "Isabella", text: "Ich liebe die neuen Farbkonzepte! Besonders das viele Gold." },
        { name: "Sophie", text: "Die Blumenarrangements auf euren Bildern sind ein Traum." },
        { name: "Felix", text: "Minimalistisch aber extrem edel. Tolle Trends für dieses Jahr." }
    ],
    'blog-warum-eine-fotobox-auf-keinem-event-fehlen-darf': [
        { name: "Maximilian", text: "Die Fotobox auf unserer Hochzeit war das absolute Highlight für die Gäste!" },
        { name: "Lara", text: "Stimmt absolut, die witzigsten Erinnerungen entstehen dort." }
    ],
    'default': [
        { name: "Besucher", text: "Ein toller und sehr informativer Beitrag. Danke fürs Teilen!" }
    ]
};

async function seedMockComments() {
    try {
        const snap = await commentsRef.get();
        if (snap.empty) {
            const commentsToSeed = mockCommentsData[slug] || mockCommentsData['default'];
            for(let i = 0; i < commentsToSeed.length; i++) {
                await commentsRef.add({
                    name: commentsToSeed[i].name,
                    text: commentsToSeed[i].text,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    status: 'approved'
                });
            }
        }
    } catch(e) {
        console.error("Firebase error checking comments:", e);
    }
}
seedMockComments();

try {
    // Instantly load from cache to avoid delay
    const cachedCommentsHtml = localStorage.getItem(`cached_comments_${slug}`);
    const cachedCommentsCount = localStorage.getItem(`cached_comments_count_${slug}`);
    if (cachedCommentsHtml && commentsContainer) {
        commentsContainer.innerHTML = cachedCommentsHtml;
    }
    if (cachedCommentsCount && commentsCountHeader) {
        commentsCountHeader.innerText = `Kommentare (${cachedCommentsCount})`;
    }

    const q = commentsRef.where('status', '==', 'approved');
    q.onSnapshot((snapshot) => {
        if(commentsContainer) {
            let docs = [];
            snapshot.forEach(doc => docs.push(doc.data()));
            
            // Sort by createdAt ascending in JavaScript
            docs.sort((a, b) => {
                const timeA = a.createdAt ? a.createdAt.toMillis() : 0;
                const timeB = b.createdAt ? b.createdAt.toMillis() : 0;
                return timeA - timeB;
            });

            let tempHtml = '';
            let count = docs.length;
            
            docs.forEach((data) => {
                let dateStr = 'Gerade eben';
                if(data.createdAt) {
                    const date = data.createdAt.toDate();
                    dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                }

                const initial = data.name ? data.name.charAt(0).toUpperCase() : 'A';

                const commentHtml = `
                    <div class="flex gap-4 mb-6 pb-6 border-b border-gray-50">
                        <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-serif text-xl flex-shrink-0">${initial}</div>
                        <div>
                            <div class="flex items-baseline gap-2 mb-1">
                                <h4 class="font-semibold text-gray-800">${data.name}</h4>
                                <span class="text-xs text-gray-400">${dateStr}</span>
                            </div>
                            <p class="text-gray-600 text-sm">${data.text}</p>
                        </div>
                    </div>
                `;
                tempHtml += commentHtml;
            });
            
            commentsContainer.innerHTML = tempHtml;
            localStorage.setItem(`cached_comments_${slug}`, tempHtml);
            localStorage.setItem(`cached_comments_count_${slug}`, count);
            
            if(commentsCountHeader) {
                commentsCountHeader.innerText = `Kommentare (${count})`;
            }
        }
    }, (error) => {
        if(commentsContainer && !cachedCommentsHtml) {
            commentsContainer.innerHTML = '<div class="text-red-500 text-sm mb-8">Fehler: Bitte Firebase Rules in der Firebase Console aktualisieren. (allow read, write: if true)</div>';
        }
    });
} catch (e) {}

function showBlogModal(title, msg, isError = false) {
    let modal = document.getElementById('blog-custom-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'blog-custom-modal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center hidden';
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black opacity-50 transition-opacity" onclick="document.getElementById('blog-custom-modal').classList.add('hidden')"></div>
            <div class="bg-white p-8 max-w-sm w-full z-10 rounded-lg shadow-2xl transform transition-transform duration-300 mx-4 relative text-center">
                <svg id="blog-modal-icon-success" class="mx-auto mb-4 w-12 h-12 text-green-500 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <svg id="blog-modal-icon-error" class="mx-auto mb-4 w-12 h-12 text-red-500 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h3 id="blog-modal-title" class="text-xl font-serif mb-2 text-gray-900"></h3>
                <p id="blog-modal-msg" class="text-gray-500 mb-6"></p>
                <button onclick="document.getElementById('blog-custom-modal').classList.add('hidden')" class="w-full bg-gold text-white font-serif tracking-widest uppercase py-3 hover:bg-black transition-colors rounded">
                    Schließen
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('blog-modal-title').textContent = title;
    document.getElementById('blog-modal-msg').textContent = msg;
    
    if (isError) {
        document.getElementById('blog-modal-icon-success').classList.add('hidden');
        document.getElementById('blog-modal-icon-error').classList.remove('hidden');
    } else {
        document.getElementById('blog-modal-icon-error').classList.add('hidden');
        document.getElementById('blog-modal-icon-success').classList.remove('hidden');
    }
    
    modal.classList.remove('hidden');
}

// 4. Handle Comment Submit
if(commentForm) {
    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('comment-name');
        const textInput = document.getElementById('comment-text');
        const submitBtn = document.getElementById('comment-submit');
        
        const name = nameInput.value.trim();
        const text = textInput.value.trim();
        
        if(!name || !text) return;
        
        submitBtn.disabled = true;
        submitBtn.innerText = 'Wird gesendet...';
        
        try {
            await commentsRef.add({
                name: name,
                text: text,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                status: 'pending'
            });
            
            nameInput.value = '';
            textInput.value = '';
            showBlogModal('Erfolg!', 'Vielen Dank! Ihr Kommentar wird nach kurzer Prüfung freigeschaltet.', false);
        } catch(error) {
            console.error("Error adding comment: ", error);
            showBlogModal('Fehler', 'Fehler beim Senden. Bitte versuchen Sie es erneut.', true);
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = 'Kommentar senden';
        }
    });
}

// 5. Lightbox Modal
const lightboxModal = document.getElementById('lightbox-modal');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev = document.getElementById('lightbox-prev');
const lightboxNext = document.getElementById('lightbox-next');
const galleryImages = Array.from(document.querySelectorAll('.gallery-img'));
let currentImageIndex = 0;

if (lightboxModal && galleryImages.length > 0) {
    function openLightbox(index) {
        currentImageIndex = index;
        lightboxImg.src = galleryImages[index].src;
        lightboxModal.classList.remove('hidden');
        lightboxModal.classList.add('flex');
        
        // Trigger reflow to ensure CSS transition works
        void lightboxModal.offsetWidth;
        
        lightboxModal.classList.remove('opacity-0');
        lightboxImg.classList.remove('scale-95');
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }

    function closeLightbox() {
        lightboxModal.classList.add('opacity-0');
        lightboxImg.classList.add('scale-95');
        setTimeout(() => {
            lightboxModal.classList.add('hidden');
            lightboxModal.classList.remove('flex');
            document.body.style.overflow = '';
        }, 300);
    }

    function prevImage(e) {
        if(e) e.stopPropagation();
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        lightboxImg.src = galleryImages[currentImageIndex].src;
    }

    function nextImage(e) {
        if(e) e.stopPropagation();
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        lightboxImg.src = galleryImages[currentImageIndex].src;
    }

    // Attach click events to all gallery thumbnails
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', (e) => {
            e.preventDefault();
            openLightbox(index);
        });
    });

    if(lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if(lightboxPrev) lightboxPrev.addEventListener('click', prevImage);
    if(lightboxNext) lightboxNext.addEventListener('click', nextImage);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightboxModal.classList.contains('hidden')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        }
    });

    // Close on background click
    lightboxModal.addEventListener('click', (e) => {
        if (e.target === lightboxModal || e.target.tagName.toLowerCase() !== 'img') {
            if(e.target.closest('button')) return; // Ignore button clicks
            closeLightbox();
        }
    });
}
