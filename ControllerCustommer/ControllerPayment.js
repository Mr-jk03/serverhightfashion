const moment = require("moment");
const crypto = require("crypto");
const querystring = require("qs");
const db = require("../models/db");
const { sendOrderNotification } = require("../sendMail/sendMail");

const tmnCode = "KTVN86IN"; // Mã Merchant từ VNPAY
const secretKey = "7KRK07TCMGH6XYT8IZHTUWH5D2AAPZOJ"; // Chuỗi bí mật từ VNPAY
const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"; // URL VNPAY
const returnUrl = "http://192.168.47.119:3000/statusOrder"; // URL nhận kết quả

exports.createPayment = (req, res) => {
  try {
    const { user_id, payment_method, address, detail_address, items } =
      req.body;

    if (!user_id || !items || items.length === 0) {
      return res.status(400).json({ error: "Dữ liệu không hợp lệ!" });
    }

    // Tính tổng tiền đơn hàng
    const total_price = items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // Tạo mã đơn hàng (order_code)
    const orderTimestamp = moment().format("YYYYMMDDHHmmss");
    const order_code = `OD_${orderTimestamp}_${user_id}`;

    // **Khởi tạo dữ liệu VNPay**
    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Amount: total_price * 100, // Nhân 100 theo yêu cầu VNPay
      vnp_CreateDate: orderTimestamp,
      vnp_CurrCode: "VND",
      vnp_IpAddr: req.ip || "192.168.208.119",
      vnp_Locale: "vn",
      vnp_OrderInfo: `KH_${user_id}_TG_${orderTimestamp}_TT_${total_price}`,
      vnp_OrderType: "other",
      vnp_ReturnUrl: returnUrl,
      vnp_ExpireDate: moment().add(15, "minutes").format("YYYYMMDDHHmmss"),
      vnp_TxnRef: order_code, // Dùng order_code để đồng nhất đơn hàng
    };

    // **Sắp xếp tham số theo A-Z**
    let sortAZ = Object.fromEntries(
      Object.entries(vnp_Params).sort(([a], [b]) => a.localeCompare(b))
    );

    // **Tạo chuỗi rawData và mã hóa SHA512**
    const rawData = querystring.stringify(sortAZ, { encode: true });
    const secureHash = crypto
      .createHmac("sha512", Buffer.from(secretKey, "utf-8"))
      .update(rawData, "utf-8")
      .digest("hex");

    const rawDataWithHash = `${rawData}&vnp_SecureHash=${secureHash}`;
    const paymentUrl = `${vnpUrl}?${rawDataWithHash}`;

    // **Lưu đơn hàng vào database với trạng thái "pending"**
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
                res.status(201).json({
                  message: "Đơn hàng đã được tạo!",
                  order_id,
                  paymentUrl,
                });
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Lỗi khi tạo thanh toán:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo thanh toán" });
  }
};

exports.getVNPay_inp = (req, res) => {
  try {
    let vnp_Params = req.query;

    if (!vnp_Params["vnp_SecureHash"]) {
      return res
        .status(400)
        .json({ RspCode: "97", Message: "Missing SecureHash" });
    }

    let secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    const signData = querystring.stringify(vnp_Params, { encode: true });
    const signed = crypto
      .createHmac("sha512", secretKey)
      .update(signData, "utf-8")
      .digest("hex");

    if (secureHash === signed) {
      const order_code = vnp_Params["vnp_TxnRef"];
      const rspCode = vnp_Params["vnp_ResponseCode"];

      let orderStatus = "payFail"; // Mặc định nếu không thành công
      let message = "Thanh toán không thành công";

      if (rspCode === "00") {
        orderStatus = "paySuccess";
        message = "Thanh toán thành công";
      } else if (rspCode === "24") {
        message = "Khách hàng hủy đơn hàng!";
      }

      let sql = "UPDATE orders SET order_status = ? WHERE order_code = ?";
      db.query(sql, [orderStatus, order_code], (err, result) => {
        if (err) {
          return res.status(500).json({
            RspCode: "99",
            Message: "Lỗi cập nhật trạng thái đơn hàng",
          });
        }
        return res.status(200).json({ RspCode: rspCode, Message: message });
      });
    } else {
      return res.status(200).json({ RspCode: "97", Message: "Fail checksum" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ RspCode: "99", Message: "Internal Server Error" });
  }
};

exports.vnpayReturn = (req, res) => {
  try {
    console.log("✅ Nhận request query:", req.query);

    var vnp_Params = req.query;
    var secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    console.log("✅ Tham số sau khi xóa SecureHash:", vnp_Params);

    let sort_vnp_Params = sortObject(vnp_Params);
    console.log("✅ Tham số sau khi sắp xếp:", sort_vnp_Params);

    var signData = querystring.stringify(sort_vnp_Params, { encode: true });
    console.log("✅ Dữ liệu đã stringify:", signData);

    var hmac = crypto.createHmac("sha512", secretKey);
    var signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    console.log("✅ Chữ ký đã tạo:", signed);
    console.log("✅ Chữ ký từ VNPAY:", secureHash);

    // if (secureHash === signed) {
    //   console.log("✅ Xác minh chữ ký thành công!");
    //   res.render("success", { code: vnp_Params["vnp_ResponseCode"] });
    // } else {
    //   console.log("❌ Xác minh chữ ký thất bại!");
    //   res.render("success", { code: "97" });
    // }
  } catch (error) {
    console.error("❌ Lỗi xử lý Return VNPAY:", error);
    return res
      .status(500)
      .json({ RspCode: "99", Message: "Internal Server Error" });
  }
};
