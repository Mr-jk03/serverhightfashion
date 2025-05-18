// utils/nlpTrainer.js
const { NlpManager } = require("node-nlp");

const manager = new NlpManager({ languages: ["vi"] });

const trainNLP = async () => {
  // Thêm các câu hỏi
  manager.addDocument("vi", "Có những sản phẩm nào?", "product.query");
  manager.addDocument("vi", "Danh sách sản phẩm", "product.query");
  manager.addDocument("vi", "Liệt kê sản phẩm đi", "product.query");
  manager.addDocument("vi", "Các sản phẩm hiện có là gì?", "product.query");
  manager.addDocument(
    "vi",
    "Cho tôi biết danh sách các sản phẩm",
    "product.query"
  );
  manager.addDocument("vi", "Có gì mới không?", "product.query");
  manager.addDocument("vi", "Cập nhật sản phẩm mới nhất", "product.query");
  manager.addDocument("vi", "Bạn có sản phẩm nào không?", "product.query");
  manager.addDocument(
    "vi",
    "Tôi muốn xem các sản phẩm của bạn",
    "product.query"
  );
  manager.addDocument("vi", "Sản phẩm nào có sẵn?", "product.query");
  manager.addDocument("vi", "Chọn sản phẩm cho tôi", "product.query");
  manager.addDocument("vi", "Liệt kê các sản phẩm hiện tại", "product.query");
  manager.addDocument("vi", "Sản phẩm mới nhất là gì?", "product.query");
  manager.addDocument(
    "vi",
    "Có những sản phẩm nào bán trên website?",
    "product.query"
  );
  manager.addDocument("vi", "Các sản phẩm hiện có là gì?", "product.query");

  // Giảm giá
  manager.addDocument(
    "vi",
    "Sản phẩm nào đang được giảm giá?",
    "product.discount"
  );
  manager.addDocument(
    "vi",
    "Có sản phẩm nào đang khuyến mãi không?",
    "product.discount"
  );
  manager.addDocument(
    "vi",
    "Những món nào đang giảm giá vậy?",
    "product.discount"
  );
  manager.addDocument(
    "vi",
    "Hiện tại có ưu đãi nào không?",
    "product.discount"
  );
  manager.addDocument(
    "vi",
    "Cho mình xem các sản phẩm đang khuyến mãi",
    "product.discount"
  );
  manager.addDocument("vi", "Sản phẩm nào đang có ưu đãi?", "product.discount");
  manager.addDocument(
    "vi",
    "Các mặt hàng đang giảm giá là gì?",
    "product.discount"
  );
  manager.addDocument(
    "vi",
    "Có chương trình giảm giá nào không?",
    "product.discount"
  );
  manager.addDocument(
    "vi",
    "Danh sách sản phẩm khuyến mãi đâu?",
    "product.discount"
  );
  manager.addDocument("vi", "Có hàng nào đang sale không?", "product.discount");
  manager.addDocument(
    "vi",
    "Tôi muốn xem các sản phẩm giảm giá",
    "product.discount"
  );

  //Danh sách dịch vụ
  manager.addDocument("vi", "Làm sao để thanh toán?", "product.pay");
  manager.addDocument("vi", "Tôi thanh toán bằng cách nào?", "product.pay");

  manager.addDocument("vi", "Tôi có thể trả tiền như thế nào?", "product.pay");
  manager.addDocument(
    "vi",
    "Bạn chấp nhận hình thức thanh toán nào?",
    "product.pay"
  );
  manager.addDocument("vi", "Tôi muốn biết cách thanh toán", "product.pay");
  manager.addDocument("vi", "Thanh toán đơn hàng như thế nào?", "product.pay");
  manager.addDocument("vi", "Hướng dẫn thanh toán giúp tôi", "product.pay");
  manager.addDocument("vi", "Cách thanh toán qua VnPay?", "product.pay");
  manager.addDocument("vi", "Thanh toán qua VnPay?", "product.pay");
  // phương thức thanh toán
  manager.addDocument(
    "vi",
    "Có những phương thức thanh toán nào?",
    "product.htpay"
  );
  manager.addDocument("vi", "Có mấy cách thanh toán?", "product.htpay");
  manager.addDocument("vi", "phương thức thanh toán", "product.htpay");
  manager.addDocument(
    "vi",
    "Thanh toán online có được không?",
    "product.htpay"
  );

  manager.addDocument(
    "vi",
    "Có thể thanh toán khi nhận hàng không?",
    "product.ttpay"
  );

  //Cách đăng nhập, đăng kí
  manager.addDocument(
    "vi",
    "Làm thế nào để đăng nhập tài khoản trên website?",
    "product.login"
  );
  manager.addDocument(
    "vi",
    "Làm thế nào để đăng nhập tài khoản?",
    "product.login"
  );
  manager.addDocument("vi", "Tôi đăng nhập bằng cách nào?", "product.login");
  manager.addDocument(
    "vi",
    "Cách đăng nhập vào website là gì?",
    "product.login"
  );
  manager.addDocument("vi", "Hướng dẫn đăng nhập tài khoản", "product.login");
  manager.addDocument("vi", "Tôi không biết đăng nhập ở đâu", "product.login");
  manager.addDocument("vi", "Tôi muốn vào tài khoản của mình", "product.login");
  manager.addDocument("vi", "Trang đăng nhập nằm ở đâu?", "product.login");
  manager.addDocument("vi", "Làm sao để truy cập tài khoản?", "product.login");
  manager.addDocument("vi", "Không thấy nút đăng nhập", "product.login");
  manager.addDocument(
    "vi",
    "Tôi cần đăng nhập để mua hàng đúng không?",
    "product.login"
  );
  manager.addDocument(
    "vi",
    "Làm thế nào để đăng ký tài khoản trên website?",
    "product.register"
  );
  manager.addDocument(
    "vi",
    "Làm thế nào để đăng ký tài khoản trên website?",
    "product.register"
  );
  manager.addDocument(
    "vi",
    "Tôi muốn tạo tài khoản thì làm thế nào?",
    "product.register"
  );
  manager.addDocument(
    "vi",
    "Cách đăng ký tài khoản là gì?",
    "product.register"
  );
  manager.addDocument("vi", "Hướng dẫn tạo tài khoản mới", "product.register");
  manager.addDocument("vi", "Đăng ký tài khoản ở đâu?", "product.register");
  manager.addDocument(
    "vi",
    "Tôi cần tài khoản để sử dụng dịch vụ, đăng ký như nào?",
    "product.register"
  );
  manager.addDocument(
    "vi",
    "Làm sao để trở thành thành viên?",
    "product.register"
  );
  manager.addDocument(
    "vi",
    "Đăng ký thành viên bằng cách nào?",
    "product.register"
  );
  manager.addDocument(
    "vi",
    "Tôi chưa có tài khoản, làm sao để đăng ký?",
    "product.register"
  );
  manager.addDocument(
    "vi",
    "Tôi muốn đăng ký tài khoản mới",
    "product.register"
  );
  manager.addDocument("vi", "Chào bạn", "product.hello");
  manager.addDocument("vi", "Hello", "product.hello");
  manager.addDocument("vi", "Xin chào bạn nhé", "product.hello");
  manager.addDocument("vi", "Hi", "product.hello");
  manager.addDocument("vi", "Chào shop", "product.hello");
  manager.addDocument("vi", "Tôi muốn nói chuyện", "product.hello");
  manager.addDocument("vi", "Có ai ở đó không?", "product.hello");
  manager.addDocument("vi", "Tôi cần hỗ trợ", "product.hello");
  manager.addDocument("vi", "Chào ngày mới", "product.hello");
  manager.addDocument("vi", "Mình cần tư vấn", "product.hello");

  manager.addDocument("vi", "Cảm ơn", "product.thanks");
  manager.addDocument("vi", "Cảm ơn bạn", "product.thanks");
  manager.addDocument("vi", "Cảm ơn rất nhiều", "product.thanks");
  manager.addDocument("vi", "Cảm ơn nhiều nhé", "product.thanks");
  manager.addDocument("vi", "Cảm ơn vì đã giúp đỡ", "product.thanks");
  manager.addDocument("vi", "Cảm ơn bạn rất nhiều", "product.thanks");
  manager.addDocument("vi", "Mình biết ơn lắm", "product.thanks");
  manager.addDocument("vi", "Cảm ơn nha", "product.thanks");
  manager.addDocument("vi", "Xin cảm ơn", "product.thanks");
  manager.addDocument("vi", "Cảm ơn sự hỗ trợ của bạn", "product.thanks");
  manager.addDocument("vi", "Cảm ơn đã tư vấn", "product.thanks");

  // Trả lời mẫu
  manager.addAnswer(
    "vi",
    "greetings.hello",
    "Chào bạn! Mình có thể giúp gì cho bạn?"
  );
  manager.addAnswer(
    "vi",
    "greetings.how_are_you",
    "Mình khỏe, cảm ơn bạn đã hỏi!"
  );
  manager.addAnswer("vi", "bot.name", "Mình là một chatbot.");

  await manager.train();
  manager.save();
};

module.exports = { trainNLP, manager };
