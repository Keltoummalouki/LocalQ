# LocalQ - Location-Based Q&A Platform

Welcome to **LocalQ**, a full-stack web application that connects people through local knowledge. This platform allows users to post questions tied to their current location and receive answers from others nearby.

This project was built as part of the **DabaDoc Technical Challenge**.

## 🚀 The Idea

Amine has just arrived in a new city. He has questions, and only people close to his location can answer them effectively. **LocalQ** solves this by sorting content by distance, ensuring users see the most relevant questions first.

## 🛠 Tech Stack

This project uses a modern, high-performance JavaScript stack:

* **Backend:** [NestJS](https://nestjs.com/) (Node.js framework)
* **Frontend:** [Next.js](https://nextjs.org/) (React framework)
* **Database:** [MongoDB](https://www.mongodb.com/) (NoSQL Database)
* **Language:** TypeScript (Strict typing for reliability)
* **Styling:** Tailwind CSS

## ✨ Features

* **User Authentication:** Secure Sign-up and Login (JWT based).
* **Geolocation:** Automatically detects user position.
* **Ask Locally:** Post questions with title, content, and precise location.
* **Answer Locally:** Reply to questions from users nearby.
* **Smart Feed:** Questions are sorted by distance (closest to you first).
* **Favorites:** Like questions to save them for later.

## ⚙️ Prerequisites

Before you start, make sure you have the following installed:

* **Node.js** (v18 or higher)
* **MongoDB** (running locally or via Atlas)
* **Git**

## 📦 Installation & Setup

Follow these steps to get the project running on your local machine.

### 1. Clone the repository
```bash
git clone https://github.com/Keltoummalouki/LocalQ.git
cd LocalQ