var x=document.querySelectorAll(".user-list");
var y=document.querySelector("#user-show");
y.addEventListener("click",function()
{
     x[0].classList.toggle("user-list-show");
});