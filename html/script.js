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
const resultsContainer = document.getElementById('resultsContainer');

fetch(`/api/search?q=${searchTerm}`)
  .then(response => response.json())
  .then(data => {
    resultsContainer.innerHTML = '';
    data.forEach(item => {
      const li = document.createElement('<li><a href='+item.filename+'>'+item.filename+'</a></');
      li.innerHTML = item.filename;
      resultsContainer.appendChild(li);
    });
    
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
