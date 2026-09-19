import os

# 1. Update contact.html files
contact_files = [
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\contact.html",
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\en\contact.html",
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\ro\contact.html"
]

for file_path in contact_files:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # We need to extract the phone number in the script and send it to Firebase.
        # Find: const email = document.getElementById('email').value;
        # Insert: const phone = document.getElementById('phone').value;
        if "const phone = document.getElementById('phone').value;" not in content:
            content = content.replace(
                "const email = document.getElementById('email').value;",
                "const email = document.getElementById('email').value;\n                    const phone = document.getElementById('phone').value;"
            )
        
        # Find: email: email,
        # Insert: phone: phone,
        if "phone: phone," not in content:
            content = content.replace(
                "email: email,",
                "email: email,\n                            phone: phone,"
            )
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {file_path}")

# 2. Update dashboard.js
dashboard_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\js\dashboard.js"
if os.path.exists(dashboard_path):
    with open(dashboard_path, 'r', encoding='utf-8') as f:
        dashboard_content = f.read()

    # Find: <p><strong>Email:</strong> ${msg.email || 'Nicht angegeben'}</p>
    # Replace with: <p><strong>Email:</strong> ${msg.email || 'Nicht angegeben'}</p>\n                              <p><strong>Telefon:</strong> ${msg.phone || 'Nicht angegeben'}</p>
    search_str = "<p><strong>Email:</strong> ${msg.email || 'Nicht angegeben'}</p>"
    replace_str = "<p><strong>Email:</strong> ${msg.email || 'Nicht angegeben'}</p>\n                              <p><strong>Telefon:</strong> ${msg.phone || 'Nicht angegeben'}</p>"
    
    if replace_str not in dashboard_content:
        dashboard_content = dashboard_content.replace(search_str, replace_str)
        with open(dashboard_path, 'w', encoding='utf-8') as f:
            f.write(dashboard_content)
        print("Updated dashboard.js")
