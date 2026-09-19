import os

base_dir = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website"

product_files = []
for root, dirs, files in os.walk(base_dir):
    for f in files:
        if f == "product.html":
            if "shop-items" in root or "verleih-items" in root:
                product_files.append(os.path.join(root, f))

for file_path in product_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Add product-tags div if missing
    if 'id="product-tags"' not in content:
        content = content.replace(
            '<img id="product-img" src="" alt="" class="w-full h-auto max-h-[60vh] object-contain mb-4">',
            '<img id="product-img" src="" alt="" class="w-full h-auto max-h-[60vh] object-contain mb-4">\n                    <div id="product-tags" class="absolute top-4 right-4 flex flex-col gap-2 z-10"></div>'
        )
        content = content.replace(
            '<img id="product-img" src="" alt="" class="w-full h-auto max-h-[60vh] object-contain">',
            '<img id="product-img" src="" alt="" class="w-full h-auto max-h-[60vh] object-contain">\n                    <div id="product-tags" class="absolute top-4 right-4 flex flex-col gap-2 z-10"></div>'
        )
    
    # 2. Add javascript logic to render tags
    tag_logic = """
            document.getElementById('product-price').textContent = product.price + " \\u20ac";
            
            // Render tags
            const tagsContainer = document.getElementById('product-tags');
            if (tagsContainer && product.tags && product.tags.length > 0) {
                tagsContainer.innerHTML = product.tags.map(tag => {
                    if (tag === 'Premium') {
                        return '<div class="bg-gold text-white text-xs px-3 py-1 uppercase tracking-widest rounded shadow-sm">Premium</div>';
                    } else if (tag !== 'Custom') {
                        return `<div class="bg-gray-800 text-white text-xs px-3 py-1 uppercase tracking-widest rounded shadow-sm">${tag}</div>`;
                    }
                    return '';
                }).join('');
            } else if (tagsContainer) {
                tagsContainer.innerHTML = '';
            }
"""
    if "const tagsContainer = document.getElementById('product-tags');" not in content:
        # replace the price line with the price line + tag logic
        content = content.replace(
            "document.getElementById('product-price').textContent = product.price + \" \\u20ac\";",
            tag_logic
        ).replace(
            "document.getElementById('product-price').textContent = product.price + \" â‚¬\";",
            tag_logic
        ).replace(
            "document.getElementById('product-price').textContent = product.price + \" €\";",
            tag_logic
        )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Patched {len(product_files)} files.")
