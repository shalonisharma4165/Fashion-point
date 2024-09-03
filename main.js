var express=require('express');
var app=express();
app.use(express.static('Project'));
app.use(express.static('uploads'));//coments
var ed = require('body-parser');
var bd = ed.urlencoded({ extended: false });
var mysql = require('mysql');
const session = require("express-session");
const path = require('path');
const multer = require('multer');
app.set('view engine','ejs');
app.use(
  session({
    secret: "shailini",
    resave: false,
    saveUninitialized: false,
  })
);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'views/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); // Append the file extension
    }
});

const upload = multer({ storage: storage });


app.use(function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  
  //* User data----------------------------
  res.locals.name = req.session.na;
  res.locals.email = req.session.em;
//* Adminata----------------------------
res.locals.aname = req.session.ana;
res.locals.aemail = req.session.aem;


   next();
});

// Create connection

var con = mysql.createConnection({
    host: '127.0.0.1',
    database: 'project',
    user: 'root', // it should be 'user' not 'users'
    password: ''
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected to MySQL database!");
});

app.get("/",function(req,res)
{
res.sendFile("./Project/index.html",{root:__dirname});
});
app.post("/RegProcess", bd, function(req, res) {
    var a = req.body.name;
    var b = req.body.email;
    var c = req.body.contact;
    var d = req.body.password;

   var q="insert into project values('"+a+"','"+b+"','"+c+"','"+d+"')";
    con.query(q,function(err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        res.send('Registration successful!');
    });
   });
    app.post("/LoginProcess",bd,function(req,res){
        var a=req.body.email;
        var b=req.body.password;
console.log("Email is "+a);
console.log("password is "+b);
        var q="select * from project where email='"+a+"' and password='"+b+"'";
        con.query(q,function(err,result){
            if(err)
		{
                throw err;
            	}
                 if(result.length>0){
req.session.na=result[0].name;
req.session.em=result[0].email;

                
                    res.render("UserHome");
                    
                }
else
{
                                    res.send("invalid login!");
                }
            
        });
    });
    
    
    app.post("/AdminProcess",bd,function(req,res){
        var a=req.body.email;
        var b=req.body.password;
console.log("Email is "+a);
console.log("password is "+b);
        var q="select * from admin where email='"+a+"' and password='"+b+"'";
        con.query(q,function(err,result){
            if(err)
		{
                throw err;
            	}
                 if(result.length>0){
                
                    req.session.ana=result[0].name;
req.session.aem=result[0].email;

                    res.sendFile("./Project/addproduct.html", { root: __dirname});
                }
                
else
{
                                    res.send("invalid login!");
                }
            
        });
    });
    app.get("/",function(req,res)
{
res.sendFile("./Project/addproduct.html",{root:__dirname});
});
app.post("/AddProduct", bd, upload.single('image'),function(req, res) {
    var a = req.body.id;
    var b = req.body.name;
    var c = req.body.category;
    var d= req.body.price;
    var e= req.body.description;
var f=req.file.filename;

   var q="insert into products values('"+a+"','"+b+"','"+c+"',"+d+",'"+e+"','"+f+"')";
    con.query(q,function(err, result) {
        if (err) throw err;
        console.log("1 Product is inserted");
    res.redirect("/ShowProduct");    
    
    });
   });

   app.get("/ShowProduct",function(req,res)
   {

    var q="Select * from products";
    con.query(q,function(err,result)
    {
res.render("ShowProd",{data:result});
    });

   });
   app.get("/VUser",function(req,res)
   {

    var q="Select * from project";
    con.query(q,function(err,result)
    {
res.render("viewuers",{data:result});
    });

   });
   app.get("Vorders",function(req,res){
    var q="select * from orders"
    con.query(q,function(err,result){
        res.render("vieworders",{data:result});
    });
   });
    
   app.get("/ChangePassword",function(req, res) {
res.sendFile("./Project/ChangePassword.html",{root:__dirname});

    
   });
   app.post("/ChangePassword", bd, function(req, res) {
    
    var a = req.session.em;
    var b = req.body.password;
    var c = req.body.newPassword;

   var q="update project set password='"+c+"' where email='"+a+"' and password='"+b+"'";
    con.query(q,function(err, result) {
        if (err) throw err;
        console.log("password change");
        res.send('Change successful!');
    });
   });

app.get('/DelUsers',function(req,res)
{
var a=req.query.em;
var q="delete from  project  where email='"+a+"'";
con.query(q,function(err, result) {
    if (err) throw err;
    console.log("delete");
    res.redirect("/VUser");
});

});

app.get('/DelProducts',function(req,res)
{
var a=req.query.id;
var q="delete from  products where product_id='"+a+"'";
con.query(q,function(err, result) {
    if (err) throw err;
    
    res.redirect("/ShowProduct");
});

});
app.post("/ContactProcess", bd, function(req, res) {
    var a = req.body.name;
    var b = req.body.email;
    var c = req.body.subject;
    var d = req.body.message;

   var q="insert into contact values('"+a+"','"+b+"','"+c+"','"+d+"')";
    con.query(q,function(err, result) {
        if (err) throw err;
        console.log("Data inserted successfully:", result);
        res.sendFile("/project/product.html", { root: __dirname });
    });
   });
app.get('/viewProduct',function(req,res)
{
var q="Select * from products";
con.query(q,function(err,result)
{
if(err)
throw err;
res.render('viewProduct',{data:result});
});
});

app.get("/orders",function(req,res)
{
var N=req.session.na;
var e=req.session.em;
var pid=req.query.pid;
var pname=req.query.pname;
var pcat=req.query.pcat;
var price=req.query.price;
var pdesc=req.query.pdesc;
var d=new Date();
var da=d.toLocaleDateString();

var q="insert into orders values('"+N+"','"+e+"','"+pid+"','"+pname+"','"+pcat+"',"+price+",'"+pdesc+"','"+da+"')";
con.query(q,function(err,result){
    if(err)
        throw err;
    res.redirect('sorders');
})

});
app.get("/sorders",function(req,res){
    var N=req.session.em;
    var d=new Date();
var da=d.toLocaleDateString();
    var q="Select * from orders where email='"+N+"'";
    con.query(q,function(err,result)
    {
if(err)
throw err
res.render("sorders",{data:result});

});
});

app.get("/Vorders",function(req,res)
{

 var q="Select * from orders";
 con.query(q,function(err,result)
 {
res.render("Vorders",{data:result});
 });

});
app.get('/Delorderss',function(req,res)
{
var a=req.query.id;
var q="delete from  orders where product_id='"+a+"'";
con.query(q,function(err, result) {
    if (err) throw err;
    console.log("product is deleted")
    
    res.redirect("/Vorders");
});

});
app.listen(2000,function(){
    console.log("server is running on port 3000")
});
