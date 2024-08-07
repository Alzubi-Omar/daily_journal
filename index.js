import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import _ from "lodash";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// const client = new Client({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

async function startServer() {
  try {
    const client = await pool.connect();
    console.log("Connected to the database.");

    // Create the table if it doesn't exist
    await client.query(`
          CREATE TABLE IF NOT EXISTS public.posts (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            passkey VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL
          );
        `);
    console.log("Ensured the posts table exists.");
    client.release();
  } catch (err) {
    console.error("Failed to connect to the database:", err);
    process.exit(1); // Exit the application if the connection fails
  }
}

// Start the server
startServer();

//Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const aboutContent = "Discover the Power of Gratitude: Join Our Community";

// async function fetchAllPosts() {
//   const result = await pool.query("SELECT * FROM posts");
//   posts = result.rows;
//   return posts;
// }

// Fetch all posts
async function fetchAllPosts() {
  try {
    const result = await pool.query("SELECT * FROM posts");
    return result.rows;
  } catch (err) {
    console.error("Error fetching posts:", err);
    return [];
  }
}

// array to hold posts
let posts = [
  // {
  //   // structure
  //   id: "",
  //   name: "",
  //   password: "",
  //   title: "",
  //   content: "",
  // },
];

// route -> Home
app.get("/", async (req, res) => {
  try {
    res.render("home", {
      startingTitle: "Welcome To Daily Journal ",
      startingContentHome: "A journal shared with everyone.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Try again Later");
  }
});

// route -> "/read_all"
app.get("/read_all", async (req, res) => {
  const posts = await fetchAllPosts();
  try {
    res.render("read", {
      posts,
    });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    if (error.message.includes("connection")) {
      res.status(500).send("Error connecting to database. Try again later.");
    } else {
      res.status(500).send("An unexpected error occurred. Please try again.");
    }
  }
});

// route -> "/about"
app.get("/about", async (req, res) => {
  try {
    res.render("about", {
      aboutContent,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong. Try again Later.");
  }
});

// route -> "/new_post"
app.get("/new_post", async (req, res) => {
  try {
    res.render("compose");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

// Capture the forms input
app.post("/new_post", async (req, res) => {
  const { postName, password, postTitle, postContent } = req.body;
  try {
    // Password Hashing
    const hash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      "INSERT INTO posts(name, passkey, title, content) VALUES($1, $2, $3, $4)",
      [postName, hash, postTitle, postContent]
    );

    res.redirect("/read_all");
  } catch (error) {
    console.log("Error adding post:", error);
    await pool.query("ROLLBACK");
    res.status(500).send("Failed to add new post");
  }
});

// route -> "/read_all/:postNum" (Route parameters -full blog post)
app.get(`/read_all/:id`, async (req, res) => {
  try {
    const { id: postId } = req.params;
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    const post = result.rows[0];

    // Handle non-existent post
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.render("post", { post });
  } catch (error) {
    console.log("Error reading post:", error);
    res.status(500).send("Error retrieving post");
  }
});

// route -> ... Editing posts
app.get("/read_all/:id/edit", async (req, res) => {
  try {
    const { id: postId } = req.params;
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    const post = result.rows[0];
    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.render("auth", {
      route: "edit",
      postId,
      message: "Please enter your password to edit the post",
    });
  } catch (error) {
    console.log("Error editing post:", error);
    res.status(500).send("Error retrieving post");
  }
});

// Capture the auth forms input
app.post("/read_all/:id/edit", async (req, res) => {
  const postId = req.params.id;
  const submittedPassword = req.body.password;

  try {
    // Fetch post details from database
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    const post = result.rows[0];

    if (!post) {
      return res.status(404).send("Post not found.");
    }

    // Compare submitted password with stored password
    const passwordMatch = await bcrypt.compare(submittedPassword, post.passkey);

    if (passwordMatch) {
      console.log("Authentication  successful for editing post:", postId);
      res.render("edit", {
        post,
      });
    } else {
      console.log("Authentication failed for editing post:", postId);
      res.render("auth", {
        route: "edit",
        message: "Invalid Password. Please try again",
        postId,
      });
    }
  } catch (error) {
    console.error("Error during authentication:", error);
    res
      .status(500)
      .send("An unexpected error occurred. Please try again later.");
  }
});

// Updating a post
app.post("/read_all/:id/allow-changes", async (req, res) => {
  const postId = req.params.id;
  const { NewPostTitle: Title, NewPostContent: Content } = req.body;
  try {
    const text = "UPDATE posts SET title = $1, content = $2 WHERE id = $3";
    const values = [Title, Content, postId];
    const result = await pool.query(text, values);

    if (result.rowCount === 1) {
      res.render("action-success", {
        title: "Edit Successful",
        message: "Post updated successfully!",
      });
    } else {
      console.error("Error updating post: Unexpected rowCount", result);
      res
        .status(500)
        .send("An unexpected error occurred. Please try again later.");
    }
  } catch (error) {
    console.error("Error updating post:", error);
    res
      .status(500)
      .send("An unexpected error occurred. Please try again later.");
  }
});

// route -> Render the delete confirmation form.
app.get("/read_all/:id/delete", async (req, res) => {
  const { id: postId } = req.params;

  try {
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    const post = result.rows[0];

    if (!post) {
      return res.status(404).send("Post not found");
    }
    res.render("auth", {
      route: "delete",
      postId,
      message: null,
    });
  } catch (error) {
    console.log("Error deleting post:", error);
    res.status(500).send("Error retrieving post");
  }
});

// POST Request: Route to render the delete form and handle form submission
app.post("/read_all/:id/delete", async (req, res) => {
  const { id: postId } = req.params;
  const submittedPassword = req.body.password;

  try {
    // Validate postId
    if (!postId || isNaN(postId) || postId <= 0) {
      return res.status(400).send("Invalid postId.");
    }

    // Fetch post details from database
    const result = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    const post = result.rows[0];

    // Validate postId
    if (!post) {
      return res.status(404).send("Post not found");
    }

    if (!submittedPassword) {
      // Initial form rendering, without password submission
      return res.render("auth", {
        route: "delete",
        postId,
        message: "Please enter your password to delete the post",
      });
    }

    // Form submission with password
    // Compare submitted password with stored password
    const passwordMatch = await bcrypt.compare(submittedPassword, post.passkey);

    if (passwordMatch) {
      await pool.query("DELETE FROM posts WHERE id = $1", [postId]);
      console.log("Authentication successful.");

      // Successful deletion
      return res.render("action-success", {
        title: "Deletion Successful",
        message: "Post Deleted Successfully",
      });
    } else {
      // Invalid password
      return res.render("auth", {
        route: "delete",
        message: "Invalid Password. Please try again",
        postId,
      });
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    res
      .status(500)
      .send("An unexpected error occurred. Please try again later.");
  }
});

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});
