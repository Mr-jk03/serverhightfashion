const querystring = require("querystring");
const moment = require("moment");
const crypto = require("crypto");

const tmnCode = "KTVN86IN"; // Mã Merchant
const secretKey = "9VTDHVXV1TRO2IAV2UWU5M51BGCNKIY6"; // Khóa bí mật
const returnUrl = "https://2b01-95-173-218-70.ngrok-free.app"; // URL nhận kết quả thanh toán

exports.payProduct = (req, res) => {
  try {
    const { orderId, amount } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: "Thiếu thông tin thanh toán" });
    }

    // Khởi tạo tham số
    let paymentParams = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Amount: amount * 100,
      vnp_CreateDate: moment().format("YYYYMMDDHHmmss"),
      vnp_CurrCode: "VND",
      vnp_IpAddr: "127.0.0.1",
      vnp_Locale: "vn",
      vnp_OrderInfo: `Thanh toan ${orderId}`,
      vnp_OrderType: "other",
      vnp_ReturnUrl: returnUrl,
      vnp_ExpireDate: moment().add(15, "minutes").format("YYYYMMDDHHmmss"),
      vnp_TxnRef: `${orderId}-${Date.now()}`,
    };

    // Sắp xếp tham số theo thứ tự A-Z
    const sortedParams = Object.fromEntries(
      Object.entries(paymentParams).sort(([a], [b]) => a.localeCompare(b))
    );

    // Tạo chuỗi dữ liệu để ký
    const signData = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join("&");

    // Tạo SecureHash
    const secureHash = crypto
      .createHmac("sha512", Buffer.from(secretKey, "utf-8"))
      .update(signData, "utf-8")
      .digest("hex");

    // Thêm SecureHash vào tham số
    sortedParams.vnp_SecureHash = secureHash;

    // Tạo URL thanh toán
    const paymentUrl =
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?" +
      new URLSearchParams(sortedParams).toString();

    res.json({ paymentUrl });
  } catch (error) {
    console.error("Lỗi thanh toán:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi tạo thanh toán" });
  }
};
