var ui = ui || {};

ui.sources_preview = ui.sources_preview || {};

ui.sources_preview.sparqlEndpoint = {};

ui.sources_preview.sparqlEndpoint.addSparqlEndpointTab = function(endpoint){
	
	var endpoint_panel_class = 'sparql-endpoint-panel';
	
	var endpoint_panel = $('<div>').addClass(endpoint_panel_class).attr("related-sparql-endpoint",endpoint.URL);
	endpoint_panel.load('scripts/sources-import/sources-ui/sparql-endpoint-panel.html',function(){
		
		var endpoint_info_area = $(this).find('.sparql-url-text'); 
		endpoint_info_area.text(endpoint.URL);
		
		
		var openEditor = endpoint_panel.find('#open-sparql-editor');
		
		openEditor.on('click', function(event) {
			event.preventDefault();
			var url = $(event.target).closest('.sparql-endpoint-panel').attr("related-sparql-endpoint");
			ui.sparqlEndpointEditor.open(url);
		});
		var queries_of_endpoint = endpoint.queries;
		for(var i = 0;i < queries_of_endpoint.length; i++){
			var query_value = queries_of_endpoint[i].value;
			console.log(query_value);
			ui.sources_preview.sparqlEndpoint.addQueryToQueryInfoArea(query_value);
		}
	});
	var options = {
			label:endpoint.URL,
			tab_category:"sparql-endpoint"
	};
	
	var id = ui.sources_preview.addTab(endpoint_panel,options,true);  
	return id;
};


ui.sources_preview.sparqlEndpoint.addQueryToQueryInfoArea = function(queryString){
	
	var query_info_area = $('.sparql-queries-info');
	
	var query_info_container_class = 'query-info-container';
	var query_info_box_class = 'query-info-box';
	
	var query_info_box = $('<div>').addClass(query_info_box_class);
	query_info_box.text(queryString);
	
	
	var query_info_container =  $('<div>').addClass(query_info_container_class);
	var view_query_data_button_area = $('<div class="view-query-data-button-area">'+
									   '<button type="button" class="view-query-data-button">View data</button>'+
									   /*'<button type="button" class="delete-query-data-button">Delete related results</button>'+*/
									   '</div>');
	
	query_info_container.append(query_info_box);
	query_info_container.append(view_query_data_button_area);
	query_info_area.append(query_info_container);
	
	view_query_data_button_area.on('click','.view-query-data-button',function(event){
		event.preventDefault();
		console.log('event target is ' + event.target.nodeName);
		var query_container = $(event.target).closest('div.query-info-container');
		var query = $(query_container.children()[0]).text();
		console.log(query);
		ui.sources_preview.sparqlEndpoint.displayQuery(query);
		
	});
	view_query_data_button_area.on('click','.delete-query-data-button',function(event){
		event.preventDefault();
		console.log('event target is ' + event.target.nodeName);
		var query_container = $(event.target).closest('div.query-info-container');
		var query = $(query_container.children()[0]).text();
		console.log(query);
		ui.sources_preview.sparqlEndpoint.deleteQuery(query);
		query_container.remove();
	});
	
};

ui.sources_preview.sparqlEndpoint.displayQuery = function(query){

	var url = $('.sparql-endpoint-panel').attr("related-sparql-endpoint");
	
	var endpoint = controller.findEndpoint(url);
	
	var query_object = controller.findQuery(endpoint,query);
	
	var dataset = controller.findFileByName(query_object.related_file_name);
	
	var options = {
			query:query,
			label:"query data",
			tab_class:"query-data-tab",
			columnWidth:400
	};
	ui.sources_preview.queryResultsProcessDisplay(dataset,options);
};

ui.sources_preview.sparqlEndpoint.deleteQuery = function(query){
	
	var url = $('.sparql-endpoint-panel').attr("related-sparql-endpoint");
	var endpoint= controller.findEndpoint(url);
	var deleteResult = controller.deleteQuery(endpoint,query);
	if (deleteResult.deleteSucceeded){
		ui.importedDatasets.deleteDatasetRow(deleteResult.filename);
		var filenames = [];
		filenames.push(deleteResult.filename);
		source.deleteRelatedFiles(filenames);
	}
};