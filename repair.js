const fs = require('fs');
const file = 'c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/admin-selena-portal-8274.html';
let c = fs.readFileSync(file, 'utf-8');

const badStart = c.indexOf('<div id="latest-activities" class="space-y-4">\n        </header>');
if (badStart !== -1) {
    const sectionVerleih = c.indexOf('<!-- Verleih Section -->');
    if (sectionVerleih !== -1) {
        const toKeep = c.substring(0, c.indexOf('\n        </header>', badStart));
        
        const remainder = c.substring(sectionVerleih);
        
        const repair = toKeep + `\n                        <p class="text-gray-500 text-sm italic">Lade Daten...</p>\n                    </div>\n                </div>\n            </section>\n\n            ` + remainder;
        
        fs.writeFileSync(file, repair, 'utf-8');
        console.log("HTML structure repaired successfully!");
    } else {
        console.log("Could not find Verleih section");
    }
} else {
    console.log("Could not find corrupted block");
}
