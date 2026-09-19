const fs = require('fs');
const file = 'c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/admin-selena-portal-8274.html';
const lines = fs.readFileSync(file, 'utf-8').split('\n');

const insertBlock = [
'        .fc-daygrid-day-number {',
'            color: #4b5563;',
'            font-weight: 500;',
'            padding: 8px !important;',
'        }',
'    </style>',
'    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js"></script>',
'    <script src="js/firebase-config.js"></script>',
'    <script src="js/dashboard.js?v=3"></script>',
'    <script src="js/calendar.js"></script>',
'</head>',
'<body class="bg-gray-50/50 text-gray-800 font-sans h-screen flex overflow-hidden">',
'',
'    <!-- Login Overlay -->',
'    <div id="login-overlay" class="fixed inset-0 bg-[#1f2937] z-[100] flex items-center justify-center p-4 transition-opacity duration-300">',
'        <div class="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">',
'            <div class="text-center mb-8">'
];

lines.splice(98, 0, ...insertBlock);

fs.writeFileSync(file, lines.join('\n'), 'utf-8');
console.log('Restored HTML header.');
