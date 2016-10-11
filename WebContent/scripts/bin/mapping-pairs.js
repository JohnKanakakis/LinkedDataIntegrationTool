var mappingsManager = mappingsManager || {};

mappingsManager.propertyMappingPair = function(){
	this.id = 0;
	this.sourcePatterns = [];
	this.targetPatterns = [];
	var lastObjectVariable = '?SUBJ';
	
	
	this.getId = function(){
		return this.id;
	};
	this.addSourcePattern = function(sourceText,mappingType){
	    	var sourcePattern = '';
	    	var subjectVar = '';
	    	var predicateVar = '';
	    	var objectVar = '';
	    	
	    	if (mappingType == 'property'){
	    	    subjectVar = lastObjectVariable;
	    	    predicateVar = sourceText;
	    	    objectVar = '?o' + (this.sourcePatterns.length == 0 ? '' : this.sourcePatterns.length);
	    	    lastObjectVariable =  objectVar;
	    	}else if(mappingType == 'class'){
	    	    subjectVar = '?SUBJ';
	    	    predicateVar = 'rdf:type';
	    	    objectVar = sourceText;
	    	   
	    	}
	    	sourcePattern = subjectVar + ' ' + predicateVar + ' ' + objectVar;
	    	console.log('source pattern is '+sourcePattern);
		
	    	var source_o = {
				pid:this.sourcePatterns.length,
				pattern:sourcePattern,
				subj:subjectVar,
				obj:objectVar
		};
		this.sourcePatterns.push(source_o);
		console.log('just added '+JSON.stringify(source_o));
		return {pattern_id:source_o.pid,label:source_o.pattern};
	};
	
	this.updateSourcePattern = function(id,sourcePattern){
		update(this.sourcePatterns,id,"pattern",sourcePattern);
	};
	this.updateTargetPattern = function(id,targetPattern){
		update(this.targetPatterns,id,"pattern",targetPattern);
	};
	
	this.addTargetPattern = function(targetText,sourcePatternId,mappingType){
	    	
	    	var sourcePattern_o = {};
	    	for(var i = 0; i < this.sourcePatterns.length; i++){
	    	    if(this.sourcePatterns[i].pid == sourcePatternId){
	    		sourcePattern_o = this.sourcePatterns[i];
	    	    }
	    	}
	    	var targetPattern = '';
	    	var subjectVar = '';
	    	var predicateVar = '';
	    	var objectVar = '';
	    	
	    	if (mappingType == 'property'){
	    	    subjectVar = sourcePattern_o.subj;
	    	    predicateVar = targetText;
	    	    objectVar = sourcePattern_o.obj;
	    	    lastObjectVariable =  objectVar;
	    	}else if(mappingType == 'class'){
	    	    subjectVar = '?SUBJ';
	    	    predicateVar = 'rdf:type';
	    	    objectVar = targetText;
	    	   
	    	}
	    	targetPattern = subjectVar + ' ' + predicateVar + ' ' + objectVar;
	    	console.log('target pattern is '+targetPattern);
		var target_o = {
				pid:this.targetPatterns.length,
				pattern:targetPattern,
				subj:subjectVar,
				obj:objectVar
		};
		this.targetPatterns.push(target_o);
		console.log('just added '+JSON.stringify(target_o));
		return {pattern_id:target_o.pid,label:target_o.pattern};
	};
	
	this.addTransformation = function(targetPattern,transformationText){
		console.log("add trans "+transformationText);
		console.log("add trans "+targetPattern);
		for(var i = 0; i < this.targetPatterns.length;i++){
			tp = this.targetPatterns[i];
			if (tp.pattern == targetPattern){
				console.log('add trans found');
				tp.transformation = transformationText;
				this.targetPatterns[i] = tp;
				console.log(this.targetPatterns[i].transformation);
				return true;
			}
		};
	};
	this.getTransformation = function(targetPattern){
		console.log("get trans " + targetPattern);
		for(var i = 0; i < this.targetPatterns.length;i++){
			tp = this.targetPatterns[i];
			console.log("get trans " + tp.transformation);
			if (tp.pattern == targetPattern){
				console.log('found');
				return tp.transformation;
			}
		};
		return '';
	};
	this.deleteSourcePattern = function(pattern_id,deleteNextAll){
		deleteObjectFrom(pattern_id,this.sourcePatterns,deleteNextAll);
		console.log("source after delete "+JSON.stringify(this.sourcePatterns));
		return true;
	};
	this.deleteTargetPattern = function(pattern_id,deleteNextAll){
		deleteObjectFrom(pattern_id,this.targetPatterns,deleteNextAll);
		console.log("target after delete "+JSON.stringify(this.targetPatterns));
		return true;
	};
	
	function update(array,id,key,value){
		for(var i = 0; i < array.length; i++){
			if(array[i].pid == id){
				array[i][key] = value;
			}
		}
	}
	
	function deleteStringFrom(table,text){
		var element = null;
		console.log(table.length);
		mappingsManager.print(table);
		for(var i = 0; i < table.length;i++){
			element = table[i];
			console.log('table element is '+element);
			if (element == text){
				table.splice(i, 1);
				console.log(JSON.stringify(this.sourcePatterns));
				return true;
			}
		};
		return false;
	}
	function deleteObjectFrom(id,table,deleteNextAll){

		for(var i = 0; i < table.length;i++){
			if (table[i].pid == id){
			    	if (!deleteNextAll){
			    	    table.splice(i, 1);
			    	}else{
			    	    table.splice(i,table.length-i);
			    	}
				
				console.log(JSON.stringify(table));
				return true;
			}
		};
		return false;
	}
	
	this.getSourcePattern = function(id){
		
		for(var i = 0; i < this.sourcePatterns.length;i++){
			if (this.sourcePatterns[i].pid == id){
				return this.sourcePatterns[i].pattern;
			}
		};
		return "";
	};
	
	this.numberOfSourcePatterns = function(){
		return this.sourcePatterns.length;
	};
	this.numberOfTargetPatterns = function(){
		return this.targetPatterns.length;
	};
	
	this.changeTargetPatternLabel = function(){
		console.log(JSON.stringify(this.targetPatterns));
		if (this.targetPatterns.length > 0){
			this.targetPatterns[0].pattern = this.targetPatterns[0].pattern.replace("?o","?t");
			return this.targetPatterns[0].pattern;
		}
		return '';
	};
	
	this.changeSourcePatternLabel = function(){
		console.log(JSON.stringify(this.sourcePatterns));
		if (this.sourcePatterns.length > 0){
			this.sourcePatterns[0] = this.sourcePatterns[0].replace("?o","?s");
			return this.sourcePatterns[0];
		}
		return '';
	};
	
	this.resetSourcePatternLabel = function(){
		console.log(JSON.stringify(this.sourcePatterns));
		var tokens = this.sourcePatterns[0].split(" ");
		tokens[2] = "?o";
		this.sourcePatterns[0] = tokens[0]+ " " + tokens[1] + " " + tokens[2];
		return this.sourcePatterns[0];
	};
	
	this.resetTargetPatternLabel = function(){
		console.log(JSON.stringify(this.targetPatterns));
		var tokens = this.targetPatterns[0].pattern.split(" ");
		tokens[2] = "?o";
		this.targetPatterns[0].pattern = tokens[0]+ " " + tokens[1] + " " + tokens[2];
		return this.targetPatterns[0].pattern;
	};
};

mappingsManager.classMappingPair = function(){
	this.id = 0;
	this.sourcePattern;
	this.targetPattern;
	
	this.getId = function(){
		return this.id;
	};
	this.addSourcePattern = function(sourcePattern){
		this.sourcePattern = sourcePattern;
	};
	this.addTargetPattern = function(targetPattern){
		this.targetPattern = targetPattern;
	};
	
};