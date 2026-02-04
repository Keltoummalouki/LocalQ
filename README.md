# Technical Documentation – LocalQ Project

**Candidate:** Keltoum Malouki
**Context:** DabaDoc Full Stack Challenge
**Date:** February 6, 2026

## 1. Project Overview

**LocalQ** is a community-driven Q&A platform designed to connect citizens with local knowledge. The application allows users to ask questions, share answers, and filter content based on specific Moroccan cities (e.g., Casablanca, Tanger).

This project was built to fulfill the DabaDoc technical challenge requirements, demonstrating a full-stack implementation using modern JavaScript frameworks and a clean architecture.

## 2. Technology Stack

The application is built using the **MERN/Full-Stack JavaScript** ecosystem with strict typing via TypeScript.

### **Backend (API)**

* **Framework:** **NestJS** (Node.js framework for scalable server-side apps).
* **Database:** **MongoDB** (Atlas) with **Mongoose** for object modeling.
* **Authentication:** JWT (JSON Web Tokens) & Bcrypt for security.
* **Language:** TypeScript.

### **Frontend (Client)**

* **Framework:** **Next.js 14** (using App Router).
* **Styling:** **TailwindCSS** for responsive design.
* **Animations:** Framer Motion.
* **HTTP Client:** Axios.
* **Icons:** Lucide React.

## 3. Prerequisites

To run this project locally, ensure you have the following installed:

* **Node.js** (v18+ recommended)
* **npm** (Node Package Manager)
* **MongoDB Connection String** (A local MongoDB instance or a MongoDB Atlas URI).

## 4. Installation & Setup Guide

### **A. Backend Setup**

1. Navigate to the backend directory:
```bash
cd backend

```


2. Install dependencies:
```bash
npm install

```


3. **Environment Configuration**: Create a `.env` file in the backend folder and add the following variables:
```env
# Configuration de la Base de Données
MONGO_URI=mongodb_connection_string

# Configuration de Sécurité (JWT)
JWT_ACCESS_TOKEN_SECRET=access_token_secret
JWT_ACCESS_TOKEN_EXPIRY=access_token_expiry
GOOGLE_CLIENT_ID=google_id_client
GOOGLE_CLIENT_SECRET=google_client_secret
GOOGLE_CALLBACK_URL=google_callback_url

PORT=3000

```


4. Start the server:
```bash
npm run start:dev

```


*The API will be available at http://localhost:3000.*

### **B. Frontend Setup**

1. Navigate to the frontend directory:
```bash
cd frontend

```


2. Install dependencies:
```bash
npm install

```


3. **Environment Configuration**: Create a `.env.local` file in the frontend folder:
```env
PUBLIC_API_URL=http://localhost:3000

```


4. Start the development server:
```bash
npm run dev

```


*The application will be accessible at http://localhost:3000 (or the port specified by Next.js).*

## 5. Features Implemented

This solution covers the core requirements of the challenge and includes additional enhancements:

**Core Requirements:**

* [x] **Question Management:** Users can create new questions with titles, content, and city tags.
* [x] **Answering System:** Users can provide answers to existing questions.
* [x] **Voting System:** Implementation of **Upvotes** for both questions and answers.
* [x] **Listing & Viewing:** A detailed view for questions and a main feed listing all threads.

**Advanced Features (Bonus):**

* [x] **City Filtering:** Users can filter questions by specific cities (Casablanca, Rabat, Marrakech, etc.).
* [x] **Search Functionality:** Real-time search for keywords (e.g., "wifi", "restaurants").
* [x] **User Dashboard:** A personal area to view user stats (Total Questions, Answers, Upvotes received).
* [x] **Modern UI/UX:** A dark-themed design using TailwindCSS and Framer Motion animations.
* [x] **Secure Auth:** Complete Signup/Login flow.

## 6. API Structure

The backend exposes the following key RESTful endpoints:

* **Auth:** `POST /auth/login`, `POST /auth/signup`
* **Questions:**
* `GET /questions` (List all, supports `?city=` and `?search=` filters)
* `POST /questions` (Create new)
* `PATCH /questions/:id/vote` (Upvote)


* **Answers:**
* `POST /answers` (Submit an answer)
* `GET /answers/question/:id` (Get answers for a specific thread)



## 7. Conclusion

LocalQ demonstrates a production-ready structure using Next.js and NestJS, focusing on modularity and type safety. The code is organized to be easily scalable for future features.