function createCORSRequest(method, url) {
  var xhr = new XMLHttpRequest();
  if ("withCredentials" in xhr) {
    // Check if the XMLHttpRequest object has a "withCredentials" property.
    // "withCredentials" only exists on XMLHTTPRequest2 objects.
    xhr.open(method, url, true);
  } else if (typeof XDomainRequest != "undefined") {
    // Otherwise, check if XDomainRequest.
    // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
    xhr = new XDomainRequest();
    xhr.open(method, url);
  } else {
    // Otherwise, CORS is not supported by the browser.
    xhr = null;
  }
  return xhr;
};

function make_request(url, process_request){
  var xhr = createCORSRequest('GET', url);
  if (!xhr) {
    throw new Error('CORS not supported');
  }

  xhr.onload = function() {
   var responseText = xhr.responseText;
   var parse = JSON.parse(responseText);
   process_request(parse);
  };

  //xhr.onerror = function() {console.log('There was an error!');};
  xhr.onerror = function() {console.log(xhr.StatusText);};

  xhr.send();
};

function post_request(url, data){
  console.log(data)
  var xhr = createCORSRequest('POST', url);
  if (!xhr) {
    throw new Error('CORS not supported');
  }

  xhr.setRequestHeader("Content-type", "application/json");

  xhr.onerror = function() {console.log('There was an error!');};

  xhr.send(data);
};

function load_table(tableData){
  var tableBody = document.createElement('tbody');

  tableData.forEach(function(rowData) {
    var row = document.createElement('tr');

    rowData.forEach(function(cellData) {
      var cell = document.createElement('td');
      var text = document.createElement('input')
      text.setAttribute('type', 'text')
      text.value = cellData
      text.innerHTML = cellData
      text.setAttribute('size', cellData.toString().length+2);
      cell.appendChild(text);
      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });
  return tableBody;
};

function array_convert(data){
  data = data['data']
  //This part converts JSON object to multidimensional array
  var outputData = [];

  for(var i = 0; i < data.length; i++) {
    var input = data[i];
    outputData.push([input.Recipe_Name]);
  }
  data = outputData
  //Adds elements of arrary to items
  var datalist = document.getElementById('items');
  data.forEach(function(item) {
    var option = document.createElement('option');
    option.value = item;
    datalist.appendChild(option);
    });
};

function sortTable() {
  //Using code from link below. 
  //https://www.w3schools.com/howto/howto_js_sort_table.asp
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById('grocery_table');
  switching = true;
  /*Make a loop that will continue until
  no switching has been done:*/
  while (switching) {
    //start by saying: no switching is done:
    switching = false;
    rows = table.getElementsByTagName("TR");
    /*Loop through all table rows (except the
    first, which contains table headers):*/
    for (i = 1; i < (rows.length - 1); i++) {
      //start by saying there should be no switching:
      shouldSwitch = false;
      /*Get the two elements you want to compare,
      one from current row and one from the next:*/
      x = rows[i].getElementsByTagName("input")[0];
      y = rows[i + 1].getElementsByTagName("input")[0];
      //check if the two rows should switch place:
      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        //if so, mark as a switch and break the loop:
        shouldSwitch= true;
        break;
      }
    }
    if (shouldSwitch) {
      /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
};

function toggle_visibility(id) {
   var e = document.getElementById(id);
   if(e.style.display == 'block')
      e.style.display = 'none';
   else
      e.style.display = 'block';
};

function SomeDeleteRowFunction(o) {
     //no clue what to put here?
     var p=o.parentNode.parentNode;
         p.parentNode.removeChild(p);
};