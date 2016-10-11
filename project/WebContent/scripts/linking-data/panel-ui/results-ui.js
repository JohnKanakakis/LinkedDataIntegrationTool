var panel = panel || {};

panel.resultTab = {
		div:{},
		paginationDiv:{},
		acceptedLinksData:[],
		verifyLinksData:[],
		busy:false,
		actionsDisabled:false
};

panel.resultTab.acceptedLinks = {
		div:{},
		selectedLinksPositions:[],
		data:[],
		linksMessage:"Total accepted links: "
};
panel.resultTab.verifyLinks = {
		div:{},
		selectedLinksPositions:[],
		data:[],
		linksMessage:"Links that may need verification: " 
};


panel.resultTab.init = function(){
	
    	var self = this;
    	var sectionHeader;
    	
    	self.div = panel.linkingTasksSection.linkingTaskPanel.find('#results-panel');
    	self.acceptedLinks.div = self.div.find('#accepted-links');
    	self.verifyLinks.div = self.div.find('#links-to-verify');
    	self.div.find("#links-button-set").buttonset();
    	self.addListeners();
    	self.acceptedLinks.div.show();
	self.verifyLinks.div.hide();
	
	sectionHeader = $('<div>').addClass('results-section-header');
	sectionHeader.html('<span>Accepted Links</span><span class="number-of-links"></span>')
		     .appendTo(self.acceptedLinks.div);
	
	sectionHeader = $('<div>').addClass('results-section-header');
	sectionHeader.html('<span>Links to verify</span><span class="number-of-links"></span>')
		     .appendTo(self.verifyLinks.div);
	self.disableSave();
};

panel.resultTab.isBusy = function(){
    console.log("BUSY > "+this.isBusy);
    return this.busy;
};

panel.resultTab.setBusy = function(){
    this.busy = true;
};

panel.resultTab.unSetBusy = function(){
    this.busy = false;
};

panel.resultTab.addListeners = function(){
    var self = this;
    
    self.div.on("change","input[type=radio].links-radio",function(event){
	event.preventDefault();
	var radioInputId= $(event.target).attr('id');
	console.log(radioInputId);
	if(radioInputId == "accepted-links-radio"){
	    self.acceptedLinks.div.show();
	    self.verifyLinks.div.hide();
	}else{
	    self.verifyLinks.div.show();
	    self.acceptedLinks.div.hide();
	}
    });
    
    self.div.on("click","button#confirm-task-button",function(event){
	event.preventDefault();console.log('CONFIRM STATUS >');
	var taskName = editorManager.getCurrentTaskName();
	linkingManager.confirmLinkTask(taskName,self.acceptedLinksData);
    });
    
    self.div.on("click","span.remove-link-icon",function(event){
	event.preventDefault();
	var tr = $(event.target).closest('tr');
	var row_id = tr.attr('row-id');
	var sizeBeforeMove;
	console.log(row_id);
	
	if(self.acceptedLinks.div.css('display') == 'block'){//accepted links position array
	    console.log('accepted link removed');
	    sizeBeforeMove = self.verifyLinksData.length;
	    self.showLinkRemovedMessage("Link moved to 'Links to verify' section");
	    self.moveLink(self.acceptedLinksData,self.verifyLinksData,row_id);
	   
	    self.displayVerifyLinks();
	    
    	}else{
    	    console.log('verified link removed');
    	    sizeBeforeMove = self.acceptedLinksData.length;
    	    self.showLinkRemovedMessage("Link moved to 'Accepted links' section");
    	    self.moveLink(self.verifyLinksData,self.acceptedLinksData,row_id);
    	    self.displayAcceptedLinks();
    	    
    	    
    	}
	self.updateLinksHeader(self.acceptedLinks.div.find('.results-section-header'),self.acceptedLinksData.length);
	self.updateLinksHeader(self.verifyLinks.div.find('.results-section-header'),self.verifyLinksData.length);
	$(event.target).closest('li').remove();
    });
};

panel.resultTab.moveLink = function(fromArray,toArray,row_id){
    toArray.push(fromArray[row_id]);
    fromArray.splice(row_id,1);
};	

panel.resultTab.showLinkRemovedMessage = function(message){
    var self = this;
    var messageDiv = $('<div>').addClass('remove-link-message ui-corner-all').text(message);
    messageDiv.appendTo(self.div);
    messageDiv.css({'left':(self.div.width()-messageDiv.width())/2});
    messageDiv.fadeIn(1000);
    messageDiv.fadeOut(2000,function(){
	messageDiv.remove();
    });
};





panel.resultTab.updateLinksHeader = function(header,numberOfLinks){
    header.find('span.number-of-links').text("("+numberOfLinks+")");
};

panel.resultTab.displayAcceptedLinks = function(){
    var self = this;
    if(self.acceptedLinksData.length > 0){
	
	options = {
		paginationDivId:"pagination-accept",
		containerDiv:self.acceptedLinks.div,
		linksArray:self.acceptedLinksData
	};
	self.startPagination(options);
    }else{
	self.clearAcceptedLinks();
    }
};

panel.resultTab.displayVerifyLinks = function(){
    var self = this;

    if(self.verifyLinksData.length > 0){
	options = {
		paginationDivId:"pagination-verify",
		containerDiv:self.verifyLinks.div,
		linksArray:self.verifyLinksData
	};
	self.startPagination(options);
    }else{
	self.clearVerifyLinks();
    }
};

panel.resultTab.displayResults = function(links){
    
    var self = this;
    
    self.div.find('div.links-button-container').remove();
    
    console.log(JSON.stringify(links));
    
    if(typeof links !== 'undefined'){
	self.acceptedLinksData = links['acceptedLinks'];
	self.verifyLinksData = links['linksToVerify'];
    }else{
	return;
    }
    console.log("self.acceptedLinksData.length = "+self.acceptedLinksData.length );
    
    self.displayAcceptedLinks();
    self.displayVerifyLinks();
    self.updateLinksHeader(self.acceptedLinks.div.find('.results-section-header'),self.acceptedLinksData.length);
    self.updateLinksHeader(self.verifyLinks.div.find('.results-section-header'),self.verifyLinksData.length);
    self.removeLoadingState();
    self.unSetBusy();
    var taskName = editorManager.getCurrentTaskName();
    console.log("CURRENT TASK NAME TO DISPLAY > "+taskName);
    if(editorManager.isCompletedTask(taskName)){
	self.disableActions();
    }else{
	self.enableActions();
    }
};

panel.resultTab.clearAll = function(){
    var self = this;
    self.clearAcceptedLinks();
    self.clearVerifyLinks();
};

panel.resultTab.clearVerifyLinks = function(){
    var self = this;
    self.verifyLinks.div.children('div.results-tree-container').remove();
    self.verifyLinks.div.children('div.links-header').remove();
    self.verifyLinks.div.children('div.pagination').remove();
    self.updateLinksHeader(self.verifyLinks.div.find('.results-section-header'),0);
};
panel.resultTab.clearAcceptedLinks = function(){
    var self = this;
    self.acceptedLinks.div.children('div.results-tree-container').remove();
    self.acceptedLinks.div.children('div.links-header').remove();
    self.acceptedLinks.div.children('div.pagination').remove();
    self.updateLinksHeader(self.acceptedLinks.div.find('.results-section-header'),0);
};

panel.resultTab.removeLoadingState = function(){
  
    var self = this;
    self.acceptedLinks.div.removeClass('loading');
    self.verifyLinks.div.removeClass('loading');
    console.log("DISPLAY RESUTLS > ");
};

panel.resultTab.addLoadingState = function(){
    this.acceptedLinks.div.addClass('loading');
    this.verifyLinks.div.addClass('loading');
};

panel.resultTab.startPagination = function(options){
    
    var self = this;
    
    var paginationDiv = options.containerDiv.find('div.pagination');
    if(paginationDiv.length > 0){
	paginationDiv.empty();
    }else{
	paginationDiv = $('<div>').addClass('pagination').attr('id',options.paginationDivId);
	paginationDiv.prependTo(options.containerDiv);
    }
    
    var paginationOptions = {
		callback:fetchLinks,
		prev_text:"Previous",
		next_text:"Next",
		items_per_page:10,
		link_to:" "
    };
    paginationDiv.pagination(options.linksArray.length,paginationOptions);
    
    function fetchLinks(page_index,jq){
	
	var itemsPerPage = paginationOptions.items_per_page;
	var linksSource = options.linksArray;
	var links = [];
	
	var i = 0,k = 0;
	var link_o;
	while(i < itemsPerPage && k < linksSource.length){
	    link_o = linksSource[page_index*itemsPerPage + i];
	    if(page_index*itemsPerPage + i < linksSource.length && !$.isEmptyObject(link_o)){
		links.push(linksSource[page_index*itemsPerPage + i]);
		i++;
	    }
	    k++;
	}
	/*for(var i = 0; i < itemsPerPage; i++){
		if(page_index*itemsPerPage + i < linksSource.length){
		    
		}
	};*/
	console.log("links length = "+links.length);
	self.displayLinks(links,page_index,paginationOptions.items_per_page,options.containerDiv);
	console.log("DISABLED > "+self.actionsDisabled);
	if(self.actionsDisabled){
	    self.disableActions();
	}else{
	    self.enableActions();
	}
	
    }
};

panel.resultTab.displayLinks = function(links,page_index,items_per_page,containerDiv){
    
    	var self = this;

    	var linksHeader = containerDiv.find('div.links-header');
    	if(linksHeader.length == 0){
    	    linksHeader = $('<div>').addClass('links-header');
    	    linksHeader.prependTo(containerDiv);
    	    var table = $('<table>').addClass('links-result-table').appendTo(linksHeader);
    	    var tr = $('<tr>').appendTo(table);
    	    $('<th>').text("Source").addClass('uri').appendTo(tr).css('border-right',0);
    	    $('<th>').text("Target").addClass('uri').appendTo(tr).css('border-right',0);
    	    $('<th>').text("Confidence").addClass('confidence').appendTo(tr).css('border-right',0);
    	    $('<th>').text("Not correct?").addClass('link-correctness').appendTo(tr).css('border-right',0);
    	}
    	
    	var treeContainer = containerDiv.find('div.results-tree-container');
    	if(treeContainer.length == 0){
    	    treeContainer = $('<div>').addClass('results-tree-container');
    	    treeContainer.appendTo(containerDiv);
    	}else{
    	    treeContainer.empty();
    	}
    	
    	var acceptedLinksTreeRoot = createResultsTree(links);
	
	     	 
    	acceptedLinksTreeRoot.addClass('links-tree');
    	acceptedLinksTreeRoot.appendTo(treeContainer);
    	acceptedLinksTreeRoot.treeview({collapsed: true});
    	
    	console.log("number of children = "+acceptedLinksTreeRoot.children().length);
    	
    	function createResultsTree(links){
    	    
    	    var treeRoot = $('<ul>');
    	    
    	    var linkLi;
    	    var link_o;
    	    var linkContainerUl;
    	    var table;
    	    var tr;
    	    
    	    
    	    for(var i = 0 ; i < links.length;i++){
    		link_o = links[i];
    		linkLi = $('<li>').addClass('link-li');
    		linkLi.appendTo(treeRoot);
    		table = $('<table>').addClass('link-main-info-table');
        	tr = $('<tr>').appendTo(table).attr('row-id',page_index*items_per_page+i);
        	$('<td>').text(link_o['source']).addClass('uri').attr('title',link_o['source']).appendTo(tr);
        	$('<td>').text(link_o['target']).addClass('uri').attr('title',link_o['target']).appendTo(tr);
        	$('<td>').text(link_o['confidence']).addClass('confidence').attr('title',link_o['confidence']).appendTo(tr);
        	
        	var corr_td = $('<td>').addClass('link-correctness').css({'border-right':0}).appendTo(tr);
        	var div = $('<div>').addClass("ui-corner-all ui-state-hover remove-link-div")
        			    .css({
        				'margin-right': 'auto',
        				'margin-left': 'auto',
        				'width': '16px'
        			    });
            	var span = $("<span>").addClass("ui-icon ui-icon-close remove-link-icon ");
            			      //.css({'background-color':'#f5f5f5'});//.html('<input type="checkbox" name="link-correct-check">')
        	span.appendTo(div);div.appendTo(corr_td);	 
        	table.appendTo(linkLi);
    		linkContainerUl = self.createLinkContainer(link_o["inputPaths"]);
    		linkContainerUl.appendTo(linkLi);
    	    }
    	    return treeRoot;
    	}
};

panel.resultTab.createLinkContainer = function(inputPaths){
    	
    	var ul = $("<ul>");
    	var li = $("<li>").addClass('detailed-input-path-li');
    	li.appendTo(ul);
    	var divContainer = $("<div>").addClass('detailed-input-path-container');
	divContainer.appendTo(li);
    	
    	var inputpath_o;
    	
    	var table;
    	var tr1;
    	var tr2;
    	for(var i = 0; i < inputPaths.length;i++){
    	    inputpath_o = inputPaths[i];
    	    table = $('<table>').addClass('input-paths-table ui-corner-all');
    	    
    	    tr1 = $('<tr>');
    	    $('<th>').text('Input path:').appendTo(tr1);
    	    $('<td>').text(inputpath_o["sip"]).appendTo(tr1);
    	    $('<th>').text('Value:').appendTo(tr1);
    	    $('<td>').text(inputpath_o["sipv"]).appendTo(tr1);
    	    
    	    tr2 = $('<tr>');
 	    $('<th>').text('Input path:').appendTo(tr2);
 	    $('<td>').text(inputpath_o["tip"]).appendTo(tr2);
 	    $('<th>').text('Value:').appendTo(tr2);
 	    $('<td>').text(inputpath_o["tipv"]).appendTo(tr2);
    	    
 	    tr1.appendTo(table);
 	    tr2.appendTo(table);
 	    table.appendTo(divContainer);
    	}
    	
    	return ul;
};

panel.resultTab.disableActions = function(){
    this.disableSave();
    this.div.find("div.remove-link-div").hide();
    this.actionsDisabled = true;
};

panel.resultTab.enableActions = function(){
    this.enableSave();
    this.actionsDisabled = false;
};

panel.resultTab.enableSave = function(){
   
    var self = this;
    self.div.find("button#confirm-task-button").show();
   
};

panel.resultTab.disableSave = function(){
    
    this.div.find("button#confirm-task-button").hide();
    //this.div.off("click","button#confirm-task-button");
};











/*panel.resultTab.displayLinks1 = function(links){
	
    	var results = {};
	if((typeof links === "undefined")){
		this.acceptedLinksTab.data = [];
	}
	this.acceptedLinksTab.div.children().remove();
	
	var options = {
			selectBoxMessage:"Not Correct?",
			width:110
	};
	
	
	results = panel.resultTab.makeGrid(links.acceptedLinks,options);
	this.acceptedLinksTab.grid = results.grid;
	
	
	var divOptions = {
			message1: this.acceptedLinks.linksMessage + this.acceptedLinksTab.grid.getDataLength(),
			message2:"The accepted links are the final links of the current task.",
			buttonClass:"confirm-task-button",
			buttonLabel:"Confirm task"
	};
	var infoDiv = this.addInfoPanel(divOptions);
	this.acceptedLinksTab.div.append(infoDiv);
	this.acceptedLinksTab.div.append(results.div);
	results.grid.init();
	
	if((typeof links === "undefined")){
		this.verifyLinksTab.data = [];
	}
	
	this.verifyLinksTab.div.children().remove();
	
	options = {
			selectBoxMessage:"Verify",
			width:80
	};
	
	results = panel.resultTab.makeGrid(links.linksToVerify,options);
	this.verifyLinksTab.grid = results.grid;
	divOptions = {
			message1: this.verifyLinksTab.linksMessage + this.verifyLinksTab.grid.getDataLength(),
			message2:"Verified links will be included to the accepted links.",
			buttonClass:"verify-button",
			buttonLabel:"Verify selected links"
	};
	var infoDiv = this.addInfoPanel(divOptions);
	this.verifyLinksTab.div.append(infoDiv);
	this.verifyLinksTab.div.append(results.div);
	//this.verifyLinksTab.grid.render();
	
	
};

panel.resultTab.makeGrid = function(data,checkboxOptions){
	
    	console.log(JSON.stringify(data));
	var container = $('<div>').addClass('grid-container-class')
				  .css({
				     'font-size':'small',
				  });
	var grid;
	var options = {
	    editable: false,
	    enableCellNavigation: true,
	    autoEdit: false,
	    enableColumnReorder : false,
	    explicitInitialization: true,
	    autoHeight:false
	};
	var columns = [];
	if(data.length == 0){
		for (var i = 0; i < 100; i++) {
		      data[i] = {
		    		  Source:"<http://localhost:8080/data/rowID/1364>",
		    		  Target:"<http://localhost:8080/data/rowID/1364>",
		    		  Confidence:i+"%",
		      };
		}
	}
    
    //console.log(JSON.stringify(data));
    var checkboxSelector = new Slick.CheckboxSelectColumn({
      messageWithSelectBox:checkboxOptions.selectBoxMessage,
      width:checkboxOptions.width
    });

    columns.push(checkboxSelector.getColumnDefinition());

    var col = {};
    var width = 0;
    for (var key in data[0]) {
		console.log(key);
		if(key == "Confidence"){
			width = 80;
		}else{
			width = 150;
		}
		console.log(width);
		col = {
			id : key,
			name : key,
			field : key,
			width:width
		};
		columns.push(col);
    }

    grid = new Slick.Grid(container, data, columns, options);
    grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
    grid.registerPlugin(checkboxSelector);
    
    //container.css({'overflow-y':'auto'});
    var result = {
    		div:container,
        	grid:grid
    };
    return result;
};

panel.resultTab.addInfoPanel = function(options){
	
	var infoDiv = $('<div>').addClass('links-info');
	var table = $('<table>').addClass('links-info-table');
	var row1 = $('<tr>');
	var td1 = $('<td>').text(options.message1).addClass('total-links')
					   .css({'width':'80%'});
	var td2 = $('<td>').html('<button type="button" class="'+options.buttonClass+'">'+
							 options.buttonLabel+'</button>')
					   .css({'width':'15%'});;
	row1.append(td1).append(td2).css({'width':'80%'});
	var row2 = $('<tr>');
	var td3 = $('<td>').text(options.message2);
	row2.append(td3);
	table.append(row1).append(row2);
	infoDiv.append(table);
	return infoDiv;
};

panel.resultTab.acceptedLinks.updateInfoPanel = function(){
	var totalLinksTd = this.div.find(".total-links");
	totalLinksTd.text(this.linksMessage + this.grid.getDataLength());
};

panel.resultTab.verifyLinks.updateInfoPanel = function(){
	var totalLinksTd = this.div.find(".total-links");
	totalLinksTd.text(this.linksMessage + this.grid.getDataLength());
};

panel.resultTab.collectVerifiedLinksFromGrid = function(){
	
	var grid = this.verifyLinksTab.grid;
	var selectedRows = grid.getSelectedRows();
	var gridData = grid.getData();
	var helpArray = [];
	var resultData = [];
	var verifiedLinks = [];
	
	if(selectedRows.length == 0){
		return;
	}
	for(var i = 0;i < gridData.length; i++){
		helpArray[i] = 1;
	}
	for(var i = 0; i < selectedRows.length; i++){
		helpArray[selectedRows[i]] = 0;
		grid.invalidateRow(selectedRows[i]);
		verifiedLinks.push(gridData[selectedRows[i]]);
	}
	//console.log(helpArray.toString());
	for(var i = 0; i < gridData.length;i++){
		if(helpArray[i] == 1){
			resultData.push(gridData[i]);
		}
	}
	var checkboxSelector = new Slick.CheckboxSelectColumn({
		  messageWithSelectBox:"Verify",
		  width:80
	});
	var columns = grid.getColumns();
	columns[0] = checkboxSelector.getColumnDefinition(); 
	grid.setColumns(columns);
	
	grid.setSelectionModel(new Slick.RowSelectionModel({selectActiveRow: false}));
	checkboxSelector.init(grid);
    
	grid.setData(resultData);
	grid.render();
	//console.log(JSON.stringify(verifiedLinks));
	return verifiedLinks;
};

panel.resultTab.addVerifiedLinksToGrid = function(verifiedLinks){
	
	var grid = this.acceptedLinksTab.grid;
	var gridData = grid.getData();
	
	for(var i = 0; i<verifiedLinks.length;i++){
		gridData.push(verifiedLinks[i]);
	}
	grid.render();
};
*/


/*$("#result-tabs").tabs({
active: 0, 
activate:function(event,ui){
	console.log(ui.newTab.attr('aria-controls'));
	var grid;
	if (ui.newTab.attr('aria-controls') == panel.resultTab.verifyLinksTab.div.attr('id')){
		grid = panel.resultTab.verifyLinksTab.grid;
	}else{
		grid = panel.resultTab.acceptedLinksTab.grid;
	}
	if(grid!=''){
		grid.setColumns(grid.getColumns());
	}
},
beforeActivate:function(event,ui){
	console.log(ui.newTab.attr('aria-controls'));
	if (ui.newTab.attr('aria-controls') == panel.resultTab.verifyLinksTab.div.attr('id')){
		grid = panel.resultTab.verifyLinksTab.grid;
	}else{
		grid = panel.resultTab.acceptedLinksTab.grid;
	}
	if(grid!=''){
		grid.setColumns(grid.getColumns());
	}
}
heightStyle: "auto"
});*/