function load_data(data){
  var g = document.getElementById("item_list")
  data = data['data']
  for (var x in data) {
      var i = document.createElement("option"); //input element, text
      i.textContent = data[x]['Recipe_Name'];
      i.value = data[x]['Recipe_Name']
      g.appendChild(i);
  }
};

//Fills recipe selected (calls create table)
function fill_selection(){
  selection = document.getElementById('item_list').value
  var hidden = document.getElementById('hidden_input');
  if (selection == "New Recipe"){
    hidden.type = 'text';
    var table = document.getElementById('recipe_table');
    while(table.rows.length > 1) {
      table.deleteRow(-1);
    }
    addRow();
  }
  else {
    hidden.type = 'hidden';
    ulr_str = "/recipes?recipe=" + selection
    make_request(ulr_str,createTable);
  }
};

//Builds the table containing the recipe
function createTable(tableData) {
  //Converts JSON to multidimensional araray
  tableData = tableData['data']
  var outputData = [];
  for(var i = 0; i < tableData.length; i++) {
      var input = tableData[i];
      outputData.push([input.Food_Name, input.Food_Units,input.Food_Units_Name,input.Food_Alt_Units,input.Food_Alt_Name]);
  }
  //Adds data to table
  var table = document.getElementById('recipe_table')
  while(table.rows.length > 1) {
  table.deleteRow(-1);
  }
  var tableBody = load_table(outputData)
  table.appendChild(tableBody);
};

//Called when button clicked, will create the item list if it doesn't exist, else just adds a row. 
function addRow(){
  var table = document.getElementById('recipe_table');
  var n_rows = table.rows.length;

  var exist = document.getElementById('item')
  if (exist == null) {
      make_request("/items",fill_data);
      var row = table.insertRow(-1);
  }
  else { var row = table.insertRow(n_rows-1);}

  var i = 0
  while (i < table.rows[0].cells.length) {
    var cell = document.createElement('td');
    var text = document.createElement('input');
    text.setAttribute('type', 'text')
    text.setAttribute('id',"cell" + i.toString()); //This is new
    cell.appendChild(text)
    row.appendChild(cell)
    i++;
  }
};

//Fills the list of food items. 
function fill_data(data){
  var table = document.getElementById('recipe_table');
  var n_rows = table.rows.length;
  var row = table.insertRow(n_rows);
  var cell = document.createElement('td');
  var f = document.createElement("form");
  f.setAttribute('onchange', "return fill_item()");
  var g = document.createElement("select");
  g.setAttribute('id',"item");
  f.appendChild(g)
  cell.appendChild(f)
  row.appendChild(cell)

  var def = document.createElement("option");
  def.value = "Please Select an Item";
  def.textContent = "Please Select an Item";
  g.appendChild(def)

  data = data['data']
  for (var x in data) {
    var i = document.createElement("option"); //input element, text
    i.textContent = data[x]['Food_Name']
    i.value = data[x]['Food_Name']
    g.appendChild(i)
  }
};

function fill_item(){
  selection = document.getElementById('item').value
  ulr_str = "/items?item=" + selection
  make_request(ulr_str,fillz);
};

//Fills the food item details when the item is selected
function fillz(data){
  var data = data['data'][0]
  var dta = document.getElementsByTagName('tr');
  n_rows = dta.length;
  var inp = dta[n_rows-2].getElementsByTagName('input');
  inp[0].value = data['Food_Name'];
  inp[2].value = data['Name_Cooking_Unit'];
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

  console.log(data)
  xhr.send(data);
  //post_request(url, data);
  return false;
};
