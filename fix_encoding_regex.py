import re

file_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\functions\index.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Use regex to match the words regardless of what garbage is inside them
replacements = {
    r"f[^\x00-\x7F]+r": "für",
    r"Gr[^\x00-\x7F]+e": "Grüße",
    r"pr[^\x00-\x7F]+fen": "prüfen",
    r"gew[^\x00-\x7F]+nschten": "gewünschten",
    r"K[^\x00-\x7F]+rze": "Kürze",
    r"schnellstm[^\x00-\x7F]+glich": "schnellstmöglich",
    r"zur[^\x00-\x7F]+cksetzen": "zurücksetzen",
    r"Zur[^\x00-\x7F]+cksetzen": "Zurücksetzen",
    r"k[^\x00-\x7F]+nnen": "können",
    r"[^\x00-\x7F]+bersicht": "Übersicht",
    r"Bestellbest[^\x00-\x7F]+tigung": "Bestellbestätigung",
    r"[^\x00-\x7F]+sterreich": "Österreich",
    r"gen[^\x00-\x7F]+gend": "genügend",
    r"Riesterstra[^\x00-\x7F]+e": "Riesterstraße"
}

for bad_re, good in replacements.items():
    content = re.sub(bad_re, good, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed encoding issues with regex in functions/index.js")
