function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}


function injectHTML(list) {
  console.log('fired injectHTML');
  const target = document.querySelector("#library_list")
  target.innerHTML = '';
  list.forEach((item, index) => {
    const str = `<li>${item.branch_name}</li>`
    target.innerHTML += str
  })

}

function filterList(list, query) {
  return list.filter((item) => {
    const lowerCaseName = item.branch_name.toLowerCase();
    const lowerCaseQuery = query.toLowerCase();
    return lowerCaseName.includes(lowerCaseQuery);
  })
}

function  cutLibraryList(list){
  console.log("fired cut list")
  const range = [...Array(15).keys()];
  return newArray = range.map((item) => {
    const index = getRandomInt(0, list.length - 1);
    return list[index] 
  })
}

function initMap(){
  const carto = L.map('map').setView([38.98, -76.93], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(carto);
  return carto;
}



function markerPlace(array, map){
  console.log('array for markers', array);

  map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        layer.remove();
      }
    });

  array.forEach((item) => {
      console.log('markerplace', item);
      const {latitude} = item.location_1;
      const {longitude} = item.location_1;
      console.log(item.location_1)

      L.marker([latitude, longitude]).addTo(map);
  })

}




async function mainEvent() { 
  const form = document.querySelector('.main_form'); 
  const loadDataButton = document.querySelector("#data_load");
  const clearDataButton = document.querySelector("#data_clear");
  const generateListButton = document.querySelector('#generate');
  const textField = document.querySelector('#library');
  
  const loadAnimation = document.querySelector("#data_load_animation");
  loadAnimation.style.display = 'none'; 
  generateListButton.classList.add('hidden');

  const carto = initMap();

  const storedData = localStorage.getItem('storedData');
  let parsedData = JSON.parse(storedData);
  if (parsedData?.length > 0){
      generateListButton.classList.remove('hidden');
  }

  let libraryList = [];


  loadDataButton.addEventListener('click', async (submitEvent) => { // async has to be declared on every function that needs to "await" something
    submitEvent.preventDefault(); // This prevents your page from going to http://localhost:3000/api even if your form still has an action set on it
    console.log('form submission'); // this is substituting for a "breakpoint"
    loadAnimation.style.display = 'inline-block';


    const results = await fetch('https://data.princegeorgescountymd.gov/resource/7k64-tdwr.json');

    // This changes the response from the GET into data we can use - an "object"
    const storedList = await results.json();
    localStorage.setItem('storedData', JSON.stringify(storedList));
    parsedData =  storedList;

    if (parsedData?.length > 0){
      generateListButton.classList.remove('hidden');
    }

    loadAnimation.style.display = 'none'; 
    
  });


  generateListButton.addEventListener('click', (event) => {
    console.log('generate new list');
    libraryList = cutLibraryList(parsedData);
    console.log(libraryList);
    injectHTML(libraryList);
    markerPlace(libraryList, carto);
  })

  textField.addEventListener('input', (event)=>{
      console.log('input', event.target.value);
      const newList = filterList(libraryList, event.target.value)
      console.log(newList);
      injectHTML(newList);
      markerPlace(newList, carto);

  })

  clearDataButton.addEventListener("click", (event) => {
      console.log('clear browser data');
      localStorage.clear();
      console.log('localStorage check', localStorage.getItem("storedData"));
  })
}

document.addEventListener('DOMContentLoaded', async () => mainEvent()); 