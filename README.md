# map-routing

Interactive route visualization with pan/zoom and video synchronization for React.

## Installation & Setup

After cloning the repository, install dependencies for both the root and the package:

```bash
npm run install:all
```

Or manually:

```bash
npm install
cd package && npm install
```

## Building the Package

Build the library:

```bash
npm run build
```

## Running Locally

Start the development server (builds the package and opens the docs):

```bash
npm run dev
```

Or just run the server without rebuilding:

```bash
npm start
```

This will open your browser to:
- Documentation: `http://localhost:8080/docs-site/`
- Route Creator: `http://localhost:8080/routeCreator/`

### Quick Start (No Installation)

If you just want to view the docs without setup:

```bash
npx http-server -o /docs-site/
```

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Vercel will automatically detect the `vercel.json` configuration
4. Click "Deploy"

The site will be available at your Vercel domain, with the docs as the homepage.

### Manual Deployment

For other platforms (Netlify, GitHub Pages, etc.):

1. Build the package: `npm run build`
2. Deploy the entire root directory
3. Set the root/index to redirect to `/docs-site/`
