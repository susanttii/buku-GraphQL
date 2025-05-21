from ariadne import QueryType, MutationType, ObjectType
from database import get_db_connection
import sqlite3

query = QueryType()
mutation = MutationType()
book_type = ObjectType("Book")
author_type = ObjectType("Author")
genre_type = ObjectType("Genre")

# Query Resolvers
@query.field("allBooks")
def resolve_all_books(*_):
    conn = get_db_connection()
    books = conn.execute("SELECT id, title, publication_year, page_count, author_id FROM books").fetchall()
    conn.close()
    return [dict(book) for book in books]

@query.field("book")
def resolve_book(_, info, id):
    conn = get_db_connection()
    book = conn.execute(
        "SELECT id, title, publication_year, page_count, author_id FROM books WHERE id = ?", (id,)
    ).fetchone()
    conn.close()
    return dict(book) if book else None

@query.field("allAuthors")
def resolve_all_authors(*_):
    conn = get_db_connection()
    authors = conn.execute("SELECT id, name, birth_year, nationality FROM authors").fetchall()
    conn.close()
    return [dict(author) for author in authors]

@query.field("author")
def resolve_author(_, info, id):
    conn = get_db_connection()
    author = conn.execute(
        "SELECT id, name, birth_year, nationality FROM authors WHERE id = ?", (id,)
    ).fetchone()
    conn.close()
    return dict(author) if author else None

@query.field("allGenres")
def resolve_all_genres(*_):
    conn = get_db_connection()
    genres = conn.execute("SELECT id, name, description FROM genres").fetchall()
    conn.close()
    return [dict(genre) for genre in genres]

@query.field("genre")
def resolve_genre(_, info, id):
    conn = get_db_connection()
    genre = conn.execute(
        "SELECT id, name, description FROM genres WHERE id = ?", (id,)
    ).fetchone()
    conn.close()
    return dict(genre) if genre else None

# Type Resolvers
@book_type.field("author")
def resolve_book_author(book, info):
    if not book.get("author_id"):
        return None
    
    conn = get_db_connection()
    author = conn.execute(
        "SELECT id, name, birth_year, nationality FROM authors WHERE id = ?",
        (book["author_id"],)
    ).fetchone()
    conn.close()
    return dict(author) if author else None

@book_type.field("genres")
def resolve_book_genres(book, info):
    conn = get_db_connection()
    genres = conn.execute(
        """SELECT g.id, g.name, g.description FROM genres g
        JOIN book_genres bg ON g.id = bg.genre_id
        WHERE bg.book_id = ?""",
        (book["id"],)
    ).fetchall()
    conn.close()
    return [dict(genre) for genre in genres]

@author_type.field("books")
def resolve_author_books(author, info):
    conn = get_db_connection()
    books = conn.execute(
        """SELECT id, title, publication_year, page_count, author_id 
        FROM books WHERE author_id = ?""",
        (author["id"],)
    ).fetchall()
    conn.close()
    return [dict(book) for book in books]

@genre_type.field("books")
def resolve_genre_books(genre, info):
    conn = get_db_connection()
    books = conn.execute(
        """SELECT b.id, b.title, b.publication_year, b.page_count, b.author_id 
        FROM books b
        JOIN book_genres bg ON b.id = bg.book_id
        WHERE bg.genre_id = ?""",
        (genre["id"],)
    ).fetchall()
    conn.close()
    return [dict(book) for book in books]

# Mutation Resolvers
@mutation.field("createBook")
def resolve_create_book(_, info, title, publicationYear=None, pageCount=None, authorId=None):
    conn = get_db_connection()
    try:
        c = conn.cursor()
        c.execute(
            """INSERT INTO books (title, publication_year, page_count, author_id) 
            VALUES (?, ?, ?, ?)""",
            (title, publicationYear, pageCount, authorId)
        )
        book_id = c.lastrowid
        conn.commit()
        
        book = {
            "id": book_id,
            "title": title,
            "publication_year": publicationYear,
            "page_count": pageCount,
            "author_id": authorId
        }
        return book
    except sqlite3.Error as e:
        conn.rollback()
        raise Exception(f"Database error: {e}")
    finally:
        conn.close()

@mutation.field("updateBook")
def resolve_update_book(_, info, id, title=None, publicationYear=None, pageCount=None, authorId=None):
    conn = get_db_connection()
    try:
        c = conn.cursor()
        # Get current book data
        book = c.execute("SELECT * FROM books WHERE id = ?", (id,)).fetchone()
        if not book:
            conn.close()
            return None
            
        book_dict = dict(book)
        
        # Update with new values if provided
        updates = {}
        if title is not None:
            updates["title"] = title
        if publicationYear is not None:
            updates["publication_year"] = publicationYear
        if pageCount is not None:
            updates["page_count"] = pageCount
        if authorId is not None:
            updates["author_id"] = authorId
            
        if not updates:
            conn.close()
            return book_dict
            
        # Construct update query
        update_fields = ", ".join([f"{key} = ?" for key in updates.keys()])
        query = f"UPDATE books SET {update_fields} WHERE id = ?"
        
        # Execute update
        c.execute(query, list(updates.values()) + [id])
        conn.commit()
        
        # Return updated book
        updated_book = c.execute("SELECT * FROM books WHERE id = ?", (id,)).fetchone()
        conn.close()
        return dict(updated_book)
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        raise Exception(f"Database error: {e}")

@mutation.field("deleteBook")
def resolve_delete_book(_, info, id):
    conn = get_db_connection()
    try:
        c = conn.cursor()
        # Check if book exists
        book = c.execute("SELECT id FROM books WHERE id = ?", (id,)).fetchone()
        if not book:
            conn.close()
            return False
            
        # Delete related entries in book_genres
        c.execute("DELETE FROM book_genres WHERE book_id = ?", (id,))
        
        # Delete the book
        c.execute("DELETE FROM books WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error:
        conn.rollback()
        conn.close()
        return False

@mutation.field("createAuthor")
def resolve_create_author(_, info, name, birthYear=None, nationality=None):
    conn = get_db_connection()
    try:
        c = conn.cursor()
        c.execute(
            "INSERT INTO authors (name, birth_year, nationality) VALUES (?, ?, ?)",
            (name, birthYear, nationality)
        )
        author_id = c.lastrowid
        conn.commit()
        
        author = {
            "id": author_id,
            "name": name,
            "birth_year": birthYear,
            "nationality": nationality
        }
        return author
    except sqlite3.Error as e:
        conn.rollback()
        raise Exception(f"Database error: {e}")
    finally:
        conn.close()

@mutation.field("updateAuthor")
def resolve_update_author(_, info, id, name=None, birthYear=None, nationality=None):
    conn = get_db_connection()
    try:
        c = conn.cursor()
        # Get current author data
        author = c.execute("SELECT * FROM authors WHERE id = ?", (id,)).fetchone()
        if not author:
            conn.close()
            return None
            
        author_dict = dict(author)
        
        # Update with new values if provided
        updates = {}
        if name is not None:
            updates["name"] = name
        if birthYear is not None:
            updates["birth_year"] = birthYear
        if nationality is not None:
            updates["nationality"] = nationality
            
        if not updates:
            conn.close()
            return author_dict
            
        # Construct update query
        update_fields = ", ".join([f"{key} = ?" for key in updates.keys()])
        query = f"UPDATE authors SET {update_fields} WHERE id = ?"
        
        # Execute update
        c.execute(query, list(updates.values()) + [id])
        conn.commit()
        
        # Return updated author
        updated_author = c.execute("SELECT * FROM authors WHERE id = ?", (id,)).fetchone()
        conn.close()
        return dict(updated_author)
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        raise Exception(f"Database error: {e}")

@mutation.field("deleteAuthor")
def resolve_delete_author(_, info, id):
    conn = get_db_connection()
    try:
        c = conn.cursor()
        # Check if author exists
        author = c.execute("SELECT id FROM authors WHERE id = ?", (id,)).fetchone()
        if not author:
            conn.close()
            return False
            
        # Update books to remove author reference
        c.execute("UPDATE books SET author_id = NULL WHERE author_id = ?", (id,))
        
        # Delete the author
        c.execute("DELETE FROM authors WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error:
        conn.rollback()
        conn.close()
        return False

@mutation.field("createGenre")
def resolve_create_genre(_, info, name, description=None):
    conn = get_db_connection()
    try:
        c = conn.cursor()
        c.execute(
            "INSERT INTO genres (name, description) VALUES (?, ?)",
            (name, description)
        )
        genre_id = c.lastrowid
        conn.commit()
        
        genre = {
            "id": genre_id,
            "name": name,
            "description": description
        }
        return genre
    except sqlite3.Error as e:
        conn.rollback()
        raise Exception(f"Database error: {e}")
    finally:
        conn.close()

@mutation.field("updateGenre")
def resolve_update_genre(_, info, id, name=None, description=None):
    conn = get_db_connection()
    try:
        c = conn.cursor()
        # Get current genre data
        genre = c.execute("SELECT * FROM genres WHERE id = ?", (id,)).fetchone()
        if not genre:
            conn.close()
            return None
            
        genre_dict = dict(genre)
        
        # Update with new values if provided
        updates = {}
        if name is not None:
            updates["name"] = name
        if description is not None:
            updates["description"] = description
            
        if not updates:
            conn.close()
            return genre_dict
            
        # Construct update query
        update_fields = ", ".join([f"{key} = ?" for key in updates.keys()])
        query = f"UPDATE genres SET {update_fields} WHERE id = ?"
        
        # Execute update
        c.execute(query, list(updates.values()) + [id])
        conn.commit()
        
        # Return updated genre
        updated_genre = c.execute("SELECT * FROM genres WHERE id = ?", (id,)).fetchone()
        conn.close()
        return dict(updated_genre)
    except sqlite3.Error as e:
        conn.rollback()
        conn.close()
        raise Exception(f"Database error: {e}")

@mutation.field("deleteGenre")
def resolve_delete_genre(_, info, id):
    conn = get_db_connection()
    try:
        c = conn.cursor()
        # Check if genre exists
        genre = c.execute("SELECT id FROM genres WHERE id = ?", (id,)).fetchone()
        if not genre:
            conn.close()
            return False
            
        # Delete related entries in book_genres
        c.execute("DELETE FROM book_genres WHERE genre_id = ?", (id,))
        
        # Delete the genre
        c.execute("DELETE FROM genres WHERE id = ?", (id,))
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error:
        conn.rollback()
        conn.close()
        return False

@mutation.field("addGenreToBook")
def resolve_add_genre_to_book(_, info, bookId, genreId):
    conn = get_db_connection()
    try:
        c = conn.cursor()
        # Check if book and genre exist
        book = c.execute("SELECT id FROM books WHERE id = ?", (bookId,)).fetchone()
        genre = c.execute("SELECT id FROM genres WHERE id = ?", (genreId,)).fetchone()
        
        if not book or not genre:
            conn.close()
            return False
            
        # Check if relationship already exists
        existing = c.execute(
            "SELECT 1 FROM book_genres WHERE book_id = ? AND genre_id = ?",
            (bookId, genreId)
        ).fetchone()
        
        if existing:
            conn.close()
            return True  # Already exists, consider it a success
            
        # Add relationship
        c.execute(
            "INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)",
            (bookId, genreId)
        )
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error:
        conn.rollback()
        conn.close()
        return False

@mutation.field("removeGenreFromBook")
def resolve_remove_genre_from_book(_, info, bookId, genreId):
    conn = get_db_connection()
    try:
        c = conn.cursor()
        c.execute(
            "DELETE FROM book_genres WHERE book_id = ? AND genre_id = ?",
            (bookId, genreId)
        )
        conn.commit()
        conn.close()
        return True
    except sqlite3.Error:
        conn.rollback()
        conn.close()
        return False
