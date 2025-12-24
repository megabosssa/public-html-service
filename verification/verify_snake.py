
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        # Since these are static files, we can open them directly using file protocol
        # Get absolute path to the file
        cwd = os.getcwd()
        file_path = f'file://{cwd}/games/snake.html'

        print(f'Navigating to {file_path}')
        page.goto(file_path)

        # Take a screenshot of the initial state
        page.screenshot(path='verification/snake_initial.png')
        print('Initial screenshot taken')

        # Click start button
        page.click('#btnStart')
        page.wait_for_timeout(1000) # Wait for a second of gameplay

        # Move snake
        page.keyboard.press('ArrowDown')
        page.wait_for_timeout(500)
        page.keyboard.press('ArrowRight')
        page.wait_for_timeout(500)

        # Take another screenshot
        page.screenshot(path='verification/snake_gameplay.png')
        print('Gameplay screenshot taken')

        browser.close()

if __name__ == '__main__':
    run()
