# GitHub Pages Deployment Guide

This guide will help you deploy your Tailwind CSS v3 to v4 Converter to GitHub Pages.

## Prerequisites

- A GitHub account
- Your code pushed to a GitHub repository
- The repository should be public (or you have GitHub Pro for private repos)

## Setup Instructions

### 1. Repository Configuration

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**

### 2. Automatic Deployment

The repository is already configured with GitHub Actions for automatic deployment:

- **Workflow file**: `.github/workflows/deploy.yml`
- **Trigger**: Pushes to the `main` branch
- **Build**: Runs `npm ci && npm run build`
- **Deploy**: Deploys the `dist` folder to GitHub Pages

### 3. Manual Deployment (if needed)

You can also trigger deployment manually:

1. Go to the **Actions** tab in your repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow" button
4. Select the branch (usually `main`) and click "Run workflow"

### 4. Access Your Deployed Site

After successful deployment, your site will be available at:

```
https://d0076.github.io/tailwindv3tov4converter/
```

## Configuration Details

### Vite Configuration

The `vite.config.ts` is configured with:

```typescript
base: "/tailwindv3tov4converter/";
```

This ensures all assets are loaded correctly on GitHub Pages.

### Build Process

The GitHub Actions workflow:

1. Installs Node.js 20
2. Installs dependencies with `npm ci`
3. Builds the project with `npm run build`
4. Deploys the `dist` folder to GitHub Pages

## Troubleshooting

### Common Issues

1. **404 errors for assets**: Ensure the `base` path in `vite.config.ts` matches your repository name
2. **Workflow failures**: Check the Actions tab for detailed error logs
3. **Changes not reflecting**: GitHub Pages can take a few minutes to update

### Force Refresh Cache

If changes aren't showing:

1. Hard refresh the browser (Ctrl+F5 or Cmd+Shift+R)
2. Check if the workflow completed successfully in the Actions tab
3. Wait a few minutes for GitHub's CDN to update

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public` directory with your domain
2. Configure DNS settings with your domain provider
3. Update the repository settings under Pages → Custom domain

## Development vs Production

- **Development**: `npm run dev` (runs on http://localhost:5173)
- **Production**: Deployed to GitHub Pages with optimized build
- **Preview**: `npm run preview` (preview production build locally)
