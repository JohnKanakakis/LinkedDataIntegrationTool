
panel.mappingTasksSection.editor = {
	div:{},
	treeViewRoot:{},
	treeCounter:0,
	treeContainer:{},
	visibleTaskName:'',
	sourceVocabularyClasses:[],
	sourceVocabularyProperties:[],
	importedTargetTerms:[],
	sourceVocabulary:[],
	sourceTermsToDivIdMap:{},
	pairsMap:{},
	customPairsMap:{},
	buttonsAreaLayoutFile:'scripts/schema-mappings/panel-ui/mapping-tasks/buttons-area-layout.html',
	menuFormat:{
	    PREDEFINED_MAPPINGS_FORMAT:"predefined",
	    GENERAL_FORMAT:"general"
	},
	moreActionsMenu:{
	    div:{},
	    position:{}
	}
};

panel.mappingTasksSection.editor.init = function(){
    var self = this;
    
    self.div = panel.mappingTasksSection.mappingTaskPanel;
    self.treeContainer = $('<div>').attr('id','mappings-tree-container');
    self.treeContainer.appendTo(self.div);
    self.addButtons();
    self.moreActionsMenu.init(); 
    self.addListeners();
    self.div.hide();
};

panel.mappingTasksSection.editor.initMappingsMenu = function(){
	
    	var self = this;
    	
	var mappingTitles = ['Class mappings','Property mappings'];
	var addCustomButton;
	var transferMappingsButton;
	self.treeCounter++;
	self.treeViewRoot = $('<ul>').attr('id','tree-'+self.treeCounter).addClass('tree-mappings-menu ui-corner-all');
	for(var i = 0; i < mappingTitles.length; i++){
	    mapping_li = $('<li>').addClass('main-mapping-li');
	    $('<span>').text(mappingTitles[i]).attr('style','font-size:medium;float:left;margin-right:5px').appendTo(mapping_li);
	    
	    addCustomButton = $('<button>').addClass('custom-mapping-button ui-corner-all')
	    			  .attr({
	    			      'style':'float:left;border:1px solid #aaaaaa',
	    			      'title':'Add a custom mapping'
	    			  });
	    addCustomButton.appendTo(mapping_li);
	    $('<span>').addClass('ui-icon ui-icon-pencil').attr('style','float:left').appendTo(addCustomButton);
	    $('<span>').addClass('ui-icon ui-icon-plus').attr('style','float:left').appendTo(addCustomButton);
	    
	    
	    transferMappingsButton = $('<button>').addClass('transfer-mapping-button ui-corner-all')
	    					.attr({
	    					    'style':'float:left;border:1px solid #aaaaaa',
	    					    'title':'Transfer the source terms to target terms'
	    					});
	    transferMappingsButton.appendTo(mapping_li);
	    $('<span>').addClass('ui-icon ui-icon-transferthick-e-w').attr('style','float:left').appendTo(transferMappingsButton);
	    
	    mapping_ul = $('<ul>').addClass('main-mapping-ul');
	    mapping_ul.appendTo(mapping_li);
	    mapping_li.appendTo(self.treeViewRoot);
	}
	self.treeViewRoot.appendTo(self.treeContainer);
	
};

panel.mappingTasksSection.editor.addButtons = function(){
    	var self = this;
    	var buttonsArea = $('<div>').attr('id','buttons-area');
	buttonsArea.load(self.buttonsAreaLayoutFile,function(){
	    var menu = buttonsArea.find("ul#more-actions-menu");
	    menu.menu({
		select:function(event,menuUi){
		    var id = menuUi.item.attr('id');
		    console.log(menuUi.item.attr('id'));
		    if(id == "add-new-vocabulary"){
			ui.importVocabularyBox.open(); 
		    }else if (id == "view-prefixes"){
			self.displayAvailablePrefixes();
		    }else if(id == "view-target-vocabulary"){
			self.displayTargetVocabulary();
		    }else if(id == "view-imported-vocabularies"){
			self.displayImportedVocabularies();
		    }
		    $(event.target).closest("ul#more-actions-menu").hide();
		}
	    })
	    .removeClass('ui-corner-all');
	})
	.appendTo(self.div);
	
};



panel.mappingTasksSection.editor.showTask = function(taskName){
    var self = this;
    
    var visibleTaskName = self.visibleTaskName;
    console.log("panel wants to display task name = "+taskName);
    console.log("visible task name = "+visibleTaskName);
   
    if(taskName == visibleTaskName) return;
    
    self.hideTask(self.visibleTaskName);
    
    
    
    if(mappingsManager.isCompletedTask(taskName)){
	console.log(taskName + " is completed");
    	var treeViewRoot = self.treeContainer.find('ul.tree-mappings-menu[task-name='+taskName+']');
    	console.log("view only treeview root length = "+treeViewRoot.length);
    	treeViewRoot.show();
    	self.disableSave();
    	self.disableEditing(treeViewRoot);
    }else{
	    console.log(taskName + " is NOT completed");
	    var treeViewRoot = self.treeContainer.find('ul.tree-mappings-menu[task-name='+taskName+']');
	    console.log("view only treeview root length = "+treeViewRoot.length);
	    self.treeViewRoot = treeViewRoot;
	    self.treeViewRoot.show();
	    self.enableSave();
	    self.enableEditing();
    }
    self.visibleTaskName = taskName;
};

panel.mappingTasksSection.editor.hideTask = function(taskName){
    var self = this;
    console.log('hide task = '+self.treeContainer.find('ul.tree-mappings-menu[task-name='+taskName+']').length);
    self.treeContainer.find('ul.tree-mappings-menu[task-name='+taskName+']').hide();
};


panel.mappingTasksSection.editor.moreActionsMenu.init = function(){
    
    var self = this;
    var editor = panel.mappingTasksSection.editor;
    var menuContainer = $('<div>').attr('id','menu-container').addClass('ui-corner-all');
    var header = $('<div>').attr('class','menu-container-header');
    var body = $('<div>').attr('class','menu-container-body');
    
    menuContainer.appendTo(editor.div);
    menuContainer.hide();
    self.position = {
	'top':(editor.div.height() - menuContainer.height())/2,
	'left':(editor.div.width() - menuContainer.width())/2
    };
    console.log(JSON.stringify(self.position));
    
    header.html("<span class='header-text'>Menu</span>"+
	        "<span  class='close-menu-icon ui-icon ui-icon-closethick' style='float:right'></span>");
    header.appendTo(menuContainer);
    body.appendTo(menuContainer);
    menuContainer.draggable({
	cursor:'move',
	handle: ".menu-container-header",
    });
    self.div = menuContainer;
};

panel.mappingTasksSection.editor.moreActionsMenu.setHeader = function(text){   
    var self = this;
    var header = self.div.find('div.menu-container-header');
    header.find('span.header-text').text(text);
};

panel.mappingTasksSection.editor.moreActionsMenu.setBody = function(content){
    var self = this;
    var body = self.div.find('div.menu-container-body');
    body.empty();
    content.appendTo(body);
};

panel.mappingTasksSection.editor.moreActionsMenu.display = function(){
    var self = this;
    var editor = panel.mappingTasksSection.editor;
    self.div.show();
    self.position = {
		'top':(editor.div.height() - self.div.height())/2,
		'left':(editor.div.width() - self.div.width())/2
    };
    self.div.css(self.position);
};

panel.mappingTasksSection.editor.displayImportedVocabularies = function(){
    
    var self = this;
    
    
    mappingsManager.getImportedVocabularies(display);
    
    function display(vocabularies){
	var table = $('<table>').attr('id','vocabularies-table').addClass('menu-container-table');
	console.log(JSON.stringify(vocabularies));
	for(var i = 0; i < vocabularies.length;i++){
		tr = $('<tr>').css('display','block');
		td1 = $('<td>').text(vocabularies[i]["name"]).css('font-weight','bold');
		//console.log("SOURCE > " + vocabularies[i]["source"]);
		td2 = $('<td>').text(vocabularies[i]["source"]);
		td1.appendTo(tr);td2.appendTo(tr).attr('title',(vocabularies[i]["source"]));
		tr.appendTo(table);
	}
	self.moreActionsMenu.setHeader('Imported Vocabularies');
	self.moreActionsMenu.setBody(table);
	self.moreActionsMenu.display();
    }
    
    
};

panel.mappingTasksSection.editor.displayAvailablePrefixes = function(){
    var self = this;
    
    mappingsManager.getPrefixes(display);
    
    
    function display(prefixes){
	var table = $('<table>').attr('id','prefixes-table').addClass('menu-container-table');
	var div;
	for(var i = 0; i < prefixes.length; i++){
		tr = $('<tr>').css('display','block');
		td1 = $('<td>').width(400).css('font-weight','bold');//attr('title',prefixes[i]["prefix"]);
		div = $('<div>');
		div.text(prefixes[i]["prefix"]).attr('title',prefixes[i]["prefix"]).appendTo(td1);
		td2 = $('<td>').width(400);//.attr('title',prefixes[i]["uri"]);
		div = $('<div>');
		div.text(prefixes[i]["uri"]).attr('title',prefixes[i]["uri"]).appendTo(td2);
		td1.appendTo(tr);td2.appendTo(tr);
		tr.appendTo(table);
	} 
	self.moreActionsMenu.setHeader('Available prefixes');
	self.moreActionsMenu.setBody(table);
	self.moreActionsMenu.display();
    }
    
    
    
};

panel.mappingTasksSection.editor.displayTargetVocabulary = function(){
    
    
    
    
};


panel.mappingTasksSection.editor.displayMappingsMenu = function(vocabulary,taskName,menuFormat){
    	
    	var self = this;
    	if(!$.isEmptyObject(self.treeViewRoot)) self.treeViewRoot.hide();
    	
    	self.initMappingsMenu();
    	self.clear();
    	var children = self.treeViewRoot.children();
    	var classMappingsLi = $(children[0]);
    	var classMappingsUl = classMappingsLi.find('ul.main-mapping-ul');
    	var propertyMappingsLi = $(children[1]);
    	var propertyMappingsUl = propertyMappingsLi.find('ul.main-mapping-ul');
    	var sourceVocabularyClasses = vocabulary.classes;
    	var sourceVocabularyProperties = vocabulary.properties;
    	
    	self.sourceVocabulary = [];
    	self.addToSourceVocabulary(sourceVocabularyClasses);
    	self.addToSourceVocabulary(sourceVocabularyProperties);
    	
    	
    	var datasetPrefix = "";
    	var hasValueProperty = "";
    	
    	if(sourceVocabularyClasses.length > 0 && menuFormat == self.menuFormat.PREDEFINED_MAPPINGS_FORMAT){
    	    datasetPrefix = sourceVocabularyClasses[0]["prefix"];
    	    datasetUri = sourceVocabularyClasses[0]["uri"];
    	    hasValueProperty = datasetPrefix + ":" + "hasValue";
    	    console.log("has value property > "+hasValueProperty);
    	    console.log("source vocabulary = "+JSON.stringify(self.sourceVocabulary));
    	}
    	
    	self.treeViewRoot.attr('task-name',taskName);
    	console.log('class li length = '+classMappingsLi.length);
    	console.log('ul length = '+propertyMappingsUl.length);
    	
    	var options = {
    		term:'',
    		elClass:"root-li",
    		
    		includeDeleteIcon:false
    	};
    	
    	var hasValueProperty_o = {};
    	for(var i = 0; i < sourceVocabularyClasses.length;i++){
    	    options.term = sourceVocabularyClasses[i];
    	    mappingInfo_li = self.createMappingLi(options);
    	    mappingInfo_li.appendTo(classMappingsUl);   
    	}
    	for(var i = 0; i < sourceVocabularyProperties.length;i++){
    	    if(hasValueProperty!=""){
    		if((sourceVocabularyProperties[i]["prefix"] + ":" + sourceVocabularyProperties[i]["name"]) === hasValueProperty){
    		    hasValueProperty_o = sourceVocabularyProperties[i];
    		    continue;
        	}
    	    }
    	    options.term = sourceVocabularyProperties[i];
    	    options.elClass = "root-li";
    	    mappingInfo_li = self.createMappingLi(options);
    	    mappingInfo_li.appendTo(propertyMappingsUl);  
    	}
    	
    	self.treeViewRoot.treeview({
    	    collapsed : false
	});
    	self.enableSave();
    	self.enableEditing();
    	self.div.show();
    	self.visibleTaskName = taskName;
    	
    	console.log("menu foramt = " + menuFormat);
    	
    	if(menuFormat == self.menuFormat.PREDEFINED_MAPPINGS_FORMAT){
    	    console.log("non rdf!");
    	    addAditionalPredefinedMappings(hasValueProperty_o);
    	    hideMappingActionIcons();
    	}

    	
    	
    	
    	function addAditionalPredefinedMappings(term){
    	    
    	    var mappingLiArray = propertyMappingsUl.find('li.mapping-li');
    	    
    	    $.each(mappingLiArray,function(i,mappingLi){
    		var newLi = self.extendSourceTerm($(mappingLi));
    		var inputText = newLi.find("input[type=text].source-term");
    		newLi.find("div.mapping-terms-block").attr('term-uri',term["uri"]+term["name"]);
    		var td = inputText.parent();
    		inputText.remove();
    		$('<div>').addClass('source-term').text(term["prefix"]+":"+term["name"]).appendTo(td);
    	    });
    	};
    	
    	function hideMappingActionIcons(){
    	    self.div.find("span.extend-source-term-icon").hide();
    	    self.div.find("span.delete-li-icon").hide();
    	};
};



panel.mappingTasksSection.editor.addImportedVocabularies = function(targetVocabularies){
    	var editor = panel.mappingTasksSection.editor;
	for(var i = 0; i < targetVocabularies.length;i++){
	    editor.addImportedVocabulary(targetVocabularies[i]);
	};
};


panel.mappingTasksSection.editor.addImportedVocabulary = function(vocabulary){
    	
    	//this.namesOfTargetVocabularies.push(vocabulary['name']);
	var vocabularyTerms = vocabulary['terms'];
	for(var j = 0; j < vocabularyTerms.length;j++){
	    if(vocabularyTerms[j]['prefix'] === "unknown" || vocabularyTerms[j]['prefix'] === ""){
		this.importedTargetTerms.push("<"+vocabularyTerms[j]['uri']+vocabularyTerms[j]['name']+">");
	    }else{
		this.importedTargetTerms.push(vocabularyTerms[j]['prefix']+':'+vocabularyTerms[j]['name']);
	    }
	    
	}
};

panel.mappingTasksSection.editor.addToSourceVocabulary = function(array){
	
	for(var j = 0; j < array.length;j++){
	    this.sourceVocabulary.push(array[j]['prefix']+':'+array[j]['name']);
	}
};


panel.mappingTasksSection.editor.addTargetAutoComplete = function(inputText){
	var self = this;
	inputText.autocomplete({
	      source: self.importedTargetTerms
	});
};

panel.mappingTasksSection.editor.addSourceAutoComplete = function(inputText){
	var self = this;
	
	inputText.autocomplete({
	      source: self.sourceVocabulary
	});
};


panel.mappingTasksSection.editor.createMappingLi = function(options){
    
    	var term = options.term;
    	var includeDeleteIcon = options.includeDeleteIcon;
    	var li  = $('<li>').addClass('mapping-li '+options.elClass);
	var div = $('<div>').addClass('mapping-terms-block');
	var table = $('<table>').addClass('mapping-terms-table');
	
	table.appendTo(div);
	var tr = $('<tr>').appendTo(table);
	var td1 = $('<td>').appendTo(tr);
	var td2 = $('<td>').appendTo(tr);
	$('<td>').appendTo(tr).addClass('result');
	var extendSpan = $('<span>').addClass('extend-source-term-icon ui-icon ui-icon-arrowthick-1-s');
	extendSpan.appendTo(td1);
	
	
	if(typeof term !== 'undefined'){
	    sourceTermDiv = $('<div>').addClass('source-term').text(term["prefix"]+':'+term["name"]).appendTo(td1);
	    div.attr('term-uri',term["uri"]+term["name"]);
	}else{
	    var sourceTermInput = $('<input>').addClass('source-term')
	    .attr({
		'size':40,
		'type':'text'
	    })
	    .css({
		'font-size':'small'
	    }).appendTo(td1);
	    this.addSourceAutoComplete(sourceTermInput);
	}
	
	//arrowDiv = $('<div>').addClass('results-mapping-arrow').css({'border':0});//.appendTo(td2);
	
	var targetTermInput = $('<input>').addClass('target-term')
				    .attr({
					'size':40,
					'type':'text'
				    })
				    .css({
					'font-size':'small',
					'float':'left'
				    });
	this.addTargetAutoComplete(targetTermInput);
	
	targetTermInput.appendTo(td2);
	div.appendTo(li);
	
	
	/*var addSpan = $('<span>').addClass('add-target-term-icon ui-icon-plusthick ui-icon')
				 .css({
				     'float':'left'
				 });
	addSpan.appendTo(td2);*/
	
	if(includeDeleteIcon){
	    $('<span>').addClass('delete-li-icon ui-icon ui-icon-close').appendTo(div);
	}
	return li;
};


panel.mappingTasksSection.editor.addTargetInputText = function(table){
    	
    	var tr = $('<tr>').appendTo(table);
    	var td1 = $('<td>').appendTo(tr);
    	var td2 = $('<td>').appendTo(tr);
    	var td3 = $('<td>').appendTo(tr);
    	var inputText = $('<input>').addClass('target-term')
    				     .attr({
					'size':40,
					'type':'text'
				     })
				     .css({
					'font-size':'small',
					'float':'left'
				     }).appendTo(td2);
    	this.addTargetVocabularyAutoComplete(inputText);
    	$('<span>').addClass('delete-target-term-icon ui-icon ui-icon-close').appendTo(td2);
};

panel.mappingTasksSection.editor.deleteTargetInputText = function(td){
    	
    	td.parent().remove();
};


panel.mappingTasksSection.editor.extendSourceTerm = function(li){
    
    	var self = this;
    	var ul = li.children('ul');
    	if(ul.length == 0){
    	    ul = $('<ul>');
    	    ul.appendTo(li);
    	}
    	var options = {
    		includeDeleteIcon:true,
    		elClass:""
    	};
    	var newLi = self.createMappingLi(options);
    	newLi.appendTo(ul);
    	self.treeViewRoot.treeview({add:newLi});
    	
    	return newLi;
};


panel.mappingTasksSection.editor.addCustomMapping = function(mainUl){
    	
    	var self = this;
    
    	var li = $('<li>').addClass('mapping-li custom-mapping-li root-li');
    	var div = $('<div>').addClass('mapping-terms-block');
    	div.height(240).appendTo(li);
    	var table = $('<table>').addClass('mapping-terms-table');
	table.appendTo(div);
	//var tr1 = $('<tr>').appendTo(table);
	var tr2 = $('<tr>').appendTo(table);
	var tr3 = $('<tr>').appendTo(table);
	
	//$('<th>').appendTo(tr1).width(50).text("Prefix definitions:");
	$('<th>').appendTo(tr2).width(50).text("Source Pattern:");
	$('<th>').appendTo(tr3).width(50).text("Target Pattern:");
	
	//var td1 = $('<td>').appendTo(tr1);
	var td2 = $('<td>').appendTo(tr2).width(700);
	var td3 = $('<td>').appendTo(tr3).width(700);
	
	$('<td>').addClass('result').width(100).appendTo(tr3);
	//$('<td>').addClass('result').width(100).appendTo(tr3);
	
	var textAreaAttr = {
		"rows":6,
		"cols":80
	};
	/*var textareaCss = {
		'resize':'none',
		'border': '1px solid #aaaaaa'
	};*/
	
	//$("<textarea>").addClass('prefix-definitions-area ui-corner-all').attr(textAreaAttr).css(textareaCss).appendTo(td1);
	$("<textarea>").addClass('pattern-area source-pattern-area ui-corner-all').attr(textAreaAttr).appendTo(td2);
	$("<textarea>").addClass('pattern-area target-pattern-area ui-corner-all').attr(textAreaAttr).appendTo(td3);
	
	//$('<td>').appendTo(tr).addClass('result');
    	$('<span>').addClass('delete-li-icon ui-icon ui-icon-close').appendTo(div);
    	li.prependTo(mainUl);
    	self.treeViewRoot.treeview({add:li});
    	return li;
};


panel.mappingTasksSection.editor.applyMappings = function(){
    	
    	var self = this;
    	var mappingsToSend = [];
    	var children = this.treeViewRoot.children();
    	var classMappingsLi = $(children[0]);
    	var classMappingsUl = classMappingsLi.find('ul.main-mapping-ul');
    	var propertyMappingsLi = $(children[1]);
    	var propertyMappingsUl = propertyMappingsLi.find('ul.main-mapping-ul');
    	
    	var mappingsLi = propertyMappingsUl.children('li.mapping-li');
    	var div;
    	
    	var spattern;
    	var tpatterns;
    	var mapId;
    	var pairId;
    	var pair;
    	var customMappingInfo;
    	for(var i = 0; i < mappingsLi.length;i++){
    	    
    	    mapId = 'prmap'+i;
    	    pairId = 'prpair'+i;
    	    
    	    $(mappingsLi[i]).attr('id',mapId);
    	    div = $(mappingsLi[i]).children('div');
    	    div.attr('id',pairId);
    	
    	    if($(mappingsLi[i]).hasClass('custom-mapping-li')){
    		customMappingInfo = getCustomMappingInfo(div);
    		customMappingInfo.name = mapId;
    		mappingsToSend.push(customMappingInfo);
    		pair = {
    	    		sPattern:customMappingInfo.sPattern,
    	    		tPattern:customMappingInfo.tPattern,
    	    		id:mapId
    	    	};
    		self.customPairsMap[mapId] = pair;
    		div.attr('id',mapId);
    		continue;
    	    }
    	    
    	    var sourceTermElem = div.find('.source-term');
    	    var sp;
    	    if(sourceTermElem.is('input')){
    		sp = sourceTermElem.val();
    	    }else{
    		sp = sourceTermElem.text();
    	    }
    	    
    	    var tp = div.find('.target-term').val();
    	    
    	    if(sp == '' || tp == '') continue;
    	    
    	    self.sourceTermsToDivIdMap[sp] = pairId;
    	    
    	    pair = {
    		subject:'?SUBJ',
    		spredicate:sp,
    		tpredicate:tp,
    		object:'?o',
    		children:[],
    		id:pairId,
    		isCustomized:false
    	    };
    	 
    	    extendPair($(mappingsLi[i]).children('ul'),pair);
    	    //this.pairsMap[pair.spredicate] = pair;
    	    
    	    self.pairsMap[pairId] = pair;
    	    //this.pairsMap[pair.subject + ' ' +  pair.spredicate + ' ' + pair.object] = pair;
    	    
    	    spattern = serializeSourcePattern(pair);
    	    tpatterns = getTargetPatterns(pair);
    	    if(pair.children.length == 1){
    		spattern = spattern.replace('.','');
    		//tpattern = tpattern.replace('.','');
	    }
    	    console.log(spattern);
    	   
    	    mappingsToSend.push({name:mapId,isCustomized:false,sPattern:serializeSourcePattern(pair),targetPatterns:tpatterns});
    	}
    	
    	
    	mappingsLi = classMappingsUl.children('li.mapping-li');
    	for(var i = 0; i < mappingsLi.length;i++){
    	    
    	    mapId = 'clmap'+i;
    	    pairId = 'clpair'+i;
    	    
    	    $(mappingsLi[i]).attr('id',mapId);
    	    div = $(mappingsLi[i]).children('div');
    	    div.attr('id',pairId);
    	
    	    if($(mappingsLi[i]).hasClass('custom-mapping-li')){
		customMappingInfo = getCustomMappingInfo(div);
		customMappingInfo.name = mapId;
		mappingsToSend.push(customMappingInfo);
		
    		pair = {
    	    		sPattern:customMappingInfo.sPattern,
    	    		tPattern:customMappingInfo.tPattern,
    	    		id:mapId
    	    	};
		//this.customPairsMap[pair.sPattern] = pair;
    		self.customPairsMap[mapId] = pair;
    		div.attr('id',mapId);
		continue;
	    }
    	    
    	    var sourceTermElem = div.find('.source-term');
    	    var so;
    	    if(sourceTermElem.is('input')){
    		so = sourceTermElem.val();
    	    }else{
    		so = sourceTermElem.text();
    	    }
    	    
    	    var to = div.find('.target-term').val();
    	    
    	    if(so == '' || to == '') continue;
    	    
    	    self.sourceTermsToDivIdMap[so] = pairId;
    	    pair = {
    		subject:'?SUBJ',
    		predicate:'rdf:type',
    		sobject:so,
    		tobject:to,
    		children:[],
    		id:pairId,
    		isCustomized:false
    	    };
    	 
    	    extendPair($(mappingsLi[i]).children('ul'),pair);
    	    //this.pairsMap[pair.sobject] = pair;
    	    
    	    self.pairsMap[pairId] = pair;
    	   // this.pairsMap[pair.subject + ' ' +  pair.predicate + ' ' + pair.sobject] = pair;
    	
    	    spattern = pair.subject + ' ' +  pair.predicate + ' ' + pair.sobject;
    	    tpatterns = [{pattern:pair.subject + ' ' + pair.predicate + ' ' + pair.tobject}];
    	    if(pair.children.length == 1){
    		spattern = spattern.replace('.','');
    		//tpattern = tpattern.replace('.','');
	    }
    	    console.log(spattern);
    	   // console.log(tpattern);
    	    mappingsToSend.push({name:mapId,isCustomized:false,sPattern:spattern,targetPatterns:tpatterns});
    	}
    	
    	console.log(JSON.stringify(mappingsToSend));
    	console.log(JSON.stringify(self.pairsMap));
    	mappingsManager.submitMappings(self.visibleTaskName,mappingsToSend);
    	return;
    	
    	function extendPair(root,pattern){
    	    
    	    var children = root.children('li.mapping-li');
    	    var id;
    	    for(var i = 0; i < children.length; i++){
    		id = root.id+"-"+i;
    		var li = $(children[i]);
    		var div = li.children('div');
    		div.attr('id',id);
    		
    		
    		var sourceTermElem = div.find('.source-term');
    		var sp;
    		if(sourceTermElem.is('input')){
    		    sp = sourceTermElem.val();
    		}else{
    		    sp = sourceTermElem.text();
    		}
        	var tp = div.find('.target-term').val();
        	    
        	if(sp == '' || tp == '') continue;
        	
        	self.sourceTermsToDivIdMap[sp] = id;
    		
        	var newPattern = {
    	    		subject:pattern.object,
    	    		spredicate:sp,
    	    		tpredicate:tp,
    	    		object:pattern.object+i,
    	    		children:[],
    	    		id:id
    	    	};
    		//self.pairsMap[newPattern.spredicate] = newPattern;
    		self.pairsMap[newPattern.id] = newPattern;
    		//self.pairsMap[newPattern.id] = newPattern;//self.pairsMap[newPattern.spredicate] = newPattern;
    		pattern.children.push(newPattern);
    		//li.children('div').css({'background':'red'}); //alert('stop');
    		extendPair(li.children('ul'),newPattern);
    		//li.children('div').css({'background':'green'});
    	    }
    	};
    	
    	function serializeSourcePattern(mapping){

    	    var serializedPattern = mapping.subject + ' ' + mapping.spredicate + ' ' + mapping.object + '.';
    	    for(var i = 0;i < mapping.children.length;i++){
    		serializedPattern += serializeSourcePattern(mapping.children[i]);
    	    };
    	    return serializedPattern;
    	}
    	
    	function getTargetPatterns(mapping){

    	    var pattern_o = {pattern:mapping.subject + ' ' + mapping.tpredicate + ' ' + mapping.object};
    	    var array = [];
    	    array.push(pattern_o);
    	    for(var i = 0;i < mapping.children.length;i++){
    		$.merge(array, getTargetPatterns(mapping.children[i]));
    	    };
    	    return array;
    	}
    	
    	function getCustomMappingInfo(mappingDiv){
    	    
    	    var info = {};
    	    var sourcePatternText = mappingDiv.find('textarea.source-pattern-area').val();
    	    var targetPatternText = mappingDiv.find('textarea.target-pattern-area').val();
    	   
    	    info.sPattern = sourcePatternText;
    	    info.tPattern = targetPatternText;
    	    info.isCustomized = true;
    	    return info;
    	};
    	
};

panel.mappingTasksSection.editor.resetEditorUi = function(){
    var self = this;
    self.treeViewRoot.find('td.result').html('');
    
    var wrongPatternsArray = self.treeViewRoot.find('textarea.pattern-area.wrong-pattern');
    console.log("wrong TEXT AREA LENGTH > " + wrongPatternsArray.length);
    $.each(wrongPatternsArray,function(index,patternTextArea){
	$(patternTextArea).removeClass('wrong-pattern');
    });
    
    var wrongMappingsArray = self.treeViewRoot.find('li.root-li.wrong-mapping');
    console.log("wrong mapping LENGTH > " + wrongMappingsArray.length);
    $.each(wrongMappingsArray,function(index,liArea){
	$(liArea).removeClass('wrong-mapping');
    });
};

panel.mappingTasksSection.editor.displayResults = function(mappingPairs){
    	
    	var self = this;
    	var isCorrect;
    	var mappingPair,name,couple,isCustomized;
    	var sourceTerm,targetTerm,num,id,li,div,td;
    	
    	console.log(JSON.stringify(this.pairsMap));
    	console.log(JSON.stringify(self.sourceTermsToDivIdMap));
    	self.resetEditorUi();
        
    	for(var i = 0; i < mappingPairs.length;i++){
    	    mappingPair = mappingPairs[i];
    	    console.log(JSON.stringify(mappingPair));
    	    name = mappingPair['name'];
    	    isCustomized = mappingPair['isCustomized'];
    	    isCorrect = mappingPair["isCorrect"];
    	    
    	    if(isCustomized){
    		li = this.treeViewRoot.find('li#'+name);
    		num = mappingPair["numberOfTriples"];
    		id = this.customPairsMap[name].id;
		div = li.find('div#'+id);
		td = div.find('td.result');
		if(isCorrect){
		    td.html('<span style="margin-right:5px;float: left;">'+"("+num+')</span>'+
			'<span class="ui-icon ui-icon-check" style="float: left;"></span>');
		}else{
		    td.text('wrong mapping');
		}
    	    }else{
    		for(var j = 0; j < mappingPair['couples'].length; j++){
    		    couple = mappingPair['couples'][j];
    		    sourceTerm = couple['sourceTerm'];
    		    targetTerm = couple['targetTerms'][0];
    		    num = targetTerm['num'];
    		
    		    li = this.treeViewRoot.find('li#'+name);
    		    div = li.find('div[term-uri="'+sourceTerm+'"]');
    		    id = self.sourceTermsToDivIdMap[sourceTerm];//this.pairsMap[couple["sourceTerm"]].id;
    		    td = div.find('td.result');
    		    td.html('<span style="margin-right:5px;float: left;">'+"("+num+')'+
    		            '</span><span class="ui-icon ui-icon-check" style="float: left;"></span>');
    		}
    	    }
    	}
    	this.addListeners();
    	this.removeLoadingState();
};

panel.mappingTasksSection.editor.displayGeneralError = function(){
    var self = this;
    self.resetEditorUi();
    this.removeLoadingState();
    this.addListeners();
};


panel.mappingTasksSection.editor.displayMappingPairError = function(message,pair,wrong_pattern){
    console.log(message);
    console.log("ERROR FOR PAIR > "+JSON.stringify(pair));
    console.log(pair["name"]);
    
    var self = this;
    
    self.resetEditorUi();
    var uiInfoPair = self.customPairsMap[pair["id"]];//"sPattern"
    
    if(typeof uiInfoPair === 'undefined'){//a formatted pair is wrong!
	console.log("pair map > "+JSON.stringify(self.pairsMap));
	var li = self.treeViewRoot.find('li.root-li#'+pair["name"]);
	li.addClass('wrong-mapping');
	
    }else{
	var errorDiv = self.treeViewRoot.find('div#'+uiInfoPair['id']);
	var inputText;
	console.log("error div length > "+errorDiv.length);
	    
	    
	//self.resetEditorUi();
	if(wrong_pattern == "source"){
		inputText = errorDiv.find('textarea.source-pattern-area');
	}else if(wrong_pattern == "target"){
		inputText = errorDiv.find('textarea.target-pattern-area');
	}
	inputText.addClass('wrong-pattern');
    }
    
    
    this.removeLoadingState();
    this.addListeners();
};

panel.mappingTasksSection.editor.addListeners = function(){

    var self = this;
    self.div.on("click", 'span.add-target-term-icon',function(event) {
	event.preventDefault();
	self.addTargetInputText($(event.target).closest('table'));
    });

    self.div.on("click", "span.delete-target-term-icon", function(event) {
	event.preventDefault();
	self.deleteTargetInputText($(event.target).closest('td'));
    });
    self.div.on("click", "span.extend-source-term-icon", function(event) {
	event.preventDefault();
	self.extendSourceTerm($(event.target).closest('li'));
    });
    
    self.div.on("click", "#apply-mappings-button", function(event) {
	event.preventDefault();
	self.addLoadingState();
	self.removeListeners();
	self.applyMappings();
    });
    
    self.div.on("click", "#save-mappings-button", function(event) {
	event.preventDefault();
	mappingsManager.saveMappingTask(self.visibleTaskName);
    });
    
    self.div.on("click", ".delete-li-icon", function(event) {
	event.preventDefault();
	var li = $(event.target).closest('li');
	li.remove();
    });
    
    self.div.on("click", "#add-new-target-vocabulary", function(event) {
	console.log($(this).attr('id'));
	event.preventDefault();
	ui.targetVocabularyBox.open();
    });
    self.div.on("click", "span.close-menu-icon", function(event) {
	event.preventDefault();
	$(event.target).closest('#menu-container').hide();
    });
    
    
    self.div.on("click","button#more-button,button#more-button > span",function(event){
	event.stopPropagation();console.log('here '+event.target.nodeName);
	var menu; 
	var button;
	if(event.target.nodeName == "BUTTON"){
	    button = $(event.target);
	}else{
	    button = $(event.target).parent();
	}
	menu = button.siblings('ul#more-actions-menu');
	
	menu.css({
	    'top':button.outerHeight(true),
	    'left':5
	});
	console.log(menu.length);
	if(menu.css('display') == 'block'){
	    menu.hide();
	}else{
	    menu.show();
	}	
    });
    self.div.on("click","button.custom-mapping-button,button.custom-mapping-button > span",function(event){
	event.preventDefault();
	event.stopPropagation();
	console.log(event);
	var button;
	if(event.target.nodeName == "BUTTON"){
	    button = $(event.target);
	}else{
	    button = $(event.target).parent();
	}
	var ul = button.siblings('ul.main-mapping-ul');
	console.log("ul length"+ul.length);
	var newLi = self.addCustomMapping(ul);
    });
    
    self.div.on("click","button.transfer-mapping-button,button.transfer-mapping-button > span",function(event){
	event.preventDefault();
	event.stopPropagation();
	console.log(event);
	var button;
	if(event.target.nodeName == "BUTTON"){
	    button = $(event.target);
	}else{
	    button = $(event.target).parent();
	}
	var ul = button.siblings('ul.main-mapping-ul');
	console.log("ul length"+ul.length);
	var liArray = ul.find('li.mapping-li');
	console.log(liArray.length);
	$.each(liArray,function(index,li){
	   var div = $(li).children('div.mapping-terms-block'); 
	   console.log('div length = ' + div.length);
	   var sourceTermEl = div.find('.source-term');
	  
	   var termText;
	   if(sourceTermEl.is('input')){
	       termText = sourceTermEl.val();
	   }else{
	       termText = sourceTermEl.text();
	   }
	   div.find('input[type=text].target-term').val(termText); 
	});
    });
    
};

panel.mappingTasksSection.editor.removeListeners = function(){
    this.div.off();
};


panel.mappingTasksSection.editor.disableSave = function(){
    this.div.find("#save-mappings-button").hide();
};

panel.mappingTasksSection.editor.enableSave = function(){
    this.div.find("#save-mappings-button").show();
};

panel.mappingTasksSection.editor.disableEditing = function(treeViewRoot){
    var self = this;
    if(typeof treeViewRoot === 'undefined'){
	treeViewRoot = self.treeViewRoot;
    }
    treeViewRoot.find('input[type=text]').attr('readonly','true');
    self.div.find("span.extend-source-term-icon").hide();
    self.div.find('#apply-mappings-button').hide();
};
panel.mappingTasksSection.editor.enableEditing = function(treeViewRoot){
    this.div.find('#apply-mappings-button').show();
    this.div.find("span.extend-source-term-icon").show();
};

panel.mappingTasksSection.editor.clear = function(){
    
    this.sourceVocabularyClasses = [];
    this.sourceVocabularyProperties = [];
    this.pairsMap = {};
};



panel.mappingTasksSection.editor.addLoadingState = function(){
    
    var loadingBox = $('<div>').addClass('loading-box loading');
    this.div.append(loadingBox);
    var width = loadingBox.width();
    var height = loadingBox.height();
    
    console.log("bw/bh = "+width + "/" +height);
    console.log("dw/dh = "+this.div.width() + "/" +this.div.height());
    
    var left = (this.div.width() - width)/2;
    var top = (this.div.height() - height)/2;
    loadingBox.css({
	'top':top,
	'left':left
    });
    this.div.css({opacity:0.8});
};

panel.mappingTasksSection.editor.removeLoadingState = function(){
    this.div.find('div.loading-box').remove();
    this.div.css({opacity:1});
};



/*panel.mappingTasksSection.editor.addTargetVocabulary = function(vocabulary){

var targetVocabularyAccordion = this.div.find('#target-vocabulary-accordion');
//targetVocabularyAccordion.addClass("loading");

var headerDiv = $("<div>").addClass("target-vocabulary-header").html("<span>"+vocabulary["name"]+"</span>");
var containerDiv = $("<div>").addClass("target-vocabulary-boxes-container");
var classesBox = createBox("target-vocabulary-classes vocabulary-box","Classes");
var propertiesBox = createBox("target-vocabulary-properties vocabulary-box","Properties");

propertiesBox.appendTo(containerDiv);
classesBox.appendTo(containerDiv);
headerDiv.appendTo(targetVocabularyAccordion);
containerDiv.appendTo(targetVocabularyAccordion);

var array = [];
array.push(classesBox);
array.push(propertiesBox);
this.alignTargetBox(array,0,0);

fillBoxBody(propertiesBox.find(".box-body"),vocabulary["properties"],'target-property-term');
fillBoxBody(classesBox.find(".box-body"),vocabulary["classes"],'target-class-term');

targetVocabularyAccordion.accordion("destroy");
targetVocabularyAccordion.accordion({
    header:'.target-vocabulary-header',
    collapsible: true,
    heightStyle: "auto",
    active:false,
});
//targetVocabularyAccordion.removeClass("loading");
return;

function createBox(classString,title){
    var box = $("<div>").addClass(classString);
    var header = $("<div>").addClass("box-header").text(title);
    var body = $("<div>").addClass("box-body");
    header.appendTo(box);
    body.appendTo(box);
    return box;
};

function fillBoxBody(body,array,termClass){
    	var height = 0;
    	var vocTermBox = null;
	for(var i = 0; i < array.length;i++){
	    	vocTermBox = $('<div>').addClass('vocabulary-term-box'+' '+termClass)
		                       .attr({
		                	   'name':array[i]["prefix"]+":"+array[i]["name"],
		                	   'title':array[i]["uri"]+array[i]["name"],
		                       });                 
		height = vocTermBox.height();
		vocTermBox.css({'top':height*i+'px'});
		vocTermBox.draggable({
		    appendTo: "body", 
		    helper: "clone",
		    start: function(event, ui) {   
			
		    }
		});
		vocTermBox.html("<p>"+array[i]["prefix"]+":"+array[i]["name"]+"</p>");
		vocTermBox.appendTo(body);
	}
} 
};
panel.mappingTasksSection.editor.alignTargetBox = function(uiElementsArray,initialHeight,step){
var top = initialHeight;
for(var i = 0; i < uiElementsArray.length;i++){
$(uiElementsArray[i]).css({'top':top+'px'});
top = top + $(uiElementsArray[i]).height() + step;
}
};*/


/*    panel.mappingTasksSection.tab.show();
if (vocabularies.target.length == 0){
	vocabularies.target = {
		source:{
		    classes:[{
			prefix:'qb',
			uri:'http://',
			name:'dataset'
		    },{
			prefix:'qb',
			uri:'http://',
			name:'dataset1'
		    }],
		    properties:[{
			prefix:'qb',
			uri:'http://',
			name:'observation1'
		    },{
			prefix:'qb',
			uri:'http://',
			name:'observation2'
		    }]
		},
		target:[{
		    classes:[{
			prefix:'qb',
			uri:'http://',
			name:'dataset5'
		    },{
			prefix:'qb',
			uri:'http://',
			name:'dataset6'
		    }],
		    properties:[{
			prefix:'qb',
			uri:'http://',
			name:'observation7'
		    },{
			prefix:'qb',
			uri:'http://',
			name:'observation9'
		    }]
		},{
		    classes:[{
			prefix:'qb',
			uri:'http://',
			name:'dataset90'
		    },{
			prefix:'qb',
			uri:'http://',
			name:'dataset17'
		    }],
		    properties:[{
			prefix:'qb',
			uri:'http://',
			name:'observation16'
		    },{
			prefix:'qb',
			uri:'http://',
			name:'observation26'
		    }]
		},{
		    classes:[{
			prefix:'qb',
			uri:'http://',
			name:'dataset90'
		    },{
			prefix:'qb',
			uri:'http://',
			name:'dataset17'
		    }],
		    properties:[{
			prefix:'qb',
			uri:'http://',
			name:'observation16'
		    },{
			prefix:'qb',
			uri:'http://',
			name:'observation26'
		    }]
		}]
	;
	
} 
	
	
	this.div.find('.box-body').removeClass('loading');
	var sourceVocabulary = vocabularies.source; //json object with classes and properties fields,both arrays with json objects{prefix,name,nsURI}
	var targetVocabularies = vocabularies.target;//json array wirh vocabulary object{classes,properties}
	var sourceClassesPanelBody = this.div.find('#source-vocabulary-classes .box-body');
	var sourcePropertiesPanelBody = this.div.find('#source-vocabulary-properties .box-body');
	var targetVocabularyBoxesContainers = this.div.find('.target-vocabulary-boxes-container');
	
	
	fillBoxBody(sourceClassesPanelBody,sourceVocabulary.classes,'source-class-term');
	fillBoxBody(sourcePropertiesPanelBody,sourceVocabulary.properties,'source-property-term');
	for(var i = 0; i < targetVocabularyBoxesContainers.length;i++){
	    var targetClassesBody = $(targetVocabularyBoxesContainers[i]).find('.target-vocabulary-classes .box-body');
	    var targetPropertiesBody = $(targetVocabularyBoxesContainers[i]).find('.target-vocabulary-properties .box-body');
	    $(targetVocabularyBoxesContainers[i]).prev().find("span").text(targetVocabularies[i].name);
	    fillBoxBody(targetClassesBody,targetVocabularies[i].classes,'target-class-term');
	    fillBoxBody(targetPropertiesBody,targetVocabularies[i].properties,'target-property-term');
	}
	
	function fillBoxBody(body,array,termClass){
	    	var height = 0;
	    	var vocTermBox = null;
		for(var i = 0; i < array.length;i++){
		    	vocTermBox = $('<div>').addClass('vocabulary-term-box'+' '+termClass)
			                       .attr({
			                	   'name':array[i]["prefix"]+":"+array[i]["name"],
			                	   'title':array[i]["uri"]+array[i]["name"],
			                       });                 
			height = vocTermBox.height();
			vocTermBox.css({'top':height*i+'px'});
			vocTermBox.draggable({
			    appendTo: "body", 
			    helper: "clone",
			    start: function(event, ui) {   
				
			    }
			});
			vocTermBox.html("<p>"+array[i]["prefix"]+":"+array[i]["name"]+"</p>");
			vocTermBox.appendTo(body);
		}
	}*/

panel.mappingTasksSection.editor.align = function(){

    /* var sourceVocabularyPanel = this.div.find('#source-vocabulary-panel');
     var targetVocabularyPanel = this.div.find('#target-vocabulary-panel');
     var mappingActionsPanel = this.div.find('#mapping-actions-panel');
 	var sourceVocabularyBoxes = sourceVocabularyPanel.find('.vocabulary-box');
 	var targetVocabularyBoxesContainer = this.div.find('.target-vocabulary-boxes-container');
 	var mainMappingsArea = this.div.find('#main-mappings-area');
 	
 	mappingActionsPanel.css({
 	    'left':sourceVocabularyPanel.outerWidth(),
 	    'right':targetVocabularyPanel.outerWidth()
 	});
 	var icons = mappingActionsPanel.find('.mapping-icon-span');
 	var left = 100;
 	for(var i = 0; i < icons.length; i++){
 	    $(icons[i]).css({
 		'left':left,
 		'background':'white'
 	    });
 	    left+=($(icons[i]).outerWidth() + 30);
 	}
 	console.log("source panel width = "+sourceVocabularyBoxes.outerWidth());
 	mainMappingsArea.css({
 	    'position':'absolute',
 	    'top':mappingActionsPanel.outerHeight(),
 	    'left':sourceVocabularyPanel.outerWidth(),
 	    'right':targetVocabularyPanel.outerWidth(),
 	    'bottom':0,
 	    'overflow':'auto'
 	});
 	
 	align(sourceVocabularyBoxes,40,30);
 	for(var i = 0; i < targetVocabularyBoxesContainer.length; i++){
 	    align($(targetVocabularyBoxesContainer[i]).find('.vocabulary-box'),0,0);
 	}
 	
 	function align(uiElementsArray,initialHeight,step){
 	    var top = initialHeight;
 	    for(var i = 0; i < uiElementsArray.length;i++){
 		$(uiElementsArray[i]).css({'top':top+'px'});
 		top = top + $(uiElementsArray[i]).height() + step;
 	    }
 	}
 	this.div.find('.box-body').addClass('loading');*/
 };
