import re
import io

file_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\functions\index.js"

with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# Let's find all words with non-ascii characters
non_ascii_words = set(re.findall(r'\b[a-zA-Z]*[^\x00-\x7F]+[a-zA-Z]*\b', content))
print("Non-ascii words:", non_ascii_words)

# and non-ascii sequences
non_ascii_seq = set(re.findall(r'[^\x00-\x7F]+', content))
print("Non-ascii sequences:", non_ascii_seq)
