panel.mappingTasksSection.div = {};
panel.mappingTasksSection.mappingTaskPanel = {};
panel.mappingTasksSection.historyPanel = {};
panel.mappingTasksSection.leftPanel = {
	header:{},
	body:{},
	selectedBox:{}
};
panel.mappingTasksSection.currentOpenPanel = {};
panel.mappingTasksSection.hasUndefinedNamespaces = false;

panel.mappingTasksSection.init = function(){
    
    var self = this;
    self.div = $("#mapping-task-tab");
    self.leftPanel.body = self.div.find("#mapping-tasks-left-panel-body");
    self.leftPanel.header = self.div.find("#mapping-tasks-left-panel-header");
    self.mappingTaskPanel = self.div.find("#mapping-editor");
    self.historyPanel = self.div.find("#history-panel");
    self.editor.init();
    self.currentOpenPanel = self.mappingTaskPanel;
    
    var mainPanels = self.div.find(".main-panel");
    
    mainPanels.hide();
    mainPanels.css({
	    'left':self.leftPanel.body.outerWidth() + 1
    });
    
    console.log(self.leftPanel.header.find("ul#mapping-tasks-menu").length);
    self.leftPanel.header.find("ul#mapping-tasks-menu").menu({
	select:function(event,ui){
	    var id = ui.item.attr('id');
	    console.log(ui.item.attr('id'));
	    if(id == "history"){
		self.historyPanel.empty();
		historyPanel.init();
		self.historyPanel.append(historyPanel.getDiv());
		self.openPanel(self.historyPanel);
	    }else{
		//info about this step
	    }
	    $(event.target).closest("ul#mapping-tasks-menu").hide();
	}
    })
    .removeClass('ui-corner-all');
    self.addListeners();
};

panel.mappingTasksSection.hideCurrentPanel = function(){
    if(!$.isEmptyObject(this.currentOpenPanel)){
	this.currentOpenPanel.hide();
    }
};


panel.mappingTasksSection.openPanel = function(panel){
    this.hideCurrentPanel();
    panel.show();
    this.currentOpenPanel = panel;
};

panel.mappingTasksSection.getSelectedBox = function(){
    return this.leftPanel.selectedBox;
};

panel.mappingTasksSection.setSelectedBox = function(box){
    if(!$.isEmptyObject(this.leftPanel.selectedBox)) this.leftPanel.selectedBox.removeClass('selected');
    this.leftPanel.selectedBox = box;
    box.addClass('selected');
};


panel.mappingTasksSection.addMappingTaskBoxInLeftPanel = function(taskName,datasetName,status){
    
    var self = this;
    var mapTaskBox = $('<div>').addClass('mapping-task-status-box hoverable').attr('id',taskName);
    var nameSpan = $('<span>').css({
	'position':'absolute',
	'top':0,
	'left':0,
	'right':0,
	'height':'25px',
	'padding-left':'5px',
	'font-size': 'small'
    })
    .text(datasetName);
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
    statusSpan.appendTo(mapTaskBox);
    nameSpan.appendTo(mapTaskBox);
    mapTaskBox.prependTo(self.leftPanel.body);
    self.setSelectedBox(mapTaskBox);
};

panel.mappingTasksSection.displayEditor = function(vocabulary,taskName,menuViewFormat){
    
    var self = this;
    self.openPanel(self.mappingTaskPanel);
    self.editor.displayMappingsMenu(vocabulary,taskName,menuViewFormat);
    

        /*
	 * if(!this.editor.initialized){ this.editor.init(false); } var
	 * mappingTabs = this.div.find("#mapping-task-tabs-container");
	 * if(!mappingsManager.isCompletedTask(taskName)){console.log("not
	 * completed status.refresh tabs"); this.tab.tabs({ active: 0,
	 * disabled:[] }); }else{ console.log("completed status.display only
	 * results"); mappingTabs.tabs({ active: 1,disabled: [0]}); }
	 * mappingTabs.addClass("loading"); var results =
	 * mappingsManager.getResultsForMappingTask(taskName);
	 * this.resultTab.displayResults(results,false);
	 * mappingTabs.removeClass("loading");
	 */
};
   


panel.mappingTasksSection.updateStatusOfMappingTaskBoxInLeftPanel = function(taskName,status){
    
    this.div.find("#"+taskName).find("span.status-span").text("Status: "+status);
};

panel.mappingTasksSection.updateHeaderOfLeftPanel = function(completedTasks,totalTasks){
    
    //this.div.find("#mapping-tasks-general-info").text("Mapping Tasks("+completedTasks+"/"+totalTasks+")");
};

panel.mappingTasksSection.displayUndefinedPrefixesWidget = function(undefinedPrefixesArray){
    
    var self = this;
    self.hasUndefinedNamespaces = true;
    var menuContainer = $('<div>').attr('id','menu-container').addClass('ui-corner-all');
    var header = $('<div>').attr('class','menu-container-header');
    var body = $('<div>').attr('class','menu-container-body');
    menuContainer.appendTo(self.div);
    var position = {
	'top':(self.div.height() - menuContainer.height())/2,
	'left':(self.div.width() - menuContainer.width())/2
    };
    
    menuContainer.css(position);
    header.html("<span class='header-text'>Undefined namespace-URIs</span>");//"<span  class='close-menu-icon ui-icon ui-icon-closethick' style='float:right'></span>"
    header.appendTo(menuContainer);
    body.appendTo(menuContainer);
    
    var message = $('<p>').text('The following namespace URIs do not have prefixes.Please provide them and then continue:');
    message.appendTo(body).css('font-size','small');
    var table = $('<table>').attr('id','prefixes-table')
    			    .addClass('menu-container-table')
    			    .css('border-top','1px solid #aaaaaa');
    
    console.log(JSON.stringify(undefinedPrefixesArray));
    
    for(var i = 0; i < undefinedPrefixesArray.length;i++){
		tr = $('<tr>').css('display','block');
		
		td1 = $('<td>').text(undefinedPrefixesArray[0]["uri"]).css('font-weight','bold');
		//console.log("SOURCE > " + vocabularies[i]["source"]);
		td2 = $('<td>').html('<span style="float:left;margin-right:5px">Prefix:</span>'+
				     '<input type="text" class="prefix-input" style="float:left">');
		td1.appendTo(tr);td2.appendTo(tr);
		tr.appendTo(table);
    }
    table.appendTo(body);
    table.find('tbody').css('max-height','200px');
    
    var submitButton = $('<button>').attr('id','submit-prefixes-button').text('Submit prefixes');
    
    submitButton.appendTo(body);
    submitButton.on("click",function(event){
	
	var prefixesEl = menuContainer.find("input[type='text'].prefix-input");
	var prefixesArray = [];
	var prefix;
	var uri;
	var prefixMapping_o;
	$.each(prefixesEl,function(index,prefixEl){
	    prefix = $(prefixEl).val();
	    console.log(prefix);
	    if(prefix == '') {alert('You must fill all the prefixes');return;}
	    uri = $(prefixEl).parent().siblings('td').text();
	    prefixMapping_o = {
		    'prefix':prefix,
		    'namespaceUri':uri
	    };
	    prefixesArray.push(prefixMapping_o);
	});
	console.log(JSON.stringify(prefixesArray));
	mappingsManager.addPrefixes(prefixesArray);
	menuContainer.remove();
	self.hasUndefinedNamespaces = false;
    });
};




panel.mappingTasksSection.addListeners = function(){
    
    var self = this;
    
    
    /*self.div.on('click','#add-new-mapping-task',function(event){
	event.preventDefault();
	event.stopPropagation();
	if(self.hasUndefinedNamespaces){
	    alert('Please specify the undefined namespaces!');
	}else{
	    ui.mapFileConfigBox.open(event);
	}
    });*/
    
    
    self.div.on("click",".mapping-task-status-box",function(event){
	event.preventDefault();
	var mappingBox = $(event.target).closest('.mapping-task-status-box');
	var taskName = mappingBox.attr('id');
	
	var currentBox = self.getSelectedBox();
	var currentTaskName = currentBox.attr('id');
	
	//if(mappingsManager.storeMappingTask(currentTaskName)>0){
	    if(!$.isEmptyObject(mappingsManager.loadMappingTask(taskName))){
		self.setSelectedBox(mappingBox);
		self.openPanel(self.mappingTaskPanel);
		self.editor.showTask(taskName);
	    } 
	//}
    });
    
    self.div.on("click","#mapping-tasks-menu-icon",function(event){
	event.preventDefault();
	event.stopPropagation();
	var menu = $(event.target).siblings('ul#mapping-tasks-menu');
	console.log(menu.length);
	if(menu.css('display') == 'block'){
	    menu.hide();
	}else{
	    menu.show();
	}	
    });
};


