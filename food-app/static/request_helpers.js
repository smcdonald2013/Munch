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