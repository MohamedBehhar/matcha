import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Or any other email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL_USER,
  to: user.email,
  subject: 'Verify your account',
  html: `<p>Click <a href="http://localhost:3000/verify?token=${verificationToken}">here</a> to verify your account.</p>`,
};

await transporter.sendMail(mailOptions);
