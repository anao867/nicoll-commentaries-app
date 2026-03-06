# Comentarii Psihologice de Maurice Nicoll - Aplicație de Traducere în Română

O aplicație web full-stack pentru stocarea, afișarea și traducerea comentariilor psihologice ale lui Maurice Nicoll în limba română.

## Features

- **View Commentaries**: Browse all stored commentaries in a beautiful card grid
- **Add New**: Add new commentaries with original English text and Romanian translations
- **Edit**: Update existing commentaries
- **Delete**: Remove commentaries from the database
- **Search**: Full-text search across titles and content
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## MVP Checklist

- [x] CRUD complet pentru comentarii (create/read/update/delete)
- [x] Căutare în titlu și conținut
- [x] Persistență locală cu SQLite
- [x] Port fallback automat dacă `3000` este ocupat
- [x] Endpoint de sănătate API: `GET /api/health`
- [x] Indicator vizual frontend pentru starea serverului
- [x] Backup/export simplu pentru baza de date
- [ ] Deploy pe un hosting (Render/Railway/VPS)

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

Aplicația încearcă să pornească pe `http://localhost:3000`.
Dacă portul este ocupat, va încerca automat următoarele porturi (`3001`, `3002`, etc.).

### Optional Environment Variables

- `PORT` - portul de start (implicit `3000`)
- `PORT_RETRIES` - câte porturi suplimentare să încerce (implicit `10`)
- `NODE_ENV=production` - activează modul public read-only
- `PUBLIC_WRITE_ENABLED=true` - permite scrierea și în production (implicit este blocată)
- `ADMIN_TOKEN` - permite scrierea privată în production doar cu token valid
- `DATABASE_URL` - activează PostgreSQL (dacă nu există, se folosește SQLite)
- `PGSSLMODE=disable` - opțional pentru conexiuni locale Postgres fără SSL

### Publicare în mod doar citire (recomandat)

Pentru a publica aplicația fără ca publicul să poată scrie:

1. setează `NODE_ENV=production`
2. nu seta `PUBLIC_WRITE_ENABLED` (sau lasă-l diferit de `true`)

În acest mod, endpoint-urile `POST/PUT/DELETE` răspund cu `403`, iar UI ascunde butoanele de adăugare/editare/ștergere.

### Scriere privată pentru owner (fără acces public)

Dacă vrei să editezi online dar publicul să rămână read-only:

1. păstrează `NODE_ENV=production`
2. păstrează `PUBLIC_WRITE_ENABLED=false`
3. setează un secret `ADMIN_TOKEN` în Render env vars

Aplicația permite scriere doar când request-ul include header-ul:

`x-admin-token: <ADMIN_TOKEN>`

În UI există câmpul **Admin token** (în navbar). După unlock, browserul tău poate adăuga/edita/șterge, iar vizitatorii rămân read-only.

## API Endpoints

All API endpoints are prefixed with `/api`:

- `GET /commentaries` - Get all commentaries
- `GET /commentaries/:id` - Get a specific commentary
- `POST /commentaries` - Add a new commentary
- `PUT /commentaries/:id` - Update a commentary
- `DELETE /commentaries/:id` - Delete a commentary
- `GET /search/:query` - Search commentaries
- `GET /health` - Health check for frontend/server monitoring
- `GET /access` - Returns read-only/read-write mode capabilities
- `GET /backup` - Download SQLite database backup
- `POST/PUT/DELETE /commentaries...` - acceptate în production doar cu `x-admin-token` valid (dacă `ADMIN_TOKEN` este setat)

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

## Migrare SQLite -> PostgreSQL

Aplicația suportă acum ambele moduri:
- **SQLite** (implicit, local)
- **PostgreSQL** (când setezi `DATABASE_URL`)

### 1) Migrare date existente

Rulează o migrare unică din `data/commentaries.db` către PostgreSQL:

```bash
DATABASE_URL=postgres://user:pass@host:5432/dbname npm run migrate:postgres
```

Pe Windows PowerShell:

```powershell
$env:DATABASE_URL="postgres://user:pass@host:5432/dbname"
npm run migrate:postgres
```

### 2) Rulează aplicația pe PostgreSQL

Setează `DATABASE_URL` în mediul de deploy (Render/Railway/etc.).
La pornire, aplicația creează automat tabela dacă nu există.

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

## Deploy pe Render (read-only public)

Fișierul `render.yaml` este deja pregătit pentru deploy în mod read-only public.
Blueprint-ul creează și o bază PostgreSQL managed (`nicoll-commentaries-db`) și conectează automat `DATABASE_URL`.

### Pași

1. Urcă proiectul pe GitHub.
2. În Render, alege **New +** → **Blueprint**.
3. Conectează repository-ul și confirmă deploy-ul.
4. După deploy, aplicația rulează cu:
   - `NODE_ENV=production`
   - `PUBLIC_WRITE_ENABLED=false`
   - `DATABASE_URL` injectat automat din Postgres managed

### Migrare date inițiale (o singură dată)

După primul deploy, migrează datele din SQLite în Postgres:

1. în Render, deschide serviciul web → **Shell**
2. rulează:

```bash
npm run migrate:postgres
```

Scriptul citește `data/commentaries.db` și scrie în PostgreSQL folosind `DATABASE_URL` deja setat.

### Important (SQLite)

Acest proiect folosește SQLite (`data/commentaries.db`).
Fără persistent disk, datele pot fi resetate la redeploy/restart.

Pentru producție stabilă ai două opțiuni:
- atașezi persistent disk în Render (plan compatibil)
- migrezi baza de date la un serviciu managed (ex: PostgreSQL)

Pentru varianta PostgreSQL managed, folosește pașii din secțiunea **Migrare SQLite -> PostgreSQL**.

## License

This project is open source and available under the ISC License.

## Author

Created for the preservation and study of Maurice Nicoll's psychological commentaries.
