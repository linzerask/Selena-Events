import os

filepath = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\register.html"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = """                            // Give referrer 100 points and add this user's UID to their list
                            await updateDoc(doc(db, "users", referrerDoc.id), {
                                loyaltyPoints: increment(100),
                                referredUsers: arrayUnion(user.uid)
                            });"""

replacement = """                            // Add this user's UID to the referrer's list
                            await updateDoc(doc(db, "users", referrerDoc.id), {
                                referredUsers: arrayUnion(user.uid)
                            });
                            // Store the referrer's UID on the NEW user's profile for future checkout points
                            await updateDoc(doc(db, "users", user.uid), {
                                referredByUid: referrerDoc.id
                            });"""

content = content.replace(target, replacement)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched register.html")
