import nodemailer from 'nodemailer'

const sendEmail = async (options) => {
  let transporter

  const host = process.env.EMAIL_HOST || process.env.MAIL_HOST
  const port = process.env.EMAIL_PORT || process.env.MAIL_PORT
  const user = process.env.EMAIL_USER || process.env.MAIL_USER
  const pass = process.env.EMAIL_PASS || process.env.MAIL_PASS

  if (host && port && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    })
  } else {
    // Graceful test transport fallback
    try {
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
    } catch (e) {
      console.log('Email preview: [Dev simulated] to:', options.email, 'Subject:', options.subject)
      return { messageId: 'simulated-dev-id' }
    }
  }

  const message = {
    from: `${process.env.FROM_NAME || 'TailorWala'} <${process.env.FROM_EMAIL || 'support@tailorwala.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  }

  try {
    const info = await transporter.sendMail(message)
    if (!host) {
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info))
    }
    return info
  } catch (err) {
    console.warn('sendEmail error (non-fatal):', err.message)
    return null
  }
}

export default sendEmail
