# Meeting Preparation Assistant

A web application that helps you prepare for your meetings by organizing notes, creating preparation checklists, and providing quick access to meeting details and join links.

## Features

- **Calendar Integration**: Displays your upcoming meetings from Outlook/Microsoft Graph API
- **Meeting Details**: View comprehensive meeting information (time, location, attendees)
- **Preparation Tools**: Add notes and manage checklist items for each meeting
- **Join Meeting**: Quickly join online meetings with a single click
- **Meeting Status**: See at-a-glance which meetings are canceled or high importance

## Technology Stack

- **React**: Front-end UI library
- **TypeScript**: For type-safe code
- **Tailwind CSS**: For styling and UI components
- **Vite**: Build tool for fast development experience
- **Lucide React**: For icons

## Prerequisites

- Node.js 18 or higher
- npm 7 or higher

## Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/meeting-prep-app.git
   cd meeting-prep-app
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

## Configuration

### Tailwind CSS v4 Configuration

This project uses Tailwind CSS v4, which requires a different setup from v3:

1. PostCSS configuration in `postcss.config.mjs`:
   ```js
   export default {
     plugins: {
       '@tailwindcss/postcss': {},
     },
   }
   ```

2. Tailwind CSS import in `src/index.css`:
   ```css
   @import "tailwindcss";
   ```

3. Vite configuration in `vite.config.ts`:
   ```ts
   import tailwindcss from '@tailwindcss/vite';
   
   export default defineConfig({
     plugins: [
       tailwindcss(),
       // other plugins...
     ],
   });
   ```

## Usage

1. Open the application in your browser
2. Click "Connect to Outlook" to load your calendar data
3. Select a meeting from the left sidebar to view its details
4. Add preparation notes and checklist items for the meeting
5. Use the "Join Meeting" button to quickly join online meetings

## Mock Data

For development and demo purposes, the application includes a mock calendar data file (`mockCalendarData.json`) with sample meeting data. In a production environment, this would be replaced with a real connection to Microsoft Graph API.

See the [Graph Explorer Guide](./GRAPH_EXPLORER_GUIDE.md)  for instructions on how to get your own calendar data for testing.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Icons provided by [Lucide Icons](https://lucide.dev/)
- This project was inspired by the need to better prepare for meetings in a professional setting
