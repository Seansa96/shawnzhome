function myFunction() {
    var x = document.getElementById("myLinks");
    var currentHeight = window.getComputedStyle(x).getPropertyValue("max-height"); /* Get the element's current height since we don't know it yet */

    if (currentHeight === "0px") {
      x.style.maxHeight = "400px";
    } 
    else  {
      x.style.maxHeight = "0px";
    }
};

