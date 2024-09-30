import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipients = [
    {
      email,
    },
  ];

  try {
    mailtrapClient
      .send({
        from: sender,
        to: recipients,
        subject: "Verify your email",
        html: VERIFICATION_EMAIL_TEMPLATE.replace(
          "{verificationCode}",
          verificationToken
        ),
        category: "Email Verification",
      })
      .then(console.log, console.error);
  } catch (error) {
    console.log(`Error sending email verification : ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipients = [
    {
      email,
    },
  ];

  try {
    mailtrapClient
      .send({
        from: sender,
        to: recipients,
        template_uuid: "00fd60ee-10bf-43f2-ab88-56dc5b237770",
        template_variables: {
          company_info_name: "Do Rock Limited A.S",
          name,
        },
      })
      .then(console.log, console.error);
  } catch (error) {
    console.log(`Error sending email verification : ${error.message}`);
  }
};

export const sendResetPasswordEmail = async (email, resetTokenUrl) => {
  const recipients = [
    {
      email,
    },
  ];

  try {
    mailtrapClient
      .send({
        from: sender,
        to: recipients,
        subject: "Reset Password",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace(
          "{resetURL}",
          resetTokenUrl
        ),
        category: "Reset Password",
      })
      .then(console.log, console.error);
  } catch (error) {
    console.log(`Error sending email verification : ${error.message}`);
  }
};

export const sendChangedPasswordEmail = async (email) => {
  const recipients = [
    {
      email,
    },
  ];

  try {
    mailtrapClient
      .send({
        from: sender,
        to: recipients,
        subject: "Changed Password",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
        category: "Changed Password",
      })
      .then(console.log, console.error);
  } catch (error) {
    console.log(`Error sending success password email : ${error.message}`);
  }
};
