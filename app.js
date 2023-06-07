const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const bycrypt = require("bcryptjs");
const multer = require("multer");
// const localStrategy = require("passport-local");
const app = express();

//EJS
// app.use(expressLayouts);
app.set("view engine", "ejs");

//Routes

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));

//Storage & file name setting
let Storage = multer.diskStorage({
  destination: "public/backend/Images",
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

let upload = multer({
  storage: Storage,
});

app.use(
  session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(multer({ storage: Storage }).single("Simage"));

mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1/studentDB", { useNewUrlParser: true });

const studentInfoSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  name: String,
  course: String,
  branch: String,
  sem: String,
  personalNo: String,
  fatherNo: String,
  fatherName: String,
  address: String,
  imageName: String,
});

const adminInfoSchema = new mongoose.Schema({
  username: String,
  email: String,
  name: String,
  password: String,
  position: String,
  address: String,
  mobileNo: String,
});

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const checkSchema = new mongoose.Schema({
  username: String,
  type: String,
  reason: String,
  Sdate: String,
  Edate: String,
  inTime: String,
  outTime: String,
});

studentInfoSchema.plugin(passportLocalMongoose);

const Student = mongoose.model("Student", studentInfoSchema);
const Admin = mongoose.model("Admin", adminInfoSchema);
const Contact = mongoose.model("Contact", contactSchema);
const Check = mongoose.model("Check", checkSchema);

// passport.use(Student.createStrategy());
const localStrategy = require("passport-local").Strategy;

passport.use(
  new localStrategy(
    { usernameField: "username" },
    (username, password, done) => {
      //Match User
      Student.findOne({ username: username })
        .then((user) => {
          if (!user) {
            return done(null, false, {
              message: "The Username is not found",
            });
          }
          //Match Password
          bycrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Incorrect Password" });
            }
          });
        })
        .catch((err) => console.log(err));
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await Student.findById(id);

    done(null, user);
  } catch (err) {
    done(err, false);
  }
});

app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

//Login student
app.get("/Student", function (req, res) {
  res.render("login", { users: "Student" });
});

//Login Admin
app.get("/Admin", function (req, res) {
  res.render("login", { users: "Admin" });
});

//Register Get request
app.get("/register", function (req, res) {
  res.render("register");
});
//Register Admin Get request
app.get("/admin-register", function (req, res) {
  res.render("admin-register");
});

app.get("/dashboard", function (req, res) {
  var userData = req.user;
  res.render("dashboard", { user: userData });
});

//Admin Get request
app.get("/Admin-dashboard", function (req, res) {
  res.render("admin");
});

app.get("/mess", function (req, res) {
  res.render("mess");
});

app.get("/check", function (req, res) {
  res.sendFile(__dirname + "/check-in-out.html");
});

app.get("/complaint", function (req, res) {
  res.sendFile(__dirname + "/complaints.html");
});

//Upload

//Register Request
app.post("/register", function (req, res) {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  // console.log(req.file);
  Student.findOne({ username: username }).then((user) => {
    if (user) {
      res.status(505).send("User Already Exist");
    } else {
      const newStudent = new Student({
        username: username,
        email: email,
        password: password,
        name: req.body.name,
        course: req.body.course,
        branch: req.body.branch,
        sem: req.body.sem,
        personalNo: req.body.personalNo,
        fatherName: req.body.fatherName,
        fatherNo: req.body.fatherNo,
        address: req.body.address,
        // imageName: req.file.filename,
      });

      //Hash Password
      bycrypt.genSalt(10, (err, salt) =>
        bycrypt.hash(newStudent.password, salt, (err, hash) => {
          if (err) console.log(err);

          newStudent.password = hash;
          //Save User
          newStudent
            .save()
            .then((user) => {
              res.redirect("/Student");
            })
            .catch((err) => console.log(err));
        })
      );
    }
  });
});

//Admin Register
app.post("/admin-register", function (req, res) {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  // console.log(req.file);
  Admin.findOne({ username: username }).then((user) => {
    if (user) {
      res.status(505).send("User Already Exist");
    } else {
      const newAdmin = new Admin({
        username: username,
        email: email,
        password: password,
        name: req.body.name,
        position: req.body.position,
        address: req.body.address,
        mobileNo: req.body.mobileNo,
      });

      //Hash Password

      newAdmin
        .save()
        .then((user) => {
          res.redirect("/Admin");
        })
        .catch((err) => console.log(err));
    }
  });
});

// Post request for student user
app.post("/Student", function (req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/Student",
  })(req, res, next);
});

// Post request for student user
app.post("/Admin", function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  Admin.findOne({ username: username }).then((user) => {
    if (!user) {
      res.status(201).send("Student not register");
    } else {
      if (user.password == password) {
        res.render("admin", { adminData: user });
      }
    }
  });
});

//Logout post request
app.post("/logout", function (req, res) {
  req.logOut();
  res.redirect("/");
});

//Contact post request
app.post("/contact-form", function (req, res) {
  const contactDetail = new Contact({
    name: req.body.Name,
    email: req.body.Email,
    message: req.body.Message,
  });

  contactDetail.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/");
    }
  });
});

//Check In Check out
app.post("/check", function (req, res) {
  const user = req.body.username;
  const newCheck = new Check({
    username: user,
    type: req.body.type,
    reason: req.body.reason,
    Sdate: req.body.Sdate,
    Edate: req.body.Edate,
    inTime: req.body.intime,
    outTime: req.body.outtime,
  });

  newCheck.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/check");
    }
  });
});

app.get("/gatepass", function (req, res) {
  const user = req.user;
  Check.find({}, function (err, posts) {
    res.render("gatepass-table", { posts: posts });
  });
});

app.listen(PORT, function () {
  console.log(`The server is running on port ${PORT}`);
});
