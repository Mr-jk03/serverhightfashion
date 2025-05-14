const express = require("express");
const router = express.Router();
const ProductController = require("../controller/Controller");
const ProductControllerCustomer = require("../ControllerCustommer/Controller");
const Payment = require("../ControllerCustommer/ControllerPayment");
const botReply = require("../ControllerCustommer/ChatBot");

router.get("/products", ProductController.getAllProducts);
router.post("/addUser", ProductController.addUser);
router.post("/login", ProductController.loginUser);
router.get("/totalcustomer", ProductController.getAllCustomerNumber);
router.get("/getallcategoryadmin", ProductController.getAllCategories);
router.post("/addCategory", ProductController.addCategory);
router.delete("/deleteCategory", ProductController.deleteCategory);
router.patch("/updateCategory", ProductController.updateCategory);
router.get("/getListCustomer", ProductController.getListCustomer);
router.delete("/deleteUser", ProductController.deteleCustomer);
router.post("/addBanner", ProductController.addBanner);
router.get("/getBannerList", ProductController.getBanner);
router.delete("/deleteBanner", ProductController.deleteBanner);
router.patch("/updateBanner", ProductController.updateBanner);
router.post("/addDiscountCode", ProductController.addDiscountCode);
router.get("/getListDiscount", ProductController.getDisCountList);
router.patch("/updateDiscount", ProductController.updateDiscount);
router.delete("/deleteDiscount", ProductController.deleteDiscountCode);
router.post("/addProduct", ProductController.addProduct);
router.get("/getListProducts", ProductController.getListProducts);
router.patch("/updateProduct", ProductController.updateProduct);
router.delete("/deleteProduct", ProductController.deleteProduct);
router.get("/getdataPieChar", ProductController.getDataPieChart);
router.get("/getDataDashboard", ProductController.getdataDashboard);
router.get("/getListInventory", ProductController.getListInventory);
router.post("/addPrdtoStock", ProductController.AddPrdToStock);
router.delete("/deletePrdInStock", ProductController.DeletePrdInStock);
router.put("/updateStatusOrder", ProductController.updateStatusOrder);

/**--- */
router.post("/addNewUser", ProductControllerCustomer.addUser);
router.post("/loginUser", ProductControllerCustomer.loginUser);
router.get("/getallcategory", ProductControllerCustomer.getAllCategories);
router.get("/selectProduct", ProductControllerCustomer.selectProduct);
router.get("/getuserInfo", ProductControllerCustomer.UserInfo);
router.patch("/addAvata", ProductControllerCustomer.AddAvata);
router.post("/addtoCart", ProductControllerCustomer.Addcarts);
router.post("/getCartItems", ProductControllerCustomer.getCartItem);
router.delete("/deleteCartItem", ProductControllerCustomer.deleteCartItems);
router.post("/totalItemsCart", ProductControllerCustomer.totalItemsCart);
router.post("/createOrder", ProductControllerCustomer.createOrder);
router.get("/getListOrder", ProductControllerCustomer.getOrdersByUser);
router.get("/getOrderDetail", ProductControllerCustomer.getOrderDetails);
router.post(
  "/addFavoriteProduct",
  ProductControllerCustomer.addFavoriteProduct
);

router.post("/productPayment", Payment.createPayment);
router.get("/IPN", Payment.getVNPay_inp);
router.get("/vnpay_return", Payment.vnpayReturn);
/**-------- */

/**--------chatbot */
router.post("/botRepply", botReply.repComment);

const querystring = require("qs");
const crypto = require("crypto");
const config = require("../config/vnpay");

router.get("/create-payment", (req, res) => {
  const { amount, orderId } = req.body;

  let date = new Date();
  const amountNumber = Number(amount); // Đảm bảo amount là số
  if (isNaN(amountNumber) || amountNumber <= 0) {
    return res.status(400).json({ error: "amount phải là số hợp lệ" });
  }
  let createDate = date.toISOString().replace(/[-:.]/g, "").slice(0, 14); // YYYYMMDDHHmmss

  let vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: amountNumber * 100, // Đơn vị VNPay là VND x 100
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: "Thanh toan don hang",
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: config.returnUrl,
    vnp_IpAddr: "192.168.208.119",
    vnp_CreateDate: createDate,
  };

  // 🌟 Bước 1: Sắp xếp tham số theo A-Z (chưa có vnp_SecureHash)
  let sortedParams = Object.fromEntries(
    Object.entries(vnp_Params).sort(([a], [b]) => a.localeCompare(b))
  );

  // 🌟 Bước 2: Tạo vnp_SecureHash
  let signData = querystring.stringify(sortedParams, { encode: false });
  let hmac = crypto.createHmac("sha512", config.hashSecret);
  let signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  // 🌟 Bước 3: Thêm vnp_SecureHash vào danh sách tham số
  sortedParams["vnp_SecureHash"] = signed;

  // 🌟 Bước 4: Sắp xếp lại tham số lần nữa (để đảm bảo vnp_SecureHash cũng theo A-Z)
  let finalSortedParams = Object.fromEntries(
    Object.entries(sortedParams).sort(([a], [b]) => a.localeCompare(b))
  );

  // 🌟 Bước 5: Tạo paymentUrl
  let paymentUrl =
    config.vnpUrl +
    "?" +
    querystring.stringify(finalSortedParams, { encode: true });

  console.log("paymentUrl", paymentUrl);

  res.json({ paymentUrl });
});

module.exports = router;
