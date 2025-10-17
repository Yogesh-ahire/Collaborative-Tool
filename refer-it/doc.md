 Design a real time text editor 
 - it is an online word processor, that lets you create and format documents and work other people in real time

 1. Functional Requirements:
 - Users should be able to create/update/delete documents.
 - Multiple users can edit the same document simultaneously
 - Users should be able to view each other's changes in real-time
 - Users should be able to see the cursor position and presence of other users 
 - versioning of the files 

Non-Fuctional Requirement:
- Scale: Millions of users, with Billions of documnets
-CAP Theorem: Availability> Consistency (Normal Document)
- Latency: Updates should be low latency (~ 100ms)

2. Core Entities
- User/Editor
- Document
- Edit
- Cursor

3. API Designing
1) POST: /v1/api/docs/create -Create a documnet (Returns a document Id)
2) GET: /v1/api/docs/{docId} - view Document (Read Only)
3) WS: /v1/api/doc/{docId} - Edit Document

refer interwiew with bunny
