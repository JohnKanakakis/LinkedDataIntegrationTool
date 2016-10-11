var ui = ui || {};

ui.sources_preview = {
	div:{},
	mainArea:{},
	tabCounter:0,
	SOURCE_MAIN_TAB_ID:"source-main-tab"
};
ui.sources_preview.accordion = {
	div:{},
	selectedBox:{},
	relationalSourceBoxClickHandler:function(event){},
	fileSourceBoxClickHandler:function(event){},
	sparqlSourceBoxClickHandler:function(event){}
};

ui.sources_preview.grids = {
	gridMap:{}
};



ui.sources_preview.init = function(){
    
    var self = this;
    self.div = $("#sources-preview");
    self.mainArea = this.div.find("#sources-preview-main-area");
    self.accordion.div = this.div.find("#sources-accordion");
    self.accordion.div.accordion({
		collapsible: true,
		heightStyle: "content",
		active:false	  
    });
    
    self.mainArea.on("click","span.ui-icon-close", function(event) {
	event.preventDefault();
	var panelId = $(event.target).closest( "li" ).remove().attr("aria-controls");
	var dataTabs = $(event.target).parent().closest("#data-tabs");
	dataTabs.find( "#" + panelId ).remove();
	dataTabs.tabs( "option", "active", 0 );
	dataTabs.tabs();
    });
    
    var addFileSpan = self.accordion.div.find("span#add-file");
    var addDbConnectionSpan = self.accordion.div.find("span#add-database");
    var addEndpointSpan = self.accordion.div.find("span#add-endpoint");
    
    addFileSpan.on("click",function(event){
	event.stopPropagation();
	newSourceBox.open(event);
    });
    addDbConnectionSpan.on("click",function(event){
	event.stopPropagation();
	newSourceBox.open(event);
    });
    addEndpointSpan.on("click",function(event){
	event.stopPropagation();
	newSourceBox.open(event);
    });
 
    
    self.accordion.div.on('click','div.accordion-source-box',function(event){
	
	console.log(event);
	var box = $(event.currentTarget);
	console.log("source class = "+box.attr('class'));
	
	self.accordion.setSelectedBox(box);
	var section = box.closest('div.list-sources-section');
	
	if(section.hasClass("database-connections-section")){
	    self.accordion.relationalSourceBoxClickHandler(event);
	}else if(section.hasClass("files-section")){
	    self.accordion.fileSourceBoxClickHandler(event);
	}else if(section.hasClass("sparql-endpoints-section")){
	    self.accordion.sparqlSourceBoxClickHandler(event);
	}else{
	    alert('wrong!');
	}
    });
    
    self.accordion.div.on('click','.delete-source-icon',function(event){
	event.stopPropagation();
	self.accordion.deleteSource(event);
    });
    
    
    self.accordion.relationalSourceBoxClickHandler = function(event){
	event.preventDefault();
	var conn_id = $(event.target).closest('div.accordion-source-box').attr("related-connection");
	var connection = controller.findConnectionById(conn_id);
	var parameters = {
			URL:connection.info.URL,
			schema:connection.info.schema
	};
	source.relational.getRelationalMetaData(parameters);
    };
    
    self.accordion.fileSourceBoxClickHandler = function(event){
	event.preventDefault();
	var filename = $(event.target).closest('.accordion-source-box').attr("related-file-name");
	source.file.processFileDisplay(filename);
    };
    
    self.accordion.sparqlSourceBoxClickHandler = function(event){
	event.preventDefault();
	var endpointURL = $(event.target).closest('.accordion-source-box').attr("related-sparql-endpoint");
	source.sparqlEndpoint.processSparqlEndpoint(endpointURL);
    };
    
};

/****************************************** tabs manipulation **************************************************************/

/*ui.sources_preview.clearCurrentTabs = function(){
	
    	
	//var tabs = $("#tabs").tabs();
	var tabs_li = tabs.find("li");
	console.log('tabs are '+tabs_li.length);
	
	for(var i = 0;i < tabs_li.length;i++){
		var panelId = $(tabs_li[i]).remove().attr("aria-controls");
		$("#" + panelId).remove();
	}
};*/


ui.sources_preview.addTab = function(tabContext,options,destroyCurrentTabs){
	
    	var self = this;
    	var dataTabs = self.mainArea.find("#data-tabs");
    	var tabId;
    	if(dataTabs.length == 0){
    	    dataTabs = $('<div>').attr('id','data-tabs');
    	    dataTabs.appendTo(self.mainArea);
    	    tabId = createSourceMainTab(tabContext,options);
    	    createPanelDiv(tabId);
    	    initTabs(dataTabs,0);
	    console.log("case 1");
    	}else{
    	    if(destroyCurrentTabs){
    		dataTabs.tabs("destroy");
    		dataTabs.empty();
    		tabId = createSourceMainTab(tabContext,options);
    		createPanelDiv(tabId);
    		initTabs(dataTabs,0);
    		console.log("case 2-1");
    	    }else{
    		tabId = createTabAndPanel(tabContext,options);
    		console.log("case 2-2");
    	    }
    	}
    	return tabId;
    	
    	
    	function createSourceMainTab(tabContext,options){
    	    
    	    var dataTabsNavigation = $('<ul>').addClass("ui-tabs-nav").attr('id','data-tabs-navigation');
	    dataTabsNavigation.appendTo(dataTabs);
	    var id = self.SOURCE_MAIN_TAB_ID;
	    var main_li = getTabLi(options,id,false);
	    main_li.appendTo(dataTabsNavigation);
	    return id;
    	}
    	
    	function createPanelDiv(id){
    	    
    	    var tabPanel = $("<div>").attr('id',id).addClass('source-tab-panel');
    	    tabPanel.appendTo(dataTabs);
	    tabContext.appendTo(tabPanel);
	    console.log("data tabs length = "+dataTabs.length);
    	}
    	
    	
    	
    	function createTabAndPanel(tabContext,options){
    	    var dataTabsNavigation = dataTabs.find('#data-tabs-navigation');console.log(self.tabCounter);
    	    var id = "tabs-" + self.tabCounter;
    	    var tab_li = getTabLi(options,id,true);
    	    tab_li.appendTo(dataTabsNavigation);
    	    createPanelDiv(id);
    	    self.tabCounter++;
    	    
    	    dataTabs.tabs("refresh");
    	    return id;
    	}
    	
    	
    	function getTabLi(options,id,includeCloseIcon){
    	    
    	    
    	    var tabWidth = getTabWidth();
    	    console.log(tabWidth);
    	    var tabTemplate = "";
    	    if (includeCloseIcon){
    		tabTemplate = "<li><a href='#{href}'>#{label}</a> <span class='tab-close-icon ui-icon ui-icon-close' role='presentation'>Remove Tab</span></li>";
    	    }else{
    		tabTemplate = "<li><a href='#{href}'>#{label}</a> </li>";
    	    }
    	    var icon_name = ui.sources_preview.getIcon(options.tab_category);
    	    var label = options.label;
    	    var li;
  
    	    if (!(typeof icon_name === "undefined")){
		li = $(tabTemplate.replace(/#\{href\}/g, "#" + id)
				  .replace(/#\{label\}/g,
							'<div class="source-icon-container"><img src="img/'+ icon_name +'" style="width:30px;height:30px;"></div>'+
							'<div class="tab-label-container">'+label+'</div>'));
    	    }
    	    else{
		li = $(tabTemplate.replace(/#\{href\}/g, "#" + id).replace(/#\{label\}/g,label));
    	    }
    	    if(tabWidth > 0){
    		 li.find('a').width(tabWidth-50);
    	    	 li.width(tabWidth);
    	    }
    	   
    	    return li;
    	}
    	
    	function initTabs(tabsDiv,activeTab){
    	    
    	    tabsDiv.tabs({
    		active: activeTab, 
		activate:function(event,tabsUi){
		    	var tabId = tabsUi.newTab.attr('aria-controls');
			console.log("tab id = "+tabId);
			if(tabId == ui.sources_preview.SOURCE_MAIN_TAB_ID){
			    return;
			}
			var grid = ui.sources_preview.grids.gridMap[tabId];
			if(grid!=''){
			    	console.log('activate grid found and render');
				grid.setColumns(grid.getColumns());
			}
		}
    	    });
    	}
    	
    	function getTabWidth(){
    	    
    	    var dataTabsNavigation = dataTabs.find('#data-tabs-navigation');
    	    var tabsNavigationWidth = dataTabsNavigation.innerWidth();
    	    console.log("navigation width = "+tabsNavigationWidth);
    	    var tabs = dataTabsNavigation.children();
    	    var currentNumberOfTabs = tabs.length;
    	    if(currentNumberOfTabs == 0){
    		return -1;
    	    }
    	    
    	    console.log("current number of tabs = "+currentNumberOfTabs);
    	    var currentTabWidth = $(tabs[0]).outerWidth(true);
    	    console.log("current tabs width = "+currentTabWidth);
    	    var newNumberOfTabs = currentNumberOfTabs + 1;
    	    var right = 15;
    	    var gap = tabsNavigationWidth - right - currentNumberOfTabs*currentTabWidth;
    	    
    	    console.log("gap is "+gap);
    	    if(gap < currentTabWidth){
    		var k = currentNumberOfTabs;
    		var ctw = currentTabWidth;
    		var nw = tabsNavigationWidth;
    		
    		newTabWidth = Math.floor((k*ctw + gap - right)/(k+1)) - 4;
    		for(var i = 0; i < tabs.length; i++){
    		    $(tabs[i]).width(newTabWidth);
    		    $(tabs[i]).find('a').width(newTabWidth-50);
    		}
    		console.log("new tabs width = "+$(tabs[0]).width(true));
    	    }else{
    		newTabWidth = currentTabWidth;
    	    }
    	    
    	    return newTabWidth;
    	}
};

ui.sources_preview.getIcon = function(tab_category){
	
	var icon;
	if (tab_category == 'database-connection'){
		icon = "db-icon.png";
	}else if(tab_category == 'file'){
		icon = "file-icon.png";
	}
	else if (tab_category == 'sparql-endpoint'){
		icon = "sparql-icon.png";
	}
	return icon;
};


/********************************************** Sources Accordion ****************************************************************/
ui.sources_preview.accordion.setSelectedBox = function(box){
    
    var self = this;
    if(!$.isEmptyObject(self.selectedBox)) self.selectedBox.removeClass('selected');
    self.selectedBox = box;
    box.addClass('selected');
};


ui.sources_preview.accordion.deleteSource = function(event){
	event.preventDefault();
	var section = $(event.target).closest('.list-sources-section');

	if (section.hasClass('database-connections-section')){
		var source_name = $(event.target).closest('.list-sources-section');
		alert('db sec');
	}
	else if(section.hasClass('files-section')){
	    var accordion_source_box = $(event.target).closest('.accordion-source-box');
	    var filename = accordion_source_box.attr("related-file-name");
	    var filenames = [];
	    filenames.push(filename);
	    
	    var deleteResult = controller.deleteFile(filename);
		if (deleteResult.deleteSucceeded){
			ui.importedDatasets.deleteDatasetRow(deleteResult.filename);
			accordion_source_box.remove();
			var filenames = [];
			filenames.push(deleteResult.filename);
			source.deleteRelatedFiles(filenames);
		}
	}
	else if(section.hasClass('sparql-endpoints-section')){
		alert('sparql sec');
	}else{
		alert('wrong');
	}
	
};

ui.sources_preview.accordion.addSource = function(options){
	
    	var self = this;
	var section = self.div.find('.'+ options.section);
	var source_info_box = $('<div>').addClass('accordion-source-box hoverable').attr(options.source_box.attribute,options.source_box.attribute_value);
	var source_name_box = $('<div>').addClass('accordion-source-name-box');
	source_name_box.text(options.source_box.text);
	source_name_box.attr("title",options.source_box.title);
	
	if(options.includeDeleteIcon){
		var delete_source_box = $('<div>').addClass('delete-source-icon-box');
		delete_source_box.html('<img id="delete-source-icon" class="delete-source-icon" src="img/cross.png">');
		source_info_box.append(delete_source_box);
	}
	source_info_box.append(source_name_box);
	section.append(source_info_box);
	self.div.accordion("refresh");
	self.div.accordion( "option", "active", options.active );
};

ui.sources_preview.accordion.addRelationalConnection = function(URL,schema,conn_id){
	
	var options = {};
	options.section = "database-connections-section";
	options.source_box = {};
	options.source_box.attribute = "related-connection";
	options.source_box.attribute_value = conn_id;
	options.source_box.text = URL+schema;
	options.source_box.title = URL+schema;
	options.includeDeleteIcon = false;
	options.active = 1;
	
	/*options.clickOnSourceHandler = function(event){
		var conn_id = $(event.target).closest('div.accordion-source-box').attr("related-connection");
		var connection = controller.findConnectionById(conn_id);
		var parameters = {
				URL:connection.info.URL,
				schema:connection.info.schema
		};
		source.relational.getRelationalMetaData(parameters);
	};*/
	/*options.clickOnDeleteSourceIconHandler = function(event){
		ui.sources_preview.accordion.deleteSource(event);
	};*/
	ui.sources_preview.accordion.addSource(options);
	
};

ui.sources_preview.accordion.addFile = function(filename){
	
	var options = {};
	options.section = "files-section";
	options.source_box = {};
	options.source_box.attribute = "related-file-name";
	options.source_box.attribute_value = filename;
	options.source_box.text = filename;
	options.source_box.title = filename;
	options.includeDeleteIcon = false;
	options.active = 0;
	
	/*options.clickOnSourceHandler = function(event){
		var filename = $(event.target).closest('.accordion-source-box').attr("related-file-name");
		source.file.processFileDisplay(filename);
	};*/
	/*options.clickOnDeleteSourceIconHandler = function(event){
		ui.sources_preview.accordion.deleteSource(event);
	};*/
	ui.sources_preview.accordion.addSource(options);
};

ui.sources_preview.accordion.addSparqlEndpoint = function(endpointURL){
	
	var options = {};
	options.section = "sparql-endpoints-section";
	options.source_box = {};
	options.source_box.attribute = "related-sparql-endpoint";
	options.source_box.attribute_value = endpointURL;
	options.source_box.text = endpointURL;
	options.source_box.title = endpointURL;
	options.includeDeleteIcon = false;
	options.active = 2;
	
	/*options.clickOnSourceHandler = function(event){
		var endpointURL = $(event.target).closest('.accordion-source-box').attr("related-sparql-endpoint");
		source.sparqlEndpoint.processSparqlEndpoint(endpointURL);
	};*/
	/*options.clickOnDeleteSourceIconHandler = function(event){
		ui.sources_preview.accordion.deleteSource(event);
	};*/
	ui.sources_preview.accordion.addSource(options);
};












/**********************************************************************************************************************************/
ui.sources_preview.queryResultsProcessDisplay = function(data,options){
	
	var columns = [];
	console.log(JSON.stringify(data));
	for (var key in data[0]) {
		console.log(key);
		var col = {
			id : key,
			name : key,
			field : key,
			width:150
		};
		columns.push(col);
	}

	//var container = $('<div>').addClass('grid-container');
	var container = this.getGridContainer();
	

	container.css({
	    'top':5
	});
	var grid_options = {
			enableCellNavigation : true,
			enableColumnReorder : false,
			explicitInitialization: true,
			autoHeight:false
	};
	if (typeof options.columnWidth !== 'undefined'){
	    grid_options.defaultColumnWidth = options.columnWidth;
	}

	var slickgrid = new Slick.Grid(container, data, columns, grid_options);
	
	//
	
	var query_area = $('<div>').css({
	    	'font-size':'small',
		'padding-left': '5px',
		'padding-right': '5px',
		'padding-top': '5px',
		'overflow': 'auto',
		'height': '50px',
		'border': '1px solid #aaaaaa',
		'border-radius': '4px',
		'margin-left': '5px',
		'margin-right': '5px',
	});

	query_area.text("Your query : " + options.query); 

	var results_area = $('<div>').css({'position':'absolute','top':'0px','left':'0px','right':'0px','bottom':'0px'});

	results_area.append(query_area);
	results_area.append(container);
	
	
	var tabId = ui.sources_preview.addTab(results_area,options,false);
	console.log("tab id from function is "+tabId);
	this.grids.gridMap[tabId] = slickgrid;
	slickgrid.init();
	
	//$('.grid-container-class').css({'overflow-y':'auto','overflow-x':'hidden'});
	
	return tabId;
};




ui.sources_preview.tabularProcessDisplay = function(data,filename){
	
	var columns = [];
	for ( var key in data[0]) {
		console.log(key);
		var col = {
					id : key,
					name : key,
					field : key,
					width:150
				  };
		columns.push(col);
	}
	var container = this.getGridContainer();
	
	var grid_options = {
			enableCellNavigation : true,
			enableColumnReorder : false,
			explicitInitialization: true,
			autoHeight:false
	};
	
	var slickgrid = new Slick.Grid(container, data, columns, grid_options);
	
  	var tab_options = {
  			label:filename,
  			tab_category:"file"
  	};
  	//ui.sources_preview.clearCurrentTabs();
  	var tabId = ui.sources_preview.addTab(container, tab_options,true);
  	this.grids.gridMap[tabId] = slickgrid;
	slickgrid.init();
  	//$('.grid-container-class').css({'overflow-y':'hidden','overflow-x':'hidden'});
  	
  	return tabId;
};

ui.sources_preview.processDisplayRDFVoc = function(data,filename) {

	var triples_vocabulary_class = "triples-vocabulary-class";
	var triples_container_class = "triples-container-class";

	var rdfVocContainer = $('<div>').addClass(triples_vocabulary_class);
	
	var col1 = [];
	for ( var key in data[0].classes[0]) {
		console.log(key);
		var col = {
					id : key,
					name : key,
					field : key
				  };
		col1.push(col);
	}
	if(col1.length == 0){
		col1[0] = {
				id : "class",
				name : "class",
				field : "class"
			  };
		data[0].classes[0] = {
				"class":"not any class"
		};
	}
	
	var col2 = [];
	for ( var key in data[1].properties[0]) {
		console.log(key);
		var col = {
					id : key,
					name : key,
					field : key
				  };
		col2.push(col);
	}
	if(col2.length == 0){
		col2[0] = {
				id : "property",
				name : "property",
				field : "property"
			  };
		data[1].properties[0] = {
				"property":"not any property"
		};
	}
	
	var grid1 = $('<div>').addClass(triples_container_class);
	var grid2 = $('<div>').addClass(triples_container_class);

	var options = {
		enableCellNavigation : true,
		enableColumnReorder : false,
		defaultColumnWidth : 1500,
		explicitInitialization: true
	};

	var slickgrid1 = new Slick.Grid(grid1, data[0].classes, col1, options);

	var slickgrid2 = new Slick.Grid(grid2, data[1].properties, col2, options);

	var tab_options = {
  			label:filename,
  			tab_category:"file"
  	};
	rdfVocContainer.append(grid1);
	rdfVocContainer.append(grid2);
	//ui.sources_preview.clearCurrentTabs();
	var tabId = ui.sources_preview.addTab(rdfVocContainer, tab_options,true);
	this.grids.gridMap[tabId] = slickgrid1;
	slickgrid1.init();
	slickgrid2.init();
  	//$('.triples-container-class').css({'overflow-y':'auto','overflow-x':'hidden'});
  	
  	return tabId;
};

ui.sources_preview.getGridContainer = function(){
    	
    	var container =  $('<div>').addClass('grid-container');
    	var openSourceTab = this.mainArea.find('.source-tab-panel[aria-expanded = true]');
    	var height = openSourceTab.innerHeight();
    	var width = openSourceTab.innerWidth();
    	var left = 0;
    	var top = 40;
   
    	if(openSourceTab.length == 0){
    	    top = 40;
    	    height = this.mainArea.innerHeight() - 40 - 2*top;
    	    width = this.mainArea.innerWidth();
    	}else{
    	    top = 40;
    	    height = openSourceTab.innerHeight() - 2*top;
    	    width = openSourceTab.innerWidth() - 2*left;
    	    
    	}
    	
    	container.css({
	    'height':height,
	    'width':width,
	    'left':left,
	    'top':top,
	    'font-size':'small'
	});
    	
    	return container;
    
};

