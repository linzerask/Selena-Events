const fs = require('fs');
const file = 'c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/admin-selena-portal-8274.html';
let content = fs.readFileSync(file, 'utf-8');

const searchRegex = /\s*\.fade-in\s*\{\s*animation:\s*fadeIn\s*0\.3s\s*ease-in-out;\s*overflow:\s*hidden;\s*box-shadow:\s*0\s*4px\s*6px\s*-1px\s*rgba\(0,\s*0,\s*0,\s*0\.05\);\s*\}\s*\.fc-theme-standard\s*td,\s*\.fc-theme-standard\s*th\s*\{/;

const replacement = `
        .fade-in {
            animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(5px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* Override global style.css which hides all asides */
        @media (max-width: 1023px) {
            aside#sidebar {
                display: flex !important;
            }
        }

        /* FullCalendar Custom Overrides for Premium Design */
        .fc {
            font-family: inherit;
        }
        .fc-theme-standard .fc-scrollgrid {
            border: 1px solid #f3f4f6;
            border-radius: 0.75rem;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .fc-theme-standard td, .fc-theme-standard th {`;

if (searchRegex.test(content)) {
    content = content.replace(searchRegex, replacement);
    fs.writeFileSync(file, content);
    console.log('Fixed HTML successfully.');
} else {
    console.log('Could not find the target block.');
}
