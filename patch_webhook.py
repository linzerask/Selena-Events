import os

filepath = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\functions\index.js"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """                    tx.update(orderRef, { status: 'Bezahlt', stripeSessionId: session.id, stockDeducted: true, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
                });
                return res.json({ received: true });"""

replacement = """                    tx.update(orderRef, { status: 'Bezahlt', stripeSessionId: session.id, stockDeducted: true, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
                    
                    // Award Loyalty Points based on final amount paid minus transport fee
                    if (order.customerUid) {
                        const finalPaid = session.amount_total ? session.amount_total / 100 : 0;
                        const transportFee = order.transportFee || 0;
                        let pointsEarned = Math.max(0, Math.floor(finalPaid - transportFee));
                        
                        if (pointsEarned > 0) {
                            const userRef = admin.firestore().collection('users').doc(order.customerUid);
                            const userSnap = await tx.get(userRef);
                            if (userSnap.exists) {
                                const userData = userSnap.data();
                                tx.update(userRef, { loyaltyPoints: admin.firestore.FieldValue.increment(pointsEarned) });
                                
                                // Referral Reward (10%)
                                if (userData.referredByUid) {
                                    const referrerPoints = Math.round(pointsEarned * 0.1);
                                    if (referrerPoints > 0) {
                                        const referrerRef = admin.firestore().collection('users').doc(userData.referredByUid);
                                        tx.update(referrerRef, { loyaltyPoints: admin.firestore.FieldValue.increment(referrerPoints) });
                                    }
                                }
                            }
                        }
                    }
                });
                return res.json({ received: true });"""

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched stripeWebhook")
