
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        cwd = os.getcwd()
        file_path = f'file://{cwd}/games/snake.html'

        print(f'Navigating to {file_path}')
        page.goto(file_path)

        # Click start button
        page.click('#btnStart')
        # Move earlier! Snake starts at x=10, wall is at 20. 10 steps.
        # At 10 FPS, that's 1 second.
        page.wait_for_timeout(400) # Move 4 steps (x=14)

        # Move Down
        page.keyboard.press('ArrowDown')
        page.wait_for_timeout(400) # Move 4 steps (y=14)

        # Move Left
        page.keyboard.press('ArrowLeft')
        page.wait_for_timeout(400) # Move 4 steps (x=10)

        # Move Up
        page.keyboard.press('ArrowUp')
        page.wait_for_timeout(200) # Move 2 steps (y=12)

        # Take another screenshot
        page.screenshot(path='verification/snake_gameplay_v2.png')
        print('Gameplay screenshot taken')

        browser.close()

if __name__ == '__main__':
    run()
