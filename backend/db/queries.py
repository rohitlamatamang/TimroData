# queries.py - Week 3+
# Database query functions

from .database import get_db_connection

def insert_visit(data):
    """
    Insert a new visit record
    
    Args:
        data (dict): Visit data
        
    Returns:
        int: ID of inserted record
    """
    query = """
        INSERT INTO visits (
            ip_address, user_agent, browser, os, language, 
            timezone, screen_width, screen_height, city, country, country_code, isp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, (
            data.get('ip_address'),
            data.get('user_agent'),
            data.get('browser'),
            data.get('os'),
            data.get('language'),
            data.get('timezone'),
            data.get('screen_width'),
            data.get('screen_height'),
            data.get('city'),
            data.get('country'),
            data.get('country_code'),
            data.get('isp')
        ))
        return cursor.lastrowid

def insert_location(visit_id, latitude, longitude, accuracy=None, altitude=None):
    """
    Insert location data for a visit
    
    Args:
        visit_id (int): Associated visit ID
        latitude (float): Latitude
        longitude (float): Longitude
        accuracy (float): Accuracy in meters
        altitude (float): Altitude in meters
        
    Returns:
        int: ID of inserted record
    """
    query = """
        INSERT INTO location_data (visit_id, latitude, longitude, accuracy, altitude)
        VALUES (?, ?, ?, ?, ?)
    """
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, (visit_id, latitude, longitude, accuracy, altitude))
        return cursor.lastrowid

def get_statistics():
    """
    Get usage statistics
    
    Returns:
        dict: Statistics data
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Total visits
        cursor.execute("SELECT COUNT(*) as count FROM visits")
        total_visits = cursor.fetchone()['count']
        
        # Top browsers
        cursor.execute("""
            SELECT browser, COUNT(*) as count 
            FROM visits 
            GROUP BY browser 
            ORDER BY count DESC 
            LIMIT 5
        """)
        top_browsers = [row['browser'] for row in cursor.fetchall()]
        
        # Top countries
        cursor.execute("""
            SELECT country, COUNT(*) as count 
            FROM visits 
            WHERE country IS NOT NULL
            GROUP BY country 
            ORDER BY count DESC 
            LIMIT 5
        """)
        top_countries = [row['country'] for row in cursor.fetchall()]
        
        return {
            'total_visits': total_visits,
            'top_browsers': top_browsers,
            'top_countries': top_countries
        }
