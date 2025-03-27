# Journal Bot 🤖

A WhatsApp bot that helps you maintain your journal entries, thoughts, and ideas through simple text messages.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## Features ✨

- 📝 Save highlights from your day
- 💭 Record thoughts and ideas
- 📱 Easy-to-use WhatsApp interface
- 🔄 Automatic categorization of entries
- 💾 MySQL database storage
- 🔒 Secure environment variable management
- 📊 Detailed logging system

## Prerequisites 🛠️

- Node.js (v18 or higher)
- MySQL/MariaDB
- Twilio account with WhatsApp sandbox
- ngrok (for local development)

## Tech Stack 🚀

- **Backend**: Node.js with Express
- **Language**: TypeScript
- **Database**: MySQL
- **Messaging**: Twilio WhatsApp API
- **Development**: 
  - TypeScript
  - ESLint
  - Jest for testing
  - Winston for logging

## Setup 🚀

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/journal-bot.git
cd journal-bot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
PORT=9000
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=journal_db
```

4. Set up the database:
```bash
npm run db:setup
```

5. Start the development server:
```bash
npm run dev
```

6. Use ngrok to expose your local server:
```bash
ngrok http 9000
```

7. Update your Twilio webhook URL with the ngrok URL

## Usage 📱

Send messages to your WhatsApp bot using the following formats:

- `HIGHLIGHT: Your highlight text` - Save a highlight
- `THOUGHT: Your thought text` - Save a thought
- `IDEA: Your idea text` - Save an idea

## Project Structure 📁

```
journal-bot/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── logger.ts
│   │   └── setup.ts
│   ├── controllers/
│   │   └── messageController.ts
│   ├── models/
│   │   └── entry.ts
│   ├── routes/
│   │   └── webhook.ts
│   ├── services/
│   │   ├── twilioService.ts
│   │   └── journalService.ts
│   ├── types/
│   │   └── index.ts
│   └── server.ts
├── tests/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Development 🛠️

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload
- `npm run build` - Build TypeScript files
- `npm test` - Run tests
- `npm run db:setup` - Set up the database

### Database Setup

The application uses MySQL/MariaDB with the following tables:
- `highlights` - Store daily highlights
- `thoughts` - Store thoughts
- `ideas` - Store ideas

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [Twilio](https://www.twilio.com/) for WhatsApp API
- [Express](https://expressjs.com/) for the web framework
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [MySQL](https://www.mysql.com/) for the database

## Support 💬

If you encounter any issues or have questions, please open an issue in the GitHub repository. 