from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    errors = []
    page.on("console", lambda msg: errors.append(f"[{msg.type}] {msg.text}"))
    page.on("pageerror", lambda err: errors.append(f"[ERROR] {err}"))
    
    page.goto("https://selenaevents.anonymcreator.online/index")
    
    # Wait a moment for scripts to execute
    page.wait_for_timeout(3000)
    
    print("Browser logs:")
    for e in errors:
        print(e)
    
    browser.close()
