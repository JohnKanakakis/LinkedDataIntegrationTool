panel.queriesSection.div = {};
panel.queriesSection.tab = {};
panel.queriesSection.historyPanel = {};
panel.queriesSection.leftPanel = {
	header:{},
	body:{},
	currentBox:{},
	tempQueryName:'',
	queryBoxInitialStateHTML:"<div class='name'></div>"+
				 "<span class='ui-icon ui-icon-pencil edit-icon'>",
	queryBoxChangeStateHTML:"<input type='text' size=25 class='change-query-name-input ui-corner-all'></input>"+
	 			 "<span class='ui-icon ui-icon-check confirm-change-icon'>"
};
panel.queriesSection.currentOpenPanel = {};
panel.queriesSection.queryCounter = 1;

panel.queriesSection.init = function(){
 
    var self = this;
    this.tab = $("#query-tabs-container");
    this.tab.tabs({
	active: 0,
	activate:function(event,ui){
	    	self.resultTab.tabActivateEventHandler(event,ui);
	},
    });
    this.div = $("#queries-tab");
    this.leftPanel.body = this.div.find("#queries-left-panel-body");
    this.leftPanel.header = this.div.find("#queries-left-panel-header");
    this.historyPanel = this.div.find("#history-panel");
    this.currentOpenPanel = this.tab;
    this.editorTab.init();
    this.resultTab.init();
    
   
    var mainPanels = this.div.find(".main-panel");
    
    mainPanels.hide();
    mainPanels.css({
	    'left':this.leftPanel.body.outerWidth() + 1
    });
    
    this.leftPanel.header.find("#menu").menu({
	select:function(event,ui){
	    var id = ui.item.attr('id');
	    console.log(ui.item.attr('id'));
	    if(id == "history"){
		self.historyPanel.empty();
		historyPanel.init();
		self.historyPanel.append(historyPanel.getDiv());
		self.openPage(self.historyPanel);
	    }else{
		//self.openPage();
	    }
	    $(event.target).closest("ul#menu").hide();
	}
    })
    .removeClass('ui-corner-all')
    .hide();  
    this.addListeners();
};

panel.queriesSection.addQueries = function(queries){
    var self = panel.queriesSection;
    if(queries.length == 0){
	$("#add-new-query").trigger("click");
    }else{
	for(var i = 0; i < queries.length; i++){
		self.addQueryBoxInLeftPanel(queries[i]["id"],queries[i]["name"]);
	}
	self.tab.tabs({active:0});
	self.openPage(self.tab);
	self.editorTab.setCurrentQuery(queries[i-1]);
    }
    
};


panel.queriesSection.hideCurrentPanel = function(){
    if(!$.isEmptyObject(this.currentOpenPanel)){
	this.currentOpenPanel.hide();
    }
};


panel.queriesSection.openPage = function(page){
    this.hideCurrentPanel();
    page.show();
    this.currentOpenPanel = page;
};


panel.queriesSection.getCurrentBox = function(){
    return this.leftPanel.currentBox; 
};

panel.queriesSection.setCurrentBox = function(box){
    var self = this;
    if(!$.isEmptyObject(self.leftPanel.currentBox)){
	self.leftPanel.currentBox.removeClass('current');
    }
    self.leftPanel.currentBox = box;
    self.leftPanel.currentBox.addClass('current');
};

panel.queriesSection.addQueryBoxInLeftPanel = function(queryId,queryName){
    
    var self = this;
    var queryBox = $('<div>').addClass('query-name-box')
    			     .attr('id',queryId);
    queryBox.html(self.leftPanel.queryBoxInitialStateHTML);
    queryBox.find('.name').text(queryName);
    
    //self.setCurrentBox(queryBox);
    //var querytext = queriesManager.getQuery(queryName);
    queriesManager.getQuery(queryId,function(query_o){
	    console.log("ADD QUERY TO LEFT PANEL QTEXT > "+query_o["body"]);
	    queryBox.prependTo(self.leftPanel.body);
	    self.editorTab.setCurrentQuery(query_o["name"],query_o["body"]);
	    self.setCurrentBox(queryBox);
	    self.editorTab.setCurrentQuery(query_o);
    });
};



panel.queriesSection.addListeners = function(){
    
    var self = this;
    
    self.div.on("click", "#add-new-query", function(event) {
	self.tab.tabs({active:0});
	self.openPage(self.tab);
	var queryName = "query-"+self.queryCounter;
	queriesManager.addQuery(queryName,function(query_o){
	    self.addQueryBoxInLeftPanel(query_o["id"],query_o["name"]);
	    self.editorTab.setCurrentQuery(query_o);
	    self.queryCounter++;
	    console.log("query counter > "+self.queryCounter);
	});
    });
    
    self.div.on("click",".query-name-box,.query-name-box > *",function(event){
	self.tab.tabs({active:0});
	self.openPage(self.tab);
	var box;
	if($(event.target).hasClass('query-name-box')){
	    box = $(event.target);
	}else{
	    box = $(event.target).parent();
	}
	var queryId = box.attr('id');
	
	queriesManager.getQuery(queryId,function(query_o){
	    self.setCurrentBox(box);
	    self.editorTab.setCurrentQuery(query_o);
	});
	
    });
    
    self.div.on("click", ".edit-icon", function(event) {
	event.preventDefault();
	event.stopPropagation();
	var box = $(event.target).closest('.query-name-box');
	var queryId = box.attr('id');
	queriesManager.getQuery(queryId,function(query_o){
	    
	    self.tempQueryName = query_o["name"];
	    box.html(self.leftPanel.queryBoxChangeStateHTML);
	    box.find('.change-query-name-input').val(query_o["name"]);
	    console.log(query_o["name"]);
	});
	
    });
    
    self.div.on("click", ".confirm-change-icon", function(event) {
	event.preventDefault();
	event.stopPropagation();
	var box = $(event.target).closest('.query-name-box');
	var name = box.find('.change-query-name-input').val();
	var queryId = box.attr('id');
	
	queriesManager.updateQueryName(queryId,name,function(query_o){
	    box.html(self.leftPanel.queryBoxInitialStateHTML);
	    box.find('.name').text(query_o["name"]);
	});
    });
    
    self.div.on("click",".menu-span",function(event){
	event.stopPropagation();
	event.preventDefault();
	var menu = $(event.target).siblings('ul#menu');
	console.log(menu.length);
	if(menu.css('display') == 'block'){
	    menu.hide();
	}else{
	    
	    menu.show();
	}	
    });
};