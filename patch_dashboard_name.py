import os

dashboard_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\js\dashboard.js"
if os.path.exists(dashboard_path):
    with open(dashboard_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix name in Messages tab header
    content = content.replace(
        "<span class=\"font-medium text-gray-900\">${msg.name || 'Gast'}</span>",
        "<span class=\"font-medium text-gray-900\">${(msg.firstName || msg.lastName) ? ((msg.firstName || '') + ' ' + (msg.lastName || '')).trim() : (msg.name || 'Gast')}</span>"
    )

    # Fix name in Recent Activities tab header
    content = content.replace(
        "<span class=\"font-medium text-gray-900\">${data.name || 'Gast'}</span>",
        "<span class=\"font-medium text-gray-900\">${(data.firstName || data.lastName) ? ((data.firstName || '') + ' ' + (data.lastName || '')).trim() : (data.name || 'Gast')}</span>"
    )

    # Add Name to expanded details (Messages tab)
    search_str = "<p><strong>Email:</strong> ${msg.email || 'Nicht angegeben'}</p>"
    replace_str = "<p><strong>Name:</strong> ${(msg.firstName || msg.lastName) ? ((msg.firstName || '') + ' ' + (msg.lastName || '')).trim() : 'Nicht angegeben'}</p>\n                              <p><strong>Email:</strong> ${msg.email || 'Nicht angegeben'}</p>"
    
    if replace_str not in content:
        content = content.replace(search_str, replace_str)
        
    # Add Name to expanded details (Recent Activities tab)
    search_str2 = "<p><strong>Email:</strong> ${data.email || ''}</p>"
    replace_str2 = "<p><strong>Name:</strong> ${(data.firstName || data.lastName) ? ((data.firstName || '') + ' ' + (data.lastName || '')).trim() : 'Nicht angegeben'}</p>\n                      <p><strong>Email:</strong> ${data.email || ''}</p>"
    
    if replace_str2 not in content:
        content = content.replace(search_str2, replace_str2)

    with open(dashboard_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("dashboard.js patched successfully.")
else:
    print("dashboard.js not found.")
