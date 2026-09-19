import os

files_to_patch = [
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\en\shop-items\product.html",
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\en\verleih-items\product.html",
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\ro\shop-items\product.html",
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\ro\verleih-items\product.html"
]

for file_path in files_to_patch:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix the main image path logic
        content = content.replace(
            "document.getElementById('product-img').src = product.img.startsWith('http') ? product.img : '../../' + product.img;",
            "document.getElementById('product-img').src = product.img.startsWith('http') ? product.img : '../' + product.img;"
        )

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched image paths in {file_path}")
