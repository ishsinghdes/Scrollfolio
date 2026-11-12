# GitHub and Vercel upload

1. Extract the ZIP. Open the ish-portfolio folder.
2. Upload its contents to your new repository root: index.html, styles.css, app.js, projects.js, assets/, vercel.json, README.md, LICENSE, and this guide. Do not place the containing ish-portfolio folder inside the repository.
3. In Vercel, import the repository. Choose Other as the framework preset. Leave the build command empty, set the output directory to `.`, and keep the root directory at the repository root. No environment variables or dependency installation are needed.
4. Deploy. Add your domain through Vercel when ready.

Keep asset names and paths unchanged. Every folder contains at most 30 immediate items. Upload assets by their existing folders if using GitHub’s web upload.

Project routes use URL fragments, so browser refreshes do not require server rewrites. Edit projects.js to add or reorder images and projects.
