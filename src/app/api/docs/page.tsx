'use client';

import { useState } from 'react';
import Link from 'next/link';

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/search',
    description: 'Search documents by keyword',
    auth: 'Optional (limited without key)',
    params: [
      { name: 'q', type: 'string', required: true, description: 'Search query' },
      { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)' },
      { name: 'limit', type: 'integer', required: false, description: 'Results per page (max: 100)' },
      { name: 'dataset', type: 'integer', required: false, description: 'Filter by dataset (8-12)' },
      { name: 'type', type: 'string', required: false, description: 'Filter by document type' },
    ],
    example: `curl -X GET "https://chatfiles.org/api/v1/search?q=epstein&limit=10" \\
  -H "X-API-Key: cf_your_api_key_here"`,
    response: `{
  "data": [
    {
      "id": "doc_001",
      "filename": "FBI_302_Interview_Report.pdf",
      "dataset_number": 10,
      "document_type": "fbi_report",
      "excerpt": "...",
      "url": "https://chatfiles.org/documents/doc_001"
    }
  ],
  "meta": {
    "query": "epstein",
    "total": 1234,
    "page": 1,
    "limit": 10,
    "total_pages": 124
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/documents/:id',
    description: 'Get document details by ID',
    auth: 'Required',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Document ID' },
    ],
    example: `curl -X GET "https://chatfiles.org/api/v1/documents/doc_001" \\
  -H "X-API-Key: cf_your_api_key_here"`,
    response: `{
  "data": {
    "id": "doc_001",
    "filename": "FBI_302_Interview_Report.pdf",
    "dataset_number": 10,
    "document_type": "fbi_report",
    "file_url": "https://files.chatfiles.org/...",
    "ocr_confidence": 0.92,
    "page_count": 15,
    "mentioned_names": [...]
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/documents/:id/images',
    description: 'Get images extracted from a document',
    auth: 'Required',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Document ID' },
      { name: 'has_faces', type: 'boolean', required: false, description: 'Filter to images with faces' },
    ],
    example: `curl -X GET "https://chatfiles.org/api/v1/documents/doc_001/images" \\
  -H "X-API-Key: cf_your_api_key_here"`,
    response: `{
  "data": [
    {
      "id": "img_001",
      "page_number": 3,
      "image_url": "https://files.chatfiles.org/...",
      "has_faces": true,
      "faces": [...]
    }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/faces/clusters',
    description: 'List all face clusters',
    auth: 'Required',
    params: [
      { name: 'page', type: 'integer', required: false, description: 'Page number' },
      { name: 'limit', type: 'integer', required: false, description: 'Results per page' },
      { name: 'known_only', type: 'boolean', required: false, description: 'Only known persons' },
    ],
    example: `curl -X GET "https://chatfiles.org/api/v1/faces/clusters?known_only=true" \\
  -H "X-API-Key: cf_your_api_key_here"`,
    response: `{
  "data": [
    {
      "id": "cluster_1",
      "label": "Jeffrey Epstein",
      "face_count": 245,
      "is_known_person": true
    }
  ],
  "meta": { ... }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/faces/clusters/:id',
    description: 'Get cluster details with all faces',
    auth: 'Required',
    params: [
      { name: 'id', type: 'string', required: true, description: 'Cluster ID' },
      { name: 'include_faces', type: 'boolean', required: false, description: 'Include face list' },
      { name: 'face_limit', type: 'integer', required: false, description: 'Max faces to return' },
    ],
    example: `curl -X GET "https://chatfiles.org/api/v1/faces/clusters/cluster_1" \\
  -H "X-API-Key: cf_your_api_key_here"`,
    response: `{
  "data": {
    "id": "cluster_1",
    "label": "Jeffrey Epstein",
    "faces": [...],
    "co_occurring_clusters": [...]
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/stats',
    description: 'Get archive statistics',
    auth: 'Not required',
    params: [],
    example: `curl -X GET "https://chatfiles.org/api/v1/stats"`,
    response: `{
  "data": {
    "archive": {
      "total_documents": 26498,
      "total_pages": 935000,
      "total_images": 45678
    },
    "document_types": { ... },
    "processing": { ... }
  }
}`,
  },
];

export default function ApiDocsPage() {
  const [activeEndpoint, setActiveEndpoint] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-white">API Documentation</h1>
          <p className="text-gray-300 mt-2">
            Programmatic access to the ChatFiles.org document archive
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-20">
              <h2 className="font-semibold text-gray-900 mb-3">Endpoints</h2>
              <nav className="space-y-1">
                {endpoints.map((endpoint, index) => (
                  <button
                    key={endpoint.path}
                    onClick={() => setActiveEndpoint(index)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeEndpoint === index
                        ? 'bg-navy text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span
                      className={`inline-block w-12 font-mono text-xs ${
                        activeEndpoint === index ? 'text-gray-300' : 'text-gray-400'
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <span className="font-mono text-xs truncate">
                      {endpoint.path.replace('/api/v1', '')}
                    </span>
                  </button>
                ))}
              </nav>

              <div className="border-t border-gray-200 mt-4 pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Get an API Key</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Subscribe to Pro or Institutional for API access.
                </p>
                <Link
                  href="/pricing"
                  className="block text-center bg-accent text-white py-2 rounded-md text-sm font-medium hover:bg-accent-hover transition-colors"
                >
                  View Plans
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-8">
            {/* Authentication */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Authentication</h2>
              <p className="text-gray-600 mb-4">
                Most endpoints require an API key. Include your key in the{' '}
                <code className="bg-gray-100 px-1 rounded">X-API-Key</code> header.
              </p>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`curl -X GET "https://chatfiles.org/api/v1/search?q=epstein" \\
  -H "X-API-Key: cf_your_api_key_here"`}
              </pre>

              <h3 className="font-semibold text-gray-900 mt-6 mb-2">Rate Limits</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">Tier</th>
                    <th className="pb-2">Daily Limit</th>
                    <th className="pb-2">Per Minute</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b">
                    <td className="py-2">Free (no key)</td>
                    <td>100</td>
                    <td>10</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Pro</td>
                    <td>1,000</td>
                    <td>60</td>
                  </tr>
                  <tr>
                    <td className="py-2">Institutional</td>
                    <td>Unlimited</td>
                    <td>300</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Active Endpoint */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    endpoints[activeEndpoint].method === 'GET'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {endpoints[activeEndpoint].method}
                </span>
                <code className="text-lg font-mono text-gray-900">
                  {endpoints[activeEndpoint].path}
                </code>
              </div>

              <p className="text-gray-600 mb-4">{endpoints[activeEndpoint].description}</p>

              <div className="flex items-center gap-2 text-sm mb-6">
                <span className="text-gray-500">Authentication:</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    endpoints[activeEndpoint].auth === 'Not required'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {endpoints[activeEndpoint].auth}
                </span>
              </div>

              {/* Parameters */}
              {endpoints[activeEndpoint].params.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Parameters</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Required</th>
                        <th className="pb-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600">
                      {endpoints[activeEndpoint].params.map((param) => (
                        <tr key={param.name} className="border-b">
                          <td className="py-2 font-mono text-sm">{param.name}</td>
                          <td className="py-2">{param.type}</td>
                          <td className="py-2">
                            {param.required ? (
                              <span className="text-red-600">Yes</span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="py-2">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Example Request */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Example Request</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {endpoints[activeEndpoint].example}
                </pre>
              </div>

              {/* Example Response */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Example Response</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {endpoints[activeEndpoint].response}
                </pre>
              </div>
            </section>

            {/* Error Codes */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Error Codes</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-2">Code</th>
                    <th className="pb-2">HTTP Status</th>
                    <th className="pb-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b">
                    <td className="py-2 font-mono">UNAUTHORIZED</td>
                    <td>401</td>
                    <td>Invalid or missing API key</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono">LIMIT_EXCEEDED</td>
                    <td>403</td>
                    <td>Tier limit exceeded</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono">NOT_FOUND</td>
                    <td>404</td>
                    <td>Resource not found</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 font-mono">RATE_LIMITED</td>
                    <td>429</td>
                    <td>Too many requests</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-mono">SERVER_ERROR</td>
                    <td>500</td>
                    <td>Internal server error</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
