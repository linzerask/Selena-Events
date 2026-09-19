const fs = require('fs');
const file = 'c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/admin-selena-portal-8274.html';
let c = fs.readFileSync(file, 'utf-8');

// I need to find the bad block added by the faulty replace_file_content:
// The fuzzy matcher replaced a bunch of stuff with just:
//                 <img src="assets/logo_dark.png"
// AND it left a dangling:
//     <!-- Dashboard Specific CSS -->
//     <style>
//         .fade-in { animation: fadeIn 0.3s ease-in-out; }
//         @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
//     </style>
//
//     <!-- Essential Scripts -->
//     <script src="js/firebase-config.js"></script>
//     <script src="js/dashboard.js?v=2"></script>
//     <script src="js/calendar.js"></script>
// </head>
// <body class="bg-gray-50/50 font-sans text-gray-900 antialiased h-screen flex overflow-hidden">
//                 <img src="assets/logo_dark.png"

const regex = /<style>\s*\.fade-in \{ animation: fadeIn 0\.3s ease-in-out; \}\s*@keyframes fadeIn \{ from \{ opacity: 0; \} to \{ opacity: 1; \} \}\s*<\/style>\s*<!-- Essential Scripts -->\s*<script src="js\/firebase-config\.js"><\/script>\s*<script src="js\/dashboard\.js\?v=2"><\/script>\s*<script src="js\/calendar\.js"><\/script>\s*<\/head>\s*<body class="bg-gray-50\/50 font-sans text-gray-900 antialiased h-screen flex overflow-hidden">\s*<img src="assets\/logo_dark\.png"/m;

if (c.match(regex)) {
    c = c.replace(regex, `.fc-daygrid-day-number {
            color: #4b5563;
            font-weight: 500;
            padding: 8px !important;
        }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js"></script>
    <script src="js/firebase-config.js"></script>
    <script src="js/dashboard.js?v=2"></script>
    <script src="js/calendar.js"></script>
</head>
<body class="bg-gray-50 text-gray-800 font-sans h-screen flex overflow-hidden">

    <!-- Login Overlay -->
    <div id="login-overlay" class="fixed inset-0 bg-[#1f2937] z-[100] flex items-center justify-center p-4 transition-opacity duration-300">
        <div class="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
            <div class="text-center mb-8">
                <img src="assets/logo_dark.png"`);
    fs.writeFileSync(file, c, 'utf-8');
    console.log("Restored HTML header successfully.");
} else {
    console.log("Could not find the exact corrupted block to replace.");
}
