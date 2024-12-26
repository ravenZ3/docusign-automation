# Automated Batch Email Sender Using Playwright

This project automates the process of logging into a DocuSign account and sending email batches with attachments to multiple recipients. The script uses Node.js, the Playwright library, and a set of input files for configuration.

---

## Features

- Reads input data for emails, passwords, recipients, subject, and message from text files.
- Automates the login process for multiple senders.
- Sends email batches to recipients using a specified batch size.
- Deletes temporary `data.js` files upon process exit for cleanup.

---

## Requirements

- Node.js (v14 or later)
- Playwright

---


# Email Automation Script

## Installation Instructions

1. **Clone the Repository**  
   ```bash
   git clone https://github.com/https://github.com/ravenZ3/docusign-automation.git
   cd docusign-automation
   ```

2. **Install Dependencies**  
   ```bash
   npm install
   ```

3. **Install Playwright Browsers**  
   ```bash
   npx playwright install
   ```

4. **Prepare Input Files**  
   Create a directory called `data` in the project root and include the following files:
   - `emails_and_passwords.txt`  
     Each line should be in the format:  
     ```
     email,password
     ```
   - `recipients.txt`  
     Each line should be in the format:  
     ```
     name,email
     ```
   - `subject.txt`  
     Include the email subject as plain text.
   - `message.txt`  
     Include the email message as plain text.

5. **Set Up File Attachments**  
   Place the file to be sent (e.g., `file.pdf`) in the root directory or update the `file_path` variable in the script to point to its location.

6. **Adjust Batch Size**  
   Modify the `batchsize` variable in the script to specify the number of recipients per batch (default is 5).

7. **Run the Script**  
   Execute the script:
   ```bash
   node index.js
   ```

## Example Directory Structure
```
project-folder/
├── data/
│   ├── emails_and_passwords.txt
│   ├── recipients.txt
│   ├── subject.txt
│   └── message.txt
├── file.pdf
├── index.js
├── package.json
└── package-lock.json
```

With these steps, your script will be set up and ready to execute!
