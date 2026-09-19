const fs = require('fs');
const file = 'c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/admin-selena-portal-8274.html';
let c = fs.readFileSync(file, 'utf-8');

const regex = /<div id="latest-activities" class="space-y-4">[\s\S]*?(?=<!-- Verleih Section -->)/;
if(c.match(regex)) {
    c = c.replace(regex, '<div id="latest-activities" class="space-y-4">\n                        <p class="text-gray-500 text-sm italic">Lade Daten...</p>\n                    </div>\n                </div>\n            </section>\n\n            ');
    fs.writeFileSync(file, c, 'utf-8');
    console.log('Fixed HTML structure!');
} else {
    console.log('Could not find match');
}
