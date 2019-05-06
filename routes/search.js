var conn=require("../modules/connect");
var checker=require("../modules/checker");
var express=require('express');
var router=express.Router();
var cookie=require("cookie-parser");
router.use(cookie("This is hardcoded secret that will be to me only"));
router.post("/search",function(req,res)
{
  var sessid=req.signedCookies["uname"];
  if(sessid==undefined)
    res.redirect("/signin");
  else
  {  
    var query=req.body.query;
    conn.query("select * from user",function(err,result,fields)
    {
        var actual=[];
        for(var i=0;i<result.length;i++)
        {
          var flag=checker(result[i].fname+" "+result[i].lname,query);
          if(flag==true)
            actual.push(result[i]);
        }
             res.render("queryresult",{query:query,result:actual});  
   });
  }
});
module.exports=router;