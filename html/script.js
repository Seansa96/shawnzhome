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
function removePreix(str) {
  return str.replace(/^(\.\.\/webdav)/, '');
}

function search() {
const searchTerm = document.getElementById('searchInput').value;
const resultsContainer = document.getElementById('resultsContainer');

fetch(`/api/search?q=${searchTerm}`)
  .then(response => response.json())
  .then(data => {
    resultsContainer.innerHTML = '';
    
    data.slice(0, 10).forEach(item => {
      const li = document.createElement('li');
      const origFilename = item.filename;
      const newFilename = removePreix(origFilename);
      li.innerHTML = `<a href="${item.filename}">${newFilename}</a>`;
      resultsContainer.appendChild(li);
      
    });
    
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
