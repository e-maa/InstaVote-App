<<<<<<< HEAD
# InstaVote
InstaVote is a web application that allows users to create polls and generate QR codes for real-time voting. Participants can scan the QR code to vote within a specified time window. After the voting period ends, the QR code expires, and the results are displayed with a bar graph visualization.
## Features
- Create a poll with a custom question and multiple options
- Add as many contestant options as needed
- Generate a QR code that is active for 5 minutes (configurable)
- Real-time vote simulation (for demonstration)
- Results display with bar charts after voting ends
- Clean and responsive UI built with Tailwind CSS
## Technologies Used
- React
- TypeScript
- Tailwind CSS
- QRCode.react (for QR code generation)
## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/e-maa/InstaVote-App.git
   cd InstaVote-App
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
## Usage
1. Enter your voting question in the input field.
2. Add options using the "Add +" button.
3. Click "Generate QR Code" to create the poll and QR code.
4. The QR code will be active for 5 minutes. During this time, votes are simulated (in this demo) every 2 seconds.
5. After 5 minutes, the QR code expires and the results are displayed.
## Contributing
Contributions are welcome! Please open an issue or submit a pull request.
=======
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
>>>>>>> 046154a (First Commit)
