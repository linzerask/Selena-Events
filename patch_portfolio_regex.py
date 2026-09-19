import os
import re

file_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\js\portfolio.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Use regex to find the eventDate <p> tag and insert the category span after it.
# Original: `<p class="text-xs text-gold uppercase">${esc(e.eventDate)}</p>`
# Replace with: `<div class="flex justify-between items-center"><p class="text-xs text-gold uppercase">${esc(e.eventDate)}</p><span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase font-medium">${esc(e.category || 'Event')}</span></div>`

pattern = r'<p class="text-xs text-gold uppercase">\$\{esc\(e\.eventDate\)\}</p>'
replacement = r'<div class="flex justify-between items-center"><p class="text-xs text-gold uppercase">${esc(e.eventDate)}</p><span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase font-medium tracking-wide">${esc(e.category || "Event")}</span></div>'

new_content = re.sub(pattern, replacement, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated js/portfolio.js using regex")
