const express =
  require("express");

const dotenv =
  require("dotenv");

const cors =
  require("cors");

const morgan =
  require("morgan");

const cookieParser =
  require("cookie-parser");

const path =
  require("path");

const connectDB =
  require("./config/db");

const authRoutes =
  require("./routes/authRoutes");

const userRoutes =
  require("./routes/userRoutes");

const noteRoutes =
  require("./routes/noteRoutes");

const adminRoutes =
  require("./routes/adminRoutes");

const reportRoutes =
  require("./routes/reportRoutes");

const notificationRoutes =
  require("./routes/notificationRoutes");


// CONFIG
dotenv.config();


// DATABASE
connectDB();


// APP
const app = express();


// MIDDLEWARE
app.use(express.json());

app.use(cors());

app.use(morgan("dev"));

app.use(cookieParser());


// STATIC FILES
app.use(
  "/uploads",

  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);


// ROUTES
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/users",
  userRoutes
);

app.use(
  "/api/notes",
  noteRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);


// HOME ROUTE
app.get(
  "/",
  (req, res) => {

    res.send(
      "DigiNote API Running..."
    );
  }
);


// SERVER
const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {

    console.log(
      `Server running on port ${PORT}`
    );
  }
);