function esc(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
window.esc = esc;
window.handlePriceModeChange = function() {
    const modeEl = document.getElementById('prod-price-mode');
    const priceEl = document.getElementById('prod-price');
    const hintEl = document.getElementById('prod-price-hint');
    if (!modeEl || !priceEl) return;
    
    if (modeEl.value === 'request') {
        priceEl.value = '0';
        priceEl.disabled = true;
        priceEl.required = false;
        priceEl.classList.add('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        if (hintEl) hintEl.classList.remove('hidden');
    } else {
        priceEl.disabled = false;
        priceEl.required = true;
        priceEl.classList.remove('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        if (hintEl) hintEl.classList.add('hidden');
        if (priceEl.value === '0') priceEl.value = '';
    }
};
document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Tab Switching
    const navBtns = document.querySelectorAll('.nav-btn');
    const contentSections = document.querySelectorAll('.content-section');

    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-target');
            if(window.currentUserId) {
                const keys = ['messages', 'shop', 'verleih', 'calendar', 'comments', 'chat', 'packages', 'products'];
                if(keys.includes(target)) {
                    localStorage.setItem('lastRead_' + target + '_' + window.currentUserId, Date.now().toString());
                    const badge = document.getElementById('sidebar-notif-' + target);
                    if(badge) badge.classList.add('hidden');
                }
                if(window.updateNotificationBadges) window.updateNotificationBadges();
            }

            e.preventDefault();
            
            const targetId = btn.getAttribute('data-target');
            if (!targetId) return;

            // Update active button state
            navBtns.forEach(b => {
                b.classList.remove('bg-gold', 'text-white');
                b.classList.add('text-gray-300', 'hover:bg-gray-800', 'hover:text-gold');
            });
            btn.classList.remove('text-gray-300', 'hover:bg-gray-800', 'hover:text-gold');
            btn.classList.add('bg-gold', 'text-white');

            // Show corresponding section
            contentSections.forEach(section => {
                if (section.id === 'section-' + targetId) {
                    section.classList.remove('hidden');
                    if (targetId === 'featured-admin' && window.setupFeaturedItemsManager) {
                        window.setupFeaturedItemsManager();
                    } else if (targetId === 'messages' && window.renderFilteredMessages) {
                        window.renderFilteredMessages();
                    } else if ((targetId === 'shop' || targetId === 'verleih') && window.renderFilteredOrders) {
                        window.renderFilteredOrders(targetId);
                    } else if (targetId === 'chat') {
                        setTimeout(() => {
                            const mc = document.getElementById('chat-messages');
                            if (mc) mc.scrollTop = mc.scrollHeight;
                        }, 80);
                    }
                } else {
                    section.classList.add('hidden');
                }
            });
            
            // Close mobile menu if open
            if (window.innerWidth < 768) {
                closeMobileSidebar();
            }
        });
    });

    // 2. Mobile Sidebar Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const mobileOverlay = document.getElementById('mobile-overlay');

    function openMobileSidebar() {
        sidebar.classList.remove('-translate-x-full');
        mobileOverlay.classList.remove('hidden');
    }

    function closeMobileSidebar() {
        sidebar.classList.add('-translate-x-full');
        mobileOverlay.classList.add('hidden');
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMobileSidebar);
    }
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileSidebar);
    }

    // 3. Stat Cards Click Listeners
    const statShop = document.getElementById('stat-card-shop');
    if (statShop) {
        statShop.addEventListener('click', () => {
            const btn = document.querySelector('.nav-btn[data-target="shop"]');
            if (btn) btn.click();
        });
    }

    const statVerleih = document.getElementById('stat-card-verleih');
    if (statVerleih) {
        statVerleih.addEventListener('click', () => {
            const btn = document.querySelector('.nav-btn[data-target="verleih"]');
            if (btn) btn.click();
        });
    }

    const statUmsatz = document.getElementById('stat-card-umsatz');
    if (statUmsatz) {
        statUmsatz.addEventListener('click', () => {
            const modal = document.getElementById('umsatz-historie-modal');
            if (modal) {
                modal.classList.remove('hidden');
                setTimeout(() => modal.classList.remove('opacity-0'), 10);
                
                const defaultFilterBtn = document.querySelector('.umsatz-filter-btn[data-filter="this_month"]');
                if (defaultFilterBtn) defaultFilterBtn.click();
            }
        });
    }

    const closeUmsatzModal = document.getElementById('close-umsatz-modal');
    if (closeUmsatzModal) {
        closeUmsatzModal.addEventListener('click', () => {
            const modal = document.getElementById('umsatz-historie-modal');
            if (modal) {
                modal.classList.add('opacity-0');
                setTimeout(() => modal.classList.add('hidden'), 300);
            }
        });
    }

    const filterBtns = document.querySelectorAll('.umsatz-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => {
                b.classList.remove('bg-gold', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-700');
            });
            btn.classList.remove('bg-gray-100', 'text-gray-700');
            btn.classList.add('bg-gold', 'text-white');

            const filter = btn.getAttribute('data-filter');
            const titleEl = document.getElementById('umsatz-modal-title');
            const amountEl = document.getElementById('umsatz-modal-amount');
            
            const now = new Date();
            let startDate = new Date(0);
            let endDate = new Date();
            let titleText = "Gesamter Zeitraum";

            if (filter === 'this_month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                titleText = "Umsatz diesen Monat";
            } else if (filter === 'last_month') {
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
                titleText = "Umsatz letzter Monat";
            } else if (filter === 'last_3_months') {
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
                titleText = "Umsatz letzte 3 Monate";
            } else if (filter === 'this_year') {
                startDate = new Date(now.getFullYear(), 0, 1);
                titleText = "Umsatz dieses Jahr";
            }

            let rev = 0;
            if (window.allOrders) {
                window.allOrders.forEach(order => {
                    if (order.status === 'Erstattet' || order.isRefunded === true) return;
                    if (!order.createdAt || typeof order.createdAt.toDate !== 'function') return;
                    const d = order.createdAt.toDate();
                    if (d >= startDate && d <= endDate) {
                        rev += (order.totalPrice || 0);
                    }
                });
            }

            if (titleEl) titleEl.textContent = titleText;
            if (amountEl) amountEl.textContent = rev.toFixed(2).replace('.', ',') + ' €';
        });
    });
});


// === ROLE & DATA LOGIC ===
document.addEventListener('userRoleLoaded', (e) => {
    const { role, user } = e.detail;
    
    // Enforce UI
    const avatarBtn = document.getElementById('avatar-btn');
    if (avatarBtn) avatarBtn.innerText = role.charAt(0).toUpperCase();

    const dropEmail = document.getElementById('dropdown-email');
    if (dropEmail) dropEmail.innerText = user.email || 'Gast';

    const dropRole = document.getElementById('dropdown-role');
    if (dropRole) dropRole.innerText = role;
    
    document.querySelectorAll('.nav-btn[data-allowed-roles]').forEach(btn => {
        const allowedRoles = btn.getAttribute('data-allowed-roles').split(',');
        if (!allowedRoles.includes(role)) {
            btn.style.display = 'none';
        } else {
            btn.style.display = 'flex';
        }
    });

    const statsContainer = document.getElementById('stats-container');
    if (statsContainer && role !== 'owner') {
        statsContainer.style.display = 'none'; // Only Owner sees stats
    }

    if (role === 'owner' || role === 'dev') {
        const btnAddEvent = document.getElementById('btn-add-event');
        if (btnAddEvent) {
            btnAddEvent.classList.remove('hidden');
            btnAddEvent.style.setProperty('display', 'flex', 'important');
        }
        loadOrdersAndStats(role);
        fetchMessagesCount();
        fetchCommentsCount();
    } else {
        loadVerleihForCalendarOnly();
    }
    fetchChatsCount();

    initChat(role, user);

    if (role === 'owner') {
        initMembersManagement();
    }
});

window.newOrdersCount = 0;
window.unreadMessagesCount = 0;

window.markOrderAsRead = function(orderId, currentStatus) {
    if ((!currentStatus || currentStatus === 'Neu' || currentStatus === 'Bezahlt') && window.db && window.firebaseSetDoc && window.firebaseDoc && (window.currentUserRole === 'owner' || window.currentUserRole === 'dev')) {
        window.firebaseSetDoc(window.firebaseDoc(window.db, "orders", orderId), { status: 'Angesehen' }, { merge: true })
            .catch(err => console.error("Fehler beim Status-Update:", err));
    }
};

window.markAllAsRead = async function(type) {
    if (!window.db || !window.firebaseDoc || !window.firebaseSetDoc) return;
    try {
        if (window.allOrders) {
            for (const data of window.allOrders) {
                if (data.type === type && (!data.status || data.status === 'Neu')) {
                    await window.firebaseSetDoc(window.firebaseDoc(window.db, "orders", data._id), { status: 'Angesehen' }, { merge: true });
                }
            }
        }
    } catch (err) {
        console.error("Fehler bei markAllAsRead:", err);
    }
};


window.markMessageAsRead = function(msgId, currentStatus) {
    if ((!currentStatus || currentStatus === 'Neu' || currentStatus === 'Bezahlt') && window.db && window.firebaseSetDoc && window.firebaseDoc && (window.currentUserRole === 'owner' || window.currentUserRole === 'dev')) {
        window.firebaseSetDoc(window.firebaseDoc(window.db, "messages", msgId), { status: 'Angesehen' }, { merge: true })
            .catch(err => console.error("Fehler beim Status-Update:", err));
    }
};

window.markAllMessagesAsRead = async function() {
    if (!window.db || !window.firebaseDoc || !window.firebaseSetDoc) return;
    try {
        if (window.allMessages) {
            for (const data of window.allMessages) {
                if (!data.status || data.status === 'Neu') {
                    await window.firebaseSetDoc(window.firebaseDoc(window.db, "messages", data.id), { status: 'Angesehen' }, { merge: true });
                }
            }
        }
    } catch (err) {
        console.error("Fehler bei markAllMessagesAsRead:", err);
    }
};

window.renderMessagesList = function() {
    const listEl = document.getElementById('messages-list');
    if (!listEl) return;
    
    let html = '';
    if (window.allMessages && window.allMessages.length > 0) {
        window.allMessages.forEach(msg => {
            let dateStr = 'Unbekannt';
            if (msg.createdAt && typeof msg.createdAt.toDate === 'function') {
                const d = msg.createdAt.toDate();
                dateStr = d.toLocaleDateString('de-DE') + ' ' + d.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
            }
            
            const isProductInquiry = msg.type === 'product_inquiry' || !!msg.productTitle;
            const customerName = msg.customerName || msg.name || ((msg.firstName || '') + ' ' + (msg.lastName || '')).trim() || 'Gast';
            const customerEmail = msg.customerEmail || msg.email || 'Nicht angegeben';
            const customerPhone = msg.customerPhone || msg.phone || 'Nicht angegeben';
            const eventDate = msg.eventDate || msg.date || '';
            const eventLocation = msg.eventLocation || msg.address || '';

            const typeBadge = isProductInquiry 
                ? `<span class="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold mr-2 px-2.5 py-0.5 rounded-full uppercase tracking-wider">🛍️ PRODUKT-ANFRAGE</span>`
                : `<span class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">✉️ Nachricht</span>`;

            const statusBadge = msg.status === 'Beantwortet'
                ? `<span class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded ml-2 font-semibold">Beantwortet</span>`
                : msg.status === 'Angesehen' 
                ? `<span class="bg-gray-200 text-gray-800 text-xs px-2 py-0.5 rounded ml-2">Angesehen</span>` 
                : `<span class="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded ml-2 font-semibold">Neu</span>`;
                
            window.openedMessages = window.openedMessages || new Set();
            const isHidden = window.openedMessages.has(msg.id) ? '' : 'hidden';

            let replyHtml = '';
            if (msg.replyText) {
                let replyDateStr = 'Kürzlich';
                if (msg.repliedAt && typeof msg.repliedAt.toDate === 'function') {
                    const rd = msg.repliedAt.toDate();
                    replyDateStr = rd.toLocaleDateString('de-DE') + ' ' + rd.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
                }
                replyHtml = `
                    <div class="mt-3 p-3 bg-blue-50/80 border border-blue-200 rounded-lg text-sm">
                        <div class="flex justify-between items-center mb-1">
                            <strong class="text-xs font-bold text-blue-900 uppercase tracking-wider">Ihre gesendete E-Mail-Antwort:</strong>
                            <span class="text-xs text-blue-600">${replyDateStr}</span>
                        </div>
                        <p class="whitespace-pre-wrap text-xs text-gray-700">${msg.replyText}</p>
                    </div>
                `;
            }

            // Inquiry specific content box
            let productHeaderInfo = '';
            let productDetailsHtml = '';

            if (isProductInquiry) {
                productHeaderInfo = `<div class="text-xs text-amber-800 font-semibold mt-1">Artikel: ${msg.productTitle || 'Auf Anfrage'}${eventDate ? ` · Datum: ${eventDate}` : ''}</div>`;
                
                let imgHtml = '';
                if (msg.productImg) {
                    imgHtml = `<img src="${msg.productImg}" alt="${msg.productTitle || ''}" class="w-16 h-16 object-contain rounded-lg border border-amber-200 bg-white p-1 shadow-sm">`;
                }

                productDetailsHtml = `
                    <div class="p-3 bg-amber-50/60 border border-amber-200 rounded-xl mb-4 flex items-center gap-4">
                        ${imgHtml}
                        <div class="flex-grow">
                            <span class="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">Angefragter Artikel</span>
                            <h4 class="text-base font-bold text-gray-900 mt-1">${msg.productTitle || 'Produkt auf Anfrage'}</h4>
                            ${msg.productId ? `<span class="text-xs text-gray-400">Produkt-ID: ${msg.productId}</span>` : ''}
                        </div>
                    </div>
                `;
            }

            html += `
                <div class="border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white cursor-pointer overflow-hidden mb-3">
                    <div class="p-4 bg-gray-50/60 hover:bg-gray-50 transition-colors" onclick="if(window.openedMessages.has('${msg.id}')){window.openedMessages.delete('${msg.id}')}else{window.openedMessages.add('${msg.id}')}; this.nextElementSibling.classList.toggle('hidden'); if(window.markMessageAsRead) window.markMessageAsRead('${msg.id}', '${msg.status || 'Neu'}');">
                        <div class="flex justify-between items-start mb-1">
                            <div class="flex items-center flex-wrap gap-1">
                                ${typeBadge}
                                <span class="font-bold text-gray-900 text-sm sm:text-base">${customerName}</span>
                                ${statusBadge}
                            </div>
                            <div class="text-xs text-gray-500 whitespace-nowrap ml-2">
                                ${dateStr}
                            </div>
                        </div>
                        ${productHeaderInfo}
                    </div>
                    <div class="${isHidden} p-4 text-sm border-t border-gray-200 bg-white space-y-4">
                        ${productDetailsHtml}
                        
                        <!-- Customer & Event Grid -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200 text-xs sm:text-sm">
                            <div>
                                <span class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Kunde / Ansprechpartner</span>
                                <span class="font-bold text-gray-900">${customerName}</span>
                            </div>
                            <div>
                                <span class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide">E-Mail</span>
                                <a href="mailto:${customerEmail}" class="font-medium text-blue-600 hover:underline">${customerEmail}</a>
                            </div>
                            <div>
                                <span class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Telefon</span>
                                <span class="font-medium text-gray-900">${customerPhone}</span>
                            </div>
                            <div>
                                <span class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Veranstaltungsdatum</span>
                                <span class="font-bold text-amber-700">${eventDate || '<span class="text-gray-400 font-normal">Nicht angegeben</span>'}</span>
                            </div>
                            <div class="sm:col-span-2">
                                <span class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Veranstaltungsort / Adresse</span>
                                <span class="font-medium text-gray-900">${eventLocation || '<span class="text-gray-400 font-normal">Nicht angegeben</span>'}</span>
                            </div>
                        </div>

                        <!-- Message Body -->
                        <div class="bg-gray-50/80 p-4 rounded-xl border border-gray-200">
                            <span class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Nachricht / Kundenwünsche:</span>
                            <p class="whitespace-pre-wrap text-gray-800 text-xs sm:text-sm leading-relaxed">${msg.message || '<span class="text-gray-400 italic">Keine zusätzliche Nachricht angegeben</span>'}</p>
                        </div>

                        ${replyHtml}

                        <div class="pt-3 border-t border-gray-200 flex justify-between items-center">
                            ${(customerEmail && customerEmail !== 'Nicht angegeben') ? `
                                <button type="button" onclick="event.stopPropagation(); window.openReplyModal('${msg.id}')" class="px-4 py-2 bg-gold hover:bg-yellow-600 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                                    <span>Angebot / Antwort per E-Mail senden</span>
                                </button>
                            ` : '<span></span>'}
                            <button type="button" onclick="event.stopPropagation(); window.deleteMessage('${msg.id}')" class="text-red-500 hover:text-red-700 text-xs font-medium transition-colors">
                                Nachricht löschen
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
    } else {
        html = '<p class="text-gray-500 text-center py-8">Keine Nachrichten vorhanden.</p>';
    }
    listEl.innerHTML = html;
};

window.updateNotificationBadges = function() {
    const uid = window.currentUserId;
    const role = window.currentUserRole;
    if(!uid || !role) return;

    let totalUnread = 0;

    function updateBadge(tab, count) {
        const badge = document.getElementById('sidebar-notif-' + tab);
        if(badge) {
            if(count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
                totalUnread += count;
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    let unreadMsgs = 0, unreadShop = 0, unreadVerleih = 0, unreadCalendar = 0, unreadComments = 0, unreadChat = 0;

    if (role === 'owner' || role === 'dev') {
        const lastReadMsgs = parseInt(localStorage.getItem('lastRead_messages_' + uid) || '0');
        if (window.allMessages) {
            window.allMessages.forEach(msg => {
                if (msg.createdAt && typeof msg.createdAt.toMillis === 'function') {
                    if (msg.createdAt.toMillis() > lastReadMsgs) unreadMsgs++;
                }
            });
        }
        updateBadge('messages', unreadMsgs);

        const lastReadComments = parseInt(localStorage.getItem('lastRead_comments_' + uid) || '0');
        if (window.allComments) {
            window.allComments.forEach(c => {
                if (c.createdAt && typeof c.createdAt.toMillis === 'function') {
                    if (c.createdAt.toMillis() > lastReadComments) unreadComments++;
                }
            });
        }
        updateBadge('comments', unreadComments);

        const lastReadShop = parseInt(localStorage.getItem('lastRead_shop_' + uid) || '0');
        const lastReadVerleih = parseInt(localStorage.getItem('lastRead_verleih_' + uid) || '0');
        if (window.allOrders) {
            window.allOrders.forEach(o => {
                if (o.createdAt && typeof o.createdAt.toMillis === 'function') {
                    if (o.type === 'shop' && o.createdAt.toMillis() > lastReadShop) unreadShop++;
                    if (o.type === 'verleih' && o.createdAt.toMillis() > lastReadVerleih) unreadVerleih++;
                }
            });
        }
        updateBadge('shop', unreadShop);
        updateBadge('verleih', unreadVerleih);
    }

    const lastReadCalendar = parseInt(localStorage.getItem('lastRead_calendar_' + uid) || '0');
    if (window.allOrders) {
        window.allOrders.forEach(o => {
            if (o.type === 'shop') return; 
            const eventTime = (o.lastHelperJoinedAt && typeof o.lastHelperJoinedAt.toMillis === 'function') ? o.lastHelperJoinedAt.toMillis() : 
                              (o.createdAt && typeof o.createdAt.toMillis === 'function' ? o.createdAt.toMillis() : 0);
            if (eventTime > lastReadCalendar) unreadCalendar++;
        });
    }
    updateBadge('calendar', unreadCalendar);

    const lastReadChat = parseInt(localStorage.getItem('lastRead_chat_' + uid) || '0');
    if (window.allChats) {
        window.allChats.forEach(c => {
            if (c.createdAt && typeof c.createdAt.toMillis === 'function' && c.senderId !== uid) {
                if (c.createdAt.toMillis() > lastReadChat) unreadChat++;
            }
        });
    }
    updateBadge('chat', unreadChat);

    const elSidebarNotif = document.getElementById('sidebar-notif');
    const elHeaderNotif = document.getElementById('header-notif');

    if (totalUnread > 0) {
        if (elSidebarNotif) { elSidebarNotif.textContent = totalUnread; elSidebarNotif.classList.remove('hidden'); }
        if (elHeaderNotif) elHeaderNotif.classList.remove('hidden');
    } else {
        if (elSidebarNotif) elSidebarNotif.classList.add('hidden');
        if (elHeaderNotif) elHeaderNotif.classList.add('hidden');
    }
};


function fetchMessagesCount() {
    if (!window.db) return;
    const q = window.firebaseQuery(window.firebaseCollection(window.db, "messages"));
    window.firebaseOnSnapshot(q, (snapshot) => {
        window.unreadMessagesCount = snapshot.size;
        window.allMessages = [];
        snapshot.forEach(doc => {
            window.allMessages.push({...doc.data(), id: doc.id});
        });
        window.updateNotificationBadges();
        if (window.allOrders) updateLists(window.newOrdersCount, '', '', ''); // Refresh lists to show messages
        if (window.renderFilteredMessages) window.renderFilteredMessages();
    });
}

function fetchCommentsCount() {
    if (!window.db) return;
    try {
        const q = window.firebaseQuery(window.firebaseCollectionGroup(window.db, "comments"));
        window.firebaseOnSnapshot(q, (snapshot) => {
            window.allComments = [];
            snapshot.forEach(doc => {
                window.allComments.push(doc.data());
            });
            window.updateNotificationBadges();
        });
    } catch(e) {
        console.warn('Could not load comments index.', e);
    }
}

function fetchChatsCount() {
    if (!window.db) return;
    const q = window.firebaseQuery(window.firebaseCollection(window.db, "chats"));
    window.firebaseOnSnapshot(q, (snapshot) => {
        window.allChats = [];
        snapshot.forEach(doc => {
            window.allChats.push(doc.data());
        });
        window.updateNotificationBadges();
    });
}

function loadOrdersAndStats(role) {
    if (!window.db) return;
    const q = window.firebaseQuery(window.firebaseCollection(window.db, "orders"), window.firebaseOrderBy("createdAt", "desc"));

    window.firebaseOnSnapshot(q, (snapshot) => {
        window.allOrders = [];
        let totalRevenue = 0;
        let shopOrdersCount = 0;
        let verleihOrdersCount = 0;
        let newOrdersCount = 0;
        
        let shopHtml = '';
        let verleihHtml = '';
        let latestHtml = '';
        let calendarEvents = [];
        let i = 0;

        snapshot.forEach((doc) => {
            const data = doc.data();
            data._id = doc.id;
            if (data.status === 'Zahlung Ausstehend (Stripe)') return; // Skip unpaid stripe checkouts

            if (data.type === 'manual_event') {
                if (data.eventDate) {
                    const startTime = data.eventTime ? `T${data.eventTime}` : '';
                    calendarEvents.push({
                        id: doc.id,
                        title: data.eventName || 'Manuelles Event',
                        start: data.eventDate + startTime,
                        allDay: !data.eventTime,
                        backgroundColor: '#1f2937',
                        borderColor: '#1f2937',
                        extendedProps: {
                            helpers: data.helpers || [],
                            needsVolunteers: data.needsVolunteers === true,
                            isVerleih: false
                        }
                    });
                }
                return;
            }

            window.allOrders.push({...data, _id: doc.id});
            if (data.status !== 'Erstattet' && !data.isRefunded) {
                totalRevenue += (data.totalPrice || 0);
            }
            
            let dateStr = 'Unbekannt';
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
                const d = data.createdAt.toDate();
                dateStr = d.toLocaleDateString('de-DE') + ' ' + d.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
            }

            const badge = data.type === 'shop' 
                ? '<span class="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">🛍️ Shop</span>'
                : '<span class="bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">🎈 Verleih</span>';
                
            const isRefundedOrder = data.status === 'Erstattet' || data.isRefunded === true;
            const statusBadge = isRefundedOrder
                ? `<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2 font-bold uppercase tracking-wider">Erstattet</span>`
                : data.status === 'Angesehen' 
                ? `<span class="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded ml-2">Angesehen</span>` 
                : data.status === 'Bezahlt' 
                ? `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-2">Neu (Bezahlt)</span>` 
                : `<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2">Neu</span>`;
                
            const priceHtml = isRefundedOrder
                ? `<div class="text-right"><span class="font-serif text-gray-400 line-through text-sm mr-1">${role === 'owner' ? (data.totalPrice || 0) + ' €' : '*** €'}</span><span class="text-red-600 text-xs font-bold uppercase block">Erstattet</span></div>`
                : `<span class="font-serif text-gold font-medium">${role === 'owner' ? (data.totalPrice || 0) + ' €' : '*** €'}</span>`;

            window.openedOrders = window.openedOrders || new Set();
            const isHidden = window.openedOrders.has(data._id) ? '' : 'hidden';

            const itemHtml = `
                <div class="border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-gray-50/50 cursor-pointer overflow-hidden">
                    <div class="p-4" onclick="if(window.openedOrders.has('${data._id}')){window.openedOrders.delete('${data._id}')}else{window.openedOrders.add('${data._id}')}; this.nextElementSibling.classList.toggle('hidden'); if(window.markOrderAsRead) window.markOrderAsRead('${data._id}', '${data.status || 'Neu'}');">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                ${badge}
                                <span class="font-medium text-gray-900">${data.customerName || 'Gast'}</span>
                                ${statusBadge}
                            </div>
                            ${priceHtml}
                        </div>
                        <div class="text-sm text-gray-500">
                            ${dateStr}
                        </div>
                    </div>
                    <div class="${isHidden} px-4 pb-4 text-sm border-t border-gray-200 bg-gray-100">
                        <div class="pt-3">
                            <p><strong>Email:</strong> ${data.customerEmail || 'Nicht angegeben'}</p>
                            <p><strong>Telefon:</strong> ${data.customerPhone || 'Nicht angegeben'}</p>
                            <p><strong>Adresse:</strong> ${data.customerAddress || 'Nicht angegeben'}</p>
                            <div class="mt-2">
                                <strong>Artikel:</strong>
                                ${data.items ? data.items.map(item => `<div class="text-gray-600">• ${item.quantity}x ${item.title}</div>`).join('') : '<span class="text-gray-500">Keine Artikel</span>'}
                            </div>
                            <div class="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
                                ${isRefundedOrder 
                                    ? `<span class="text-xs font-semibold text-red-600 italic">Diese Bestellung wurde erstattet. Betrag ist nicht in den Gesamteinnahmen enthalten.</span>`
                                    : (role === 'owner' || role === 'dev')
                                    ? `<button onclick="event.stopPropagation(); window.refundOrder('${data._id}', '${data.totalPrice || 0}')" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-xs font-semibold transition-colors">Rückerstattung veranlassen (Stripe)</button>`
                                    : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            if (data.type === 'shop') {
                shopOrdersCount++;
                shopHtml += itemHtml;
            } else if (data.type === 'verleih') {
                verleihOrdersCount++;
                verleihHtml += itemHtml;
                if (data.rentalDate) {
                    calendarEvents.push({
                        id: doc.id,
                        title: (data.customerName || 'Gast') + ' (' + (data.items ? data.items.length : 0) + ' Artikel)',
                        start: data.rentalDate,
                        allDay: true,
                        backgroundColor: '#D4AF37',
                        borderColor: '#D4AF37',
                        extendedProps: { 
                            helpers: data.helpers || [],
                            items: data.items || [],
                            isVerleih: true
                        }
                    });
                }
            }

            if (data.status === "Neu" || data.status === "Bezahlt") newOrdersCount++;
        });

        if (role === 'owner') {
            const elUmsatz = document.getElementById('stat-umsatz');
            if (elUmsatz) elUmsatz.textContent = totalRevenue + ' €';
        }
        
        const elShop = document.getElementById('stat-shop-orders');
        const elVerleih = document.getElementById('stat-verleih');
        if (elShop) elShop.textContent = shopOrdersCount;
        if (elVerleih) elVerleih.textContent = verleihOrdersCount;

        renderCalendar(calendarEvents, role);
        updateLists(newOrdersCount, shopHtml, verleihHtml, latestHtml);
        window.renderFilteredOrders('shop');
        window.renderFilteredOrders('verleih');
        window.updateNotificationBadges();
        if (window.renderReminders) window.renderReminders();
    }, (error) => {
        console.error("Orders Snapshot error:", error);
        updateLists(0, `<p class="text-red-500">Zugriff verweigert. Bitte Firebase Security Rules aktualisieren.</p>`, `<p class="text-red-500">Zugriff verweigert. Bitte Firebase Security Rules aktualisieren.</p>`, `<p class="text-red-500">Zugriff verweigert. Bitte Firebase Security Rules aktualisieren.</p>`);
    });
}

function loadVerleihForCalendarOnly() {
    if (!window.db) return;
    const q = window.firebaseQuery(window.firebaseCollection(window.db, "orders"));
    window.firebaseOnSnapshot(q, (snapshot) => {
        let calendarEvents = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.type === 'verleih' && data.rentalDate) {
                calendarEvents.push({
                    id: doc.id,
                    title: 'Verleih-Event',
                    start: data.rentalDate,
                    allDay: true,
                    backgroundColor: '#D4AF37',
                    borderColor: '#D4AF37',
                    extendedProps: { 
                        helpers: data.helpers || [],
                        items: data.items || [],
                        isVerleih: true
                    }
                });
            } else if (data.type === 'manual_event' && data.eventDate) {
                const startTime = data.eventTime ? `T${data.eventTime}` : '';
                calendarEvents.push({
                    id: doc.id,
                    title: data.eventName || 'Manuelles Event',
                    start: data.eventDate + startTime,
                    allDay: !data.eventTime,
                    backgroundColor: '#1f2937', // Darker color for manual events
                    borderColor: '#1f2937',
                    extendedProps: {
                        helpers: data.helpers || [],
                        needsVolunteers: data.needsVolunteers === true,
                        isVerleih: false
                    }
                });
            }
        });
        renderCalendar(calendarEvents, window.currentUserRole);
    }, (error) => {
        console.error("Calendar Snapshot error:", error);
        window.showCustomAlert('Kalender Fehler', 'Zugriff verweigert. Bitte Firebase Security Rules aktualisieren.');
    });
}

function updateLists(newOrdersCount, shopHtml, verleihHtml, _latestHtmlIgnored) {
    const elSidebarNotif = document.getElementById('sidebar-notif');
    const elHeaderNotif = document.getElementById('header-notif');
    const elStatMsgs = document.getElementById('stat-new-msgs');

    if (elStatMsgs) elStatMsgs.textContent = newOrdersCount;
    window.newOrdersCount = newOrdersCount;
    
    let combined = [...(window.allOrders || [])];
    if (window.allMessages) {
        combined = combined.concat(window.allMessages.map(m => ({...m, _isMsg: true})));
    }
    combined.sort((a, b) => {
        const timeA = (a.createdAt && typeof a.createdAt.toMillis === 'function') ? a.createdAt.toMillis() : 0;
        const timeB = (b.createdAt && typeof b.createdAt.toMillis === 'function') ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
    });

    let latestHtml = '';
    const role = window.currentUserRole;
    combined.slice(0, 10).forEach(data => {
        let dateStr = 'Unbekannt';
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            const d = data.createdAt.toDate();
            dateStr = d.toLocaleDateString('de-DE') + ' ' + d.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
        }
        if (data._isMsg) {
            latestHtml += `
            <div class="border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-gray-50/50 cursor-pointer overflow-hidden">
                <div class="p-4" onclick="this.nextElementSibling.classList.toggle('hidden')">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <span class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">✉️ Nachricht</span>
                            <span class="font-medium text-gray-900">${(data.firstName || data.lastName) ? ((data.firstName || '') + ' ' + (data.lastName || '')).trim() : (data.name || 'Gast')}</span>
                        </div>
                    </div>
                    <div class="text-sm text-gray-500">${dateStr}</div>
                </div>
                <div class="hidden px-4 pb-4 text-sm border-t border-gray-200 bg-gray-100 pt-3">
                    <p><strong>Name:</strong> ${(data.firstName || data.lastName) ? ((data.firstName || '') + ' ' + (data.lastName || '')).trim() : 'Nicht angegeben'}</p>
                      <p><strong>Email:</strong> ${data.email || ''}</p>
                    <p class="mt-2 text-gray-700 whitespace-pre-wrap">${data.message || ''}</p>
                </div>
            </div>`;
        } else {
            const badge = data.type === 'shop' 
                ? '<span class="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">🛍️ Shop</span>'
                : '<span class="bg-purple-100 text-purple-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">🎈 Verleih</span>';
            const isRefundedOrder = data.status === 'Erstattet' || data.isRefunded === true;
            const statusBadge = isRefundedOrder
                ? `<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2 font-bold uppercase tracking-wider">Erstattet</span>`
                : data.status === 'Angesehen' 
                ? `<span class="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded ml-2">Angesehen</span>` 
                : data.status === 'Bezahlt' 
                ? `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-2">Neu (Bezahlt)</span>` 
                : `<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2">Neu</span>`;
                
            const priceHtml = isRefundedOrder
                ? `<div class="text-right"><span class="font-serif text-gray-400 line-through text-sm mr-1">${role === 'owner' ? (data.totalPrice || 0) + ' €' : '*** €'}</span><span class="text-red-600 text-xs font-bold uppercase block">Erstattet</span></div>`
                : `<span class="font-serif text-gold font-medium">${role === 'owner' ? (data.totalPrice || 0) + ' €' : '*** €'}</span>`;
            
            latestHtml += `
            <div class="border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-gray-50/50 cursor-pointer overflow-hidden">
                <div class="p-4" onclick="this.nextElementSibling.classList.toggle('hidden'); if(window.markOrderAsRead) window.markOrderAsRead('${data._id}', '${data.status || 'Neu'}');">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            ${badge}
                            <span class="font-medium text-gray-900">${data.customerName || 'Gast'}</span>
                            ${statusBadge}
                        </div>
                        ${priceHtml}
                    </div>
                    <div class="text-sm text-gray-500">
                        ${dateStr}
                    </div>
                </div>
                <div class="hidden px-4 pb-4 text-sm border-t border-gray-200 bg-gray-100 pt-3">
                    <p><strong>Email:</strong> ${data.customerEmail || 'Nicht angegeben'}</p>
                    <p><strong>Telefon:</strong> ${data.customerPhone || 'Nicht angegeben'}</p>
                    <p><strong>Adresse:</strong> ${data.customerAddress || 'Nicht angegeben'}</p>
                    <div class="mt-2">
                        <strong>Artikel:</strong>
                        ${data.items ? data.items.map(item => `<div class="text-gray-600">• ${item.quantity}x ${item.title}</div>`).join('') : '<span class="text-gray-500">Keine Artikel</span>'}
                    </div>
                </div>
            </div>`;
        }
    });

    const totalNotifs = (window.newOrdersCount || 0) + (window.unreadMessagesCount || 0);

    if (totalNotifs > 0) {
        if (elSidebarNotif) { elSidebarNotif.textContent = totalNotifs; elSidebarNotif.classList.remove('hidden'); }
        if (elHeaderNotif) elHeaderNotif.classList.remove('hidden');
    } else {
        if (elSidebarNotif) elSidebarNotif.classList.add('hidden');
        if (elHeaderNotif) elHeaderNotif.classList.add('hidden');
    }

    const elShopList = document.getElementById('shop-orders-list');
    const elVerleihList = document.getElementById('verleih-orders-list');
    const elLatestList = document.getElementById('latest-activities');
    
    // Shop list is managed by renderFilteredOrders('shop')
    // Verleih list is managed by renderFilteredOrders('verleih')
    if (elLatestList) elLatestList.innerHTML = latestHtml || '<p class="text-gray-500 text-sm italic">Keine Aktivitäten vorhanden.</p>';
}

function renderCalendar(events, role) {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl || !window.FullCalendar) return;

    if (window.myCalendar) {
        window.myCalendar.destroy();
    }
    window.myCalendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        locale: 'de',
        firstDay: 1,
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        events: events,
        eventClick: async function(info) {
            const isVolunteer = role === 'volunteer';
            const props = info.event.extendedProps;
            const hasOptedIn = props.helpers.includes(window.currentUserId);
            const needsVolunteers = props.isVerleih ? true : props.needsVolunteers;
            
            // Format time if it's not allDay
            let timeStr = '';
            if (!info.event.allDay && info.event.start) {
                timeStr = ` um ${info.event.start.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})} Uhr`;
            }
            
            let msg = `Event am ${info.event.start.toLocaleDateString('de-DE')}${timeStr}\n`;
            
            if (props.isVerleih && props.items && props.items.length > 0) {
                msg += `\nAusgeliehene Artikel:\n`;
                props.items.forEach(item => {
                    msg += `- ${item.quantity}x ${item.title}\n`;
                });
            }
            
            if (needsVolunteers) {
                msg += `\nHelfer bisher: ${props.helpers.length}\n\n`;
            } else {
                msg += `\n(Keine Helfer benötigt)\n\n`;
            }
            
            if (isVolunteer) {
                if (!needsVolunteers) {
                    window.showCustomAlert('Hinweis', msg);
                } else if (hasOptedIn) {
                    window.showCustomAlert('Hinweis', msg + "Du hilfst bei diesem Event bereits mit!");
                } else {
                    window.showCustomConfirm('Event-Mithilfe', msg + "Möchtest du bei diesem Event mithelfen?", async () => {
                        try {
                            const orderRef = window.firebaseDoc(window.db, "orders", info.event.id);
                            const currentDoc = await window.firebaseGetDoc(orderRef);
                            if(currentDoc.exists()){
                                const currentHelpers = currentDoc.data().helpers || [];
                                if(!currentHelpers.includes(window.currentUserId)){
                                    currentHelpers.push(window.currentUserId);
                                    await window.firebaseSetDoc(orderRef, { helpers: currentHelpers }, { merge: true });
                                    window.showCustomAlert('Erfolg', "Danke! Du wurdest als Helfer eingetragen.");
                                }
                            }
                        } catch(e) {
                            window.showCustomAlert('Fehler', "Fehler beim Eintragen: " + e.message);
                        }
                    });
                }
            } else {
                if(window.showEventManageModal) {
                    try {
                        const usersSnap = await window.firebaseGetDocs(window.firebaseCollection(window.db, 'user_roles'));
                        const volunteers = [];
                        usersSnap.forEach(doc => {
                            if(doc.data().role === 'volunteer') {
                                volunteers.push({uid: doc.id, ...doc.data()});
                            }
                        });
                        window.showEventManageModal('Event Management', msg, info.event.id, props.helpers || [], volunteers);
                    } catch (e) {
                        window.showCustomAlert('Event Details', msg + "\n\nFehler beim Laden der Helfer.");
                    }
                } else {
                    window.showCustomAlert('Event Details', msg);
                }
            }
        }
    });
    window.myCalendar.render();
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if(btn.getAttribute('data-target') === 'calendar') {
            btn.addEventListener('click', () => {
                setTimeout(() => window.myCalendar.render(), 100);
            });
        }
    });
}

// === CHAT LOGIC ===
let currentChatChannel = 'general';
let chatUnsubscribe = null;
let chatImageFile = null;
window.chatUserProfiles = window.chatUserProfiles || {};

async function fetchChatUserProfiles() {
    try {
        const [rolesSnap, usersSnap] = await Promise.all([
            window.firebaseGetDocs(window.firebaseCollection(window.db, 'user_roles')).catch(() => null),
            window.firebaseGetDocs(window.firebaseCollection(window.db, 'users')).catch(() => null)
        ]);

        if (usersSnap && !usersSnap.empty) {
            usersSnap.forEach(doc => {
                const d = doc.data() || {};
                window.chatUserProfiles[doc.id] = {
                    uid: doc.id,
                    name: d.name || d.displayName || d.fullName || '',
                    email: d.email || '',
                    role: d.role || ''
                };
            });
        }

        if (rolesSnap && !rolesSnap.empty) {
            rolesSnap.forEach(doc => {
                const d = doc.data() || {};
                if (!window.chatUserProfiles[doc.id]) {
                    window.chatUserProfiles[doc.id] = { uid: doc.id };
                }
                if (d.name || d.displayName) window.chatUserProfiles[doc.id].name = d.name || d.displayName;
                if (d.email) window.chatUserProfiles[doc.id].email = d.email;
                if (d.role) window.chatUserProfiles[doc.id].role = d.role;
            });
        }
    } catch(err) {
        console.warn("Could not load user profiles for chat:", err);
    }
}

async function initChat(role, user) {
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const imageUpload = document.getElementById('chat-image-upload');
    const imagePreview = document.getElementById('chat-image-preview');
    const previewImg = document.getElementById('chat-preview-img');
    const removeImageBtn = document.getElementById('chat-remove-image');
    const channelsList = document.getElementById('chat-channels-list');
    const currentChatTitle = document.getElementById('current-chat-title');
    const mobileToggleBtn = document.getElementById('mobile-chat-toggle-btn');
    const mobileChannelsContainer = document.getElementById('chat-channels-container');
    const mobileToggleChevron = document.getElementById('mobile-chat-toggle-chevron');
    const mobileCurrentName = document.getElementById('mobile-chat-current-name');

    // 0. Setup mobile dropdown toggle
    if (mobileToggleBtn && mobileChannelsContainer) {
        mobileToggleBtn.onclick = (e) => {
            e.preventDefault();
            const isHidden = mobileChannelsContainer.classList.contains('hidden');
            if (isHidden) {
                mobileChannelsContainer.classList.remove('hidden');
                if (mobileToggleChevron) mobileToggleChevron.classList.add('rotate-180');
            } else {
                mobileChannelsContainer.classList.add('hidden');
                if (mobileToggleChevron) mobileToggleChevron.classList.remove('rotate-180');
            }
        };
    }

    // 1. Fetch user profiles and build DMs list
    try {
        await fetchChatUserProfiles();
        const usersSnap = await window.firebaseGetDocs(window.firebaseCollection(window.db, 'user_roles'));
        let dmsHtml = '';
        let dmCount = 0;

        usersSnap.forEach(doc => {
            if (doc.id !== user.uid) {
                dmCount++;
                const prof = window.chatUserProfiles[doc.id] || {};
                const uName = prof.name || doc.data().name || '';
                const uEmail = prof.email || doc.data().email || '';
                const uRole = prof.role || doc.data().role || 'Team';

                // Display logic: Full Name > Full Email > Fallback
                const mainLabel = uName || uEmail || ('Mitglied ' + doc.id.substring(0, 6));
                const secondaryLabel = uName && uEmail ? `${uEmail} • ${uRole}` : `${uRole}`;
                const initial = (uName ? uName.charAt(0) : (uEmail ? uEmail.charAt(0) : '@')).toUpperCase();

                // Create sorted channel ID for DM
                const dmChannelId = [user.uid, doc.id].sort().join('_');
                const chatTitleText = `@ ${uName || uEmail || ('Mitglied ' + doc.id.substring(0, 6))}`;

                dmsHtml += `
                    <li class="chat-channel-item rounded-lg" data-channel="${dmChannelId}" data-title="${chatTitleText}">
                        <button type="button" class="w-full text-left px-3 py-2.5 hover:bg-gray-100 transition-colors flex items-center rounded-lg">
                            <div class="w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-semibold flex items-center justify-center mr-2.5 flex-shrink-0 text-xs">
                                ${initial}
                            </div>
                            <div class="min-w-0 flex-1">
                                <p class="text-sm font-medium text-gray-900 truncate">${mainLabel}</p>
                                <p class="text-xs text-gray-500 capitalize truncate">${secondaryLabel}</p>
                            </div>
                        </button>
                    </li>
                `;
            }
        });
        
        if (channelsList) {
            channelsList.innerHTML = dmsHtml || '<li class="px-3 py-2 text-xs text-gray-400">Keine weiteren Teammitglieder</li>';
        }
        const dmCountEl = document.getElementById('chat-dm-count');
        if (dmCountEl) dmCountEl.textContent = `(${dmCount})`;
    } catch(e) {
        console.error("Could not fetch users for DMs", e);
        if (channelsList) channelsList.innerHTML = `<li class="px-4 py-2 text-xs text-red-500">Fehler beim Laden der Mitglieder</li>`;
    }

    // 2. Channel Switching Handler
    function bindChannelItemListeners() {
        document.querySelectorAll('.chat-channel-item').forEach(item => {
            item.onclick = () => {
                document.querySelectorAll('.chat-channel-item').forEach(i => {
                    i.classList.remove('active', 'border-l-4', 'border-gold', 'bg-white', 'shadow-sm');
                });
                item.classList.add('active', 'border-l-4', 'border-gold', 'bg-white', 'shadow-sm');
                currentChatChannel = item.getAttribute('data-channel');
                const targetTitle = item.getAttribute('data-title') || '# General';
                if (currentChatTitle) currentChatTitle.textContent = targetTitle;
                if (mobileCurrentName) mobileCurrentName.textContent = targetTitle;

                // Auto collapse dropdown on mobile
                if (window.innerWidth < 768 && mobileChannelsContainer) {
                    mobileChannelsContainer.classList.add('hidden');
                    if (mobileToggleChevron) mobileToggleChevron.classList.remove('rotate-180');
                }

                loadChatMessages(currentChatChannel, user);
            };
        });
    }

    bindChannelItemListeners();

    // 3. Image Upload Preview
    if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                chatImageFile = file;
                previewImg.src = URL.createObjectURL(file);
                imagePreview.classList.remove('hidden');
            }
        });
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            chatImageFile = null;
            if (imageUpload) imageUpload.value = '';
            if (imagePreview) imagePreview.classList.add('hidden');
        });
    }

    // 4. Send Message
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text && !chatImageFile) return;

            chatInput.disabled = true;
            let imageUrl = null;

            try {
                if (chatImageFile) {
                    // Compress image to Base64 to save directly in Firestore
                    imageUrl = await compressImageToBase64(chatImageFile);
                }

                const myProfile = window.chatUserProfiles[user.uid] || {};
                const myDisplayName = myProfile.name || user.displayName || myProfile.email || user.email || 'User';

                await window.firebaseAddDoc(window.firebaseCollection(window.db, 'chats'), {
                    channel: currentChatChannel,
                    text: text,
                    imageUrl: imageUrl,
                    senderId: user.uid,
                    senderName: myDisplayName,
                    senderEmail: user.email || myProfile.email || 'User',
                    createdAt: window.firebaseServerTimestamp()
                });

                chatInput.value = '';
                chatImageFile = null;
                if (imageUpload) imageUpload.value = '';
                if (imagePreview) imagePreview.classList.add('hidden');
            } catch(error) {
                window.showCustomAlert('Fehler', 'Fehler beim Senden: ' + error.message);
            } finally {
                chatInput.disabled = false;
                chatInput.focus();
            }
        });
    }

    // Load initial channel
    loadChatMessages(currentChatChannel, user);
}

function compressImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compress to JPEG with 0.7 quality
                const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                
                // Firestore document limit is 1MB. dataUrl is a string.
                if (dataUrl.length > 900000) {
                    reject(new Error("Bild ist nach der Komprimierung immer noch zu groß. Bitte ein anderes wählen."));
                } else {
                    resolve(dataUrl);
                }
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
}

function loadChatMessages(channel, currentUser) {
    if (chatUnsubscribe) chatUnsubscribe();
    
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    messagesContainer.innerHTML = '<p class="text-center text-gray-400 text-sm py-4">Lade Nachrichten...</p>';

    const q = window.firebaseQuery(
        window.firebaseCollection(window.db, 'chats'),
        window.firebaseOrderBy('createdAt', 'asc')
    );

    chatUnsubscribe = window.firebaseOnSnapshot(q, (snapshot) => {
        let html = '';
        let count = 0;
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.channel === channel) {
                count++;
                const isMe = data.senderId === currentUser.uid;
                const time = data.createdAt ? new Date(data.createdAt.toMillis()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...';
                
                // Author Display Name Resolution
                const senderProfile = window.chatUserProfiles ? window.chatUserProfiles[data.senderId] : null;
                const authorName = (senderProfile && (senderProfile.name || senderProfile.displayName)) || data.senderName || (senderProfile && senderProfile.email) || data.senderEmail || (data.senderId ? data.senderId.substring(0, 6) : 'Teammitglied');
                
                let contentHtml = '';
                if(data.imageUrl) {
                    contentHtml += `<img src="${data.imageUrl}" class="rounded-lg max-w-xs mb-2 cursor-pointer shadow-sm" onclick="window.open('${data.imageUrl}', '_blank')">`;
                }
                if(data.text) {
                    contentHtml += `<p class="text-sm ${isMe ? 'text-white' : 'text-gray-800'} whitespace-pre-wrap">${data.text}</p>`;
                }

                html += `
                    <div class="flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-4">
                        <div class="flex items-baseline space-x-2 mb-1 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}">
                            <span class="font-semibold text-xs ${isMe ? 'text-gold' : 'text-gray-700'}">${isMe ? 'Du (' + authorName + ')' : authorName}</span>
                            <span class="text-[10px] text-gray-400">${time}</span>
                        </div>
                        <div class="max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-gold text-white rounded-tr-none shadow' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'}">
                            ${contentHtml}
                        </div>
                    </div>
                `;
            }
        });

        if (count === 0) {
            html = `<div class="flex flex-col items-center justify-center h-full text-gray-400 space-y-3 pt-10">
                <svg class="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                <p class="text-sm">Noch keine Nachrichten in diesem Kanal.</p>
            </div>`;
        }

        messagesContainer.innerHTML = html;
        messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto scroll to bottom
    }, (error) => {
        console.error("Chat Snapshot error:", error);
        messagesContainer.innerHTML = `<div class="p-4 text-center text-red-500">Zugriff verweigert. Bitte Firebase Security Rules aktualisieren.</div>`;
    });
}

// === MEMBERS LOGIC ===
function initMembersManagement() {
    const list = document.getElementById('members-list');
    const saveBtn = document.getElementById('save-member-btn');
    const uidInput = document.getElementById('member-uid');
    const roleSelect = document.getElementById('member-role');
    const statusMsg = document.getElementById('member-save-status');

    // Show add form
    document.getElementById('add-member-btn').addEventListener('click', () => {
        document.getElementById('add-member-form').classList.toggle('hidden');
    });

    // Save
    saveBtn.addEventListener('click', async () => {
        const uid = uidInput.value.trim();
        const role = roleSelect.value;
        if (!uid) return window.showCustomAlert('Fehler', 'Bitte UID eingeben.');

        try {
            saveBtn.disabled = true;
            statusMsg.textContent = 'Speichere...';
            statusMsg.classList.remove('hidden', 'text-red-600', 'text-green-600');
            
            await window.firebaseSetDoc(window.firebaseDoc(window.db, 'user_roles', uid), {
                role: role,
                updatedAt: window.firebaseServerTimestamp()
            }, { merge: true });

            statusMsg.textContent = 'Erfolgreich gespeichert!';
            statusMsg.classList.add('text-green-600');
            uidInput.value = '';
        } catch(e) {
            statusMsg.textContent = 'Fehler: ' + e.message;
            statusMsg.classList.add('text-red-600');
        } finally {
            saveBtn.disabled = false;
        }
    });

    // List
    const q = window.firebaseQuery(window.firebaseCollection(window.db, 'user_roles'));
    window.firebaseOnSnapshot(q, (snapshot) => {
        let html = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const prof = (window.chatUserProfiles && window.chatUserProfiles[doc.id]) || {};
            const userName = prof.name || data.name || '';
            const userEmail = prof.email || data.email || '';
            
            html += `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm">
                        ${userName ? `<div class="font-semibold text-gray-900">${userName}</div>` : ''}
                        <div class="text-xs text-gray-600">${userEmail || 'Keine E-Mail hinterlegt'}</div>
                        <div class="font-mono text-[11px] text-gray-400 mt-0.5">UID: ${doc.id}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 capitalize">
                            ${data.role}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button onclick="deleteMember('${doc.id}')" class="text-red-600 hover:text-red-900 font-medium transition-colors">Löschen</button>
                    </td>
                </tr>
            `;
        });
        if(snapshot.empty) html = '<tr><td colspan="3" class="px-6 py-4 text-center text-gray-500">Keine Mitglieder gefunden.</td></tr>';
        list.innerHTML = html;
    }, (error) => {
        console.error("Members Snapshot error:", error);
        list.innerHTML = '<tr><td colspan="3" class="px-6 py-4 text-center text-red-500">Zugriff verweigert. Bitte Firebase Security Rules aktualisieren.</td></tr>';
    });

    window.deleteMember = async function(uid) {
        window.showCustomConfirm('Zugriff entfernen', `Möchten Sie den Zugriff für UID ${uid} wirklich entfernen?`, async () => {
            await window.firebaseSetDoc(window.firebaseDoc(window.db, 'user_roles', uid), { role: 'customer' }, { merge: true });
            window.showCustomAlert('Erfolg', 'Der Zugriff wurde erfolgreich entfernt.');
        });
    };
}

function initEventModal() {
    const addEventBtn = document.getElementById('btn-add-event');
    const closeEventBtn = document.getElementById('close-add-event');
    const addEventModal = document.getElementById('add-event-modal');
    const addEventForm = document.getElementById('add-event-form');

    if (!addEventBtn || !addEventModal) return;

    addEventBtn.addEventListener('click', () => {
        addEventModal.classList.remove('hidden');
    });

    closeEventBtn.addEventListener('click', () => {
        addEventModal.classList.add('hidden');
    });

    addEventForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('event-name').value;
        const date = document.getElementById('event-date').value;
        const time = document.getElementById('event-time').value;
        const needsVols = document.getElementById('event-needs-volunteers').checked;

        const submitBtn = addEventForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Speichere...';

        try {
            await window.firebaseAddDoc(window.firebaseCollection(window.db, 'orders'), {
                type: 'manual_event',
                eventName: name,
                eventDate: date,
                eventTime: time,
                needsVolunteers: needsVols,
                helpers: [],
                createdAt: window.firebaseServerTimestamp()
            });

            window.showCustomAlert('Erfolg', 'Das Event wurde erfolgreich angelegt.');
            addEventForm.reset();
            addEventModal.classList.add('hidden');
        } catch (error) {
            console.error("Fehler beim Event anlegen:", error);
            window.showCustomAlert('Fehler', 'Konnte Event nicht anlegen: ' + error.message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Event Speichern';
        }
    });
}
initEventModal();

window.renderReminders = function() {
    const remindersSection = document.getElementById('section-reminders');
    if (!remindersSection) return;

    let html = '<h2 class="text-2xl font-serif text-gray-900 mb-6">Erinnerungen (Anstehende Verleihe)</h2><div class="space-y-4">';
    
    const now = new Date();
    now.setHours(0,0,0,0);
    let upcoming = [];
    if (window.allOrders) {
        window.allOrders.forEach(o => {
            if (o.type === 'verleih' && o.rentalDate) {
                const rDate = new Date(o.rentalDate);
                if (rDate >= now) {
                    upcoming.push(o);
                }
            }
        });
    }

    upcoming.sort((a, b) => new Date(a.rentalDate) - new Date(b.rentalDate));

    if (upcoming.length === 0) {
        html += '<p class="text-gray-500">Keine anstehenden Verleihe.</p>';
    } else {
        upcoming.forEach(data => {
            const d = new Date(data.rentalDate);
            const dateStr = d.toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            
            html += `
                <div class="border border-gold/30 rounded-lg bg-white shadow-sm overflow-hidden">
                    <div class="p-4 bg-gold/5 flex justify-between items-center cursor-pointer hover:bg-gold/10 transition-colors" onclick="this.nextElementSibling.classList.toggle('hidden')">
                        <div>
                            <p class="font-bold text-gray-900">${dateStr}</p>
                            <p class="text-sm text-gray-600">${data.customerName || 'Gast'} (${data.items ? data.items.length : 0} Artikel)</p>
                        </div>
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                    <div class="hidden p-4 border-t border-gray-100">
                        <ul class="list-disc pl-5 text-sm text-gray-700">
                            ${data.items ? data.items.map(item => `<li>${item.quantity}x ${item.title}</li>`).join('') : '<li>Keine Artikel</li>'}
                        </ul>
                        <div class="mt-3 text-xs text-gray-500">
                            <p>Email: ${data.customerEmail || '-'}</p>
                            <p>Tel: ${data.customerPhone || '-'}</p>
                            <p>Adresse: ${data.customerAddress || '-'}</p>
                        </div>
                    </div>
                </div>
            `;
        });
    }

    html += '</div>';
    remindersSection.innerHTML = html;
};

// === CUSTOM PACKAGES LOGIC ===
document.addEventListener('DOMContentLoaded', () => {
    const createPackageBtn = document.getElementById('create-package-btn');
    const packageModal = document.getElementById('package-modal');
    const closePackageModalBtn = document.getElementById('close-package-modal');
    const cancelPackageModalBtn = document.getElementById('cancel-package-modal');
    const packageForm = document.getElementById('package-form');
    const pkgItemsList = document.getElementById('pkg-items-list');
    
    window.currentPackages = window.currentPackages || {};

    // Helper to load and pre-check catalog items
    async function loadCatalogItemsForPackage(selectedItems = []) {
        if (!pkgItemsList) return;
        pkgItemsList.innerHTML = '<p class="text-gray-500 text-sm p-2">Lade Katalog...</p>';
        try {
            let catalog = [];
            try {
                const response = await fetch('catalog.json');
                if (response.ok) catalog = await response.json();
            } catch(e) {
                const response = await fetch('functions/catalog.json');
                if (response.ok) catalog = await response.json();
            }

            // Also include custom products from window.currentProducts if available
            if (window.currentProducts) {
                Object.entries(window.currentProducts).forEach(([cpId, cp]) => {
                    if (!catalog.some(x => String(x.id) === String(cpId))) {
                        catalog.push({
                            id: cpId,
                            title: cp.title,
                            source: cp.target || 'shop',
                            price: cp.price || 0,
                            images: cp.images || [cp.img].filter(Boolean),
                            img: cp.img || ''
                        });
                    }
                });
            }

            pkgItemsList.innerHTML = '';
            catalog.forEach(item => {
                const div = document.createElement('div');
                div.className = 'flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors';
                
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'pkg-item-checkbox h-4 w-4 text-gold focus:ring-gold border-gray-300 rounded mr-3';
                checkbox.dataset.id = item.id;
                checkbox.dataset.title = item.title;
                checkbox.dataset.source = item.source;
                checkbox.dataset.price = item.price;
                checkbox.dataset.img = item.images ? item.images[0] : (item.img ? item.img : '');
                
                // Pre-check if editing and item was selected
                const isSelected = selectedItems.some(si => 
                    String(si.id) === String(item.id) || 
                    String(si.id) === ('catalog_' + item.source + '_' + item.id) ||
                    si.title === item.title
                );
                if (isSelected) checkbox.checked = true;

                const label = document.createElement('label');
                label.className = 'text-sm text-gray-700 flex-1 cursor-pointer';
                label.textContent = item.title + ' (' + item.price + ' €) [' + (item.source === 'shop' ? 'Shop' : 'Verleih') + ']';
                
                div.appendChild(checkbox);
                div.appendChild(label);
                
                div.addEventListener('click', (e) => {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                    }
                });
                
                pkgItemsList.appendChild(div);
            });
        } catch (error) {
            console.error("Error loading catalog for package:", error);
            pkgItemsList.innerHTML = '<p class="text-red-500 text-sm p-2">Fehler beim Laden des Katalogs.</p>';
        }
    }

    window.openCreatePackageModal = function() {
        if (!packageModal) return;
        document.getElementById('pkg-id').value = '';
        document.getElementById('package-modal-title').textContent = 'Neues Spezialpaket';
        packageForm.reset();
        document.getElementById('pkg-visible').checked = true;
        const pkgTagsEl = document.getElementById('pkg-tags');
        if (pkgTagsEl) pkgTagsEl.value = '';
        packageModal.classList.remove('hidden');
        packageModal.classList.add('flex');
        loadCatalogItemsForPackage([]);
    };

    window.openEditPackageModal = function(pkgId) {
        if (!packageModal) return;
        const pkg = window.currentPackages[pkgId];
        if (!pkg) return;

        document.getElementById('pkg-id').value = pkgId;
        document.getElementById('package-modal-title').textContent = 'Spezialpaket bearbeiten';
        document.getElementById('pkg-title').value = pkg.title || '';
        document.getElementById('pkg-desc').value = pkg.description || '';
        document.getElementById('pkg-price').value = pkg.price !== undefined ? pkg.price : '';
        const pkgTagsEl = document.getElementById('pkg-tags');
        if (pkgTagsEl) pkgTagsEl.value = Array.isArray(pkg.tags) ? pkg.tags.join(', ') : '';
        document.getElementById('pkg-visible').checked = pkg.visibleInShop !== false;

        packageModal.classList.remove('hidden');
        packageModal.classList.add('flex');
        loadCatalogItemsForPackage(pkg.items || []);
    };

    function closePackageModal() {
        if (packageModal) {
            packageModal.classList.add('hidden');
            packageModal.classList.remove('flex');
            packageForm.reset();
            document.getElementById('pkg-id').value = '';
            document.getElementById('package-modal-title').textContent = 'Neues Spezialpaket';
            const pkgTagsEl = document.getElementById('pkg-tags');
            if (pkgTagsEl) pkgTagsEl.value = '';
        }
    }
    
    if (createPackageBtn) {
        createPackageBtn.addEventListener('click', window.openCreatePackageModal);
    }
    
    if (closePackageModalBtn) closePackageModalBtn.addEventListener('click', closePackageModal);
    if (cancelPackageModalBtn) cancelPackageModalBtn.addEventListener('click', closePackageModal);
    
    if (packageForm) {
        packageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const pkgId = document.getElementById('pkg-id').value;
            const title = document.getElementById('pkg-title').value.trim();
            const desc = document.getElementById('pkg-desc').value.trim();
            const price = parseFloat(document.getElementById('pkg-price').value);
            const visible = document.getElementById('pkg-visible').checked;
            const rawPkgTags = document.getElementById('pkg-tags')?.value || '';
            const pkgTags = rawPkgTags.split(',').map(s => s.trim()).filter(Boolean);
            
            const selectedCheckboxes = Array.from(document.querySelectorAll('.pkg-item-checkbox:checked'));
            if (selectedCheckboxes.length === 0) {
                alert('Bitte wählen Sie mindestens einen Artikel aus.');
                return;
            }
            
            const items = selectedCheckboxes.map(cb => ({
                id: cb.dataset.id,
                title: cb.dataset.title,
                source: cb.dataset.source,
                originalPrice: parseFloat(cb.dataset.price) || 0,
                img: cb.dataset.img || ''
            }));
            
            const pkgData = {
                title: title,
                description: desc,
                price: price,
                visibleInShop: visible,
                items: items,
                tags: pkgTags
            };
            
            const submitBtn = packageForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Speichere...';
            submitBtn.disabled = true;
            
            try {
                if (pkgId) {
                    // Update existing package
                    pkgData.updatedAt = window.firebaseServerTimestamp();
                    await window.firebaseUpdateDoc(window.firebaseDoc(window.db, "custom_packages", pkgId), pkgData);
                    alert('Spezialpaket erfolgreich aktualisiert!');
                } else {
                    // Create new package
                    pkgData.createdAt = window.firebaseServerTimestamp();
                    await window.firebaseAddDoc(window.firebaseCollection(window.db, "custom_packages"), pkgData);
                    alert('Spezialpaket erfolgreich erstellt!');
                }
                                const pkgFeatSlot = document.getElementById('pkg-featured-slot')?.value;
                if (pkgFeatSlot !== undefined && pkgFeatSlot !== '' && window.setFeaturedSlotFromModal) {
                    let firstImg = 'assets/logo_dark.png';
                    if (items && items.length > 0) {
                        firstImg = items[0].img || firstImg;
                    }
                    window.setFeaturedSlotFromModal(pkgFeatSlot, {
                        id: pkgId || 'package_' + Date.now(),
                        type: 'shop',
                        title: title,
                        img: firstImg,
                        price: price,
                        priceMode: 'fixed',
                        category: 'Spezialangebote',
                        shortDesc: desc,
                        source: 'package'
                    });
                }
                closePackageModal();
                loadPackages();
            } catch (error) {
                console.error("Error saving package: ", error);
                alert('Fehler beim Speichern des Pakets: ' + error.message);
            } finally {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

let unsubscribePackages = null;
function loadPackages() {
    const tbody = document.getElementById('packages-tbody');
    if (!tbody) return;
    
    if (unsubscribePackages) unsubscribePackages();
    
    const q = window.firebaseQuery(window.firebaseCollection(window.db, "custom_packages"), window.firebaseOrderBy("createdAt", "desc"));
    
    unsubscribePackages = window.firebaseOnSnapshot(q, (snapshot) => {
        tbody.innerHTML = '';
        window.currentPackages = {};
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-4 text-center text-sm text-gray-500">Keine Spezialpakete gefunden.</td></tr>';
            return;
        }
        
        snapshot.forEach(doc => {
            const pkg = doc.data();
            window.currentPackages[doc.id] = pkg;
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition-colors';
            
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-gray-900">${pkg.title}</div>
                    <div class="text-xs text-gray-500">${pkg.items ? pkg.items.length : 0} Artikel enthalten</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ${Number(pkg.price || 0).toFixed(2).replace('.', ',')} €
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${pkg.visibleInShop !== false ? 
                        '<span class="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ja</span>' : 
                        '<span class="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Nein</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button type="button" class="text-gold hover:text-yellow-600 font-semibold edit-pkg-btn" data-id="${doc.id}">Bearbeiten</button>
                    <button type="button" class="text-red-600 hover:text-red-900 delete-pkg-btn" data-id="${doc.id}">Löschen</button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Add edit listeners
        tbody.querySelectorAll('.edit-pkg-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (window.openEditPackageModal) window.openEditPackageModal(id);
            });
        });

        // Add delete listeners
        tbody.querySelectorAll('.delete-pkg-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (confirm('Möchten Sie dieses Spezialpaket wirklich löschen?')) {
                    const id = btn.dataset.id;
                    try {
                        await window.firebaseDeleteDoc(window.firebaseDoc(window.db, "custom_packages", id));
                        alert('Paket gelöscht.');
                    } catch (error) {
                        console.error("Error deleting package: ", error);
                        alert('Fehler beim Löschen.');
                    }
                }
            });
        });
    });
}

// Hook into existing userRoleLoaded to load packages and products
document.addEventListener('userRoleLoaded', (e) => {
    const { role } = e.detail;
    if (role === 'owner' || role === 'dev') {
        loadPackages();
        loadProducts();
    }
});

// --- Products Management ---
document.addEventListener('DOMContentLoaded', () => {
    const createProductBtn = document.getElementById('create-product-btn');
    const productModal = document.getElementById('product-modal');
    const closeProductModalBtn = document.getElementById('close-product-modal');
    const cancelProductModalBtn = document.getElementById('cancel-product-modal');
    const productForm = document.getElementById('product-form');
    
    function closeProductModal() {
        if (productModal) {
            productModal.classList.add('hidden');
            productModal.classList.remove('flex');
            productForm.reset(); if (window.handlePriceModeChange) window.handlePriceModeChange();
              document.getElementById('prod-id').value = '';
              document.getElementById('product-modal-title').textContent = 'Neues Produkt';
            const statusEl = document.getElementById('prod-image-status');
            if(statusEl) statusEl.textContent = '';
            const existingImages = document.getElementById('prod-existing-images');
            if(existingImages) existingImages.innerHTML = '';
            const prodTagsEl = document.getElementById('prod-tags');
            if (prodTagsEl) prodTagsEl.value = '';
            document.getElementById('prod-transport-fields')?.classList.add('hidden');
            const priceKmEl = document.getElementById('prod-price-per-km');
            if (priceKmEl) priceKmEl.value = '0.50';
            const flatFeeEl = document.getElementById('prod-transport-flat');
            if (flatFeeEl) flatFeeEl.value = '0';
        }
    }
    
    const transportCheckbox = document.getElementById('prod-transport-enabled');
    const transportFields = document.getElementById('prod-transport-fields');
    if (transportCheckbox && transportFields) {
        transportCheckbox.addEventListener('change', () => {
            transportFields.classList.toggle('hidden', !transportCheckbox.checked);
        });
    }

    if (createProductBtn) {
        createProductBtn.addEventListener('click', () => {
            productModal.classList.remove('hidden');
            productModal.classList.add('flex');
            const prodTagsEl = document.getElementById('prod-tags');
            if (prodTagsEl) prodTagsEl.value = '';
            document.getElementById('prod-transport-fields')?.classList.add('hidden');
        });
    }
    
    if (closeProductModalBtn) closeProductModalBtn.addEventListener('click', closeProductModal);
    if (cancelProductModalBtn) cancelProductModalBtn.addEventListener('click', closeProductModal);
    
    if (productForm) {
        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const prodId = document.getElementById('prod-id').value;
            const category = document.getElementById('prod-category').value.trim();
            const title = document.getElementById('prod-title').value.trim();
            const desc = document.getElementById('prod-desc').value.trim();
            const price = parseFloat(document.getElementById('prod-price').value);
            const priceMode = document.getElementById('prod-price-mode')?.value || 'fixed';
            const decorationService = !!document.getElementById('prod-decoration-service')?.checked;
            const trackStock = !!document.getElementById('prod-track-stock')?.checked;
            const stock = Math.max(0, parseInt(document.getElementById('prod-stock')?.value || '0', 10));
            const lowStockThreshold = Math.max(0, parseInt(document.getElementById('prod-low-stock')?.value || '2', 10));
            const transportEnabled = !!document.getElementById('prod-transport-enabled')?.checked;
            const pricePerKm = transportEnabled ? Math.max(0, parseFloat(document.getElementById('prod-price-per-km')?.value || '0.50')) : 0;
            const transportFlatFee = transportEnabled ? Math.max(0, parseFloat(document.getElementById('prod-transport-flat')?.value || '0')) : 0;
            const transportMode = transportEnabled ? 'distance' : 'none';
            const longDesc = document.getElementById('prod-long-desc').value.trim();
            const target = document.getElementById('prod-target').value;
            const visible = document.getElementById('prod-visible').checked;
            
            const premiumCheckbox = document.getElementById('prod-premium');
            const isPremium = premiumCheckbox ? premiumCheckbox.checked : false;

            const rawTags = document.getElementById('prod-tags')?.value || '';
            let tags = rawTags.split(',').map(s => s.trim()).filter(Boolean);
            if (isPremium && !tags.includes('Premium')) {
                tags.unshift('Premium');
            }
            
            const fileInput = document.getElementById('prod-image-file');
            
            if (!prodId && fileInput.files.length === 0) {
                alert('Bitte wählen Sie mindestens ein Bild aus.');
                return;
            }
            
            const submitBtn = document.getElementById('save-product-btn');
            const submitText = document.getElementById('save-product-text');
            const submitSpinner = document.getElementById('save-product-spinner');
            
            submitText.textContent = 'Lädt hoch...';
            submitSpinner.classList.remove('hidden');
            submitBtn.disabled = true;
            
            try {
                let downloadURLs = [];
                
                if (fileInput.files.length > 0) {
                    console.log(`Uploading ${fileInput.files.length} files...`);
                    const uploadPromises = Array.from(fileInput.files).map(async (file) => {
                        const storageRef = window.firebaseRef(window.storage, `products/${Date.now()}_${file.name}`);
                        await Promise.race([
                            window.firebaseUploadBytes(storageRef, file),
                            new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timeout (15s).')), 15000))
                        ]);
                        return await window.firebaseGetDownloadURL(storageRef);
                    });
                    downloadURLs = await Promise.all(uploadPromises);
                    console.log('Uploads finished.');
                }
                
                // Save product to Firestore
                const productData = {
                    category: category,
                    title: title,
                    subtitle: desc,
                    price: price,
                    priceMode,
                    decorationService,
                    trackStock,
                    stock,
                    lowStockThreshold,
                    transportEnabled,
                    transportMode,
                    pricePerKm,
                    transportFlatFee,
                    features: longDesc.split(',').map(s => s.trim()).filter(s => s),
                    target: target,
                    visible: visible,
                    isPremium: isPremium,
                    tags: tags
                };
                
                if (downloadURLs.length > 0) {
                    productData.images = downloadURLs;
                    productData.img = downloadURLs[0]; // Primary image for backwards compatibility
                }
                
                if (prodId) {
                    // Update existing
                    productData.updatedAt = window.firebaseServerTimestamp();
                    await window.firebaseUpdateDoc(window.firebaseDoc(window.db, "custom_products", prodId), productData);
                    alert('Produkt erfolgreich aktualisiert!');
                } else {
                    // Create new
                    productData.createdAt = window.firebaseServerTimestamp();
                    await window.firebaseAddDoc(window.firebaseCollection(window.db, "custom_products"), productData);
                    alert('Produkt erfolgreich erstellt!');
                }
                                const featSlot = document.getElementById('prod-featured-slot')?.value;
                if (featSlot !== undefined && featSlot !== '' && window.setFeaturedSlotFromModal) {
                    window.setFeaturedSlotFromModal(featSlot, {
                        id: prodId || 'custom_' + Date.now(),
                        type: target,
                        title: title,
                        img: (productData.images && productData.images[0]) || productData.img || 'assets/logo_dark.png',
                        price: price,
                        priceMode: priceMode,
                        category: category,
                        shortDesc: desc,
                        source: 'custom'
                    });
                }
                closeProductModal();
            } catch (error) {
                console.error("Error saving product: ", error);
                alert('Fehler beim Speichern des Produkts: ' + error.message);
            } finally {
                submitText.textContent = 'Speichern';
                submitSpinner.classList.add('hidden');
                submitBtn.disabled = false;
            }
        });
    }
});

let unsubscribeProducts = null;
function loadProducts() {
    if (!window.db) return;
    
    if (unsubscribeProducts) {
        unsubscribeProducts();
    }
    
    const productsQuery = window.firebaseQuery(
        window.firebaseCollection(window.db, "custom_products"),
        window.firebaseOrderBy("createdAt", "desc")
    );
    
    unsubscribeProducts = window.firebaseOnSnapshot(productsQuery, (snapshot) => {
        const tbody = document.getElementById('products-tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        window.currentProducts = {};
        
        if (snapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="8" class="px-6 py-4 text-center text-gray-500">Keine Produkte gefunden.</td></tr>';
            return;
        }
        
        snapshot.forEach(doc => {
            const prod = doc.data();
            window.currentProducts[doc.id] = prod;
            const tr = document.createElement('tr');
            tr.className = 'hover:bg-gray-50 transition-colors';
            
            tr.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <img src="${prod.img}" alt="${prod.title}" class="h-10 w-10 rounded object-cover border border-gray-200">
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${prod.title}</div>
                    <div class="text-xs text-gray-500">${prod.category}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${prod.target === 'shop' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}">${prod.target === 'shop' ? 'Shop' : 'Verleih'}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${prod.priceMode === 'request' ? 'Auf Anfrage' : (prod.priceMode === 'from' ? 'ab ' : '') + parseFloat(prod.price || 0).toFixed(2).replace('.', ',') + ' €'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                    ${prod.trackStock ? `<span class="${Number(prod.stock) <= Number(prod.lowStockThreshold || 0) ? 'text-red-600 font-semibold' : 'text-gray-900'}">${Number(prod.stock || 0)}</span><button class="ml-2 text-xs text-blue-600 stock-adjust-btn" data-id="${doc.id}">±</button>` : '<span class="text-gray-400">Nicht geführt</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${prod.transportEnabled ? (prod.transportMode === 'flat' ? `${Number(prod.transportFlatFee || 0).toFixed(2)} €` : prod.transportMode === 'quote' ? 'Angebot' : 'Entfernung') : 'Nein'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${prod.visible ? 
                        '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Ja</span>' : 
                        '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Nein</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 mr-3 edit-prod-btn" data-id="${doc.id}">Bearbeiten</button>
                      <button class="text-red-600 hover:text-red-900 delete-prod-btn" data-id="${doc.id}">Löschen</button>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Add delete listeners
        
    window.openEditProductModal = function(id) {
        const prod = window.currentProducts[id];
        if (!prod) return;
        
        document.getElementById('prod-id').value = id;
        document.getElementById('product-modal-title').textContent = 'Produkt bearbeiten';
        
        document.getElementById('prod-category').value = prod.category || '';
        document.getElementById('prod-title').value = prod.title || '';
        document.getElementById('prod-desc').value = prod.subtitle || '';
        document.getElementById('prod-price').value = prod.price || 0;
        document.getElementById('prod-price-mode').value = prod.priceMode || 'fixed'; if (window.handlePriceModeChange) window.handlePriceModeChange();
        document.getElementById('prod-decoration-service').checked = !!prod.decorationService;
        document.getElementById('prod-track-stock').checked = !!prod.trackStock;
        document.getElementById('prod-stock').value = Number(prod.stock || 0);
        document.getElementById('prod-low-stock').value = Number(prod.lowStockThreshold ?? 2);
        const tEnabled = !!prod.transportEnabled;
        document.getElementById('prod-transport-enabled').checked = tEnabled;
        const priceKmEl = document.getElementById('prod-price-per-km');
        if (priceKmEl) priceKmEl.value = prod.pricePerKm !== undefined ? Number(prod.pricePerKm) : 0.50;
        const flatFeeEl = document.getElementById('prod-transport-flat');
        if (flatFeeEl) flatFeeEl.value = Number(prod.transportFlatFee || 0);
        document.getElementById('prod-transport-fields')?.classList.toggle('hidden', !tEnabled);
        document.getElementById('prod-long-desc').value = (prod.features || []).join(', ');
        const prodTagsEl = document.getElementById('prod-tags');
        if (prodTagsEl) {
            let customTags = [];
            if (Array.isArray(prod.tags) && prod.tags.length > 0) {
                customTags = prod.tags.filter(t => t !== 'Custom');
            } else {
                if (prod.isPremium) customTags.push('Premium');
                if (prod.decorationService) customTags.push('Dekoration');
                if (prod.category && !['Neu', 'Katalog'].includes(prod.category)) customTags.push(prod.category);
            }
            prodTagsEl.value = customTags.join(', ');
        }
        document.getElementById('prod-target').value = prod.target || 'shop';
        document.getElementById('prod-visible').checked = prod.visible !== false;
        
        const premiumCheckbox = document.getElementById('prod-premium');
        if(premiumCheckbox) premiumCheckbox.checked = !!prod.isPremium;
        
        
        const existingImagesContainer = document.getElementById('prod-existing-images');
        if (existingImagesContainer) {
            existingImagesContainer.innerHTML = '';
            let images = prod.images || [];
            if (images.length === 0 && prod.img) images = [prod.img]; // fallback for older products
            
            images.forEach(imgUrl => {
                existingImagesContainer.innerHTML += `<img src="${imgUrl}" class="w-16 h-16 object-cover rounded shadow-sm border border-gray-200">`;
            });
            if (images.length > 0) {
                document.getElementById('prod-image-status').textContent = 'Bilder sind bereits vorhanden. Lade neue hoch, um diese zu ignorieren, oder lasse das Feld leer, um die alten zu behalten.';
            }
        }
        
        const slotEl = document.getElementById('prod-featured-slot');
        if (slotEl) {
            let curSlot = -1;
            if (window.getFeaturedSlotForItem) {
                curSlot = window.getFeaturedSlotForItem(prod.target || 'shop', id);
                if (curSlot === -1 && prod.legacyId) {
                    curSlot = window.getFeaturedSlotForItem(prod.target || 'shop', prod.legacyId);
                }
            }
            slotEl.value = curSlot >= 0 ? String(curSlot) : '';
        }

        const modal = document.getElementById('product-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    };
    
        document.querySelectorAll('.edit-prod-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                window.openEditProductModal(e.target.dataset.id);
            });
        });

        document.querySelectorAll('.stock-adjust-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const prod = window.currentProducts[id];
                const raw = prompt('Neuen Bestand eingeben:', String(Number(prod.stock || 0)));
                if (raw === null) return;
                const nextStock = Number.parseInt(raw, 10);
                if (!Number.isInteger(nextStock) || nextStock < 0) return alert('Bitte eine ganze Zahl ab 0 eingeben.');
                await window.firebaseUpdateDoc(window.firebaseDoc(window.db, 'custom_products', id), {
                    stock: nextStock,
                    updatedAt: window.firebaseServerTimestamp(),
                    stockLastChangedBy: window.currentUserId || null,
                    stockLastChangedAt: window.firebaseServerTimestamp()
                });
                await window.firebaseAddDoc(window.firebaseCollection(window.db, 'stock_movements'), {
                    productId: id, previousStock: Number(prod.stock || 0), newStock: nextStock,
                    delta: nextStock - Number(prod.stock || 0), reason: 'manual',
                    createdBy: window.currentUserId || null, createdAt: window.firebaseServerTimestamp()
                });
            });
        });

        document.querySelectorAll('.delete-prod-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                if (confirm('Möchten Sie dieses Produkt wirklich löschen?')) {
                    const id = e.target.dataset.id;
                    try {
                        await window.firebaseDeleteDoc(window.firebaseDoc(window.db, "custom_products", id));
                    } catch (error) {
                        console.error("Error deleting product: ", error);
                        alert('Fehler beim Löschen.');
                    }
                }
            });
        });
    });
}


// Refund Order Function (Stripe Integration)
window.refundOrder = function(orderId, amount) {
    if (window.showCustomConfirm) {
        window.showCustomConfirm(
            'Rückerstattung veranlassen',
            `Möchten Sie diese Bestellung (${amount} €) wirklich erstatten? Der Betrag wird dem Kunden über Stripe zurückgezahlt und die Bestellung wird sofort aus den Einnahmen entfernt.`,
            () => executeOrderRefund(orderId)
        );
    } else {
        if (confirm(`Möchten Sie diese Bestellung (${amount} €) wirklich über Stripe erstatten?`)) {
            executeOrderRefund(orderId);
        }
    }
};

async function executeOrderRefund(orderId) {
    try {
        if (window.showCustomAlert) window.showCustomAlert('Verarbeite...', 'Rückerstattung wird über Stripe ausgeführt...');
        const user = window.auth?.currentUser;
        const token = user ? await user.getIdToken() : '';
        
        const response = await fetch('https://us-central1-selena-events-dashboard.cloudfunctions.net/refundStripeOrder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ orderId: orderId })
        });
        
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || 'Rückerstattung fehlgeschlagen');
        }
        
        if (window.showCustomAlert) {
            window.showCustomAlert('Erfolg', 'Die Rückerstattung wurde erfolgreich über Stripe verbucht und die Einnahmen aktualisiert.');
        } else {
            alert('Die Rückerstattung wurde erfolgreich ausgeführt!');
        }
    } catch (err) {
        console.error('Refund failed:', err);
        if (window.showCustomAlert) {
            window.showCustomAlert('Fehler', 'Rückerstattung fehlgeschlagen: ' + err.message);
        } else {
            alert('Fehler: ' + err.message);
        }
    }
}

// --- INQUIRY REPLY MODAL & LOGIC ---
window.openReplyModal = function(msgId) {
    const msg = (window.allMessages || []).find(m => m.id === msgId);
    if (!msg) return;
    
    const modal = document.getElementById('inquiry-reply-modal');
    if (!modal) return;
    
    const customerName = msg.customerName || msg.name || ((msg.firstName || '') + ' ' + (msg.lastName || '')).trim() || 'Kunde';
    
    document.getElementById('reply-message-id').value = msg.id;
    document.getElementById('reply-customer-email').value = msg.customerEmail || msg.email || '';
    document.getElementById('reply-customer-name').value = customerName;
    document.getElementById('reply-original-text').value = msg.message || '';
    
    document.getElementById('reply-recipient-display').textContent = `${customerName} (${msg.email || 'Keine E-Mail'})`;
    document.getElementById('reply-original-preview').textContent = msg.message || 'Keine Nachricht hinterlegt.';
    document.getElementById('reply-content-input').value = '';
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        const box = modal.querySelector('.transform');
        if (box) {
            box.classList.remove('scale-95');
            box.classList.add('scale-100');
        }
        document.getElementById('reply-content-input')?.focus();
    }, 10);
};

window.closeReplyModal = function() {
    const modal = document.getElementById('inquiry-reply-modal');
    if (!modal) return;
    modal.classList.add('opacity-0');
    const box = modal.querySelector('.transform');
    if (box) {
        box.classList.remove('scale-100');
        box.classList.add('scale-95');
    }
    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
};

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('close-reply-modal-btn')?.addEventListener('click', window.closeReplyModal);
    document.getElementById('cancel-reply-btn')?.addEventListener('click', window.closeReplyModal);
    
    document.getElementById('inquiry-reply-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('send-reply-submit-btn');
        const originalBtnText = submitBtn.innerHTML;
        
        const messageId = document.getElementById('reply-message-id').value;
        const customerEmail = document.getElementById('reply-customer-email').value;
        const customerName = document.getElementById('reply-customer-name').value;
        const originalMessage = document.getElementById('reply-original-text').value;
        const replyText = document.getElementById('reply-content-input').value.trim();
        
        if (!replyText || !customerEmail) return;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Wird gesendet...</span>';
            
            const user = window.auth?.currentUser;
            const token = user ? await user.getIdToken() : '';
            
            const response = await fetch('https://us-central1-selena-events-dashboard.cloudfunctions.net/sendInquiryReply', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify({
                    messageId,
                    customerEmail,
                    customerName,
                    originalMessage,
                    replyText
                })
            });
            
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || 'Fehler beim Senden der Antwort');
            }
            
            window.closeReplyModal();
            if (window.showCustomAlert) {
                window.showCustomAlert('Erfolg', 'Die Antwort wurde erfolgreich per E-Mail an ' + customerEmail + ' gesendet.');
            } else {
                alert('Antwort erfolgreich gesendet!');
            }
            
            const targetMsg = (window.allMessages || []).find(m => m.id === messageId);
            if (targetMsg) {
                targetMsg.status = 'In Bearbeitung';
                targetMsg.replyText = replyText;
                targetMsg.repliedAt = { toDate: () => new Date() };
                if (window.renderFilteredMessages) window.renderFilteredMessages();
            }
        } catch (err) {
            console.error('Send reply error:', err);
            if (window.showCustomAlert) {
                window.showCustomAlert('Fehler', 'Antwort konnte nicht gesendet werden: ' + err.message);
            } else {
                alert('Fehler: ' + err.message);
            }
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
});


// ==============================================================================

// ORDERS SEARCH & FILTER ENGINE (SHOP & VERLEIH)
// ==============================================================================
window.activeOrderFilters = window.activeOrderFilters || {
    shop: { status: 'all', search: '', sort: 'date_desc', dateFrom: '', dateTo: '' },
    verleih: { status: 'all', search: '', sort: 'date_desc', dateFrom: '', dateTo: '' }
};

window.renderFilteredOrders = function(type) {
    if (!window.allOrders) return;
    const container = document.getElementById(type + '-orders-list');
    const counterEl = document.getElementById(type + '-filter-count');
    const resetBtn = document.getElementById('reset-' + type + '-filters');
    if (!container) return;

    if (!window.activeOrderFilters[type]) {
        window.activeOrderFilters[type] = { status: 'all', search: '', sort: 'date_desc', dateFrom: '', dateTo: '' };
    }
    const filters = window.activeOrderFilters[type];
    
    // Read input values directly from DOM if present
    const searchInput = document.getElementById('search-' + type);
    const sortSelect = document.getElementById('sort-' + type);
    const dateFromInput = document.getElementById('date-from-' + type);
    const dateToInput = document.getElementById('date-to-' + type);

    if (searchInput) filters.search = searchInput.value.trim().toLowerCase();
    if (sortSelect) filters.sort = sortSelect.value;
    if (dateFromInput) filters.dateFrom = dateFromInput.value;
    if (dateToInput) filters.dateTo = dateToInput.value;

    const allTypeOrders = window.allOrders.filter(o => o.type === type);
    
    // Check if any filter is active
    const isFiltered = filters.status !== 'all' || filters.search !== '' || filters.dateFrom !== '' || filters.dateTo !== '';
    if (resetBtn) {
        if (isFiltered) {
            resetBtn.classList.remove('hidden');
        } else {
            resetBtn.classList.add('hidden');
        }
    }

    let filtered = allTypeOrders.filter(order => {
        const isRef = order.status === 'Erstattet' || order.isRefunded === true;
        const isAbg = order.status === 'Abgebrochen' || order.status === 'Storniert' || order.status === 'Zahlung Ausstehend (Stripe)';
        const isPaid = !isRef && !isAbg && (order.status === 'Bezahlt' || order.status === 'Angesehen' || order.status === 'Neu' || order.paymentMethod === 'stripe' || order.paid === true || (order.totalPrice > 0));

        // 1. Status Filter
        if (filters.status === 'bezahlt') {
            if (!isPaid) return false;
        } else if (filters.status === 'erstattet') {
            if (!isRef) return false;
        } else if (filters.status === 'abgebrochen') {
            if (!isAbg) return false;
        } else if (filters.status === 'neu') {
            if (order.status !== 'Neu') return false;
        } else if (filters.status === 'angesehen') {
            if (order.status !== 'Angesehen') return false;
        }

        // 2. Search Keyword Filter
        if (filters.search) {
            const term = filters.search;
            const name = (order.customerName || '').toLowerCase();
            const email = (order.customerEmail || '').toLowerCase();
            const phone = (order.customerPhone || '').toLowerCase();
            const address = (order.customerAddress || '').toLowerCase();
            const itemsStr = order.items ? order.items.map(it => (it.title || it.name || '')).join(' ').toLowerCase() : '';
            const combined = `${name} ${email} ${phone} ${address} ${itemsStr}`;
            if (!combined.includes(term)) return false;
        }

        // 3. Date Range Filter
        if (filters.dateFrom || filters.dateTo) {
            let orderDate = null;
            if (order.createdAt && typeof order.createdAt.toDate === 'function') {
                orderDate = order.createdAt.toDate();
            } else if (order.createdAt && order.createdAt.seconds) {
                orderDate = new Date(order.createdAt.seconds * 1000);
            } else if (order.rentalDate) {
                orderDate = new Date(order.rentalDate);
            }
            if (orderDate) {
                if (filters.dateFrom) {
                    const fromDate = new Date(filters.dateFrom + 'T00:00:00');
                    if (orderDate < fromDate) return false;
                }
                if (filters.dateTo) {
                    const toDate = new Date(filters.dateTo + 'T23:59:59');
                    if (orderDate > toDate) return false;
                }
            }
        }

        return true;
    });

    // 4. Sort
    filtered.sort((a, b) => {
        const getMs = (o) => {
            if (o.createdAt && typeof o.createdAt.toDate === 'function') return o.createdAt.toDate().getTime();
            if (o.createdAt && o.createdAt.seconds) return o.createdAt.seconds * 1000;
            if (o.rentalDate) return new Date(o.rentalDate).getTime();
            return 0;
        };
        const getPrice = (o) => (typeof o.totalPrice === 'number' ? o.totalPrice : 0);

        if (filters.sort === 'date_desc') return getMs(b) - getMs(a);
        if (filters.sort === 'date_asc') return getMs(a) - getMs(b);
        if (filters.sort === 'price_desc') return getPrice(b) - getPrice(a);
        if (filters.sort === 'price_asc') return getPrice(a) - getPrice(b);
        return 0;
    });

    // Update Counter
    if (counterEl) {
        counterEl.textContent = `${filtered.length} von ${allTypeOrders.length} Bestellungen angezeigt`;
    }

    // Render Cards
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
                <p class="text-sm font-semibold text-gray-700">Keine passenden Bestellungen gefunden</p>
                <p class="text-xs text-gray-500 mt-1">Überprüfen Sie Ihre Suchbegriffe oder setzen Sie den Status-Filter zurück.</p>
                <button type="button" onclick="window.resetOrderFilters('${type}')" class="mt-3 inline-block px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                    Filter zurücksetzen
                </button>
            </div>
        `;
        return;
    }

    const role = window.currentUserRole || 'owner';
    window.openedOrders = window.openedOrders || new Set();

    container.innerHTML = filtered.map(data => {
        let dateStr = 'Unbekannt';
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            const d = data.createdAt.toDate();
            dateStr = d.toLocaleDateString('de-DE') + ' ' + d.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
        } else if (data.createdAt && data.createdAt.seconds) {
            const d = new Date(data.createdAt.seconds * 1000);
            dateStr = d.toLocaleDateString('de-DE') + ' ' + d.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
        } else if (data.rentalDate) {
            dateStr = 'Mietdatum: ' + data.rentalDate;
        }

        const badge = data.type === 'shop' 
            ? '<span class="bg-blue-100 text-blue-800 text-xs font-medium mr-1.5 px-2.5 py-0.5 rounded">🛍️ Shop</span>'
            : '<span class="bg-purple-100 text-purple-800 text-xs font-medium mr-1.5 px-2.5 py-0.5 rounded">🎈 Verleih</span>';
            
        const isRefundedOrder = data.status === 'Erstattet' || data.isRefunded === true;
        const isCancelled = data.status === 'Abgebrochen' || data.status === 'Storniert' || data.status === 'Zahlung Ausstehend (Stripe)';
        
        let statusBadge = '';
        if (isRefundedOrder) {
            statusBadge = `<span class="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-md font-bold uppercase tracking-wider">Erstattet</span>`;
        } else if (isCancelled) {
            statusBadge = `<span class="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-md font-medium">Abgebrochen</span>`;
        } else {
            // Paid order
            const isUnread = data.status === 'Neu';
            statusBadge = `
                <span class="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-md font-bold">🟢 Bezahlt</span>
                ${isUnread 
                    ? `<span class="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase ml-1">Neu</span>`
                    : `<span class="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded font-medium ml-1">Angesehen</span>`
                }
            `;
        }
            
        const priceHtml = isRefundedOrder
            ? `<div class="text-right"><span class="font-serif text-gray-400 line-through text-sm mr-1">${role === 'owner' ? (data.totalPrice || 0) + ' €' : '*** €'}</span><span class="text-red-600 text-xs font-bold uppercase block">Erstattet</span></div>`
            : `<span class="font-serif text-gold font-medium text-base">${role === 'owner' ? (data.totalPrice || 0) + ' €' : '*** €'}</span>`;

        const isHidden = window.openedOrders.has(data._id) ? '' : 'hidden';

        return `
            <div class="border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white cursor-pointer overflow-hidden">
                <div class="p-4" onclick="if(window.openedOrders.has('${data._id}')){window.openedOrders.delete('${data._id}')}else{window.openedOrders.add('${data._id}')}; this.nextElementSibling.classList.toggle('hidden'); if(window.markOrderAsRead) window.markOrderAsRead('${data._id}', '${data.status || 'Neu'}');">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex flex-wrap items-center gap-1.5">
                            ${badge}
                            <span class="font-bold text-gray-900 text-sm">${esc(data.customerName || 'Gast')}</span>
                            ${statusBadge}
                        </div>
                        ${priceHtml}
                    </div>
                    <div class="text-xs text-gray-500 flex flex-wrap items-center gap-3 mt-1">
                        <span>📅 ${dateStr}</span>
                        ${data.rentalDate ? `<span class="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">🎈 Mietdatum: ${data.rentalDate}</span>` : ''}
                        ${data.customerEmail ? `<span class="text-gray-400">✉️ ${esc(data.customerEmail)}</span>` : ''}
                    </div>
                </div>
                <div class="${isHidden} px-4 pb-4 text-xs border-t border-gray-100 bg-gray-50">
                    <div class="pt-3 space-y-2">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-gray-200">
                            <div><strong class="text-gray-500 uppercase tracking-wider text-[10px] block">E-Mail:</strong> ${esc(data.customerEmail || 'Nicht angegeben')}</div>
                            <div><strong class="text-gray-500 uppercase tracking-wider text-[10px] block">Telefon:</strong> ${esc(data.customerPhone || 'Nicht angegeben')}</div>
                            <div><strong class="text-gray-500 uppercase tracking-wider text-[10px] block">Lieferadresse:</strong> ${esc(data.customerAddress || 'Nicht angegeben')}</div>
                        </div>
                        <div class="bg-white p-3 rounded-lg border border-gray-200">
                            <strong class="text-gray-500 uppercase tracking-wider text-[10px] block mb-1">Bestellte Artikel:</strong>
                            ${data.items ? data.items.map(item => `<div class="text-gray-700 py-0.5">• <strong>${item.quantity}x</strong> ${esc(item.title || item.name || 'Artikel')} ${item.price ? '(' + item.price + ' €)' : ''}</div>`).join('') : '<span class="text-gray-500">Keine Artikel</span>'}
                        </div>
                        ${data.notes ? `<div class="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-amber-900"><strong class="block text-[10px] uppercase">Kundenanmerkung:</strong> ${esc(data.notes)}</div>` : ''}
                        <div class="pt-2 flex justify-between items-center">
                            ${isRefundedOrder 
                                ? `<span class="text-xs font-semibold text-red-600 italic">Diese Bestellung wurde erstattet.</span>`
                                : (role === 'owner' || role === 'dev')
                                ? `<button onclick="event.stopPropagation(); window.refundOrder('${data._id}', '${data.totalPrice || 0}')" class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors">Rückerstattung veranlassen (Stripe)</button>`
                                : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
};

window.resetOrderFilters = function(type) {
    window.activeOrderFilters[type] = { status: 'all', search: '', sort: 'date_desc', dateFrom: '', dateTo: '' };
    const searchInput = document.getElementById('search-' + type);
    const sortSelect = document.getElementById('sort-' + type);
    const dateFromInput = document.getElementById('date-from-' + type);
    const dateToInput = document.getElementById('date-to-' + type);
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'date_desc';
    if (dateFromInput) dateFromInput.value = '';
    if (dateToInput) dateToInput.value = '';

    document.querySelectorAll(`.status-filter-btn[data-target-type="${type}"]`).forEach(btn => {
        if (btn.dataset.status === 'all') {
            btn.className = 'status-filter-btn px-3 py-1 text-xs rounded-full font-semibold transition-all bg-gray-900 text-white';
        } else {
            btn.className = 'status-filter-btn px-3 py-1 text-xs rounded-full font-semibold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
    });

    window.renderFilteredOrders(type);
};

// Setup Listeners for Filter Controls
function initOrderFiltersListeners() {
    ['shop', 'verleih', 'messages'].forEach(type => {
        const searchInput = document.getElementById('search-' + type);
        const sortSelect = document.getElementById('sort-' + type);
        const dateFromInput = document.getElementById('date-from-' + type);
        const dateToInput = document.getElementById('date-to-' + type);
        const resetBtn = document.getElementById('reset-' + type + '-filters');

        if (searchInput && !searchInput._bound) {
            searchInput._bound = true;
            searchInput.addEventListener('input', () => window.renderFilteredOrders(type));
        }
        if (sortSelect && !sortSelect._bound) {
            sortSelect._bound = true;
            sortSelect.addEventListener('change', () => window.renderFilteredOrders(type));
        }
        if (dateFromInput && !dateFromInput._bound) {
            dateFromInput._bound = true;
            dateFromInput.addEventListener('change', () => window.renderFilteredOrders(type));
        }
        if (dateToInput && !dateToInput._bound) {
            dateToInput._bound = true;
            dateToInput.addEventListener('change', () => window.renderFilteredOrders(type));
        }
        if (resetBtn && !resetBtn._bound) {
            resetBtn._bound = true;
            resetBtn.addEventListener('click', () => {
                if (type === 'messages') window.resetMessageFilters();
                else window.resetOrderFilters(type);
            });
        }
        if (type === 'messages') {
            if (searchInput && !searchInput._boundMsg) { searchInput._boundMsg = true; searchInput.addEventListener('input', () => window.renderFilteredMessages()); }
            if (sortSelect && !sortSelect._boundMsg) { sortSelect._boundMsg = true; sortSelect.addEventListener('change', () => window.renderFilteredMessages()); }
            if (dateFromInput && !dateFromInput._boundMsg) { dateFromInput._boundMsg = true; dateFromInput.addEventListener('change', () => window.renderFilteredMessages()); }
            if (dateToInput && !dateToInput._boundMsg) { dateToInput._boundMsg = true; dateToInput.addEventListener('change', () => window.renderFilteredMessages()); }
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initOrderFiltersListeners);
} else {
    initOrderFiltersListeners();
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.status-filter-btn');
    if (btn) {
        const type = btn.dataset.targetType;
        const status = btn.dataset.status;
        if (!type) return;

        if (type === 'messages') {
            window.activeMessageFilters.status = status;
            document.querySelectorAll(`.status-filter-btn[data-target-type="${type}"]`).forEach(b => {
                if (b === btn) {
                    b.className = 'status-filter-btn px-3 py-1 text-xs rounded-full font-semibold transition-all bg-gray-900 text-white';
                } else {
                    b.className = 'status-filter-btn px-3 py-1 text-xs rounded-full font-semibold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200';
                }
            });
            window.renderFilteredMessages();
            return;
        }

        if (!window.activeOrderFilters[type]) window.activeOrderFilters[type] = {};
        window.activeOrderFilters[type].status = status;

        document.querySelectorAll(`.status-filter-btn[data-target-type="${type}"]`).forEach(b => {
            if (b === btn) {
                b.className = 'status-filter-btn px-3 py-1 text-xs rounded-full font-semibold transition-all bg-gray-900 text-white';
            } else {
                b.className = 'status-filter-btn px-3 py-1 text-xs rounded-full font-semibold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200';
            }
        });

        window.renderFilteredOrders(type);
    }
});



// ==============================================================================
// MESSAGES SEARCH, FILTER & ERLEDIGT TOGGLE ENGINE
// ==============================================================================
window.activeMessageFilters = window.activeMessageFilters || {
    status: 'all', search: '', sort: 'date_desc', dateFrom: '', dateTo: ''
};

window.renderMessagesList = function() {
    window.renderFilteredMessages();
};

window.toggleMessageErledigt = async function(msgId, currentStatus) {
    const nextStatus = currentStatus === 'Erledigt' ? 'In Bearbeitung' : 'Erledigt';
    
    // Update local cache immediately
    if (window.allMessages) {
        const found = window.allMessages.find(m => m.id === msgId);
        if (found) found.status = nextStatus;
    }
    window.renderFilteredMessages();

    try {
        await window.firebaseUpdateDoc(window.firebaseDoc(window.db, "messages", msgId), {
            status: nextStatus,
            statusUpdatedAt: window.firebaseServerTimestamp(),
            statusUpdatedBy: window.auth?.currentUser?.uid || 'admin'
        });
    } catch(err) {
        console.error("Error updating message status:", err);
        if (window.showCustomAlert) window.showCustomAlert('Fehler', 'Konnte Status nicht aktualisieren: ' + err.message);
    }
};

window.markMessageAsRead = async function(msgId, currentStatus) {
    if (currentStatus === 'Neu' || !currentStatus) {
        if (window.allMessages) {
            const found = window.allMessages.find(m => m.id === msgId);
            if (found) found.status = 'Angesehen';
        }
        window.renderFilteredMessages();
        try {
            await window.firebaseUpdateDoc(window.firebaseDoc(window.db, "messages", msgId), {
                status: 'Angesehen'
            });
        } catch(e) { console.error("Error marking msg as read:", e); }
    }
};

window.markAllMessagesAsRead = async function() {
    if (!window.allMessages || window.allMessages.length === 0) return;
    try {
        const promises = window.allMessages
            .filter(m => m.status === 'Neu' || !m.status)
            .map(m => window.firebaseUpdateDoc(window.firebaseDoc(window.db, "messages", m.id), { status: 'Angesehen' }));
        await Promise.all(promises);
        window.allMessages.forEach(m => {
            if (m.status === 'Neu' || !m.status) m.status = 'Angesehen';
        });
        window.renderFilteredMessages();
        if (window.showCustomAlert) window.showCustomAlert('Erfolg', 'Alle neuen Nachrichten wurden als angesehen markiert.');
    } catch(e) {
        console.error("Error marking all messages as read:", e);
    }
};

window.onMessageCheckboxChange = function() {
    if (window.updateBulkDeleteButton) window.updateBulkDeleteButton();
};

window.onSelectAllMessagesChange = function(masterCheckbox) {
    const isChecked = masterCheckbox ? masterCheckbox.checked : false;
    const checkboxes = document.querySelectorAll('.message-select-checkbox');
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
    });
    if (window.updateBulkDeleteButton) window.updateBulkDeleteButton();
};

window.updateBulkDeleteButton = function() {
    const checkboxes = Array.from(document.querySelectorAll('.message-select-checkbox'));
    const checked = checkboxes.filter(cb => cb.checked);
    const bulkBtn = document.getElementById('btn-bulk-delete-messages');
    const countSpan = document.getElementById('bulk-selected-count');
    const masterCb = document.getElementById('select-all-messages');

    if (countSpan) countSpan.textContent = checked.length;

    if (bulkBtn) {
        if (checked.length > 0) {
            bulkBtn.classList.remove('hidden');
        } else {
            bulkBtn.classList.add('hidden');
        }
    }

    if (masterCb) {
        if (checkboxes.length === 0) {
            masterCb.checked = false;
            masterCb.indeterminate = false;
        } else {
            masterCb.checked = checked.length === checkboxes.length;
            masterCb.indeterminate = checked.length > 0 && checked.length < checkboxes.length;
        }
    }
};

window.bulkDeleteMessages = function() {
    const checkboxes = Array.from(document.querySelectorAll('.message-select-checkbox:checked'));
    const selectedIds = checkboxes.map(cb => cb.dataset.id).filter(Boolean);
    if (selectedIds.length === 0) return;

    const confirmMsg = `Möchten Sie wirklich ${selectedIds.length} ausgewählte Nachricht(en) unwiderruflich löschen?`;
    const confirmFn = window.showCustomConfirm || ((title, msg, cb) => { if (confirm(msg)) cb(); });

    confirmFn('Ausgewählte löschen', confirmMsg, async () => {
        try {
            // 1. Optimistic fade-out animation on all selected cards
            selectedIds.forEach(id => {
                const cards = document.querySelectorAll(`[data-message-card-id="${id}"]`);
                cards.forEach(card => {
                    card.style.transition = 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)';
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    card.style.maxHeight = '0px';
                    card.style.paddingTop = '0px';
                    card.style.paddingBottom = '0px';
                    card.style.marginTop = '0px';
                    card.style.marginBottom = '0px';
                    card.style.overflow = 'hidden';
                });
            });

            // 2. Batch delete in chunks of 450 (Firestore limit 500)
            if (window.db && window.firebaseWriteBatch && window.firebaseDoc) {
                const chunkSize = 450;
                for (let i = 0; i < selectedIds.length; i += chunkSize) {
                    const chunk = selectedIds.slice(i, i + chunkSize);
                    const batch = window.firebaseWriteBatch(window.db);
                    chunk.forEach(id => {
                        batch.delete(window.firebaseDoc(window.db, 'messages', id));
                    });
                    await batch.commit();
                }
            } else if (window.db && window.firebaseDeleteDoc && window.firebaseDoc) {
                await Promise.all(selectedIds.map(id => window.firebaseDeleteDoc(window.firebaseDoc(window.db, 'messages', id))));
            }

            // 3. Update local in-memory lists
            if (window.allMessages) {
                window.allMessages = window.allMessages.filter(m => !selectedIds.includes(m.id));
            }
            if (window.openedMessages) {
                selectedIds.forEach(id => window.openedMessages.delete(id));
            }

            setTimeout(() => {
                if (window.renderFilteredMessages) window.renderFilteredMessages();
                if (window.updateBulkDeleteButton) window.updateBulkDeleteButton();
                if (window.updateNotificationBadges) window.updateNotificationBadges();
            }, 350);

            if (window.showCustomAlert) {
                window.showCustomAlert('Gelöscht', `${selectedIds.length} Nachricht(en) wurden erfolgreich gelöscht.`);
            }
        } catch(err) {
            console.error('Error during bulk delete:', err);
            if (window.renderFilteredMessages) window.renderFilteredMessages();
            alert('Fehler beim Löschen der Nachrichten: ' + (err.message || err));
        }
    });
};

window.renderFilteredMessages = function() {
    if (!window.allMessages) return;
    const container = document.getElementById('messages-list');
    const counterEl = document.getElementById('messages-filter-count');
    const resetBtn = document.getElementById('reset-messages-filters');
    if (!container) return;

    const filters = window.activeMessageFilters;
    
    // Read input values
    const searchInput = document.getElementById('search-messages');
    const sortSelect = document.getElementById('sort-messages');
    const dateFromInput = document.getElementById('date-from-messages');
    const dateToInput = document.getElementById('date-to-messages');

    if (searchInput) filters.search = searchInput.value.trim().toLowerCase();
    if (sortSelect) filters.sort = sortSelect.value;
    if (dateFromInput) filters.dateFrom = dateFromInput.value;
    if (dateToInput) filters.dateTo = dateToInput.value;

    const isFiltered = filters.status !== 'all' || filters.search !== '' || filters.dateFrom !== '' || filters.dateTo !== '';
    if (resetBtn) {
        if (isFiltered) resetBtn.classList.remove('hidden');
        else resetBtn.classList.add('hidden');
    }

    let filtered = window.allMessages.filter(msg => {
        const rawStatus = msg.status || 'Neu';
        const isNeu = rawStatus === 'Neu';
        const isAngesehen = rawStatus === 'Angesehen';
        const isInBearbeitung = rawStatus === 'In Bearbeitung' || rawStatus === 'Beantwortet';
        const isErledigt = rawStatus === 'Erledigt';

        // 1. Status Filter
        if (filters.status === 'neu') {
            if (!isNeu) return false;
        } else if (filters.status === 'angesehen') {
            if (!isAngesehen) return false;
        } else if (filters.status === 'in_bearbeitung') {
            if (!isInBearbeitung) return false;
        } else if (filters.status === 'erledigt') {
            if (!isErledigt) return false;
        }

        // 2. Search Keyword Filter
        if (filters.search) {
            const term = filters.search;
            const name = (msg.customerName || msg.name || ((msg.firstName || '') + ' ' + (msg.lastName || ''))).toLowerCase();
            const email = (msg.customerEmail || msg.email || '').toLowerCase();
            const phone = (msg.customerPhone || msg.phone || '').toLowerCase();
            const location = (msg.location || msg.eventLocation || '').toLowerCase();
            const art = (msg.art || msg.eventType || '').toLowerCase();
            const subject = (msg.subject || '').toLowerCase();
            const message = (msg.message || '').toLowerCase();
            const reply = (msg.replyText || '').toLowerCase();
            const combined = `${name} ${email} ${phone} ${location} ${art} ${subject} ${message} ${reply}`;
            if (!combined.includes(term)) return false;
        }

        // 3. Date Range Filter
        if (filters.dateFrom || filters.dateTo) {
            let msgDate = null;
            if (msg.createdAt && typeof msg.createdAt.toDate === 'function') {
                msgDate = msg.createdAt.toDate();
            } else if (msg.createdAt && msg.createdAt.seconds) {
                msgDate = new Date(msg.createdAt.seconds * 1000);
            }
            if (msgDate) {
                if (filters.dateFrom) {
                    const fromDate = new Date(filters.dateFrom + 'T00:00:00');
                    if (msgDate < fromDate) return false;
                }
                if (filters.dateTo) {
                    const toDate = new Date(filters.dateTo + 'T23:59:59');
                    if (msgDate > toDate) return false;
                }
            }
        }

        return true;
    });

    // 4. Sort
    filtered.sort((a, b) => {
        const getMs = (o) => {
            if (o.createdAt && typeof o.createdAt.toDate === 'function') return o.createdAt.toDate().getTime();
            if (o.createdAt && o.createdAt.seconds) return o.createdAt.seconds * 1000;
            return 0;
        };
        if (filters.sort === 'date_desc') return getMs(b) - getMs(a);
        if (filters.sort === 'date_asc') return getMs(a) - getMs(b);
        return 0;
    });

    // Update Counter
    if (counterEl) {
        counterEl.textContent = `${filtered.length} von ${window.allMessages.length} Nachrichten angezeigt`;
    }

    // Render Cards
    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center">
                <p class="text-sm font-semibold text-gray-700">Keine passenden Nachrichten gefunden</p>
                <p class="text-xs text-gray-500 mt-1">Überprüfen Sie Ihre Suchbegriffe oder setzen Sie den Status-Filter zurück.</p>
                <button type="button" onclick="window.resetMessageFilters()" class="mt-3 inline-block px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                    Filter zurücksetzen
                </button>
            </div>
        `;
        if (window.updateBulkDeleteButton) window.updateBulkDeleteButton();
        return;
    }

    window.openedMessages = window.openedMessages || new Set();

    container.innerHTML = filtered.map(data => {
        let dateStr = 'Unbekannt';
        if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            const d = data.createdAt.toDate();
            dateStr = d.toLocaleDateString('de-DE') + ' ' + d.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
        } else if (data.createdAt && data.createdAt.seconds) {
            const d = new Date(data.createdAt.seconds * 1000);
            dateStr = d.toLocaleDateString('de-DE') + ' ' + d.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
        }

        const rawStatus = data.status || 'Neu';
        let statusBadge = '';
        if (rawStatus === 'Erledigt') {
            statusBadge = `<span class="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-md font-bold">🟢 Erledigt</span>`;
        } else if (rawStatus === 'In Bearbeitung' || rawStatus === 'Beantwortet') {
            statusBadge = `<span class="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-md font-bold">🟡 In Bearbeitung</span>`;
        } else if (rawStatus === 'Angesehen') {
            statusBadge = `<span class="bg-gray-200 text-gray-700 text-xs px-2.5 py-1 rounded-md font-medium">⚪ Angesehen</span>`;
        } else {
            statusBadge = `<span class="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-md font-bold">🔴 Neu</span>`;
        }

        const senderName = data.customerName || data.name || ((data.firstName || '') + ' ' + (data.lastName || '')).trim() || 'Unbekannter Absender';
        const senderEmail = data.customerEmail || data.email || 'Keine E-Mail angegeben';
        const senderPhone = data.customerPhone || data.phone || 'Keine Angabe';
        const eventLoc = data.location || data.eventLocation || '';
        const eventDate = data.eventDate || data.datum || '';
        const eventType = data.art || data.eventType || '';

        const isErledigt = rawStatus === 'Erledigt';
        const isHidden = window.openedMessages.has(data.id) ? '' : 'hidden';

        return `
            <div data-message-card-id="${data.id}" class="border border-gray-200 rounded-xl hover:shadow-md transition-all bg-white cursor-pointer overflow-hidden">
                <div class="p-4" onclick="if(window.openedMessages.has('${data.id}')){window.openedMessages.delete('${data.id}')}else{window.openedMessages.add('${data.id}')}; this.nextElementSibling.classList.toggle('hidden'); if(window.markMessageAsRead) window.markMessageAsRead('${data.id}', '${data.status || 'Neu'}');">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <div class="flex items-center" onclick="event.stopPropagation();">
                                <input type="checkbox" class="message-select-checkbox rounded border-gray-300 text-gold focus:ring-gold h-4 w-4 cursor-pointer" data-id="${data.id}" onchange="window.onMessageCheckboxChange();">
                            </div>
                            <span class="bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-0.5 rounded">✉️ Anfrage</span>
                            <span class="font-bold text-gray-900 text-sm">${esc(senderName)}</span>
                            ${statusBadge}
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-400">${dateStr}</span>
                            <button type="button" title="Nachricht löschen" onclick="event.stopPropagation(); window.deleteMessage('${data.id}')" class="btn-delete-msg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </div>
                    </div>
                    <div class="text-xs text-gray-600 line-clamp-1 mb-1 pl-6">
                        <strong>${esc(data.subject || 'Kontaktanfrage')}:</strong> ${esc(data.message || '')}
                    </div>
                    <div class="text-[11px] text-gray-400 flex flex-wrap items-center gap-3 pl-6">
                        <span>✉️ ${esc(senderEmail)}</span>
                        ${eventLoc ? `<span class="bg-gray-100 px-2 py-0.5 rounded text-gray-600">📍 Ort: ${esc(eventLoc)}</span>` : ''}
                        ${eventDate ? `<span class="bg-gray-100 px-2 py-0.5 rounded text-gray-600">📅 Datum: ${esc(eventDate)}</span>` : ''}
                        ${eventType ? `<span class="bg-gray-100 px-2 py-0.5 rounded text-gray-600">🎉 Art: ${esc(eventType)}</span>` : ''}
                    </div>
                </div>
                <div class="${isHidden} px-4 pb-4 text-xs border-t border-gray-100 bg-gray-50">
                    <div class="pt-3 space-y-3">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-2 bg-white p-3 rounded-lg border border-gray-200">
                            <div><strong class="text-gray-500 uppercase tracking-wider text-[10px] block">E-Mail:</strong> <a href="mailto:${esc(senderEmail)}" class="text-blue-600 hover:underline" onclick="event.stopPropagation()">${esc(senderEmail)}</a></div>
                            <div><strong class="text-gray-500 uppercase tracking-wider text-[10px] block">Telefon:</strong> <a href="tel:${esc(senderPhone)}" class="text-blue-600 hover:underline" onclick="event.stopPropagation()">${esc(senderPhone)}</a></div>
                            <div><strong class="text-gray-500 uppercase tracking-wider text-[10px] block">Event-Details:</strong> ${eventLoc ? 'Ort: ' + esc(eventLoc) + ' | ' : ''}${eventDate ? 'Datum: ' + esc(eventDate) + ' | ' : ''}${eventType ? 'Art: ' + esc(eventType) : '-'}</div>
                        </div>

                        <div class="bg-white p-3 rounded-lg border border-gray-200">
                            <strong class="text-gray-500 uppercase tracking-wider text-[10px] block mb-1">Vollständige Nachricht:</strong>
                            <p class="text-gray-800 whitespace-pre-line text-sm leading-relaxed">${esc(data.message || 'Keine Nachricht')}</p>
                        </div>

                        ${data.replyText ? `
                            <div class="bg-amber-50/70 border border-amber-200 p-3 rounded-lg space-y-1">
                                <div class="flex items-center justify-between">
                                    <strong class="text-amber-900 text-xs flex items-center gap-1.5">
                                        <svg class="w-3.5 h-3.5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                                        Ihre gesendete Antwort per E-Mail:
                                    </strong>
                                </div>
                                <p class="text-gray-800 text-xs whitespace-pre-line pt-1">${esc(data.replyText)}</p>
                            </div>
                        ` : ''}

                        <div class="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-gray-200">
                            <div class="flex items-center gap-2">
                                <button type="button" onclick="event.stopPropagation(); window.openReplyModal('${data.id}')" class="px-4 py-2 bg-gold hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-sm text-xs transition-colors flex items-center gap-1.5">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
                                    ${data.replyText ? 'Erneut antworten' : 'Antworten (E-Mail)'}
                                </button>
                                <button type="button" onclick="event.stopPropagation(); window.deleteMessage('${data.id}')" class="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    <span>Löschen</span>
                                </button>
                            </div>

                            <button type="button" onclick="event.stopPropagation(); window.toggleMessageErledigt('${data.id}', '${rawStatus}')" class="px-4 py-2 rounded-lg font-semibold text-xs transition-all flex items-center gap-1.5 ${isErledigt ? 'bg-green-600 text-white hover:bg-green-700 shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'}">
                                ${isErledigt ? '<span>✓ Als erledigt markiert</span> <span class="text-[10px] opacity-80">(Klicken für In Bearbeitung)</span>' : '<span>Als Erledigt markieren</span>'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (window.updateBulkDeleteButton) window.updateBulkDeleteButton();
};

window.resetMessageFilters = function() {
    window.activeMessageFilters = { status: 'all', search: '', sort: 'date_desc', dateFrom: '', dateTo: '' };
    const searchInput = document.getElementById('search-messages');
    const sortSelect = document.getElementById('sort-messages');
    const dateFromInput = document.getElementById('date-from-messages');
    const dateToInput = document.getElementById('date-to-messages');
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'date_desc';
    if (dateFromInput) dateFromInput.value = '';
    if (dateToInput) dateToInput.value = '';

    document.querySelectorAll('.status-filter-btn[data-target-type="messages"]').forEach(btn => {
        if (btn.dataset.status === 'all') {
            btn.className = 'status-filter-btn px-3 py-1 text-xs rounded-full font-semibold transition-all bg-gray-900 text-white';
        } else {
            btn.className = 'status-filter-btn px-3 py-1 text-xs rounded-full font-semibold transition-all bg-gray-100 text-gray-700 hover:bg-gray-200';
        }
    });

    window.renderFilteredMessages();
};

