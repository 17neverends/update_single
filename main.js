const status_text = document.getElementById('status1');
let page1 = document.querySelector('.step1');
let page2 = document.querySelector('.step2');
let page3 = document.querySelector('.step3');

let sliderpoint2 = document.getElementById('slider2');
let sliderpoint3 = document.getElementById('slider3');
let templates = {
  "templates": [
    "Шаблон 1",
    "Шаблон 2",
    "Шаблон 3"
  ]
};
const customDropdown = document.getElementById('custom_dropdown');

templates.templates.forEach(template => {
  let listItem = document.createElement('li');
  listItem.textContent = template;
  customDropdown.appendChild(listItem);
});

document.addEventListener("click", function(event) {
  var dropdown = document.getElementById("roleList");
  var input = document.getElementById("combobox_value");
  if (event.target !== dropdown && event.target !== input) {
      hideDropdown();
  }
});

function showDropdown() {
  var dropdown = document.getElementById("roleList");
  if (dropdown) {
    dropdown.style.display = "block";
  }
}

function hideDropdown() {
  var dropdown = document.getElementById("roleList");
  if (dropdown) {
    dropdown.style.display = "none";
  }
}


function selectRole(value, label) {
  var input = document.getElementById("combobox_value");
  input.value = label;
  hideDropdown();

  var checkboxContainer = document.getElementById("checkboxContainer");
  var paymentCheckbox = document.getElementById("paymentCheckbox");

  if (value === "sender" || value === "outsider") {
    checkboxContainer.style.display = "block";
  } else {
    checkboxContainer.style.display = "none";
    paymentCheckbox.checked = false;
  }
}


document.getElementById('template_name').addEventListener('click', function() {
  var dropdown = document.getElementById('custom_dropdown');
  var dropdownStyle = window.getComputedStyle(dropdown);
  if (dropdownStyle.getPropertyValue('display') === 'none') {
    dropdown.style.display = 'block';
  } else {
    dropdown.style.display = 'none';
  }
});

document.querySelectorAll('#custom_dropdown li').forEach(item => {
  item.addEventListener('click', event => {
    document.getElementById('template_name').value = event.target.textContent;
    document.getElementById('custom_dropdown').style.display = 'none';
  });
});

let placeCounter = 2;

function addPlace() {
  if (placeCounter > 254){
    status_text.innerText = "Максимум 255 мест";
    return;
  }
  const newPlace = document.createElement('div');
  newPlace.classList.add('place');
  newPlace.id = 'place' + placeCounter;

  newPlace.innerHTML = `
      <p class="place_title">Место ${placeCounter}</p>
      <label>Вес посылки (кг)</label>
      <input type="text" id="box_weight${placeCounter}" name="box_weight${placeCounter}" placeholder="Введите вес посылки">
      <label id="box_size">Размер посылки (см)</label>
      <div class="size">
          <input type="text" id="box_length${placeCounter}" name="box_length${placeCounter}" placeholder="Длина">
          <p class="delimetr" style="color: #808080;">x</p>
          <input type="text" id="box_width${placeCounter}" name="box_width${placeCounter}" placeholder="Ширина">
          <p class="delimetr" style="color: #808080;">x</p>
          <input type="text" id="box_height${placeCounter}" name="box_height${placeCounter}" placeholder="Высота">
      </div>
      <label>Описание товара</label>
      <input type="text" id="desc${placeCounter}" name="desc${placeCounter}" value="ТНП" placeholder="Введите описание товара">
      <button class="created" id="for_delete" type="button" onclick="removePlace('${newPlace.id}')">Удалить</button>
  `;

  document.getElementById('places-container').appendChild(newPlace);

  placeCounter++;
}

function removePlace(placeId) {
  const placeToRemove = document.getElementById(placeId);

  placeToRemove.remove();

  const places = document.getElementsByClassName('place');
  for (let i = 0; i < places.length; i++) {
      const currentPlace = places[i];
      const newPlaceCounter = i + 1;

      currentPlace.id = 'place' + newPlaceCounter;
      currentPlace.querySelector('.place_title').innerText = 'Место ' + newPlaceCounter;

      currentPlace.querySelectorAll('[id^="box_weight"], [id^="box_length"], [id^="box_width"], [id^="box_height"], [id^="desc"]').forEach(element => {
          const currentElementId = element.id;
          element.id = currentElementId.replace(/\d+$/, newPlaceCounter);
      });

      const deleteButton = currentPlace.querySelector('button');
      if (deleteButton) {
          deleteButton.setAttribute('onclick', `removePlace('place${newPlaceCounter}')`);
      }
  }

  placeCounter--;
}

document.addEventListener('click', function(event) {
  if (event.target && event.target.matches('button[id^="delete"]')) {
      const buttonId = event.target.id;
      const placeId = buttonId.replace('delete', 'place');
      removePlace(placeId);
  }
});

let departure_from_list = false;
let destination_from_list = false;
let placesData = [];
let details;


function check_inputs_step1() {
  if (validateFormData()){
      let urlParams = new URLSearchParams(window.location.search);
      let userId = urlParams.get('user_id');  
      let formData = new FormData();
      formData.append('userId', userId);
      
      let datasend = {
        "lang": "rus",
        "from_location": {
            "code": parseInt(selectedDepartureCityNumber, 10),
        },
        "to_location": {
            "code": parseInt(selectedDestinationCityNumber, 10)
        },
        "packages": []
      };
      
      
      placesData.forEach(packageData => {
        datasend.packages.push({
          "height": packageData.height,
          "length": packageData.length,
          "weight": packageData.weight,
          "width": packageData.width,
        });
      });
      
      formData.append('data', JSON.stringify(datasend));

      fetch('/get_data', {
        method: 'POST',
        body: formData
    }).then(() => {
      let responseData = {
        "details": [
            { "type": "дверь - дверь", "cost": "100₽", "datetime": "1-3 раб.д" },
            { "type": "Дверь - склад", "cost": "2000₽", "datetime": "2-3 раб.д" },
            { "type": "Склад - дверь", "cost": "3000₽", "datetime": "3-4 раб.д" },
            { "type": "Склад - склад", "cost": "400₽", "datetime": "1-2 раб.д" }
        ]
    };

    details = responseData.details;

    showDetailsOnPage();
    document.getElementById('status1').innerText = '';

    sliderShowPoint(2);
    sliderpoint2.style.display = 'block';

    })
  } else {
    document.getElementById('status1').innerText = 'Заполните все поля корректно';
  }
}


function isValidNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function applyErrorStyle(element) {
  element.style.borderColor = "red";
}

function removeErrorStyle(element) {
  element.style.borderColor = "";
}



function validateFormData() {
  placesData = [];
  let isValid = true;
  let formData = gatherFormData();
  console.log(formData);
  if (!formData.template_name || formData.template_name.trim() === "") {
    isValid = false;
    applyErrorStyle(document.getElementById("template_name"));
  } else {
    removeErrorStyle(document.getElementById("template_name"));
  }

  if (!formData.role || formData.role.trim() === "") {
    isValid = false;
    applyErrorStyle(document.getElementById("combobox_value"));
  } else {
    removeErrorStyle(document.getElementById("combobox_value"));
  }

  // if (!departure_from_list) {
  //   isValid = false;
  //   applyErrorStyle(document.getElementById("departure_city"));
  // } else {
  //   removeErrorStyle(document.getElementById("departure_city"));
  // }

  // if (!destination_from_list) {
  //   isValid = false;
  //   applyErrorStyle(document.getElementById("destination_city"));
  // } else {
  //   removeErrorStyle(document.getElementById("destination_city"));
  // }


  formData.places.forEach((place, index) => {
    const placeId = index + 1;

    const boxWeight = place[`box_weight${placeId}`];
    const boxLength = place[`box_length${placeId}`];
    const boxWidth = place[`box_width${placeId}`];
    const boxHeight = place[`box_height${placeId}`];
    const desc = place[`desc${placeId}`];

    let isValidPlace = true;

    if (boxWeight != null && boxWeight.trim() === '') {
      applyErrorStyle(document.getElementById(`box_weight${placeId}`));
      isValidPlace = false;
    } else if (boxWeight != null && !isValidNumber(boxWeight)) {
      applyErrorStyle(document.getElementById(`box_weight${placeId}`));
      isValidPlace = false;
    } else {
      removeErrorStyle(document.getElementById(`box_weight${placeId}`));
    }
    
    if (boxLength != null && boxLength.trim() === '') {
      applyErrorStyle(document.getElementById(`box_length${placeId}`));
      isValidPlace = false;
    } else if (boxLength != null && !isValidNumber(boxLength)) {
      applyErrorStyle(document.getElementById(`box_length${placeId}`));
      isValidPlace = false;
    } else {
      removeErrorStyle(document.getElementById(`box_length${placeId}`));
    }
    
    if (boxWidth != null && boxWidth.trim() === '') {
      applyErrorStyle(document.getElementById(`box_width${placeId}`));
      isValidPlace = false;
    } else if (boxWidth != null && !isValidNumber(boxWidth)) {
      applyErrorStyle(document.getElementById(`box_width${placeId}`));
      isValidPlace = false;
    } else {
      removeErrorStyle(document.getElementById(`box_width${placeId}`));
    }
    
    if (boxHeight != null && boxHeight.trim() === '') {
      applyErrorStyle(document.getElementById(`box_height${placeId}`));
      isValidPlace = false;
    } else if (boxHeight != null && !isValidNumber(boxHeight)) {
      applyErrorStyle(document.getElementById(`box_height${placeId}`));
      isValidPlace = false;
    } else {
      removeErrorStyle(document.getElementById(`box_height${placeId}`));
    }
    
    if (desc.trim() === '') {
      applyErrorStyle(document.getElementById(`desc${placeId}`));
      isValidPlace = false;
    } else {
      removeErrorStyle(document.getElementById(`desc${placeId}`));

    }

    if (isValidPlace) {
      const placeData = {
        weight: parseFloat(boxWeight),
        length: parseFloat(boxLength),
        width: parseFloat(boxWidth),
        height: parseFloat(boxHeight),
        desc: desc
      };
      placesData.push(placeData);
    } else {
      isValid = false;
    }
  });

  return isValid;
}





function gatherFormData() {
  let formData = {
    template_name: document.getElementById('template_name').value,
    role: document.getElementById('combobox_value').value,
    paymentCheckbox: document.getElementById('paymentCheckbox').checked,
    departure_city: document.getElementById('departure_city').value,
    destination_city: document.getElementById('destination_city').value,
    places: []
  };

  let i = 1;

while (true) {
    let placeId = `place${i}`;
    let placeElement = document.getElementById(placeId);

    if (!placeElement) {
        break;
    }

    let placeData = {
        [`box_weight${i}`]: document.getElementById(`box_weight${i}`).value,
        [`box_length${i}`]: document.getElementById(`box_length${i}`).value,
        [`box_width${i}`]: document.getElementById(`box_width${i}`).value,
        [`box_height${i}`]: document.getElementById(`box_height${i}`).value,
        [`desc${i}`]: document.getElementById(`desc${i}`).value
    };

    formData.places.push(placeData);
    i++;
}

  return formData;
}

//////////////////////////////////////////////////////////////


let popular_cities = [];
let filterTimeout;
let lastInputValue = '';
let selectedDepartureCityNumber;
let selectedDestinationCityNumber;

function handleInput(inputElement, list, input_value, otherList) {
  clearTimeout(filterTimeout);

  const trimmedInputValue = input_value.trim();

  if (trimmedInputValue.length < 2) {
      list.style.display = 'none';
      return;
  }

  filterTimeout = setTimeout(async () => {
      const response = await fetch(`/search_cities?query=${encodeURIComponent(trimmedInputValue)}`);
      const result = await response.json();
      if (inputElement.value !== lastInputValue) {
          return;
      }
      const filtered_cities = result.data;
      dropdownList(list, filtered_cities, [], trimmedInputValue, inputElement, otherList);
      if (trimmedInputValue !== '') {
          inputElement === departureInput ? departure_from_list = false : destination_from_list = false;
      }
  }, 300);

  lastInputValue = inputElement.value;
}

function displayAllItems(list, display_items, input_value, inputElement) {
  list.innerHTML = '';
  const inputLower = input_value.toLowerCase();
  display_items.forEach(item => {
      const li = document.createElement('li');
      li.className = 'dropdown-item';
      const index = item.lastIndexOf(",");
      const cityText = index !== -1 ? item.substring(0, index) : item;
      const cityNumber = index !== -1 ? item.substring(index + 1) : '';
      const matchIndex = cityText.toLowerCase().indexOf(inputLower);
      if (matchIndex !== -1) {
          const before = document.createTextNode(cityText.substring(0, matchIndex));
          const match = document.createElement('span');
          match.style.fontWeight = 'bold';
          match.textContent = cityText.substring(matchIndex, matchIndex + inputLower.length);
          const after = document.createTextNode(cityText.substring(matchIndex + inputLower.length));

          li.appendChild(before);
          li.appendChild(match);
          li.appendChild(after);
      } else {
          li.textContent = cityText;
      }
      li.addEventListener('click', function () {
        inputElement.value = cityText.trim();
        list.style.display = 'none';
        if (list === departureCityList) {
            departure_from_list = true;
            selectedDepartureCityNumber = cityNumber.trim();
        } else if (list === destinationCityList) {
            destination_from_list = true;
            selectedDestinationCityNumber = cityNumber.trim();
        }
    });
      list.appendChild(li);
      li.classList.add('fade-in');
      li.addEventListener('animationend', () => {
          list.style.display = 'block';
      });
  });
}


function dropdownList(list, filtered_cities, filtered_regions, input_value, inputElement, otherList) {

    let itemsToDisplay = [];
    if (input_value !== '') {
        if (filtered_cities.length > 0) {
            itemsToDisplay = filtered_cities;
        } else if (filtered_regions.length > 0) {
            itemsToDisplay = filtered_regions;
        }
    }
    list.style.display = itemsToDisplay.length > 0 ? 'block' : 'none';
    if (itemsToDisplay.length > 0) {
        displayAllItems(list, itemsToDisplay, input_value, inputElement);
    }
    if (otherList) {
        otherList.style.display = 'none';
    }
}

const departureInput = document.getElementById('departure_city');
const targetInput = document.getElementById('destination_city');
const departureCityList = document.getElementById('departure_city-list');
const destinationCityList = document.getElementById('destination_city-list');

function handleInputChange(inputElement, list, otherList) {
  const trimmedInputValue = inputElement.value.trim();
  handleInput(inputElement, list, trimmedInputValue, otherList);
}

function setupEventListeners() {
    departureInput.addEventListener('input', () => handleInputChange(departureInput, departureCityList, destinationCityList));
    targetInput.addEventListener('input', () => handleInputChange(targetInput, destinationCityList, departureCityList));

    document.addEventListener('click', event => {
        if (event.target !== departureInput && event.target !== targetInput) {
            departureCityList.style.display = 'none';
            destinationCityList.style.display = 'none';
        }
    });

    departureInput.addEventListener('blur', () => clearTimeout(filterTimeout));
    targetInput.addEventListener('blur', () => clearTimeout(filterTimeout));
}

async function init() {
    setupEventListeners();
}

window.onload = init;

function scrollToTop() {
  window.scrollTo({
      top: 0,
      behavior: 'smooth'
  });
}


// window.TelegramWebviewProxy.postEvent('web_app_setup_closing_behavior', JSON.stringify({ need_confirmation: true }));
///////////////////////////

const detailsContainer = document.getElementById("detailsContainer");
const statusParagraph = document.getElementById("status2");
let selectedType;
let selectedCost;
let selectedDetail = null;

function createDetailItem(detail) {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("item");

    const createAndAppend = (tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        itemDiv.appendChild(element);
    };

    createAndAppend("p", detail.type);
    createAndAppend("p", detail.cost);
    createAndAppend("p", detail.datetime);

    itemDiv.addEventListener("click", function () {
        if (selectedType === detail.type && selectedCost === detail.cost) {
            itemDiv.classList.remove("selected");
            selectedType = null;
            selectedCost = null;
            selectedDetail = null;
        } else {
            if (selectedDetail) {
                selectedDetail.classList.remove("selected");
            }
            itemDiv.classList.add("selected");
            selectedType = detail.type;
            selectedCost = detail.cost;
            selectedDetail = itemDiv;
        }
    });

    return itemDiv;
}


function sortByCost() {
  detailsContainer.innerHTML = "";
  details
      .slice()
      .sort((a, b) => parseInt(a.cost) - parseInt(b.cost))
      .forEach(function (detail) {
          const itemDiv = createDetailItem(detail);
          detailsContainer.appendChild(itemDiv);
          if (selectedType === detail.type) {
              itemDiv.classList.add("selected");
              selectedDetail = itemDiv;
          }
      });
}

function sortByTime() {
  detailsContainer.innerHTML = "";
  details
      .slice()
      .sort((a, b) => {
          const aTime = a.datetime.split(" ")[0].split("-").map(num => parseInt(num));
          const bTime = b.datetime.split(" ")[0].split("-").map(num => parseInt(num));

          if (aTime[0] !== bTime[0]) {
              return aTime[0] - bTime[0];
          } else {
              return aTime[1] - bTime[1];
          }
      })
      .forEach(function (detail) {
          const itemDiv = createDetailItem(detail);
          detailsContainer.appendChild(itemDiv);
          if (selectedType === detail.type) {
              itemDiv.classList.add("selected");
              selectedDetail = itemDiv;
          }
      });
}

function resetFilters() {
  detailsContainer.innerHTML = "";
  details.forEach(function (detail) {
      const itemDiv = createDetailItem(detail);
      detailsContainer.appendChild(itemDiv);
      if (selectedType === detail.type) {
          itemDiv.classList.add("selected");
          selectedDetail = itemDiv;
      }
  });
}


function showDetailsOnPage() {
  detailsContainer.innerHTML = '';

  details.forEach(detail => {
    const itemDiv = createDetailItem(detail);
    if (detail.type === selectedType && detail.cost === selectedCost) {
      itemDiv.classList.add("selected");
      selectedDetail = itemDiv;
    }
    detailsContainer.appendChild(itemDiv);
  });
}




  
document.getElementById("sortSelect").addEventListener("change", function (event) {
    const selectedOption = event.target.value;
    if (selectedOption === "default") {
        resetFilters();
    } else if (selectedOption === "cost") {
        sortByCost();
    } else if (selectedOption === "time") {
        sortByTime();
    }
});




function sliderShowPoint(point){
  var buttons = document.querySelectorAll('.slider_button');
  buttons.forEach(function(btn){
    btn.classList.remove('active');
  });
  document.getElementById('slider' + point).classList.add('active');
  
  if (point === 1)
  {
    page1.style.display = 'block';
    page2.style.display = 'none';
    page3.style.display = 'none';
    sliderpoint2.style.display = 'none';
    sliderpoint3.style.display = 'none';

  } 
    else if(point === 2)
  {
    page1.style.display = 'none';
    page2.style.display = 'block';
    page3.style.display = 'none';
    sliderpoint3.style.display = 'none';


  }
    else if (point === 3)
  {
    page1.style.display = 'none';
    page2.style.display = 'none';
    page3.style.display = 'block';

  }
}


document.getElementById("confirm2").addEventListener("click", function () {
  if (!selectedType) {
      statusParagraph.textContent = "Выберите тариф";
  } else {
      console.log(selectedType);
      data = calculatePackagesSum(gatherFormData());
      star = false;
      initialTotalCost = calculateInitialCost();
      totalcost = initialTotalCost;
      updateCost();
      var manualRadio = document.getElementById("manual");
      manualRadio.checked = true;
      document.getElementById('status2').innerText = '';
      sliderShowPoint(3);
      sliderpoint3.style.display = 'block';

  }
});



function calculatePackagesSum(shipmentData) {
    const { places } = shipmentData;

    let data = {
        "packages": []
    };

    const sum = {
        height: 0,
        length: 0,
        weight: 0,
        width: 0
    };

    places.forEach((box, index) => {
        sum.height += parseFloat(box[`box_height${index + 1}`]);
        sum.length += parseFloat(box[`box_length${index + 1}`]);
        sum.weight += parseFloat(box[`box_weight${index + 1}`]);
        sum.width += parseFloat(box[`box_width${index + 1}`]);
    });

    data.packages.push({
        "height": sum.height,
        "length": sum.length,
        "weight": sum.weight,
        "width": sum.width,
        "type": selectedType,
    });

    return data;
}




let data;

let boxData = {
  "Коробка XS": {
  "ширина": 17,
  "длина": 12,
  "высота": 9,
  "вес": 1,
  "стоимость": 20
  },
  "Коробка S": {
  "ширина": 23,
  "длина": 19,
  "высота": 10,
  "вес": 2,
  "стоимость": 40
  },
  "Коробка M": {
  "ширина": 33,
  "длина": 25,
  "высота": 15,
  "вес": 5,
  "стоимость": 60
  },
  "Коробка L": {
  "ширина": 31,
  "длина": 25,
  "высота": 38,
  "вес": 12,
  "стоимость": 70
  },
  "Коробка 1": {
  "ширина": 17,
  "длина": 12,
  "высота": 10,
  "вес": 1,
  "стоимость": 35
  },
  "Коробка 2": {
  "ширина": 24,
  "длина": 17,
  "высота": 10,
  "вес": 1,
  "стоимость": 50
  },
  "Коробка 3": {
  "ширина": 34,
  "длина": 24,
  "высота": 10,
  "вес": 2,
  "стоимость": 80
  },
  "Коробка 4": {
  "ширина": 24,
  "длина": 24,
  "высота": 21,
  "вес": 3,
  "стоимость": 90
  },
  "Коробка 5": {
  "ширина": 40,
  "длина": 24,
  "высота": 21,
  "вес": 5,
  "стоимость": 100
  },
  "Коробка 6": {
  "ширина": 40,
  "длина": 35,
  "высота": 28,
  "вес": 10,
  "стоимость": 150
  },
  "Коробка 7": {
  "ширина": 60,
  "длина": 35,
  "высота": 29,
  "вес": 15,
  "стоимость": 190
  },
  "Коробка 8": {
  "ширина": 47,
  "длина": 40,
  "высота": 43,
  "вес": 20,
  "стоимость": 200
  },
  "Коробка 9": {
  "ширина": 69,
  "длина": 39,
  "высота": 42,
  "вес": 30,
  "стоимость": 250
  }
}


class Result {
  constructor(
  field1 = false,
  field2 = false,
  field3 = false,
  field4 = false,
  field5 = false,
  field6 = false,
  field7 = [],
  ) {
  this.field1 = field1;
  this.field2 = field2;
  this.field3 = field3;
  this.field4 = field4;
  this.field5 = field5;
  this.field6 = field6;
  this.field7 = field7;
  }

  logInfo() {
      console.log('Field 1:', this.field1);
      console.log('Field 2:', this.field2);
      console.log('Field 3:', this.field3);
      console.log('Field 4:', this.field4);
      console.log('Field 5:', this.field5);
      console.log('Field 6:', this.field6);
      console.log('Field 7:', this.field7);
  }
}

const result = new Result();


const checkboxService1 = document.getElementById('service1');

const checkboxService2 = document.getElementById('service2');
const checkboxService3 = document.getElementById('service3');
const checkboxService4 = document.getElementById('service4');

const checkboxService5 = document.getElementById('service5');
const checkboxService6 = document.getElementById('service6');
const floorLift = document.getElementById('floorLift');
const manualRadio = document.getElementById('manual');
const liftRadio = document.getElementById('lift');
const bubbleWrapMeters = document.getElementById('bubbleWrapMeters');
const additionalCostElement = document.getElementById('additional_cost');
checkboxService1.addEventListener('change', updateCost);

checkboxService2.addEventListener('change', updateCost);
checkboxService3.addEventListener('change', updateCost);
checkboxService4.addEventListener('change', updateCost);

checkboxService5.addEventListener('change', updateCost);
checkboxService6.addEventListener('change', updateCost);
floorLift.addEventListener('input', updateCost);
manualRadio.addEventListener('change', updateCost);
liftRadio.addEventListener('change', updateCost);
bubbleWrapMeters.addEventListener('input', updateCost);
const cost_2 = document.getElementById('service_2_p');
const cost_3 = document.getElementById('service_3_p');
const cost_5 = document.getElementById('service_5_p');
const cost_6 = document.getElementById('service_6_p');
const cost_7 = document.getElementById('service_7_p');
const floorType = document.querySelector('input[name="floorType"]:checked');
additionalCostElement.textContent = 'Доп. услуги не выбраны';
let initialTotalCost;
let totalcost;

function updateCost() {
  
  
  let additionalCost = 0;
  let box_cost = 0;
  if (checkboxService1.checked){
      result.field1 = true;
  } else {
      result.field1 = false;
  }

  if (checkboxService2.checked) {
      additionalCost += 10;
      cost_2.innerHTML = '10₽';
      result.field2 = '10₽';

  } else {
      cost_2.innerHTML = '';
      result.field2 = false;

  }

  if (checkboxService3.checked) {
      additionalCost += 50;
      cost_3.innerHTML = '50₽';
      result.field3 = '50₽';
  } else {
      cost_3.innerHTML = '';
      result.field3 = false;

  }


  if (checkboxService4.checked){
      result.field4 = true;
  } else {
      result.field4 = false;
  }

  if (checkboxService5.checked) {
      document.getElementById('bubbleWrapSection').style.display = 'block';   

  } else {
      document.getElementById('bubbleWrapSection').style.display = 'none';
      bubbleWrapMeters.value = '';
      cost_5.innerText = '';
      result.field5 = false;

  }

  if (checkboxService5.checked && bubbleWrapMeters.value.trim() !== "") {
      let metersValue = bubbleWrapMeters.value.trim();
      if (/^\d+$/.test(metersValue)) {
          const meters = parseInt(metersValue, 10);
  
          if (!isNaN(meters) && meters >= 0) {
              additionalCost += meters * 70;
              cost_5.innerText = `${meters * 70}₽`;
              result.field5 = [`${meters * 70}₽`, meters + 'м'];

          } else {
              cost_5.innerText = '';
              bubbleWrapMeters.value = "";
              result.field5 = false;

          }
      } else {
          cost_5.innerText = '';
          bubbleWrapMeters.value = "";
          result.field5 = false;

      }
  } else {
      cost_5.innerText = '';
      bubbleWrapMeters.value = "";
      result.field5 = false;
  }
  

  const floorLift = document.getElementById('floorLift');
  let status = document.getElementById('status_for_info');
  const weight = data.packages[0].weight;

  if (checkboxService6.checked) {
      if (weight <= 150) {
          acsentToTheFloor.style.display = 'block';
          status.style.display = 'none';
      } else {
          acsentToTheFloor.style.display = 'none';
          status.style.display = 'block';
          floorLift.value = '';
          manualRadio.checked = false;
          liftRadio.checked = false;
          status.innerText = 'Обратитесь к менеджеру для индивидуального расчета';
      }
  } else {
      acsentToTheFloor.style.display = 'none';
      status.innerText = '';
      status.style.display = 'none';
      cost_6.innerText = '';
      floorLift.value = '';
      manualRadio.checked = false;
      liftRadio.checked = false;
      result.field6 = false;

  }

  const floorType = document.querySelector('input[name="floorType"]:checked');
  let cost = 0;
  if (checkboxService6.checked && floorType && floorLift.value.trim() !== "") {
      

      const floorsValue = floorLift.value.trim();
  
      if (/^\d+$/.test(floorsValue)) {
          const floors = parseInt(floorsValue, 10);
  
          if (!isNaN(floors) && floors >= 0) {

              if (weight <= 30) {
                  status.style.display = 'block';
                  status.innerText = 'Доставка бесплатная';
                  acsentToTheFloor.style.display = 'none';
                  status.style.display = 'block';
                  floorLift.value = '';
                  manualRadio.checked = false;
                  liftRadio.checked = false;
                  cost_6.innerText = '';
                  result.field6 = false;
              } else {
                  if (floorType.value === "manual") {
                      if (weight >= 30 && weight <= 50) {
                          cost += 70 * floors;
                      } else if (weight <= 100) {
                          cost += 100 * floors;
                      } else if (weight <= 150) {
                          cost += 130 * floors;
                      } else if (weight >= 150) {
                          cost += 200 * floors;
                      }
                  } else {
                      if (weight >= 30 && weight <= 50) {
                          cost += 70;
                      } else if (weight <= 100) {
                          cost += 100;
                      } else if (weight <= 150) {
                          cost += 130;
                      } else {
                          cost += 1500;
                      }
                  }
                  totalcost += cost;
  
                  cost_6.innerText = `${cost}₽`;
                  result.field6 = [`${cost}₽`,floorsValue, floorType.value];

              }
          } else {
              floorLift.value = "";
              cost_6.innerText = '';
              result.field6 = false;

          }
      } else {
          floorLift.value = "";
          cost_6.innerText = '';
          result.field6 = false;

      }
  } else {
          cost_6.innerText = '';
          result.field6 = false;
  }
  

  const boxCountInputs = document.querySelectorAll('.box-count-input');
  box_cost = 0;

  boxCountInputs.forEach((countInput) => {
      const count = parseFloat(countInput.value) || 0;
      const boxName = countInput.closest('.box').querySelector('.box_name').textContent;

      if (count > 0) {
          box_cost += count * parseFloat(boxData[boxName].стоимость);
      } 
  });

  cost_7.innerText = box_cost > 0 ? `${box_cost}p.` : ''; 
  result.field7 = box_cost > 0 ? `${box_cost}p.` : false; ; 

  totalcost = initialTotalCost + additionalCost + box_cost + cost;

  if (totalcost > 0) {
      if (star) {
          additionalCostElement.textContent = `Стоимость доп. услуг: ${totalcost}₽*`;
      } else {
          additionalCostElement.textContent = `Стоимость доп. услуг: ${totalcost}₽`;
      }
  } else {
      additionalCostElement.textContent = 'Доп. услуги не выбраны';
  }

}
const checkboxService7 = document.getElementById('service7');
const boxesContainer = document.querySelector('.boxes');

checkboxService7.addEventListener('change', showBoxOptions);

function showBoxOptions() {
  const boxesContainer = document.getElementById('boxesContainer');
  boxesContainer.innerHTML = '';

  if (checkboxService7.checked) {

      for (const boxName in boxData) {
          const box = boxData[boxName];

          if (
              box.ширина > data.packages[0].width &&
              box.длина > data.packages[0].length &&
              box.высота > data.packages[0].height
          ) {
              const boxElement = document.createElement('div');
              boxElement.classList.add('box');

              const boxNameElement = document.createElement('p');
              boxNameElement.classList.add('box_name');
              boxNameElement.textContent = boxName;

              const boxDetailsElement = document.createElement('p');
              boxDetailsElement.classList.add('box_details');
              boxDetailsElement.textContent = `до ${box.вес} кг. (${box.ширина} x ${box.длина} x ${box.высота})`;

              const boxCounterElement = document.createElement('div');
              boxCounterElement.classList.add('box_counter');

              const decreaseButton = document.createElement('button');
              decreaseButton.classList.add('counter-button');
              decreaseButton.textContent = '-';
              decreaseButton.type = 'button';
              decreaseButton.id = `decreaseButton`;

              decreaseButton.addEventListener('click', () => updateBoxCount(boxName, -1));

              const countInput = document.createElement('input');
              countInput.classList.add('box-count-input');
              countInput.type = 'text';
              countInput.value = '0';
              countInput.addEventListener('input', (event) => updateBoxCount(boxName, event.target.value));

              const increaseButton = document.createElement('button');
              increaseButton.classList.add('counter-button');
              increaseButton.textContent = '+';
              increaseButton.type = 'button';
              increaseButton.id = `increaseButton`;

              increaseButton.addEventListener('click', () => updateBoxCount(boxName, 1));

              boxCounterElement.appendChild(decreaseButton);
              boxCounterElement.appendChild(countInput);
              boxCounterElement.appendChild(increaseButton);

              boxElement.appendChild(boxNameElement);
              boxElement.appendChild(boxDetailsElement);
              boxElement.appendChild(boxCounterElement);

              boxesContainer.appendChild(boxElement);
          }
      }

      boxesContainer.style.display = 'grid';
  } else {
      boxesContainer.style.display = 'none';
      cost_7.innerText = '';
      updateCost();
      result.field7 = [];  
  }

}




let globalResult = {
  field7: {}
};
function updateBoxCount(boxName, newValue) {
  const boxes = document.querySelectorAll('.box');

  for (const box of boxes) {
      const nameElement = box.querySelector('.box_name');

      if (nameElement && nameElement.textContent.includes(boxName)) {
          const countInput = box.querySelector('.box-count-input');
          let count = parseFloat(countInput.value) || 0;

          if (typeof newValue === 'number') {
              count += newValue;
          } else {
              count = parseFloat(newValue) || 0;
          }

          count = Math.max(0, count);
          countInput.value = count;
          if (count > 0) {
              box.style.backgroundColor = '#30cc5f';
          } else {
              box.style.backgroundColor = '';
          }

          updateCost();

          const selectedBoxData = boxData[boxName];

          if (typeof globalResult.field7 !== 'object' || globalResult.field7 === null) {
              globalResult.field7 = {};
          }

          if (count > 0) {
              globalResult.field7[boxName] = {
                  название: boxName,
                  размер: `${selectedBoxData.ширина} x ${selectedBoxData.длина} x ${selectedBoxData.высота}`,
                  вес: selectedBoxData.вес,
                  кол_во: count,
                  стоимость: count * selectedBoxData.стоимость
              };
          } else {
              delete globalResult.field7[boxName];
          }

          break;
      }
  }
}

function submit_info() {
result.logInfo();
console.log(globalResult);

}


let star;

function calculateInitialCost() {
  let totalcost = 0;
  let packageType = data.packages[0].type.toLowerCase();
  let weight = data.packages[0].weight;
  console.log(packageType);
  console.log(weight);
  document.getElementById('totalcost').innerText = `Стоимость доставки: ${selectedCost}`;
  let doorLocation = '';
  let status = document.getElementById('floor_status');

  if (weight < 30 || weight > 150){
      status.innerText = '';
      status.style.display = 'none';
      return 0;
      
  } 
  const packageParts = packageType.split("-").map(part => part.trim().toLowerCase());
  console.log(packageParts);
  if (packageParts.includes('дверь')) {
      if (packageParts[0].includes("дверь") && packageParts[1].includes("дверь")) {
          doorLocation = 'отправителя и получателя';
      } else if (packageParts[0].includes("дверь")) {
          doorLocation = 'отправителя';
      } else if (packageParts[1].includes("дверь")) {
          doorLocation = 'получателя';
      }
  }
  
  let cost = 0;
  let prr = 0;
  if (packageType.includes('дверь')) {
      let mult = 1;
      if (doorLocation === 'отправителя и получателя') {
          mult = 2;
      }

      if (weight >= 30 && weight <= 50) {
          cost += 300 * mult;
          prr += 300 * mult;
      } else if (weight > 50 && weight <= 75) {
          cost += 600 * mult;
          prr += 600 * mult;
      } else if (weight > 75 && weight <= 100) {
          cost += 1000 * mult;
          prr += 1000 * mult;
      } else if (weight > 100 && weight <= 150) {
          cost += 1500 * mult;
          prr += 1500 * mult;
      }
  }
  console.log(doorLocation);
  totalcost += cost;
  if (doorLocation) {
      status.style.display = 'block';
      status.innerText = `*В стоимость включены погрузка-разгрузочные работы у ${doorLocation} (${prr}₽)`;
      star = true
  } else {
      status.style.display = 'none';
  }
  if (cost > 0) {
      if (star) {
          additionalCostElement.textContent = `Стоимость доп. услуг: ${totalcost}₽*`;

      } else {
          additionalCostElement.textContent = `Стоимость доп. услуг: ${totalcost}₽`;

      }
  } else {
      additionalCostElement.textContent = 'Доп. услуги не выбраны';
  }
  return cost;
}

