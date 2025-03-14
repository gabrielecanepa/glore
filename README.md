<div align="center">
  <img src="https://raw.githubusercontent.com/gabrielecanepa/glore/refs/heads/main/.github/static/glore.png" alt="" width="90">
  <h1>GloRe Certificate</h1>
  <a href="https://github.com/gabrielecanepa/glore/deployments/Production"><img src="https://img.shields.io/github/deployments/gabrielecanepa/glore/Production?logo=vercel&label=Production&labelColor=%2324292e"></a>
  <a href="https://github.com/gabrielecanepa/glore/deployments/Preview"><img src="https://img.shields.io/github/deployments/gabrielecanepa/glore/Preview?logo=vercel&label=Preview&labelColor=%2324292e"></a>
  <a href="https://github.com/gabrielecanepa/glore/actions/workflows/ci.yml"><img src="https://github.com/gabrielecanepa/glore/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/gabrielecanepa/glore/actions/workflows/github-code-scanning/codeql"><img src="https://github.com/gabrielecanepa/glore/actions/workflows/github-code-scanning/codeql/badge.svg"></a>
</div>
<br>

GloRe is an official certificate that verifies volunteering activities.

Visit [the website](https://glorecertificate.net) to find out how to sign up to the [e-learning platform](https://elearning.glorecertificate.net) and get the certificate recognizing your soft skills.

## About

The GloRe eLearning platform is a monorepository including a <a href="https://nextjs.org">Next.js</a> application backed by <a href="https://supabase.com">Supabase</a> and different utility packages.

The project uses <a href="https://tailwindcss.com">Tailwind CSS</a> and <a href="https://ui.shadcn.com">shadcn/ui</a> components for building a responsive and accessible user interface.

## Development

### Prerequisites

You must download and activate the Node.js version specified [here](https://github.com/gabrielecanepa/glore/blob/main/.node-version).

### Installation

Download the project using the GitHub client or Git:

```sh
gh repo clone gabrielecanepa/glore
# or
git clone https://github.com/gabrielecanepa/glore.git
```

Navigate to the project directory, activate pnpm using Corepack and install the project dependencies:

```sh
cd glore
corepack enable
corepack install
pnpm install
```

### Environment Setup

Switch to the project directory and copy the `.env.example` file to `.env`:

```sh
cd apps/elearning
cp .env.example .env
```

Fill in the required environment variables to gain access to all the services used by the application.

### Running a Development Server

Run a development server with:

```bash
pnpm dev
```

Open [localhost:3000](http://localhost:3000) in your browser to see the result. Any changes you make to the code will be reflected in real-time.

## Contributing

To develop new features, create a branch starting from `main`:

```sh
git checkout -b feature/my-feature-name
```

Once you are done with your changes, push the branch to the repository and create a pull request.

## Releases

To release new versions of the project, you must copy the `.env.example` file at the root of the project to `.env` and specify the `GITHUB_TOKEN` environment variable.

Then, run the following command to create a new release using [release-it](https://github.com/release-it/release-it):

```sh
pnpm release
```

## License

[MIT](LICENSE) © [Associazione Joint](https://associazionejoint.org)
