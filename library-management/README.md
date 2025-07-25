# Library Management System

A comprehensive library management system built with React, TypeScript, Firebase, and Tailwind CSS. This admin-only application provides complete book and student management capabilities with a modern, responsive interface.

## Features

### 🔐 Admin Authentication
- **Firebase Authentication**: Secure login system for administrators only
- **Admin Verification**: Only users in the `admins` collection can access the system
- **Session Management**: Persistent login sessions with automatic logout

### 📊 Dashboard Overview
- **Real-time Statistics**: Total books, borrowed books, returned books, and student counts
- **Interactive Charts**: Visual representation of library data using Chart.js
- **Quick Insights**: Book availability percentages and active student metrics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### 📚 Book Management
- **Complete CRUD Operations**: Add, edit, delete, and view books
- **Advanced Search**: Search by title, author, ISBN, or category
- **Category Filtering**: Filter books by predefined categories
- **Availability Tracking**: Real-time availability status with quantity management
- **Book Details**: Store title, author, ISBN, category, and total quantity

### 👥 Student Management
- **Student Records**: Manage student information (name, roll number, email, course)
- **Search Functionality**: Quick search across all student fields
- **Borrow History**: View complete borrowing history for each student
- **Course Management**: Track students by their enrolled courses

### 📖 Book Allotment
- **Smart Search**: Search and select books and students with auto-suggestions
- **Availability Check**: Prevents allotment of out-of-stock books
- **Date Management**: Set borrow and return dates with validation
- **Automatic Updates**: Updates book availability and creates borrow records
- **User-friendly Interface**: Intuitive selection process with visual feedback

### 🔄 Book Returns
- **Return Processing**: Mark books as returned with one click
- **Overdue Tracking**: Identify and track overdue books
- **Status Filtering**: Filter by borrowed, overdue, or all records
- **Automatic Updates**: Increases book availability upon return
- **Return History**: Complete audit trail of all transactions

### 🎨 Modern UI/UX
- **Tailwind CSS**: Beautiful, responsive design system
- **Lucide Icons**: Consistent iconography throughout the application
- **Loading States**: Smooth loading animations and feedback
- **Error Handling**: Comprehensive error messages and validation
- **Mobile Responsive**: Optimized for all screen sizes

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React
- **Build Tool**: Create React App

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Firebase project with Authentication and Firestore enabled

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd library-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore Database
3. Get your Firebase configuration from Project Settings
4. Update `src/firebase.ts` with your configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 4. Set Up Admin Users

1. In your Firebase console, go to Firestore Database
2. Create a collection called `admins`
3. Add documents with the admin user IDs as document IDs
4. Example structure:
```
admins/
  ├── user-uid-1/
  │   └── { email: "admin@example.com", role: "admin" }
  └── user-uid-2/
      └── { email: "admin2@example.com", role: "admin" }
```

### 5. Configure Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated admins can read/write
    match /{document=**} {
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
  }
}
```

### 6. Start the Development Server
```bash
npm start
```

The application will open at `http://localhost:3000`

## Usage Guide

### Initial Setup
1. Create admin users in Firebase Authentication
2. Add their UIDs to the `admins` collection in Firestore
3. Admin users can now log in to access the system

### Managing Books
1. Navigate to **Books** section
2. Click **Add Book** to add new books
3. Use search and filters to find specific books
4. Edit or delete books using the action buttons
5. Monitor availability status in real-time

### Managing Students
1. Go to **Students** section
2. Add student records with complete information
3. View borrow history by clicking the book icon
4. Search students by any field
5. Edit or remove student records as needed

### Book Allotment Process
1. Access **Allotment** section
2. Search and select a book (only available books can be selected)
3. Search and select a student
4. Set borrow date (defaults to today)
5. Set return date (defaults to 14 days from borrow date)
6. Click **Allot Book** to complete the process

### Processing Returns
1. Open **Returns** section
2. Use filters to find specific records (borrowed, overdue, etc.)
3. Search by book title, author, or student details
4. Click **Mark as Returned** for returned books
5. System automatically updates availability

### Dashboard Insights
- Monitor library statistics at a glance
- View charts showing book availability and borrowing patterns
- Track active students and return rates
- Use data to make informed library management decisions

## Data Structure

### Books Collection
```typescript
{
  title: string
  author: string
  isbn: string
  category: string
  totalQuantity: number
  availableQuantity: number
  createdAt: Date
  updatedAt: Date
}
```

### Students Collection
```typescript
{
  name: string
  rollNumber: string
  email: string
  course: string
  createdAt: Date
  updatedAt: Date
}
```

### Borrow Records Collection
```typescript
{
  studentId: string
  studentName: string
  studentRollNumber: string
  bookId: string
  bookTitle: string
  bookAuthor: string
  borrowDate: Date
  dueDate: Date
  returnDate?: Date
  isReturned: boolean
  createdAt: Date
  updatedAt: Date
}
```

## Security Features

- **Admin-only Access**: Only verified admins can access the system
- **Secure Authentication**: Firebase Authentication with session management
- **Data Validation**: Client-side and server-side validation
- **Firestore Rules**: Database-level security rules
- **Error Handling**: Comprehensive error management and user feedback

## Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full-featured interface with sidebar navigation
- **Tablet**: Adapted layout with collapsible navigation
- **Mobile**: Touch-optimized interface with drawer navigation

## Performance Features

- **Lazy Loading**: Components loaded on demand
- **Optimized Queries**: Efficient Firestore queries with indexes
- **Caching**: Firebase automatic caching for better performance
- **Loading States**: Smooth user experience with loading indicators

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## Support

For support or questions:
- Create an issue in the repository
- Check the documentation for common solutions
- Review Firebase documentation for backend-related issues

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using React, TypeScript, Firebase, and Tailwind CSS**
