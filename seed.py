import sqlite3
from database import get_db_connection

def seed_database():
    """Mengisi database dengan data buku."""
    conn = get_db_connection()
    c = conn.cursor()
    
    # Clear existing data
    c.execute("DELETE FROM book_genres")
    c.execute("DELETE FROM books")
    c.execute("DELETE FROM authors")
    c.execute("DELETE FROM genres")
    
    # Reset autoincrement
    c.execute("DELETE FROM sqlite_sequence WHERE name IN ('books', 'authors', 'genres')")
    
    # Seed authors
    authors = [
        ("J.K. Rowling", 1965, "Inggris"),
        ("Andrea Hirata", 1967, "Indonesia"),
        ("Pramoedya Ananta Toer", 1925, "Indonesia"),
        ("J.R.R. Tolkien", 1892, "Inggris"),
        ("George Orwell", 1903, "Inggris"),
        ("Tere Liye", 1979, "Indonesia"),
        ("Harper Lee", 1926, "Amerika"),
        ("Dee Lestari", 1976, "Indonesia"),
        ("Ernest Hemingway", 1899, "Amerika"),
        ("Agatha Christie", 1890, "Inggris")
    ]
    
    for author in authors:
        c.execute("INSERT INTO authors (name, birth_year, nationality) VALUES (?, ?, ?)", author)
    
    # Seed genres
    genres = [
        ("Fiksi", "Karya sastra berbasis imajinasi"),
        ("Fantasi", "Cerita dengan unsur magis atau supernatural"),
        ("Misteri", "Cerita dengan teka-teki yang harus dipecahkan"),
        ("Petualangan", "Cerita tentang perjalanan dan pengalaman menarik"),
        ("Sejarah", "Karya yang berlatar belakang sejarah"),
        ("Romansa", "Cerita tentang hubungan romantis"),
        ("Sains Fiksi", "Cerita dengan unsur teknologi dan masa depan"),
        ("Horor", "Cerita yang menimbulkan rasa takut atau teror"),
        ("Biografi", "Cerita tentang kehidupan seseorang"),
        ("Pendidikan", "Buku dengan tujuan mendidik")
    ]
    
    for genre in genres:
        c.execute("INSERT INTO genres (name, description) VALUES (?, ?)", genre)
    
    # Seed books
    books = [
        ("Harry Potter dan Batu Bertuah", 1997, 320, 1),          # J.K. Rowling
        ("Laskar Pelangi", 2005, 529, 2),                         # Andrea Hirata
        ("Bumi Manusia", 1980, 535, 3),                           # Pramoedya
        ("The Hobbit", 1937, 310, 4),                             # Tolkien
        ("1984", 1949, 328, 5),                                   # Orwell
        ("Bintang", 2017, 392, 6),                                # Tere Liye
        ("To Kill a Mockingbird", 1960, 281, 7),                  # Harper Lee
        ("Supernova: Kesatria, Putri, dan Bintang Jatuh", 2001, 336, 8), # Dee Lestari
        ("The Old Man and the Sea", 1952, 127, 9),                # Hemingway
        ("Murder on the Orient Express", 1934, 256, 10)           # Christie
    ]
    
    for book in books:
        c.execute("INSERT INTO books (title, publication_year, page_count, author_id) VALUES (?, ?, ?, ?)", book)
    
    # Assign genres to books
    book_genres = [
        (1, 2),  # Harry Potter - Fantasi
        (1, 4),  # Harry Potter - Petualangan
        (2, 1),  # Laskar Pelangi - Fiksi
        (2, 10), # Laskar Pelangi - Pendidikan
        (3, 1),  # Bumi Manusia - Fiksi
        (3, 5),  # Bumi Manusia - Sejarah
        (4, 2),  # The Hobbit - Fantasi
        (4, 4),  # The Hobbit - Petualangan
        (5, 7),  # 1984 - Sains Fiksi
        (6, 2),  # Bintang - Fantasi
        (6, 4),  # Bintang - Petualangan
        (7, 1),  # To Kill a Mockingbird - Fiksi
        (8, 1),  # Supernova - Fiksi
        (8, 6),  # Supernova - Romansa
        (9, 1),  # The Old Man and the Sea - Fiksi
        (10, 3), # Murder on the Orient Express - Misteri
    ]
    
    for assignment in book_genres:
        c.execute("INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)", assignment)
    
    conn.commit()
    conn.close()
    print("Database berhasil diisi dengan data buku.")

if __name__ == "__main__":
    seed_database()
