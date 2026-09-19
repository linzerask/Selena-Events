import os
import re

base_dir = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website"

for lang in ['', 'en\\\\', 'ro\\\\']:
    js_path = os.path.join(base_dir, lang.replace('\\\\', '\\'), 'js', 'shop.js')
    if os.path.exists(js_path):
        with open(js_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = re.sub(r'let currentMaxPrice = \d+;', 'let currentMaxPrice = 5000;', content)
        
        with open(js_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
    html_path = os.path.join(base_dir, lang.replace('\\\\', '\\'), 'shop.html')
    if os.path.exists(html_path):
        with open(html_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = re.sub(r'max="[0-9]+"', 'max="5000"', content)
        content = re.sub(r'value="[0-9]+" class="w-full h-1', 'value="5000" class="w-full h-1', content)
        content = re.sub(r'value="[0-9]+" class="w-full h-2', 'value="5000" class="w-full h-2', content)
        
        # Replace the price display text using regex without non-ascii chars
        content = re.sub(r'<span id="price-display"[^>]*>[0-9]+\s*.+?</span>', '<span id="price-display" class="font-semibold text-gray-900">5000 €</span>', content)
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(content)

print("Prices patched via python")
