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

//Scroll to search results on mobile
function scrollIntoContainer(element) {
  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

fetch('/api/get-env')
.then(response => response.json())
.then(data => {
  let envValue = data.value;
  let home = document.getElementById('home');
  home.innerHTML = "<a href=" + envValue +">Home</a>";
});


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
    var containerState = document.querySelector('div.three'); //After the container gets filled, scroll to the results
    //console.log(containerState);
    var containerHTMLState = containerState.innerHTML;
    //console.log(containerHTMLState); //
    if (containerHTMLState !== '') {
      scrollIntoContainer(containerState);
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
}
