# Isfaq Hossain Ibon — Personal Portfolio

A personal portfolio for Isfaq Hossain Ibon, a Computer Science and Engineering student at United International University. The site presents practical web work, academic projects, technical skills, education, current learning goals, and contact information.

## Main features

- Refined professional layout with restrained editorial typography
- Accessible sticky navigation and mobile menu
- Active-section navigation state
- Featured and supporting project presentations
- Professional grouped skills and tools
- Accessible animated project-note accordions with no-JavaScript fallback content
- Resume view and download actions
- Subtle scroll reveals with reduced-motion support
- SEO, Open Graph, and social card metadata
- GitHub Pages-compatible relative asset paths
- Public contact details limited to email, GitHub, LinkedIn, location, and resume

## Technologies

- HTML5
- CSS3
- Vanilla JavaScript

No UI framework or build step is required.

## Project structure

```text
portfolio-website/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── profile.png
    ├── project-fydp.png
    ├── project-orpon.png
    ├── project-crimealert.png
    ├── project-login.png
    ├── og-portfolio.png
    ├── portfolio-preview-current.jpg
    ├── portfolio-mobile-preview-current.jpg
    └── resume.pdf
```

## Run locally

You can open `index.html` directly, or run a small local server from the project folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy with GitHub Pages

1. Push the project to the `main` branch of the GitHub repository.
2. Open the repository on GitHub and go to **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**.
4. Select the `main` branch and the `/ (root)` folder, then save.
5. GitHub will publish the site after the Pages workflow completes.

Expected live website:
[https://mibon201101.github.io/portfolio-website/](https://mibon201101.github.io/portfolio-website/)

If the repository name changes, update the canonical and Open Graph URLs in `index.html`.

## Screenshot

![Current portfolio homepage preview](./assets/portfolio-preview-current.jpg)

![Current portfolio mobile preview](./assets/portfolio-mobile-preview-current.jpg)

The social-sharing card is available at `assets/og-portfolio.png`.

## Content still to add

Verified project-specific GitHub and live-demo URLs are not available in the current repository, so unavailable actions are intentionally hidden rather than shown as placeholders.

## Author

Isfaq Hossain Ibon  
[GitHub profile](https://github.com/mibon201101)
