test_recline = function(inputURL) {

	/*var data = [ {
		id : 0,
		date : '2011-01-01',
		x : 1,
		y : 2,
		z : 3,
		country : 'DE',
		geo : {
			lat : 52.56,
			lon : 13.40
		}
	}, {
		id : 1,
		date : '2011-02-02',
		x : 2,
		y : 4,
		z : 24,
		country : 'UK',
		geo : {
			lat : 54.97,
			lon : -1.60
		}
	}, {
		id : 2,
		date : '2011-03-03',
		x : 3,
		y : 6,
		z : 9,
		country : 'US',
		geo : {
			lat : 40.00,
			lon : -75.5
		}
	}, {
		id : 3,
		date : '2011-04-04',
		x : 4,
		y : 8,
		z : 6,
		country : 'UK',
		geo : {
			lat : 57.27,
			lon : -6.20
		}
	}, {
		id : 4,
		date : '2011-05-04',
		x : 5,
		y : 10,
		z : 15,
		country : 'UK',
		geo : {
			lat : 51.58,
			lon : 0
		}
	}, {
		id : 5,
		date : '2011-06-02',
		x : 6,
		y : 12,
		z : 18,
		country : 'DE',
		geo : {
			lat : 51.04,
			lon : 7.9
		}
	} ];

	var dataset = new recline.Model.Dataset({
		records : data
	});

	var $el = $('.inputArea');

	// total number of records resulting from latest query
	$el.append('Total found: ' + dataset.recordCount + '<br />');
	$el.append('Total returned: ' + dataset.records.length);

	$el.append('<hr />');

	// get 2nd record in list (note collection indexes off 0!)
	// this is an instance of a Record object
	var record = dataset.records.at(1);

	// if records have an id you can get by id too ...
	// var record = dataset.records.get(record-id);

	// To get record attribute we use 'get'
	var recdate = record.get('date');

	$el.append('Date is: ' + recdate);
	$el.append('<hr />');

	// We can also convert the Record back to simple JS object
	var simple = record.toJSON();

	$el.append('<h4>Record as simple object</h4>');
	$el.append('<pre>' + JSON.stringify(simple, null, 2) + '</pre>');

	var $el = $('.inputArea');

	// Now list the Fields of this Dataset (these will have be
	// automatically extracted from the data)
	$el.append('Fields: ');
	// Dataset.fields is a Backbone collection of Fields (i.e. record
	// attributes)
	dataset.fields.each(function(field) {
		$el.append(field.id + ' || ');
	});

	$el.append('<hr />');

	// Show all field info
	var json = dataset.fields.toJSON();
	$el.append($('<pre />').append(JSON.stringify(json, null, 2)));*/
	
	var dataset = new recline.Model.Dataset({
	    file: inputURL,
	    backend: 'csv'
	  });
		//var $el = $('.inputArea');
	  // now load - note that this is again async (HTML5 File API is async)
	  // dataset.fetch().done(function() { console.log('here'); });
	  dataset.fetch();

	  // For demonstrations purposes display the data in a grid
	  var grid = new recline.View.Grid({
	    model: dataset
	  });
	  $('.inputArea').append(grid.el);
	  console.log('ok');
};
