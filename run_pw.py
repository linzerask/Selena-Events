import os
import re

directories = ['js', 'en', 'ro']
pk_test_pattern = re.compile(r'pk_test_[a-zA-Z0-9]+')
pk_live = 'pk_live_51QH8PDFWPCQ26UIQKebvJQGWaXFSuo0CVGzVEs0xZx6JzUJusZP7GT5QHOWFe3s19JtcgJNOJi7ruQGEPOEE4ohS00hh1BaEEN'

for d in directories:
    if os.path.exists(d):
        for root, dirs, files in os.walk(d):
            for file in files:
                if file.endswith('.js') or file.endswith('.html'):
                    path = os.path.join(root, file)
                    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    if pk_test_pattern.search(content):
                        new_content = pk_test_pattern.sub(pk_live, content)
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f'Updated {path}')
