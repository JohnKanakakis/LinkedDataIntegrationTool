panel.queriesSection.editorTab = {
	div:{},
	queryArea:{},
	textArea:{},
	accordion:{},
	file:'scripts/queries/panel-ui/queries-editor-layout.html',
	currentQueryName:'',
	currentQueryId:0
};

panel.queriesSection.editorTab.init = function(){
	
	
	var self = this;
	self.div = $('#query-editor');
	
	self.div.load(self.file,function(){
	    self.accordion = self.div.find('div#information-accordion');
	    self.accordion.accordion({ 
		collapsible: true,
		active:false
	    });
	    self.queryArea = self.div.find("#query-area");
	    self.textArea = self.queryArea.find("textarea#query-textarea");
	    self.addListeners();
	});
		
};

panel.queriesSection.editorTab.addListeners = function(){
    
    var self = this;
    
    self.div.on("click", "#submit-query", function(event) {
	
	console.log('submit');
	var queryText = self.textArea.val();
	var query_id = self.currentQueryId;
	
	panel.queriesSection.resultTab.loading();
	
	queriesManager.executeQuery(query_id,queryText,function(queryResults){
	    panel.queriesSection.resultTab.displayQueryResults(queryText,queryResults);
	});
    });
    
    self.div.on("click", "#stop-query-execution", function(event) {
	
	//var queryText = self.textArea.val();
	var query_id = self.currentQueryId;
	
	queriesManager.stopQueryExecution(query_id,function(){
	    //panel.queriesSection.resultTab.removeLoading();
	});
    });
    
    self.div.on("click", "#clean-area", function(event){
	console.log('clean');
	queriesManager.getPrefixes();
    });
    
    self.div.on("click", "#save-dataspace", function(event){
	console.log('save dataspace');
	queriesManager.saveDataspace();
    });
    
    self.div.on("change", "textarea#query-textarea", function(event){
	var queryText = self.textArea.val();
	var query_id = self.currentQueryId;
	queriesManager.updateQuery(query_id,queryText);
    });
    
};

panel.queriesSection.editorTab.addLinks = function(linkingProperties){
    
    	var self = this;
    	var linksAccordionContainer = self.accordion.find("#links-container");
    	var infoContainer;
    	var table;
    	var tr1,tr2;
    	var td1,td2;
    	var header;
	$.each(linkingProperties, function( i, linkingPropertyInfo ) {
	    
	    infoContainer = $('<div>').addClass("info-container ui-corner-all");
	    infoContainer.appendTo(linksAccordionContainer);
	    header = $('<div>').addClass('linking-task-info-header');
	    header.html("<span>"+ linkingPropertyInfo["linkType"] + "</span>").appendTo(infoContainer);
	    table = $("<table>").addClass('info-table');
	    table.appendTo(infoContainer);
	    
	    for(var key in linkingPropertyInfo){
		if(key == "linkType") continue;
		tr1 = $("<tr>");
		tr2 = $("<tr>");
		td1 = $("<th>").text(key);
		td1.appendTo(tr1);
		tr1.appendTo(table);
		
		td2 = $("<td>");
		if(Object.prototype.toString.call(linkingPropertyInfo[key]) === '[object Array]'){
		    var length = linkingPropertyInfo[key].length;
		    for(var i = 0; i < length;i++){
			$('<span>').text(linkingPropertyInfo[key][i%length]).css({
			    'display':'block',
			    'margin-top':'2px',
			    'margin-bottom':'2px'
			}).appendTo(td2);
		    }
		}else{
		    td2.text(linkingPropertyInfo[key]);
		}
		td2.appendTo(tr2);
		tr2.appendTo(table);
	    }
	});
};


panel.queriesSection.editorTab.addPrefixes = function(prefixes){
    	var prefixesString = "";
    	for(var i = 0; i < prefixes.length; i++){
    	    prefixesString += prefixes[i];
    	};
    	this.textArea.val(prefixesString);
    	console.log("adding prefixes...");
};

panel.queriesSection.editorTab.addVocabulary = function(vocabulary){
    
    	if (vocabulary.length == 0){
    	    for(var i = 0; i < 50 ; i++){
    		var term = {
		    prefix:'qb',
		    uri:'http://',
		    name:'dataset'+i
    		};
    		vocabulary.push(term);
    	    }
    	} 
    	
    	var self = this;
    	var vocabularyContainer = self.accordion.find("#dataspace-schema-container");
    	var infoContainer;
    	var table,tr,td;
    	
    	infoContainer = $('<div>').addClass("info-container ui-corner-all");
	infoContainer.appendTo(vocabularyContainer);
	table = $("<table>").addClass('info-table');
	table.appendTo(infoContainer);
	$.each(vocabulary, function( i, term ) {
	    tr = $("<tr>");
	    td = $("<td>");
	    $('<span>').addClass('vocabulary-term')
	    	       .attr('title',term["uri"]+term["name"])
	    	       .text(term["prefix"]+":"+term["name"])
	    	       .appendTo(td);
	    td.appendTo(tr);
	    tr.appendTo(table);
	});
};

panel.queriesSection.editorTab.addNamedGraphs = function(graphs){
    	var self = panel.queriesSection.editorTab;
    	var row;
    	var graphsContainer = self.accordion.find("div#graphs-container");
    	
    	var table = $("<table>").addClass('info-table').appendTo(graphsContainer);
    	for(var i = 0; i < graphs.length;i++){
    	    row = $("<tr>").attr('title',graphs[i]["uri"]).appendTo(table);
    	    $('<td>').text(graphs[i]["uri"]).appendTo(row);
    	    row = $('<tr>').appendTo(table);
    	    $('<td>').html("<span>Total triples: "+graphs[i]["size"]+"</span>").appendTo(row);
    	}
};


panel.queriesSection.editorTab.setCurrentQuery = function(query_o){
    	var self = this;
    	
    	self.textArea.val(query_o["body"]);
    	self.currentQueryId = query_o["id"];
    	self.currentQueryName = query_o["name"];
    	panel.queriesSection.resultTab.clear();
};

panel.queriesSection.editorTab.getCurrentQueryText = function(){
    	return this.textArea.val();
};