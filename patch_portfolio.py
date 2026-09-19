import os
import re

file_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\js\portfolio.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the HTML mapping for the card to include the category.
# Find the mapping code: `<p class="text-xs text-gold uppercase">${esc(e.eventDate)}</p>`
content = content.replace(
    '`<button class="portfolio-event text-left bg-white shadow rounded-xl overflow-hidden group" data-id="${e.id}"><img src="${esc(e.coverImage||(e.images||[])[0])}" class="w-full h-72 object-cover group-hover:scale-105 transition"><div class="p-5"><p class="text-xs text-gold uppercase">${esc(e.eventDate)}</p><h3 class="text-xl font-serif mt-1">${esc(e.title)}</h3><p class="text-sm text-gray-500 mt-2">${(e.images||[]).length} Fotos  Galerie ffnen</p></div></button>`',
    '`<button class="portfolio-event text-left bg-white shadow rounded-xl overflow-hidden group" data-id="${e.id}"><img src="${esc(e.coverImage||(e.images||[])[0])}" class="w-full h-72 object-cover group-hover:scale-105 transition"><div class="p-5"><div class="flex justify-between items-center"><p class="text-xs text-gold uppercase">${esc(e.eventDate)}</p><span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase">${esc(e.category || "Event")}</span></div><h3 class="text-xl font-serif mt-1">${esc(e.title)}</h3><p class="text-sm text-gray-500 mt-2">${(e.images||[]).length} Fotos • Galerie öffnen</p></div></button>`'
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated js/portfolio.js")
