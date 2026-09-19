import os
import re

base = r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2'
targets = [
    'js/shop.js', 'js/verleih.js',
    'en/js/shop.js', 'en/js/verleih.js',
    'ro/js/shop.js', 'ro/js/verleih.js'
]

for t in targets:
    filepath = os.path.join(base, t.replace('/', '\\'))
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. We need to add eventDate and postcode to the variables read from the DOM
    if "const phone = document.getElementById('checkout-phone').value;" in content:
        # Check if already patched
        if "const eventDate =" not in content:
            content = content.replace(
                "const phone = document.getElementById('checkout-phone').value;",
                "const phone = document.getElementById('checkout-phone').value;\n        const eventDate = document.getElementById('checkout-event-date') ? document.getElementById('checkout-event-date').value : '';\n        const postcode = document.getElementById('checkout-postcode') ? document.getElementById('checkout-postcode').value : '';"
            )
            
    # 2. Add eventDate and postcode to orderData
    if "customerPhone: phone," in content:
        if "customerEventDate:" not in content:
            content = content.replace(
                "customerPhone: phone,",
                "customerPhone: phone,\n            customerEventDate: eventDate,\n            customerPostcode: postcode,"
            )

    # 3. Modify the fetch payload
    if "customerEmail: email, orderId: docRef.id," in content:
        content = content.replace(
            "customerEmail: email, orderId: docRef.id,",
            "customer: { name, email, address, postcode, phone, eventDate, notes }, orderId: docRef.id,"
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f"Patched {filepath}")
