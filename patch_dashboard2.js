const fs = require('fs');

let content = fs.readFileSync('c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/js/dashboard.js', 'utf-8');

let oldFetch = `function fetchMessagesCount() {
    if (!window.db) return;
    const q = window.firebaseQuery(window.firebaseCollection(window.db, "messages"));
    window.firebaseOnSnapshot(q, (snapshot) => {
        window.unreadMessagesCount = snapshot.size;
        window.updateNotificationBadges();
    });
}`;

let newFetch = `function fetchMessagesCount() {
    if (!window.db) return;
    const q = window.firebaseQuery(window.firebaseCollection(window.db, "messages"));
    window.firebaseOnSnapshot(q, (snapshot) => {
        window.unreadMessagesCount = snapshot.size;
        window.allMessages = [];
        snapshot.forEach(doc => {
            window.allMessages.push(doc.data());
        });
        window.updateNotificationBadges();
    });
}`;

content = content.replace(oldFetch, newFetch);

fs.writeFileSync('c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/js/dashboard.js', content, 'utf-8');
console.log("Dashboard JS fetch patch applied.");
