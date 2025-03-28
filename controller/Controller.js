const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models/db");

exports.getAllProducts = (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(results);
    }
  });
};

exports.addUser = async (req, res) => {
  try {
    const { full_name, email, password, phone, address } = req.body;
    const role = req.body.role || "customer";
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!full_name && !email) {
      return res.status(400).json({ error: res.message });
    }
    let query =
      "INSERT INTO users (full_name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
      query,
      [full_name, email, hashedPassword, phone, address, role],
      (err, result) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json({ message: "Tạo tài khoản thành công" });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ? AND role = 'admin'",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "Chỉ admin mới có quyền truy cập" });
      }

      const user = results[0];
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Mật khẩu không đúng" });
      }

      const token = jwt.sign(
        { email: user.email, id: user.id },
        "giangxuancuong",
        { expiresIn: "1h" }
      );
      res.status(200).json({
        message: "Đăng nhập thành công",
        token,
      });
    }
  );
};
exports.getAllCustomerNumber = (req, res) => {
  db.query(
    "SELECT COUNT(*) AS total_customers FROM users WHERE role = 'customer'",
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ result: results[0].total_customers });
    }
  );
};
exports.getAllCategories = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 999;
  const offset = (page - 1) * limit;

  db.query("SELECT COUNT(*) AS total FROM categories", (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Không có danh mục!" });
    }

    const totalItems = results[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    db.query(
      "SELECT * FROM categories LIMIT ? OFFSET ?",
      [limit, offset],
      (err, categories) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        return res.status(200).json({
          totalItems,
          totalPages,
          currentPage: page,
          data: categories,
        });
      }
    );
  });
};

exports.addCategory = (req, res) => {
  const { category_name, description } = req.body;
  if (!category_name) {
    return res.status(400).json({ message: "Vui lòng điền tên danh mục" });
  }
  let sql = "INSERT INTO categories (category_name, description) VALUES (?, ?)";
  db.query(sql, [category_name, description], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: "Thêm danh mục thành công" });
  });
};
exports.deleteCategory = (req, res) => {
  const { id } = req.query;
  let sql = "DELETE FROM categories WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Xóa thành công" });
  });
};
exports.updateCategory = (req, res) => {
  const { id, category_name, description } = req.body;
  if (!category_name) {
    return res
      .status(400)
      .json({ message: "Vui lòng điền thông tin danh mục" });
  }
  let sql =
    "UPDATE categories SET category_name = ?, description = ? WHERE id = ?";
  db.query(sql, [category_name, description, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Cập nhật danh mục thành công" });
  });
};
exports.getListCustomer = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  db.query(
    "SELECT COUNT(*) AS totalcustomer FROM users WHERE role = 'customer'",
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!results || results.length === 0) {
        return res.status(404).json({ message: "Không có khách hàng nào" });
      }
      const totalCustomer = results[0].totalcustomer;
      const totalPagesCustomer = Math.ceil(totalCustomer / limit);

      db.query(
        "SELECT * FROM users WHERE role = 'customer' LIMIT ? OFFSET ?",
        [limit, offset],
        (err, result) => {
          if (err) {
            return res.json({ error: err.message });
          }
          return res.status(200).json({
            totalPagesCustomer,
            totalCustomer,
            currentPage: page,
            data: result,
          });
        }
      );
    }
  );
};

exports.deteleCustomer = (req, res) => {
  const { id } = req.query;

  let sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Xóa user thành công" });
  });
};

exports.addBanner = (req, res) => {
  const { link_banner } = req.body;
  db.query(
    "INSERT INTO banner (link_banner) VALUES (?)",
    [link_banner],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res
        .status(200)
        .json({ message: "Thêm banner vào bảng thành công" });
    }
  );
};

exports.getBanner = (req, res) => {
  let sql = "SELECT * FROM banner";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({
      banner: results,
      total: results.length,
    });
  });
};

exports.updateBanner = (req, res) => {
  const { link_banner, id } = req.query;
  if (!id) {
    return res.status(400).json({ message: "Vui lòng chọn banner cần sửa" });
  }
  db.query(
    "UPDATE banner SET link_banner = ? WHERE id = ?",
    [link_banner, id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy banner với ID này" });
      }
      return res.status(200).json({ message: "Cập nhật banner thành công !" });
    }
  );
};
exports.deleteBanner = (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: "Vui lòng chọn banner cần xóa" });
  }
  db.query("DELETE FROM banner WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Xóa banner thành công" });
  });
};

//---
exports.addDiscountCode = (req, res) => {
  const { discount_code, discount_percentage, valid_from, valid_until } =
    req.body;

  if (!discount_code || !discount_percentage || !valid_from || !valid_until) {
    return res.status(400).json({ message: "Vui lòng điền đủ thông tin mã" });
  }

  let sql =
    "INSERT INTO discounts (discount_code, discount_percentage, valid_from, valid_until) VALUES (?, ?, ?, ?)";
  db.query(
    sql,
    [discount_code, discount_percentage, valid_from, valid_until],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ message: "Thêm mã thành công" });
    }
  );
};
exports.getDisCountList = (req, res) => {
  let sqlData = "SELECT * FROM discounts";
  let sqlCount = "SELECT COUNT(*) AS totalCount FROM discounts";

  db.query(sqlData, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    db.query(sqlCount, (err, countResults) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res
        .status(200)
        .json({ total: countResults[0].totalCount, data: results });
    });
  });
};

exports.updateDiscount = (req, res) => {
  const { discount_code, discount_percentage, valid_from, valid_until, id } =
    req.body;
  if (!id) {
    return res.status(400).json({ message: "Vui lòng chọn mã" });
  }
  let sql =
    "UPDATE discounts SET discount_code = ?, discount_percentage = ? , valid_from = ? , valid_until = ? WHERE id = ?";
  db.query(
    sql,
    [discount_code, discount_percentage, valid_from, valid_until, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res
        .status(200)
        .json({ message: "Update mã giảm giá thành công!" });
    }
  );
};

exports.deleteDiscountCode = (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ message: "Chọn mã cần xóa" });
  }
  db.query("DELETE FROM discounts WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Xóa mã thành công!" });
  });
};

exports.addProduct = (req, res) => {
  console.log("Dữ liệu nhận từ frontend:", req.body);

  let {
    category_id,
    product_name,
    product_image,
    description,
    price,
    stock_quantity,
    discount,
    color,
    size,
  } = req.body;

  try {
    color = color ? JSON.parse(color).join(", ") : ""; // Chuyển mảng thành chuỗi
    size = size ? JSON.parse(size).join(", ") : "";
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Dữ liệu color hoặc size không hợp lệ!" });
  }

  if (!category_id || !product_name || !price || !stock_quantity) {
    return res
      .status(400)
      .json({ message: "Vui lòng điền đầy đủ thông tin sản phẩm" });
  }

  const images = product_image
    ? product_image.split(",").map((img) => img.trim())
    : [];
  const mainImage = images.length > 0 ? images[0] : null;
  const subImages = images.length > 1 ? images.slice(1) : [];

  const sql =
    "INSERT INTO products (category_id, product_name, product_image, description, price, stock_quantity, discount, color, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

  db.query(
    sql,
    [
      category_id,
      product_name,
      mainImage,
      description,
      price,
      stock_quantity,
      discount,
      color, // Giờ đã là "Xanh dương, Vàng, Xanh lá"
      size, // Giờ đã là "m, l, xl"
    ],
    (err, result) => {
      if (err) {
        console.error("Lỗi khi thêm sản phẩm:", err);
        return res.status(500).json({ error: "Lỗi khi thêm sản phẩm" });
      }

      const product_id = result.insertId;
      if (subImages.length > 0) {
        const imageQueries = subImages.map((img) => [product_id, img, false]);
        const imageSql =
          "INSERT INTO product_images (product_id, image_url, is_main) VALUES ?";

        db.query(imageSql, [imageQueries], (imageErr) => {
          if (imageErr) {
            console.error("Lỗi khi lưu ảnh mô tả:", imageErr);
            return res.status(500).json({ error: "Lỗi khi lưu ảnh mô tả" });
          }
          return res.status(200).json({ message: "Thêm sản phẩm thành công!" });
        });
      } else {
        return res.status(200).json({ message: "Thêm sản phẩm thành công!" });
      }
    }
  );
};

exports.getListProducts = (req, res) => {
  let sql =
    "SELECT a.id, a.product_name, a.product_image, a.description, a.price, a.stock_quantity, a.discount, a.color, a.size, b.id AS category_id, b.category_name FROM products a JOIN categories b ON a.category_id=b.id";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const totalItems = results.length;
    return res.status(200).json({ data: results, totalItems: totalItems });
  });
};
exports.updateProduct = (req, res) => {
  const {
    category_id,
    product_name,
    product_image,
    description,
    price,
    stock_quantity,
    discount,
    color,
    size,
    id,
  } = req.body;
  let sql =
    "UPDATE products SET category_id = ?, product_name = ?, product_image = ?, description = ?, price = ?, stock_quantity = ?, discount = ?, color = ?, size = ? WHERE id = ?";

  db.query(
    sql,
    [
      category_id,
      product_name,
      product_image,
      description,
      price,
      stock_quantity,
      discount,
      color,
      size,
      id,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ message: "Cập nhật sản phẩm thành công!" });
    }
  );
};
exports.deleteProduct = (req, res) => {
  const { id } = req.query;
  db.query("DELETE FROM products WHERE id = ?", [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Xóa sản phẩm thành công !" });
  });
};

/**-------------dashboard */
exports.getDataPieChart = (req, res) => {
  let sql = `SELECT 
    c.id, 
    c.category_name, 
    COUNT(p.id) AS value,
    ROUND((COUNT(p.id) / (SELECT COUNT(*) FROM products)) * 360, 2) AS angle
    FROM categories c
    LEFT JOIN products p ON c.id = p.category_id
    GROUP BY c.id, c.category_name;
    `;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ data: results });
  });
};

exports.getdataDashboard = (req, res) => {
  let sql = `
    SELECT 
      o.id,
      o.user_id,
      u.full_name AS customer_name,
      o.total_price,
      o.order_status,
      o.created_at,
      o.order_code,
      o.address,
      o.detail_address,
      o.payment_method,
      o.total_price,
      o.created_at,
      od.product_id,
      od.quantity,
      od.price,
      od.color,
      od.size,
      pr.product_name,
      pr.product_image
    FROM orders o
    JOIN users u ON o.user_id = u.id 
    JOIN order_details od ON o.id = od.order_id
    JOIN products pr ON od.product_id = pr.id
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Không có đơn hàng !" });
    }

    // Group đơn hàng theo user_id và order_code
    const ordersMap = {};

    results.forEach((row) => {
      const orderKey = `${row.user_id}_${row.order_code}`;

      if (!ordersMap[orderKey]) {
        ordersMap[orderKey] = {
          id: row.id,
          user_id: row.user_id,
          customer_name: row.customer_name,
          payment_method: row.payment_method,
          order_status: row.order_status,
          total_price: row.total_price,
          address: row.address,
          detail_address: row.detail_address,
          created_at: row.created_at,
          order_code: row.order_code,
          items: []
        };
      }

      // Thêm sản phẩm vào danh sách items
      ordersMap[orderKey].items.push({
        product_id: row.product_id,
        product_name: row.product_name,
        product_image: row.product_image,
        color: row.color,
        size: row.size,
        quantity: row.quantity,
        price: row.price
      });
    });

    // Chuyển object thành array
    const formattedData = Object.values(ordersMap);

    return res.status(200).json({ data: formattedData });
  });
};

