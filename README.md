# Jose Camilo Joga Guerrero - Professional Portfolio

This repository contains the source code for my professional portfolio website, showcasing my experience as a DevOps & Cloud Engineer.

## Features

- **Responsive Design**: Looks great on all devices
- **Dark/Light Theme**: Toggle between themes or use system preference
- **Bilingual Support**: Available in both English and Spanish
- **Print-Ready CV**: Generate a professionally formatted PDF resume
- **Interactive Elements**: Smooth transitions and engaging UI

## Tech Stack

- **React**: UI components and state management
- **Vite**: Fast build tooling
- **Tailwind CSS**: Utility-first styling
- **i18next**: Internationalization
- **React Icons**: SVG icons for technologies and interfaces

## Project Structure

```
cjoga-portfolio/
├── public/
│   ├── favicon.ico
│   ├── locales/
│   │   ├── en/
│   │   │   └── translation.json
│   │   └── es/
│   │       └── translation.json
│   └── robots.txt
├── src/
│   ├── components/
│   ├── hooks/
│   ├── styles/
│   ├── utils/
│   ├── App.jsx
│   ├── main.jsx
│   └── data.js
├── ...configuration files
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/cjoga/portfolio.git
cd portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```

This generates a `dist` directory with production-ready files.

## Deployment

The site is deployed to [cjoga.cloud](https://cjoga.cloud) using [your preferred hosting].

## Customization

- Edit content in `src/data.js` and translation files
- Modify themes in `tailwind.config.js`
- Add your professional photo to replace the placeholder

## Contact

- LinkedIn: [www.linkedin.com/in/cjoga](https://www.linkedin.com/in/cjoga)
- Email: [josejoga.opx@gmail.com](mailto:josejoga.opx@gmail.com)
- GitHub: [github.com/username](https://github.com/username)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
