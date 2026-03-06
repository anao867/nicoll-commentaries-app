# Comentarii Psihologice de Maurice Nicoll - Aplicație de Traducere în Română

O aplicație web full-stack pentru stocarea, afișarea și traducerea comentariilor psihologice ale lui Maurice Nicoll în limba română.

## Features

- **View Commentaries**: Browse all stored commentaries in a beautiful card grid
- **Add New**: Add new commentaries with original English text and Romanian translations
- **Edit**: Update existing commentaries
- **Delete**: Remove commentaries from the database
- **Search**: Full-text search across titles and content
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Project Structure

```
.
├── public/              # Frontend files
│   ├── index.html      # Main HTML file
│   ├── style.css       # Frontend styling
│   └── script.js       # Frontend logic
├── src/                # Backend files
│   ├── database.js     # SQLite database operations
│   └── routes.js       # API routes
├── data/               # Database storage
│   └── commentaries.db # SQLite database (auto-created)
├── server.js           # Express server entry point
├── package.json        # Node.js dependencies
└── README.md          # This file
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Setup

1. Navigate to the project directory:
```bash
cd "Fourth Way Glossary/Comentarii psihologice"
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The application will start on `http://localhost:3000`

## API Endpoints

All API endpoints are prefixed with `/api`:

- `GET /commentaries` - Get all commentaries
- `GET /commentaries/:id` - Get a specific commentary
- `POST /commentaries` - Add a new commentary
- `PUT /commentaries/:id` - Update a commentary
- `DELETE /commentaries/:id` - Delete a commentary
- `GET /search/:query` - Search commentaries

## Database Schema

The SQLite database contains a single table `commentaries`:

```sql
CREATE TABLE commentaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL UNIQUE,
  original_text TEXT NOT NULL,
  romanian_translation TEXT,
  author TEXT DEFAULT 'Maurice Nicoll',
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Usage

1. **Add a Commentary**:
   - Click "Add New" button
   - Enter the title
   - Paste the original English text
   - Enter (or leave empty for now) the Romanian translation
   - Click "Save Commentary"

2. **View Details**:
   - Click on any commentary card to view the full text
   - Side-by-side comparison of original and Romanian translation

3. **Edit**:
   - Click "Edit" in the detail view
   - Modify the content
   - Click "Update Commentary"

4. **Search**:
   - Use the search box in the navigation bar
   - Search terms will match against title, original text, and translation

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Styling**: Modern CSS with flexbox and grid

## Future Enhancements

- User authentication
- Multiple language support
- Commenting system
- Export to PDF
- Text highlighting and annotations
- Integration with translation APIs

## License

This project is open source and available under the ISC License.

## Author

Created for the preservation and study of Maurice Nicoll's psychological commentaries.
