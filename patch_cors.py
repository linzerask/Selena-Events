import os

file_path = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2\functions\index.js"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the CORS origin to include anonymcreator.online
old_cors = """const cors = require("cors")({ origin: [/^https:\/\/(www\.)?selena\.events$/, /^http:\/\/localhost(?::\d+)?$/] });"""
new_cors = """const cors = require("cors")({ origin: [/^https:\/\/(www\.)?selena\.events$/, /^http:\/\/localhost(?::\d+)?$/, /^https:\/\/(www\.)?selenaevents\.anonymcreator\.online$/] });"""

if old_cors in content:
    content = content.replace(old_cors, new_cors)
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Fixed CORS rule in index.js")
else:
    print("Could not find the exact CORS rule. Manual replacement needed.")
