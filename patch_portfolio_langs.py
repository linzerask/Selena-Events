import os
import re

def patch_file(filepath, header_text):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The dynamic grid to insert
    dynamic_html = f"""
            <div id="portfolio-events-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                <p class="col-span-full text-center text-gray-500">Event-Galerien werden geladen...</p>
            </div>
            <div id="portfolio-gallery-modal" class="fixed inset-0 z-[100] bg-black/90 hidden overflow-y-auto">
                <button id="portfolio-modal-close" class="fixed right-5 top-5 text-white text-4xl">&times;</button>
                <div class="max-w-6xl mx-auto px-5 py-20">
                    <h2 id="portfolio-modal-title" class="text-3xl text-white font-serif mb-2"></h2>
                    <p id="portfolio-modal-description" class="text-gray-300 mb-8"></p>
                    <div id="portfolio-modal-images" class="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4"></div>
                </div>
            </div>
            <h2 class="text-2xl font-serif text-center mb-8">{header_text}</h2>
"""

    if "portfolio-events-grid" not in content:
        # Insert before `<div class="masonry-grid" id="portfolio-grid">`
        content = content.replace('<div class="masonry-grid" id="portfolio-grid">', dynamic_html + '\n            <div class="masonry-grid" id="portfolio-grid">')
    
    if "portfolio.js" not in content:
        content = content.replace('</body>', '    <script type="module" src="../js/portfolio.js"></script>\n</body>')
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

base_dir = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2"

patch_file(os.path.join(base_dir, 'en', 'portfolio.html'), "More Impressions")
patch_file(os.path.join(base_dir, 'ro', 'portfolio.html'), "Mai multe impresii")

print("Patched en and ro portfolio.html")
