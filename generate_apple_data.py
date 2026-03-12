
# --- Cấu hình kết nối MySQL ---
# Cần cài: pip install mysql-connector-python
import mysql.connector

# Thay đổi thông tin kết nối cho phù hợp
db_config = {
    "host": "localhost",
    "user": "root",           # Thay bằng user thật
    "password": "123456", # Thay bằng mật khẩu thật
    "database": "store"      # Thay bằng tên database thật
}

categories = [
    {"id": 1, "name": "iPhone", "category_code": "IPHONE"},
    {"id": 2, "name": "iPad", "category_code": "IPAD"},
    {"id": 3, "name": "MacBook", "category_code": "MACBOOK"},
    {"id": 4, "name": "Apple Watch", "category_code": "WATCH"},
    {"id": 5, "name": "AirPods", "category_code": "AIRPODS"},
    {"id": 6, "name": "Phụ kiện", "category_code": "ACCESSORY"},
]

products = [
    {
        "id": 1,
        "name": "iPhone 15 Pro Max",
        "product_code": "IP15PM",
        "image_link": "https://www.apple.com/v/iphone-15-pro/a/images/overview/hero/hero_iphone15pro__i70z9oz3hj2i_large.jpg",
        "description": "iPhone 15 Pro Max 256GB",
        "category_id": 1
    },
    {
        "id": 2,
        "name": "iPad Pro M2",
        "product_code": "IPADPM2",
        "image_link": "https://www.apple.com/v/ipad-pro/am/images/overview/hero/hero_combo__fcqcc3hbzjyy_large.jpg",
        "description": "iPad Pro M2 11 inch",
        "category_id": 2
    },
    {
        "id": 3,
        "name": "MacBook Air M3",
        "product_code": "MBAIRM3",
        "image_link": "https://www.apple.com/v/macbook-air-13-and-15-m3/b/images/overview/hero/hero_static__e6khcva4hkeq_large.jpg",
        "description": "MacBook Air M3 2024",
        "category_id": 3
    },
    {
        "id": 4,
        "name": "Apple Watch Series 9",
        "product_code": "AWATCH9",
        "image_link": "https://www.apple.com/v/apple-watch-series-9/b/images/overview/hero/hero_static__d0fi9mb84dci_large.jpg",
        "description": "Apple Watch Series 9",
        "category_id": 4
    },
    {
        "id": 5,
        "name": "AirPods Pro 2",
        "product_code": "AIRP2",
        "image_link": "https://www.apple.com/v/airpods-pro/g/images/overview/hero/airpods_pro_hero__d7tfa5z5e6m6_large.jpg",
        "description": "AirPods Pro 2nd Gen",
        "category_id": 5
    },
    {
        "id": 6,
        "name": "Sạc nhanh 20W",
        "product_code": "CHARGER20W",
        "image_link": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MU7V2?wid=2000&hei=2000&fmt=jpeg&qlt=95&.v=1542406398355",
        "description": "Sạc nhanh Apple 20W",
        "category_id": 6
    },
    {
        "id": 7,
        "name": "Ốp lưng iPhone 15",
        "product_code": "CASEIP15",
        "image_link": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/MT1L3?wid=2000&hei=2000&fmt=jpeg&qlt=95&.v=1692912410457",
        "description": "Ốp lưng silicon iPhone 15",
        "category_id": 6
    }
]

colors = [
    {"id": 1, "color": "Đen", "code": "BLACK"},
    {"id": 2, "color": "Trắng", "code": "WHITE"},
    {"id": 3, "color": "Xanh", "code": "BLUE"},
    {"id": 4, "color": "Vàng", "code": "YELLOW"},
    {"id": 5, "color": "Tím", "code": "PURPLE"},
]

memories = [
    {"id": 1, "type": "128GB"},
    {"id": 2, "type": "256GB"},
    {"id": 3, "type": "512GB"},
    {"id": 4, "type": "1TB"},
]

product_colors = [
    {"product_id": 1, "color_id": 1},
    {"product_id": 1, "color_id": 2},
    {"product_id": 1, "color_id": 3},
    {"product_id": 2, "color_id": 2},
    {"product_id": 2, "color_id": 3},
    {"product_id": 3, "color_id": 1},
    {"product_id": 3, "color_id": 2},
    {"product_id": 4, "color_id": 1},
    {"product_id": 4, "color_id": 4},
    {"product_id": 5, "color_id": 2},
    {"product_id": 5, "color_id": 5},
]

product_memories = [
    {"id": 1, "price": 34990000, "memory_id": 2, "product_id": 1},
    {"id": 2, "price": 39990000, "memory_id": 3, "product_id": 1},
    {"id": 3, "price": 29990000, "memory_id": 2, "product_id": 2},
    {"id": 4, "price": 35990000, "memory_id": 3, "product_id": 2},
    {"id": 5, "price": 25990000, "memory_id": 2, "product_id": 3},
    {"id": 6, "price": 31990000, "memory_id": 3, "product_id": 3},
]

def insert_data():
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()

    # Insert categories
    for c in categories:
        cursor.execute(
            "INSERT IGNORE INTO category (id, name, category_code) VALUES (%s, %s, %s)",
            (c["id"], c["name"], c["category_code"])
        )

    # Insert products
    for p in products:
        cursor.execute(
            "INSERT IGNORE INTO product (id, name, product_code, image_link, description, category_id) VALUES (%s, %s, %s, %s, %s, %s)",
            (p["id"], p["name"], p["product_code"], p["image_link"], p["description"], p["category_id"])
        )

    # Insert colors
    for c in colors:
        cursor.execute(
            "INSERT IGNORE INTO color (id, color, code) VALUES (%s, %s, %s)",
            (c["id"], c["color"], c["code"])
        )

    # Insert memories
    for m in memories:
        cursor.execute(
            "INSERT IGNORE INTO memory (id, type) VALUES (%s, %s)",
            (m["id"], m["type"])
        )

    # Insert product_colors
    for pc in product_colors:
        cursor.execute(
            "INSERT IGNORE INTO product_color (product_id, color_id) VALUES (%s, %s)",
            (pc["product_id"], pc["color_id"])
        )

    # Insert product_memories
    for pm in product_memories:
        cursor.execute(
            "INSERT IGNORE INTO product_memory (id, price, memory_id, product_id) VALUES (%s, %s, %s, %s)",
            (pm["id"], pm["price"], pm["memory_id"], pm["product_id"])
        )

    conn.commit()
    cursor.close()
    conn.close()
    print("Đã ghi dữ liệu vào database MySQL thành công.")

if __name__ == "__main__":
    insert_data()