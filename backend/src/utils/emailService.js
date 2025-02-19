const nodemailer = require("nodemailer");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "official.team.undefined@gmail.com",
    pass: "djwd wecj vnux byoy",
  },
});

const sendEmail = async (to, purpose, data) => {
  const otp = generateOTP();
  let mailOptions = {};

  if (purpose === "register") {
    mailOptions = {
      from: "official.team.undefined@gmail.com",
      to,
      subject: "OTP Verification for NinjaNest!",
      text: `
          Hello,
  
          Thank you for choosing NinjaNest!
  
          Here is your One-Time Password (OTP) for verification:
  
          **${otp}**
  
          Please enter this OTP to verify your email address and complete your registration. If you did not request this OTP, please ignore this email.
  
          Best regards,  
          The NinjaNest Team
  
          ---
  
          For any questions or support, feel free to contact us at [official.team.undefined@gmail.com](mailto:official.team.undefined@gmail.com).
      `,
    };
  } else if (purpose === "forgotPassword") {
    const { owner, member, role } = data;

    mailOptions = {
      from: "official.team.undefined@gmail.com",
      to,
      subject: `🎉 Welcome to the Project, ${member}! 🎉`,
      text: `
          **Hello ${member},**

          🎉 **Congratulations!** You have been successfully added to a project on **NinjaNest**.

          📝 **Project Owner:** ${owner}  
          🔑 **Assigned Role:** ${role}

          You are now a **valued member** of the team, and we’re excited to have you onboard! 🚀  
          Please log in to your **NinjaNest account** to view the project details and your responsibilities.

          If you have any questions or need assistance, feel free to reach out to **${owner}** or contact our **support team**.

          ---  

          **🌟 Welcome aboard!** We look forward to your amazing contributions and teamwork.  

          **Best regards,**  
          The **NinjaNest Team**  

          ---  

          🛠 **Need help?**  
          For any questions or support, feel free to contact us at:  
          **📧 [official.team.undefined@gmail.com](mailto:official.team.undefined@gmail.com)**  
              `,
    };
  } else if (purpose === "changePassword") {
    const { owner, member, role } = data;

    mailOptions = {
      from: "official.team.undefined@gmail.com",
      to,
      subject: `🎉 Welcome to the Project, ${member}! 🎉`,
      text: `
          **Hello ${member},**

          🎉 **Congratulations!** You have been successfully added to a project on **NinjaNest**.

          📝 **Project Owner:** ${owner}  
          🔑 **Assigned Role:** ${role}

          You are now a **valued member** of the team, and we’re excited to have you onboard! 🚀  
          Please log in to your **NinjaNest account** to view the project details and your responsibilities.

          If you have any questions or need assistance, feel free to reach out to **${owner}** or contact our **support team**.

          ---  

          **🌟 Welcome aboard!** We look forward to your amazing contributions and teamwork.  

          **Best regards,**  
          The **NinjaNest Team**  

          ---  

          🛠 **Need help?**  
          For any questions or support, feel free to contact us at:  
          **📧 [official.team.undefined@gmail.com](mailto:official.team.undefined@gmail.com)**  
              `,
    };
  }

  try {
    await transporter.sendMail(mailOptions);
    // ! Return a response object with a success message and the generated OTP if applicable
    return {
      message: "Email sent successfully",
      ...(purpose === "register" && { otp }), // ! Include OTP only for registration purpose
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = sendEmail;
