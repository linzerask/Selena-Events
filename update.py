import os
import re

files = [
    'reset-password.html',
    'en/reset-password.html',
    'ro/reset-password.html'
]

translations = {
    'reset-password.html': {
        'page_title_new': 'Neues Passwort',
        'page_subtitle_new': 'Geben Sie Ihr neues Passwort ein.',
        'new_pwd_label': 'Neues Passwort *',
        'confirm_pwd_label': 'Passwort bestätigen *',
        'save_pwd_btn': 'Passwort Speichern',
        'err_mismatch': 'Die Passwörter stimmen nicht überein.',
        'msg_success': 'Passwort erfolgreich geändert! <a href=\"login.html\" class=\"underline font-bold\">Jetzt einloggen</a>.',
        'err_invalid': 'Link abgelaufen oder ungültig. Bitte fordern Sie einen neuen an.',
        'btn_wait': 'Bitte warten...',
    },
    'en/reset-password.html': {
        'page_title_new': 'New Password',
        'page_subtitle_new': 'Enter your new password.',
        'new_pwd_label': 'New Password *',
        'confirm_pwd_label': 'Confirm Password *',
        'save_pwd_btn': 'Save Password',
        'err_mismatch': 'Passwords do not match.',
        'msg_success': 'Password successfully changed! <a href=\"login.html\" class=\"underline font-bold\">Login now</a>.',
        'err_invalid': 'Link expired or invalid. Please request a new one.',
        'btn_wait': 'Please wait...',
    },
    'ro/reset-password.html': {
        'page_title_new': 'Parolă Nouă',
        'page_subtitle_new': 'Introduceți noua parolă.',
        'new_pwd_label': 'Parolă Nouă *',
        'confirm_pwd_label': 'Confirmă Parola *',
        'save_pwd_btn': 'Salvează Parola',
        'err_mismatch': 'Parolele nu se potrivesc.',
        'msg_success': 'Parola a fost modificată cu succes! <a href=\"login.html\" class=\"underline font-bold\">Autentificare</a>.',
        'err_invalid': 'Link expirat sau invalid. Vă rugăm să solicitați unul nou.',
        'btn_wait': 'Vă rugăm așteptați...',
    }
}

for f in files:
    if not os.path.exists(f): continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    t = translations[f]
    
    # 1. Update HTML structure
    html_pattern = re.compile(r'(<h1.*?class=\"text-3xl font-serif text-center mb-6\">.*?</form>)', re.DOTALL)
    
    # Extract the original form to modify it slightly (add ID to h1, p)
    match = html_pattern.search(content)
    if not match:
        print(f"Failed to match HTML in {f}")
        continue
        
    orig_html = match.group(1)
    
    new_html = orig_html.replace('<h1 ', '<h1 id=\"page-title\" ')
    new_html = new_html.replace('<p class=\"text-sm text-gray-600', '<p id=\"page-subtitle\" class=\"text-sm text-gray-600')
    
    added_forms = f'''
                <!-- Set New Password Form (Hidden by default) -->
                <form id="new-password-form" class="space-y-6 hidden mt-6">
                    <div id="new-password-message" class="hidden text-sm p-3 border"></div>
                    <div>
                        <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">{t['new_pwd_label']}</label>
                        <input type="password" id="new-password" required minlength="6" class="w-full px-4 py-2 border border-gray-300 focus:border-gold focus:ring-0 transition-colors">
                    </div>
                    <div>
                        <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">{t['confirm_pwd_label']}</label>
                        <input type="password" id="confirm-password" required minlength="6" class="w-full px-4 py-2 border border-gray-300 focus:border-gold focus:ring-0 transition-colors">
                    </div>
                    <button type="submit" id="save-password-btn" class="w-full bg-gold text-white font-serif tracking-widest uppercase py-3 hover:bg-black transition-colors">
                        {t['save_pwd_btn']}
                    </button>
                </form>
'''
    content = content.replace(orig_html, new_html + added_forms)
    
    # 2. Update JS imports
    content = content.replace(
        'import { getAuth, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";',
        'import { getAuth, confirmPasswordReset } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";'
    )
    
    # 3. Add JS logic
    js_addition = f'''
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const oobCode = urlParams.get('oobCode');

        if (mode === 'resetPassword' && oobCode) {{
            document.getElementById('page-title').textContent = '{t['page_title_new']}';
            document.getElementById('page-subtitle').textContent = '{t['page_subtitle_new']}';
            document.getElementById('reset-form').classList.add('hidden');
            document.getElementById('new-password-form').classList.remove('hidden');
        }}

        document.getElementById('new-password-form').addEventListener('submit', async (e) => {{
            e.preventDefault();
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const msgDiv = document.getElementById('new-password-message');
            const btn = document.getElementById('save-password-btn');

            if (newPassword !== confirmPassword) {{
                msgDiv.className = 'text-red-600 bg-red-50 p-3 text-sm border border-red-200';
                msgDiv.textContent = '{t['err_mismatch']}';
                msgDiv.classList.remove('hidden');
                return;
            }}

            try {{
                btn.disabled = true;
                btn.textContent = '{t['btn_wait']}';

                await confirmPasswordReset(auth, oobCode, newPassword);
                
                msgDiv.className = 'text-green-600 bg-green-50 p-3 text-sm border border-green-200';
                msgDiv.innerHTML = '{t['msg_success']}';
                btn.classList.add('hidden');
            }} catch (error) {{
                console.error("Reset Error:", error);
                msgDiv.className = 'text-red-600 bg-red-50 p-3 text-sm border border-red-200';
                msgDiv.textContent = '{t['err_invalid']}';
                btn.disabled = false;
                btn.textContent = '{t['save_pwd_btn']}';
            }}
            msgDiv.classList.remove('hidden');
        }});
'''
    
    # Find where to insert JS addition (right after auth init)
    content = content.replace(
        'const auth = getAuth(app);',
        'const auth = getAuth(app);\\n' + js_addition
    )
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
        
print("Done!")
