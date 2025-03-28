const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const querystring = require("querystring");
const db = require("../models/db");
const { error } = require("console");
const nodemailer = require("nodemailer");
const moment = require("moment");
// const config = {
//   vnp_TmnCode: "KTVN86IN",
//   vnp_HashSecret: "9VTDHVXV1TRO2IAV2UWU5M51BGCNKIY6",
//   vnp_Url: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
//   vnp_ReturnUrl: "https://2b01-95-173-218-70.ngrok-free.app",
// };

exports.addUser = async (req, res) => {
  try {
    const { full_name, email, password, phone, address } = req.body;
    const role = req.body.role || "customer";

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: "Vui lòng nhập đầy đủ thông tin!" });
    }

    let checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkEmailQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length > 0) {
        return res.status(400).json({ error: "Email đã tồn tại!" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      let query =
        "INSERT INTO users (full_name, email, password, phone, address, role) VALUES (?, ?, ?, ?, ?, ?)";
      db.query(
        query,
        [full_name, email, hashedPassword, phone, address, role],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          return res.status(201).json({ message: "Tạo tài khoản thành công!" });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ? AND role = 'customer'",
    [email],
    async (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Tài khoản không tồn tại" });
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

exports.getAllCategories = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 8;
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

exports.selectProduct = (req, res) => {
  const { id } = req.query;
  const sql = `
  SELECT 
    a.id, 
    a.product_name, 
    a.product_image, 
    a.description, 
    a.price, 
    a.stock_quantity, 
    a.discount,
    a.color,
    a.size, 
    b.id AS category_id, 
    b.category_name,
    GROUP_CONCAT(c.image_url SEPARATOR ', ') AS additional_images
    FROM products a
    JOIN categories b ON a.category_id = b.id
    LEFT JOIN product_images c ON a.id = c.product_id
    WHERE b.id = ? 
    GROUP BY a.id;
    `;
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ data: result });
  });
};

exports.UserInfo = (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  jwt.verify(token, "giangxuancuong", (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    const userId = decoded.id;
    let sql =
      "SELECT id, full_name, email, phone, address, gender, avata, birthday, created_at FROM users WHERE id = ? AND role = 'customer'";

    db.query(sql, [userId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length > 0) {
        const user = results[0];

        // Nếu `avata` có đường dẫn thì tạo URL đầy đủ
        if (user.avata) {
          user.avata = `${req.protocol}://${req.get("host")}${user.avata}`;
        }

        return res.status(200).json({
          message: "Thông tin tài khoản",
          result: [user],
        });
      } else {
        return res.status(404).json({ error: "Không tìm thấy người dùng." });
      }
    });
  });
};

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

exports.AddAvata = (req, res) => {
  upload.single("avata")(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: "Lỗi khi tải ảnh lên." });
    }

    const { id } = req.body;
    if (!req.file || !id) {
      return res.status(400).json({ error: "Thiếu id hoặc ảnh." });
    }

    // Đường dẫn tương đối của ảnh
    const imageUrl = `/uploads/${req.file.filename}`;

    const sql = "UPDATE users SET avata = ? WHERE id = ?";

    db.query(sql, [imageUrl, id], (err, result) => {
      if (err) {
        console.error("Lỗi khi cập nhật avatar:", err);
        return res.status(500).json({ error: "Lỗi máy chủ." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Không tìm thấy người dùng." });
      }

      // Trả về đường dẫn đầy đủ
      const fullImageUrl = `${req.protocol}://${req.get("host")}${imageUrl}`;
      return res.status(200).json({
        message: "Cập nhật avatar thành công!",
        avatar: fullImageUrl,
      });
    });
  });
};

exports.Addcarts = (req, res) => {
  const { user_id, product_id, color, size, quantity } = req.body;

  let sql =
    "INSERT INTO cart (user_id, product_id, color, size, quantity ) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [user_id, product_id, color, size, quantity],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({
        message: "Thêm sản phẩm thành công! Vui lòng kiểm tra giỏ hàng",
      });
    }
  );
};
exports.getCartItem = (req, res) => {
  const { user_id } = req.body;
  let sql = `SELECT a.id, a.product_id, a.color, a.size, a.quantity, b.product_name, b.product_image, b.price FROM cart a JOIN products b ON a.product_id = b.id WHERE user_id = ?`;
  db.query(sql, [user_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ data: result, total: result.length });
  });
};

exports.deleteCartItems = (req, res) => {
  const { id } = req.query;
  let sql = "DELETE FROM cart WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Xóa đơn hàng thành công!" });
  });
};

exports.totalItemsCart = (req, res) => {
  const { user_id } = req.body; // ✅ Đúng tên biến req
  const sql = "SELECT COUNT(*) AS total FROM cart WHERE user_id = ?";

  db.query(sql, [user_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ total: result[0].total }); // ✅ Trả về số lượng đúng
  });
};

exports.createOrder = (req, res) => {
  const { user_id, payment_method, address, detail_address, items } = req.body; // items = [{ product_id, quantity, price }]

  if (!user_id || !items || items.length === 0) {
    return res.status(400).json({ error: "Dữ liệu không hợp lệ!" });
  }
  const orderTimestamp = moment().format("YYYYMMDDHHmmss");
  const order_code = `OD_${orderTimestamp}_${user_id}`;
  const total_price = items.reduce((acc, item) => acc + item.price, 0);

  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query(
      "INSERT INTO orders (user_id, total_price, payment_method, address, detail_address, order_code) VALUES (?, ?, ?, ?, ?, ?)",
      [
        user_id,
        total_price,
        payment_method,
        address,
        detail_address,
        order_code,
      ],
      (err, result) => {
        if (err) {
          return db.rollback(() =>
            res.status(500).json({ error: err.message })
          );
        }

        const order_id = result.insertId;
        const values = items.map((item) => [
          order_id,
          item.product_id,
          item.product_image,
          item.color,
          item.size,
          item.quantity,
          item.price,
        ]);

        db.query(
          "INSERT INTO order_details (order_id, product_id, product_image, color, size, quantity, price) VALUES ?",
          [values],
          (err) => {
            if (err) {
              return db.rollback(() =>
                res.status(500).json({ error: err.message })
              );
            }
            db.commit((err) => {
              if (err) {
                return db.rollback(() =>
                  res.status(500).json({ error: err.message })
                );
              }
              res
                .status(201)
                .json({ message: "Đơn hàng đã được tạo!", order_id });
            });
          }
        );
      }
    );
  });
};

exports.getOrdersByUser = (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "Thiếu user_id" });
  }

  const sql = "SELECT * FROM orders WHERE user_id = ?";

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(200).json(results);
  });
};
/**Chi tiet don hang */
exports.getOrderDetails = (req, res) => {
  const { order_id } = req.query;

  const sql = `
    SELECT od.order_detail_id, od.order_id, p.product_name, od.quantity, od.price, od.product_image,
    od.color, od.size
    FROM order_details od
    JOIN products p ON od.product_id = p.id
    WHERE od.order_id = ?`;

  db.query(sql, [order_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(200).json(results);
  });
};

/**Gửi mail thông báo của khách hàng */

// const sendOrderNotification = async () => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: "your-email@gmail.com", // Thay bằng email của bạn
//       pass: "your-email-password",  // Lấy mật khẩu ứng dụng từ Google
//     },
//   });

//   const mailOptions = {
//     from: "your-email@gmail.com",
//     to: "giangcuong0603@gmail.com", // Email admin nhận thông báo
//     subject: "Thông báo: Có đơn hàng mới!",
//     html: `<h3>Thông báo</h3>
//            <p>Hệ thống vừa ghi nhận một đơn hàng mới.</p>
//            <p>Vui lòng kiểm tra trên hệ thống quản lý.</p>
//            <a href="https://your-admin-panel.com/orders">Xem danh sách đơn hàng</a>`,
//   };

//   await transporter.sendMail(mailOptions);
// };

// exports.sendEmail = async(req, res) => {
//   try {
//     const newOrder = req.body;
//     const result = await db.query("INSERT INTO orders SET ?", newOrder);

//     await sendOrderNotification(newOrder); // Gửi email cho admin

//     res.json({ success: true, message: "Đơn hàng đã được đặt!" });
//   } catch (error) {
//     res.status(500).json({ error: "Lỗi khi đặt hàng" });
//   }
// };
