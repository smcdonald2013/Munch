var item_data;

function load_data(data){
  var g = document.getElementById("item_list")
  item_data = data['data']
  console.log(item_data)
  for (var x in item_data) {
      var i = document.createElement("option"); //input element, text
      i.textContent = item_data[x]['Food_Name'];
      i.value = item_data[x]['Food_Name']
      g.appendChild(i);
  }
};

function fill_selection(){
  //Now we set parameters for GET request that fills selected item's data 
  selection = document.getElementById("item_list").value
  if (selection != "New Item"){
    //ulr_str = "/items?item=" + selection
    //make_request(ulr_str,process_request);
    selection_index = document.getElementById("item_list").selectedIndex
    console.log(item_data[selection_index])
    process_request(item_data[selection_index])
  }
  else {
    document.getElementById('Name').value = "";
    document.getElementById('NumPU').value = "";
    document.getElementById('NamePU').value = "";
    document.getElementById('PPU').value = "";
    document.getElementById('NumCU').value = "";
    document.getElementById('NameCU').value = "";
  }
};

//Fills the fields with request data
function process_request(data){
  document.getElementById('Name').value = data['Food_Name'];
  document.getElementById('NumPU').value = data['Num_Purchase_Unit'];
  document.getElementById('NamePU').value = data['Name_Purchase_Unit'];
  document.getElementById('PPU').value = data['Price_Purchase_Unit'];
  document.getElementById('NumCU').value = data['Num_Cooking_Unit'];
  document.getElementById('NameCU').value = data['Name_Cooking_Unit'];
};

function post_item_request(){
  var request = {};
  request.Food_Name = document.getElementById('Name').value
  request.Num_Purchase_Unit = document.getElementById('NumPU').value
  request.Name_Purchase_Unit = document.getElementById('NamePU').value
  request.Price_Purchase_Unit = document.getElementById('PPU').value
  request.Num_Cooking_Unit = document.getElementById('NumCU').value
  request.Name_Cooking_Unit = document.getElementById('NameCU').value

  url = "/items"
  var xhr = createCORSRequest('POST', url);
  if (!xhr) {
    throw new Error('CORS not supported');
  }

  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onerror = function() {console.log('There was an error!');};

  var data = JSON.stringify(request);
  xhr.send(data);
  return false;
};