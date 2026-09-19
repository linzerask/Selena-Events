import os

filepath = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\js\dashboard.js"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Skip unpaid stripe checkouts
target1 = "data._id = doc.id;"
if "Zahlung Ausstehend (Stripe)" not in content:
    content = content.replace(
        target1,
        "data._id = doc.id;\n            if (data.status === 'Zahlung Ausstehend (Stripe)') return; // Skip unpaid stripe checkouts"
    )

# 2. Fix newOrdersCount logic
target2 = 'if (data.status === "Neu") newOrdersCount++;'
content = content.replace(
    target2,
    'if (data.status === "Neu" || data.status === "Bezahlt") newOrdersCount++;'
)

# 3. Fix markOrderAsRead
target3 = "if ((!currentStatus || currentStatus === 'Neu') && window.db && window.firebaseSetDoc"
content = content.replace(
    target3,
    "if ((!currentStatus || currentStatus === 'Neu' || currentStatus === 'Bezahlt') && window.db && window.firebaseSetDoc"
)

# 4. Fix status badge rendering (2 places)
# There are two places with: const statusBadge = data.status === 'Angesehen' ? `<span class="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded ml-2">Angesehen</span>` : `<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2">Neu</span>`;
target4 = "const statusBadge = data.status === 'Angesehen' ? `<span class=\"bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded ml-2\">Angesehen</span>` : `<span class=\"bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2\">Neu</span>`;"
replacement4 = "const statusBadge = data.status === 'Angesehen' ? `<span class=\"bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded ml-2\">Angesehen</span>` : data.status === 'Bezahlt' ? `<span class=\"bg-green-100 text-green-800 text-xs px-2 py-1 rounded ml-2\">Neu (Bezahlt)</span>` : `<span class=\"bg-red-100 text-red-800 text-xs px-2 py-1 rounded ml-2\">Neu</span>`;"
content = content.replace(target4, replacement4)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
print("dashboard.js patched")
