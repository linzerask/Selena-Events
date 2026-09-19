const fs = require('fs');

const shopPaths = ['js/shop.js', 'en/js/shop.js', 'ro/js/shop.js'];
const verleihPaths = ['js/verleih.js', 'en/js/verleih.js', 'ro/js/verleih.js'];

const shopFind = `    if (window.currentUser) {
        if (emailField) emailField.value = window.currentUser.email || '';
        if (nameField) nameField.value = window.currentUser.displayName || '';
        if (checkoutAuthPrompt) checkoutAuthPrompt.classList.add('hidden');
        if (checkoutPersonalFields) checkoutPersonalFields.classList.remove('hidden');
    }`;

const shopReplace = `    if (window.currentUser) {
        if (emailField) emailField.value = window.currentUser.email || '';
        if (nameField && window.currentUser.displayName) nameField.value = window.currentUser.displayName;
        if (checkoutAuthPrompt) checkoutAuthPrompt.classList.add('hidden');
        if (checkoutPersonalFields) checkoutPersonalFields.classList.remove('hidden');
        try {
            window.firebaseGetDoc(window.firebaseDoc(window.firebaseDb, "users", window.currentUser.uid)).then(docSnap => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    if (nameField && !nameField.value && userData.name) nameField.value = userData.name;
                    const phoneField = document.getElementById('checkout-phone');
                    if (phoneField && !phoneField.value && userData.phone) phoneField.value = userData.phone;
                    const addressField = document.getElementById('checkout-address');
                    if (addressField && !addressField.value && userData.address) addressField.value = userData.address;
                }
            }).catch(e => console.warn(e));
        } catch(e) {}
    }`;

const verleihFind = `    if (window.currentUser) {
        if (emailField) emailField.value = window.currentUser.email || '';
        if (nameField) nameField.value = window.currentUser.displayName || '';
        if (authPrompt) authPrompt.classList.add('hidden');
        if (nameGroup) nameGroup.classList.remove('hidden');
        if (emailGroup) emailGroup.classList.remove('hidden');
    }`;

const verleihReplace = `    if (window.currentUser) {
        if (emailField) emailField.value = window.currentUser.email || '';
        if (nameField && window.currentUser.displayName) nameField.value = window.currentUser.displayName;
        if (authPrompt) authPrompt.classList.add('hidden');
        if (nameGroup) nameGroup.classList.remove('hidden');
        if (emailGroup) emailGroup.classList.remove('hidden');
        try {
            window.firebaseGetDoc(window.firebaseDoc(window.firebaseDb, "users", window.currentUser.uid)).then(docSnap => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    if (nameField && !nameField.value && userData.name) nameField.value = userData.name;
                    const phoneField = document.getElementById('checkout-phone');
                    if (phoneField && !phoneField.value && userData.phone) phoneField.value = userData.phone;
                    const addressField = document.getElementById('checkout-address');
                    if (addressField && !addressField.value && userData.address) addressField.value = userData.address;
                }
            }).catch(e => console.warn(e));
        } catch(e) {}
    }`;

function doReplace(files, findStr, repStr) {
    for (const f of files) {
        try {
            let c = fs.readFileSync(f, 'utf8');
            let f1 = findStr.replace(/\\r\\n/g, '\\n');
            let f2 = findStr.replace(/\\n/g, '\\r\\n');
            
            if (c.includes(f1)) {
                c = c.replace(f1, repStr);
                fs.writeFileSync(f, c);
                console.log('Fixed ' + f);
            } else if (c.includes(f2)) {
                c = c.replace(f2, repStr);
                fs.writeFileSync(f, c);
                console.log('Fixed ' + f);
            } else if (c.includes(repStr)) {
                console.log('Already fixed ' + f);
            } else {
                console.log('Could not find target block in ' + f);
            }
        } catch(e) {
            console.log('Error processing ' + f + ': ' + e.message);
        }
    }
}

doReplace(shopPaths, shopFind, shopReplace);
doReplace(verleihPaths, verleihFind, verleihReplace);
