import os

file_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\functions\index.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    "fÃ¼r": "für",
    "GrÃ¼ÃŸe": "Grüße",
    "GrÃ¼Ã\x9fe": "Grüße",
    "prÃ¼fen": "prüfen",
    "gewÃ¼nschten": "gewünschten",
    "KÃ¼rze": "Kürze",
    "schnellstmÃ¶glich": "schnellstmöglich",
    "zurÃ¼cksetzen": "zurücksetzen",
    "ZurÃ¼cksetzen": "Zurücksetzen",
    "kÃ¶nnen": "können",
    "Ãœbersicht": "Übersicht",
    "BestellbestÃ¤tigung": "Bestellbestätigung",
    "Ã¤": "ä",
    "Ã¶": "ö",
    "Ã¼": "ü",
    "Ã„": "Ä",
    "Ã–": "Ö",
    "Ãœ": "Ü",
    "ÃŸ": "ß",
    "\ufffdsterreich": "Österreich",
    "geng\ufffdnd": "genügend",
    "gen\ufffdgend": "genügend",
    "Riesterstra\ufffde": "Riesterstraße",
    "schnellstm\ufffdglich": "schnellstmöglich",
    "K\ufffdrze": "Kürze",
    "f\ufffdr": "für",
    "Gr\ufffd\ufffde": "Grüße",
    "Gr\ufffd\ufffdYe": "Grüße",
    "pr\ufffdfen": "prüfen",
    "gew\ufffdnschten": "gewünschten",
    "zur\ufffdcksetzen": "zurücksetzen",
    "Zur\ufffdcksetzen": "Zurücksetzen",
    "k\ufffdnnen": "können",
    "\ufffdbersicht": "Übersicht",
    "Bestellbest\ufffdtigung": "Bestellbestätigung"
}

for bad, good in replacements.items():
    content = content.replace(bad, good)

# Also fix the weird "GrǬYe" things seen in PowerShell if they exist, 
# although they might just be powershell output artifacts of Ã¼ and ÃŸ.
# \xc3\xbc is Ã¼. \xc3\x9f is ÃŸ. 
# Let's fix them with encode/decode if there are still any.
# A safe way to fix double encoding:
def fix_double_encoding(text):
    try:
        # If it was decoded as utf-8 but contains double encoded chars,
        # we can encode to latin-1 and decode to utf-8.
        # But since some chars were lost to \ufffd, this might fail.
        # So we only replace the specific corrupted strings manually.
        pass
    except:
        pass

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed encoding issues in functions/index.js")
