import os

file_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\firestore.rules"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the custom_packages rule
old_rule = """    match /custom_packages/{id} {
      allow read: if resource.data.visible == true || staff();
      allow write: if staff();
    }"""

new_rule = """    match /custom_packages/{id} {
      allow read: if resource.data.visibleInShop == true || staff();
      allow write: if staff();
    }"""

if old_rule in content:
    content = content.replace(old_rule, new_rule)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed custom_packages rule in firestore.rules")
else:
    print("Could not find the exact rule block. Manual replacement needed.")
