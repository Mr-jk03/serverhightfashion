
const nodemailer = require("nodemailer");

const sendOrderNotification = async (order_code) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "your-email@gmail.com", // Thay bằng email của bạn
      pass: "your-email-password",  // Lấy mật khẩu ứng dụng từ Google
    },
  });

  const mailOptions = {
    from: "your-email@gmail.com",
    to: "giangcuong0603@gmail.com", 
    subject: "Thông báo: Có đơn hàng mới!",
    html: `<h3>Thông báo</h3>
           <p>Hệ thống vừa ghi nhận một đơn hàng mới.</p>
           <p>Mã đơn hàng : ${order_code}</p>
           <p>Vui lòng kiểm tra trên hệ thống quản lý.</p>
           <a href="https://your-admin-panel.com/orders">Xem danh sách đơn hàng</a>`,
  };

  console.log('transporter', transporter)
  console.log('mailOptions', mailOptions)


  ///await transporter.sendMail(mailOptions);
};

module.exports ={sendOrderNotification}