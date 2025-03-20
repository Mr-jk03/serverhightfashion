const express = require("express");
const router = express.Router();
const ProductController = require("../controller/Controller");
const ProductControllerCustomer = require("../ControllerCustommer/Controller")
const Payment = require("../ControllerCustommer/ControllerPayment")

router.get("/products", ProductController.getAllProducts);
router.post("/addUser", ProductController.addUser)
router.post("/login", ProductController.loginUser)
router.get("/totalcustomer", ProductController.getAllCustomerNumber)
router.get("/getallcategoryadmin", ProductController.getAllCategories)
router.post("/addCategory", ProductController.addCategory)
router.delete("/deleteCategory", ProductController.deleteCategory)
router.patch("/updateCategory", ProductController.updateCategory)
router.get("/getListCustomer", ProductController.getListCustomer)
router.delete("/deleteUser", ProductController.deteleCustomer)
router.post("/addBanner",ProductController.addBanner)
router.get("/getBannerList", ProductController.getBanner)
router.delete("/deleteBanner", ProductController.deleteBanner)
router.patch("/updateBanner", ProductController.updateBanner)
router.post("/addDiscountCode", ProductController.addDiscountCode)
router.get("/getListDiscount", ProductController.getDisCountList)
router.patch("/updateDiscount", ProductController.updateDiscount)
router.delete("/deleteDiscount", ProductController.deleteDiscountCode)
router.post("/addProduct", ProductController.addProduct)
router.get("/getListProducts", ProductController.getListProducts)
router.patch("/updateProduct", ProductController.updateProduct)
router.delete("/deleteProduct", ProductController.deleteProduct)
router.get("/getdataPieChar", ProductController.getDataPieChart)

/**--- */
router.post("/addNewUser", ProductControllerCustomer.addUser)
router.post("/loginUser", ProductControllerCustomer.loginUser)
router.get("/getallcategory", ProductControllerCustomer.getAllCategories)
router.get("/selectProduct", ProductControllerCustomer.selectProduct)
router.get("/getuserInfo", ProductControllerCustomer.UserInfo)
router.patch('/addAvata', ProductControllerCustomer.AddAvata)
router.post("/addtoCart", ProductControllerCustomer.Addcarts)
router.post("/getCartItems", ProductControllerCustomer.getCartItem)
router.delete("/deleteCartItem", ProductControllerCustomer.deleteCartItems)
router.post("/totalItemsCart", ProductControllerCustomer.totalItemsCart)
router.post("/createOrder", ProductControllerCustomer.createOrder)
router.get("/getListOrder", ProductControllerCustomer.getOrdersByUser)
router.get("/getOrderDetail", ProductControllerCustomer.getOrderDetails)

router.post("/productPayment", Payment.payProduct)


module.exports = router;