#Email Autoresponder#
Email Autoresponder is a Node.js application that automatically checks for new emails in a Gmail account, sends replies to emails that have no prior replies, adds labels to the emails, and repeats this process at random intervals. It utilizes the Gmail API for email retrieval, sending replies, and modifying labels.

Features
Automatically checks for new emails in a Gmail account
Sends replies to emails that have no prior replies
Adds a label to the replied emails
Randomizes the intervals between each check and reply process
Installation
Clone the repository:

bash
Copy code
git clone https://github.com/your-username/gmail-autoresponder.git
Install the dependencies:

bash
Copy code
cd gmail-autoresponder
npm install
Set up Gmail API credentials:

Go to the Google Developers Console.
Create a new project and enable the Gmail API.
Create OAuth 2.0 credentials and download the JSON file.
Rename the downloaded JSON file to credentials.json and place it in the project root directory.
Start the application:

bash
Copy code
npm start
The application will prompt you to authorize access to your Gmail account through a web browser.

Usage
Once the application is running and authorized, it will automatically check for new emails and send replies if the email threads meet the criteria. The application will continue running until you stop it manually.

Make sure to test the application with a separate Gmail account or by sending emails to yourself to avoid unintended auto-replies.

Configuration
The application uses the following configuration options:

port: The port on which the application server runs. Default is 3000.
labelName: The name of the label to be added to the replied emails. Default is vacation-reply.
replyText: The content of the auto-reply email. Modify this to customize the reply message.
You can modify these options in the config.js file.

License
This project is licensed under the MIT License.

Contributing
Contributions are welcome! If you find any issues or have suggestions for improvement, please open an issue or submit a pull request.

Acknowledgments
This project is built using the following libraries and technologies:

Google APIs: Provides access to the Gmail API for email retrieval, sending replies, and modifying labels.
nodemailer: Used for sending email replies using SMTP transport.
express: Used to create a simple web server for handling the OAuth2 callback and starting the authentication process.
Node.js: The JavaScript runtime environment used for running the application.
Disclaimer
Please use this application responsibly and in compliance with Gmail's terms of service. Be cautious when automating email responses to avoid unintended consequences.
