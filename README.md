# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project in the current directory
npx sv create

# create a new project in my-app
npx sv create my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

## Deployment

This project supports deployment to both Node.js servers and Cloudflare. The adapter is selected automatically based on the `ADAPTER` environment variable.

### Node.js Deployment (Default)

Build for Node.js deployment:

```sh
npm run build
# or explicitly:
npm run build:node
```

The build output will be in the `build/` directory. You can run it with:

```sh
node build/index.js
```

### Cloudflare Deployment

Build for Cloudflare Workers/Pages:

```sh
npm run build:cloudflare
# or:
ADAPTER=cloudflare npm run build
```

The build output will be in `.svelte-kit/cloudflare/` directory.

### Adapter Selection

The adapter is selected in `svelte.config.js` based on the `ADAPTER` environment variable:

- `ADAPTER=node` or unset → Uses `@sveltejs/adapter-node` (default)
- `ADAPTER=cloudflare` → Uses `@sveltejs/adapter-cloudflare`

You can also set the environment variable directly:

```sh
ADAPTER=cloudflare npm run build
```

> For more information about adapters, see the [SvelteKit adapters documentation](https://svelte.dev/docs/kit/adapters).
