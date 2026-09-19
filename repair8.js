const fs = require('fs');

const htmlFile = 'c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/admin-selena-portal-8274.html';
let html = fs.readFileSync(htmlFile, 'utf-8');

html = html.replace('<h2 class="text-2xl font-semibold text-gray-800">Nachrichten</h2>', '<h2 class="text-2xl font-semibold text-gray-800">Nachrichten</h2>\n                    <button onclick="window.markAllMessagesAsRead()" class="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-3 rounded">Alle als Angesehen markieren</button>');
fs.writeFileSync(htmlFile, html, 'utf-8');

const jsFile = 'c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/js/dashboard.js';
let js = fs.readFileSync(jsFile, 'utf-8');

const targetFunc = `window.renderMessagesList = function() {
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
            
            html += \`
                <div class="border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-gray-50/50 cursor-pointer overflow-hidden">
                    <div class="p-4" onclick="this.nextElementSibling.classList.toggle('hidden');">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">✉️ Nachricht</span>
                                <span class="font-medium text-gray-900">\${msg.name || 'Gast'}</span>
                            </div>
                        </div>
                        <div class="text-sm text-gray-500">
                            \${dateStr}
                        </div>
                    </div>
                    <div class="hidden px-4 pb-4 text-sm border-t border-gray-200 bg-gray-100">
                        <div class="pt-3">
                            <p><strong>Email:</strong> \${msg.email || 'Nicht angegeben'}</p>
                            <div class="mt-2 text-gray-700">
                                <strong>Inhalt:</strong>
                                <p class="whitespace-pre-wrap mt-1">\${msg.message || ''}</p>
                            </div>
                            <div class="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                <button onclick="if(window.deleteMessage) window.deleteMessage('\${msg.id}')" class="text-red-600 hover:text-red-900 text-sm font-medium">Löschen</button>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
        });
    } else {
        html = '<p class="text-gray-500 text-sm italic">Keine Nachrichten vorhanden.</p>';
    }
    listEl.innerHTML = html;
};`;

const newFunc = `
window.markMessageAsRead = function(msgId, currentStatus) {
    if ((!currentStatus || currentStatus === 'Neu') && window.db && window.firebaseSetDoc && window.firebaseDoc && (window.currentUserRole === 'owner' || window.currentUserRole === 'dev')) {
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
            
            const statusBadge = msg.status === 'Angesehen' ? \`<span class="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded ml-2">Angesehen</span>\` : \`<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2">Neu</span>\`;
            window.openedMessages = window.openedMessages || new Set();
            const isHidden = window.openedMessages.has(msg.id) ? '' : 'hidden';

            html += \`
                <div class="border border-gray-100 rounded-lg hover:shadow-md transition-shadow bg-gray-50/50 cursor-pointer overflow-hidden">
                    <div class="p-4" onclick="if(window.openedMessages.has('\${msg.id}')){window.openedMessages.delete('\${msg.id}')}else{window.openedMessages.add('\${msg.id}')}; this.nextElementSibling.classList.toggle('hidden'); if(window.markMessageAsRead) window.markMessageAsRead('\${msg.id}', '\${msg.status || 'Neu'}');">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">✉️ Nachricht</span>
                                <span class="font-medium text-gray-900">\${msg.name || 'Gast'}</span>
                                \${statusBadge}
                            </div>
                        </div>
                        <div class="text-sm text-gray-500">
                            \${dateStr}
                        </div>
                    </div>
                    <div class="\${isHidden} px-4 pb-4 text-sm border-t border-gray-200 bg-gray-100">
                        <div class="pt-3">
                            <p><strong>Email:</strong> \${msg.email || 'Nicht angegeben'}</p>
                            <div class="mt-2 text-gray-700">
                                <strong>Inhalt:</strong>
                                <p class="whitespace-pre-wrap mt-1">\${msg.message || ''}</p>
                            </div>
                            <div class="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                                <button onclick="if(window.deleteMessage) window.deleteMessage('\${msg.id}')" class="text-red-600 hover:text-red-900 text-sm font-medium">Löschen</button>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
        });
    } else {
        html = '<p class="text-gray-500 text-sm italic">Keine Nachrichten vorhanden.</p>';
    }
    listEl.innerHTML = html;
};`;

js = js.replace(targetFunc, newFunc);
// bump cache buster
html = html.replace('js/dashboard.js?v=3', 'js/dashboard.js?v=4');
fs.writeFileSync(htmlFile, html, 'utf-8');
fs.writeFileSync(jsFile, js, 'utf-8');
console.log('Added message statuses.');
