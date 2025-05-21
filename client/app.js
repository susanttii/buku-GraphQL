document.addEventListener('DOMContentLoaded', () => {
    // GraphQL endpoint URL
    const GRAPHQL_URL = 'http://localhost:8000/graphql';
    
    // GraphQL client setup
    const client = new GraphQLClient.GraphQLClient(GRAPHQL_URL);

    // UI Elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.panel');
    const modal = document.getElementById('details-modal');
    const closeModal = document.querySelector('.close');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            const tabId = button.id.replace('tab-', '');
            document.getElementById(`${tabId}-panel`).classList.add('active');
        });
    });

    // Close modal when clicking on X
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal when clicking outside the modal
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Cancel buttons for forms
    document.querySelectorAll('.cancel').forEach(button => {
        button.addEventListener('click', (e) => {
            const formContainer = e.target.closest('.form-container');
            formContainer.style.display = 'none';
        });
    });

    // ===== BOOKS FUNCTIONALITY =====
    
    // Load books button
    document.getElementById('load-books').addEventListener('click', loadBooks);
    
    // Show add book form
    document.getElementById('add-book').addEventListener('click', () => {
        document.getElementById('add-book-form').style.display = 'block';
        populateAuthorsDropdown();
    });
    
    // Add book form submission
    document.getElementById('book-form').addEventListener('submit', (e) => {
        e.preventDefault();
        createBook();
    });
    
    // ===== AUTHORS FUNCTIONALITY =====
    
    // Load authors button
    document.getElementById('load-authors').addEventListener('click', loadAuthors);
    
    // Show add author form
    document.getElementById('add-author').addEventListener('click', () => {
        document.getElementById('add-author-form').style.display = 'block';
    });
    
    // Add author form submission
    document.getElementById('author-form').addEventListener('submit', (e) => {
        e.preventDefault();
        createAuthor();
    });
    
    // ===== GENRES FUNCTIONALITY =====
    
    // Load genres button
    document.getElementById('load-genres').addEventListener('click', loadGenres);
    
    // Show add genre form
    document.getElementById('add-genre').addEventListener('click', () => {
        document.getElementById('add-genre-form').style.display = 'block';
    });
    
    // Add genre form submission
    document.getElementById('genre-form').addEventListener('submit', (e) => {
        e.preventDefault();
        createGenre();
    });
    
    // ===== GraphQL QUERIES =====
    
    // Get all books
    async function loadBooks() {
        document.getElementById('books-list').innerHTML = '<p>Loading books...</p>';
        
        const query = `
            query {
                allBooks {
                    id
                    title
                    publicationYear
                    pageCount
                    author {
                        id
                        name
                    }
                    genres {
                        id
                        name
                    }
                }
            }
        `;
        
        try {
            const data = await client.request(query);
            displayBooks(data.allBooks);
        } catch (error) {
            console.error('Error loading books:', error);
            document.getElementById('books-list').innerHTML = 
                `<p class="error">Failed to load books: ${error.message || 'Unknown error'}</p>`;
        }
    }
    
    // Get all authors
    async function loadAuthors() {
        document.getElementById('authors-list').innerHTML = '<p>Loading authors...</p>';
        
        const query = `
            query {
                allAuthors {
                    id
                    name
                    birthYear
                    nationality
                    books {
                        id
                        title
                    }
                }
            }
        `;
        
        try {
            const data = await client.request(query);
            displayAuthors(data.allAuthors);
        } catch (error) {
            console.error('Error loading authors:', error);
            document.getElementById('authors-list').innerHTML = 
                `<p class="error">Failed to load authors: ${error.message || 'Unknown error'}</p>`;
        }
    }
    
    // Get all genres
    async function loadGenres() {
        document.getElementById('genres-list').innerHTML = '<p>Loading genres...</p>';
        
        const query = `
            query {
                allGenres {
                    id
                    name
                    description
                    books {
                        id
                        title
                    }
                }
            }
        `;
        
        try {
            const data = await client.request(query);
            displayGenres(data.allGenres);
        } catch (error) {
            console.error('Error loading genres:', error);
            document.getElementById('genres-list').innerHTML = 
                `<p class="error">Failed to load genres: ${error.message || 'Unknown error'}</p>`;
        }
    }
    
    // Get authors for dropdown
    async function populateAuthorsDropdown() {
        const query = `
            query {
                allAuthors {
                    id
                    name
                }
            }
        `;
        
        try {
            const data = await client.request(query);
            const dropdown = document.getElementById('book-author');
            
            // Clear existing options except the first one
            while (dropdown.options.length > 1) {
                dropdown.remove(1);
            }
            
            // Add options for each author
            data.allAuthors.forEach(author => {
                const option = document.createElement('option');
                option.value = author.id;
                option.textContent = author.name;
                dropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading authors for dropdown:', error);
        }
    }
    
    // ===== GraphQL MUTATIONS =====
    
    // Create a new book
    async function createBook() {
        const title = document.getElementById('book-title').value;
        const publicationYear = document.getElementById('book-publication-year').value || null;
        const pageCount = document.getElementById('book-page-count').value || null;
        const authorId = document.getElementById('book-author').value || null;
        
        const mutation = `
            mutation {
                createBook(
                    title: "${title}"
                    publicationYear: ${publicationYear}
                    pageCount: ${pageCount}
                    authorId: ${authorId ? `"${authorId}"` : null}
                ) {
                    id
                    title
                    publicationYear
                    pageCount
                    author {
                        id
                        name
                    }
                }
            }
        `;
        
        try {
            const data = await client.request(mutation);
            console.log('Book created:', data.createBook);
            
            // Hide the form
            document.getElementById('add-book-form').style.display = 'none';
            
            // Reset form fields
            document.getElementById('book-form').reset();
            
            // Reload books list
            loadBooks();
        } catch (error) {
            console.error('Error creating book:', error);
            alert(`Failed to create book: ${error.message || 'Unknown error'}`);
        }
    }
    
    // Create a new author
    async function createAuthor() {
        const name = document.getElementById('author-name').value;
        const birthYear = document.getElementById('author-birth-year').value || null;
        const nationality = document.getElementById('author-nationality').value || null;
        
        const mutation = `
            mutation {
                createAuthor(
                    name: "${name}"
                    birthYear: ${birthYear}
                    nationality: ${nationality ? `"${nationality}"` : null}
                ) {
                    id
                    name
                    birthYear
                    nationality
                }
            }
        `;
        
        try {
            const data = await client.request(mutation);
            console.log('Author created:', data.createAuthor);
            
            // Hide the form
            document.getElementById('add-author-form').style.display = 'none';
            
            // Reset form fields
            document.getElementById('author-form').reset();
            
            // Reload authors list
            loadAuthors();
        } catch (error) {
            console.error('Error creating author:', error);
            alert(`Failed to create author: ${error.message || 'Unknown error'}`);
        }
    }
    
    // Create a new genre
    async function createGenre() {
        const name = document.getElementById('genre-name').value;
        const description = document.getElementById('genre-description').value || null;
        
        const mutation = `
            mutation {
                createGenre(
                    name: "${name}"
                    description: ${description ? `"${description}"` : null}
                ) {
                    id
                    name
                    description
                }
            }
        `;
        
        try {
            const data = await client.request(mutation);
            console.log('Genre created:', data.createGenre);
            
            // Hide the form
            document.getElementById('add-genre-form').style.display = 'none';
            
            // Reset form fields
            document.getElementById('genre-form').reset();
            
            // Reload genres list
            loadGenres();
        } catch (error) {
            console.error('Error creating genre:', error);
            alert(`Failed to create genre: ${error.message || 'Unknown error'}`);
        }
    }
    
    // Delete a book
    async function deleteBook(id) {
        if (!confirm('Are you sure you want to delete this book?')) {
            return;
        }
        
        const mutation = `
            mutation {
                deleteBook(id: "${id}")
            }
        `;
        
        try {
            const data = await client.request(mutation);
            if (data.deleteBook) {
                console.log('Book deleted successfully');
                loadBooks();
            } else {
                console.error('Failed to delete book');
                alert('Failed to delete book');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            alert(`Failed to delete book: ${error.message || 'Unknown error'}`);
        }
    }
    
    // Delete an author
    async function deleteAuthor(id) {
        if (!confirm('Are you sure you want to delete this author? All their books will be affected.')) {
            return;
        }
        
        const mutation = `
            mutation {
                deleteAuthor(id: "${id}")
            }
        `;
        
        try {
            const data = await client.request(mutation);
            if (data.deleteAuthor) {
                console.log('Author deleted successfully');
                loadAuthors();
            } else {
                console.error('Failed to delete author');
                alert('Failed to delete author');
            }
        } catch (error) {
            console.error('Error deleting author:', error);
            alert(`Failed to delete author: ${error.message || 'Unknown error'}`);
        }
    }
    
    // Delete a genre
    async function deleteGenre(id) {
        if (!confirm('Are you sure you want to delete this genre?')) {
            return;
        }
        
        const mutation = `
            mutation {
                deleteGenre(id: "${id}")
            }
        `;
        
        try {
            const data = await client.request(mutation);
            if (data.deleteGenre) {
                console.log('Genre deleted successfully');
                loadGenres();
            } else {
                console.error('Failed to delete genre');
                alert('Failed to delete genre');
            }
        } catch (error) {
            console.error('Error deleting genre:', error);
            alert(`Failed to delete genre: ${error.message || 'Unknown error'}`);
        }
    }
    
    // Add genre to book
    async function addGenreToBook(bookId, genreId) {
        const mutation = `
            mutation {
                addGenreToBook(bookId: "${bookId}", genreId: "${genreId}")
            }
        `;
        
        try {
            const data = await client.request(mutation);
            if (data.addGenreToBook) {
                console.log('Genre added to book successfully');
                return true;
            } else {
                console.error('Failed to add genre to book');
                return false;
            }
        } catch (error) {
            console.error('Error adding genre to book:', error);
            return false;
        }
    }
    
    // Remove genre from book
    async function removeGenreFromBook(bookId, genreId) {
        const mutation = `
            mutation {
                removeGenreFromBook(bookId: "${bookId}", genreId: "${genreId}")
            }
        `;
        
        try {
            const data = await client.request(mutation);
            if (data.removeGenreFromBook) {
                console.log('Genre removed from book successfully');
                return true;
            } else {
                console.error('Failed to remove genre from book');
                return false;
            }
        } catch (error) {
            console.error('Error removing genre from book:', error);
            return false;
        }
    }
    
    // ===== DISPLAY FUNCTIONS =====
    
    // Display books in the UI
    function displayBooks(books) {
        const booksList = document.getElementById('books-list');
        
        if (!books || books.length === 0) {
            booksList.innerHTML = '<p>No books found</p>';
            return;
        }
        
        let html = '<div class="items-grid">';
        
        books.forEach(book => {
            html += `
                <div class="item-card">
                    <h3>${book.title}</h3>
                    <p><strong>Publication Year:</strong> ${book.publicationYear || 'Unknown'}</p>
                    <p><strong>Pages:</strong> ${book.pageCount || 'Unknown'}</p>
                    <p><strong>Author:</strong> ${book.author ? book.author.name : 'Unknown'}</p>
                    <div class="card-actions">
                        <button onclick="showBookDetails('${book.id}')">Details</button>
                        <button onclick="deleteBook('${book.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        booksList.innerHTML = html;
        
        // Add event handlers to buttons
        books.forEach(book => {
            document.querySelector(`[onclick="showBookDetails('${book.id}')"]`).onclick = () => showBookDetails(book.id);
            document.querySelector(`[onclick="deleteBook('${book.id}')"]`).onclick = () => deleteBook(book.id);
        });
    }
    
    // Display authors in the UI
    function displayAuthors(authors) {
        const authorsList = document.getElementById('authors-list');
        
        if (!authors || authors.length === 0) {
            authorsList.innerHTML = '<p>No authors found</p>';
            return;
        }
        
        let html = '<div class="items-grid">';
        
        authors.forEach(author => {
            html += `
                <div class="item-card">
                    <h3>${author.name}</h3>
                    <p><strong>Birth Year:</strong> ${author.birthYear || 'Unknown'}</p>
                    <p><strong>Nationality:</strong> ${author.nationality || 'Unknown'}</p>
                    <p><strong>Books:</strong> ${author.books ? author.books.length : 0}</p>
                    <div class="card-actions">
                        <button onclick="showAuthorDetails('${author.id}')">Details</button>
                        <button onclick="deleteAuthor('${author.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        authorsList.innerHTML = html;
        
        // Add event handlers to buttons
        authors.forEach(author => {
            document.querySelector(`[onclick="showAuthorDetails('${author.id}')"]`).onclick = () => showAuthorDetails(author.id);
            document.querySelector(`[onclick="deleteAuthor('${author.id}')"]`).onclick = () => deleteAuthor(author.id);
        });
    }
    
    // Display genres in the UI
    function displayGenres(genres) {
        const genresList = document.getElementById('genres-list');
        
        if (!genres || genres.length === 0) {
            genresList.innerHTML = '<p>No genres found</p>';
            return;
        }
        
        let html = '<div class="items-grid">';
        
        genres.forEach(genre => {
            html += `
                <div class="item-card">
                    <h3>${genre.name}</h3>
                    <p>${genre.description || 'No description'}</p>
                    <p><strong>Books:</strong> ${genre.books ? genre.books.length : 0}</p>
                    <div class="card-actions">
                        <button onclick="showGenreDetails('${genre.id}')">Details</button>
                        <button onclick="deleteGenre('${genre.id}')">Delete</button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        genresList.innerHTML = html;
        
        // Add event handlers to buttons
        genres.forEach(genre => {
            document.querySelector(`[onclick="showGenreDetails('${genre.id}')"]`).onclick = () => showGenreDetails(genre.id);
            document.querySelector(`[onclick="deleteGenre('${genre.id}')"]`).onclick = () => deleteGenre(genre.id);
        });
    }
    
    // Show book details
    async function showBookDetails(id) {
        modalTitle.textContent = 'Book Details';
        modalContent.innerHTML = '<p>Loading book details...</p>';
        modal.style.display = 'block';
        
        const query = `
            query {
                book(id: "${id}") {
                    id
                    title
                    publicationYear
                    pageCount
                    author {
                        id
                        name
                    }
                    genres {
                        id
                        name
                    }
                }
            }
        `;
        
        try {
            const data = await client.request(query);
            const book = data.book;
            
            if (!book) {
                modalContent.innerHTML = '<p>Book not found</p>';
                return;
            }
            
            let genresHtml = '<p>No genres assigned</p>';
            if (book.genres && book.genres.length > 0) {
                genresHtml = '<ul>' + book.genres.map(genre => 
                    `<li>${genre.name}</li>`
                ).join('') + '</ul>';
            }
            
            modalContent.innerHTML = `
                <div class="detail-content">
                    <p><strong>Title:</strong> ${book.title}</p>
                    <p><strong>Publication Year:</strong> ${book.publicationYear || 'Unknown'}</p>
                    <p><strong>Page Count:</strong> ${book.pageCount || 'Unknown'}</p>
                    <p><strong>Author:</strong> ${book.author ? book.author.name : 'Unknown'}</p>
                    
                    <div class="detail-section">
                        <h4>Genres:</h4>
                        ${genresHtml}
                    </div>
                    
                    <div class="detail-actions">
                        <button id="edit-book-btn">Edit Book</button>
                    </div>
                </div>
            `;
            
            // Add event listener for edit button
            document.getElementById('edit-book-btn').addEventListener('click', () => {
                // Implement edit functionality
                alert('Edit functionality would go here');
            });
            
        } catch (error) {
            console.error('Error loading book details:', error);
            modalContent.innerHTML = `<p class="error">Error loading book details: ${error.message || 'Unknown error'}</p>`;
        }
    }
    
    // Show author details
    async function showAuthorDetails(id) {
        modalTitle.textContent = 'Author Details';
        modalContent.innerHTML = '<p>Loading author details...</p>';
        modal.style.display = 'block';
        
        const query = `
            query {
                author(id: "${id}") {
                    id
                    name
                    birthYear
                    nationality
                    books {
                        id
                        title
                        publicationYear
                    }
                }
            }
        `;
        
        try {
            const data = await client.request(query);
            const author = data.author;
            
            if (!author) {
                modalContent.innerHTML = '<p>Author not found</p>';
                return;
            }
            
            let booksHtml = '<p>No books found</p>';
            if (author.books && author.books.length > 0) {
                booksHtml = '<ul>' + author.books.map(book => 
                    `<li>${book.title} (${book.publicationYear || 'Unknown'})</li>`
                ).join('') + '</ul>';
            }
            
            modalContent.innerHTML = `
                <div class="detail-content">
                    <p><strong>Name:</strong> ${author.name}</p>
                    <p><strong>Birth Year:</strong> ${author.birthYear || 'Unknown'}</p>
                    <p><strong>Nationality:</strong> ${author.nationality || 'Unknown'}</p>
                    
                    <div class="detail-section">
                        <h4>Books:</h4>
                        ${booksHtml}
                    </div>
                    
                    <div class="detail-actions">
                        <button id="edit-author-btn">Edit Author</button>
                    </div>
                </div>
            `;
            
            // Add event listener for edit button
            document.getElementById('edit-author-btn').addEventListener('click', () => {
                // Implement edit functionality
                alert('Edit functionality would go here');
            });
            
        } catch (error) {
            console.error('Error loading author details:', error);
            modalContent.innerHTML = `<p class="error">Error loading author details: ${error.message || 'Unknown error'}</p>`;
        }
    }
    
    // Show genre details
    async function showGenreDetails(id) {
        modalTitle.textContent = 'Genre Details';
        modalContent.innerHTML = '<p>Loading genre details...</p>';
        modal.style.display = 'block';
        
        const query = `
            query {
                genre(id: "${id}") {
                    id
                    name
                    description
                    books {
                        id
                        title
                        author {
                            name
                        }
                    }
                }
            }
        `;
        
        try {
            const data = await client.request(query);
            const genre = data.genre;
            
            if (!genre) {
                modalContent.innerHTML = '<p>Genre not found</p>';
                return;
            }
            
            let booksHtml = '<p>No books in this genre</p>';
            if (genre.books && genre.books.length > 0) {
                booksHtml = '<ul>' + genre.books.map(book => 
                    `<li>${book.title} by ${book.author ? book.author.name : 'Unknown'}</li>`
                ).join('') + '</ul>';
            }
            
            modalContent.innerHTML = `
                <div class="detail-content">
                    <p><strong>Name:</strong> ${genre.name}</p>
                    <p><strong>Description:</strong> ${genre.description || 'No description'}</p>
                    
                    <div class="detail-section">
                        <h4>Books in this genre:</h4>
                        ${booksHtml}
                    </div>
                    
                    <div class="detail-actions">
                        <button id="edit-genre-btn">Edit Genre</button>
                    </div>
                </div>
            `;
            
            // Add event listener for edit button
            document.getElementById('edit-genre-btn').addEventListener('click', () => {
                // Implement edit functionality
                alert('Edit functionality would go here');
            });
            
        } catch (error) {
            console.error('Error loading genre details:', error);
            modalContent.innerHTML = `<p class="error">Error loading genre details: ${error.message || 'Unknown error'}</p>`;
        }
    }
    
    // Load data on initial page load
    loadBooks();
});
