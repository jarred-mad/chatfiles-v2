-- ChatFiles.org Database Schema
-- Migration 001: Initial Schema

-- Enable pgvector extension for face embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Document types enum
CREATE TYPE document_type AS ENUM (
  'email',
  'court_doc',
  'fbi_report',
  'photo',
  'video',
  'transcript',
  'other'
);

-- Documents table - main table for all files
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  dataset_number INTEGER NOT NULL,
  filename VARCHAR(500) NOT NULL,
  original_url TEXT,
  file_path_r2 TEXT,
  text_content TEXT,
  ocr_confidence FLOAT,
  page_count INTEGER,
  file_size_bytes BIGINT,
  document_type document_type DEFAULT 'other',
  created_at TIMESTAMP DEFAULT NOW(),
  indexed_at TIMESTAMP,
  UNIQUE(dataset_number, filename)
);

-- Extracted images from documents
CREATE TABLE extracted_images (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  page_number INTEGER,
  image_path_r2 TEXT,
  width INTEGER,
  height INTEGER,
  has_faces BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Face clusters (groups of same person)
CREATE TABLE face_clusters (
  id SERIAL PRIMARY KEY,
  label VARCHAR(255), -- Name if known person, NULL otherwise
  sample_image_path TEXT,
  face_count INTEGER DEFAULT 0,
  is_known_person BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Individual faces detected in images
CREATE TABLE faces (
  id SERIAL PRIMARY KEY,
  image_id INTEGER REFERENCES extracted_images(id) ON DELETE CASCADE,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  bounding_box JSONB, -- {x, y, width, height}
  embedding vector(512), -- ArcFace embedding
  cluster_id INTEGER REFERENCES face_clusters(id) ON DELETE SET NULL,
  confidence FLOAT,
  face_crop_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Names mentioned in documents (NER extracted)
CREATE TABLE mentioned_names (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  frequency INTEGER DEFAULT 1,
  context_snippet TEXT
);

-- Track what's been indexed in Meilisearch
CREATE TABLE search_index_status (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE UNIQUE,
  indexed BOOLEAN DEFAULT FALSE,
  indexed_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_documents_dataset ON documents(dataset_number);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_filename ON documents(filename);
CREATE INDEX idx_mentioned_names_name ON mentioned_names(name);
CREATE INDEX idx_mentioned_names_document ON mentioned_names(document_id);
CREATE INDEX idx_faces_cluster ON faces(cluster_id);
CREATE INDEX idx_faces_document ON faces(document_id);
CREATE INDEX idx_extracted_images_document ON extracted_images(document_id);
CREATE INDEX idx_face_clusters_label ON face_clusters(label);

-- Full text search index on documents
CREATE INDEX idx_documents_text_search ON documents USING gin(to_tsvector('english', text_content));
