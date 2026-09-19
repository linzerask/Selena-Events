const fs = require('fs');
const file = 'c:/Users/43670/Desktop/Graphics/AnonymCreator - Digitalstudion/Webseiten/Selena Events/Website/admin-selena-portal-8274.html';
let c = fs.readFileSync(file, 'utf-8');

const targetStr = `        .fc-event:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(212, 175, 55, 0.4) !important;
        }
                <img src="assets/logo_dark.png"`;

if (c.includes(targetStr)) {
    c = c.replace(targetStr, `        .fc-event:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 6px rgba(212, 175, 55, 0.4) !important;
        }
        .fc-daygrid-day-number {
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
    console.log("Target string not found.");
}
