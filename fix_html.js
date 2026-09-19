const fs = require('fs');
const file = 'c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/admin-selena-portal-8274.html';
let c = fs.readFileSync(file, 'utf-8');

// I will just download the original text if I can, but since there's no git...
// Let's manually restore the lost text.
const replacement = `        }
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
            border-radius: 0.75rem;`;

// Let's replace the broken part.
// First, find what it replaced it with:
// It replaced it with:
/*
        }
        .fade-in {
            animation: fadeIn 0.3s ease-in-out;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
*/
// Wait, the diff said:
// -        }
// -        @keyframes fadeIn {
// ...
// +        /* FullCalendar Custom Overrides for Premium Design */
// +        @media (max-width: 1023px) {
// +            aside#sidebar {
// +                display: flex !important;
// +            }
// +        }
// +        
// +        .fc {
// +            font-family: inherit;

// Let's just fix it.
