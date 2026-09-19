import os

files = [
    r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\team.html',
    r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\en\team.html',
    r'c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\Website\ro\team.html'
]

replacements = {
    'https://selena.events/wp-content/uploads/2017/10/538040727_4164394610495161_7801036292270798395_n-370x370.jpg': '/assets/selena.jpg',
    'https://selena.events/wp-content/uploads/2017/10/team2-300x300.jpg-370x370.jpg': '/assets/luiza.jpg',
    'https://selena.events/wp-content/uploads/2017/10/team1-300x300.jpg-370x370.jpg': '/assets/adelin.jpg',
    'https://selena.events/wp-content/uploads/2026/01/508320656_9865119550266763_2466113508974178200_n-370x370.jpg': '/assets/cristina.jpg'
}

for filepath in files:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old_url, new_url in replacements.items():
            content = content.replace(old_url, new_url)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {filepath}')
