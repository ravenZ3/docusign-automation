const fs = require("fs")
const path = './data.js';
fs.writeFileSync(path, '', 'utf8');

// Input and output file paths
const inputFileForMails = "./data/emails_and_passwords.txt"
const inputFileForRecepients = "./data/recipients.txt"
const inputFileForSubject = "./data/subject.txt"
const inputFileForMessage = "./data/message.txt"
const outputFile = "data.js"

// Function to append data to the output file
const appendToFile = (data, callback) => {
	fs.appendFile(outputFile, data, (err) => {
		if (err) {
			console.error("Error writing to the output file:", err)
		} else {
			console.log("Data successfully appended to", outputFile)
		}
		if (callback) callback()
	})
}

// Step 1: Read the subject and append it
fs.readFile(inputFileForSubject, "utf8", (err, subjectData) => {
	if (err) {
		console.error("Error reading the subject file:", err)
		return
	}

	let subjectString = `const file_path = "./file.pdf"\nconst batchsize = 5\nconst subject = "${subjectData.trim()}";`
	appendToFile(subjectString, () => {
		// Step 2: Read the message and append it after subject
		fs.readFile(inputFileForMessage, "utf8", (err, messageData) => {
			if (err) {
				console.error("Error reading the message file:", err)
				return
			}

			let messageString = `\nconst message = "${messageData.trim()}";`
			appendToFile(messageString, () => {
				// Step 3: Read the emails and append them
				fs.readFile(inputFileForMails, "utf8", (err, data) => {
					if (err) {
						console.error("Error reading the input file:", err)
						return
					}

					const lines = data
						.split("\n")
						.filter((line) => line.trim() !== "")
					const jsonData = lines.map((line) => {
						const [email, password] = line.split(",")
						return {
							email: email.trim(),
							password: password.trim(),
							active: true,
						}
					})

					let jsonString = `\nconst senders = ${JSON.stringify(
						jsonData,
						null,
						4
					)};`
					appendToFile(jsonString, () => {
						// Step 4: Read the recipients and append them
						fs.readFile(
							inputFileForRecepients,
							"utf8",
							(err, data) => {
								if (err) {
									console.error(
										"Error reading the input file:",
										err
									)
									return
								}

								const lines = data
									.split("\n")
									.filter((line) => line.trim() !== "")
								const recipients = lines.map((line) => {
									const [name, email] = line.split(",")
									return {
										name: name.trim(),
										email: email.trim(),
									}
								})

								let recipientsString = `\nconst recipients = ${JSON.stringify(
									recipients,
									null,
									4
								)};`
								appendToFile(recipientsString, () => {
									// Final step: Write the module.exports line
									let moduleExportsString = `\nmodule.exports = { senders, recipients, subject, message, file_path, batchsize};`
									appendToFile(moduleExportsString, () => {
										console.log(
											"Final data successfully appended to",
											outputFile
										)
									})
								})
							}
						)
					})
				})
			})
		})
	})
})
