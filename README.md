# Blog Project

This is a blog project built using [Astro](https://astro.build/) and deployed on [Cloudflare Pages](https://pages.cloudflare.com/).

## Features

*   **Fast by default:** Leverages Astro's island architecture for optimal performance.
*   **Markdown-powered content:** Easily write and manage blog posts using Markdown files.
*   **Cloudflare Pages deployment:** Seamless continuous deployment with Cloudflare's global network.

## Getting Started

### Installation

1.  Clone this repository:
    ```bash
    git clone https://github.com/greatdaniel23/blog.git
    cd blog
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Development

To start the development server:

```bash
npm run dev
```

This will run the project locally at `http://localhost:4321`.

### Building for Production

To build the project for production:

```bash
npm run build
```

The optimized static assets will be generated in the `dist/` directory.

## Deployment to Cloudflare Pages

This project is configured for continuous deployment with Cloudflare Pages.

1.  Connect your GitHub repository to Cloudflare Pages.
2.  Set the build command to `npm run build`.
3.  Set the build output directory to `dist`.

For more details, refer to the [Astro Cloudflare Pages deployment guide](https://docs.astro.build/en/guides/deploy/cloudflare-pages/).

## License

[Specify your license here, e.g., MIT, Apache 2.0]
