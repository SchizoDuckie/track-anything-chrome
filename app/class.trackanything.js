var TRACKERS = {};
TRACKERS.COUNTER = 1;
TRACKERS.RATING = 2;
TRACKERS.TEXT = 3;

var store = klass({

    get: function(key) {
        var val = localStorage.getItem(key);
        return val ? JSON.parse(val) : val;
    },

    set: function(key, value) {
        console.log("Saving ls!", key, value, JSON.stringify(value));
        return localStorage.setItem(key,JSON.stringify(value));
    }

});
Store = new store();


var Tracker = klass({

    name: 'default tracker',
    type: TRACKERS.RATING,
    config: {},
    data: {},
    initialize: function(obj) {
        this.name = obj.name;
        this.type = obj.type;
        this.id = obj.id;
        this.config = obj.config;
        this.read();
       console.log("created tracker: " ,this.name);
    },

    getData: function() {
        return this.data;
    },

    getName: function() {
        return this.name;
    },

    log: function(timestamp, value, comment) {
        console.log("Loggingg!", timestamp, value, comment);
        if(this.type == TRACKERS.COUNTER) { // a counter logs only one value per day(for now). add it's value to the previous.
            timestamp = moment(timestamp).startOf('day').valueOf();
            if(this.data["" +timestamp]) {
                value = parseInt(this.data[""+timestamp].value, 10) + value;
            
                if(this.data[""+timestamp]['comment']) {
                    comment = this.data[""+timestamp].comment.split("\n").push(comment).join(" \n" );
                }
            }
        }
        this.data[""+timestamp] = { value:  value, comment : comment, time: timestamp };
        this.save();
    },

    read: function() {
        var data = Store.get('tracker_'+this.id);
        if(data) {
            console.log(" Read store data!" , data);
         this.data = data;
        }
    },

    save: function() {
        console.log("Saving!", this.id, this.data);
        Store.set('tracker_'+this.id, this.data);
    }

});

var TrackAnything = klass({
    events: [],
    trackers: {},
    
    initialize: function() {
        this.read();
    },
    
    add: function(name, type) {
        if (!this.has(name)) {
            this.trackers[name] = new Tracker({
                name: name,
                id: 'trk_'+new Date().getTime(),
                type: TRACKERS[type],
                config: {
                    daynight: false,
                    remind: false
                }
            });
            this.save();
        }
    },
    
    has: function(id) {
        return this.trackers[id] ? true : false;
    },
    
    track: function(trackername, value, timestamp, comment) {
        console.log(this.getTracker(trackername));
        this.getTracker(trackername).log(timestamp, value, comment);
    },

    getTracker: function(name) {
        return this.trackers[name];
    },

    remove: function(e) {
        var id = $(e.target).parent('div[data-name]').attr('data-id');
        localStorage.removeItem("serie." + id);
        this.faves = this.faves.filter(function(obj) {
            return obj.id != id;
        });
        this.save();
        this.show();
    },
        
    read: function() {
        var trackers = Store.get("trackers");
        if (trackers) {
            _.each(trackers, function(trk) {
                this.trackers[trk.name] = new Tracker(trk);
            }.bind(this));
        }
    },
    
    save: function() {
        Store.set("trackers", this.trackers);
    },
    
    getTrackers: function() {
        return this.trackers;
    }
});