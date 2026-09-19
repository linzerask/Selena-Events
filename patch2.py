product_file = r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\shop-items\product.html'
with open(product_file, 'r', encoding='utf-8') as f:
    product_content = f.read()

old_block = '''        document.addEventListener('DOMContentLoaded', async () => {
            const urlParams = new URLSearchParams(window.location.search);'''

new_block = '''        (async () => {
            const urlParams = new URLSearchParams(window.location.search);'''

product_content = product_content.replace(old_block, new_block)
product_content = product_content.replace('});\n    </script>', '})();\n    </script>')

with open(product_file, 'w', encoding='utf-8') as f:
    f.write(product_content)
print("Fixed product.html")
