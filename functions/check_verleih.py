import json, re

with open('../js/verleih.js', encoding='utf-8') as f:
    verleih = f.read()

with open('catalog.json', encoding='utf-8') as f:
    cat = json.load(f)

print("Verleih JS products:")
matches = re.findall(r'"id"\s*:\s*(\w+|".*?").*?"title"\s*:\s*"(.*?)"', verleih, re.DOTALL)
for m in matches:
    print(m)

print("\nCatalog JSON verleih products:")
for c in cat:
    if c.get('source') == 'verleih':
        print((str(c.get('id')), c.get('title')))
