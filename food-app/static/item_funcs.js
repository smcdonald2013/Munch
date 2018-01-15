function load_data(data){
  var g = document.getElementById("item_list")
  data = data['data']
  for (var x in data) {
      var i = document.createElement("option"); //input element, text
      i.textContent = data[x]['Food_Name'];
      i.value = data[x]['Food_Name']
      g.appendChild(i);
  }
};

function fill_selection(){
  //Now we set parameters for GET request that fills selected item's data 
  selection = document.getElementById("item_list").value
  if (selection != "New Item"){
    ulr_str = "/items?item=" + selection
    make_request(ulr_str,process_request);
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
  var data = data['data'][0]
  console.log(data)
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

//Sends the recipe to the API
function post_recipe_request(){
  var array = [];
  var headers = [];
  $('#recipe_table th').each(function(index, item) {
      headers[index] = $(item).html();
  });
  $('#recipe_table tr').has('td').each(function() {
      var arrayItem = {};
      $('td', $(this)).each(function(index, item) {
          arrayItem[headers[index]] = $(item).find('input').val()
      });
      array.push(arrayItem);
  });

  var e = document.getElementById("item_list");
  var hidden = document.getElementById('hidden_input');
  if (e.value == "New Recipe"){
    var recipe_name = hidden.value;
    console.log(recipe_name);
  }
  else { var recipe_name = e.value;}


  for(var i = 0; i < array.length; i++) {
    var item = array[i]
    item['Recipe_Name'] = recipe_name
  }

  var data = JSON.stringify(array);

  url = "/recipes"

  var xhr = createCORSRequest('POST', url);
  if (!xhr) {
    throw new Error('CORS not supported');
  }

  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onerror = function() {console.log('There was an error!');};

  xhr.send(data);
  //post_request(url, data);
  return false;
};
