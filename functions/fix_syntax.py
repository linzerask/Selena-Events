import re

with open('index.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(
    r"return res\.status\(400\)\.send\('Invalid or non-bookable item'\);\s+if \(p\.trackStock",
    "return res.status(400).send('Invalid or non-bookable item'); }\n                if (p.trackStock",
    content
)

with open('index.js', 'w', encoding='utf-8') as f:
    f.write(content)
