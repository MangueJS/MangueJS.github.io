const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware for serving static files (CSS, images, JavaScript)
app.use(express.static(path.join(__dirname, "public")));

// Middleware for handling JSON and URL-encoded form submissions
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

// Setup Handlebars as the template engine without layouts
app.engine("hbs", exphbs.engine({ extname: ".hbs", defaultLayout: null }));
app.set("view engine", "hbs");

// Load users from JSON file
const users = JSON.parse(fs.readFileSync("users.json", "utf-8"));

// Dummy data to represent available books
let availableBooks = [
  "Book Title 1",
  "Book Title 2",
  "Book Title 3",
  "Book Title 4",
  "Book Title 5",
  "Book Title 6",
  "Book Title 7",
  "Book Title 8",
  "Book Title 9",
  "Book Title 10",
];

let borrowedBooks = []; // To store borrowed books

// Routes
// Landing page
app.get("/", (req, res) => {
  res.render("landing");
});

// Sign in page
app.get("/signin", (req, res) => {
  res.render("signin", { errorMessage: "" });
});

// Sign in logic
app.post("/signin", (req, res) => {
  const { username, password } = req.body;
  if (!users[username]) {
    res.render("signin", { errorMessage: "Not a registered username" });
  } else if (users[username] !== password) {
    res.render("signin", { errorMessage: "Invalid password" });
  } else {
    req.session.user = username; // Store the user in session
    res.redirect("/home");
  }
});

// Sign out route
app.get("/signout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Failed to log out.");
    }
    res.redirect("/");
  });
});

// Render the homepage with available and borrowed books
app.get("/home", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/signin"); // Redirect to sign in if not logged in
  }

  res.render("home", {
    availableBooks: availableBooks,
    borrowedBooks: borrowedBooks,
    email: req.session.user, // Use session data for the logged-in user
  });
});

// Handle book borrowing
app.post("/borrowBooks", (req, res) => {
  const booksToBorrow = req.body.books; // Get selected books from the form

  if (Array.isArray(booksToBorrow)) {
    // If multiple books are selected
    booksToBorrow.forEach((book) => {
      if (!borrowedBooks.includes(book)) {
        borrowedBooks.push(book); // Add to borrowed books
        availableBooks = availableBooks.filter((b) => b !== book); // Remove from available books
      }
    });
  } else if (booksToBorrow) {
    // If only one book is selected
    if (!borrowedBooks.includes(booksToBorrow)) {
      borrowedBooks.push(booksToBorrow);
      availableBooks = availableBooks.filter((b) => b !== booksToBorrow);
    }
  }

  // Redirect back to the home page
  res.redirect("/home");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
