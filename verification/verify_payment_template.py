from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        cwd = os.getcwd()
        file_path = f'file://{cwd}/billpayment-template.html'

        print(f'Navigating to {file_path}')
        page.goto(file_path)

        # Wait for page load
        page.wait_for_selector('h1')

        # Select a template
        print('Selecting template...')
        page.select_option('#templateSelect', 'payer_template_001/altogether')

        # Wait for fields to render
        page.wait_for_selector('.card-header')

        # Find an input field and type a value
        # There are many inputs, let's pick the first one
        print('Entering value...')
        page.locator('.input-val').first.fill('100')

        # Wait a bit for update
        page.wait_for_timeout(500)

        # Check grand total
        grand_total = page.text_content('#grandTotal')
        print(f'Grand Total: {grand_total}')

        # We expect 100.00 because the first field in 'all_together_payer' is PAY_BILL_AMOUNT with sign '+'
        if grand_total != '100.00':
             print("ERROR: Grand Total incorrect!")
             # exit with error code if validation fails?
             # For now just print.
        else:
             print("Grand Total correct.")

        # Take a screenshot
        screenshot_path = 'verification/billpayment_template_tool.png'
        page.screenshot(path=screenshot_path)
        print(f'Screenshot taken: {screenshot_path}')

        browser.close()

if __name__ == '__main__':
    run()
