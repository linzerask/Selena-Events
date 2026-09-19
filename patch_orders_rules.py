import os

file_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\firestore.rules"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the orders rule
old_rule = """    match /orders/{id} {
      allow create: if true;
      allow read: if staff() || (signedIn() && resource.data.customerUid == request.auth.uid) || (resource.data.customerUid == null);
      allow update, delete: if staff();
    }"""

new_rule = """    match /orders/{id} {
      allow create: if true;
      allow read: if staff();
      allow read: if signedIn() && resource.data.customerUid == request.auth.uid;
      allow update, delete: if staff();
    }"""

if old_rule in content:
    content = content.replace(old_rule, new_rule)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed orders rule in firestore.rules")
else:
    print("Could not find the exact rule block for orders. Manual replacement needed.")
