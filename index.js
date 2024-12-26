const { chromium } = require("playwright");
const fs = require('fs')
const {
	senders,
	recipients,
	subject,
	message,
	file_path,
	batchsize,
} = require("./data.js");

// anytime the process exits it'll delete data.js file
process.on('exit', () => {
  if (fs.existsSync(file_path)) {
    fs.unlinkSync(file_path);
    console.log('data.js file deleted upon program exit.');
  }
});



async function loginWithSender(sender) {
	if (sender.active) {
		const browser = await chromium.launch({ headless: false });
		const page = await browser.newPage();
		await page.goto("https://account.docusign.com/", { timeout: 60000 });

		try {
			await page.waitForSelector('input[name="email"]', { timeout: 10000 });
			await page.fill('input[name="email"]', sender.email);
			await page.click('button[data-qa="submit-username"]');
			await page.waitForSelector('input[data-qa="password"]', { timeout: 10000 });
			await page.fill('input[data-qa="password"]', sender.password);
			await page.click('button[data-qa="submit-password"]');
			try {
				await page.waitForNavigation({
					waitUntil: "domcontentloaded",
					timeout: 5000,
				});
				await page.waitForSelector("div#content", { timeout: 10000 });
				console.log("Login successful!");
				return { page, browser };
			} catch {
				console.error("Login failed or took too long.");
				sender.active = false;
				await browser.close();
				return null;
			}
		} catch (error) {
			console.error("Error during login process:", error);
			await browser.close();
			return null;
		}
	}
}

async function sendBatch(page, recipientsBatch) {
	try {
		await page.click('button[data-qa="manage-sidebar-actions-ndse-trigger"]');
		await page.click('button[data-qa="upload-file-button"]');

		// Add recipient fields for batch size
		for (let i = 0; i < recipientsBatch.length - 1; i++) {
			await page.click('button[data-qa="recipients-add"]');
		}

		// Upload the file
		const fileInput = page.locator('input[type="file"]');
		await fileInput.setInputFiles(file_path);

		// Fill out recipient information
		const nameInputs = page.locator('input[data-qa="recipient-name"]');
		const emailInputs = page.locator('input[data-qa="recipient-email"]');
		for (let i = 0; i < recipientsBatch.length; i++) {
			await nameInputs.nth(i).fill(recipientsBatch[i].name);
			await emailInputs.nth(i).fill(recipientsBatch[i].email);
		}

		// Fill in the subject and message
		await page.fill('input[data-qa="prepare-subject"]', subject);
		await page.fill('textarea[data-qa="prepare-message"]', message);

		// Submit the form
		await page.click('button[data-qa="footer-add-fields-link"]');
		await page.click('button[data-qa="footer-send-button"]');
		await page.click('button[data-qa="send-without-fields"]');

		console.log("Batch sent successfully.");
	} catch (error) {
		console.error("Error while sending batch:", error);
	}
}

async function main() {
	let senderIndex = 0;

	// Divide recipients into batches
	const batches = [];
	for (let i = 0; i < recipients.length; i += batchsize) {
		batches.push(recipients.slice(i, i + batchsize));
	}

	// Process each batch
	for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
		const batch = batches[batchIndex];
		console.log(`Processing batch ${batchIndex + 1}:`, batch);

		// Login with sender
		let loginResult = null;
		while (!loginResult && senderIndex < senders.length) {
			const sender = senders[senderIndex];
			console.log(`Trying login with ${sender.email}...`);
			loginResult = await loginWithSender(sender);

			if (!loginResult) {
				console.log("Login failed, trying next sender...");
				senderIndex++;
			}
		}

		if (!loginResult) {
			console.error("All login attempts failed for batch, moving to the next batch.");
			continue; // Skip the current batch and proceed with the next one
		}

		const { page, browser } = loginResult;

		// Send the current batch
		await sendBatch(page, batch);

		// Close the browser
		await browser.close();
		console.log("Browser closed after batch.");
	}

	console.log("All batches processed successfully.");
}

// Execute the main function
main().catch(console.error);
