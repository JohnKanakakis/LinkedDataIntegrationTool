var ui = ui || {};

ui.query_editor = {
		current_connection:{},
		div:{},
		position:{}
};


ui.query_editor.init = function(){
	
	var query_editor_window = $('.query-editor-window');
	var self = this;
	query_editor_window.load('scripts/sources-import/editors/query-editor.html',function(){
		var query_editor_box = $('.query-editor-box');
		self.div = query_editor_box;
		self.div.draggable({
			cursor: "move",
			handle:".window-box-header"
		});
		var mainTabs = $("#main-tabs");
		var height = 500;
		var width = 500;
		self.position = {
			'top': (mainTabs.height() - height) / 2,
			'left': (mainTabs.width() - width) / 2,
			'width': width,
			'height':height
		};
		self.div.css(self.position);
		
		var textarea = self.div.find('textarea#query');
		textarea.width(self.div.width()-10);
		textarea.height(self.div.height() - 180);
		textarea.css({
		    'max-width':self.div.width()-50,
		    'max-height':self.div.height() - 180
		});
		
		
		query_editor_box.on("click", ".query-editor-close-icon", function(event){ 
	
			event.preventDefault();
			ui.query_editor.close();
		});
		query_editor_box.on("click", ".query-editor-cancel-button", function(event){ 
		
			event.preventDefault();
			ui.query_editor.close();
		});
		
		query_editor_box.on("click", ".query-editor-submit-query-button", function(event){ 
		
			event.preventDefault();
			ui.query_editor.validation(event);
		});

	});

};


ui.query_editor.open = function(conn_id){
	
	var self = this;
	self.current_connection = controller.findConnectionById(conn_id);
	
	var URL = self.current_connection.info.URL;
	var schema = self.current_connection.info.schema;
	
	
	var databaseURL_field = self.div.find('span.databaseURL-header-span');
	databaseURL_field.text(URL);
	
	var schema_field = self.div.find('span.databaseSchema-header-span');
	schema_field.text(schema);
	self.div.show();
	self.div.css(self.position);	
};
	
ui.query_editor.close = function(){
		var self = this;
		self.div.hide();
};


ui.query_editor.validation = function(event){
	
	var form = $(event.target).closest('form.query-editor-form');
	console.log(form.serialize().toString());
	
	
	//console.log(current_source.id+"/"+current_source.URL+"/"+current_source.schema+"/"+current_source.tab_id);
	
	var queryText = form.find('textarea[id=query]').val();
	console.log(queryText.toString());
	var max_records_number = form.find('input[id=max-records-number]').val();
	
	
	if (queryText == '' || max_records_number == ''){
		alert("You must provide a valid input");
	}
	else{
		query_form_parameters = {
				query: queryText,
				max_records: max_records_number
		};
		ui.query_editor.submitQuery(query_form_parameters);
		//ui.query_editor.close();
	}
};

ui.query_editor.submitQuery = function(query_form_parameters){
	
    	var self = this;
	var current_connection = ui.query_editor.current_connection;
	
	var loading_message = self.div.find('.loading-message');
	loading_message.show();
	$.ajax({
		type :"POST",
		url : 'IntegrationServiceServlet/command/import/relational-query',
		data:{
		    URL:current_connection.info.URL,
		    schema: current_connection.info.schema,
		    username: current_connection.info.username,
		    password: current_connection.info.password,
		    query: query_form_parameters.query,
		    max_records: query_form_parameters.max_records
		},
		success : function(data) {
		    var options = {
			URL:current_connection.info.URL,
			schema: current_connection.info.schema,
			query:query_form_parameters.query,
			label:"query data",
			tab_class:"query-data-tab"
		    };
		    source.relational.processQueryResults(data,options);
		    loading_message.hide();
		}, 
		error: function(){
		    alert('an error occured.Please try again!');
		    loading_message.hide();
		    return;
		},
	   	dataType:'json'
	});	
	
};
