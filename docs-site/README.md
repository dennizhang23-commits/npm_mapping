# map-routing Documentation Site

This is a static documentation website for the map-routing package.

## Structure

```
docs-site/
├── index.html      - Getting Started page
├── api.html        - API Reference page
├── features.html   - Features & Customizations page
├── styles.css      - Shared styles
└── README.md       - This file
```

## Local Development

Since this is a static site with no build step, you can simply open the HTML files in a browser or use a local server:

### Option 1: Direct File Opening
Just double-click `index.html` to open it in your browser.

### Option 2: Local Server (Recommended)
Using Python:
```bash
cd docs-site
python -m http.server 8000
```

Using Node.js (npx):
```bash
cd docs-site
npx serve
```

Using VS Code Live Server extension:
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

Then navigate to `http://localhost:8000` (or whichever port your server uses).

## Deployment Options

### GitHub Pages

1. **Create a GitHub repository** for your package if you haven't already

2. **Push the docs-site folder**:
   ```bash
   git add docs-site
   git commit -m "Add documentation site"
   git push origin main
   ```

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main`, folder: `/docs-site`
   - Click Save

4. **Access your site** at: `https://[username].github.io/[repository-name]/`

### Netlify

1. **Sign up** at [netlify.com](https://www.netlify.com)

2. **Deploy via Drag & Drop**:
   - Go to https://app.netlify.com/drop
   - Drag the entire `docs-site` folder onto the page
   - Done! Netlify will give you a URL

3. **Or deploy via Git**:
   - Connect your GitHub repository
   - Build command: (leave empty)
   - Publish directory: `docs-site`
   - Click Deploy

### Vercel

1. **Sign up** at [vercel.com](https://vercel.com)

2. **Deploy via Git**:
   - Import your GitHub repository
   - Framework Preset: Other
   - Root Directory: `docs-site`
   - No build settings needed
   - Deploy

3. **Or use Vercel CLI**:
   ```bash
   cd docs-site
   npx vercel
   ```

### Cloudflare Pages

1. **Sign up** at [pages.cloudflare.com](https://pages.cloudflare.com)

2. **Connect Git repository**:
   - Build command: (leave empty)
   - Build output directory: `/docs-site`
   - Deploy

### Custom Server

Since this is just static HTML/CSS/JS, you can deploy to any web server:

1. **Upload files** via FTP/SFTP to your server's public directory
2. **Configure web server** to serve the `docs-site` directory
3. Done!

## Customization

### Updating Content
Edit the HTML files directly. The structure is simple and self-explanatory.

### Changing Styles
Edit `styles.css` to customize colors, fonts, spacing, etc.

Key CSS variables are defined at the top of `styles.css`:
```css
:root {
  --primary-color: #0066cc;
  --primary-dark: #0052a3;
  --bg-color: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-color: #1a1a1a;
  --text-secondary: #666666;
  --nav-bg: #2c3e50;
  /* ... */
}
```

### Adding Pages
1. Create a new HTML file
2. Copy the navigation structure from existing pages
3. Add a link to the new page in all navigation bars

## Features

- ✅ Pure HTML/CSS (no build tools required)
- ✅ Responsive design (mobile-friendly)
- ✅ Syntax highlighting via Prism.js (loaded from CDN)
- ✅ Clean, modern design
- ✅ Fast loading (minimal dependencies)
- ✅ Easy to maintain and update

## Browser Support

The site uses modern CSS features and should work in:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This documentation site follows the same license as the map-routing package (MIT).

## Maintenance

To update documentation:
1. Edit the relevant HTML file(s)
2. Test locally
3. Commit and push changes
4. Your hosting provider will automatically redeploy (if using Git-based deployment)

For issues or suggestions, please open an issue in the main package repository.
