import sqlite3
import os

DB_NAME = "books.db"

def get_db_connection():
    """Membuat koneksi ke database SQLite."""
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Menginisialisasi database dengan tabel yang dibutuhkan."""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Tabel books (buku)
    c.execute("""
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT UNIQUE NOT NULL,
            publication_year INTEGER,
            page_count INTEGER,
            author_id INTEGER,
            FOREIGN KEY (author_id) REFERENCES authors (id)
        )
    """)
    
    # Tabel authors (penulis)
    c.execute("""
        CREATE TABLE IF NOT EXISTS authors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            birth_year INTEGER,
            nationality TEXT
        )
    """)
    
    # Tabel genres (genre buku)
    c.execute("""
        CREATE TABLE IF NOT EXISTS genres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT
        )
    """)
    
    # Tabel book_genres (hubungan many-to-many antara buku dan genre)
    c.execute("""
        CREATE TABLE IF NOT EXISTS book_genres (
            book_id INTEGER,
            genre_id INTEGER,
            PRIMARY KEY (book_id, genre_id),
            FOREIGN KEY (book_id) REFERENCES books (id),
            FOREIGN KEY (genre_id) REFERENCES genres (id)
        )
    """)
    
    conn.commit()
    conn.close()
    print("Tabel database buku berhasil dibuat.")
    print("Database berhasil diinisialisasi.")

if __name__ == "__main__":
    init_db()
