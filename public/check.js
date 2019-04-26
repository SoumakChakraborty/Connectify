var x=document.querySelectorAll(".password");
var y=document.querySelectorAll(".retype-password");
var flag=false;
y[0].addEventListener("input",function()
{
     if(x[0].value==y[0].value)
       flag=true;
     else
      flag=false;  
});
function check()
{
    if(flag)
    {  
      return true;
    }
    else
    {
        x[0].classList.toggle("error");
        y[0].classList.toggle("error");
        return false;
    }
}