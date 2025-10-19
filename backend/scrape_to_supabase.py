"""
Modified version of scrape.py that writes directly to Supabase instead of Firebase
This is for future scraping - use migrate_firebase_to_supabase.py for existing data
"""
import requests
import json
import os
from dotenv import load_dotenv
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
from utils.initialize_supabase import get_supabase_client
from datetime import datetime

load_dotenv()

# Initialize Supabase
supabase = get_supabase_client()

def scrape_car_data(year, model_name):
    """Scrape car data from cars.com for a specific year and model"""
    
    model_slug = model_name.lower().replace(' ', '-')
    url = f"https://www.cars.com/research/toyota-{model_slug}-{year}/"
    
    print(f"🔍 Scraping: {url}")
    
    # Initialize WebDriver
    driver = webdriver.Chrome()
    driver.implicitly_wait(10)
    
    try:
        # Load the page
        driver.get(url)
        
        # Get the full rendered page source
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, "html.parser")
        
        # Initialize car data dictionary
        car_data = {
            'id': f"{year}_{model_slug.replace('-', '_')}",
            'name': model_name,
            'year': year,
            'make': 'toyota',
            'source_url': url,
            'last_scraped_at': datetime.utcnow().isoformat(),
        }
        
        # Extract key specs
        key_specs_section = soup.find("spark-page-section", id="key-specs-ev")
        if key_specs_section:
            key_specs = key_specs_section.find_all("div", class_="key-spec")
            
            # Map data-qa attributes to our database fields
            spec_mapping = {
                'horsepower': 'horsepower',
                'mpg': 'mpg',
                'seating-capacity': 'seating_capacity',
                'cargo-space': 'cargo_space',
                'towing-capacity': 'towing_capacity',
                'fuel-tank-capacity': 'fuel_tank_capacity',
                'curb-weight': 'curb_weight',
                'ground-clearance': 'ground_clearance',
            }
            
            additional_specs = {}
            
            for spec in key_specs:
                label = spec.get("data-qa")
                value = spec.find("strong", class_="key-spec-value")
                
                if label and value:
                    value_text = value.text.strip()
                    
                    # Map to known fields or add to additional_specs
                    if label in spec_mapping:
                        car_data[spec_mapping[label]] = value_text
                    else:
                        additional_specs[label] = value_text
            
            # Store additional specs as JSON if any
            if additional_specs:
                car_data['additional_specs'] = json.dumps(additional_specs)
        
        # Extract price
        price_section = soup.find("div", class_="msrp-container")
        if price_section:
            price_elem = price_section.find("div", class_="spark-heading-4")
            if price_elem:
                # Remove $ sign and commas, convert to number
                try:
                    price_text = price_elem.text.strip().replace('$', '').replace(',', '').strip()
                    car_data['price'] = float(price_text)
                    print(f"  💰 Price: ${car_data['price']:,.0f}")
                except ValueError:
                    print(f"  ⚠️  Could not parse price: {price_elem.text}")
        
        # Extract images
        image_dict = {}
        gallery_div = soup.find("div", class_="research-hero-gallery-modal-content")
        
        if gallery_div:
            images = gallery_div.find_all("img")
            for index, img in enumerate(images):
                src = img.get("src")
                if src:
                    image_dict[str(index)] = src
            
            if image_dict:
                car_data['images'] = json.dumps(image_dict)
                print(f"  🖼️  Found {len(image_dict)} images")
        
        driver.quit()
        return car_data
    
    except Exception as e:
        driver.quit()
        print(f"  ❌ Error scraping {year} {model_name}: {str(e)}")
        return None

def save_to_supabase(car_data):
    """Save or update car data in Supabase"""
    try:
        # Use upsert to insert or update
        result = supabase.table('scraped_cars').upsert(car_data).execute()
        print(f"  ✅ Saved to Supabase: {car_data['year']} {car_data['name']}")
        return True
    except Exception as e:
        print(f"  ❌ Error saving to Supabase: {str(e)}")
        return False

def scrape_toyota_models():
    """
    Scrape Toyota models from carapi.app and then scrape details from cars.com
    This is the main function to use for new scraping jobs
    """
    print("="*60)
    print("🚗 Starting Toyota Car Scraping to Supabase")
    print("="*60)
    
    # Years to scrape
    years = range(2015, 2021)
    
    success_count = 0
    error_count = 0
    
    for year in years:
        print(f"\n📅 Scraping year: {year}")
        
        # Get models from carapi.app
        url = f'https://carapi.app/api/models?sort=name&verbose=yes&year={year}&make=toyota'
        
        try:
            r = requests.get(url)
            data = r.json()
            
            # Filter out hidden models
            models = [
                item for item in data.get('data', []) 
                if not item['name'].startswith('*') and item['name'].lower() != 'hidden'
            ]
            
            print(f"  Found {len(models)} Toyota models for {year}")
            
            # Scrape each model
            for model in models:
                model_name = model['name']
                
                # Scrape details from cars.com
                car_data = scrape_car_data(year, model_name)
                
                if car_data:
                    # Save to Supabase
                    if save_to_supabase(car_data):
                        success_count += 1
                    else:
                        error_count += 1
                else:
                    error_count += 1
                
                # Be respectful to the server
                time.sleep(2)
        
        except Exception as e:
            print(f"  ❌ Error fetching models for {year}: {str(e)}")
            error_count += 1
    
    # Summary
    print("\n" + "="*60)
    print("✅ Scraping Complete!")
    print("="*60)
    print(f"  Successfully scraped: {success_count}")
    print(f"  Errors: {error_count}")
    print("="*60)

def scrape_single_car(year, model_name):
    """
    Scrape a single car and save to Supabase
    Useful for testing or updating specific models
    """
    print(f"🚗 Scraping single car: {year} Toyota {model_name}")
    
    car_data = scrape_car_data(year, model_name)
    
    if car_data:
        if save_to_supabase(car_data):
            print("✅ Successfully scraped and saved!")
            return True
    
    print("❌ Failed to scrape or save")
    return False

if __name__ == "__main__":
    # Example usage:
    
    # Option 1: Scrape all Toyota models (2015-2020)
    # scrape_toyota_models()
    
    # Option 2: Scrape a single car for testing
    scrape_single_car(2020, "Camry")
    
    # Option 3: Scrape specific models
    # models_to_scrape = [
    #     (2020, "Camry"),
    #     (2020, "Corolla"),
    #     (2020, "RAV4"),
    #     (2019, "Highlander"),
    # ]
    # 
    # for year, model in models_to_scrape:
    #     scrape_single_car(year, model)
    #     time.sleep(3)  # Be respectful to the server

