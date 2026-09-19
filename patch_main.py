import os

file_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\js\main.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the navLink assignments so they use basePath
content = content.replace('navLink.href = "customer-dashboard.html";', 'navLink.href = basePath + "customer-dashboard.html";')
content = content.replace('navLink.href = "login.html";', 'navLink.href = basePath + "login.html";')

# Also fix mobileNavLink
content = content.replace('mobileNavLink.href = "customer-dashboard.html";', 'mobileNavLink.href = basePath + "customer-dashboard.html";')
content = content.replace('mobileNavLink.href = "login.html";', 'mobileNavLink.href = basePath + "login.html";')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed basePath in main.js")
