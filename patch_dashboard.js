const fs = require('fs');

let content = fs.readFileSync('c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/js/dashboard.js', 'utf-8');

// 1. Add updateNotificationBadges function right after unreadMessagesCount declaration
let initVarsRegex = /window\.unreadMessagesCount = 0;/;
let updateFn = `window.unreadMessagesCount = 0;

window.updateNotificationBadges = function() {
    const uid = window.currentUserId;
    const role = window.currentUserRole;
    if(!uid || !role) return;

    let totalUnread = 0;

    if (role === 'owner' || role === 'dev') {
        const lastReadMsgs = parseInt(localStorage.getItem('lastRead_messages_' + uid) || '0');
        if (window.allMessages) {
            window.allMessages.forEach(msg => {
                if (msg.createdAt && typeof msg.createdAt.toMillis === 'function') {
                    if (msg.createdAt.toMillis() > lastReadMsgs) totalUnread++;
                }
            });
        }

        const lastReadShop = parseInt(localStorage.getItem('lastRead_shop_' + uid) || '0');
        const lastReadVerleih = parseInt(localStorage.getItem('lastRead_verleih_' + uid) || '0');
        if (window.allOrders) {
            window.allOrders.forEach(o => {
                if (o.createdAt && typeof o.createdAt.toMillis === 'function') {
                    if (o.type === 'shop' && o.createdAt.toMillis() > lastReadShop) totalUnread++;
                    if (o.type === 'verleih' && o.createdAt.toMillis() > lastReadVerleih) totalUnread++;
                }
            });
        }
    }

    const lastReadCalendar = parseInt(localStorage.getItem('lastRead_calendar_' + uid) || '0');
    if (window.allOrders) {
        window.allOrders.forEach(o => {
            // Notifications if new event added or helper joined after lastReadCalendar
            const eventTime = (o.lastHelperJoinedAt && typeof o.lastHelperJoinedAt.toMillis === 'function') ? o.lastHelperJoinedAt.toMillis() : 
                              (o.createdAt && typeof o.createdAt.toMillis === 'function' ? o.createdAt.toMillis() : 0);
            if (eventTime > lastReadCalendar) totalUnread++;
        });
    }

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
`;
content = content.replace(initVarsRegex, updateFn);

// 2. Modify fetchMessagesCount to save to window.allMessages and call updateNotificationBadges
let fetchMsgsOld = `window.unreadMessagesCount = snapshot.size;
        
        const elSidebarNotif = document.getElementById('sidebar-notif');
        const elHeaderNotif = document.getElementById('header-notif');
        const totalNotifs = (window.newOrdersCount || 0) + window.unreadMessagesCount;
        
        if (totalNotifs > 0) {
            if (elSidebarNotif) { elSidebarNotif.textContent = totalNotifs; elSidebarNotif.classList.remove('hidden'); }
            if (elHeaderNotif) elHeaderNotif.classList.remove('hidden');
        } else {
            if (elSidebarNotif) elSidebarNotif.classList.add('hidden');
            if (elHeaderNotif) elHeaderNotif.classList.add('hidden');
        }`;
let fetchMsgsNew = `window.unreadMessagesCount = snapshot.size;
        window.updateNotificationBadges();`;
content = content.replace(fetchMsgsOld, fetchMsgsNew);

// 3. Modify updateLists to call updateNotificationBadges instead of old totalNotifs check
let updateListsOld = `window.newOrdersCount = newOrdersCount;
    
    const totalNotifs = (window.newOrdersCount || 0) + (window.unreadMessagesCount || 0);
    
    if (totalNotifs > 0) {
        if (elSidebarNotif) { elSidebarNotif.textContent = totalNotifs; elSidebarNotif.classList.remove('hidden'); }
        if (elHeaderNotif) elHeaderNotif.classList.remove('hidden');
    } else {
        if (elSidebarNotif) elSidebarNotif.classList.add('hidden');
        if (elHeaderNotif) elHeaderNotif.classList.add('hidden');
    }`;
let updateListsNew = `window.newOrdersCount = newOrdersCount;
    window.updateNotificationBadges();`;
content = content.replace(updateListsOld, updateListsNew);

// 4. Also call updateNotificationBadges after window.allOrders is populated (at the end of snapshot.forEach in loadOrdersAndStats)
let loadOrdersOld = `updateLists(newOrdersCount, shopHtml, verleihHtml, latestHtml);`;
let loadOrdersNew = `updateLists(newOrdersCount, shopHtml, verleihHtml, latestHtml);
        window.updateNotificationBadges();`;
content = content.replace(loadOrdersOld, loadOrdersNew);

// 5. Add click listeners to tabs to clear localStorage notifications
let navBtnsOld = `navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {`;
let navBtnsNew = `navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = btn.getAttribute('data-target');
            if(window.currentUserId) {
                if(target === 'messages') localStorage.setItem('lastRead_messages_' + window.currentUserId, Date.now().toString());
                if(target === 'shop') localStorage.setItem('lastRead_shop_' + window.currentUserId, Date.now().toString());
                if(target === 'verleih') localStorage.setItem('lastRead_verleih_' + window.currentUserId, Date.now().toString());
                if(target === 'calendar') localStorage.setItem('lastRead_calendar_' + window.currentUserId, Date.now().toString());
                if(window.updateNotificationBadges) window.updateNotificationBadges();
            }
`;
content = content.replace(navBtnsOld, navBtnsNew);

fs.writeFileSync('c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/js/dashboard.js', content, 'utf-8');
console.log("Dashboard JS patched successfully.");
