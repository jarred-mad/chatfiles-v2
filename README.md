# ChatFiles.org

A searchable archive of publicly released DOJ Epstein documents. Full-text search, facial recognition, and OCR-processed files.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         ChatFiles.org                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Next.js 14  │  │  Meilisearch │  │   PostgreSQL 16      │  │
│  │  App Router  │◄─┤  Full-text   │  │   + pgvector         │  │
│  │  Frontend    │  │  Search      │  │   Face embeddings    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         │                                      │                 │
│         └──────────────────┬───────────────────┘                │
│                            │                                     │
│                   ┌────────┴────────┐                           │
│                   │  Cloudflare R2  │                           │
│                   │  File Storage   │                           │
│                   │  PDFs, Images   │                           │
│                   └─────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Processing Pipeline (Python):
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│   OCR    │──▶│  Image   │──▶│   Face   │──▶│  Search  │
│ Pipeline │   │ Extract  │   │ Pipeline │   │  Index   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
      │              │              │              │
      └──────────────┴──────────────┴──────────────┘
                            │
                   ┌────────┴────────┐
                   │   load_database │
                   │   + upload_r2   │
                   └─────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL 16 with pgvector
- Meilisearch

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/yourorg/chatfiles.git
   cd chatfiles
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start services with Docker:**
   ```bash
   docker-compose up -d postgres meilisearch
   ```

4. **Run database migrations:**
   ```bash
   psql $DATABASE_URL < scripts/migrations/001_initial_schema.sql
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

6. **Open http://localhost:3000**

### Production Deployment

```bash
# Build and start all services
docker-compose up -d

# Or build separately
docker build -t chatfiles .
docker run -p 3000:3000 --env-file .env chatfiles
```

## Processing Pipeline

Process raw PDF files through the pipeline:

```bash
# 1. OCR Processing (adds searchable text layer)
python scripts/ocr_pipeline.py \
  --input ~/epstein_files/DataSet_10 \
  --output ~/epstein_processed/DataSet_10 \
  --workers 8

# 2. Image Extraction (extracts embedded images)
python scripts/extract_images.py \
  --input ~/epstein_files/DataSet_10 \
  --output ~/epstein_images/DataSet_10 \
  --workers 8

# 3. Face Detection & Clustering
python scripts/face_pipeline.py \
  --input ~/epstein_images/ \
  --output ~/epstein_faces/ \
  --reference ./scripts/reference_faces/ \
  --gpu

# 4. Build Search Index
python scripts/build_search_index.py \
  --input ~/epstein_processed/ \
  --meilisearch-url http://localhost:7700 \
  --api-key $MEILISEARCH_API_KEY

# 5. Upload to Cloudflare R2
python scripts/upload_to_r2.py \
  --input ~/epstein_processed/ \
  --bucket chatfiles-archive \
  --workers 16

# 6. Load into PostgreSQL
python scripts/load_database.py \
  --input ~/epstein_processed/ \
  --faces ~/epstein_faces/
```

### Pipeline Dependencies

```bash
pip install ocrmypdf pymupdf tqdm boto3 meilisearch psycopg2-binary numpy scikit-learn

# For face detection (optional, requires GPU)
pip install insightface onnxruntime-gpu

# For NER (named entity recognition)
pip install spacy
python -m spacy download en_core_web_sm
```

## Project Structure

```
chatfiles/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes
│   │   ├── search/         # Search page
│   │   ├── documents/      # Document viewer
│   │   ├── photos/         # Photo gallery
│   │   ├── browse/         # Browse by dataset/type
│   │   └── about/          # About page
│   ├── components/         # React components
│   │   ├── layout/        # Header, Footer
│   │   └── ui/            # SearchBar, AdSlot
│   └── lib/               # Utilities
│       ├── meilisearch.ts # Search client
│       ├── database.ts    # PostgreSQL client
│       └── ads.ts         # AdSense config
├── scripts/               # Python processing scripts
│   ├── migrations/       # SQL migrations
│   ├── ocr_pipeline.py
│   ├── extract_images.py
│   ├── face_pipeline.py
│   ├── build_search_index.py
│   ├── upload_to_r2.py
│   └── load_database.py
├── public/               # Static assets
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `MEILISEARCH_URL` | Meilisearch instance URL | Yes |
| `MEILISEARCH_API_KEY` | Meilisearch master key | Yes |
| `R2_ACCOUNT_ID` | Cloudflare account ID | Yes |
| `R2_ACCESS_KEY_ID` | R2 API access key | Yes |
| `R2_SECRET_ACCESS_KEY` | R2 API secret key | Yes |
| `R2_BUCKET_NAME` | R2 bucket name | Yes |
| `NEXT_PUBLIC_R2_PUBLIC_URL` | Public URL for R2 files | Yes |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Google AdSense ID | No |

## API Routes

- `GET /api/search?q=query&type=&datasets=&page=&limit=` - Full-text search
- `GET /api/search/suggest?q=partial` - Autocomplete suggestions
- `GET /api/documents/[id]` - Get document with metadata
- `GET /api/photos?page=&limit=&dataset=&person=` - Photo gallery
- `GET /api/faces/clusters` - Face clusters list
- `GET /api/stats` - Archive statistics

## License

All documents hosted are publicly released U.S. government records.

The code for this project is MIT licensed.

## Disclaimer

- All documents are publicly released U.S. government records
- ChatFiles.org makes no claims about guilt or innocence of any individual
- Facial recognition matches are probabilistic, not definitive
- This site is not affiliated with the DOJ, FBI, or any government agency
