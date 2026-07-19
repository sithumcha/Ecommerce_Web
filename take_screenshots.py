import os
import time
from playwright.sync_api import sync_playwright

def take_screenshots():
    # Create screenshots directory
    os.makedirs('screenshots', exist_ok=True)
    print("Created screenshots directory.")
    
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        # Use a premium high-resolution viewport
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        
        # 1. Capture Home Page (Light Mode)
        print("Navigating to Home Page...")
        page.goto("http://localhost:5175/")
        page.wait_for_timeout(3000)  # wait for any animations or image loading
        print("Capturing Home Page (Light)...")
        page.screenshot(path="screenshots/home_light.png")
        
        # 2. Toggle Theme to Dark Mode and Capture Home Page (Dark Mode)
        print("Toggling to Dark Mode...")
        theme_btn = page.query_selector('button[title="Toggle Theme"]')
        if theme_btn:
            theme_btn.click()
            page.wait_for_timeout(1000)
            print("Capturing Home Page (Dark)...")
            page.screenshot(path="screenshots/home_dark.png")
        else:
            print("Could not find theme toggle button.")
            
        # 3. Capture Shop Page (Dark Mode)
        print("Navigating to Shop Page...")
        page.goto("http://localhost:5175/shop")
        page.wait_for_timeout(3000)
        print("Capturing Shop Page...")
        page.screenshot(path="screenshots/shop.png")
        
        # 4. Capture Login Page
        print("Navigating to Login Page...")
        page.goto("http://localhost:5175/login")
        page.wait_for_timeout(2000)
        print("Capturing Login Page...")
        page.screenshot(path="screenshots/login.png")
        
        # 5. Log in as Admin
        print("Logging in as Admin...")
        page.fill("input[type='email']", "admin@ecommerce.com")
        page.fill("input[type='password']", "admin123")
        page.click("button[type='submit']")
        page.wait_for_timeout(3000)  # Wait for login redirect
        
        # 6. Capture Admin Dashboard Page
        print("Navigating to Admin Dashboard...")
        page.goto("http://localhost:5175/admin")
        page.wait_for_timeout(3000)  # Wait for charts/recharts animation
        print("Capturing Admin Dashboard...")
        page.screenshot(path="screenshots/admin_dashboard.png")
        
        # 7. Capture Admin Products Page
        print("Navigating to Admin Products...")
        page.goto("http://localhost:5175/admin/products")
        page.wait_for_timeout(3000)
        print("Capturing Admin Products...")
        page.screenshot(path="screenshots/admin_products.png")
        
        browser.close()
        print("Successfully captured all screenshots!")

if __name__ == "__main__":
    take_screenshots()
