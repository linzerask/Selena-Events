import os
path = r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\verleih-items\product.html'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('<script src="../js/shop.js"></script>', '<script src="../js/verleih.js"></script>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed verleih.js in verleih-items/product.html")
