import os
import re

file_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\js\portfolio.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add translation logic for "Fotos  Galerie öffnen" and "Event-Galerien werden geladen..."
# `const isEn = window.location.pathname.includes('/en/'); const isRo = window.location.pathname.includes('/ro/');`

translation_code = """
const isEn = window.location.pathname.includes('/en/');
const isRo = window.location.pathname.includes('/ro/');
const txtPhotos = isEn ? "Photos" : (isRo ? "Fotografii" : "Fotos");
const txtOpen = isEn ? "Open Gallery" : (isRo ? "Deschide galeria" : "Galerie öffnen");
const txtEmpty = isEn ? "No event galleries published yet." : (isRo ? "Nicio galerie publicată încă." : "Noch keine Event-Galerien veröffentlicht.");
"""

# Inject before grid.innerHTML
content = content.replace("const grid=document.getElementById('portfolio-events-grid');", translation_code + "const grid=document.getElementById('portfolio-events-grid');")

# Replace hardcoded text
content = content.replace('${(e.images||[]).length} Fotos  Galerie ffnen', '${(e.images||[]).length} ' + "' + txtPhotos + ' &bull; ' + txtOpen + '")
content = content.replace('Noch keine Event-Galerien verffentlicht.', "' + txtEmpty + '")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Added translations to portfolio.js")
