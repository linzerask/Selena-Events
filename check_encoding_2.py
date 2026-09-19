import re
import io

file_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\functions\index.js"

with open(file_path, 'rb') as f:
    content = f.read()

# decode with utf-8, replacing errors
text = content.decode('utf-8', errors='replace')
words = re.findall(r'\b[a-zA-Z]*[^\x00-\x7F]+[a-zA-Z]*\b', text)
for w in set(words):
    print(repr(w))
