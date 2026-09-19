import re

with open('index.js', 'r', encoding='utf-8') as f:
    content = f.read()

fallback_code = """    const p = catalog.find(x => String(x.id) === String(item.id) && x.source === item.source);
    if (p) return { ...p, id: String(p.id), price: Number(p.price), trackStock: !!p.trackStock, stock: Number(p.stock || 0), transportEnabled: !!p.transportEnabled, transportMode: p.transportMode || 'none', transportFlatFee: Number(p.transportFlatFee || 0) };
    
    // Fallback: If not found in catalog, maybe it's a custom product whose source was overwritten by the frontend cart bug
    const customSnap = await admin.firestore().collection('custom_products').doc(String(item.id)).get();
    if (customSnap.exists) {
        const cp = customSnap.data();
        if (cp.visible !== false && !['request', 'from'].includes(cp.priceMode) && cp.transportMode !== 'quote') {
            return { id: customSnap.id, source: 'custom', title: cp.title, price: Number(cp.price), images: cp.images || [cp.img].filter(Boolean), trackStock: !!cp.trackStock, stock: Number(cp.stock || 0), transportEnabled: !!cp.transportEnabled, transportMode: cp.transportMode || 'none', transportFlatFee: Number(cp.transportFlatFee || 0) };
        }
    }
    return null;"""

content = re.sub(
    r"const p = catalog\.find\(x => String\(x\.id\) === String\(item\.id\) && x\.source === item\.source\);\s*return p \? \{ \.\.\.p, id: String\(p\.id\), price: Number\(p\.price\), trackStock: !!p\.trackStock, stock: Number\(p\.stock \|\| 0\), transportEnabled: !!p\.transportEnabled, transportMode: p\.transportMode \|\| 'none', transportFlatFee: Number\(p\.transportFlatFee \|\| 0\) \} : null;",
    fallback_code,
    content
)

with open('index.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched index.js with fallback code")
