
from datetime import timedelta

import mysql.connector
from flask import Flask, jsonify, request
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    create_refresh_token,
    get_jwt,
    get_jwt_identity,
    jwt_required,
)


app = Flask(__name__)


CORS(app)


app.config["JWT_SECRET_KEY"] = "change-this-to-a-strong-secret-key"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(minutes=30)
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=7)


jwt = JWTManager(app)
bcrypt = Bcrypt(app)


DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "$Divya@1010",
    "database": "inventory_sales",
}


def get_db_connection() -> mysql.connector.MySQLConnection:
    return mysql.connector.connect(**DB_CONFIG)


def is_admin() -> bool:
    claims = get_jwt()
    return claims.get("role") == "admin"


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify(
        {
            "message": "Inventory & Sales API is running"
        }
    ), 200


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify(
            {
                "message": "Request body is required"
            }
        ), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify(
            {
                "message": "Email and password are required"
            }
        ), 400

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT id, name, email, password, role
            FROM users
            WHERE email = %s
            """,
            (email,),
        )

        user = cursor.fetchone()

        if user is None:
            return jsonify(
                {
                    "message": "Invalid email or password"
                }
            ), 401

        password_matches = bcrypt.check_password_hash(
            user["password"],
            password,
        )

        if not password_matches:
            return jsonify(
                {
                    "message": "Invalid email or password"
                }
            ), 401

        claims = {
            "user_id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
        }

        access_token = create_access_token(
            identity=str(user["id"]),
            additional_claims=claims,
        )

        refresh_token = create_refresh_token(
            identity=str(user["id"]),
            additional_claims=claims,
        )

        return jsonify(
            {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {
                    "id": user["id"],
                    "name": user["name"],
                    "email": user["email"],
                    "role": user["role"],
                },
            }
        ), 200

    finally:
        cursor.close()
        connection.close()


@app.route("/api/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    claims = get_jwt()

    access_token = create_access_token(
        identity=identity,
        additional_claims={
            "user_id": claims.get("user_id"),
            "name": claims.get("name"),
            "email": claims.get("email"),
            "role": claims.get("role"),
        },
    )

    return jsonify(
        {
            "access_token": access_token
        }
    ), 200


@app.route("/api/me", methods=["GET"])
@jwt_required()
def get_current_user():
    claims = get_jwt()

    return jsonify(
        {
            "id": claims.get("user_id"),
            "name": claims.get("name"),
            "email": claims.get("email"),
            "role": claims.get("role"),
        }
    ), 200


@app.route("/api/categories", methods=["GET"])
@jwt_required()
def get_categories():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT id, name
            FROM categories
            ORDER BY name
            """
        )

        categories = cursor.fetchall()

        return jsonify(categories), 200

    finally:
        cursor.close()
        connection.close()


@app.route("/api/products", methods=["GET"])
@jwt_required()
def get_products():
    category_id = request.args.get("category_id")
    search = request.args.get("search")
    low_stock = request.args.get("low_stock")

    query = """
        SELECT
            p.id,
            p.name,
            p.category_id,
            c.name AS category_name,
            p.price,
            p.stock,
            p.unit
        FROM products p
        INNER JOIN categories c
            ON p.category_id = c.id
        WHERE 1 = 1
    """

    params: list[object] = []

    if category_id:
        query += " AND p.category_id = %s"
        params.append(category_id)

    if search:
        query += " AND p.name LIKE %s"
        params.append(f"%{search}%")

    if low_stock == "true":
        query += " AND p.stock <= %s"
        params.append(10)

    query += " ORDER BY p.id DESC"

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(query, tuple(params))
        products = cursor.fetchall()

        return jsonify(products), 200

    finally:
        cursor.close()
        connection.close()


@app.route("/api/products", methods=["POST"])
@jwt_required()
def create_product():
    if not is_admin():
        return jsonify(
            {
                "message": "Admin access required"
            }
        ), 403

    data = request.get_json()

    if not data:
        return jsonify(
            {
                "message": "Request body is required"
            }
        ), 400

    name = data.get("name")
    category_id = data.get("category_id")
    price = data.get("price")
    stock = data.get("stock")
    unit = data.get("unit", "pcs")

    if not name or not isinstance(name, str):
        return jsonify(
            {
                "message": "Product name is required"
            }
        ), 400

    if price is None:
        return jsonify(
            {
                "message": "Price is required"
            }
        ), 400

    if stock is None:
        return jsonify(
            {
                "message": "Stock is required"
            }
        ), 400

    try:
        price_value = float(price)
        stock_value = int(stock)
        category_value = int(category_id)
    except (TypeError, ValueError):
        return jsonify(
            {
                "message": "Invalid product data"
            }
        ), 400

    if price_value <= 0:
        return jsonify(
            {
                "message": "Price must be greater than 0"
            }
        ), 400

    if stock_value < 0:
        return jsonify(
            {
                "message": "Stock cannot be negative"
            }
        ), 400

    if not unit:
        unit = "pcs"

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT id
            FROM categories
            WHERE id = %s
            """,
            (category_value,),
        )

        category = cursor.fetchone()

        if category is None:
            return jsonify(
                {
                    "message": "Category not found"
                }
            ), 400

        cursor.execute(
            """
            INSERT INTO products
                (name, category_id, price, stock, unit)
            VALUES
                (%s, %s, %s, %s, %s)
            """,
            (
                name.strip(),
                category_value,
                price_value,
                stock_value,
                unit,
            ),
        )

        connection.commit()

        product_id = cursor.lastrowid

        return jsonify(
            {
                "message": "Product created successfully",
                "id": product_id,
            }
        ), 201

    except mysql.connector.Error:
        connection.rollback()

        return jsonify(
            {
                "message": "Unable to create product"
            }
        ), 400

    finally:
        cursor.close()
        connection.close()


@app.route("/api/products/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_product(product_id: int):
    if not is_admin():
        return jsonify(
            {
                "message": "Admin access required"
            }
        ), 403

    data = request.get_json()

    if not data:
        return jsonify(
            {
                "message": "Request body is required"
            }
        ), 400

    name = data.get("name")
    category_id = data.get("category_id")
    price = data.get("price")
    stock = data.get("stock")
    unit = data.get("unit", "pcs")

    if not name or not isinstance(name, str):
        return jsonify(
            {
                "message": "Product name is required"
            }
        ), 400

    if price is None or stock is None or category_id is None:
        return jsonify(
            {
                "message": "Name, category, price and stock are required"
            }
        ), 400

    try:
        price_value = float(price)
        stock_value = int(stock)
        category_value = int(category_id)
    except (TypeError, ValueError):
        return jsonify(
            {
                "message": "Invalid product data"
            }
        ), 400

    if price_value <= 0:
        return jsonify(
            {
                "message": "Price must be greater than 0"
            }
        ), 400

    if stock_value < 0:
        return jsonify(
            {
                "message": "Stock cannot be negative"
            }
        ), 400

    if not unit:
        unit = "pcs"

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT id
            FROM products
            WHERE id = %s
            """,
            (product_id,),
        )

        product = cursor.fetchone()

        if product is None:
            return jsonify(
                {
                    "message": "Product not found"
                }
            ), 404

        cursor.execute(
            """
            SELECT id
            FROM categories
            WHERE id = %s
            """,
            (category_value,),
        )

        category = cursor.fetchone()

        if category is None:
            return jsonify(
                {
                    "message": "Category not found"
                }
            ), 400

        cursor.execute(
            """
            UPDATE products
            SET
                name = %s,
                category_id = %s,
                price = %s,
                stock = %s,
                unit = %s
            WHERE id = %s
            """,
            (
                name.strip(),
                category_value,
                price_value,
                stock_value,
                unit,
                product_id,
            ),
        )

        connection.commit()

        return jsonify(
            {
                "message": "Product updated successfully"
            }
        ), 200

    except mysql.connector.Error:
        connection.rollback()

        return jsonify(
            {
                "message": "Unable to update product"
            }
        ), 400

    finally:
        cursor.close()
        connection.close()


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
@jwt_required()
def delete_product(product_id: int):
    if not is_admin():
        return jsonify(
            {
                "message": "Admin access required"
            }
        ), 403

    connection = get_db_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            SELECT id
            FROM products
            WHERE id = %s
            """,
            (product_id,),
        )

        product = cursor.fetchone()

        if product is None:
            return jsonify(
                {
                    "message": "Product not found"
                }
            ), 404

        cursor.execute(
            """
            SELECT COUNT(*)
            FROM sales
            WHERE product_id = %s
            """,
            (product_id,),
        )

        result = cursor.fetchone()
        sales_count = int(result[0]) if result else 0

        if sales_count > 0:
            return jsonify(
                {
                    "message": (
                        "Cannot delete product because "
                        "sales exist for this product"
                    )
                }
            ), 400

        cursor.execute(
            """
            DELETE FROM products
            WHERE id = %s
            """,
            (product_id,),
        )

        connection.commit()

        return jsonify(
            {
                "message": "Product deleted successfully"
            }
        ), 200

    except mysql.connector.Error:
        connection.rollback()

        return jsonify(
            {
                "message": "Unable to delete product"
            }
        ), 400

    finally:
        cursor.close()
        connection.close()


@app.route("/api/sales", methods=["GET"])
@jwt_required()
def get_sales():
    product_id = request.args.get("product_id")
    from_date = request.args.get("from")
    to_date = request.args.get("to")
    sold_by = request.args.get("sold_by")

    query = """
        SELECT
            s.id,
            s.product_id,
            p.name AS product_name,
            s.sold_by,
            u.name AS seller_name,
            u.email AS seller_email,
            s.quantity,
            s.unit_price,
            s.total_amount,
            s.sold_on
        FROM sales s
        INNER JOIN products p
            ON s.product_id = p.id
        INNER JOIN users u
            ON s.sold_by = u.id
        WHERE 1 = 1
    """

    params: list[object] = []

    if product_id:
        query += " AND s.product_id = %s"
        params.append(product_id)

    if from_date:
        query += " AND DATE(s.sold_on) >= %s"
        params.append(from_date)

    if to_date:
        query += " AND DATE(s.sold_on) <= %s"
        params.append(to_date)

    if sold_by:
        query += " AND s.sold_by = %s"
        params.append(sold_by)

    query += " ORDER BY s.sold_on DESC, s.id DESC"

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(query, tuple(params))
        sales = cursor.fetchall()

        return jsonify(sales), 200

    except mysql.connector.Error:
        return jsonify(
            {
                "message": "Unable to fetch sales"
            }
        ), 500

    finally:
        cursor.close()
        connection.close()


@app.route("/api/sales/<int:sale_id>", methods=["GET"])
@jwt_required()
def get_sale(sale_id):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                s.id,
                s.product_id,
                p.name AS product_name,
                s.quantity,
                s.unit_price,
                s.total_amount,
                s.sold_by,
                u.name AS sold_by_name,
                s.sold_on
            FROM sales s
            INNER JOIN products p
                ON s.product_id = p.id
            INNER JOIN users u
                ON s.sold_by = u.id
            WHERE s.id = %s
            """,
            (sale_id,),
        )

        sale = cursor.fetchone()

        if not sale:
            return jsonify(
                {
                    "message": "Sale not found"
                }
            ), 404

        return jsonify(sale), 200

    except mysql.connector.Error as error:
        print("GET SALE ERROR:", error)
        return jsonify(
            {
                "message": "Unable to fetch sale"
            }
        ), 500

    finally:
        cursor.close()
        connection.close()


@app.route("/api/sales", methods=["POST"])
@jwt_required()
def create_sale():
    data = request.get_json()

    if not data:
        return jsonify(
            {
                "message": "Request body is required"
            }
        ), 400

    product_id = data.get("product_id")
    quantity = data.get("quantity")

    if product_id is None or quantity is None:
        return jsonify(
            {
                "message": "Product ID and quantity are required"
            }
        ), 400

    try:
        product_value = int(product_id)
        quantity_value = int(quantity)
    except (TypeError, ValueError):
        return jsonify(
            {
                "message": "Product ID and quantity must be valid numbers"
            }
        ), 400

    if product_value <= 0:
        return jsonify(
            {
                "message": "Product ID must be greater than 0"
            }
        ), 400

    if quantity_value <= 0:
        return jsonify(
            {
                "message": "Quantity must be greater than 0"
            }
        ), 400

    claims = get_jwt()
    sold_by = claims.get("user_id")

    if sold_by is None:
        return jsonify(
            {
                "message": "User information is missing from token"
            }
        ), 401

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                id,
                name,
                price,
                stock,
                unit
            FROM products
            WHERE id = %s
            """,
            (product_value,),
        )

        product = cursor.fetchone()

        if product is None:
            return jsonify(
                {
                    "message": "Product not found"
                }
            ), 404

        current_stock = int(product["stock"])

        if quantity_value > current_stock:
            return jsonify(
                {
                    "message": "Insufficient stock"
                }
            ), 400

        unit_price = float(product["price"])
        total_amount = quantity_value * unit_price
        new_stock = current_stock - quantity_value

        cursor.execute(
            """
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
                (%s, %s, %s, %s, %s, NOW())
            """,
            (
                product_value,
                sold_by,
                quantity_value,
                unit_price,
                total_amount,
            ),
        )

        sale_id = cursor.lastrowid

        cursor.execute(
            """
            UPDATE products
            SET stock = %s
            WHERE id = %s
            """,
            (
                new_stock,
                product_value,
            ),
        )

        connection.commit()

        return jsonify(
            {
                "message": "Sale created successfully",
                "id": sale_id,
                "product_id": product_value,
                "sold_by": sold_by,
                "quantity": quantity_value,
                "unit_price": unit_price,
                "total_amount": total_amount,
                "remaining_stock": new_stock,
            }
        ), 201

    except mysql.connector.Error as error:
        connection.rollback()

        print("CREATE SALE ERROR:", error)

        return jsonify(
            {
                "message": "Unable to create sale",
                "error": str(error),
            }
        ), 400

    finally:
        cursor.close()
        connection.close()


@app.route("/api/analytics/kpis", methods=["GET"])
@jwt_required()
def get_analytics_kpis():
    from_date = request.args.get("from")
    to_date = request.args.get("to")
    category_id = request.args.get("category_id")

    date_filter = ""
    category_filter = ""
    params: list[object] = []

    if from_date:
        date_filter += " AND DATE(s.sold_on) >= %s"
        params.append(from_date)

    if to_date:
        date_filter += " AND DATE(s.sold_on) <= %s"
        params.append(to_date)

    if category_id:
        category_filter = " AND p.category_id = %s"
        params.append(category_id)

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            f"""
            SELECT
                COALESCE(SUM(s.total_amount), 0) AS total_revenue,
                COUNT(*) AS total_sales
            FROM sales s
            INNER JOIN products p
                ON s.product_id = p.id
            WHERE 1 = 1
            {date_filter}
            {category_filter}
            """,
            tuple(params),
        )

        sales_kpis = cursor.fetchone()

        cursor.execute(
            """
            SELECT COUNT(*) AS total_products
            FROM products
            """
        )

        product_kpis = cursor.fetchone()

        cursor.execute(
            """
            SELECT COUNT(*) AS low_stock_count
            FROM products
            WHERE stock <= 10
            """
        )

        low_stock = cursor.fetchone()

        return jsonify(
            {
                "total_revenue": sales_kpis["total_revenue"],
                "total_sales": sales_kpis["total_sales"],
                "total_products": product_kpis["total_products"],
                "low_stock_count": low_stock["low_stock_count"],
            }
        ), 200

    except mysql.connector.Error as error:
        print("KPI ERROR:", error)
        return jsonify(
            {
                "message": "Unable to fetch analytics KPIs"
            }
        ), 500

    finally:
        cursor.close()
        connection.close()


@app.route("/api/analytics/by-category", methods=["GET"])
@jwt_required()
def get_analytics_by_category():
    from_date = request.args.get("from")
    to_date = request.args.get("to")
    category_id = request.args.get("category_id")

    filters = ""
    params: list[object] = []

    if from_date:
        filters += " AND DATE(s.sold_on) >= %s"
        params.append(from_date)

    if to_date:
        filters += " AND DATE(s.sold_on) <= %s"
        params.append(to_date)

    if category_id:
        filters += " AND p.category_id = %s"
        params.append(category_id)

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            f"""
            SELECT
                c.id AS category_id,
                c.name AS category_name,
                COALESCE(SUM(s.total_amount), 0) AS revenue
            FROM sales s
            INNER JOIN products p
                ON s.product_id = p.id
            INNER JOIN categories c
                ON p.category_id = c.id
            WHERE 1 = 1
            {filters}
            GROUP BY c.id, c.name
            ORDER BY revenue DESC
            """,
            tuple(params),
        )

        data = cursor.fetchall()

        return jsonify(data), 200

    except mysql.connector.Error as error:
        print("CATEGORY ANALYTICS ERROR:", error)
        return jsonify(
            {
                "message": "Unable to fetch category analytics"
            }
        ), 500

    finally:
        cursor.close()
        connection.close()


@app.route("/api/analytics/monthly-revenue", methods=["GET"])
@jwt_required()
def get_monthly_revenue():
    from_date = request.args.get("from")
    to_date = request.args.get("to")
    category_id = request.args.get("category_id")

    filters = ""
    params: list[object] = []

    if from_date:
        filters += " AND DATE(s.sold_on) >= %s"
        params.append(from_date)

    if to_date:
        filters += " AND DATE(s.sold_on) <= %s"
        params.append(to_date)

    if category_id:
        filters += " AND p.category_id = %s"
        params.append(category_id)

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            f"""
            SELECT
                DATE_FORMAT(s.sold_on, '%Y-%m') AS month,
                COALESCE(SUM(s.total_amount), 0) AS revenue
            FROM sales s
            INNER JOIN products p
                ON s.product_id = p.id
            WHERE 1 = 1
            {filters}
            GROUP BY DATE_FORMAT(s.sold_on, '%Y-%m')
            ORDER BY DATE_FORMAT(s.sold_on, '%Y-%m')
            """,
            tuple(params),
        )

        data = cursor.fetchall()

        return jsonify(data), 200

    except mysql.connector.Error as error:
        print("MONTHLY REVENUE ERROR:", error)
        return jsonify(
            {
                "message": "Unable to fetch monthly revenue"
            }
        ), 500

    finally:
        cursor.close()
        connection.close()


@app.route("/api/analytics/top-products", methods=["GET"])
@jwt_required()
def get_top_products():
    from_date = request.args.get("from")
    to_date = request.args.get("to")
    category_id = request.args.get("category_id")

    filters = ""
    params: list[object] = []

    if from_date:
        filters += " AND DATE(s.sold_on) >= %s"
        params.append(from_date)

    if to_date:
        filters += " AND DATE(s.sold_on) <= %s"
        params.append(to_date)

    if category_id:
        filters += " AND p.category_id = %s"
        params.append(category_id)

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            f"""
            SELECT
                p.id AS product_id,
                p.name AS product_name,
                COALESCE(SUM(s.quantity), 0) AS units_sold,
                COALESCE(SUM(s.total_amount), 0) AS revenue
            FROM sales s
            INNER JOIN products p
                ON s.product_id = p.id
            WHERE 1 = 1
            {filters}
            GROUP BY p.id, p.name
            ORDER BY revenue DESC
            LIMIT 5
            """,
            tuple(params),
        )

        data = cursor.fetchall()

        return jsonify(data), 200

    except mysql.connector.Error as error:
        print("TOP PRODUCTS ERROR:", error)
        return jsonify(
            {
                "message": "Unable to fetch top products"
            }
        ), 500

    finally:
        cursor.close()
        connection.close()


@app.route("/api/analytics", methods=["GET"])
@jwt_required()
def get_analytics():
    from_date = request.args.get("from")
    to_date = request.args.get("to")

    date_filter = ""
    params: list[object] = []

    if from_date:
        date_filter += " AND DATE(s.sold_on) >= %s"
        params.append(from_date)

    if to_date:
        date_filter += " AND DATE(s.sold_on) <= %s"
        params.append(to_date)

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            f"""
            SELECT
                COUNT(*) AS total_sales,
                COALESCE(SUM(s.quantity), 0) AS total_items_sold,
                COALESCE(SUM(s.total_amount), 0) AS total_revenue
            FROM sales s
            WHERE 1 = 1
            {date_filter}
            """,
            tuple(params),
        )

        summary = cursor.fetchone()

        cursor.execute(
            f"""
            SELECT
                p.id AS product_id,
                p.name AS product_name,
                COALESCE(SUM(s.quantity), 0) AS quantity_sold,
                COALESCE(SUM(s.total_amount), 0) AS revenue
            FROM sales s
            INNER JOIN products p
                ON s.product_id = p.id
            WHERE 1 = 1
            {date_filter}
            GROUP BY p.id, p.name
            ORDER BY revenue DESC
            """,
            tuple(params),
        )

        product_sales = cursor.fetchall()

        cursor.execute(
            f"""
            SELECT
                DATE(s.sold_on) AS sale_date,
                COALESCE(SUM(s.quantity), 0) AS quantity_sold,
                COALESCE(SUM(s.total_amount), 0) AS revenue
            FROM sales s
            WHERE 1 = 1
            {date_filter}
            GROUP BY DATE(s.sold_on)
            ORDER BY sale_date ASC
            """,
            tuple(params),
        )

        daily_sales = cursor.fetchall()

        return jsonify(
            {
                "summary": summary,
                "product_sales": product_sales,
                "daily_sales": daily_sales,
            }
        ), 200

    except mysql.connector.Error as error:
        print("ANALYTICS ERROR:", error)

        return jsonify(
            {
                "message": "Unable to fetch analytics"
            }
        ), 500

    finally:
        cursor.close()
        connection.close()


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
    )

