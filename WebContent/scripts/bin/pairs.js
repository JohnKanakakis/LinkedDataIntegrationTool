
/*

*//******************************* class mapping ******************************************************//*

mappingsManager.addMappingPair = function(){
	
	return this.addPropertyMappingPair();
	//mappingsManager.findPair(id,table);
	
	var pair = new mappingsManager.classMappingPair();
	//pair.addSourcePattern(sourcePattern);
	pair.id = mappingsManager.numberOfClassMappingPairs;
	mappingsManager.classMappingPairs.push(pair);
	mappingsManager.numberOfClassMappingPairs++;
	mappingsManager.print(mappingsManager.classMappingPairs);
	return pair.getId();
};

mappingsManager.addSourcePatternToPair = function(id,sourceText,needModification,mappingType){
    	return this.addSourcePatternToPropertyPair(id,sourceText,needModification,mappingType);
};

mappingsManager.addTargetPatternToPair = function(id,targetText,sourcePatternId,mappingType){
	return this.addTargetPatternToPropertyPair(id,targetText,sourcePatternId,mappingType);
};

mappingsManager.updateSourcePatternOfPair = function(mapping_id,pattern_id,sourcePatternText){
	this.updateSourcePatternOfPropertyPair(mapping_id,pattern_id,sourcePatternText);
};

mappingsManager.updateTargetPatternOfPair = function(mapping_id,pattern_id,targetText){
	this.updateTargetPatternOfPropertyPair(mapping_id,pattern_id,targetText);
};

mappingsManager.deleteSourcePatternFromPair = function(mapping_id,pattern_id,deleteNextAll){
    	this.deleteSourcePatternFromPropertyPair(mapping_id, pattern_id,deleteNextAll);
};
mappingsManager.deleteTargetPatternFromPair = function(mapping_id,pattern_id,deleteNextAll){
	this.deleteTargetPatternFromPropertyPair(mapping_id,pattern_id,deleteNextAll);
};



*//***************************** property mapping *****************************************************//*

mappingsManager.checkCorrectionOfMappings = function(id){
	var pair = this.findPair(id, this.propertyMappingPairs);
	console.log("manager s = "+pair.numberOfSourcePatterns());
	console.log("manager t = "+pair.numberOfTargetPatterns());
	if (pair.numberOfSourcePatterns()+1 > 1 && pair.numberOfTargetPatterns() > 1){
		return false;
	}
	if (pair.numberOfSourcePatterns() > 1 && pair.numberOfTargetPatterns()+1 > 1){
		return false;
	}
	return true;
};



mappingsManager.addPropertyMappingPair = function(){
	
	var pair = new mappingsManager.propertyMappingPair();
	pair.id = mappingsManager.numberOfPropertyMappingPairs;
	mappingsManager.propertyMappingPairs.push(pair);
	mappingsManager.numberOfPropertyMappingPairs++;
	return pair.getId();
};


mappingsManager.addSourcePatternToPropertyPair = function(id,sourceText,needModification,mappingType){
	
	var propertyMappingPair = mappingsManager.findPair(id,mappingsManager.propertyMappingPairs);
	console.log("pair with id = "+id);
	var returnResults = {};
	var sourcePatternLabel = '';

	if(needModification){
		if(mappingType == 'property'){
			sourcePatternLabel = "?SUBJ" + " " + sourceText + " " + "?o";
		}else if(mappingType == 'class'){
			sourcePatternLabel = '?SUBJ'+ ' ' + 'rdf:type' + ' '+ sourceText;
		}
		
	}else{
		sourcePatternLabel = sourceText;
	}
	//var pos = 0;
	//var o = {};
	if (propertyMappingPair!=null){
	
	    returnResults = propertyMappingPair.addSourcePattern(sourceText,mappingType);
	   
	}
	//returnResults.label = o.pattern;
	//returnResults.pattern_id = o.pid;
	
	
	return returnResults;
	
};

mappingsManager.updateSourcePatternOfPropertyPair = function(mapping_id,pattern_id,sourceText){
	
	var pair = this.findPair(mapping_id, this.propertyMappingPairs);
	pair.updateSourcePattern(pattern_id,sourceText);
	
};

mappingsManager.addTargetPatternToPropertyPair = function(id,targetText,sourcePatternId,mappingType){
	
	var propertyMappingPair = mappingsManager.findPair(id,mappingsManager.propertyMappingPairs);
	var returnResults = {};
	//var targetPatternLabel = '';
	if(needModification){
		if(mappingType == 'property'){
			targetPatternLabel = "?SUBJ" + " " + targetText + " " + "?o";
		}else if(mappingType == 'class'){
			targetPatternLabel = '?SUBJ'+ ' ' + 'rdf:type' + ' '+ targetText;
		}
		//targetPatternLabel = "?SUBJ" + " " + targetText + " " + "?o";
	}else{
		targetPatternLabel = targetText;
	}
	var pos = 0;
	if (propertyMappingPair!=null){
		//targetPatterns = propertyMappingPair.numberOfTargetPatterns();
		//sourcePatterns = propertyMappingPair.numberOfSourcePatterns();
	    	returnResults = propertyMappingPair.addTargetPattern(targetText,sourcePatternId,mappingType);

	}
	//returnResults.label = targetPatternLabel;
	//returnResults.pattern_id = pos;
		
	return returnResults;
	
};

mappingsManager.updateTargetPatternOfPropertyPair = function(mapping_id,pattern_id,targetText){
	
	var pair = this.findPair(mapping_id, this.propertyMappingPairs);
	pair.updateTargetPattern(pattern_id,targetText);
};


mappingsManager.addTransformationToPropertyPair = function(id,targetPattern,trasformationText){
	
	var propertyMappingPair = mappingsManager.findPair(id,mappingsManager.propertyMappingPairs);
	
	if (propertyMappingPair!=null){
		propertyMappingPair.addTransformation(targetPattern,trasformationText);
		return true;
	}else{
		return false;
	}
};

mappingsManager.getPropertyTransformation = function(id,targetPattern){
	
	var propertyMappingPair = mappingsManager.findPair(id,mappingsManager.propertyMappingPairs);
	
	var text = '';
	if (propertyMappingPair!=null){
		text = propertyMappingPair.getTransformation(targetPattern);
	}
	console.log('manager get trans text = '+text);
	return text;
};

mappingsManager.deleteTargetPatternFromPropertyPair = function(id,patern_id,deleteNextAll){
	
	var propertyMappingPair = mappingsManager.findPair(id,mappingsManager.propertyMappingPairs);
	var returnResult = {};
	var targetPatternLabel = '';
	var sourcePatternLabel = '';
	if (propertyMappingPair!=null){
		returnResult.delete_ok = propertyMappingPair.deleteTargetPattern(patern_id,deleteNextAll);
	
	}else{
		returnResult.delete_ok = false;
	}
	returnResult.sourcePatternLabel = sourcePatternLabel;
	returnResult.targetPatternLabel = targetPatternLabel;
	
	return returnResult;
};

mappingsManager.deleteSourcePatternFromPropertyPair = function(id,pattern_id,deleteNextAll){
	var propertyMappingPair = mappingsManager.findPair(id,mappingsManager.propertyMappingPairs);
	var returnResult = {};
	var targetPatternLabel = '';
	var sourcePatternLabel = '';
	if (propertyMappingPair!=null){
		returnResult.delete_ok = propertyMappingPair.deleteSourcePattern(pattern_id,deleteNextAll);
	}else{
		returnResult.delete_ok = false;
	}
	returnResult.sourcePatternLabel = sourcePatternLabel;
	returnResult.targetPatternLabel = targetPatternLabel;
	return returnResult;
};

mappingsManager.deleteClassMappingPair = function(id){

	return this.deletePropertyMappingPair(id);
	for(var i = 0; i < mappingsManager.classMappingPairs.length;i++){
		var pair = mappingsManager.classMappingPairs[i];
		console.log('position '+i+' pair id = ' + pair.id);
		if (pair.id == id){
			mappingsManager.classMappingPairs.splice(i, 1);
			return true;
		};
	};
	return false;
};

mappingsManager.deletePropertyMappingPair = function(id){
	
	console.log('receive id = '+id+ ' from ui');
	console.log('length = '+mappingsManager.propertyMappingPairs.length);
	for(var i = 0; i < mappingsManager.propertyMappingPairs.length;i++){
		var pair = mappingsManager.propertyMappingPairs[i];
		console.log('position '+i+' pair id = ' + pair.id);
		if (pair.id == id){
			//alert('found');
			mappingsManager.propertyMappingPairs.splice(i, 1);
			return true;
		};
	};
	return false;
};

mappingsManager.print = function(table){
	for(var i = 0; i < table.length;i++){
		console.log('position '+ i+' pair id = ' + table[i]);
	};
};

mappingsManager.findPair = function(id,table){
	
	var pair;
	for(var i = 0; i < table.length;i++){
		pair = table[i];
		console.log('position '+i+' pair id = ' + pair.id);
		if (pair.id == id){
			return pair;
		};
	};
	return null;
};

mappingsManager.convertClassMappingsToJSON = function(){
	
	var mappings = [];
	
	var pair;
	
	for(var i = 0; i < mappingsManager.classMappingPairs.length;i++){
		pair = mappingsManager.classMappingPairs[i];
		console.log(pair.sourcePattern+"/"+pair.targetPattern);
		var jsonPair = {};
		jsonPair.sourcePattern = pair.sourcePattern;
		jsonPair.targetPattern = pair.targetPattern;
		mappings.push(jsonPair);
	}
	return mappings;
};

mappingsManager.convertPropertyMappingsToJSON = function(){
	
	var mappings = [];
	var pair;
	
	for(var i = 0; i < mappingsManager.propertyMappingPairs.length;i++){
		pair = mappingsManager.propertyMappingPairs[i];
		
		var jsonPair = {};
		
		jsonPair.sourcePatterns = pair.sourcePatterns;
		jsonPair.targetPatterns = pair.targetPatterns;
		mappings.push(jsonPair);
	}
	return  mappingsManager.propertyMappingPairs;
};

mappingsManager.deleteMappingFile = function(){
	for(var i = 0; i < mappingsManager.propertyMappingPairs.length;i++){
		mappingsManager.propertyMappingPairs.pop();
	};
	for(var i = 0; i < mappingsManager.classMappingPairs.length;i++){
		mappingsManager.classMappingPairs.pop();
	};
	mappingsManager.numberOfClassMappingPairs = 0;
	mappingsManager.numberOfPropertyMappingPairs = 0;
	console.log("class pairs are "+mappingsManager.classMappingPairs.length);
	console.log("prop pairs are "+mappingsManager.propertyMappingPairs.length);
	panel.mappingsArea.removeAllMappings();
	panel.leftSection.removeAllInfo();
	panel.fileActionsArea.reset();
};*/

/*targetPatterns = propertyMappingPair.numberOfTargetPatterns();
sourcePatterns = propertyMappingPair.numberOfSourcePatterns();
if(sourcePatterns == 1 && targetPatterns == 1){
	sourcePatternLabel = propertyMappingPair.resetSourcePatternLabel();
	targetPatternLabel = propertyMappingPair.resetTargetPatternLabel();
}*/

/*targetPatterns = propertyMappingPair.numberOfTargetPatterns();
sourcePatterns = propertyMappingPair.numberOfSourcePatterns();
if(sourcePatterns == 1 && targetPatterns == 1){
	sourcePatternLabel = propertyMappingPair.resetSourcePatternLabel();
	targetPatternLabel = propertyMappingPair.resetTargetPatternLabel();
}*/

/*if(sourcePatterns == 0){
if(targetPatterns <= 1){
	sourcePatternLabel = "?SUBJ" + " " + sourceText + " " + "?o";
}else{
	sourcePatternLabel = "?SUBJ" + " " + sourceText + " " + "?s";
}
}else{
sourcePatternLabel = "?SUBJ" + " " + sourceText + " " + "?o" + sourcePatterns;
targetPatternLabel = propertyMappingPair.changeTargetPatternLabel();
}*/

/*if(targetPatterns == 0){
if(sourcePatterns <= 1){
	targetPatternLabel = "?SUBJ" + " " + targetTerm + " " + "?o";
}else{
	targetPatternLabel = "?SUBJ" + " " + targetTerm + " " + "?t";
}

}else{
targetPatternLabel = "?SUBJ" + " " + targetTerm + " " + "?o" + targetPatterns;
sourcePatternLabel = propertyMappingPair.changeSourcePatternLabel();
}*/
/*var pair = null;
if(typeof id === "undefined"){
	pair = new mappingsManager.propertyMappingPair();
	pair.id = mappingsManager.numberOfPropertyMappingPairs;
	pair.addSourcePattern(sourcePattern);
	mappingsManager.propertyMappingPairs.push(pair);
	mappingsManager.numberOfPropertyMappingPairs++;
}
else{
	pair = mappingsManager.findPair(id,mappingsManager.propertyMappingPairs);
	
	if (pair!=null){
		pair.addSourcePattern(sourcePattern);
	}
}
mappingsManager.print(mappingsManager.propertyMappingPairs);
return pair.getId();*/