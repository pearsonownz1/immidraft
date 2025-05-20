# AI-Powered Visa Case Builder

AI-Powered Visa Case Builder is a comprehensive tool designed to assist legal professionals, immigration consultants, and individuals in preparing and managing visa application cases. The application aims to simplify the complex visa application workflow by providing features such as document uploading and organization, criteria tracking for various visa types, and a guided letter editor. Leveraging AI, the tool offers intelligent suggestions and automations to enhance efficiency and accuracy throughout the case building process.

## Key Features
- **Case Management:** Streamlined process for creating and managing client visa cases.
- **Guided Case Building:** Step-by-step forms for client information and visa type selection.
- **Criteria Tracking:** Monitor and manage specific criteria required for different visa categories.
- **Document Uploader:** Easily upload and organize necessary documents for each case.
- **Advanced Letter Editor:** A sophisticated editor to draft, comment on, and finalize visa application letters, with a criteria outline.
- **AI-Powered Assistance:** Leverage AI to provide suggestions, automate repetitive tasks, and enhance the accuracy of case preparation (details to be confirmed based on `aiService.ts` functionality).
- **Visa Type Selection:** Modal for selecting appropriate visa types.

## Technology Stack
- **Frontend Framework:** React
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Shadcn UI (built on Radix UI)
- **Backend & Database:** Supabase
- **Routing:** React Router DOM
- **Form Management:** React Hook Form
- **Schema Validation:** Zod
- **Linting:** ESLint

## Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- npm (or yarn)

### Installation & Setup
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/your-repository-name.git # Replace with actual repo URL later
    cd your-repository-name
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up environment variables:**
    Create a `.env` file in the root of the project.
    Add the following Supabase credentials. You can get these from your Supabase project settings.
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    # For generating Supabase types, also ensure SUPABASE_PROJECT_ID is set in your environment
    # or replace $SUPABASE_PROJECT_ID in package.json with your actual project ID.
    ```

### Running the Development Server
To start the development server, run:
```bash
npm run dev
```
The application will typically be available at `http://localhost:5173` (Vite's default).

### Building for Production
To create a production build, run:
```bash
npm run build
```
The build artifacts will be stored in the `dist/` directory.

### Linting
To run the linter, use:
```bash
npm run lint
```

## Available Scripts
Based on the `package.json`, here are the primary scripts you can use:

-   **`npm run dev`**
    -   Starts the development server using Vite. Ideal for development with hot module reloading.
-   **`npm run build`**
    -   Builds the application for production. This command first runs `tsc` to check for TypeScript errors and then uses Vite to bundle the app into the `dist/` directory.
-   **`npm run build-no-errors`**
    -   Builds the application for production, similar to `npm run build`. It also runs `tsc` and then Vite to build the project. (The distinction from `build` isn't immediately obvious from the command itself; it might be a legacy script or have a subtle configuration difference not apparent from the script line alone).
-   **`npm run lint`**
    -   Lints the codebase using ESLint. This helps identify and fix problems in your JavaScript/TypeScript code, ensuring code quality and adherence to style guidelines.
-   **`npm run preview`**
    -   Starts a local static web server that serves the files from your `dist/` directory. This is useful for previewing the production build locally before deploying.
-   **`npm run types:supabase`**
    -   Generates TypeScript type definitions from your Supabase project schema. This script uses the Supabase CLI to fetch your database schema and create corresponding TypeScript types, typically outputting them to `src/types/supabase.ts`. You need to have `SUPABASE_PROJECT_ID` set as an environment variable for this script to work correctly.

## Contributing
Contributions to AI-Powered Visa Case Builder are welcome. Please open an issue to discuss potential changes or submit a pull request.

## License
This project is currently unlicensed. Please refer back to this section for updates on licensing information.
