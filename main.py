from ariadne import load_schema_from_path, make_executable_schema, graphql_sync
from ariadne.asgi import GraphQL
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

# Import resolvers from resolvers.py
from resolvers import query, mutation, book_type, author_type, genre_type
from database import init_db

# Load the schema
type_defs = load_schema_from_path("schema.graphql")
schema = make_executable_schema(
    type_defs, query, mutation, book_type, author_type, genre_type
)

# Create FastAPI app
app = FastAPI(title="Book GraphQL API")

# Enable CORS with specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    expose_headers=["Content-Type"],
)

# Create GraphQL app
graphql_app = GraphQL(schema)

# Mount GraphQL endpoint
app.mount("/graphql", graphql_app)

# Root endpoint with GraphQL explorer
@app.get("/")
async def root():
    return {
        "message": "Selamat datang di Book GraphQL API",
        "instructions": "Gunakan endpoint /graphql untuk melakukan query dan mutation",
    }

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("Database berhasil diinisialisasi.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
