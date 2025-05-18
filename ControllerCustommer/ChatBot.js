const { NlpManager } = require("node-nlp");
const db = require("../models/db");
const { trainNLP, manager } = require("../models/trainning");

trainNLP();

exports.repComment = async (req, res) => {
  const { userMessage } = req.body;
  if (!userMessage) {
    return res.status(400).json({
      error: "Xin lỗi, câu hỏi này mình chưa xử lí được 🥲",
    });
  }

  const response = await manager.process("vi", userMessage);
  const intent = response.intent;

  if (intent === "product.query") {
    const sql = "SELECT product_name FROM products LIMIT 10;";

    db.query(sql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ reply: "Xin lỗi, hiện tại chưa kiểm tra được." });
      }

      if (!result || result.length === 0) {
        return res.json({ reply: "Hiện tại chưa có sản phẩm nào." });
      }

      const list = result
        .map((item, i) => `${i + 1}. ${item.product_name}`)
        .join("\n");

      return res.json({
        reply: `Dưới đây là một số sản phẩm mời bạn tham khảo😊:\n${list}`,
      });
    });
  } else if (intent === "product.discount") {
    const sql = "SELECT * FROM products WHERE discount > 0";
    db.query(sql, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ reply: "Xin lỗi, hiện tại không thể tìm kiếm được" });
      }

      if (!result || result.length === 0) {
        return res.json({
          reply: "Hiện tại chưa có sản phẩm nào được giảm giá",
        });
      }

      const list = result
        .map(
          (item, i) => `${i + 1}. ${item.product_name}. Giảm ${item.discount} %`
        )
        .join("\n");

      return res.json({
        reply: `Dưới đây là một số sản phẩm mời bạn tham khảo😊:\n${list}`,
      });
    });
  } else if (intent === "product.pay") {
    return res.json({
      reply: `Hướng dẫn thanh toán: \n${"Bước 1: Chọn một danh mục muốn mua"}
      \n${"Bước 2: Chọn sản phẩm ưng ý"}
      \n${"Bước 3: Chọn thông tin sản phẩm tương ứng với sở thích"}
      \n${"Bước 4: Ấn 'MUA HÀNG' -> sang trang thanh toán"}
      \n${"Bước 5: Điền đầy đủ thông tin người mua -> Chọn phương thức thanh toán(VnPay)"}
      \n${"Bước 6: Ấn 'Đặt hàng' -> sang trang VnPay và điền thông tin tài khoản của bạn"}
       \n${"Chúc bạn thành công 😊"}`,
    });
  } else if (intent === "product.htpay") {
    return res.json({
      reply: `Trang web có 2 phương thức thanh toán chính là thanh toán qua VnPay và thanh toán khi nhận hàng nha bạn!`,
    });
  } else if (intent === "product.product.ttpay") {
    return res.json({
      reply: `Có nha, Ngoài ra bạn có thể thanh toán online qua VnPay nữa nha`,
    });
  } else if (intent === "product.login") {
    return res.json({
      reply: `Hướng dẫn đăng nhập webSite: 
            \n${"Bước 1: Đi tới trang đăng nhập"}
            \n${"Bước 2: Điền thông tin tài khoản (email) và mật khẩu"}
            \n${"Bước 3: Ấn nút 'Đăng nhập'"}
            `,
    });
  } else if (intent === "product.register") {
    return res.json({
      reply: `Hướng dẫn đăng ký tài khoản: 
            \n${"Bước 1: Đi tới trang đăng nhập và chọn 'ĐĂNG KÝ'"}
            \n${"Bước 2: Điền thông tin tài khoản (email) và mật khẩu"}
            \n${"Bước 3: Điền họ tên của bạn"}
            \n${"Bước 4: Điền số điện thoại của bạn"}
            \n${"Bước 5: Sau đó bấm đăng kí"}
            \n${"Cuối cùng: Quay trở lại trang đăng nhập và đăng nhập với tài khoản vừa đăng kí"}
            \n${"Chúc bạn thành công !"}
            `,
    });
  } else if (intent === "product.hello") {
    return res.json({
      reply: `Chào bạn, tôi có thể giúp gì cho bạn!`,
    });
  } else if (intent === "product.thanks") {
    return res.json({
      reply: `Không có gì, Chúc bạn mua sắm vui vẻ 😊`,
    });
  } else {
    return res.json({
      reply: `Xin lỗi, tôi chưa hiểu rõ câu hỏi của bạn lắm 😔`,
    });
  }
};
