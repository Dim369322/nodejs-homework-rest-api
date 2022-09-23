const sgMail = require("@sendgrid/mail");
require("dotenv").config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async (email, token) => {
  try {
    const msg = {
      to: `${email}`,
      from: "garnazhenkobb@gmail.com",
      subject: "Verification",
      text: `Follow the link to verify your email http://localhost:3000/users/verify/${token}`,
      html: `<strong>Follow the link to verify your email http://localhost:3000/users/verify/${token}</strong>`,
    };
    await sgMail.send(msg);
  } catch (error) {
    throw new Error();
  }
};

module.exports = {
  sendMail,
};
