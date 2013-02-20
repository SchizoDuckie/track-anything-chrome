var Gui = klass({
    
    tracker: false,
    target: '#trackers',
    element: '#trackerlist',
   
    initialize: function(tracker) {
        // attach shared events.
        this.tracker = tracker;
        this.showAll();
    },

    /**
     * Attaches events only used in popup.html.
     */
    attachEvents: function() {
        $(document.body).on('click', '.goback', this.showTracker.bind(this));
        
        $('form#addtracker').on('submit', this.addTracker.bind(this));
        $('#trackers').on('click', 'li .viewlog', this.selectTracker.bind(this));
        $('#trackers').on('click', 'li .rating label', this.trackRating.bind(this));
        $('#trackers').on('click', 'li .plus, li .min', this.trackCounter.bind(this));
        
    },
  
    
    addTracker: function(e) {
        console.log(" Add tracker!" , e);
        var trackername = $(e.target).find('input[name=trackername]').val();
        var trackertype = $(e.target).find("input[type=radio]:checked").val();
        this.tracker.add(trackername, trackertype);
        this.showAll();
        return false;
    },

    selectTracker: function(e) {
        var id = $(e.target).closest('li').attr('data-id');
        var name = $(e.target).closest('li').attr('data-name');
        this.showTracker(id, name);
    },

    trackCounter: function(e) {
        var parent = $(e.target).closest("li[data-name]")[0];
        var clicked = $(e.target);
        var name =  $(parent).attr('data-name');
        this.tracker.track(name, clicked.hasClass("plus") ? 1 : -1, new Date().getTime());
    },

    trackRating: function(e) {
        
        var parent = $(e.target).closest("li[data-name]")[0];
        var clicked = $('input#'+$(e.target).attr('for'));
        var name =  $(parent).attr('data-name');
        console.log(name, clicked.val(), new Date().getTime());
        this.tracker.track(name, clicked.val(), new Date().getTime());

    },
    
    showAll: function() {
        window.location.hash = this.target;
        
        var trackers = _.values(this.tracker.getTrackers());
        console.log(" All trackers: " ,trackers);
        $(this.element).empty();

        for(i=0; i<trackers.length; i++) {
            console.log(" Drawing tracker: ", trackers[i]);
            var methd = "showTracker"+trackers[i].type;
            console.log(ich[methd]({tracker: trackers[i] }));
            $(this.element).append(ich[methd]({tracker: trackers[i] }));
        }
       
        $('.pie').easyPieChart({
         size: 40,
         lineWidth: 6,
         lineCap: false,
         trackColor: '#efefef',
         scaleColor:false,
         barColor: 'green',
         animate: 1000
        });
        $(this.target).show();
    },

    showTracker: function(id, name) {
        id ='tracker_' + id;
        if($('#'+id).length == 0) {
            $(document.body).append(ich.trackerContainer({name: name, id:id}));
        }
        var data = _.values(this.tracker.getTracker(name).data);
        dt = [];
        for(i=0; i<data.length; i++) {
            data[i].formattedTime = new Date(data[i].time).toLocaleDateString();
            dt.push({x: parseInt(data[i].time,10), y: parseInt(data[i].value, 10) || 0});
        }

        $('#'+id).html(ich.showTracker({
            tracker: this.tracker.getTracker(name),
            values: data
        })); 
        window.location.hash = '#'+id;
        window.scrollTo(0, 1);

      window.chart = new Highcharts.StockChart({
            chart : {
                renderTo : $('#' + id +" .chart")[0],
                zoomType: 'x'
            },

            rangeSelector: {
                enabled: false
            },
            xAxis: {
                ordinal: false
            },
            title : {
                text : 'Historical data for ' + name
            },
            navigation: {
                zoom: {
                    enabled: false
                },
                buttonOptions: {
                    enabled: false
                }
            },
            plotOptions: {
                line: {
                    animated: false
                }
            },
            series : [{
                name : 'value',
                data : dt,

                tooltip: {
                    valueDecimals: 0
                }
            }]
        });
    
    },

    notifyUpdates: function(today) {
        console.log("notify!", today, window.faves.today);
        var amount = window.faves.today.length;
        var lastNotification = localStorage.getItem("notify.last");
        lastNotification = !lastNotification ? 0 : parseInt(lastNotification,10);
        var notificationInterval = parseInt(localStorage.getItem("update.frequency"),10);
        notificationInterval = notificationInterval * 60 * 60 * 1000;
        if(amount > 0 && (lastNotification + notificationInterval)  < new Date().getTime()) {
            amount = amount.toString();
            localStorage.setItem("today", JSON.stringify(window.faves.today));
            localStorage.setItem("notify.last", new Date().getTime());
            chrome.browserAction.setBadgeText({text: amount});
            chrome.browserAction.setBadgeBackgroundColor({color: "#000000"});
            var notification = webkitNotifications.createHTMLNotification('notification.html');
            notification.show();
            setTimeout(function() {
                notification.cancel();
            }, 15000);
        } else {
            localStorage.removeItem("today");
        }
    }
});