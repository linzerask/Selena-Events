import re

with open('index.js', 'r', encoding='utf-8') as f:
    content = f.read()

# First replace all custom_packages back to custom_products
content = content.replace("collection('custom_packages')", "collection('custom_products')")

# Now fix the ones that ACTUALLY should be custom_packages:
# 1. item.source === 'package'
content = content.replace(
    "if (item.source === 'package') {\n        const snap = await admin.firestore().collection('custom_products')",
    "if (item.source === 'package') {\n        const snap = await admin.firestore().collection('custom_packages')"
)

# 2. My fallback should query both!
fallback = """    // Fallback: If not found in catalog, maybe it's a custom product whose source was overwritten by the frontend cart bug
    let customSnap = await admin.firestore().collection('custom_products').doc(String(item.id)).get();
    if (!customSnap.exists) {
        customSnap = await admin.firestore().collection('custom_packages').doc(String(item.id)).get();
    }
    
    if (customSnap.exists) {
        const cp = customSnap.data();
        if (cp.visible !== false && cp.visibleInShop !== false && !['request', 'from'].includes(cp.priceMode) && cp.transportMode !== 'quote') {
            return { 
                id: customSnap.id, 
                source: 'custom', 
                title: cp.title, 
                price: Number(cp.price), 
                images: cp.images || [cp.img].filter(Boolean), 
                trackStock: !!cp.trackStock, 
                stock: Number(cp.stock || 0), 
                transportEnabled: !!cp.transportEnabled, 
                transportMode: cp.transportMode || 'none', 
                transportFlatFee: Number(cp.transportFlatFee || 0) 
            };
        }
    }
    return null;"""

content = re.sub(
    r"    // Fallback: If not found in catalog.*?return null;",
    fallback,
    content,
    flags=re.DOTALL
)

with open('index.js', 'w', encoding='utf-8') as f:
    f.write(content)
