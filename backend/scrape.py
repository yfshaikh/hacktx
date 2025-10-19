import requests, json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import os
from dotenv import load_dotenv
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup

load_dotenv()

# Get the directory where the script is located
current_dir = os.path.dirname(os.path.abspath(__file__))

# Create the path to the credentials file
cred_path = os.path.join(current_dir, "fb-admin-sdk.json")
cred = credentials.Certificate(cred_path)
firebase_admin.initialize_app(cred)

# Initialize Firestore
db = firestore.client()

# # Loop through years 2015-2020
# for year in range(2015, 2021):
#     url = f'https://carapi.app/api/models?sort=name&verbose=yes&year={year}&make=toyota'
#     r = requests.get(url)
#     data = r.json()

#     # Filter out objects with name "hidden" or starting with "*"
#     filtered_data = [item for item in data['data'] if not item['name'].startswith('*')]
    
#     # Save each car model to Firestore
#     for car in filtered_data:
#         # Create a unique document ID using year and car name
#         doc_id = f"{year}_{car['name'].replace(' ', '_').lower()}"
        
#         # Add year field to the car data
#         car['year'] = year
        
#         # Save to Firestore
#         db.collection('cars').document(doc_id).set(car)
#         print(f"Saved {year} {car['name']} to Firestore")

# Add images to existing car documents
cars_ref = db.collection('cars')
cars = cars_ref.stream()

# Initialize WebDriver once outside the loop
driver = webdriver.Chrome()
driver.implicitly_wait(10)

start_processing = False  # Add flag to control when to start processing

for car in cars:
    car_data = car.to_dict()
    
    # Check if this is the 2018 4Runner
    if car.id == '2018_4runner':
        start_processing = True
        continue
    
    # Skip until we find 2018_4runner
    if not start_processing:
        continue
        
    year = car_data['year']
    model = car_data['name'].lower().replace(' ', '-')
    
    try:
        # Construct URL for each car
        url = f"https://www.cars.com/research/toyota-{model}-{year}/"
        print(f"Scraping details for: {url}")
        
        # Load the page
        driver.get(url)
        
        # Get the full rendered page source
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, "html.parser")
        
        # Initialize an empty dictionary to store details
        car_specs = {}
        
        # Locate key specs section
        key_specs_section = soup.find("spark-page-section", id="key-specs-ev")
        if key_specs_section:
            key_specs = key_specs_section.find_all("div", class_="key-spec")
            
            # Extract details based on data-qa attributes
            for spec in key_specs:
                label = spec.get("data-qa")
                value = spec.find("strong", class_="key-spec-value")
                
                if label and value:
                    car_specs[label] = value.text.strip()
        
        # Extract the price (assuming it's inside a div with class "msrp-container")
        price_section = soup.find("div", class_="msrp-container")
        if price_section:
            price = price_section.find("div", class_="spark-heading-4")
            if price:
                # Remove the $ sign and any extra spaces
                price_value = price.text.strip().replace('$', '').replace(',', '').strip()
                car_specs['price'] = price_value
                print(f"Extracted price for {year} {car_data['name']}: {car_specs['price']}")
        
        # Log and store extracted details
        print(f"Extracted details for {year} {car_data['name']}: {car_specs}")
        
        # Check if the images field already exists
        car_doc_ref = db.collection('cars').document(car.id)
        car_doc = car_doc_ref.get()
        
        # If images are not already added, scrape and update them
        if car_doc.exists and 'images' not in car_doc.to_dict():
            # Initialize an empty dictionary to store image sources
            image_dict = {}
            
            # Find the div with the class "research-hero-gallery-modal-content"
            gallery_div = soup.find("div", class_="research-hero-gallery-modal-content")
            
            # Find all img tags within the div and get their src attributes
            if gallery_div:
                images = gallery_div.find_all("img")
                for index, img in enumerate(images):
                    src = img.get("src")
                    if src:
                        image_dict[str(index)] = src
                
                # Update Firestore document with images
                if image_dict:
                    car_doc_ref.update({
                        'images': image_dict
                    })
                    print(f"Saved {len(image_dict)} images for {year} {car_data['name']}")
                else:
                    print(f"No images found for {year} {car_data['name']}")
            else:
                print(f"No gallery found for {year} {car_data['name']}")
        else:
            print(f"Images already present for {year} {car_data['name']}")

        # Update Firestore document with extracted details (like price, description, etc.)
        if car_specs:
            car_doc_ref.update(car_specs)
            print(f"Saved details for {year} {car_data['name']}")
        else:
            print(f"No details found for {year} {car_data['name']}")
        
        # Add a small delay to avoid overwhelming the server
        time.sleep(2)
        
    except Exception as e:
        print(f"Error processing {year} {car_data['name']}: {str(e)}")
        continue


# Close the browser when done
driver.quit()
