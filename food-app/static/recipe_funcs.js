var recipe_data;
var item_data;

function load_data(data){
  var g = document.getElementById("item_list")
  recipe_data = data['data']
  console.log(recipe_data)
  for (var x in recipe_data) {
      var i = document.createElement("option"); //input element, text
      i.textContent = recipe_data[x]['Recipe_Name'];
      i.value = recipe_data[x]['Recipe_Name']
      g.appendChild(i);
  }
};

//Fills recipe selected (calls create table)
function fill_selection(){
  var e = document.getElementById('recipe_obj')
  if(e.style.display != "block"){
    toggle_visibility('recipe_obj')
  }
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
    selection_index = document.getElementById("item_list").selectedIndex-2
    createTable(recipe_data[selection_index]["0"])
  }
};

//Builds the table containing the recipe
function createTable(tableData) {
  //Converts JSON to multidimensional araray
  //tableData = tableData['data']
  var outputData = [];
  for(var i = 0; i < tableData.length; i++) {
      var input = tableData[i];
      outputData.push([input.Food_Name, input.Food_Units,input.Food_Units_Name]);
  }
  //Adds data to table
  var table = document.getElementById('recipe_table')
  while(table.rows.length > 1) {
  table.deleteRow(-1);
  }
  var tableBody = load_table(outputData)
  table.appendChild(tableBody);

    //Adds to content section to push footer down
  var content = document.getElementById('content-inner')
  var content_height = content.clientHeight
  var table_height = table.clientHeight
  var add_height = table_height-content_height+250
  var new_height = Math.max(add_height,0)+content_height
  content.style.height = new_height.toString()+"px"
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
    if (i == 1) {
      text.setAttribute('size', 4);
    } else {
      text.setAttribute('size', 15);
    }
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
  row.setAttribute('id',"select_row");
  var cell = document.createElement('td');
  var f = document.createElement("form");
  f = document.createElement("form");
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

  item_data = data['data']
  for (var x in item_data) {
    var i = document.createElement("option"); //input element, text
    i.textContent = item_data[x]['Food_Name']
    i.value = item_data[x]['Food_Name']
    g.appendChild(i)
  }
};

function fill_item(){
  //selection = document.getElementById('item').value
  selection_index = document.getElementById("item").selectedIndex-1
  process_request(item_data[selection_index])
};

//Fills the food item details when the item is selected
function process_request(data){
  var dta = document.getElementsByTagName('tr');
  n_rows = dta.length;
  var inp = dta[n_rows-2].getElementsByTagName('input');
  inp[0].value = data['Food_Name'];
  inp[2].value = data['Name_Cooking_Unit'];
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
