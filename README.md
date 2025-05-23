# Book GraphQL API

Sebuah API GraphQL yang menyediakan data tentang buku, penulis, dan genre. Dibuat dengan FastAPI dan Ariadne.

## Fitur

- **Mendapatkan data** tentang buku, penulis, dan genre
- **Membuat, memperbarui, dan menghapus** data 
- **Mencari relasi** antar data (contoh: buku dari penulis tertentu atau buku dalam genre tertentu)

## Persyaratan

- Python 3.8+
- Dependencies: FastAPI, Uvicorn, Ariadne

## Instalasi

1. Clone repository ini
2. Buat virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install fastapi uvicorn ariadne
   ```

## Menjalankan API

1. Inisialisasi database:
   ```
   python database.py
   ```

2. Isi database dengan data sampel (opsional):
   ```
   python seed.py
   ```

3. Jalankan server:
   ```
   python main.py
   ```

4. Buka browser dan akses http://localhost:8000/graphql untuk antarmuka GraphQL

## Contoh Query GraphQL

### 1. Mendapatkan semua buku:
```graphql
query {
  allBooks {
    id
    title
    publicationYear
    pageCount
    author {
      name
    }
    genres {
      name
    }
  }
}
```

### 2. Mendapatkan buku berdasarkan ID:
```graphql
query {
  book(id: "1") {
    id
    title
    publicationYear
    pageCount
    author {
      name
      nationality
    }
    genres {
      name
    }
  }
}
```

### 3. Mendapatkan semua penulis:
```graphql
query {
  allAuthors {
    id
    name
    birthYear
    nationality
    books {
      title
    }
  }
}
```

### 4. Mendapatkan penulis berdasarkan ID:
```graphql
query {
  author(id: "1") {
    id
    name
    birthYear
    nationality
    books {
      title
      publicationYear
    }
  }
}
```

### 5. Mendapatkan semua genre:
```graphql
query {
  allGenres {
    id
    name
    description
    books {
      title
    }
  }
}
```

## Contoh Mutation GraphQL

### 1. Membuat buku baru:
```graphql
mutation {
  createBook(
    title: "New Sample Book"
    publicationYear: 2024
    pageCount: 300
    authorId: "1"
  ) {
    id
    title
    publicationYear
    author {
      name
    }
  }
}
```

### 2. Memperbarui buku:
```graphql
mutation {
  updateBook(
    id: "1"
    title: "Updated Title"
    publicationYear: 2025
  ) {
    id
    title
    publicationYear
  }
}
```

### 3. Menghapus buku:
```graphql
mutation {
  deleteBook(id: "10")
}
```

### 4. Membuat penulis baru:
```graphql
mutation {
  createAuthor(
    name: "New Author"
    birthYear: 1990
    nationality: "Indonesia"
  ) {
    id
    name
    birthYear
    nationality
  }
}
```

### 5. Menambahkan genre ke buku:
```graphql
mutation {
  addGenreToBook(
    bookId: "1"
    genreId: "2"
  )
}
```

### 6. Menghapus genre dari buku:
```graphql
mutation {
  removeGenreFromBook(
    bookId: "1"
    genreId: "2"
  )
}
```

### 7. Menghapus penulis:
```graphql
mutation {
  deleteAuthor(id: "1")
}
```

### 8. Memperbarui penulis:
```graphql
mutation {
  updateAuthor(
    id: "2"
    name: "Andrea Hirata Updated"
    birthYear: 1967
    nationality: "Indonesia"
  ) {
    id
    name
    birthYear
    nationality
  }
}
```

### 9. Memperbarui genre:
```graphql
mutation {
  updateGenre(
    id: "1"
    name: "Fiksi Modern"
    description: "Karya sastra berbasis imajinasi dengan pendekatan kontemporer"
  ) {
    id
    name
    description
  }
}

