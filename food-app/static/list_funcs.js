//Makes the get request that pulls list of recipes
function load_recipes(data){
  var g = document.getElementById('recipes');
  data = data['data']

  for (var x in data) {
    var i = document.createElement("option"); //input element, text
    i.textContent = data[x]['Recipe_Name'];
    i.value = data[x]['Recipe_Name']
    g.appendChild(i);
  }
};

function addToList(tableid, listid){
  //toggle_visibility('RecipesChoosen') //This should be cleaned up
  e = document.getElementById('RecipesChoosen')
  e.style.display = 'block'
  var table = document.getElementById(tableid);
  var n_rows = table.rows.length;

  var row = table.insertRow(-1);
  var cell = document.createElement('td');
  var text = document.createElement('input');
  text.setAttribute('type', 'text')
  var entry = document.getElementById(listid);
  text.value = entry.value;
  cell.appendChild(text)
  row.appendChild(cell)
};

//Generates grocery list from selections
function createList(tablestring, urlbase, requestfunc){
  toggle_visibility('ShoppingList')
  var myTableArray = [];

  $(tablestring).has('td').each(function() {
      $('td', $(this)).each(function(index, item) {
          arrayitem = $(item).find('input').val()//.html();
          myTableArray.push(arrayitem)
      });
  });

  //Given array, make request
  var queryString = myTableArray.join();
  ulr_str = urlbase + queryString 
  make_request(ulr_str,requestfunc);
};

function createTable(tableData) {
  //Converts JSON to multidimensional araray
  tableData = tableData['data']
  console.log(tableData)
  var outputData = [];
  for(var i = 0; i < tableData.length; i++) {
      var input = tableData[i];
      outputData.push([input.Food_Name, input.Food_Units, input.Food_Units_Name, input.Total_Costs]);
  }
  //Adds data to table
  var table = document.getElementById('grocery_table')

  var tableBody = load_table(outputData)
  table.appendChild(tableBody);
  appendColumn();

  //Adds to content section to push footer down
  var content = document.getElementById('content-inner')
  var content_height = content.clientHeight
  var table_height = table.clientHeight
  var new_height = content_height+table_height+110
  content.style.height = new_height.toString()+"px"
};

// append column to the HTML table
function appendColumn() {
    var tbl = document.getElementById('grocery_table') // table reference
    // open loop for each row and append cell
    for (var i = 1; i < tbl.rows.length; i++) {
        //createCell(tbl.rows[i].insertCell(tbl.rows[i].cells.length), i, 'col');
        var cellnum = tbl.rows[i].cells.length
        var delcell = document.createElement('td');
        var deltext = document.createElement('input');
        deltext.setAttribute('type', 'button');
        deltext.setAttribute('id', 'delete_button');
        deltext.setAttribute('value', 'X');
        deltext.setAttribute('onclick', "SomeDeleteRowFunction(this)")
        delcell.appendChild(deltext);
        tbl.rows[i].appendChild(delcell);
        //input type="button" value="Delete Row" onclick="SomeDeleteRowFunction(this)"
    }
};

function createTableList(tableData) {
  //Converts JSON to multidimensional araray
  tableData = tableData['data']
  var outputData = [];
  for(var i = 0; i < tableData.length; i++) {
      var input = tableData[i];
      outputData.push([input.Food_Name, input.Num_Cooking_Unit,input.Name_Cooking_Unit]);
  }
  //Adds data to table
  var table = document.getElementById('grocery_table')

  var tableBody = load_table(outputData)
  table.appendChild(tableBody);
  sortTable();
};

function post_list_request(){
  var array = [];
  var headers = [];
  $('#grocery_table th').each(function(index, item) {
      headers[index] = $(item).html();
  });
  $('#grocery_table tr').has('td').each(function() {
      var arrayItem = {};
      $('td', $(this)).each(function(index, item) {
          arrayItem[headers[index]] = $(item).find('input').val()//.html();
      });
      array.push(arrayItem);
  });
  var data = JSON.stringify(array);

  url = "/lists"
  var xhr = createCORSRequest('POST', url);
  if (!xhr) {
    throw new Error('CORS not supported');
  }

  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onerror = function() {console.log('There was an error!');};

  console.log(data)
  xhr.send(data);
  return false;
};

function pullList() {
  listbutton = document.getElementById('pullList')
  listbutton.className += " disabled"
  toggle_visibility('ShoppingList')
  make_request("/lists", createTableList);
};

function createFirstList() {
  listbutton = document.getElementById('newList')
  listbutton.className += " disabled"
  //toggle_visibility('RecipeSelection')
  //toggle_visibility('AddRecipes')
  toggle_visibility('RecipesGroup')
};

//All added to combine item
//Called when button clicked, will create the item list if it doesn't exist, else just adds a row. 
function addRow(){
  var table = document.getElementById('grocery_table');
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
    text.setAttribute('size', 2);
    cell.appendChild(text)
    row.appendChild(cell)
    i++;
  }
  var delcell = document.createElement('td');
  var deltext = document.createElement('input');
  deltext.setAttribute('type', 'button');
  deltext.setAttribute('value', 'X');
  deltext.setAttribute('onclick', "SomeDeleteRowFunction(this)")
  delcell.appendChild(deltext);
  row.appendChild(delcell);
};

//Fills the list of food items. 
function fill_data(data){
  var table = document.getElementById('grocery_table');
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
  inp[0].setAttribute('size', data['Food_Name'].length+2);
  inp[2].value = data['Name_Cooking_Unit'];
  inp[2].setAttribute('size', data['Name_Cooking_Unit'].length+2);
};