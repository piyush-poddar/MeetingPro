from selenium import webdriver
from selenium.webdriver.common.by import By
# from selenium.webdriver.common.keys import Keys
import time
from meet import main

options = webdriver.ChromeOptions()
options.add_argument("--disable-infobars")
options.add_argument("--start-maximized")
#options.add_argument("--disable-dev-shm-usage")
#options.add_argument("--no-sandbox")
options.add_argument("--disable-blink-features=AutomationControlled")

# Mute mic & disable video by default
options.add_argument("--use-fake-ui-for-media-stream")

# Prevent Google from detecting Selenium
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option("useAutomationExtension", False)

driver = webdriver.Chrome(options=options)

driver.get("GOOGLE_MEET_LINK")

time.sleep(1)
name = driver.find_element(By.CLASS_NAME, "qdOxv-fmcmS-wGMbrd").send_keys("Innov8r Bot")
time.sleep(1)
speaker = driver.find_elements(By.CLASS_NAME, "VfPpkd-vQzf8d")
speaker[1].click()
vb_cable = driver.find_elements(By.CLASS_NAME, "VfPpkd-qPzbhe-JNdkSc")
lis = vb_cable[1].find_elements(By.TAG_NAME, "li")
# print(len(lis))
# print(lis[2].text)
lis[2].click()
time.sleep(1)
devices = driver.find_elements(By.CLASS_NAME, "GKGgdd")
# print(len(devices))
# for i in range(len(devices)):
#     if "microphone" in devices[i].get_attribute("innerHTML"):
#         # devices[i].click()
#         print("microphone", i)
#     if "camera" in devices[i].get_attribute("innerHTML"):
#         # devices[i].click()
#         print("camera", i)

devices[0].click()
devices[1].click()
time.sleep(1)
driver.find_element(By.CLASS_NAME, "XCoPyb").click()
#time.sleep(5)
main()
# time.sleep(1000)
driver.quit()
driver.close()