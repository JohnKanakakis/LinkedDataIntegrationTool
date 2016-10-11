$(document).ready(function(){
	initUI();
});

var util = util || {}; 
function initUI(){

    	var callBackFunction = function(){
    	    
    	    var number = editorManager.getNumberOfUncompletedTasks();
    	    var id = util.dataspaceProject.basicMetadata["id"];
    	    if(number > 0){
    		var r=confirm("You have some uncorfirmed tasks.Uncorfirmed tasks will not affect the dataspace."+
		    "Do you want to continue?");
    		if (r==true){window.location.replace("queries.html?dataspaceId="+id);}
	    }else{
		window.location.replace("queries.html?dataspaceId="+id);
	    }
	    
    	    
    	};
    	util.panel.header.init(2,callBackFunction);
    	util.dataspaceProject.getBasicMetadata();
	panel.init();
	linkingManager.getInitialInfo();
	
	
	/*var mainTabs = $("#main-tabs");
    	var tabsVerticalPanel = mainTabs.find('#tabs-vertical-panel');
    	mainTabs.tabs({
	    active:1,
	    activate:function(event,ui){console.log('activate');
	    	//ui.newPanel.addClass('slided');
	    	console.log("old tab id = "+ui.oldPanel.attr('id'));
	    	console.log("new tab id = "+ui.newPanel.attr('id'));
	    	
		ui.oldPanel.find('.hide-span').triggerHandler("click");
	    	
	    }
	})
	.addClass( "ui-tabs-vertical");
 
    	tabsVerticalPanel.find('ul').removeClass('ui-tabs-nav').addClass( "ui-tabs-nav-vertical" );
    	tabsVerticalPanel.find('li').removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
    	tabsVerticalPanel.hide();
    	
    	
    	//$('.main-tab').addClass('slided');
    	
    	$("#linking-task-tabs-container").tabs({
    	    active: 0, 
        });
	

	$('.hide-span').on('click',function(event){
	    var tabsPanel = $('#tabs-vertical-panel');
	    var activeTab = $('.main-tab[aria-expanded=true]');
	    if(tabsPanel.css('display') == 'none'){
		tabsPanel.show({
			duration:600,
			direction:'right',
			progress:function(){
			    activeTab.toggleClass("slided",true,{easing:'linear'});
			},
			complete:function(){
			    $('.main-tab').addClass('slided');
			}
		});
		
	    }else{
		 tabsPanel.hide({
			direction: "left",
			duration:600,
			progress:function(){
			    activeTab.toggleClass("slided",false,{easing:'linear'});
			}
		 });
	    } 
	});*/
	
	/*$("button#proceed-to-next-step-button").on("click",function(event){
	    	event.preventDefault();
	    	console.log('next-step-button');
	    	if(!mappingsManager.continueToNextStep()){
	    	    alert('you must map all your datasets!');
	    	    return;
	    	};
	    	window.location.replace("linkingData.html");
	});*/
};



	