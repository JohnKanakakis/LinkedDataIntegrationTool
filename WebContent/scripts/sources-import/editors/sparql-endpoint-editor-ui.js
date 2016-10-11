var ui = ui || {};

ui.sparqlEndpointEditor = {
	div:{},
	position:{}
};

ui.sparqlEndpointEditor.init = function(){

	var window = $(".sparql-endpoint-editor-window");
	var self = this;
	
	window.load("scripts/sources-import/editors/sparql-endpoint-editor.html",function(){
	    self.div = window.find(".sparql-endpoint-box");
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
	    window.on('click','.close-sparql-endpoint-button',function(event){
		
		self.close(event);
	    });
	
	    window.on('click','.submit-query-to-sparql-endpoint-button',function(event){
		event.preventDefault();
		self.getQueryParameters(event);
	    });
	
	    window.on('click','.close-sparql-endpoint-editor-icon',function(event){
		
		self.close(event);
	    });
	});
	
	
};


ui.sparqlEndpointEditor.open = function(url){
    		var self = this;
    		self.div.show();
    		self.div.css(self.position);
    		self.div.find("span#sparql-endpoint-url").text(url);
};
		
ui.sparqlEndpointEditor.close = function(){
    		var self = this;
		self.div.hide();
};

ui.sparqlEndpointEditor.getQueryParameters = function(event){
	
    		var self = this;
		var sparql_query_box = self.div;
	
		var query = sparql_query_box.find("textarea.query-text-area").val();
		//var prefixes_text = sparql_query_box.find("#prefixes-part").val();
		//var construct_text = sparql_query_box.find('#construct-part').val();
	
		//var form = $(event.target).closest('form.add-sparql-endpoint-form');
		var sparqlEndpointURL = sparql_query_box.find("#sparql-endpoint-url").text();
		console.log("url is = "+sparqlEndpointURL);
		//console.log(sparql_query_box.length+"--"+sparql_query_box.find("#prefixes-part").length+"--"+sparql_query_box.find('#construct-part').length);
		//console.log(prefixes_text + "--" + construct_text + "--" + sparqlEndpointURL);
		
		var loading_message = self.div.find('.loading-message');
		loading_message.show();
		
		source.sparqlEndpoint.submitSPARQLQuery(sparqlEndpointURL,query);
	
};

ui.sparqlEndpointEditor.closeLoadingMessage = function(){
    	var self = this;
    	var loading_message = self.div.find('.loading-message');
	loading_message.hide();
};
