const { chromium } = require("playwright")
const fs = require("fs")
const {
	senders,
	recipients,
	subject,
	message,
	file_path,
	batchsize,
	name,
} = require("./data.js")
const data_file_path = "./data.js"

// Clean up data.js file when the process exits
process.on("exit", () => {
	if (fs.existsSync(data_file_path)) {
		fs.unlinkSync(data_file_path)
		console.log("data.js file deleted upon program exit.")
	}
})

function sleep(ms) {
	return new Promise((resolve) => {
		console.log(`Sleeping for ${ms} ms...`) // Debug: Log sleep duration
		setTimeout(() => {
			console.log(`Resuming after ${ms} ms.`) // Debug: Log when sleep ends
			resolve()
		}, ms)
	})
}

async function loginWithSender(sender) {
	if (!sender.active) {
		console.error("Sender is inactive. Aborting login.")
		return null
	}

	let browser
	try {
		browser = await chromium.launch({ headless: false })
		const page = await browser.newPage()
		console.log("Navigating to DocuSign login page...")

		// Open the login page
		await page.goto("https://account.docusign.com/", { timeout: 40000 })

		// Handle login process
		try {
			console.log("Waiting for email input...")
			await page.waitForSelector('input[name="email"]', {
				timeout: 10000,
			})
			console.log("Filling email...")
			await page.fill('input[name="email"]', sender.email)

			console.log("Submitting email...")
			await page.click('button[data-qa="submit-username"]')

			console.log("Waiting for password input...")
			await page.waitForSelector('input[data-qa="password"]', {
				timeout: 10000,
			})
			console.log("Filling password...")
			await page.fill('input[data-qa="password"]', sender.password)

			console.log("Submitting password...")
			await page.click('button[data-qa="submit-password"]')

			console.log("Waiting for dashboard...")
			await page.waitForSelector("div#content", { timeout: 25000 })

			console.log("Login successful!")
			return { page, browser } // Return the page and browser instance
		} catch (loginError) {
			console.error("Error during login process:", loginError)
			await browser.close() // Ensure browser is closed
			return null
		}
	} catch (browserError) {
		console.error(
			"Error initializing browser or opening the page:",
			browserError
		)
		if (browser) {
			await browser.close() // Ensure browser is closed in case of failure
		}
		return null
	}
}

async function sendBatch(page, batch, sender) {
	try {
		console.log("Processing recipients batch:", batch)

		await page.click(
			'button[data-qa="manage-sidebar-actions-ndse-trigger"]'
		)
		for (let i = 0; i < batch.length - 1; i++) {
			await page.click('button[data-qa="recipients-add"]')
		}
		await page.click('button[data-qa="upload-file-button"]')
		const fileInput = page.locator('input[data-qa="upload-file-input"]')
		await fileInput.setInputFiles(file_path)

		const nameInputs = page.locator('input[data-qa="recipient-name"]')
		const emailInputs = page.locator('input[data-qa="recipient-email"]')
		for (let i = 0; i < batch.length; i++) {
			await nameInputs.nth(i).fill(batch[i].name)
			await emailInputs.nth(i).fill(batch[i].email)
		}

		await page.fill('input[data-qa="prepare-subject"]', subject)
		await page.fill('textarea[data-qa="prepare-message"]', message)

		await page.click('button[data-qa="footer-add-fields-link"]')
		await page.click('button[data-qa="footer-send-button"]')
		await page.click('button[data-qa="send-without-fields"]')

		await page.waitForSelector('h1[data-qa="sent-text"]', {
			timeout: 20000,
		})
		console.log("Batch sent successfully!")
		await page.close()
		await page.context().browser().close()
		return true
	} catch (error) {
		console.error("Error while sending batch:", error)
		if (error.name === "TimeoutError") {
			console.log("Timeout occurred. Flagging sender as inactive.")
			sender.active = false
		}
		return false
	}
}
async function changeName(rootpage, context, firstName, lastName) {
	try {
		console.log("Waiting for the 'Invite Your Team' button to appear...")
		// Wait for the "Invite Your Team" button to appear (indicating the page has fully loaded)
		await rootpage.waitForSelector(
			'button[data-qa="banner-open-next-item"]',
			{ state: "visible", timeout: 40000 }
		)
		sleep(1000)

		console.log("Waiting for the dashboard to fully load...")
		await rootpage.waitForSelector("div#content", {
			state: "visible",
			timeout: 40000,
		}) // Ensure div#content is fully loaded

		console.log("Waiting for profile name...")
		// Wait for the profile name element to be visible
		await rootpage.click(
			'span[data-qa="header-profile-menu-button-avatar"]'
		)
		await rootpage.waitForSelector(
			'h3[data-qa="header-profile-user-name"]',
			{ state: "visible", timeout: 40000 }
		)

		console.log("Checking current profile name...")
		const currentName = await rootpage
			.locator('h3[data-qa="header-profile-user-name"]')
			.getAttribute("title")
		const targetName = `${firstName} ${lastName}`

		console.log(`Current name: ${currentName}, Target name: ${targetName}`)

		if (currentName === targetName) {
			console.log(
				`Name is already updated to: ${currentName}. Skipping change.`
			)
			return true // Name is already updated, exit early
		}

		const pagePromise = context.waitForEvent("page")

		console.log("Navigating to profile management page...")
		await rootpage.click(
			'button[data-qa="header-phone-manage-profile-button"]'
		)

		const newPage = await pagePromise

		console.log("Waiting for the profile management page to load...")
		await newPage.waitForLoadState("load")

		console.log("Opening the 'Change Name' modal...")
		await newPage.click('button[data-qa="card-button-name"]')
		await newPage.waitForSelector(
			'div[data-qa="profile-change-name-modal"]',
			{ timeout: 30000 }
		)

		console.log("Filling out 'First Name'...")
		await newPage.fill(
			'input[data-qa="profile-change-name-modal-first-name"]',
			firstName
		)

		console.log("Filling out 'Last Name'...")
		await newPage.fill(
			'input[data-qa="profile-change-name-modal-last-name"]',
			lastName
		)

		console.log("Clicking 'SAVE' button...")
		await newPage.click('button:has-text("SAVE")')

		console.log("Waiting for the success message...")
		await newPage.waitForSelector(
			'div[data-qa="message-success-name-save-wrap"]',
			{ timeout: 15000 }
		)

		console.log("Success message detected. No need to verify name update.")

		// Close the new page after detecting the success message
		console.log(
			"Closing the new page and returning to the original workflow..."
		)
		await newPage.close()
		return true
	} catch (error) {
		console.error("Error in changeName function:", error)

		if (error.name === "TimeoutError") {
			console.error(
				"TimeoutError: The modal, success message, or elements did not load in time."
			)
		} else {
			console.error("Unexpected error:", error)
		}
		return false
	}
}

async function main() {
	let senderIndex = 0
	const batches = []
	for (let i = 0; i < recipients.length; i += batchsize) {
		batches.push(recipients.slice(i, i + batchsize))
	}

	for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
		let batchSent = false
		const batch = batches[batchIndex]

		console.log(`Processing batch ${batchIndex + 1}:`, batch)
		while (!batchSent && senderIndex < senders.length) {
			const sender = senders[senderIndex]
			if (!sender.active) {
				senderIndex++
				continue
			}

			console.log(`Trying login with ${sender.email}...`)
			const loginResult = await loginWithSender(sender)

			if (!loginResult) {
				console.log("Login failed, trying next sender...")
				senderIndex++
				continue
			}

			const { page, browser } = loginResult

			await changeName(
				page,
				page.context(),
				name.firstName,
				name.lastName
			)

			batchSent = await sendBatch(page, batch, sender)

			if (!batchSent) {
				console.log("Failed to send batch. Trying with next sender...")
				sender.active = false
				await browser.close()
			}
		}

		if (!batchSent) {
			console.error(`Failed to send batch ${batchIndex + 1}.`)
			break // Stop processing further batches if one fails completely
		} else {
			console.log(`Batch ${batchIndex + 1} sent successfully.`)
		}
	}

	console.log("Batch processing completed.")
}

main().catch(console.error)
