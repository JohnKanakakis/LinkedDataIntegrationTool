$(document).ready(function(){
	initUI();
});

var util = util || {};

var projectMetadata = [];

function initUI() {
    
    getAllDataspaceBasicMetadata();
    var mainTabs = $("#main-tabs");
    mainTabs.tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
    mainTabs.find("li").removeClass( "ui-corner-top" ).addClass( "ui-corner-left" ); 
    $('button#create-dataspace-button').on("click",function(event){
	event.preventDefault();
	var form = $(event.target).closest("form");
	var dataspaceName = form.find("input[type=text]").val();
	console.log("name > "+dataspaceName);
	createDataspace(dataspaceName);
    });
}

function addTableListeners(){
     
    $("table#existing-dataspaces-table").on("mouseenter","tr",function(event){
	event.preventDefault();
	$(this).find("span.import-span").show();
    });
    $("table#existing-dataspaces-table").on("mouseleave","tr",function(event){
	event.preventDefault();
	$( this ).find("span.import-span").hide();
    });
    
    $("table#existing-dataspaces-table").on("click","span.import-span",function(event){
	event.preventDefault();
	var tr = $(this).closest('tr');
	var id = tr.attr('id');
	var name = tr.attr('dataspace-name');
	console.log(id+"/"+name);
	loadDataspace(name,id);
    });
}

function getAllDataspaceBasicMetadata(){
    
    $.ajax({
	type : "GET",
	url : "IntegrationServiceServlet/command/dataspace/get-all-basic-metadata",
	success : function(metadata) {
	    projectMetadata = metadata;
	    console.log("metadata = "+JSON.stringify(metadata));
	    displayProjectMetadata();
	    addTableListeners();
	}, 
   	dataType:'json'
    });
    
}

function displayProjectMetadata(){
    
    var div = $("div#open-dataspace");
    
    var table = $("<table>").attr('id',"existing-dataspaces-table");
    var row,td1,td2,td3;
    
    
    if(projectMetadata.length == 0){
	$("<span>").text("No dataspaces in  DSpace directory.").css({
	    'padding':'10px',
	    'margin':'10px',
	    'float':'left'
	}).appendTo(div);
	return;
    }
    
    row = $("<tr>").appendTo(table);
    $("<th>").text("Last Modified").appendTo(row).css({'width':'20%'});
    $("<th>").text("Dataspace name").appendTo(row).css({'width':'30%'});
    $("<th>").appendTo(row);
    for(var i = 0; i < projectMetadata.length;i++){
	row = $("<tr>").appendTo(table).attr('id',projectMetadata[i]["id"]).attr('dataspace-name',projectMetadata[i]["name"]);
	td1 = $("<td>").text(projectMetadata[i]["last Modified"]).css({'font-size':'small','width':'20%'});
	td2 = $("<td>").text(projectMetadata[i]["name"]).css({'width':'30%'});
	td3 = $("<td>").html("<span class='import-span'>open</span>").css({'text-align':'left'});
	td1.appendTo(row);td2.appendTo(row);td3.appendTo(row);
	row.appendTo(table);
    }
    
    table.appendTo(div);
}

function loadDataspace(dataspaceProjectName,projectId){
    //add loading ajaxaki
    //$("body").off("click");
    $.ajax({
	type : "GET",
	url : "IntegrationServiceServlet/command/dataspace/?"+
	$.param({
	    dataspaceName:dataspaceProjectName,
	    id:projectId
	}),
	success : function(loaded) {
	    
	    //remove ajaxaki
	    window.location.replace("queries.html?dataspaceId="+projectId);
	}, 
   	dataType:'json'
    });
}

function createDataspace(dataspaceProjectName){
   
    $.ajax({
	type : "PUT",
	url : "IntegrationServiceServlet/command/dataspace/?"+
	$.param({
	    dataspaceName:dataspaceProjectName
	}),
	success : function(projectInfo) {
	    var id = projectInfo["projectId"];
	    window.location.replace("import.html?dataspaceId="+id);
	}, 
   	dataType:'json'
    });
}

