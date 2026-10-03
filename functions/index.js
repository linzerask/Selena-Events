const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY || "sk_test_PLACEHOLDER");
const cors = require("cors")({ origin: true });
const catalog = require("./catalog.json"); // We will generate this

admin.initializeApp();

exports.createStripeCheckout = functions.https.onRequest((req, res) => {
    cors(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).send("Method Not Allowed");
        }

        try {
            const { items, customerEmail, successUrl, cancelUrl, orderId } = req.body;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).send("Invalid cart items");
            }

            const lineItems = [];
            
            // Validate items against catalog or custom_packages to prevent price tampering
            for (const item of items) {
                let trustedItem = null;

                if (item.source === 'package') {
                    // Fetch package from Firestore
                    const pkgDoc = await admin.firestore().collection('custom_packages').doc(item.id).get();
                    if (pkgDoc.exists) {
                        const pkg = pkgDoc.data();
                        trustedItem = {
                            title: pkg.title,
                            price: pkg.price,
                            images: pkg.items && pkg.items.length > 0 ? 
                                (pkg.items[0].images ? pkg.items[0].images : (pkg.items[0].img ? [pkg.items[0].img] : [])) 
                                : []
                        };
                    }
                } else {
                    // Find item in our trusted catalog
                    trustedItem = catalog.find(p => p.id === item.id && p.source === item.source);
                }
                
                if (!trustedItem) {
                    console.error("Item not found in trusted sources:", item.id, item.source);
                    continue; // Skip invalid items
                }

                // Handle nested arrays gracefully
                let imageArray = [];
                if (trustedItem.images && trustedItem.images.length > 0) {
                    imageArray = Array.isArray(trustedItem.images[0]) ? trustedItem.images[0] : [trustedItem.images[0]];
                } else if (trustedItem.img) {
                    imageArray = [trustedItem.img];
                }

                lineItems.push({
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: trustedItem.title,
                            images: imageArray,
                        },
                        unit_amount: Math.round(trustedItem.price * 100), // Stripe expects cents
                    },
                    quantity: item.quantity,
                });
            }

            if (lineItems.length === 0) {
                return res.status(400).send("No valid items found");
            }

            // Create Stripe Checkout Session
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card", "sofort", "klarna", "paypal"],
                customer_email: customerEmail,
                line_items: lineItems,
                mode: "payment",
                metadata: {
                    orderId: orderId || ''
                },
                success_url: successUrl || "https://selena.events/shop.html?checkout=success",
                cancel_url: cancelUrl || "https://selena.events/shop.html?checkout=cancelled",
            });

            res.status(200).json({ id: session.id, url: session.url });
            
        } catch (error) {
            console.error("Stripe Error:", error);
            res.status(500).send("Internal Server Error: " + error.message);
        }
    });
});

exports.stripeWebhook = functions.https.onRequest((req, res) => {
    let event;

    try {
        const sig = req.headers['stripe-signature'];
        // Use raw body for signature verification. Firebase provides req.rawBody
        event = stripe.webhooks.constructEvent(
            req.rawBody, 
            sig, 
            process.env.STRIPE_WEBHOOK_SECRET || "whsec_test_PLACEHOLDER"
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
            // Update Firestore order status to Bezahlt
            return admin.firestore().collection('orders').doc(orderId).update({
                status: 'Bezahlt',
                stripeSessionId: session.id,
                updatedAt: new Date().toISOString()
            }).then(() => {
                res.json({received: true});
            }).catch(err => {
                console.error("Error updating order:", err);
                res.status(500).end();
            });
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
        pass: process.env.SMTP_PASSWORD || functions.config().smtp?.password || "fallback",
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
        let itemsHtml = '<ul>';
        if (orderData.items && Array.isArray(orderData.items)) {
            orderData.items.forEach(item => {
                const title = item.title || item.name || "Artikel";
                const price = item.price || 0;
                const quantity = item.quantity || 1;
                calculatedTotal += (price * quantity);
                itemsHtml += `<li>${quantity}x ${title} - ${(price * quantity).toFixed(2)}â‚¬</li>`;
            });
        }
        itemsHtml += '</ul>';
        
        const finalTotal = orderData.totalAmount || orderData.totalPrice || calculatedTotal;

        const subject = isVerleih 
            ? 'Ihre Mietanfrage bei Selena Events' 
            : 'Ihre BestellbestÃ¤tigung bei Selena Events';

        const body = `
            <h2>Hallo${orderData.customerName || orderData.name ? ' ' + (orderData.customerName || orderData.name) : ''},</h2>
            <p>Vielen Dank fÃ¼r Ihre ${isVerleih ? 'Mietanfrage' : 'Bestellung'} bei Selena Events!</p>
            <h3>Ihre Ãœbersicht:</h3>
            ${itemsHtml}
            <p><strong>Gesamtbetrag: ${finalTotal.toFixed(2)}â‚¬</strong></p>
            ${isVerleih ? '<p>Wir prÃ¼fen Ihre Anfrage fÃ¼r die gewÃ¼nschten Daten und melden uns in KÃ¼rze mit weiteren Details bei Ihnen.</p>' : '<p>Wir werden Ihre Bestellung schnellstmÃ¶glich bearbeiten. Sobald es Neuigkeiten gibt, informieren wir Sie.</p>'}
            <br>
            <p>Herzliche GrÃ¼ÃŸe,<br>Ihr Team von Selena Events</p>
            <div style="margin-top: 30px;">
                <img src="https://selena.events/assets/logo_dark.png" alt="Selena Events" style="max-height: 80px;">
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
                <h2>Willkommen im VIP Club${name ? ', ' + name : ''}!</h2>
                <p>Vielen Dank fÃ¼r Ihre Registrierung bei Selena Events. Ihr Konto wurde erfolgreich erstellt und ist sofort einsatzbereit!</p>
                <p>Als Mitglied sammeln Sie ab sofort mit jeder Buchung Treuepunkte und erhalten exklusive Vorteile.</p>
                <br>
                <p><a href="https://selena.events" style="display:inline-block;padding:10px 20px;background-color:#c89f5d;color:white;text-decoration:none;font-weight:bold;">Besuchen Sie unsere Webseite</a></p>
                <br>
                <p>Herzliche GrÃ¼ÃŸe,<br>Ihr Team von Selena Events</p>
                <div style="margin-top: 30px;">
                    <img src="https://selena.events/assets/logo_dark.png" alt="Selena Events" style="max-height: 80px;">
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
            
            const subject = "Passwort zurÃ¼cksetzen | Selena Events";
            const body = `
                <h2>Passwort zurÃ¼cksetzen</h2>
                <p>Wir haben eine Anfrage zum ZurÃ¼cksetzen Ihres Passworts erhalten.</p>
                <p><a href="${customLink}" style="display:inline-block;padding:10px 20px;background-color:#c89f5d;color:white;text-decoration:none;font-weight:bold;">Neues Passwort vergeben</a></p>
                <p>Wenn Sie diese Anfrage nicht gestellt haben, kÃ¶nnen Sie diese E-Mail einfach ignorieren.</p>
                <br>
                <p>Herzliche GrÃ¼ÃŸe,<br>Ihr Team von Selena Events</p>
                <div style="margin-top: 30px;">
                    <img src="https://selena.events/assets/logo_dark.png" alt="Selena Events" style="max-height: 80px;">
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

