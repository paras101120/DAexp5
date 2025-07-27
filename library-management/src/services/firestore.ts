import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { Book, Student, BorrowRecord, DashboardStats } from '../types';

// Books Operations
export const booksService = {
  async getAll(): Promise<Book[]> {
    const querySnapshot = await getDocs(collection(db, 'books'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Book[];
  },

  async getById(id: string): Promise<Book | null> {
    const docSnap = await getDoc(doc(db, 'books', id));
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as Book;
    }
    return null;
  },

  async add(book: Omit<Book, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'books'), {
      ...book,
      availableQuantity: book.totalQuantity,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(id: string, book: Partial<Book>): Promise<void> {
    await updateDoc(doc(db, 'books', id), {
      ...book,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'books', id));
  },

  async search(searchTerm: string, category?: string): Promise<Book[]> {
    let q = query(collection(db, 'books'));
    
    if (category) {
      q = query(collection(db, 'books'), where('category', '==', category));
    }
    
    const querySnapshot = await getDocs(q);
    const books = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Book[];

    if (searchTerm) {
      return books.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)
      );
    }

    return books;
  }
};

// Students Operations
export const studentsService = {
  async getAll(): Promise<Student[]> {
    const querySnapshot = await getDocs(collection(db, 'students'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Student[];
  },

  async getById(id: string): Promise<Student | null> {
    const docSnap = await getDoc(doc(db, 'students', id));
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as Student;
    }
    return null;
  },

  async add(student: Omit<Student, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'students'), {
      ...student,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async update(id: string, student: Partial<Student>): Promise<void> {
    await updateDoc(doc(db, 'students', id), {
      ...student,
      updatedAt: Timestamp.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'students', id));
  },

  async search(searchTerm: string): Promise<Student[]> {
    const querySnapshot = await getDocs(collection(db, 'students'));
    const students = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Student[];

    if (searchTerm) {
      return students.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return students;
  }
};

// Borrow Records Operations
export const borrowRecordsService = {
  async getAll(): Promise<BorrowRecord[]> {
    const querySnapshot = await getDocs(query(collection(db, 'borrowRecords'), orderBy('borrowDate', 'desc')));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      borrowDate: doc.data().borrowDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      returnDate: doc.data().returnDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as BorrowRecord[];
  },

  async getByStudentId(studentId: string): Promise<BorrowRecord[]> {
    const q = query(
      collection(db, 'borrowRecords'),
      where('studentId', '==', studentId),
      orderBy('borrowDate', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      borrowDate: doc.data().borrowDate?.toDate(),
      dueDate: doc.data().dueDate?.toDate(),
      returnDate: doc.data().returnDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as BorrowRecord[];
  },

  async borrowBook(record: Omit<BorrowRecord, 'id' | 'isReturned' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const batch = writeBatch(db);
    
    // Add borrow record
    const borrowRef = doc(collection(db, 'borrowRecords'));
    batch.set(borrowRef, {
      ...record,
      borrowDate: Timestamp.fromDate(record.borrowDate),
      dueDate: Timestamp.fromDate(record.dueDate),
      isReturned: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Update book availability
    const bookRef = doc(db, 'books', record.bookId);
    const bookSnap = await getDoc(bookRef);
    if (bookSnap.exists()) {
      const currentAvailable = bookSnap.data().availableQuantity;
      batch.update(bookRef, {
        availableQuantity: currentAvailable - 1,
        updatedAt: Timestamp.now(),
      });
    }

    await batch.commit();
    return borrowRef.id;
  },

  async returnBook(recordId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Get borrow record
    const recordRef = doc(db, 'borrowRecords', recordId);
    const recordSnap = await getDoc(recordRef);
    
    if (recordSnap.exists()) {
      const recordData = recordSnap.data();
      
      // Update borrow record
      batch.update(recordRef, {
        isReturned: true,
        returnDate: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Update book availability
      const bookRef = doc(db, 'books', recordData.bookId);
      const bookSnap = await getDoc(bookRef);
      if (bookSnap.exists()) {
        const currentAvailable = bookSnap.data().availableQuantity;
        batch.update(bookRef, {
          availableQuantity: currentAvailable + 1,
          updatedAt: Timestamp.now(),
        });
      }
    }

    await batch.commit();
  }
};

// Dashboard Statistics
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [booksSnapshot, studentsSnapshot, borrowRecordsSnapshot] = await Promise.all([
      getDocs(collection(db, 'books')),
      getDocs(collection(db, 'students')),
      getDocs(collection(db, 'borrowRecords'))
    ]);

    const books = booksSnapshot.docs.map(doc => doc.data() as Book);
    const borrowRecords = borrowRecordsSnapshot.docs.map(doc => doc.data() as BorrowRecord);

    const totalBooks = books.reduce((sum, book) => sum + book.totalQuantity, 0);
    const totalBorrowed = borrowRecords.filter(record => !record.isReturned).length;
    const totalReturned = borrowRecords.filter(record => record.isReturned).length;
    const totalStudents = studentsSnapshot.size;
    
    // Count students who have borrowed books
    const studentIdsWithBorrows = new Set(borrowRecords.map(record => record.studentId));
    const activeStudents = studentIdsWithBorrows.size;

    return {
      totalBooks,
      totalBorrowed,
      totalReturned,
      totalStudents,
      activeStudents
    };
  }
};