const fs = require('fs');

function fix(f, isEn) {
    let c = fs.readFileSync(f, 'utf8');
    const bad1 = '    checkoutModal.classList.remove(\'hidden\');\r\n    checkoutSuccess.classList.add(\'hidden\');\r\n            }';
    const bad2 = '    checkoutModal.classList.remove(\'hidden\');\n    checkoutSuccess.classList.add(\'hidden\');\n            }';
    
    let errCheck = '            const errClose = document.getElementById(\'error-modal-close\');\n            if (errModal && errMsg && errClose) {';
    if (isEn) {
        errCheck = '            if (errModal && errMsg) {';
    }

    const good = `    checkoutModal.classList.remove('hidden');
    checkoutSuccess.classList.add('hidden');
    checkoutSubmit.disabled = false;
    document.body.style.overflow = 'hidden';
}

function closeCheckout() {
    checkoutModal.classList.add('hidden');
    document.body.style.overflow = '';
}

if (checkoutBtnMain) checkoutBtnMain.addEventListener('click', openCheckout);
if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);
if (checkoutOverlay) checkoutOverlay.addEventListener('click', closeCheckout);

if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        checkoutSubmit.disabled = true;
        
        const name = document.getElementById('checkout-name').value;
        const email = (window.currentUser && window.currentUser.email) ? window.currentUser.email : document.getElementById('checkout-email').value;
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const checkoutDate = document.getElementById('checkout-date');
        const dateVal = checkoutDate ? checkoutDate.value : null;

        if (!dateVal) {
            const errModal = document.getElementById('error-modal');
            const errMsg = document.getElementById('error-modal-msg');
${errCheck}`;

    if (c.includes(bad1)) {
        c = c.replace(bad1, good);
    } else if (c.includes(bad2)) {
        c = c.replace(bad2, good);
    }
    fs.writeFileSync(f, c);
}

fix('js/verleih.js', false);
fix('en/js/verleih.js', true);
console.log('Fixed');
