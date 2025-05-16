import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    price
  );

const HomePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedBookId, setAddedBookId] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:5002/api/books")
      .then((res) => {
        setBooks(res.data);
      })
      .catch((err) => console.error("Failed to fetch books:", err))
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (book) => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existing = cart.find((item) => item._id === book._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...book, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));

    // Show a temporary success message
    setAddedBookId(book._id);
    setTimeout(() => setAddedBookId(null), 1500);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading books...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 sm:p-10">
      {/* Header with title and buttons */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 select-none">
          📚 Bookshop
        </h1>
        <nav className="space-x-4">
          <Link
            to="/cart"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            My Cart
          </Link>
          <Link
            to="/orders"
            className="inline-block bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            My Orders
          </Link>
        </nav>
      </header>

      <section
        aria-label="Book List"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
      >
        {books.map((book) => (
          <article
            key={book._id}
            className="bg-white rounded-lg overflow-hidden flex flex-col hover:scale-[1.03] transition-transform duration-200 ease-in-out"
          >
            <img
              src={`http://localhost:5002${book.coverImage}`}
              alt={`Cover of ${book.title}`}
              className="aspect-[3/4] w-full object-cover"
              loading="lazy"
              draggable={false}
            />
            <div className="flex flex-col flex-grow p-5">
              <h2
                className="text-lg font-semibold text-gray-900 truncate"
                title={book.title}
              >
                {book.title}
              </h2>
              <p
                className="text-sm text-gray-600 mt-1 truncate"
                title={book.author}
              >
                By {book.author}
              </p>
              <p
                className="mt-2 text-gray-700 text-sm line-clamp-2 leading-relaxed"
                title={book.description}
                style={{
                  WebkitBoxOrient: "vertical",
                  display: "-webkit-box",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {book.description}
              </p>
              <div className="mt-3 flex items-center justify-between pt-4">
                <span className="text-green-600 font-bold text-lg">
                  {formatPrice(book.price)}
                </span>
                <button
                  aria-label={`Add ${book.title} to cart`}
                  onClick={() => addToCart(book)}
                  className={`w-full sm:w-auto bg-black text-white px-5 py-2 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-transform duration-150 active:scale-95 ${
                    addedBookId === book._id ? "opacity-60 cursor-default" : ""
                  }`}
                  disabled={addedBookId === book._id}
                >
                  {addedBookId === book._id ? "Added!" : "Add to Cart"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
};

export default HomePage;
