import os

filepath = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\functions\index.js"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the stripe.checkout.sessions.create and the orderRef.set to include discount logic

target = """            const subtotal = trustedItems.reduce((s, i) => s + i.price * i.quantity, 0);
            const orderRef = admin.firestore().collection('orders').doc();
            await orderRef.set({ type: 'shop', customerUid: user?.uid || null, customerName: customer.name, customerEmail: String(customer.email).toLowerCase(), customerAddress: customer.address, customerPostcode: customer.postcode || '', customerPhone: customer.phone, customerNotes: customer.notes || '', eventDate: customer.eventDate, items: trustedItems.map(i => ({ id: i.id, source: i.source, title: i.title, price: i.price, quantity: i.quantity, transportEnabled: i.transportEnabled, transportMode: i.transportMode })), subtotal, transportFee, totalPrice: subtotal + transportFee, status: 'Zahlung Ausstehend (Stripe)', createdAt: admin.firestore.FieldValue.serverTimestamp() });
            const lineItems = trustedItems.map(i => ({ price_data: { currency: 'eur', product_data: { name: i.title, images: (i.images || [i.img]).flat().filter(x => /^https:\/\//.test(x || '')).slice(0, 8) }, unit_amount: Math.round(i.price * 100) }, quantity: i.quantity }));
            if (transportFee > 0) lineItems.push({ price_data: { currency: 'eur', product_data: { name: 'Transport zum Veranstaltungsort' }, unit_amount: Math.round(transportFee * 100) }, quantity: 1 });
            const session = await stripe.checkout.sessions.create({ customer_email: customer.email, line_items: lineItems, mode: 'payment', metadata: { orderId: orderRef.id }, success_url: successUrl || 'https://selena.events/shop.html?checkout=success', cancel_url: cancelUrl || 'https://selena.events/shop.html?checkout=cancelled' });
            await orderRef.update({ stripeSessionId: session.id });"""

replacement = """            const subtotal = trustedItems.reduce((s, i) => s + i.price * i.quantity, 0);
            
            // Calculate Loyalty Discount
            let discountPercent = 0;
            let couponId = null;
            if (user?.uid) {
                const userDoc = await admin.firestore().collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    const points = userDoc.data().loyaltyPoints || 0;
                    if (points >= 2500) discountPercent = 15;
                    else if (points >= 1000) discountPercent = 10;
                    else if (points >= 500) discountPercent = 5;
                }
            }
            
            if (discountPercent > 0) {
                const coupon = await stripe.coupons.create({
                    percent_off: discountPercent,
                    duration: 'once',
                    name: `Treue-Rabatt (${discountPercent}%)`
                });
                couponId = coupon.id;
            }

            const orderRef = admin.firestore().collection('orders').doc();
            await orderRef.set({ type: 'shop', customerUid: user?.uid || null, customerName: customer.name, customerEmail: String(customer.email).toLowerCase(), customerAddress: customer.address, customerPostcode: customer.postcode || '', customerPhone: customer.phone, customerNotes: customer.notes || '', eventDate: customer.eventDate, items: trustedItems.map(i => ({ id: i.id, source: i.source, title: i.title, price: i.price, quantity: i.quantity, transportEnabled: i.transportEnabled, transportMode: i.transportMode })), subtotal, transportFee, discountPercent, totalPrice: subtotal + transportFee, status: 'Zahlung Ausstehend (Stripe)', createdAt: admin.firestore.FieldValue.serverTimestamp() });
            const lineItems = trustedItems.map(i => ({ price_data: { currency: 'eur', product_data: { name: i.title, images: (i.images || [i.img]).flat().filter(x => /^https:\/\//.test(x || '')).slice(0, 8) }, unit_amount: Math.round(i.price * 100) }, quantity: i.quantity }));
            if (transportFee > 0) lineItems.push({ price_data: { currency: 'eur', product_data: { name: 'Transport zum Veranstaltungsort' }, unit_amount: Math.round(transportFee * 100) }, quantity: 1 });
            
            const sessionConfig = { customer_email: customer.email, line_items: lineItems, mode: 'payment', metadata: { orderId: orderRef.id }, success_url: successUrl || 'https://selena.events/shop.html?checkout=success', cancel_url: cancelUrl || 'https://selena.events/shop.html?checkout=cancelled' };
            if (couponId) sessionConfig.discounts = [{ coupon: couponId }];
            
            const session = await stripe.checkout.sessions.create(sessionConfig);
            await orderRef.update({ stripeSessionId: session.id, stripeCouponId: couponId || null });"""

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched createStripeCheckout")
