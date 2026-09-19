import os

filepath = r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\functions\index.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = "payment_method_types: ['card', 'sofort', 'klarna', 'paypal'], "
if target in content:
    content = content.replace(target, "")
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched!")
else:
    print("Not found.")
