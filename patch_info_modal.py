import os

base = r"c:\Users\43670\Desktop\Graphics\AnonymCreator - Digitalstudion\Webseiten\Selena Events\ChatGPT 2"

files = {
    'customer-dashboard.html': {
        'title': 'Selena Events VIP Club',
        'modal_title': 'VIP Club Vorteile & Regeln',
        'modal_desc': 'Sammeln Sie bei jeder Buchung wertvolle Punkte und steigen Sie in h&ouml;here Level auf, um sich dauerhafte Rabatte zu sichern!',
        'earn_title': 'Punkte sammeln:',
        'earn_desc': '1&euro; Umsatz = 1 Punkt (exkl. Lieferkosten).',
        'ref_title': 'Freunde werben:',
        'ref_desc': 'Erhalten Sie 10% der Punkte von jedem Einkauf Ihrer geworbenen Freunde!',
        'tier_title': 'Level-&Uuml;bersicht:',
        't1': 'Bronze (0 - 499 Punkte) &mdash; 0% Rabatt',
        't2': 'Silver (500 - 999 Punkte) &mdash; 5% Dauerhafter Rabatt',
        't3': 'Gold (1000 - 2499 Punkte) &mdash; 10% Dauerhafter Rabatt',
        't4': 'Platinum (2500+ Punkte) &mdash; 15% Dauerhafter Rabatt',
        'close': 'Schlie&szlig;en',
        'target_search': '<p class="text-sm font-medium text-gray-800 mb-6 uppercase tracking-wider">Selena Events VIP Club</p>'
    },
    'en/customer-dashboard.html': {
        'title': 'Selena Events VIP Club',
        'modal_title': 'VIP Club Benefits & Rules',
        'modal_desc': 'Collect valuable points with every booking and level up to secure permanent discounts!',
        'earn_title': 'Earn Points:',
        'earn_desc': '1&euro; Spent = 1 Point (excl. delivery fees).',
        'ref_title': 'Refer Friends:',
        'ref_desc': 'Get 10% of the points from every purchase made by your referred friends!',
        'tier_title': 'Tier Overview:',
        't1': 'Bronze (0 - 499 Points) &mdash; 0% Discount',
        't2': 'Silver (500 - 999 Points) &mdash; 5% Permanent Discount',
        't3': 'Gold (1000 - 2499 Points) &mdash; 10% Permanent Discount',
        't4': 'Platinum (2500+ Points) &mdash; 15% Permanent Discount',
        'close': 'Close',
        'target_search': '<p class="text-sm font-medium text-gray-800 mb-6 uppercase tracking-wider">Selena Events VIP Club</p>'
    },
    'ro/customer-dashboard.html': {
        'title': 'Selena Events VIP Club',
        'modal_title': 'Beneficii &amp; Reguli VIP Club',
        'modal_desc': 'Colecteaz&atilde; puncte valoroase la fiecare rezervare &#537;i avanseaz&atilde; &icirc;n nivel pentru a-&#539;i asigura reduceri permanente!',
        'earn_title': 'C&acirc;&#537;tig&atilde; Puncte:',
        'earn_desc': '1&euro; Cheltuit = 1 Punct (excl. taxele de livrare).',
        'ref_title': 'Invit&atilde; Prieteni:',
        'ref_desc': 'Prime&#537;ti 10% din punctele fiec&atilde;rei achizi&#539;ii f&atilde;cute de prietenii t&atilde;i invita&#539;i!',
        'tier_title': 'Prezentare Niveluri:',
        't1': 'Bronze (0 - 499 Puncte) &mdash; 0% Reducere',
        't2': 'Silver (500 - 999 Puncte) &mdash; 5% Reducere Permanent&atilde;',
        't3': 'Gold (1000 - 2499 Puncte) &mdash; 10% Reducere Permanent&atilde;',
        't4': 'Platinum (2500+ Puncte) &mdash; 15% Reducere Permanent&atilde;',
        'close': '&Icirc;nchide',
        'target_search': '<p class="text-sm font-medium text-gray-800 mb-6 uppercase tracking-wider">Selena Events VIP Club</p>'
    }
}

for rel_path, data in files.items():
    filepath = os.path.join(base, rel_path.replace('/', '\\'))
    if not os.path.exists(filepath): continue
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Replace the plain VIP Club text with an icon button
    new_vip_club = f"""<div class="flex items-center gap-2 mb-6">
                                      <p class="text-sm font-medium text-gray-800 uppercase tracking-wider m-0">{data['title']}</p>
                                      <button onclick="document.getElementById('vip-info-modal').classList.remove('hidden')" class="text-gold hover:text-yellow-600 transition" title="Info">
                                          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                      </button>
                                  </div>"""
    
    # Check if we already injected it
    if 'id="vip-info-modal"' not in content:
        content = content.replace(data['target_search'], new_vip_club)
        
        # 2. Add the Modal at the bottom of the body (before </body>)
        modal_html = f"""
    <!-- VIP Info Modal -->
    <div id="vip-info-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-sm" onclick="document.getElementById('vip-info-modal').classList.add('hidden')"></div>
        
        <!-- Modal Content -->
        <div class="bg-white rounded-2xl shadow-2xl relative z-10 max-w-md w-full overflow-hidden border border-gray-100">
            <!-- Header -->
            <div class="bg-animated-gradient p-6 text-white relative">
                <div class="absolute -right-10 -top-10 w-48 h-48 bg-gold opacity-30 rounded-full blur-3xl animate-pulse"></div>
                <h3 class="text-2xl font-serif tracking-wide relative z-10">{data['modal_title']}</h3>
                <button onclick="document.getElementById('vip-info-modal').classList.add('hidden')" class="absolute top-4 right-4 text-white hover:text-gray-200 z-10">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            
            <!-- Body -->
            <div class="p-6">
                <p class="text-gray-600 mb-6 text-sm">{data['modal_desc']}</p>
                
                <div class="space-y-4 mb-6">
                    <div class="flex items-start gap-3">
                        <div class="mt-1 text-gold"><svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg></div>
                        <div>
                            <h4 class="font-bold text-gray-800">{data['earn_title']}</h4>
                            <p class="text-sm text-gray-600">{data['earn_desc']}</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <div class="mt-1 text-gold"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg></div>
                        <div>
                            <h4 class="font-bold text-gray-800">{data['ref_title']}</h4>
                            <p class="text-sm text-gray-600">{data['ref_desc']}</p>
                        </div>
                    </div>
                </div>
                
                <div class="border-t border-gray-100 pt-4">
                    <h4 class="font-bold text-gray-800 mb-3">{data['tier_title']}</h4>
                    <ul class="space-y-2 text-sm text-gray-600">
                        <li class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#cd7f32]"></span> {data['t1']}</li>
                        <li class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#c0c0c0]"></span> {data['t2']}</li>
                        <li class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#ffd700]"></span> {data['t3']}</li>
                        <li class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-[#e5e4e2]"></span> <span class="font-bold text-gold">{data['t4']}</span></li>
                    </ul>
                </div>
            </div>
            
            <div class="p-4 bg-gray-50 text-right">
                <button onclick="document.getElementById('vip-info-modal').classList.add('hidden')" class="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded hover:bg-gray-50 transition font-medium text-sm">
                    {data['close']}
                </button>
            </div>
        </div>
    </div>
</body>"""
        content = content.replace('</body>', modal_html)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {t}")
