const fs = require('fs');
const file = 'c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/admin-selena-portal-8274.html';
const lines = fs.readFileSync(file, 'utf-8').split('\n');

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('loadMessages();')) {
        lines[i] = lines[i].replace('loadMessages();', '');
    }
}

fs.writeFileSync(file, lines.join('\n'), 'utf-8');
console.log('Removed loadMessages() call.');
