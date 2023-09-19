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

function search() {
const searchTerm = document.getElementById('searchInput').value;

fetch(`/api/search?q=${searchTerm}`)
  .then(response => response.json())
  .then(data => {
    // Handle and display data as you wish.
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
