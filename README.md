# Course Selling App

This project is a full-stack course selling application built using the MERN stack (MongoDB, Express, React, Node.js). It allows users to browse, purchase, and manage courses while providing admins the ability to manage course content, user accounts, and purchases.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Features:**
  - User authentication (Register/Login)
  - Browse available courses
  - Purchase courses
  - View enrolled courses
  - Track course progress

- **Admin Features:**
  - Manage users (View, Update, Delete)
  - Add, update, and remove courses
  - Track sales and user engagement

- **Payment Integration:**
  - Payment gateway integration (e.g., Stripe, PayPal)

- **Responsive Design:**
  - Fully responsive and optimized for various screen sizes.

## Installation

### Prerequisites
- Node.js and npm installed
- MongoDB installed and running locally or use MongoDB Atlas
- A payment gateway API key (e.g., Stripe)

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/course-selling-app.git
   cd course-selling-app/backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file and add the following variables:

   ```bash
   MONGO_URI=<your_mongo_uri>
   JWT_SECRET=<your_jwt_secret>
   RAZORPAY_SECRET_KEY=<your_stripe_key>
   ```

4. Start the backend server:

   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the `client` folder:

   ```bash
   cd ../client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the React development server:

   ```bash
   npm start
   ```

4. Visit the app at `http://localhost:3000`.

## Tech Stack

- **Frontend:**
  - React.js
  - Redux (for state management)
  - Tailwind CSS / Material UI / Bootstrap (for styling)
  
- **Backend:**
  - Node.js
  - Express.js
  
- **Database:**
  - MongoDB

- **Authentication:**
  - JWT (JSON Web Tokens)

- **Payment:**
  - Razorpay API

## Project Structure

```
course-selling-app/
│
├── backend/
│   ├── config/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── App.js
│   └── index.js
│
└── README.md
```

## API Endpoints

### User Authentication

- **POST** `/api/users/register` – Register a new user
- **POST** `/api/users/login` – Login a user
- **GET** `/api/users/me` – Get logged-in user profile

### Course Management

- **GET** `/api/courses` – Get all courses
- **POST** `/api/courses` – Add a new course (Admin only)
- **PUT** `/api/courses/:id` – Update course (Admin only)
- **DELETE** `/api/courses/:id` – Delete course (Admin only)

### Purchase & Payment

- **POST** `/api/payment/checkout` – Process a payment
- **GET** `/api/orders` – Get user’s orders and purchased courses

## Contributing

Feel free to open issues or submit pull requests for bug fixes, feature requests, or other improvements.

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m 'Add some feature'`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
