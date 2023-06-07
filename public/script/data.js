
// navbar hide on scroll 

// var prevScrollpos = window.pageYOffset;
// window.onscroll = function() {
//   var currentScrollPos = window.pageYOffset;
//   if (prevScrollpos > currentScrollPos) {
//     document.getElementById("navbar").style.top = "0px";
//   } else {
//     document.getElementById("navbar").style.top = "-125px";
//   }
//   prevScrollpos = currentScrollPos;
// }

// navbar shrink on scroll 

window.onscroll = function() {scrollFunction()};

function scrollFunction() {
  if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
    // document.getElementById("navbar").style.top = "-125px";
   

    document.getElementById("navbar").style.height = " 91px";
    document.getElementById("logo").style.width= "79%";
    document.getElementById("logo").style.top= "-20px";
    document.getElementById("navlink").style.fontSize ="18px";
    // document.getElementById("navlink").style.paddingTop="0px";
    document.getElementById("dropdownMenuButton").style.fontSize="15px";
    document.getElementById("navlink-login").style.paddingBottom="50px";
  } else {
    // document.getElementById("navbar").style.top = "0px";

    document.getElementById("navbar").style.height = "130px";
    document.getElementById("logo").style.width = "97%";
    document.getElementById("logo").style.top= "0px";
    document.getElementById("navlink").style.fontSize="20px";
    // document.getElementById("navlink").style.paddingTop ="23px";
    document.getElementById("dropdownMenuButton").style.fontSize="17px";
    document.getElementById("navlink-login").style.paddingBottom="0px";
  }
}


