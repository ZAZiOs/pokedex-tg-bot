# Pokédex Telegram Bot

Welcome to the Pokédex Telegram Bot! This bot allows you to get information about any Pokémon directly from Telegram.

## Features

- Search for Pokémon by name or ID
- Get detailed information including type, abilities, and stats
- View images of Pokémon
- Easy to use

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/pokedexbot.git
    ```
2. Navigate to the project directory:
    ```sh
    cd pokedexbot
    ```
3. Install the dependencies:
    ```sh
    npm install
    ```

### Configuration

1. Create a `.env` file in the root directory and add your Telegram bot token:
    ```env
    TELEGRAM_TOKEN=your-telegram-bot-token
    ```

### Usage

1. Start the bot:
    ```sh
    npm start
    ```
2. Open your telegram bot.
3. Use the following commands to interact with the bot:
    - `/start` - Get start info
    - `@pkedexbot pokemon-name` - Get pokédex entry

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgements

- [PokéAPI](https://pokeapi.co/) for providing the Pokémon data
- [Telegraf](https://telegraf.js.org/) for the Telegram bot framework
