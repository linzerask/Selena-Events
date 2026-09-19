import re

# Fix shop.js
shop_file = r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\js\shop.js'
with open(shop_file, 'r', encoding='utf-8') as f:
    shop_content = f.read()

shop_content = shop_content.replace('products.push(...newProducts);', 'products.unshift(...newProducts);')
with open(shop_file, 'w', encoding='utf-8') as f:
    f.write(shop_content)

# Fix verleih.js
verleih_file = r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\js\verleih.js'
with open(verleih_file, 'r', encoding='utf-8') as f:
    verleih_content = f.read()

verleih_content = verleih_content.replace('products.push(...newProducts);', 'products.unshift(...newProducts);')
with open(verleih_file, 'w', encoding='utf-8') as f:
    f.write(verleih_content)

# Fix product.html
product_file = r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\shop-items\product.html'
with open(product_file, 'r', encoding='utf-8') as f:
    product_content = f.read()

# Replace Firebase SDK version
product_content = product_content.replace('10.8.0', '10.8.1')

# Replace DOMContentLoaded block
old_block = '''        document.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const productId = parseInt(urlParams.get('id'));
            
            const product = typeof products !== 'undefined' ? products.find(p => p.id === productId) : null;
            
            if (product) {
                document.getElementById('product-container').classList.remove('hidden');
                document.getElementById('product-container').classList.add('flex');'''

new_block = '''        function renderProductPage(product) {
            document.getElementById('product-container').classList.remove('hidden');
            document.getElementById('product-container').classList.add('flex');
            
            document.title = product.title + " | Selena Events";
            document.getElementById('product-img').src = product.img.startsWith('http') ? product.img : '../' + product.img;
            document.getElementById('product-img').alt = product.title;
            document.getElementById('product-title').textContent = product.title;
            document.getElementById('product-price').textContent = product.price + " €";
            
            // Content
            document.getElementById('product-long-desc').innerHTML = product.longDesc || product.shortDesc;
            
            // Thumbnails
            const thumbContainer = document.getElementById('product-thumbnails');
            if (product.images && product.images.length > 0) {
                thumbContainer.innerHTML = product.images.map((imgUrl, index) => 
                    <img src="" class="w-20 h-20 object-cover cursor-pointer rounded border-2  hover:border-gold transition-all" onclick="document.getElementById('product-img').src=''; Array.from(this.parentElement.children).forEach(c => { c.classList.remove('border-gold'); c.classList.add('border-transparent'); }); this.classList.remove('border-transparent'); this.classList.add('border-gold');">
                ).join('');
            } else if (product.img) {
                // Fallback to single image
                thumbContainer.innerHTML = <img src="" class="w-20 h-20 object-cover cursor-pointer rounded border-2 border-gold transition-all">;
            }
            
            // Actions
            document.getElementById('add-to-cart-btn').addEventListener('click', () => {
                if (typeof addToCart === 'function') {
                    addToCart(product.id);
                    const btn = document.getElementById('add-to-cart-btn');
                    const originalText = btn.textContent;
                    btn.textContent = "✓ HINZUGEFÜGT";
                    btn.classList.add('bg-green-500', 'border-green-500');
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.classList.remove('bg-green-500', 'border-green-500');
                    }, 2000);
                }
            });
            
            document.getElementById('add-to-wishlist-btn').addEventListener('click', () => {
                if (typeof addToWishlist === 'function') {
                    addToWishlist(product.id);
                }
            });
            
            updateWishlistButtonUI();
        }

        document.addEventListener('DOMContentLoaded', async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const rawId = urlParams.get('id');
            const numericId = parseInt(rawId);
            
            let product = null;
            if (typeof products !== 'undefined') {
                product = products.find(p => p.id == rawId); // Use == to match string and int
            }
            
            if (product) {
                renderProductPage(product);
            } else if (rawId) {
                // Try fetching from Firebase
                try {
                    const docSnap = await window.firebaseGetDoc(window.firebaseDoc(window.firebaseDb, "custom_products", rawId));
                    if (docSnap.exists()) {
                        const prod = docSnap.data();
                        
                        let featuresHtml = '';
                        if (prod.features && prod.features.length > 0) {
                            featuresHtml = '<h3>Eigenschaften:</h3><ul>' + prod.features.map(f => '<li>' + f + '</li>').join('') + '</ul>';
                        }
                        
                        product = {
                            id: docSnap.id,
                            title: prod.title,
                            img: prod.img || '../assets/logo_dark.png',
                            price: prod.price,
                            shortDesc: prod.subtitle || "",
                            longDesc: '<h2>Beschreibung</h2><p>' + (prod.subtitle || '') + '</p>' + featuresHtml,
                            source: "custom"
                        };
                        
                        // Push to global array so Add to Cart can find it
                        if (typeof products !== 'undefined') {
                            products.push(product);
                        }
                        
                        renderProductPage(product);
                    } else {
                        document.getElementById('error-container').classList.remove('hidden');
                    }
                } catch(e) {
                    console.error("Error fetching custom product:", e);
                    document.getElementById('error-container').classList.remove('hidden');
                }
            } else {
                document.getElementById('error-container').classList.remove('hidden');
            }'''

# Replace the block
product_content = product_content.replace(old_block, new_block)

# Remove the old rendering code since we put it in renderProductPage
old_render_code = '''                document.title = product.title + " | Selena Events";
                document.getElementById('product-img').src = product.img.startsWith('http') ? product.img : '../' + product.img;
                document.getElementById('product-img').alt = product.title;
                document.getElementById('product-title').textContent = product.title;
                document.getElementById('product-price').textContent = product.price + " €";
                
                // Content
                document.getElementById('product-long-desc').innerHTML = product.longDesc || product.shortDesc;
                
                // Thumbnails
                const thumbContainer = document.getElementById('product-thumbnails');
                if (product.images && product.images.length > 0) {
                    thumbContainer.innerHTML = product.images.map((imgUrl, index) => 
                        <img src="" class="w-20 h-20 object-cover cursor-pointer rounded border-2  hover:border-gold transition-all" onclick="document.getElementById('product-img').src=''; Array.from(this.parentElement.children).forEach(c => { c.classList.remove('border-gold'); c.classList.add('border-transparent'); }); this.classList.remove('border-transparent'); this.classList.add('border-gold');">
                    ).join('');
                } else if (product.img) {
                    // Fallback to single image
                    thumbContainer.innerHTML = <img src="" class="w-20 h-20 object-cover cursor-pointer rounded border-2 border-gold transition-all">;
                }
                
                // Actions
                document.getElementById('add-to-cart-btn').addEventListener('click', () => {
                    if (typeof addToCart === 'function') {
                        addToCart(product.id);
                        const btn = document.getElementById('add-to-cart-btn');
                        const originalText = btn.textContent;
                        btn.textContent = "✓ HINZUGEFÜGT";
                        btn.classList.add('bg-green-500', 'border-green-500');
                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.classList.remove('bg-green-500', 'border-green-500');
                        }, 2000);
                    }
                });
                
                document.getElementById('add-to-wishlist-btn').addEventListener('click', () => {
                    if (typeof addToWishlist === 'function') {
                        addToWishlist(product.id);
                    }
                });
                
                updateWishlistButtonUI();
                
            } else {
                document.getElementById('error-container').classList.remove('hidden');
            }
        });'''

product_content = product_content.replace(old_render_code, '        });')

with open(product_file, 'w', encoding='utf-8') as f:
    f.write(product_content)

print("Done")
