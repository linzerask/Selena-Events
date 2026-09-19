import os

base = r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2'
targets = [
    'js/shop.js', 'js/verleih.js',
    'en/js/shop.js', 'en/js/verleih.js',
    'ro/js/shop.js', 'ro/js/verleih.js'
]

for t in targets:
    filepath = os.path.join(base, t.replace('/', '\\'))
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # We need to replace `item.source === currentSource` and `i.source === currentSource`
    # and `i.source !== currentSource`
    
    # 1. addToCart
    content = content.replace(
        "item.source === currentSource",
        "(item.source === currentSource || item.source === 'custom' || item.source === 'package')"
    )
    
    # 2. removeFromCart, updateCartUI, openCheckout
    content = content.replace(
        "i.source === currentSource",
        "(i.source === currentSource || i.source === 'custom' || i.source === 'package')"
    )
    
    # 3. clear cart after checkout
    content = content.replace(
        "i.source !== currentSource",
        "(i.source !== currentSource && i.source !== 'custom' && i.source !== 'package')"
    )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Patched {filepath}")
