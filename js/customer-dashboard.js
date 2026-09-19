import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayRemove, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    
    // Auth State Observer
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // Not logged in -> redirect
            window.location.href = 'login.html';
            return;
        }

        // Fetch User Data from Firestore
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            let userData = {};
            if (userDoc.exists()) {
                userData = userDoc.data();
            }

            const name = userData.name || user.displayName || 'Kunde';
            
            // Populate UI
            document.getElementById('user-name').textContent = name;
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('user-initials').textContent = name.charAt(0).toUpperCase();
            
            document.getElementById('user-phone').textContent = userData.phone || '-';
            document.getElementById('user-address').textContent = userData.address || '-';
            document.getElementById('user-birthdate').textContent = userData.birthdate || '-';

            // Referral Link
            if (userData.myReferralCode) {
                const refUrl = `${window.location.origin}/register.html?ref=${userData.myReferralCode}`;
                document.getElementById('referral-link').value = refUrl;
            } else {
                document.getElementById('referral-link').value = "Kein Code generiert";
            }

            // Loyalty Points & Tier
            const points = userData.loyaltyPoints || 0;
            document.getElementById('loyalty-points').textContent = points;
            
            let tier = 'Member';
            if (points >= 1000) tier = 'Gold';
            else if (points >= 500) tier = 'Silver';
            else if (points >= 100) tier = 'Bronze';
            
            document.getElementById('loyalty-tier').textContent = tier;

            // Fetch Orders (matching user email to catch guest orders too)
            fetchOrders(user.uid);

            // Wishlist
            if (userData.wishlist) {
                document.getElementById('stat-wishlist').textContent = userData.wishlist.length;
                renderWishlist(userData.wishlist);
            } else {
                document.getElementById('stat-wishlist').textContent = '0';
                renderWishlist([]);
            }

        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    });

    // Copy Referral
    document.getElementById('copy-btn').addEventListener('click', () => {
        const input = document.getElementById('referral-link');
        input.select();
        document.execCommand('copy');
        
        const btn = document.getElementById('copy-btn');
        btn.textContent = 'Kopiert!';
        setTimeout(() => btn.textContent = 'Kopieren', 2000);
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'index.html';
        });
    });
});

async function fetchOrders(uid) {
    const container = document.getElementById('orders-container');
    try {
        const q = query(collection(db, "orders"), where("customerUid", "==", uid));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = '<p class="text-sm text-gray-500">Keine Bestellungen gefunden.</p>';
            return;
        }

        let html = '';
        const orders = [];
        querySnapshot.forEach((doc) => {
            orders.push({id: doc.id, ...doc.data()});
        });

        // Sort desc by createdAt
        orders.sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB - dateA;
        });

        orders.forEach(order => {
            const dateStr = order.createdAt?.toDate 
                ? order.createdAt.toDate().toLocaleDateString('de-DE') 
                : new Date(order.createdAt).toLocaleDateString('de-DE');
            
            const total = order.total || order.totalPrice || 0;
            const itemsCount = order.items ? order.items.length : 0;
            
            html += `
                <div class="border border-gray-100 p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-mono bg-gray-100 px-2 py-1">#${order.id.substring(0,8)}</span>
                            <span class="text-xs text-gray-500">${dateStr}</span>
                        </div>
                        <p class="text-sm font-medium">${itemsCount} Artikel (${order.type === 'verleih' ? 'Verleih' : 'Kauf'})</p>
                    </div>
                    <div class="text-right flex-shrink-0 flex items-center justify-between md:flex-col gap-2">
                        <span class="text-xs px-2 py-1 rounded-full ${order.status === 'Neu' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}">${order.status || 'Bearbeitung'}</span>
                        <p class="font-medium text-gold">${total.toFixed(2)} €</p>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;

    } catch (error) {
        console.error("Error fetching orders:", error);
        container.innerHTML = '<p class="text-sm text-red-500">Fehler beim Laden der Bestellungen.</p>';
    }
}

function renderWishlist(wishlist) {
    const container = document.getElementById('wishlist-container');
    if (!container) return;

    if (!wishlist || wishlist.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">Ihre Wunschliste ist leer.</div>';
        return;
    }

    let html = '';
    wishlist.forEach(p => {
        // Ensure id is passed correctly to onclick
        html += `
            <div class="bg-white shadow-sm hover:shadow-md transition-shadow group flex flex-col fade-in overflow-hidden rounded-xl border border-gray-100">
                <div class="overflow-hidden relative aspect-square bg-gray-50 flex items-center justify-center p-4">
                    <img src="${p.img}" alt="${p.title}" class="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500">
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <h3 class="text-lg mb-2 font-semibold text-gray-900 group-hover:text-gold transition-colors">${p.title}</h3>
                    <div class="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                        <span class="text-gold font-serif text-xl font-medium">${p.price} €</span>
                        <div class="flex space-x-3 items-center">
                            <button onclick="removeFromWishlist('${p.id}')" class="text-red-500 hover:text-red-700 transition-colors bg-red-50 p-2 rounded-full" title="Entfernen">
                                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

window.removeFromWishlist = async function(id) {
    if (!auth.currentUser) return;
    
    try {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.wishlist) {
                const product = userData.wishlist.find(p => p.id == id);
                if (product) {
                    await updateDoc(userRef, {
                        wishlist: arrayRemove(product)
                    });
                    
                    // Update UI directly
                    const newWishlist = userData.wishlist.filter(p => p.id != id);
                    document.getElementById('stat-wishlist').textContent = newWishlist.length;
                    renderWishlist(newWishlist);
                }
            }
        }
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        alert("Fehler beim Entfernen aus der Wunschliste.");
    }
};
