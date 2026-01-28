from playwright.sync_api import sync_playwright
import os

def verify_istio_generator():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the tool
        page.goto("http://localhost:8000/istio-vs-generator.html")

        # Add first mock
        page.fill("#endpointUri", "/mock/rest/api/v1/user/info")
        page.fill("#statusCode", "200")
        page.fill("#contentType", "application/json")
        page.fill("#responseBody", '{"name": "John Doe", "id": 123}')
        page.click("button[type='submit']")

        # Add second mock
        page.fill("#endpointUri", "/mock/rest/api/v1/user/settings")
        page.fill("#statusCode", "200")
        page.fill("#contentType", "application/json")
        page.fill("#responseBody", '{"theme": "dark", "notifications": true}')
        page.click("button[type='submit']")

        # Generate YAML
        page.click("#generateBtn")

        # Wait a bit
        page.wait_for_timeout(500)

        # Take screenshot
        screenshot_path = "verification/istio_generator.png"
        page.screenshot(path=screenshot_path, full_page=True)

        # Read output
        output = page.input_value("#yamlOutput")
        print("Generated Output:")
        print(output)

        browser.close()

if __name__ == "__main__":
    verify_istio_generator()
