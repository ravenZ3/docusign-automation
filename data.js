const file_path = "./test_pdf.pdf"
const batchsize = 5
const subject = "The quick brown fox jumped into the pit.";
const message = "Never trust the age-old aphorisms, for they may be made up.";
const senders = [
    {
        "email": "billingteam92112+king@gmail.com",
        "password": "PassWord@912$",
        "active": true
    },
    {
        "email": "billingteam92112+team@gmail.com",
        "password": "PassWord@912$",
        "active": true
    },
    {
        "email": "billingteam92112+daah@gmail.com",
        "password": "PassWord@912$",
        "active": true
    },
    {
        "email": "billingteam92112+bill2@gmail.com",
        "password": "PassWord@912$",
        "active": true
    },
    {
        "email": "billingteam92112+ghn@gmail.com",
        "password": "PassWord@912$",
        "active": true
    },
    {
        "email": "billingteam92112+wsa@gmail.com",
        "password": "PassWord@912$",
        "active": true
    },
    {
        "email": "billingteam92112+bien@gmail.com",
        "password": "PassWord@912$",
        "active": true
    },
    {
        "email": "billingteam92112+nbhbb@gmail.com",
        "password": "PassWord@912$",
        "active": true
    },
    {
        "email": "billingteam92112+912@gmail.com",
        "password": "PassWord@912$",
        "active": true
    },
    {
        "email": "billingteam92112+chh@gmail.com",
        "password": "PassWord@912$",
        "active": true
    },
    {
        "email": "billingteam92112+04@gmail.com",
        "password": "PasWord@912",
        "active": true
    },
    {
        "email": "billingteam92112+44@gmail.com",
        "password": "PasWord@912",
        "active": true
    },
    {
        "email": "billingteam92112+99@gmail.com",
        "password": "PasWord@912",
        "active": true
    }
];
const recipients = [
    {
        "name": "John Doe",
        "email": "ramjanestfern+1@gmail.com"
    },
    {
        "name": "Jane Smith",
        "email": "ramjanestfern+2@gmail.com"
    },
    {
        "name": "Alice Johnson",
        "email": "ramjanestfern+3@gmail.com"
    },
    {
        "name": "William",
        "email": "ramjanestfern+4@gmail.com"
    },
    {
        "name": "Tessa",
        "email": "ramjanestfern+5@gmail.com"
    }
];
module.exports = { senders, recipients, subject, message, file_path, batchsize};