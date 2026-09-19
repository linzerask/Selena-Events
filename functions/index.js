const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors")({ origin: [/^https:\/\/(www\.)?selena\.events$/, /^http:\/\/localhost(?::\d+)?$/, /^https:\/\/(www\.)?selenaevents\.anonymcreator\.online$/] });
const catalog = require("./catalog.json"); // We will generate this

admin.initializeApp();

async function optionalUser(req) {
    const value = req.headers.authorization || '';
    if (!value.startsWith('Bearer ')) return null;
    try { return await admin.auth().verifyIdToken(value.slice(7)); } catch (_) { return null; }
}

async function resolveTrustedItem(item) {
    if (!item || item.id === undefined) return null;
    if (item.source === 'custom') {
        const snap = await admin.firestore().collection('custom_products').doc(String(item.id)).get();
        if (!snap.exists) return null;
        const p = snap.data();
        if (p.visible === false || ['request', 'from'].includes(p.priceMode) || p.transportMode === 'quote') return null;
        return { 
            id: snap.id, 
            source: 'custom', 
            title: p.title, 
            price: Number(p.price), 
            images: p.images || [p.img].filter(Boolean), 
            trackStock: !!p.trackStock, 
            stock: Number(p.stock || 0), 
            transportEnabled: !!p.transportEnabled, 
            transportMode: p.transportMode || (p.transportEnabled ? 'distance' : 'none'), 
            pricePerKm: Number(p.pricePerKm !== undefined ? p.pricePerKm : 0.50),
            transportFlatFee: Number(p.transportFlatFee || 0) 
        };
    }
    if (item.source === 'package') {
        const snap = await admin.firestore().collection('custom_packages').doc(String(item.id)).get();
        if (!snap.exists) return null;
        const p = snap.data();
        return { 
            id: snap.id, 
            source: 'package', 
            title: p.title, 
            price: Number(p.price), 
            images: p.items?.[0]?.images || [p.items?.[0]?.img].filter(Boolean), 
            trackStock: false, 
            transportEnabled: !!p.transportEnabled, 
            transportMode: p.transportMode || (p.transportEnabled ? 'distance' : 'none'), 
            pricePerKm: Number(p.pricePerKm !== undefined ? p.pricePerKm : 0.50),
            transportFlatFee: Number(p.transportFlatFee || 0) 
        };
    }
    const p = catalog.find(x => (String(x.id) === String(item.id) || ('catalog_' + x.source + '_' + x.id) === String(item.id)) && (!item.source || x.source === item.source));
    if (p) return { 
        ...p, 
        id: String(p.id), 
        price: Number(p.price), 
        trackStock: !!p.trackStock, 
        stock: Number(p.stock || 0), 
        transportEnabled: !!p.transportEnabled, 
        transportMode: p.transportMode || (p.transportEnabled ? 'distance' : 'none'), 
        pricePerKm: Number(p.pricePerKm !== undefined ? p.pricePerKm : 0.50),
        transportFlatFee: Number(p.transportFlatFee || 0) 
    };
    
    // Fallback: If not found in catalog, check custom_products or custom_packages
    let customSnap = await admin.firestore().collection('custom_products').doc(String(item.id)).get();
    if (!customSnap.exists) {
        customSnap = await admin.firestore().collection('custom_packages').doc(String(item.id)).get();
    }
    
    if (customSnap.exists) {
        const cp = customSnap.data();
        if (cp.visible !== false && cp.visibleInShop !== false && !['request', 'from'].includes(cp.priceMode) && cp.transportMode !== 'quote') {
            return { 
                id: customSnap.id, 
                source: 'custom', 
                title: cp.title, 
                price: Number(cp.price), 
                images: cp.images || [cp.img].filter(Boolean), 
                trackStock: !!cp.trackStock, 
                stock: Number(cp.stock || 0), 
                transportEnabled: !!cp.transportEnabled, 
                transportMode: cp.transportMode || (cp.transportEnabled ? 'distance' : 'none'), 
                pricePerKm: Number(cp.pricePerKm !== undefined ? cp.pricePerKm : 0.50),
                transportFlatFee: Number(cp.transportFlatFee || 0) 
            };
        }
    }
    return null;
}

async function distanceTransportFee(address, items) {
    const transportItems = items.filter(i => i.transportEnabled && (i.transportMode === 'distance' || (i.pricePerKm !== undefined && i.pricePerKm > 0)));
    if (!transportItems.length) return { fee: 0, distanceKm: 0, pricePerKm: 0 };

    const settingsSnap = await admin.firestore().collection('settings').doc('transport').get();
    const s = settingsSnap.exists ? settingsSnap.data() : {};
    const origin = s.origin || 'Riesterstraße 8, 4050 Traun, Österreich';
    
    // Effective price per km: max rate among cart items or setting (default 0.50 €)
    const effectivePricePerKm = Math.max(...transportItems.map(i => Number(i.pricePerKm || s.pricePerKm || 0.50)));
    const includedKm = Number(s.includedKm || 0);
    const roundTrip = s.roundTrip !== false; // default true (Hin- und Rückfahrt)

    let km = null;

    // 1. Google Maps Distance Matrix if key exists
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (apiKey) {
        try {
            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(address)}&key=${encodeURIComponent(apiKey)}`;
            const response = await fetch(url);
            const data = await response.json();
            const meters = data?.rows?.[0]?.elements?.[0]?.distance?.value;
            if (Number.isFinite(meters)) km = meters / 1000;
        } catch (err) {
            console.warn('Google Maps error, falling back to OSRM:', err.message);
        }
    }

    // 2. OpenStreetMap + OSRM routing (free fallback)
    if (km === null) {
        try {
            const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
            const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'SelenaEvents/1.0 (info@selena.events)' } });
            const geoData = await geoRes.json();
            if (geoData && geoData[0]) {
                const { lat, lon } = geoData[0];
                const routeUrl = `https://router.project-osrm.org/route/v1/driving/14.2393,48.2215;${lon},${lat}?overview=false`;
                const routeRes = await fetch(routeUrl);
                const routeData = await routeRes.json();
                const meters = routeData?.routes?.[0]?.distance;
                if (Number.isFinite(meters)) km = meters / 1000;
            }
        } catch (err) {
            console.warn('OSRM routing error:', err.message);
        }
    }

    // 3. Fallback local estimate if address could not be resolved
    if (km === null || !Number.isFinite(km)) {
        km = 15; // standard ~15 km delivery radius
    }

    const chargeableKm = Math.max(0, km - includedKm);
    const fee = Math.round(chargeableKm * effectivePricePerKm * (roundTrip ? 2 : 1) * 100) / 100;
    return { fee, distanceKm: Math.round(km * 10) / 10, pricePerKm: effectivePricePerKm };
}

exports.createStripeCheckout = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
        try {
            const { items, customer = {}, successUrl, cancelUrl } = req.body || {};
            if (!Array.isArray(items) || !items.length) return res.status(400).send('Invalid cart items');
            if (!customer.name || !customer.email || !customer.address || !customer.phone || !customer.eventDate) return res.status(400).send('Missing customer or event information');
            const user = await optionalUser(req);
            const trustedItems = [];
            for (const item of items) {
                const p = await resolveTrustedItem(item);
                const quantity = Math.max(1, Math.min(99, Number.parseInt(item.quantity, 10) || 1));
                if (!p) { console.error('Invalid item:', item, 'catalog found:', catalog.find(x => String(x.id) === String(item.id) && x.source === item.source)); return res.status(400).send('Invalid or non-bookable item'); }
                if (p.trackStock && p.stock < quantity) return res.status(409).send(`Nicht genügend Bestand: ${p.title}`);
                trustedItems.push({ ...p, quantity });
            }
            const flatFee = trustedItems.reduce((s, i) => s + (i.transportEnabled ? (i.transportFlatFee || 0) * i.quantity : 0), 0);
            const distCalc = await distanceTransportFee(`${customer.address}, ${customer.postcode || ''}`, trustedItems);
            const transportFee = Math.round((flatFee + distCalc.fee) * 100) / 100;
            const subtotal = trustedItems.reduce((s, i) => s + i.price * i.quantity, 0);
            
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
            
            const sessionConfig = { customer_email: customer.email, line_items: lineItems, mode: 'payment', metadata: { orderId: orderRef.id }, payment_intent_data: { metadata: { orderId: orderRef.id } }, success_url: successUrl || 'https://selena.events/shop.html?checkout=success', cancel_url: cancelUrl || 'https://selena.events/shop.html?checkout=cancelled' };
            if (couponId) sessionConfig.discounts = [{ coupon: couponId }];
            
            const session = await stripe.checkout.sessions.create(sessionConfig);
            await orderRef.update({ stripeSessionId: session.id, stripeCouponId: couponId || null });
            res.status(200).json({ id: session.id, orderId: orderRef.id, url: session.url, total: subtotal + transportFee });
        } catch (error) {
            console.error('Stripe checkout error:', error);
            res.status(error.status || 500).send(error.status ? error.message : 'Internal Server Error');
        }
    });
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    let event;

    try {
        const sig = req.headers['stripe-signature'];
        // Use raw body for signature verification. Firebase provides req.rawBody
        event = stripe.webhooks.constructEvent(
            req.rawBody, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const orderId = session.metadata && session.metadata.orderId;

        if (orderId) {
            try {
                await admin.firestore().runTransaction(async tx => {
                    const orderRef = admin.firestore().collection('orders').doc(orderId);
                    const orderSnap = await tx.get(orderRef);
                    if (!orderSnap.exists) throw new Error('Order not found');
                    const order = orderSnap.data();
                    if (order.stockDeducted === true) {
                        tx.update(orderRef, { status: 'Bezahlt', stripeSessionId: session.id, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
                        return;
                    }
                    for (const item of order.items || []) {
                        if (item.source !== 'custom') continue;
                        const productRef = admin.firestore().collection('custom_products').doc(String(item.id));
                        const productSnap = await tx.get(productRef);
                        if (!productSnap.exists || !productSnap.data().trackStock) continue;
                        const next = Number(productSnap.data().stock || 0) - Number(item.quantity || 1);
                        if (next < 0) throw new Error(`Insufficient stock for ${item.title}`);
                        tx.update(productRef, { stock: next, stockLastChangedAt: admin.firestore.FieldValue.serverTimestamp(), stockLastChangedBy: 'stripe-webhook' });
                    }
                    // Calculate Loyalty Points based on final amount paid minus transport fee
                    let pointsEarned = 0;
                    let refUid = null;
                    let refPoints = 0;
                    
                    if (order.customerUid) {
                        const finalPaid = session.amount_total ? session.amount_total / 100 : 0;
                        const transportFee = order.transportFee || 0;
                        pointsEarned = Math.max(0, Math.floor(finalPaid - transportFee));
                        
                        if (pointsEarned > 0) {
                            const userRef = admin.firestore().collection('users').doc(order.customerUid);
                            const userSnap = await tx.get(userRef);
                            if (userSnap.exists) {
                                const userData = userSnap.data();
                                tx.update(userRef, { loyaltyPoints: admin.firestore.FieldValue.increment(pointsEarned) });
                                
                                // Referral Reward (10%)
                                if (userData.referredByUid) {
                                    refUid = userData.referredByUid;
                                    refPoints = Math.round(pointsEarned * 0.1);
                                    if (refPoints > 0) {
                                        const referrerRef = admin.firestore().collection('users').doc(refUid);
                                        tx.update(referrerRef, { loyaltyPoints: admin.firestore.FieldValue.increment(refPoints) });
                                    }
                                }
                            }
                        }
                    }
                    
                    tx.update(orderRef, {
                        status: 'Bezahlt',
                        stripeSessionId: session.id,
                        stripePaymentIntentId: session.payment_intent || null,
                        stockDeducted: true,
                        pointsEarned: pointsEarned,
                        referrerUid: refUid,
                        referrerPoints: refPoints,
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                });
                return res.json({ received: true });
            } catch (err) {
                console.error('Payment finalization error:', err);
                return res.status(500).end();
            }
        }
    }


    // Handle charge.refunded event from Stripe Dashboard
    if (event.type === 'charge.refunded') {
        const charge = event.data.object;
        let orderId = charge.metadata && charge.metadata.orderId;
        
        if (!orderId && charge.payment_intent) {
            const snap = await admin.firestore().collection('orders').where('stripePaymentIntentId', '==', charge.payment_intent).limit(1).get();
            if (!snap.empty) {
                orderId = snap.docs[0].id;
            } else {
                try {
                    const pi = await stripe.paymentIntents.retrieve(charge.payment_intent);
                    if (pi && pi.metadata && pi.metadata.orderId) {
                        orderId = pi.metadata.orderId;
                    }
                } catch(e) {
                    console.error('Error retrieving PI for refund:', e);
                }
            }
        }

        if (orderId) {
            try {
                await admin.firestore().runTransaction(async tx => {
                    const orderRef = admin.firestore().collection('orders').doc(orderId);
                    const orderSnap = await tx.get(orderRef);
                    if (!orderSnap.exists) return;
                    const order = orderSnap.data();
                    
                    if (order.status === 'Erstattet' || order.isRefunded === true) return;
                    
                    // Restore stock for custom products
                    for (const item of order.items || []) {
                        if (item.source !== 'custom') continue;
                        const productRef = admin.firestore().collection('custom_products').doc(String(item.id));
                        const productSnap = await tx.get(productRef);
                        if (!productSnap.exists || !productSnap.data().trackStock) continue;
                        const next = Number(productSnap.data().stock || 0) + Number(item.quantity || 1);
                        tx.update(productRef, { stock: next, stockLastChangedAt: admin.firestore.FieldValue.serverTimestamp(), stockLastChangedBy: 'stripe-refund' });
                    }
                    
                    // Revert loyalty points if awarded
                    if (order.customerUid && order.pointsEarned) {
                        const userRef = admin.firestore().collection('users').doc(order.customerUid);
                        tx.update(userRef, { loyaltyPoints: admin.firestore.FieldValue.increment(-order.pointsEarned) });
                    }
                    if (order.referrerUid && order.referrerPoints) {
                        const refUserRef = admin.firestore().collection('users').doc(order.referrerUid);
                        tx.update(refUserRef, { loyaltyPoints: admin.firestore.FieldValue.increment(-order.referrerPoints) });
                    }
                    
                    tx.update(orderRef, {
                        status: 'Erstattet',
                        isRefunded: true,
                        refundedAmount: (charge.amount_refunded || 0) / 100,
                        refundedAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                });
                return res.json({ received: true });
            } catch(err) {
                console.error('Refund webhook processing error:', err);
                return res.status(500).end();
            }
        }
    }

    res.json({received: true});
});

const nodemailer = require("nodemailer");

// Create the transporter using the IONOS SMTP credentials.
// The password will be loaded from Firebase Config.
const transporter = nodemailer.createTransport({
    host: "smtp.ionos.de",
    port: 587,
    secure: false, // false for port 587
    auth: {
        user: "info@selena.events",
        pass: process.env.SMTP_PASSWORD || functions.config().smtp?.password,
    },
});

exports.sendOrderConfirmation = functions.firestore
    .document('orders/{orderId}')
    .onWrite(async (change, context) => {
        const orderData = change.after.data();
        if (!orderData) return null; // Document was deleted
        
        const previousData = change.before.data();
        
        // If it was already Bezahlt, don't send again.
        if (previousData && previousData.status === 'Bezahlt') {
            return null;
        }

        // Only send if the new status is Bezahlt
        if (orderData.status !== 'Bezahlt') {
            return null;
        }

        const customerEmail = orderData.customerEmail || orderData.email;
        if (!customerEmail) {
            console.error("No customer email found for order", context.params.orderId);
            return null;
        }

        // Determine if it's a rental (Verleih) or a standard Shop purchase
        const isVerleih = orderData.type === 'verleih' || orderData.orderType === 'verleih' || orderData.rentalDates;
        
        // Build items list
        let calculatedTotal = 0;
        let itemsRows = '';
        if (orderData.items && Array.isArray(orderData.items)) {
            orderData.items.forEach(item => {
                const title = item.title || item.name || "Artikel";
                const price = Number(item.price || 0);
                const quantity = Number(item.quantity || 1);
                const rowTotal = price * quantity;
                calculatedTotal += rowTotal;
                itemsRows += `
                    <tr style="border-bottom: 1px solid #f3f4f6;">
                        <td style="padding: 8px 0; color: #374151;">${quantity}x <strong>${title}</strong></td>
                        <td style="padding: 8px 0; text-align: right; color: #111827; font-weight: 500;">${rowTotal.toFixed(2).replace('.', ',')} €</td>
                    </tr>
                `;
            });
        }
        
        const finalTotal = Number(orderData.totalAmount || orderData.totalPrice || calculatedTotal);
        const customerName = orderData.customerName || orderData.name || '';

        const subject = isVerleih 
            ? 'Ihre Mietanfrage bei Selena Events' 
            : 'Ihre Bestellbestätigung bei Selena Events';

        const body = `
            <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; color: #1a1a1a; border: 1px solid #e8e2d9; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 25px;">
                    <img src="https://selena.events/assets/logo_dark.png" alt="Selena Events" style="max-height: 70px;">
                </div>
                <h2 style="color: #111827; font-size: 20px; margin-bottom: 16px; border-bottom: 2px solid #c89f5d; padding-bottom: 8px;">${isVerleih ? 'Ihre Mietanfrage bei Selena Events' : 'Ihre Bestellbestätigung bei Selena Events'}</h2>
                <p style="font-size: 15px; line-height: 1.6; color: #374151;">Hallo${customerName ? ' ' + customerName : ''},</p>
                <p style="font-size: 15px; line-height: 1.6; color: #374151;">vielen Dank für Ihre ${isVerleih ? 'Mietbuchung' : 'Bestellung'} bei <strong>Selena Events</strong>!</p>
                
                <div style="background-color: #faf7f2; border: 1px solid #eedfc8; border-radius: 6px; padding: 18px; margin: 20px 0;">
                    <p style="font-size: 13px; font-weight: bold; text-transform: uppercase; color: #c89f5d; margin-top: 0; margin-bottom: 12px; letter-spacing: 0.5px;">Ihre Bestellübersicht:</p>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        ${itemsRows}
                        <tr style="border-top: 2px solid #eedfc8;">
                            <td style="padding: 12px 0 0 0; font-weight: bold; color: #111827; font-size: 15px;">Gesamtbetrag:</td>
                            <td style="padding: 12px 0 0 0; text-align: right; font-weight: bold; font-size: 16px; color: #c89f5d;">${finalTotal.toFixed(2).replace('.', ',')} €</td>
                        </tr>
                    </table>
                </div>

                <p style="font-size: 15px; line-height: 1.6; color: #374151;">${isVerleih ? 'Wir prüfen und bereiten alles für Ihren gewünschten Mietzeitraum vor. In Ihrem Kunden-Dashboard können Sie jederzeit den aktuellen Status, Rechnungen und Dokumente einsehen.' : 'Wir bereiten Ihre Bestellung schnellstmöglich vor. In Ihrem Kunden-Dashboard können Sie jederzeit den Status und Ihre Unterlagen einsehen.'}</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://selena.events/customer-dashboard.html" style="display:inline-block;padding:12px 28px;background-color:#c89f5d;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:4px;font-size:15px;letter-spacing:0.5px;box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Zum Kunden-Dashboard</a>
                </div>

                <p style="font-size: 14px; line-height: 1.5; color: #6b7280;">Falls der Button nicht funktioniert, kopieren Sie bitte folgenden Link in Ihren Browser:<br>
                <a href="https://selena.events/customer-dashboard.html" style="color:#c89f5d;word-break:break-all;">https://selena.events/customer-dashboard.html</a></p>

                <br>
                <p style="font-size: 14px; line-height: 1.5; color: #374151; margin-bottom: 0;">Herzliche Grüße,<br><strong>Ihr Team von Selena Events</strong></p>
            </div>
        `;

        try {
            await transporter.sendMail({
                from: '"Selena Events" <info@selena.events>',
                to: customerEmail,
                subject: subject,
                html: body
            });
            console.log('Confirmation email sent successfully to', customerEmail);
        } catch (error) {
            console.error('Error sending confirmation email:', error);
        }
        
        return null;
    });

exports.sendCustomVerificationEmail = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
        try {
            const { email, name } = req.body;
            if (!email) return res.status(400).send("Email required");

            const subject = "Willkommen bei Selena Events!";
            const body = `
                <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; color: #1a1a1a; border: 1px solid #e8e2d9; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <img src="https://selena.events/assets/logo_dark.png" alt="Selena Events" style="max-height: 70px;">
                    </div>
                    <h2 style="color: #111827; font-size: 20px; margin-bottom: 16px; border-bottom: 2px solid #c89f5d; padding-bottom: 8px;">Willkommen bei Selena Events</h2>
                    <p style="font-size: 15px; line-height: 1.6; color: #374151;">Hallo${name ? ' ' + name : ''},</p>
                    <p style="font-size: 15px; line-height: 1.6; color: #374151;">herzlich willkommen im exklusiven Kundenkreis von <strong>Selena Events</strong>!</p>
                    <p style="font-size: 15px; line-height: 1.6; color: #374151;">Ihr persönliches Kundenkonto wurde erfolgreich eingerichtet und steht Ihnen ab sofort zur Verfügung. Als Mitglied sammeln Sie bei jeder Buchung Treuepunkte, können Ihre Bestellungen und Mietanfragen verwalten und erhalten direkten Zugriff auf Ihr persönliches Postfach.</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://selena.events/customer-dashboard.html" style="display:inline-block;padding:12px 28px;background-color:#c89f5d;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:4px;font-size:15px;letter-spacing:0.5px;box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Zum Kunden-Dashboard</a>
                    </div>

                    <p style="font-size: 14px; line-height: 1.5; color: #6b7280;">Falls der Button nicht funktioniert, kopieren Sie bitte folgenden Link in Ihren Browser:<br>
                    <a href="https://selena.events/customer-dashboard.html" style="color:#c89f5d;word-break:break-all;">https://selena.events/customer-dashboard.html</a></p>

                    <br>
                    <p style="font-size: 14px; line-height: 1.5; color: #374151; margin-bottom: 0;">Herzliche Grüße,<br><strong>Ihr Team von Selena Events</strong></p>
                </div>
            `;

            await transporter.sendMail({
                from: '"Selena Events" <info@selena.events>',
                to: email,
                subject: subject,
                html: body
            });

            res.status(200).send({ success: true });
        } catch (error) {
            console.error("Error sending verification email:", error);
            res.status(500).send(error.message);
        }
    });
});

exports.sendCustomPasswordResetEmail = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== "POST") return res.status(405).send("Method Not Allowed");
        try {
            const { email } = req.body;
            if (!email) return res.status(400).send("Email required");

            const link = await admin.auth().generatePasswordResetLink(email);
            const urlObj = new URL(link);
            const oobCode = urlObj.searchParams.get('oobCode');
            const customLink = `https://selena.events/reset-password.html?mode=resetPassword&oobCode=${oobCode}`;
            
            const subject = "Passwort zurücksetzen | Selena Events";
            const body = `
                <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; color: #1a1a1a; border: 1px solid #e8e2d9; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <img src="https://selena.events/assets/logo_dark.png" alt="Selena Events" style="max-height: 70px;">
                    </div>
                    <h2 style="color: #111827; font-size: 20px; margin-bottom: 16px; border-bottom: 2px solid #c89f5d; padding-bottom: 8px;">Passwort zurücksetzen</h2>
                    <p style="font-size: 15px; line-height: 1.6; color: #374151;">Hallo,</p>
                    <p style="font-size: 15px; line-height: 1.6; color: #374151;">wir haben eine Anfrage zum Zurücksetzen Ihres Passworts für Ihr Kundenkonto bei <strong>Selena Events</strong> erhalten.</p>
                    <p style="font-size: 15px; line-height: 1.6; color: #374151;">Klicken Sie auf den folgenden Button, um ein neues, sicheres Passwort für Ihren Zugang festzulegen:</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${customLink}" style="display:inline-block;padding:12px 28px;background-color:#c89f5d;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:4px;font-size:15px;letter-spacing:0.5px;box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Neues Passwort vergeben</a>
                    </div>

                    <p style="font-size: 14px; line-height: 1.5; color: #6b7280;">Falls der Button nicht funktioniert, kopieren Sie bitte folgenden Link in Ihren Browser:<br>
                    <a href="${customLink}" style="color:#c89f5d;word-break:break-all;">${customLink}</a></p>

                    <p style="font-size: 13px; line-height: 1.5; color: #9ca3af; margin-top: 16px;">Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail einfach ignorieren. Ihr bisheriges Passwort bleibt unverändert geschützt.</p>

                    <br>
                    <p style="font-size: 14px; line-height: 1.5; color: #374151; margin-bottom: 0;">Herzliche Grüße,<br><strong>Ihr Team von Selena Events</strong></p>
                </div>
            `;

            await transporter.sendMail({
                from: '"Selena Events" <info@selena.events>',
                to: email,
                subject: subject,
                html: body
            });

            res.status(200).send({ success: true });
        } catch (error) {
            console.error("Error sending reset email:", error);
            res.status(500).send(error.message);
        }
    });
});


// Admin Endpoint to issue a refund via Stripe directly from the Dashboard
exports.refundStripeOrder = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
        try {
            const user = await optionalUser(req);
            if (!user) return res.status(401).send('Unauthorized');
            
            const roleDoc = await admin.firestore().collection('user_roles').doc(user.uid).get();
            const role = roleDoc.exists ? roleDoc.data().role : null;
            if (role !== 'owner' && role !== 'dev') {
                return res.status(403).send('Forbidden: Only owner or dev can refund orders');
            }
            
            const { orderId } = req.body || {};
            if (!orderId) return res.status(400).send('Missing orderId');
            
            const orderRef = admin.firestore().collection('orders').doc(orderId);
            const orderSnap = await orderRef.get();
            if (!orderSnap.exists) return res.status(404).send('Order not found');
            const order = orderSnap.data();
            
            if (order.status === 'Erstattet' || order.isRefunded) {
                return res.status(400).send('Order already refunded');
            }
            
            let paymentIntentId = order.stripePaymentIntentId;
            if (!paymentIntentId && order.stripeSessionId) {
                const session = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
                paymentIntentId = session.payment_intent;
            }
            
            let refundResult = null;
            if (paymentIntentId) {
                try {
                    refundResult = await stripe.refunds.create({
                        payment_intent: paymentIntentId,
                        reason: 'requested_by_customer'
                    });
                } catch (stripeErr) {
                    // If already refunded previously in Stripe Dashboard, sync successfully
                    if (stripeErr.message && (stripeErr.message.includes('amount=0') || stripeErr.message.includes('already been refunded') || stripeErr.code === 'charge_already_refunded')) {
                        console.log('Payment was already refunded in Stripe, syncing status:', orderId);
                        refundResult = { id: 'already_refunded_in_stripe' };
                    } else {
                        throw stripeErr;
                    }
                }
            }
            
            // Revert stock & points
            await admin.firestore().runTransaction(async tx => {
                for (const item of order.items || []) {
                    if (item.source !== 'custom') continue;
                    const productRef = admin.firestore().collection('custom_products').doc(String(item.id));
                    const productSnap = await tx.get(productRef);
                    if (!productSnap.exists || !productSnap.data().trackStock) continue;
                    const next = Number(productSnap.data().stock || 0) + Number(item.quantity || 1);
                    tx.update(productRef, { stock: next, stockLastChangedAt: admin.firestore.FieldValue.serverTimestamp(), stockLastChangedBy: 'dashboard-refund' });
                }
                
                if (order.customerUid && order.pointsEarned) {
                    const userRef = admin.firestore().collection('users').doc(order.customerUid);
                    tx.update(userRef, { loyaltyPoints: admin.firestore.FieldValue.increment(-order.pointsEarned) });
                }
                if (order.referrerUid && order.referrerPoints) {
                    const refUserRef = admin.firestore().collection('users').doc(order.referrerUid);
                    tx.update(refUserRef, { loyaltyPoints: admin.firestore.FieldValue.increment(-order.referrerPoints) });
                }
                
                tx.update(orderRef, {
                    status: 'Erstattet',
                    isRefunded: true,
                    refundId: refundResult?.id || 'manual',
                    refundedAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            });
            
            return res.json({ success: true, refundId: refundResult?.id || null });
        } catch(err) {
            console.error('Manual refund error:', err);
            return res.status(500).send(err.message || 'Internal Server Error');
        }
    });
});

exports.notifyCustomerOnNewMailboxMessage = functions.firestore
    .document('customer_mailboxes/{customerUid}/messages/{messageId}')
    .onCreate(async (snap, context) => {
        const msg = snap.data();
        if (!msg || msg.senderRole !== 'staff') {
            return null;
        }

        const customerUid = context.params.customerUid;
        let customerEmail = null;
        let customerName = '';

        try {
            const mailboxDoc = await admin.firestore().collection('customer_mailboxes').doc(customerUid).get();
            if (mailboxDoc.exists) {
                const mbData = mailboxDoc.data() || {};
                customerEmail = mbData.customerEmail || null;
                customerName = mbData.customerName || '';
            }

            if (!customerEmail) {
                const userDoc = await admin.firestore().collection('users').doc(customerUid).get();
                if (userDoc.exists) {
                    const uData = userDoc.data() || {};
                    customerEmail = uData.email || null;
                    customerName = customerName || uData.name || uData.displayName || '';
                }
            }

            if (!customerEmail) {
                console.log(`[notifyCustomerOnNewMailboxMessage] No customer email found for UID: ${customerUid}`);
                return null;
            }

            const subject = "Neue Nachricht in Ihrem Kundenpostfach | Selena Events";
            const greeting = customerName ? `Hallo ${customerName},` : 'Hallo,';
            const msgSubject = msg.subject ? `<p style="font-size: 15px; line-height: 1.6; color: #111827; font-weight: 600; margin: 12px 0;">Betreff: ${String(msg.subject).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>` : '';

            const html = `
                <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; color: #1a1a1a; border: 1px solid #e8e2d9; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <img src="https://selena.events/assets/logo_dark.png" alt="Selena Events" style="max-height: 70px;">
                    </div>
                    <h2 style="color: #111827; font-size: 20px; margin-bottom: 16px; border-bottom: 2px solid #c89f5d; padding-bottom: 8px;">Neue Nachricht in Ihrem Kundenpostfach</h2>
                    <p style="font-size: 15px; line-height: 1.6; color: #374151;">${greeting}</p>
                    <p style="font-size: 15px; line-height: 1.6; color: #374151;">Sie haben eine neue Nachricht bzw. Rechnung/Mitteilung in Ihrem persönlichen Kundenpostfach bei <strong>Selena Events</strong> erhalten.</p>
                    ${msgSubject}
                    <p style="font-size: 15px; line-height: 1.6; color: #374151;">Klicken Sie auf den folgenden Button, um die Nachricht direkt in Ihrem Kunden-Dashboard einzusehen und zu antworten:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://selena.events/customer-dashboard.html" style="display:inline-block;padding:12px 28px;background-color:#c89f5d;color:#ffffff;text-decoration:none;font-weight:bold;border-radius:4px;font-size:15px;letter-spacing:0.5px;box-shadow: 0 2px 4px rgba(0,0,0,0.1);">Zum Kunden-Dashboard</a>
                    </div>
                    <p style="font-size: 14px; line-height: 1.5; color: #6b7280;">Falls der Button nicht funktioniert, kopieren Sie bitte folgenden Link in Ihren Browser:<br>
                    <a href="https://selena.events/customer-dashboard.html" style="color:#c89f5d;word-break:break-all;">https://selena.events/customer-dashboard.html</a></p>
                    <br>
                    <p style="font-size: 14px; line-height: 1.5; color: #374151; margin-bottom: 0;">Herzliche Grüße,<br><strong>Ihr Team von Selena Events</strong></p>
                </div>
            `;

            await transporter.sendMail({
                from: '"Selena Events" <info@selena.events>',
                to: customerEmail,
                subject: subject,
                html: html
            });

            console.log(`[notifyCustomerOnNewMailboxMessage] Notification sent to ${customerEmail}`);
        } catch (error) {
            console.error('[notifyCustomerOnNewMailboxMessage] Error sending notification:', error);
        }

        return null;
    });

exports.sendInquiryReply = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');
        try {
            const user = await optionalUser(req);
            if (!user) return res.status(401).send('Unauthorized');

            const roleDoc = await admin.firestore().collection('user_roles').doc(user.uid).get();
            const role = roleDoc.exists ? roleDoc.data().role : null;
            if (role !== 'owner' && role !== 'dev') {
                return res.status(403).send('Forbidden: Only owner or dev can reply to inquiries');
            }

            const { messageId, replyText, customerEmail, customerName, originalMessage } = req.body || {};
            if (!messageId || !replyText || !customerEmail) {
                return res.status(400).send('Missing required fields: messageId, replyText, customerEmail');
            }

            const greeting = customerName ? `Hallo ${customerName},` : 'Hallo,';
            const escapedReply = String(replyText).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
            const quotedOriginal = originalMessage ? String(originalMessage).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>') : '';

            const subject = "Antwort auf Ihre Anfrage | Selena Events";
            const html = `
                <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; background-color: #ffffff; color: #1a1a1a; border: 1px solid #e8e2d9; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 25px;">
                        <img src="https://selena.events/assets/logo_dark.png" alt="Selena Events" style="max-height: 70px;">
                    </div>
                    <h2 style="color: #111827; font-size: 20px; margin-bottom: 16px; border-bottom: 2px solid #c89f5d; padding-bottom: 8px;">Antwort auf Ihre Anfrage</h2>
                    <p style="font-size: 15px; line-height: 1.6; color: #374151;">${greeting}</p>
                    <p style="font-size: 15px; line-height: 1.6; color: #374151;">vielen Dank für Ihre Kontaktaufnahme mit Selena Events. Nachfolgend finden Sie unsere Antwort auf Ihre Anfrage:</p>
                    
                    <div style="background-color: #faf7f2; border-left: 4px solid #c89f5d; padding: 16px 20px; margin: 20px 0; border-radius: 0 6px 6px 0;">
                        <p style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #c89f5d; margin-top: 0; margin-bottom: 8px; letter-spacing: 0.5px;">Unsere Antwort:</p>
                        <div style="font-size: 15px; line-height: 1.6; color: #1f2937;">${escapedReply}</div>
                    </div>

                    ${quotedOriginal ? `
                    <div style="background-color: #f9fafb; border-left: 4px solid #d1d5db; padding: 14px 18px; margin: 20px 0; border-radius: 0 6px 6px 0;">
                        <p style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #6b7280; margin-top: 0; margin-bottom: 6px; letter-spacing: 0.5px;">Ihre ursprüngliche Nachricht:</p>
                        <div style="font-size: 14px; line-height: 1.5; color: #4b5563; font-style: italic;">${quotedOriginal}</div>
                    </div>
                    ` : ''}

                    <p style="font-size: 14px; line-height: 1.5; color: #6b7280;">Sollten Sie weitere Fragen haben, können Sie einfach direkt auf diese E-Mail antworten.</p>
                    <br>
                    <p style="font-size: 14px; line-height: 1.5; color: #374151; margin-bottom: 0;">Herzliche Grüße,<br><strong>Ihr Team von Selena Events</strong></p>
                </div>
            `;

            await transporter.sendMail({
                from: '"Selena Events" <info@selena.events>',
                to: customerEmail,
                subject: subject,
                html: html
            });

            await admin.firestore().collection('messages').doc(messageId).update({
                status: 'Beantwortet',
                replyText: replyText,
                repliedAt: admin.firestore.FieldValue.serverTimestamp(),
                repliedBy: user.uid
            });

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error in sendInquiryReply:', error);
            return res.status(500).send(error.message || 'Internal Server Error');
        }
    });
});

// Rate limiting map (in-memory per function instance)
const contactIpRateLimitMap = new Map();

function isContactRateLimited(ip) {
    if (!ip || ip === 'unknown') return false;
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes
    const maxRequests = 5;
    
    let entry = contactIpRateLimitMap.get(ip);
    if (!entry || now - entry.startTime > windowMs) {
        entry = { startTime: now, count: 1 };
        contactIpRateLimitMap.set(ip, entry);
        return false;
    }
    
    entry.count++;
    if (entry.count > maxRequests) {
        return true;
    }
    return false;
}

// Gibberish / Bot string detector
function isGibberishSpam(text) {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    if (!trimmed) return false;
    
    // Check 1: Long single word (> 15 chars) without spaces with mixed casing / high entropy
    if (trimmed.length > 15 && !trimmed.includes(' ')) {
        const hasUpper = /[A-Z]/.test(trimmed);
        const hasLower = /[a-z]/.test(trimmed);
        const upperCount = (trimmed.match(/[A-Z]/g) || []).length;
        const lowerCount = (trimmed.match(/[a-z]/g) || []).length;
        if (hasUpper && hasLower && upperCount > 3 && lowerCount > 3) {
            return true;
        }
    }
    
    // Check 2: Fake epoch date 1970 or 1969
    if (trimmed.includes('1970-01-01') || trimmed.includes('1970-05-31') || trimmed.startsWith('1970-') || trimmed.startsWith('1969-')) {
        return true;
    }
    
    // Check 3: Base64-like random token
    if (/^[A-Za-z0-9+/=]{18,}$/.test(trimmed) && !trimmed.includes(' ')) {
        return true;
    }

    return false;
}

exports.submitContactInquiry = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method Not Allowed' });
        }

        try {
            const data = req.body || {};
            const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';

            // 1. Invisible Honeypot Trap: If bots filled these hidden fields, return fake success without saving
            if (data.company_website_url_val || data.b_contact_fax_num || data.hp_check || data.website_url) {
                console.log(`[AntiSpam] Honeypot triggered from IP ${clientIp}. Silently dropping spam.`);
                return res.status(200).json({ success: true, message: 'Inquiry received' });
            }

            // 2. Interaction Timing Gate: real humans take at least 2.5 seconds
            const elapsed = Number(data.elapsedMs || 0);
            if (data.elapsedMs !== undefined && elapsed < 2200) {
                console.log(`[AntiSpam] Submission too fast (${elapsed}ms) from IP ${clientIp}. Silently dropping spam.`);
                return res.status(200).json({ success: true, message: 'Inquiry received' });
            }

            // 3. IP Rate Limiting
            if (isContactRateLimited(clientIp)) {
                console.warn(`[AntiSpam] Rate limit exceeded for IP: ${clientIp}`);
                return res.status(429).json({ error: 'Zu viele Anfragen. Bitte warten Sie ein paar Minuten.' });
            }

            // 4. Extract fields & sanitize
            const firstName = (data.firstName || data['first-name'] || '').trim();
            const lastName = (data.lastName || data['last-name'] || '').trim();
            const email = (data.email || '').trim().toLowerCase();
            const phone = (data.phone || '').trim();
            const eventType = (data.eventType || data['event-type'] || 'other').trim();
            const location = (data.location || '').trim();
            const date = (data.date || '').trim();
            const message = (data.message || '').trim();

            if (!email || !message) {
                return res.status(400).json({ error: 'E-Mail und Nachricht sind Pflichtfelder.' });
            }

            // 5. Gibberish / Bot Pattern Filter
            if (isGibberishSpam(firstName) || isGibberishSpam(lastName) || isGibberishSpam(message) || isGibberishSpam(location) || isGibberishSpam(date)) {
                console.log(`[AntiSpam] Gibberish spam detected from IP ${clientIp}: ${firstName} ${lastName}. Silently dropping.`);
                return res.status(200).json({ success: true, message: 'Inquiry received' });
            }

            // Reject invalid dates like 1970
            if (date.startsWith('1970') || date.startsWith('1969')) {
                console.log(`[AntiSpam] Invalid 1970 date from IP ${clientIp}. Silently dropping.`);
                return res.status(200).json({ success: true, message: 'Inquiry received' });
            }

            // 6. Save genuine clean message to Firestore
            const docRef = await admin.firestore().collection('messages').add({
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                eventType: eventType,
                location: location,
                date: date,
                message: message,
                status: 'Neu',
                submittedVia: 'secure_gateway',
                clientIp: String(clientIp).split(',')[0].trim(),
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return res.status(200).json({ success: true, id: docRef.id });
        } catch (error) {
            console.error('Error processing contact inquiry:', error);
            return res.status(500).json({ error: 'Interner Serverfehler beim Speichern der Nachricht.' });
        }
    });
});

