const fs = require('fs');
const file = 'c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/admin-selena-portal-8274.html';
let c = fs.readFileSync(file, 'utf-8');

const searchRegex = /<!-- Sidebar Footer -->\s*<\/div>\s*<\/div>\s*<\/header>/;

const replacement = `<!-- Sidebar Footer -->
        <div class="p-4 border-t border-gray-700/50">
            <a href="index.html" class="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Zurück zur Webseite
            </a>
        </div>
    </aside>

    <!-- Main Content wrapper -->
    <div class="flex-1 flex flex-col min-w-0 bg-gray-50">
        
        <!-- Header -->
        <header class="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
            <!-- Mobile menu button -->
            <button id="mobile-menu-btn" class="md:hidden text-gray-500 hover:text-gold focus:outline-none">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>

            <!-- Profile / Actions -->
            <div class="flex items-center space-x-4 ml-auto relative">
                <div class="relative">
                    <button id="avatar-btn" class="h-8 w-8 rounded-full bg-gold text-white flex items-center justify-center font-bold font-serif shadow-sm hover:ring-2 hover:ring-offset-2 hover:ring-gold transition-all focus:outline-none">
                        S
                    </button>
                    <!-- Avatar Dropdown -->
                    <div id="avatar-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-100 z-50">
                        <div class="px-4 py-2 border-b border-gray-100">
                            <p class="text-sm font-medium text-gray-900 truncate" id="dropdown-email"></p>
                            <p class="text-xs text-gray-500 capitalize" id="dropdown-role"></p>
                        </div>
                        <a href="#" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profil</a>
                        <button id="logout-btn" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Abmelden</button>
                    </div>
                </div>
            </div>
        </header>`;

c = c.replace(searchRegex, replacement);
fs.writeFileSync(file, c, 'utf-8');
console.log("HTML structure completely restored!");
