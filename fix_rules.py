import os

rules_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\firestore.rules"

with open(rules_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace orders rule
old_orders_rule = """    match /orders/{id} {
      allow read: if staff() || (signedIn() && resource.data.customerUid == request.auth.uid);
      allow write: if staff();
    }"""
new_orders_rule = """    match /orders/{id} {
      allow create: if true;
      allow read: if staff() || (signedIn() && resource.data.customerUid == request.auth.uid) || (resource.data.customerUid == null);
      allow update, delete: if staff();
    }
    match /booked_dates/{id} {
      allow read, create: if true;
      allow update, delete: if staff();
    }"""

if old_orders_rule in content:
    content = content.replace(old_orders_rule, new_orders_rule)
    with open(rules_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated firestore.rules for orders and booked_dates")
else:
    print("Could not find the exact orders rule string to replace.")
