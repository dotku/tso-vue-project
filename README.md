# tso-vue-project

A Vue 3 + Vite frontend with Python API backend, deployed on Vercel.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Prerequisites

- Node.js (v16 or higher)
- Python 3.x
- Vercel CLI (`npm i -g vercel`)

## Project Setup

```sh
npm install
```

### Development

For local development with both frontend and backend:

```sh
# Option 1: Use Vercel dev (recommended - runs both frontend and API)
npm run vercel:dev

# Option 2: Frontend only (for UI development)
npm run dev
```

The Vercel dev server will:

- Serve your Vue app on `http://localhost:3000`
- Handle API routes at `http://localhost:3000/api/*`
- Automatically reload on changes

### API Testing

Test your Python API:

- GET: `http://localhost:3000/api/hello`
- POST: `http://localhost:3000/api/hello` (with JSON body)

### Build and Deploy

```sh
# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## Project Structure

```
├── api/                 # Python API endpoints
│   └── hello.py        # Example API handler
├── src/                # Vue.js source code
├── dist/               # Built frontend files
├── vercel.json         # Vercel configuration
├── requirements.txt    # Python dependencies
└── package.json        # Node.js dependencies
```

## Troubleshooting

1. **API not working**: Make sure you're using `npm run vercel:dev` instead of `npm run dev`
2. **CORS issues**: The API handlers include proper CORS headers
3. **Build fails**: Check that all dependencies are installed with `npm install`

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).
