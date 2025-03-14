import Membership from "../models/Membership.js";
import User from "../models/User.js";

export const generateInvoice = async (payment) => {
    // Fetch additional user details if necessary
    const user = await User.findById(payment.user_id); // assuming user_id is available in the payment
    const membership = await Membership.findById(payment.membership_id);

    // Construct the invoice in HTML format with styling
    const invoiceContent = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    color: #333;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #fff;
                    padding: 20px;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    background-color: #4CAF50;
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                }
                .header h2 {
                    margin: 0;
                }
                .company-name {
                    font-size: 1.2em;
                    font-weight: bold;
                    color: #0945b0;
                }
                .invoice-details {
                    margin-top: 20px;
                }
                .invoice-details p {
                    font-size: 1em;
                    margin: 5px 0;
                }
                .invoice-details strong {
                    color: #333;
                }
                .footer {
                    margin-top: 30px;
                    text-align: center;
                    font-size: 0.9em;
                    color: #888;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>Invoice from <span class="company-name">The Fit & Thrive Fitness Center</span></h2>
                </div>
                <div class="invoice-details">
                    <p><strong>User Name:</strong> ${user.first_name} ${user.last_name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Membership:</strong> ${capitalizeWords(membership.membership_name)}</p>
                    <p><strong>Payment Amount:</strong> $${payment.amount}</p>
                    <p><strong>Payment Method:</strong> ${payment.payment_method}</p>
                    <p><strong>Transaction ID:</strong> ${payment.transaction_id}</p>
                    <p><strong>Status:</strong> ${payment.payment_status}</p>
                    <p><strong>Payment Date:</strong> ${payment.created_at}</p>
                </div>
                <div class="footer">
                    <p>Thank you for being a part of our fitness family!</p>
                    <p>For any questions, contact us at <strong>support@fitandthrive.com</strong></p>
                </div>
            </div>
        </body>
        </html>
    `;

    return invoiceContent;
};

const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, (char) => char.toUpperCase())
}