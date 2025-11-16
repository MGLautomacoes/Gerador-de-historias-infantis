<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:** Node.js

1.  **Install dependencies:**
    `npm install`

2.  **Set up Environment Variables:**
    Create a file named `.env.local` in the root of your project and add your API keys. You can get these from the Supabase dashboard and Google AI Studio.

    ```
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    VITE_API_KEY="YOUR_GEMINI_API_KEY"
    ```

3.  **Run the app:**
    `npm run dev`
