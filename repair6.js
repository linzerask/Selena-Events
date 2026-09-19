const fs = require('fs');
const file = 'c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/admin-selena-portal-8274.html';
const lines = fs.readFileSync(file, 'utf-8').split('\n');

// Delete lines 575 to 619
lines.splice(574, 45);

fs.writeFileSync(file, lines.join('\n'), 'utf-8');
console.log('Removed loadMessages.');
