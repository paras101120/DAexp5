export interface Book {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Student {
  id?: string;
  name: string;
  rollNumber: string;
  email: string;
  course: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BorrowRecord {
  id?: string;
  studentId: string;
  studentName: string;
  studentRollNumber: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  isReturned: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DashboardStats {
  totalBooks: number;
  totalBorrowed: number;
  totalReturned: number;
  totalStudents: number;
  activeStudents: number;
}

export interface User {
  uid: string;
  email: string;
  isAdmin: boolean;
}