$(document).ready(function(){
		initUI();
});


function initUI(){
	jsPlumb.Defaults.Container = $("body");
	jsPlumb.Defaults.Connector = new jsPlumb.Connectors.Bezier();
	jsPlumb.draggable($(".box"));
	
	/*jsPlumb.Defaults = {
		DragOptions : { cursor: "pointer", zIndex:2000 },
		HoverClass:"connector-hover"
	};*/

	/*var connectorStrokeColor = "rgba(50, 50, 200, 1)",
		connectorHighlightStrokeColor = "rgba(180, 180, 200, 1)",*/
	var	hoverPaintStyle = { strokeStyle:"#7ec3d9" };	
	
	var endpointOptions =
	{
	  endpoint: new jsPlumb.Endpoints.Dot({radius: 5}),
	  isSource: true,
	  isTarget: false,
	  style: {
	    fillStyle: '#890685'
	  },
	  connectorStyle: {
	    gradient: {
	      stops: [
	        [0, '#890685'],
	        [1, '#359ace']
	      ]
	    },
	    strokeStyle: '#890685',
	    lineWidth: 5
	  },
	  anchor: "RightMiddle",
	  dropOptions:{ disabled: true }
	};

	var endpointOptions1 =
	{
	  endpoint: new jsPlumb.Endpoints.Dot({radius: 5}),
	  isSource: false,
	  isTarget: true,
	  style: {
	    fillStyle: '#359ace'
	  },
	  connectorStyle: {
	    gradient: {
	      stops: [
	        [0, '#359ace'],
	        [1, '#35ceb7']
	      ]
	    },
	    strokeStyle: '#359ace',
	    lineWidth: 5
	  },  
	  maxConnections: 100,
	  anchor: "LeftMiddle"
	};

	var endpointOptions2 =
	{
	  endpoint: new jsPlumb.Endpoints.Dot({radius: 5}),
	  isSource: true,
	  isTarget: true,
	  style: {
	    fillStyle: '#35ceb7'
	  },
	  connectorStyle: {
	    gradient: {
	      stops: [
	        [0, '#35ceb7'],
	        [1, '#359ace']
	      ]
	    },
	    strokeStyle: '#359ace',
	    lineWidth: 5
	  },
	  maxConnections: 1,
	  anchor: "RightMiddle",
	  dropOptions:{ disabled: true }
	};
	
	var e0 = jsPlumb.addEndpoint("div1",endpointOptions);
	
    var e1 = jsPlumb.addEndpoint("div2",endpointOptions1);
    jsPlumb.addEndpoint("div2",endpointOptions2);
    var e2 = jsPlumb.addEndpoint("div3",endpointOptions2);
	/*jsPlumb.connect({
		sourceEndpoint:e0, 
	   	targetEndpoint:e1,
	   	anchors:["Right", "Left" ],
	    endpoint:"Rectangle",
	    endpointStyle:{ fillStyle: "yellow" }
	});  */
	    
};

	   

