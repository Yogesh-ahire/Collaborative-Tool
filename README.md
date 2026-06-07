<h1 align="center">DoczFlow : AI Powered Real-Time Collaborative Editor</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js"/>
  <img src="https://img.shields.io/badge/React-19-blue?logo=react"/>
  <img src="https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript"/>
  <img src="https://img.shields.io/badge/Liveblocks-Realtime-purple"/>
  <img src="https://img.shields.io/badge/Convex-Backend-orange"/>
  <img src="https://img.shields.io/badge/AI-Groq_Llama3-red"/>
  <img src="https://img.shields.io/badge/Deployment-Vercel-black?logo=vercel"/>
</p>

DoczFlow is a **real-time collaborative document editing platform** that enables multiple users to create, edit, and collaborate on documents simultaneously. It provides live synchronization, AI-powered assistance, and granular document forensics.

---

# Live Demo

🔗 [https://doczflow.vercel.app](https://doczflow.vercel.app)

---

# Features

### 🧠 AI-Powered Document Assistant
Integrates a **Retrieval-Augmented Generation (RAG)** pipeline using Groq and Pinecone. Provides context-aware grammar correction, tone adjustment, and document summarization.

### 📊 Insights & Forensics
Includes a dedicated forensics tab for **Document Flow Maps**, **Volume Distribution** charts, and an **Event Audit Trail** to track granular user contributions.

### 📝 Rich Text Editing & Collaboration
*   **Live Synchronization:** Real-time editing powered by Liveblocks & Tiptap.
*   **Presence & Interaction:** Live cursor tracking, presence indicators, comments, and mentions.
*   **Version History:** Robust tracking of document versions with manual and auto-save capabilities (Snapshot Based).

### 🏢 Workspaces & Security
*   **Organization-Based Access:** Documents can be managed within team workspaces.
*   **Secure Authentication:** Identity management and RBAC handled by Clerk.

---
# System Architecture & Features

<p align="center">
  <img src="docs/images/architecture.png" width="900"/>
</p>

# Application Screenshots

### Document Dashboard
<p align="center">
  <img src="docs/images/dashboard.png" width="900"/>
</p>

### Collaborative Editor & Forensics
<p align="center">
  <img src="docs/images/editor.png" width="900"/>
</p>

---

# Tech Stack

* **Frontend:** Next.js, React, TypeScript, Tailwind CSS
* **Editor:** TipTap (ProseMirror based)
* **Real-Time & Sync:** Liveblocks
* **Backend & DB:** Convex
* **AI & Intelligence:** Groq (Llama-3), Pinecone Vector DB
* **Authentication:** Clerk
* **Deployment:** Vercel

---

# 👨‍💻 Yogesh Ahire

🔗 GitHub: https://github.com/Yogesh-ahire  
🔗 LinkedIn: https://linkedin.com/in/yogesh23-ahire

## 📜 Acknowledgments
This project was evolved from a foundational collaborative editor architecture referenced from [Antonio's full-stack tutorials](https://youtu.be/gq2bbDmSokU?si=TDb8WNjoj5M_g1SZ) to serve as a specialized, high-performance AI-augmented platform.

## License

This project is built for educational and portfolio purposes.