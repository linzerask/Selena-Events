const fs = require('fs');

function patchShop(file) {
    try {
        let c = fs.readFileSync(file, 'utf8');
        let regex = /if \(window\.currentUser\) \{[\s\S]*?checkoutPersonalFields\.classList\.remove\('hidden'\);\s*\}/;
        if (regex.test(c)) {
            const repl = `if (window.currentUser) {
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
            c = c.replace(regex, repl);
            fs.writeFileSync(file, c);
            console.log("Patched " + file);
        } else {
            console.log("Not found in " + file);
        }
    } catch(e) { console.log(e.message); }
}

function patchVerleih(file) {
    try {
        let c = fs.readFileSync(file, 'utf8');
        let regex = /if \(window\.currentUser\) \{[\s\S]*?emailGroup\.classList\.remove\('hidden'\);\s*\}/;
        if (regex.test(c)) {
            const repl = `if (window.currentUser) {
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
            c = c.replace(regex, repl);
            fs.writeFileSync(file, c);
            console.log("Patched " + file);
        } else {
            console.log("Not found in " + file);
        }
    } catch(e) { console.log(e.message); }
}

['js/shop.js', 'en/js/shop.js', 'ro/js/shop.js'].forEach(patchShop);
['js/verleih.js', 'en/js/verleih.js', 'ro/js/verleih.js'].forEach(patchVerleih);
