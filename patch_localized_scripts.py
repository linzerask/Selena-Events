import os

files_to_patch = [
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\en\shop.html",
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\en\verleih.html",
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\ro\shop.html",
    r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\ro\verleih.html"
]

for file_path in files_to_patch:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Fix script paths
        content = content.replace('<script src="../js/main.js"></script>', '<script src="js/main.js"></script>')
        content = content.replace('<script src="../js/animations.js"></script>', '<script src="js/animations.js"></script>')
        content = content.replace('<script src="../js/shop.js"></script>', '<script src="js/shop.js"></script>')
        content = content.replace('<script src="../js/verleih.js"></script>', '<script src="js/verleih.js"></script>')

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched script paths in {file_path}")
