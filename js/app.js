var app = new Vue({
    el: '#app',
    data: {
        weeklySession: null,
        stepsBucket: null,
        loggedIn: false,
        goals: {steps: [5,3,3,0,3,3,0], meditations: [40,40,40,40,40,40,40]},
        weekCounter: 0,
        millisPerWeek: 604800000,
        weeklySteps:[],
        lifeBucket: [],
        today: new Date().getDay(),
        //pages
        weeklycharts: false,
        dailycharts:true,
        schedule: false,
        life:false

    },
    methods:{
       updategoals(goals){
          this.goals.steps = goals;
        },
        toggleCharts(chart){
            if(chart == "weeklycharts"){
                this.weeklycharts = true;
                this.dailycharts = false;
                this.schedule = false;
                this.life = false;
            }
            if(chart == "dailycharts"){
                this.dailycharts = true;
                this.weeklycharts = false;
                this.schedule = false;
                this.life = false;
            }
            if(chart == "goals"){
                this.dailycharts = false;
                this.weeklycharts = false;
                this.schedule = true;
                this.life = false;
            }
            if(chart == "life"){
                this.dailycharts = false;
                this.weeklycharts = false;
                this.schedule = false;
                this.life = true;
            }
        },
        prevWeek(){
            this.weekCounter +=1;
        },
        nextWeek(){
            this.weekCounter -=1;
        },
        login(){
            gapi.load('client:auth2', app.authClient);
        },
        loadGoogle(){
            this.getData();
            this.getStepsBucket();
            this.getLifeTimeSteps();
        },
        //authorize client with google authorization
        authClient(){
            gapi.auth2.authorize({
                client_id: '136129714002-ppsnkh4o55ai8bq6ttgrpfker688s4u4.apps.googleusercontent.com',
                scope: 'https://www.googleapis.com/auth/fitness.activity.read',
                response_type: 'id_token permission'
            }, function (response) {
                if (response.error) {
                    alert('Token Error!');
                    return;
                }
                //save token to local storage
                localStorage.setItem('token', response.access_token);

                app.getLifeTimeSteps();
                app.getData();
                app.getStepsBucket();


            });
        },
        logout(){
            localStorage.setItem('token', null);
            location.reload();
        },
        toggle(){
          this.loggedIn = !this.loggedIn
        },
        //get session data from google api with get request
        getData(){
            var authCode = 'Bearer ' + localStorage.getItem('token');

            //get the first day of the current week
            var sunday = new Date(this.getDayOfWeek(0));
            //get the last day of the current week
            var saturday = new Date(this.getDayOfWeek(6));
            // console.log("Sunday: " + sunday + " " + "Saturday: " + saturday);

            var req_url = "https://www.googleapis.com/fitness/v1/users/me/sessions?"+
                "startTime="+sunday.getFullYear()+'-'+(sunday.getMonth() + 1)+'-'+sunday.getDate()+"T00:00:00.000Z"+
                "&endTime="+saturday.getFullYear()+'-'+(saturday.getMonth() + 1)+'-'+saturday.getDate()+"T23:59:59.999Z";

            axios.get(req_url, { headers: { Authorization: authCode } }).then(response => {
                this.weeklySession = new Session(response.data.session);
                // console.log(this.weeklySession)
                // console.log(response.data.session);
                })
                .catch((error) => {
                    console.log('token error ' + error);
                });
        },
        getStepsBucket(){
            //get token from local storage
            var authCode = 'Bearer ' + localStorage.getItem('token');

            var req_url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";

            //get first day of the current week
            // console.log('weekCounter ' + this.weekCounter);
            let sunday = new Date(this.getDayOfWeek(0) - (this.millisPerWeek * this.weekCounter));
            console.log(sunday);
            // console.log(sunday);

            //get last day of the current week
            let saturday = new Date(this.getDayOfWeek(6) - (this.millisPerWeek * this.weekCounter));
            // - (604800000 *this.weekCounter)
            $.ajax({
                type: "POST",
                url: req_url,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({
                    "aggregateBy": [{
                        "dataTypeName": "com.google.step_count.delta",
                        "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
                    }],
                    "bucketByTime": { "durationMillis": 86400000 },
                    // get start of day in milliseconds
                    "startTimeMillis": sunday.setHours(0,0,0,0),
                    // get end of the day in milliseconds
                    "endTimeMillis": saturday.setHours(23,59,59,999)
                }),

                beforeSend : function( xhr ) {
                    xhr.setRequestHeader('Authorization', authCode);
                },
                success: function (response) {
                    console.log("bucket",response.bucket);
                    //stepsArray
                    //make stepsBucket computed property
                    app.stepsBucket = new Session(response.bucket);
                    app.loggedIn = true;
                    app.getWeeklySteps();
                    // console.log('stepsBucket');
                    // console.log(this.stepsBucket);
                },
                failure: function(errMsg) {
                    //get new access token
                    alert(errMsg);
                }
            });
        },
        getLifeTimeSteps(){
            //get token from local storage
            var authCode = 'Bearer ' + localStorage.getItem('token');

            var req_url = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";

            // Start Date: Wed Mar 06 2019 17:25:39 GMT-0600 (Central Standard Time)
            //
            // console.log('weekCounter ' + this.weekCounter);
            let sunday = new Date("Wed Mar 06,2019 00:00:00");


            //get last day of the current week
            let saturday = new Date();
            // - (604800000 *this.weekCounter)
            $.ajax({
                type: "POST",
                url: req_url,
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify({
                    "aggregateBy": [{
                        "dataTypeName": "com.google.step_count.delta",
                        "dataSourceId": "derived:com.google.step_count.delta:com.google.android.gms:estimated_steps"
                    }],
                    "bucketByTime": { "durationMillis": 86400000 },
                    // get start of day in milliseconds
                    "startTimeMillis": sunday.setHours(0,0,0,0),
                    // get end of the day in milliseconds
                    "endTimeMillis": saturday.setHours(23,59,59,999)
                }),

                beforeSend : function( xhr ) {
                    xhr.setRequestHeader('Authorization', authCode);
                },
                success: function (response) {
                    //add to steps local storage
                    app.lifeBucket = new Session(response.bucket);
                },
                failure: function(errMsg) {
                    alert(errMsg);
                }
            });
        },
        //Returns current day of the week; Ex: day = 3 return a Date object for Tuedsay of the current week
        //day is an int 0-6 representing the day; Sunday = 0, Saturday = 6
        getDayOfWeek(day){
            var date = new Date();
            var today = date.getDay();
            var dayOfWeek;

            if (date.getDay == day){
                dayOfWeek = new Date().setDate(date.getDate());
            }
            else{
                dayOfWeek = new Date().setDate((date.getDate() - today) + day)
            }
            return dayOfWeek;
        },
        getDayList(day){
            //get day of the week
            let theDay = new Date(this.getDayOfWeek(day));
            // get start of day in milliseconds
            let startOfDay = theDay.setHours(0,0,0,0)
            // get end of the day in milliseconds
            let endOfDay = theDay.setHours(23,59,59,999);

            return this.weeklySession.filter(function(item){
                return item.endTimeMillis < endOfDay && item.startTimeMillis > startOfDay;
            });
        },
        //returns all the activities(at) for a given day(day) that are stored in weeklySession
        getDailyActivity(day,at){
            //get day of the week
            let theDay = new Date(this.getDayOfWeek(day));
            // get start of day in milliseconds
            let startOfDay = theDay.setHours(0,0,0,0)
            // get end of the day in milliseconds
            let endOfDay = theDay.setHours(23,59,59,999);

            return this.weeklySession.filter(function(item){
                return item.activityType === at && item.endTimeMillis < endOfDay && item.startTimeMillis > startOfDay;
            });
        },
        getBucket(day){
            //if we have no steps for that day then return zero
            if (this.stepsBucket[day].dataset[0].point[0] === undefined){
                return 0;
            //else return the number of steps for that day;
            }else{
                return this.stepsBucket[day].dataset[0].point[0].value[0].intVal;
            }
        },
        getWeeklySteps(){
           // var weeklySteps =  [];

           for(let i = 0;i <= 6; i++){
               // this.weeklySteps[i] = this.getBucket(i);
               this.$set(this.weeklySteps, i, (this.getBucket(i)/2130));
           }
           this.weeklySteps.updated = new Date();
           return this.weeklySteps;
        },
        isloggedIn(){
            if (localStorage.getItem("token") === null) {
                return false;
            }else{
                return true;
            }
        },
        getWeeklyMedMins(){

            var dailyMedMins = [];
            var weeklyMedMins = [];

            for (let day = 0;day <= 6;day++){
                dailyMedMins.push(this.getDailyActivity(day,45));

                weeklyMedMins.push(dailyMedMins[day].reduce((mins, {endTimeMillis, startTimeMillis}) => {
                        mins += Number(endTimeMillis / 60000).toFixed() - Number(startTimeMillis / 60000).toFixed();
                    return mins
                }, 0));
            }
            return weeklyMedMins;
        },
    },
    computed: {
        sundayList: function() {
            return this.getDayList(0);
        },
        mondayList: function(){
            return this.getDayList(1);
        },
        tuesdayList: function(){
            return this.getDayList(2);
        },
        wednesdayList: function(){
            return this.getDayList(3);
        },
        thursdayList: function(){
            return this.getDayList(4);
        },
        fridayList: function(){
            return this.getDayList(5);
        },
        saturdayList: function(){
            return this.getDayList(6)
        },
        sundaySteps: function() {
            return this.getBucket(0);
        },
        mondaySteps: function() {
            return this.getBucket(1);
        },
        tuesdaySteps: function() {
            return this.getBucket(2);
        },
        wednesdaySteps: function(){
            return this.getBucket(3);
        },
        thursdaySteps: function() {
            return this.getBucket(4);
        },
        fridaySteps: function(){
            return this.getBucket(5);
        },
        saturdaySteps: function(){
            return this.getBucket(6);
        },
        // weeklySteps: function() {
        //     return this.getWeeklySteps();
        // },
        weeklyMed: function(){
            return this.getWeeklyMedMins();
        }
    },
    mounted: function() {
        if(this.isloggedIn()){
            console.log('logged in');
            this.loadGoogle();
        }else{
            console.log('logged out');
        }
    // set time out for five mins call load google
    },
    watch:{
        weekCounter: function(){
            this.getStepsBucket();

        }
    }
});