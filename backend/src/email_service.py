from flask_mail import Mail, Message


class MailService:
    def __init__(self, app):
        self.mail = Mail(app)
        self.sender = app.config["MAIL_USERNAME"]

    def send_mail(self, subject, recipient, body):
        msg = Message(subject, recipients=[recipient], body=body)
        self.mail.send(msg)

    def send_activation_email(self, user_email, activation_code):
        msg = Message(
            "Fastotate: Activate Your Account",
            sender=self.sender,
            recipients=[user_email],
        )
        msg.body = (
            f"Your activation code is: {activation_code}. Please activate your account."
        )
        self.mail.send(msg)

    def send_reset_password_email(self, user_email, reset_code):
        msg = Message(
            "Fastotate: Reset Your Password",
            sender=self.sender,
            recipients=[user_email],
        )
        msg.body = (
            f"Your reset password code is: {reset_code}. Please reset your password."
        )
        self.mail.send(msg)
