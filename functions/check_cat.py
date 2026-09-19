import json, re

with open('catalog.json', encoding='utf-8') as f:
    cat = json.load(f)

cat_shop = [str(x['id']) for x in cat if x.get('source') == 'shop']
cat_verleih = [str(x['id']) for x in cat if x.get('source') == 'verleih']

with open('../js/shop.js', encoding='utf-8') as f:
    shop = f.read()
    
with open('../js/verleih.js', encoding='utf-8') as f:
    verleih = f.read()

shop_ids = re.findall(r'"id"\s*:\s*(\d+)', shop)
verleih_ids = re.findall(r'"id"\s*:\s*(\d+)', verleih)

print('Shop total in js:', len(shop_ids))
print('Verleih total in js:', len(verleih_ids))
print('Shop total in catalog:', len(cat_shop))
print('Verleih total in catalog:', len(cat_verleih))

print('Shop missing:', [x for x in shop_ids if x not in cat_shop])
print('Verleih missing:', [x for x in verleih_ids if x not in cat_verleih])
