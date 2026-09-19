import os

base = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2"
targets = [
    'customer-dashboard.html',
    'en/customer-dashboard.html',
    'ro/customer-dashboard.html'
]

for t in targets:
    filepath = os.path.join(base, t.replace('/', '\\'))
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    target = """                    if (points >= 1000) {
                        tier = 'Platinum'; discount = '15%'; tierStart = 1000; tierEnd = 5000;
                    } else if (points >= 500) {
                        tier = 'Gold'; discount = '10%'; tierStart = 500; tierEnd = 1000;
                    } else if (points >= 100) {
                        tier = 'Silver'; discount = '5%'; tierStart = 100; tierEnd = 500;
                    }"""

    replacement = """                    if (points >= 2500) {
                        tier = 'Platinum'; discount = '15%'; tierStart = 2500; tierEnd = 10000;
                    } else if (points >= 1000) {
                        tier = 'Gold'; discount = '10%'; tierStart = 1000; tierEnd = 2500;
                    } else if (points >= 500) {
                        tier = 'Silver'; discount = '5%'; tierStart = 500; tierEnd = 1000;
                    } else {
                        tier = 'Bronze'; discount = '0%'; tierStart = 0; tierEnd = 500;
                    }"""

    content = content.replace(target, replacement)
    
    # Also fix the MAX label
    target2 = "document.getElementById('tier-end').textContent = tierEnd === 5000 ? 'MAX' : tierEnd;"
    replacement2 = "document.getElementById('tier-end').textContent = tierEnd === 10000 ? 'MAX' : tierEnd;"
    content = content.replace(target2, replacement2)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Patched {t}")
