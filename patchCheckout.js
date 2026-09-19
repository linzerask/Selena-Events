const fs = require('fs');
const files = ['js/shop.js', 'en/js/shop.js', 'ro/js/shop.js', 'js/verleih.js', 'en/js/verleih.js', 'ro/js/verleih.js'];

files.forEach(f => {
    try {
        let c = fs.readFileSync(f, 'utf8');
        
        const openCheckoutRegex = /function openCheckout\(\) \{([\s\S]*?)checkoutModal\.classList\.remove\('hidden'\);/g;
        
        c = c.replace(openCheckoutRegex, function(match, inner) {
            return `function openCheckout() {
    if (cart.length === 0) return;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const checkoutTotalDisplay = document.getElementById('checkout-total');
    if (checkoutTotalDisplay) checkoutTotalDisplay.textContent = total + ' €';
    
    if (window.currentUser) {
        const emailField = document.getElementById('checkout-email');
        const nameField = document.getElementById('checkout-name');
        if (emailField) emailField.value = window.currentUser.email || '';
        if (nameField && window.currentUser.displayName) nameField.value = window.currentUser.displayName;
        
        const authP = document.getElementById('checkout-auth-prompt') || document.getElementById('auth-prompt');
        const persF = document.getElementById('checkout-personal-fields');
        const nameG = document.getElementById('name-group');
        const emailG = document.getElementById('email-group');
        
        if (authP) authP.classList.add('hidden');
        if (persF) persF.classList.remove('hidden');
        if (nameG) nameG.classList.remove('hidden');
        if (emailG) emailG.classList.remove('hidden');
        
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
    } else {
        const authP = document.getElementById('checkout-auth-prompt') || document.getElementById('auth-prompt');
        const persF = document.getElementById('checkout-personal-fields');
        const nameG = document.getElementById('name-group');
        const emailG = document.getElementById('email-group');
        
        if (authP) authP.classList.remove('hidden');
        if (persF) persF.classList.add('hidden');
        if (nameG && emailG) {
            if (!authP) {
                nameG.classList.remove('hidden');
                emailG.classList.remove('hidden');
            }
        }
    }

    checkoutModal.classList.remove('hidden');`;
        });
        
        fs.writeFileSync(f, c);
        console.log('Patched ' + f);
    } catch(e) {
        console.log('Error in ' + f + ': ' + e.message);
    }
});
