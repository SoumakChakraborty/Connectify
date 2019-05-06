var express=require("express");
var app=express();
var http=require("http").Server(app);
var chat=require("./routes/chat");
var forgot=require("./routes/forgot");
var index=require("./routes/index");
var search=require("./routes/search");
var change=require("./routes/change");
var message=require("./routes/message");
var friends=require("./routes/friends");
var request=require("./routes/request");
var post=require("./routes/post");
var comment=require("./routes/comment");
var photos=require("./routes/photos");
app.use(friends);
app.use(message);
app.use(change);
app.use(index);
app.use(chat);
app.use(forgot);
app.use(friends);
app.use(request);
app.use(post);
app.use(comment);
app.use(photos);
app.use(search);
app.set("view engine","ejs");
app.use(express.static("public"));
http.listen(3000,"127.0.0.1",function()
{
   console.log("Server started");
});