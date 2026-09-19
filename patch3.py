import os

base_dir = r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website'

# List of files to fix imports
html_files = [
    'verleih.html', 'shop.html',
    r'en\verleih.html', r'en\shop.html',
    r'ro\verleih.html', r'ro\shop.html'
]

for file in html_files:
    path = os.path.join(base_dir, file)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Make sure query, where, getDocs are imported
        if 'firebase-firestore.js' in content:
            # find the import line
            import_line = [line for line in content.split('\n') if 'firebase-firestore.js' in line][0]
            if 'query' not in import_line:
                new_import = import_line.replace(' } from', ', query, where, getDocs } from')
                content = content.replace(import_line, new_import)
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Fixed imports in {file}")

import shutil
# Copy shop-items/product.html to verleih-items/product.html because they should have the same logic
# Wait! Let's check if there are differences first. We just copy the logic.
src = os.path.join(base_dir, r'shop-items\product.html')
dst = os.path.join(base_dir, r'verleih-items\product.html')

if os.path.exists(dst):
    shutil.copy(src, dst)
    print("Copied product.html to verleih-items")

