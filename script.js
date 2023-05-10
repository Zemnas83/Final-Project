function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}


function injectHTML(list) {
  console.log('fired injectHTML');
  const target = document.querySelector("#school_list")
  target.innerHTML = '';
  list.forEach((item, index) => {
    const str = `<li>${item.name}</li>`
    target.innerHTML += str
  })

}

function filterList(list, query) {
  return list.filter((item) => {
    const lowerCaseName = item.name.toLowerCase();
    const lowerCaseQuery = query.toLowerCase();
    return lowerCaseName.includes(lowerCaseQuery);
  })
}

function  cutSchoolList(list){
  console.log("fired cut list")
  const range = [...Array(15).keys()];
  return newArray = range.map((item) => {
    const index = getRandomInt(0, list.length - 1);
    return list[index] 
  })
}

function initMap(){
  const carto = L.map('map').setView([37, -95], 13);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 3,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(carto);
  return carto;
}


async function getCoordinates(address) {
  // Replace YOUR_API_KEY with your actual API key
  const apiKey = 'http://universities.hipolabs.com/search?country=United+States';
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${apiKey}`;

  try {
    // Make a request to the Geocoding API
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      // Extract latitude and longitude from the response
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    } else {
      // Handle the error
      console.error(`Geocoding failed: ${data.status}`);
    }
  } catch (error) {
    console.error(`Request failed: ${error}`);
  }
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
      console.log(item.name)

      L.marker(getCoordinates(item.name)).addTo(map);
  })

}




async function mainEvent() { 
  const form = document.querySelector('.main_form'); 
  const loadDataButton = document.querySelector("#data_load");
  const clearDataButton = document.querySelector("#data_clear");
  const generateListButton = document.querySelector('#generate');
  const textField = document.querySelector('#school');
  
  const loadAnimation = document.querySelector("#data_load_animation");
  loadAnimation.style.display = 'none'; 
  generateListButton.classList.add('hidden');

  const carto = initMap();

  const storedData = localStorage.getItem('storedData');
  let parsedData = JSON.parse(storedData);
  if (parsedData?.length > 0){
      generateListButton.classList.remove('hidden');
  }

  let schoolList = [];


  loadDataButton.addEventListener('click', async (submitEvent) => { // async has to be declared on every function that needs to "await" something
    submitEvent.preventDefault(); // This prevents your page from going to http://localhost:3000/api even if your form still has an action set on it
    console.log('form submission'); // this is substituting for a "breakpoint"
    loadAnimation.style.display = 'inline-block';


    const results = await fetch('http://universities.hipolabs.com/search?country=United+States');

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
    schoolList = cutSchoolList(parsedData);
    console.log(schoolList);
    injectHTML(schoolList);
    markerPlace(schoolList, carto);
  })

  textField.addEventListener('input', (event)=>{
      console.log('input', event.target.value);
      const newList = filterList(schoolList, event.target.value)
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