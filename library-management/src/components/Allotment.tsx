import React, { useState, useEffect } from 'react';
import { Search, Calendar, BookOpen, User, AlertCircle, Check } from 'lucide-react';
import { booksService, studentsService, borrowRecordsService } from '../services/firestore';
import { Book, Student } from '../types';

export default function Allotment() {
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [studentSearchResults, setStudentSearchResults] = useState<Student[]>([]);
  const [bookSearch, setBookSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [borrowDate, setBorrowDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
    // Set default return date to 14 days from today
    const defaultReturnDate = new Date();
    defaultReturnDate.setDate(defaultReturnDate.getDate() + 14);
    setReturnDate(defaultReturnDate.toISOString().split('T')[0]);
  }, []);

  async function loadData() {
    try {
      const [booksData, studentsData] = await Promise.all([
        booksService.getAll(),
        studentsService.getAll()
      ]);
      setBooks(booksData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  function handleBookSearch() {
    if (bookSearch.trim() === '') {
      setSearchResults([]);
      return;
    }

    const results = books.filter(book => 
      book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.isbn.includes(bookSearch)
    );
    setSearchResults(results);
  }

  function handleStudentSearch() {
    if (studentSearch.trim() === '') {
      setStudentSearchResults([]);
      return;
    }

    const results = students.filter(student => 
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearch.toLowerCase())
    );
    setStudentSearchResults(results);
  }

  function selectBook(book: Book) {
    setSelectedBook(book);
    setBookSearch(book.title);
    setSearchResults([]);
  }

  function selectStudent(student: Student) {
    setSelectedStudent(student);
    setStudentSearch(student.name);
    setStudentSearchResults([]);
  }

  async function handleAllotment(e: React.FormEvent) {
    e.preventDefault();
    
    if (!selectedBook || !selectedStudent) {
      setMessage({ type: 'error', text: 'Please select both a book and a student.' });
      return;
    }

    if (selectedBook.availableQuantity <= 0) {
      setMessage({ type: 'error', text: 'This book is currently out of stock.' });
      return;
    }

    const borrowDateObj = new Date(borrowDate);
    const returnDateObj = new Date(returnDate);

    if (returnDateObj <= borrowDateObj) {
      setMessage({ type: 'error', text: 'Return date must be after borrow date.' });
      return;
    }

    try {
      setLoading(true);
      
      await borrowRecordsService.borrowBook({
        studentId: selectedStudent.id!,
        studentName: selectedStudent.name,
        studentRollNumber: selectedStudent.rollNumber,
        bookId: selectedBook.id!,
        bookTitle: selectedBook.title,
        bookAuthor: selectedBook.author,
        borrowDate: borrowDateObj,
        dueDate: returnDateObj
      });

      setMessage({ 
        type: 'success', 
        text: `Book "${selectedBook.title}" has been successfully allotted to ${selectedStudent.name}.` 
      });

      // Reset form
      setSelectedBook(null);
      setSelectedStudent(null);
      setBookSearch('');
      setStudentSearch('');
      setBorrowDate(new Date().toISOString().split('T')[0]);
      const defaultReturnDate = new Date();
      defaultReturnDate.setDate(defaultReturnDate.getDate() + 14);
      setReturnDate(defaultReturnDate.toISOString().split('T')[0]);

      // Reload data to update availability
      loadData();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error allotting book. Please try again.' });
      console.error('Error allotting book:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (message) {
        setMessage(null);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Book Allotment</h1>
      </div>

      {message && (
        <div className={`p-4 rounded-md border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700' 
            : 'bg-red-50 border-red-200 text-red-700'
        } flex items-center`}>
          {message.type === 'success' ? (
            <Check className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <form onSubmit={handleAllotment} className="space-y-6">
          {/* Book Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="inline h-4 w-4 mr-1" />
              Select Book
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={bookSearch}
                onChange={(e) => {
                  setBookSearch(e.target.value);
                  handleBookSearch();
                }}
                placeholder="Search books by title, author, or ISBN..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            {/* Book Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white">
                {searchResults.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => selectBook(book)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                        <div className="text-sm text-gray-500">by {book.author}</div>
                        <div className="text-xs text-gray-400">ISBN: {book.isbn}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          book.availableQuantity > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {book.availableQuantity > 0 
                            ? `${book.availableQuantity} available` 
                            : 'Out of stock'
                          }
                        </div>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {book.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Book Display */}
            {selectedBook && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-900">{selectedBook.title}</div>
                    <div className="text-sm text-blue-700">by {selectedBook.author}</div>
                  </div>
                  <div className="text-sm text-blue-700">
                    Available: {selectedBook.availableQuantity}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Select Student
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  handleStudentSearch();
                }}
                placeholder="Search students by name, roll number, or email..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            {/* Student Search Results */}
            {studentSearchResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md bg-white">
                {studentSearchResults.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => selectStudent(student)}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">Roll: {student.rollNumber}</div>
                        <div className="text-xs text-gray-400">{student.email}</div>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {student.course}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Student Display */}
            {selectedStudent && (
              <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-purple-900">{selectedStudent.name}</div>
                    <div className="text-sm text-purple-700">Roll: {selectedStudent.rollNumber}</div>
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {selectedStudent.course}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Borrow Date
              </label>
              <input
                type="date"
                value={borrowDate}
                onChange={(e) => setBorrowDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !selectedBook || !selectedStudent || selectedBook.availableQuantity <= 0}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Allot Book
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Instructions:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Search and select a book that has available copies</li>
          <li>• Search and select a student to allot the book to</li>
          <li>• Set the borrow date and expected return date</li>
          <li>• The book's available quantity will be automatically reduced</li>
          <li>• Students can be tracked through the borrow records</li>
        </ul>
      </div>
    </div>
  );
}