import os
import glob

# Find all HTML files
html_files = []
for root, dirs, files in os.walk(r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2"):
    for file in files:
        if file.endswith('.html'):
            html_files.append(os.path.join(root, file))

for file_path in html_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    modified = False
    
    # Fix 1: Add scrolling to checkout modal
    old_modal_class = 'relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl p-8 transform transition-all'
    new_modal_class = 'relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 sm:p-8 transform transition-all max-h-[90vh] overflow-y-auto'
    
    if old_modal_class in content:
        content = content.replace(old_modal_class, new_modal_class)
        modified = True
    
    # Fix 2: Prevent Safari auto-zoom by removing sm:text-sm and ensuring text-base on inputs
    # Wait, we can just replace 'sm:text-sm' with 'text-base' in the checkout modal inputs
    if 'sm:text-sm' in content and 'checkout-modal' in content:
        # Instead of generic replace, let's just replace all 'sm:text-sm px-3 py-2 border' with 'text-base px-3 py-2 border'
        content = content.replace('sm:text-sm px-3 py-2 border', 'text-base px-3 py-2 border')
        # Also fix the event-date and postcode which might just have 'border px-3 py-2'
        content = content.replace('rounded-md border px-3 py-2', 'rounded-md border text-base px-3 py-2')
        modified = True
        
    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {file_path}")

print("Done patching modals.")
