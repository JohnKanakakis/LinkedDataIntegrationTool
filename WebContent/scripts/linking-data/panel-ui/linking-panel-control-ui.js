panel.linkingTasksSection.div = {};
panel.linkingTasksSection.linkingTaskPanel = {};
panel.linkingTasksSection.historyPanel = {};
panel.linkingTasksSection.leftPanel = {
	header:{},
	body:{},
	selectedBox:{}
};
panel.linkingTasksSection.currentOpenPanel = {};

panel.linkingTasksSection.init = function(){
    var self = this;
    self.div = $("#linking-tasks-tab");
    self.leftPanel.body = self.div.find("#linking-tasks-left-panel-body");
    self.leftPanel.header = self.div.find("#linking-tasks-left-panel-header");
    self.linkingTaskPanel = self.div.find("#linking-task-panel");
    self.historyPanel = self.div.find("#history-panel");
    
    panel.linkEditorTab.init();
    panel.resultTab.init();
    self.linkingTaskPanel.tabs();
    
    
    console.log("menu length = "+ self.leftPanel.header.find("ul#linking-tasks-menu").length);
    var menu = self.leftPanel.header.find("#linking-tasks-menu");
    menu.menu({
	select:function(event,ui){
	    var id = ui.item.attr('id');
	    console.log(ui.item.attr('id'));
	    if(id == "history"){
		self.historyPanel.empty();
		historyPanel.init();
		self.historyPanel.append(historyPanel.getDiv());
		self.openPanel(self.historyPanel);
	    }else{
		//self.openPanel();
	    }
	    $(event.target).closest("ul#linking-tasks-menu").hide();
	}
    })
    .removeClass('ui-corner-all')
    .hide();
    
    
    var mainPanels = self.div.find(".main-panel");
    
    mainPanels.hide();
    mainPanels.css({
	    'left':self.leftPanel.body.outerWidth() + 1
    });
    self.addListeners();
    self.currentOpenPanel = self.linkingTaskPanel;
};

panel.linkingTasksSection.addListeners = function(){
  
    var self = this;
    
    this.div.on("click","#add-new-linking-task",function(event){
	event.preventDefault();
	if(linkingManager.allowToOpenLinkingTask()){
	    panel.linkFileConfigBox.open(event);
	}
    });
    
    this.div.on("click",".linking-task-status-box",function(event){
	event.preventDefault();
	var linkTaskBox = $(event.target).closest('.linking-task-status-box');
	var taskName = linkTaskBox.attr('id');
	self.linkingTaskPanel.tabs("option", "disabled", []); 
	self.linkingTaskPanel.tabs({active:0});
	self.openPanel(self.linkingTaskPanel);
	if(editorManager.isPendingTask(taskName)) return;
	if(linkingManager.allowToOpenLinkingTask(taskName)){

	    if(editorManager.saveCurrentTask()){
		
		if(!panel.resultTab.isBusy() && linkingManager.taskHasBeenExecuted(taskName)){
		    self.setSelectedBox(linkTaskBox);
		    panel.linkEditorTab.showTask(taskName);
		    panel.resultTab.clearAll();
		    panel.resultTab.addLoadingState();
		    linkingManager.getLinks(taskName);
		    return;
		}
		if(panel.resultTab.isBusy()){
			 alert('There is another process in action!');
			 return;
		}
		self.setSelectedBox(linkTaskBox);
		panel.linkEditorTab.showTask(taskName);
		panel.resultTab.clearAll();
		
	    }else{
		alert('error in saving task!');
	    }
	}else{
	    alert("can't open task!!");
	}
	
    });
    
    this.div.on("click","#linking-tasks-menu-icon",function(event){
	event.stopPropagation();
	event.preventDefault();
	var menu = $(event.target).siblings('ul#linking-tasks-menu');
	console.log(menu.length);
	if(menu.css('display') == 'block'){
	    menu.hide();
	}else{
	    menu.show();
	}	
    });
};

panel.linkingTasksSection.hideCurrentPanel = function(){
    if(!$.isEmptyObject(this.currentOpenPanel)){
	this.currentOpenPanel.hide();
    }
};

panel.linkingTasksSection.openPanel = function(panel){
    this.hideCurrentPanel();
    panel.show();
    this.currentOpenPanel = panel;
};


panel.linkingTasksSection.getSelectedBox = function(){
    return this.leftPanel.selectedBox;
};

panel.linkingTasksSection.setSelectedBox = function(box){
    if(!$.isEmptyObject(this.leftPanel.selectedBox)) this.leftPanel.selectedBox.removeClass('selected');
    this.leftPanel.selectedBox = box;
    box.addClass('selected');
};


panel.linkingTasksSection.enableTaskPanel = function(taskName){
    var self = this;
    self.linkingTaskPanel.tabs("option", "disabled", []);
    self.linkingTaskPanel.tabs({active:0});
    self.openPanel(self.linkingTaskPanel);
};

/*panel.linkingTasksSection.disableEditor = function(){
    //this.linkingTaskPanel.tabs( "disable", 0 );
};

panel.linkingTasksSection.enableEditor= function(){
    if(!this.editor.initialized){
	this.init();
    }
    this.tab.tabs("enable");
};*/

panel.linkingTasksSection.addLinkingTaskBoxInLeftPanel = function(taskName,status){
    
    //if(!$.isEmptyObject(this.leftPanel.selectedBox)) this.leftPanel.selectedBox.removeClass('selected');
    var self = this;
    var linkTaskBox = $('<div>').addClass('linking-task-status-box hoverable').attr('id',taskName);
    var nameSpan = $('<span>').css({
	'position':'absolute',
	'top':0,
	'left':0,
	'width':'80%',
	'height':'25px',
	'padding-left':'5px',
	'font-size': 'small'
    })
    .text(taskName);
    var statusSpan = $('<span>')
    .addClass('status-span')
    .css({
	'position':'absolute',
	'bottom':0,
	'right':0,
	'left':0,
	'height':'25px',
	'text-align':'right',
	'padding-right': '5px',
	'font-size': 'small'
    })
    .text("Status: "+status);
    
   /* var configSpan = $('<span>').addClass('ui-icon ui-icon-wrench linking-task-config')
    				.css({
    				    'position':'absolute',
    				    'top':3,
    				    'right':5
    				});
    */
    statusSpan.appendTo(linkTaskBox);
    nameSpan.appendTo(linkTaskBox);
    //configSpan.appendTo(linkTaskBox);
    
    linkTaskBox.appendTo(self.leftPanel.body);
    self.setSelectedBox(linkTaskBox);
};




panel.linkingTasksSection.displayEditor = function(taskName){
 
    if(!this.editor.initialized){
	this.editor.init(false);
    }
    /*var mappingTabs = this.div.find("#mapping-task-tabs-container");
    if(!mappingsManager.isCompletedTask(taskName)){console.log("not completed status.refresh tabs");
    	this.tab.tabs({
    	    active: 0, 
    	    disabled:[]
    	});
    }else{
	console.log("completed status.display only results");
	mappingTabs.tabs({ active: 1,disabled: [0]});
    }
    mappingTabs.addClass("loading");
    var results = mappingsManager.getResultsForMappingTask(taskName);
    this.resultTab.displayResults(results,false);
    mappingTabs.removeClass("loading");*/
};

panel.linkingTasksSection.updateStatusOfLinkingTaskBoxInLeftPanel = function(taskName,status){
    
    this.div.find("#"+taskName).find("span.status-span").text("Status: "+status);
};

panel.linkingTasksSection.updateHeaderOfLeftPanel = function(completedTasks,totalTasks){
    
    this.div.find("#mapping-tasks-general-info").text("Mapping Tasks("+completedTasks+"/"+totalTasks+")");
};




