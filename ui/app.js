
var templates			= {};
var $templates			= $('<div id="modal-templates">');

$('body').append( $templates );


function api( zome, fn, data, callback ) {
    var uri			= '/fn/' + zome + '/' + fn;
    
    $.ajax({
	"url": uri,
	"type": "POST",
	"data": typeof data === 'string' ? data : JSON.stringify( data ),
	"contentType": "application/json",
	success: function( resp ) {
	    console.log( resp );
	    try {
		resp		= JSON.parse(resp);
	    } catch (err) {
		console.error( err );
	    }
	    if ( typeof callback === 'function' )
		callback( resp );
	}
    });
}

var data			= {
    "fibValues": {
	"?": null,
	"0": 0,
	".5": .5,
	"1": 1,
	"2": 2,
	"3": 3,
	"5": 5,
	"8": 8,
	"13": 13,
	"20": 20,
	"40": 40,
	"100": 100,
	"∞": -1,
    },
    "stories": [],
    "tasks": [],
    "activeStory": null,
    "activeStoryHash": null,
    "summary": null,
    "hours": null,
}

function fetchStories() {
    api('stories', 'getAll', null, function(resp) {
	data.stories		= resp;

	if ( Object.keys( resp ).length === 0 ) {
	    api('stories', 'write', {
		title:	"Get a Baby",
		as:		"Parent",
		feature:	"want to get a baby",
		reason:	"I can get puked on all the time",
		value: 100,
		effort: 100,
	    }, fetchStories);
	    api('stories', 'write', {
		title:	"Dinosaur Habitat",
		as:		"Dinosaur",
		feature:	"would like to have a home",
		reason:	"I have a place to rest my small brain",
		value: 5,
		effort: 13,
	    }, fetchStories);
	}

    });
}
fetchStories();

function fetchTasks( storyHash ) {
    api('tasks', 'getAllForStory', storyHash, function(resp) {
	data.tasks		= resp;
    });
}


var listStories			= new Vue({
    el: '#listStories',
    data: data,
    methods: {
	refresh: function( event ) {
	    fetchStories();
	},
	calculateROI: function( story ) {
	    try {
		if (story.value === -1 || story.effort === -1)
		    return "Infinity";
		return ( story.value / story.effort ).toFixed(2);
	    } catch (err) {
		return "?";
	    }
	},
	getTasks: function( storyHash, story ) {
	    data.activeStory	= story;
	    data.activeStoryHash= storyHash;
	    fetchTasks( storyHash );
	},
	total: function (attr) {
	    var total		= 0;
	    for (var i in this.stories) {
		var story	= this.stories[i];
		total 	       += story.Entry[attr];
	    }
	    return total;
	}
    }
});

var listTasks			= new Vue({
    el: '#listTasks',
    data: data,
    methods: {
	refresh: function( event ) {
	    fetchTasks( data.activeStoryHash );
	},
	total: function (attr) {
	    var total		= 0;
	    for (var i in this.tasks) {
		var task	= this.tasks[i];
		total 	       += task.Entry[attr];
	    }
	    return total;
	},
	createTask: function ( event ) {
	    var self		= this;
	    console.log( this );

	    var input		= {
		"storyHash": data.activeStoryHash,
		"summary": this.summary,
		"hours": parseInt(this.hours),
	    };

	    api('tasks', 'write', input, function(resp) {
		self.hash	= resp;
		fetchTasks( data.activeStoryHash )
		self.summary	= null;
		self.hours	= null;
		$('#createTaskStart').focus();
	    });
	}
    }
});

var initCreateStory		= new Vue({
    el: '#createStoryModal',
    methods: {
	createStoryModal: function( event) {
	    templates.createStory.modal({
		backdrop: 'static',
		keyboard: false
	    });
	}
    }
});

$.get( "/createStory.html", function( html ) {
    templates.createStory		= $( html );

    $templates.append( templates.createStory );
    console.log( templates.createStory );

    var createStory			= new Vue({
	el: '#createStory',
	data: {
	    fibValues: data.fibValues,
	    title: null,
	    as: null,
	    feature: null,
	    reason: null,
	    effort: '',
	    value: '',
	    roi: 0,
	    hash: null,
	},
	watch: {
            effort: function(val, oldVal) {
		this.calculateROI();
	    },
            value: function(val, oldVal) {
		this.calculateROI();
	    }
	},
	methods: {
	    calculateROI: function( event ) {
		console.log("Calculating ROI from", this.value, this.effort);
		try {
		    this.roi		= this.value / this.effort;
		} catch (err) {
		    this.roi		= "?";
		}
	    },
	    createStory: function ( event ) {
		var self		= this;
		console.log( this );

		var data = {
		    "title": this.title,
		    "as": this.as,
		    "feature": this.feature,
		    "reason": this.reason,
		    "value": this.value,
		    "effort": this.effort,
		};

		api('stories', 'write', data, function(resp) {
		    self.hash		= resp;
		    
		    self.title		= null;
		    self.as		= null;
		    self.feature	= null;
		    self.reason		= null;
		    self.value		= '';
		    self.effort		= '';

		    templates.createStory.modal('hide');

		    fetchStories();
		});
	    }
	}
    });

});

// Insert some test stories
// api('stories', 'write', {
//     title:	"",
//     as:		"",
//     feature:	"",
//     reason:	"",
// });
