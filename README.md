# Mediscribe AI - Google Login Project

This project is a React application built with Vite, TypeScript, and Tailwind CSS (presumed). It integrates Google Login functionality.

## Project Structure

- `src/` - Source code
- `public/` - Static assets
- `.github/workflows/` - CI/CD configurations

## Getting Started

### Prerequisites

- Node.js (v20 recommended)
- npm

### Installation

Install the project dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

Build the application for production:

```bash
npm run build
```

This commands compiles your application into the `dist` folder.

## Deployment

### GitHub Pages

This project is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` branch.

To enable this:
1. Go to your repository **Settings**.
2. Navigate to **Pages**.
3. Under **Build and deployment**, select **GitHub Actions** as the source.

The deployment workflow is defined in `.github/workflows/deploy.yml`.
