const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const querystring = require("querystring");
const db = require("../models/db");



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

//-------------------- onepay----------------

exports.payProduct = (req, res) => {
  try {
    const { amount, orderId } = req.body;

    const merchantId = process.env.MERCHANT_ID;
    const accessCode = process.env.ACCESS_CODE;
    const secureSecret = process.env.SECURE_SECRET;
    const returnUrl = process.env.RETURN_URL;

    if (!merchantId || !accessCode || !secureSecret || !returnUrl) {
      return res.status(500).json({ error: "Missing environment variables" });
    }

    const amountInt = parseInt(amount, 10);
    if (isNaN(amountInt) || amountInt <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const orderRef = `${orderId}-${Date.now()}`;

    // Lấy địa chỉ IP hợp lệ
    const userIpAddress = req.headers["x-forwarded-for"]?.split(",")[0] || "103.216.117.53";

    const params = {
      AgainLink: "http://onepay.vn",
      Title: "Thanh toán đơn hàng",
      vpc_Version: "2",
      vpc_Command: "pay",
      vpc_AccessCode: accessCode,
      vpc_Merchant: merchantId,
      vpc_Locale: "vn",
      vpc_Currency: "VND",
      vpc_Amount: amountInt * 100,
      vpc_OrderInfo: orderId,
      vpc_ReturnURL: returnUrl, // Cập nhật return URL hợp lệ
      vpc_MerchTxnRef: orderRef,
      vpc_TicketNo: userIpAddress,
    };

    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});

    const hashData = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    const secureHash = crypto
      .createHmac("sha256", Buffer.from(secureSecret, "hex"))
      .update(hashData)
      .digest("hex");

    sortedParams.vpc_SecureHash = secureHash;

    const paymentUrl = `https://mtf.onepay.vn/vpcpay/vpcpay.op?${querystring.stringify(
      sortedParams
    )}`;

    
    res.json({ paymentUrl });
  } catch (error) {
    res.status(500).json({ error: "Error processing payment", details: error.message });
  }
};