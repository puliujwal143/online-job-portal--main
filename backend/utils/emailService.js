const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email error:', error);
    throw new Error('Email could not be sent');
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <h2>Welcome to Job Portal!</h2>
    <p>Hi ${user.name},</p>
    <p>Thank you for registering as a ${user.role}.</p>
    ${user.role === 'employer' ? '<p>Your account is pending approval by our admin team.</p>' : ''}
    <p>Best regards,<br>Job Portal Team</p>
  `;

  await sendEmail({
    to: user.email,
    subject: 'Welcome to Job Portal',
    html
  });
};

const sendApplicationConfirmation = async (application, job, applicant) => {
  const html = `
    <h2>Application Received</h2>
    <p>Hi ${applicant.name},</p>
    <p>Your application for <strong>${job.title}</strong> at ${job.company} has been received.</p>
    <p>Application Status: ${application.status}</p>
    <p>We'll notify you of any updates.</p>
    <p>Best regards,<br>Job Portal Team</p>
  `;

  await sendEmail({
    to: applicant.email,
    subject: 'Application Received',
    html
  });
};

const sendApplicationStatusUpdate = async (application, job, applicant) => {
  const html = `
    <h2>Application Status Update</h2>
    <p>Hi ${applicant.name},</p>
    <p>Your application for <strong>${job.title}</strong> has been updated.</p>
    <p>New Status: <strong>${application.status.toUpperCase()}</strong></p>
    ${application.notes ? `<p>Notes: ${application.notes}</p>` : ''}
    <p>Best regards,<br>Job Portal Team</p>
  `;

  await sendEmail({
    to: applicant.email,
    subject: 'Application Status Update',
    html
  });
};

const sendJobApprovalNotification = async (job, employer) => {
  const html = `
    <h2>Job Posted Successfully</h2>
    <p>Hi ${employer.name},</p>
    <p>Your job posting <strong>${job.title}</strong> has been approved and is now live.</p>
    <p>Best regards,<br>Job Portal Team</p>
  `;

  await sendEmail({
    to: employer.email,
    subject: 'Job Posting Approved',
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendApplicationConfirmation,
  sendApplicationStatusUpdate,
  sendJobApprovalNotification
};