# 📚 AI Research Assistant (RAG-Based Chat with PDFs)

An AI-powered **Research Assistant** that allows users to upload PDF documents and interact with them using a **Retrieval-Augmented Generation (RAG)** pipeline.  
Users can select one or multiple PDFs and ask context-aware questions using an LLM.

---

## 🚀 Features (Implemented So Far)

### 📄 Document Management
- Upload PDF files
- Store PDFs locally
- View all uploaded PDFs in UI
- Open PDFs directly in browser

### 🧠 AI Chat (RAG System)
- Chat with uploaded PDFs using AI
- Multi-document selection support
- Context-aware responses using vector search
- Retrieval-Augmented Generation pipeline

### 🔍 Intelligent Retrieval
- PDF text extraction
- Chunking of documents
- Embedding generation using Sentence Transformers
- Vector storage using ChromaDB
- Similarity-based retrieval

### 💬 Chat Features
- Multi-turn conversation UI
- Markdown-supported AI responses
- Source chunks displayed for transparency
- Basic greeting handling (hi, hello, etc.)

### 🎨 Frontend UI
- Modern dark-themed interface
- Sidebar with PDF management
- Dropdown multi-select PDFs
- ChatGPT-style chat layout
- Real-time message updates

### ⚡ Backend Features
- FastAPI backend
- Background PDF processing (non-blocking upload)
- CORS-enabled API
- Modular RAG pipeline architecture

---

## 🏗️ Architecture
