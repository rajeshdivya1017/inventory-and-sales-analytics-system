import random
from datetime import date, timedelta

import mysql.connector
from flask_bcrypt import Bcrypt


DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "$Divya@1010",
    "database": "inventory_sales",
}

bcrypt = Bcrypt()


CATEGORIES = [
    "Electronics",
    "Groceries",
    "Clothing",
    "Home Appliances",
    "Beauty",
    "Sports",
    "Stationery",
    "Furniture",
]


PRODUCT_NAMES = {
    "Electronics": [
        "Wireless Mouse",
        "Mechanical Keyboard",
        "USB-C Hub",
        "Bluetooth Speaker",
        "Webcam",
        "Power Bank",
        "Smart Watch",
    ],
    "Groceries": [
        "Basmati Rice",
        "Wheat Flour",
        "Cooking Oil",
        "Green Tea",
        "Coffee Powder",
        "Oats",
        "Almonds",
    ],
    "Clothing": [
        "Cotton T-Shirt",
        "Formal Shirt",
        "Denim Jeans",
        "Casual Trousers",
        "Hoodie",
        "Polo T-Shirt",
    ],
    "Home Appliances": [
        "Electric Kettle",
        "Mixer Grinder",
        "Table Fan",
        "Toaster",
        "Air Fryer",
        "Vacuum Cleaner",
    ],
    "Beauty": [
        "Face Wash",
        "Moisturizer",
        "Shampoo",
        "Hair Conditioner",
        "Body Lotion",
        "Sunscreen",
    ],
    "Sports": [
        "Yoga Mat",
        "Cricket Bat",
        "Football",
        "Tennis Racket",
        "Skipping Rope",
        "Dumbbell Set",
    ],
    "Stationery": [
        "Notebook",
        "Ball Pen Pack",
        "Marker Set",
        "Desk Organizer",
        "Sticky Notes",
        "File Folder",
    ],
    "Furniture": [
        "Office Chair",
        "Study Table",
        "Bookshelf",
        "Storage Cabinet",
        "Coffee Table",
    ],
}


PRODUCT_PRICES = {
    "Electronics": (499, 7999),
    "Groceries": (80, 1500),
    "Clothing": (399, 2999),
    "Home Appliances": (999, 8999),
    "Beauty": (149, 2499),
    "Sports": (199, 4999),
    "Stationery": (50, 999),
    "Furniture": (1499, 12999),
}


UNITS = {
    "Electronics": "pcs",
    "Groceries": "packs",
    "Clothing": "pcs",
    "Home Appliances": "pcs",
    "Beauty": "pcs",
    "Sports": "pcs",
    "Stationery": "pcs",
    "Furniture": "pcs",
}


def get_connection() -> mysql.connector.MySQLConnection:
    return mysql.connector.connect(**DB_CONFIG)


def clear_existing_data(
    connection: mysql.connector.MySQLConnection,
) -> None:
    cursor = connection.cursor()

    cursor.execute("DELETE FROM sales")
    cursor.execute("DELETE FROM products")
    cursor.execute("DELETE FROM categories")
    cursor.execute("DELETE FROM users")

    connection.commit()
    cursor.close()


def seed_users(
    connection: mysql.connector.MySQLConnection,
) -> dict[str, int]:
    cursor = connection.cursor()

    users = [
        (
            "Admin User",
            "admin@inventory.com",
            bcrypt.generate_password_hash("admin123").decode("utf-8"),
            "admin",
        ),
        (
            "Manager User",
            "manager@inventory.com",
            bcrypt.generate_password_hash("manager123").decode("utf-8"),
            "manager",
        ),
    ]

    query = """
        INSERT INTO users (name, email, password, role)
        VALUES (%s, %s, %s, %s)
    """

    cursor.executemany(query, users)
    connection.commit()

    cursor.execute(
        "SELECT id, role FROM users WHERE email IN (%s, %s)",
        ("admin@inventory.com", "manager@inventory.com"),
    )

    rows = cursor.fetchall()

    user_ids: dict[str, int] = {}

    for user_id, role in rows:
        user_ids[role] = int(user_id)

    cursor.close()

    return user_ids


def seed_categories(
    connection: mysql.connector.MySQLConnection,
) -> dict[str, int]:
    cursor = connection.cursor()

    query = """
        INSERT INTO categories (name)
        VALUES (%s)
    """

    cursor.executemany(
        query,
        [(category,) for category in CATEGORIES],
    )

    connection.commit()

    cursor.execute(
        "SELECT id, name FROM categories"
    )

    rows = cursor.fetchall()

    category_ids: dict[str, int] = {
        str(name): int(category_id)
        for category_id, name in rows
    }

    cursor.close()

    return category_ids


def build_products(
    category_ids: dict[str, int],
) -> list[tuple[str, int, float, int, str]]:
    products: list[tuple[str, int, float, int, str]] = []

    for category in CATEGORIES:
        names = PRODUCT_NAMES[category]
        min_price, max_price = PRODUCT_PRICES[category]

        for index, name in enumerate(names):
            if len(products) >= 50:
                break

            price = round(
                random.uniform(min_price, max_price),
                2,
            )

            stock = random.randint(3, 100)

            if index == 0:
                stock = random.randint(3, 10)

            products.append(
                (
                    name,
                    category_ids[category],
                    price,
                    stock,
                    UNITS[category],
                )
            )

        if len(products) >= 50:
            break

    return products


def seed_products(
    connection: mysql.connector.MySQLConnection,
    category_ids: dict[str, int],
) -> list[dict[str, object]]:
    products = build_products(category_ids)

    cursor = connection.cursor()

    query = """
        INSERT INTO products
            (name, category_id, price, stock, unit)
        VALUES
            (%s, %s, %s, %s, %s)
    """

    cursor.executemany(query, products)
    connection.commit()

    cursor.execute(
        """
        SELECT id, name, category_id, price, stock
        FROM products
        ORDER BY id
        """
    )

    rows = cursor.fetchall()

    product_data: list[dict[str, object]] = []

    for row in rows:
        product_data.append(
            {
                "id": int(row[0]),
                "name": str(row[1]),
                "category_id": int(row[2]),
                "price": float(row[3]),
                "stock": int(row[4]),
            }
        )

    cursor.close()

    return product_data


def seed_sales(
    connection: mysql.connector.MySQLConnection,
    products: list[dict[str, object]],
    user_ids: dict[str, int],
) -> None:
    cursor = connection.cursor()

    sales: list[
        tuple[int, int, int, float, float, date]
    ] = []

    end_date = date.today()
    start_date = end_date - timedelta(days=180)

    for _ in range(200):
        product = random.choice(products)

        product_id = int(product["id"])
        product_price = float(product["price"])

        quantity = random.randint(1, 5)

        unit_price = product_price
        total_amount = round(
            unit_price * quantity,
            2,
        )

        random_days = random.randint(
            0,
            (end_date - start_date).days,
        )

        sold_on = start_date + timedelta(
            days=random_days
        )

        seller_id = random.choice(
            [
                user_ids["admin"],
                user_ids["manager"],
            ]
        )

        sales.append(
            (
                product_id,
                seller_id,
                quantity,
                unit_price,
                total_amount,
                sold_on,
            )
        )

    query = """
        INSERT INTO sales
            (
                product_id,
                sold_by,
                quantity,
                unit_price,
                total_amount,
                sold_on
            )
        VALUES
            (%s, %s, %s, %s, %s, %s)
    """

    cursor.executemany(query, sales)
    connection.commit()

    cursor.close()


def print_summary(
    connection: mysql.connector.MySQLConnection,
) -> None:
    cursor = connection.cursor()

    queries = {
        "users": "SELECT COUNT(*) FROM users",
        "categories": "SELECT COUNT(*) FROM categories",
        "products": "SELECT COUNT(*) FROM products",
        "sales": "SELECT COUNT(*) FROM sales",
    }

    print("\n========== SEED SUMMARY ==========")

    for name, query in queries.items():
        cursor.execute(query)
        result = cursor.fetchone()

        count = int(result[0]) if result else 0

        print(f"{name.title():12}: {count}")

    print("===================================\n")

    cursor.close()


def main() -> None:
    connection = get_connection()

    try:
        clear_existing_data(connection)

        user_ids = seed_users(connection)
        category_ids = seed_categories(connection)

        products = seed_products(
            connection,
            category_ids,
        )

        seed_sales(
            connection,
            products,
            user_ids,
        )

        print_summary(connection)

        print("Seed completed successfully.")

        print("\nTest credentials:")
        print("Admin   : admin@inventory.com / admin123")
        print("Manager : manager@inventory.com / manager123")

    except mysql.connector.Error as error:
        connection.rollback()
        print(f"Database error: {error}")

    finally:
        connection.close()


if __name__ == "__main__":
    main()