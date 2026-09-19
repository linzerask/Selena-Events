import os

base = r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2'
targets = [
    'js/shop.js', 'js/verleih.js',
    'en/js/shop.js', 'en/js/verleih.js',
    'ro/js/shop.js', 'ro/js/verleih.js'
]

shop_code = """
// === CUSTOM PRODUCTS LOGIC ===
window.fetchCustomProducts = async function() {
    try {
        const q = window.firebaseQuery(
            window.firebaseCollection(window.firebaseDb, "custom_products"),
            window.firebaseWhere("visible", "==", true),
            window.firebaseWhere("target", "==", "shop")
        );
        const querySnapshot = await window.firebaseGetDocs(q);
        
        let newProducts = [];
        querySnapshot.forEach((doc) => {
            const prod = doc.data();
            
            // Build long description with features
            let featuresHtml = '';
            if (prod.features && prod.features.length > 0) {
                featuresHtml = '<h3>Eigenschaften:</h3><ul>' + prod.features.map(f => '<li>' + f + '</li>').join('') + '</ul>';
            }
            
            newProducts.push({
                id: doc.id,
                title: prod.title,
                img: prod.img || '../assets/logo_dark.png',
                price: prod.price,
                category: prod.category || "Neu",
                tags: prod.isPremium ? ["Custom", "Premium"] : ["Custom"],
                images: prod.images || [prod.img || '../assets/logo_dark.png'],
                shortDesc: prod.subtitle || "",
                longDesc: '<h2>Beschreibung</h2><p>' + (prod.subtitle || '') + '</p>' + featuresHtml,
                source: "custom"
            });
        });
        
        if (newProducts.length > 0) {
            // Check to avoid duplicates on re-fetch
            const existingProductIds = products.filter(p => p.source === 'custom').map(p => p.id);
            newProducts = newProducts.filter(p => !existingProductIds.includes(p.id));
            
            products.unshift(...newProducts);
            if (typeof applyFilters === 'function') applyFilters();
        }
    } catch (error) {
        console.error("Error fetching custom products:", error);
    }
};
"""

verleih_code = shop_code.replace('window.firebaseWhere("target", "==", "shop")', 'window.firebaseWhere("target", "==", "verleih")')

for t in targets:
    filepath = os.path.join(base, t.replace('/', '\\'))
    if not os.path.exists(filepath): continue
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # FIX 1: Fix source in addToCart
    if 'source: currentSource' in content:
        content = content.replace('source: currentSource', 'source: product.source || currentSource')
    if "source: 'shop'" in content:
        content = content.replace("source: 'shop'", "source: product.source || 'shop'")
    if 'source: "shop"' in content:
        content = content.replace('source: "shop"', 'source: product.source || "shop"')
    if "source: 'verleih'" in content:
        content = content.replace("source: 'verleih'", "source: product.source || 'verleih'")
    if 'source: "verleih"' in content:
        content = content.replace('source: "verleih"', 'source: product.source || "verleih"')

    # FIX 2: custom products
    if 'fetchCustomProducts' not in content:
        code_to_add = shop_code if 'shop' in t else verleih_code
        content += "\n" + code_to_add
        if 'window.fetchCustomPackages();' in content:
            content = content.replace('window.fetchCustomPackages();', 'window.fetchCustomPackages();\n        if(typeof window.fetchCustomProducts === "function") window.fetchCustomProducts();')

    # FIX 3: update Custom tag logic from patch_shop.py
    target_tag = 'tags: ["Custom"],'
    if target_tag in content:
        replacement = 'tags: prod.isPremium ? ["Custom", "Premium"] : ["Custom"],\n                  images: prod.images || [prod.img || \'assets/logo_dark.png\'],'
        content = content.replace(target_tag, replacement)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
