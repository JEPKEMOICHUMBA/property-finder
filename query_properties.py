import sys
sys.path.insert(0, 'C:\\Users\\user\\Desktop\\property-finder\\server')

from app import create_app
from models import Property

# Create Flask app and get database
app = create_app()

# Query all properties within the app context
with app.app_context():
    try:
        properties = Property.query.all()
        
        if not properties:
            print("No properties found in the database.")
        else:
            print(f"Total properties in database: {len(properties)}\n")
            print("-" * 100)
            print(f"{'ID':<5} {'Title':<30} {'Price':<15} {'Location':<25} {'Bedrooms':<10} {'Status':<15}")
            print("-" * 100)
            
            for prop in properties:
                print(f"{prop.property_id:<5} {str(prop.title)[:29]:<30} ${float(prop.price):<14.2f} {str(prop.location)[:24]:<25} {str(prop.bedrooms) if prop.bedrooms else 'N/A':<10} {str(prop.ownership_status):<15}")
            
            print("-" * 100)
            print("\nDetailed Property Information:")
            print("-" * 100)
            for prop in properties:
                print(f"\nProperty ID: {prop.property_id}")
                print(f"  Title: {prop.title}")
                print(f"  Price: ${float(prop.price):.2f}")
                print(f"  Location: {prop.location}")
                print(f"  Bedrooms: {prop.bedrooms}")
                print(f"  Size: {float(prop.size) if prop.size else 'N/A'} sq ft")
                print(f"  Latitude: {prop.latitude}")
                print(f"  Longitude: {prop.longitude}")
                print(f"  Description: {prop.description[:50] if prop.description else 'N/A'}...")
                print(f"  Status: {prop.ownership_status}")
                print(f"  Created: {prop.created_at}")
                print(f"  Images: {len(prop.images) if prop.images else 0} images")
                
    except Exception as e:
        print(f"Error querying database: {str(e)}")
        import traceback
        traceback.print_exc()
