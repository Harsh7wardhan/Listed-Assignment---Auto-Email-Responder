// Import required modules
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const express = require('express');

// Load Gmail API credentials from the file
const credentials = require('./credentials.json');

// Define Gmail API scope
const SCOPES = ['https://www.googleapis.com/auth/gmail.modify'];

// Create an Express application
const app = express();

// Define the server port
const port = 3000;

// Define a route for handling OAuth callback
app.get('/oauth2callback', (req, res) => {
    const code = req.query.code;
    const oAuth2Client = getOAuth2Client();
    getNewToken(oAuth2Client, code);
    res.send('Authentication successful! You can close this tab now.');
});

// Start the server and authenticate with Gmail API
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    authenticate();
});

// Function to obtain an OAuth2 client
function getOAuth2Client() {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    return oAuth2Client;
}

// Function to authenticate with Gmail API
// Function to authenticate with Gmail API
function authenticate() {
    const oAuth2Client = getOAuth2Client();

    // Check if we have a previously stored token
    fs.readFile('token.json', (err, token) => {
        if (err) {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
            });
            console.log('Authorize this app by visiting this URL:', authUrl);
            console.log('Enter the code from that page here:');
        } else {
            oAuth2Client.setCredentials(JSON.parse(token));
            createLabel(oAuth2Client); // Call the createLabel function here
            startListening(oAuth2Client);
        }
    });
}


// Function to obtain a new access token
function getNewToken(oAuth2Client, code) {
    oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);

        // Store the token for future use
        fs.writeFile('token.json', JSON.stringify(token), (err) => {
            if (err) console.error('Error storing access token', err);
            console.log('Token stored successfully.');
        });

        createLabel(oAuth2Client); // Call the createLabel function here
        startListening(oAuth2Client);
    });
}

// Function to create a label
// Function to create a label
async function createLabel(auth) {
    try {
        const gmail = google.gmail({ version: 'v1', auth });

        const label = {
            name: 'vacation-reply3',
            labelListVisibility: 'labelShow',
            messageListVisibility: 'show',
            color: {
                backgroundColor: '#ffffff',
                textColor: '#ffffff',
            },
        };

        const res = await gmail.users.labels.create({ userId: 'me', resource: label });
        console.log('Label created:', res.data);
    } catch (error) {
        if (error.response && error.response.status === 409) {
            console.log('Label already exists.');
        } else {
            console.error('Error creating label:', error);
        }
    }
}


// Function to check if an email thread has prior replies
function hasPriorReplies(headers) {
    const inReplyToHeader = headers.find(header => header.name === 'In-Reply-To');
    return !!inReplyToHeader;
}

// Function to start listening for new emails
let isListening = false; // Lock variable
const repliedThreads = new Set(); // Set to store replied thread IDs

async function startListening(auth) {
    if (isListening) {
        // Already running, skip this iteration
        return;
    }

    isListening = true;

    const gmail = google.gmail({ version: 'v1', auth });

    try {
        // Check for new emails
        const res = await gmail.users.messages.list({ userId: 'me', q: 'is:unread' });
        const messages = res.data.messages;

        if (messages && messages.length) {
            for (const message of messages) {
                const fullMessage = await gmail.users.messages.get({ userId: 'me', id: message.id });

                // Check if the email has no prior replies and hasn't been replied to before
                if (fullMessage.data.threadId && !hasPriorReplies(fullMessage.data.payload.headers) && !repliedThreads.has(fullMessage.data.threadId)) {
                    // Send reply
                    const threadId = fullMessage.data.threadId;
                    const replyText = 'Thank you for your email. I am currently on vacation and will respond to you when I return.';
                    await sendReply(auth, threadId, replyText);

                    // Add label to the email
                    await gmail.users.messages.modify({ userId: 'me', id: message.id, addLabelIds: ['vacation-reply'] });

                    // Add the replied thread ID to the set
                    repliedThreads.add(threadId);
                }
            }
        }
    } catch (error) {
        console.error('Error retrieving or sending emails:', error);
    }

    isListening = false;
}


// Function to send a reply email
async function sendReply(auth, threadId, text) {
    try {
        const gmail = google.gmail({ version: 'v1', auth });

        const messageParts = [
            'From: "Your Name" <harsh07natu@gmail.com>',
            `To: <mcgregordwayne2000@gmail.com>`,
            'Content-Type: text/plain; charset=utf-8',
            'MIME-Version: 1.0',
            'Subject: Vacation Auto Reply',
            '',
            text,
        ];

        const encodedMessage = Buffer.from(messageParts.join('\n')).toString('base64');
        const res = await gmail.users.messages.send({ userId: 'me', resource: { raw: encodedMessage, threadId } });
        console.log('Reply sent:', res.status);
    } catch (error) {
        console.error('Error sending reply:', error);
    }
}

// Function to get a random interval between 45 and 120 seconds
function getRandomInterval() {
    return Math.floor(Math.random() * (120000 - 45000 + 1)) + 45000;
}
