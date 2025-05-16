import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

const AdminPage = () => {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    coverImage: null,
  });
  const [preview, setPreview] = useState(null);

  const fetchBooks = () => {
    axios.get("http://localhost:5002/api/books").then((res) => {
      setBooks(res.data);
    });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Dropzone setup
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setForm((prev) => ({ ...prev, coverImage: acceptedFiles[0] }));
      setPreview(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.coverImage) {
      alert("Please upload a cover image.");
      return;
    }

    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key]);
    }

    await axios.post("http://localhost:5002/api/books", formData);
    fetchBooks();
    setForm({
      title: "",
      author: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      coverImage: null,
    });
    setPreview(null);
  };

  const deleteBook = async (id) => {
    await axios.delete(`http://localhost:5002/api/books/${id}`);
    fetchBooks();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">📘 Admin – Manage Books</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 rounded-lg shadow-md mb-10"
      >
        {/* Text inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Title", name: "title", type: "text" },
            { label: "Author", name: "author", type: "text" },
            { label: "Category", name: "category", type: "text" },
            { label: "Price", name: "price", type: "number", step: "0.01" },
            { label: "Stock", name: "stock", type: "number" },
          ].map(({ label, name, type, step }) => (
            <div key={name} className="flex flex-col">
              <label htmlFor={name} className="mb-1 font-medium text-gray-700">
                {label}
              </label>
              <input
                type={type}
                name={name}
                id={name}
                step={step}
                value={form[name]}
                onChange={handleChange}
                required
                className="px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        {/* Description textarea */}
        <div className="flex flex-col">
          <label
            htmlFor="description"
            className="mb-1 font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={form.description}
            onChange={handleChange}
            required
            className="px-4 py-2 border rounded-md border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Short description of the book"
          />
        </div>

        {/* Dropzone */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            Cover Image
          </label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-white"
            }`}
          >
            <input {...getInputProps()} />
            {!preview ? (
              <p className="text-gray-500">
                Drag & drop an image here, or click to select one
              </p>
            ) : (
              <img
                src={preview}
                alt="Cover Preview"
                className="mx-auto max-h-48 rounded-md object-contain"
              />
            )}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-blue-700 transition"
        >
          Add Book
        </button>
      </form>

      {/* Book List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {books.map((book) => (
          <div
            key={book._id}
            className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition relative"
          >
            <img
              src={`http://localhost:5002${book.coverImage}`}
              alt={book.title}
              className="w-full h-48 object-cover rounded-md mb-3"
            />
            <h2 className="font-bold text-lg truncate">{book.title}</h2>
            <p className="text-sm text-gray-600 mb-1 truncate">
              By {book.author}
            </p>
            <p className="text-sm text-green-600 font-semibold mb-2">
              ${book.price}
            </p>
            <button
              onClick={() => deleteBook(book._id)}
              className="absolute top-3 right-3 text-red-600 hover:text-red-800 focus:outline-none"
              aria-label={`Delete ${book.title}`}
              title="Delete Book"
            >
              ❌
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
