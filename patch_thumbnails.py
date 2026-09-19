import os

files_to_patch = [
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\en\shop-items\product.html",
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\en\verleih-items\product.html",
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\ro\shop-items\product.html",
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\ro\verleih-items\product.html"
]

for file_path in files_to_patch:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. HTML change
    # Find: <img id="product-img" src="" alt="" class="w-full h-auto max-h-[60vh] object-contain">
    # Replace with: <img id="product-img" src="" alt="" class="w-full h-auto max-h-[60vh] object-contain mb-4">
    # And add the thumbnails div
    
    if 'id="product-thumbnails"' not in content:
        content = content.replace(
            '<div class="w-full md:w-1/2 bg-gray-50 p-8 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-gray-100">',
            '<div class="w-full md:w-1/2 bg-gray-50 p-8 flex flex-col items-center justify-start relative border-b md:border-b-0 md:border-r border-gray-100">'
        )
        content = content.replace(
            'class="w-full h-auto max-h-[60vh] object-contain">',
            'class="w-full h-auto max-h-[60vh] object-contain mb-4">'
        )
        content = content.replace(
            '<div id="product-tags" class="absolute top-4 right-4 flex flex-col gap-2 z-10"></div>\n                  </div>',
            '<div id="product-tags" class="absolute top-4 right-4 flex flex-col gap-2 z-10"></div>\n                      <div id="product-thumbnails" class="flex gap-2 overflow-x-auto w-full pb-2"></div>\n                  </div>'
        )
        
    # 2. Javascript change
    js_logic = """
            // Thumbnails
            const thumbContainer = document.getElementById('product-thumbnails');
            if (product.images && product.images.length > 0) {
                thumbContainer.innerHTML = product.images.map((imgUrl, index) => {
                    const isHttp = imgUrl.startsWith('http');
                    const src = isHttp ? imgUrl : '../../' + imgUrl;
                    const borderClass = index === 0 ? 'border-gold' : 'border-transparent';
                    return `<img src="${src}" class="w-20 h-20 object-cover cursor-pointer rounded border-2 ${borderClass} hover:border-gold transition-all" onclick="document.getElementById('product-img').src='${src}'; Array.from(this.parentElement.children).forEach(c => { c.classList.remove('border-gold'); c.classList.add('border-transparent'); }); this.classList.remove('border-transparent'); this.classList.add('border-gold');">`;
                }).join('');
            } else if (product.img) {
                const isHttp = product.img.startsWith('http');
                const src = isHttp ? product.img : '../../' + product.img;
                thumbContainer.innerHTML = `<img src="${src}" class="w-20 h-20 object-cover cursor-pointer rounded border-2 border-gold transition-all">`;
            }
"""
    if "const thumbContainer = document.getElementById('product-thumbnails');" not in content:
        content = content.replace(
            "document.getElementById('product-long-desc').innerHTML = product.longDesc || product.shortDesc;",
            "document.getElementById('product-long-desc').innerHTML = product.longDesc || product.shortDesc;\n" + js_logic
        )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Thumbnail patch applied to localized files.")
