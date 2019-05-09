
Vue.component('asdf', {
    props: {
        dayofweek: {
            type: Array,
            required: true
        },
        name:{
            type: String,
            default: 'Blarg'
        },
        steps:{
            type: Number,
            default: 0
        }

    },
    methods: {

    },
    template: ''+
        '         <div>'+
        '           <h1>{{name}}</h1>\n' +
        '            <div class = "row">\n' +
        '            </div>' +
        '            <h1>{{(medMins)}}</h1>'+
        '            <h1>{{steps}}</h1>'+
        '         </div>',
    computed: {
        medMins() {
            return this.dayofweek.reduce((medMins,  {activityType, endTimeMillis, startTimeMillis} ) => {
                if (activityType == 45) {
                    medMins += Number(endTimeMillis/60000).toFixed()-Number(startTimeMillis/60000).toFixed();
                }
                return medMins
            }, 0)
        }
    }
});

Vue.component('chart', {
    extends: VueChartJs.Bar,
    data: function() {
      return {
          sunday: 'rgba(255, 99, 132, 1)',
          monday: 'rgba(255, 99, 132, 1)',
          tuesday: 'rgba(255, 99, 132, 1)',
          wednesday: 'rgba(255, 99, 132, 1)',
          thursday: 'rgba(255, 99, 132, 1)',
          friday: 'rgba(255, 99, 132, 1)',
          saturday: 'rgba(255, 99, 132, 1)',
      }
    },
    props: {
        activity: {
            type: Array,
            required: true
        },
        goals: {
            type: Array,
            required: true
        },
        label: {
            type: String,
        }
    },
    methods: {
      render(){
          this.renderChart({
                  labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                  datasets: [
                      {
                          type: 'line',
                          fill: false,
                          borderColor: '#4BF832',
                          borderDash: [5,5],
                          label:'Goal',
                          backgroundColor: '#0d17f8',
                          data: this.goals,
                      },
                      {
                          type: 'bar',
                          label: this.label,
                          // backgroundColor: '#3985C3',
                          data: this.activity,
                          backgroundColor: [
                              this.sunday,
                              this.monday,
                              this.tuesday,
                              this.wednesday,
                              this.thursday,
                              this.friday,
                              this.saturday,
                          ]
                      }

                  ],

              },
              //options
              {
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                      yAxes: [{
                          display: true,
                          scaleLabel: {
                              display: true,
                              labelString: this.label
                          },
                          ticks: {
                              beginAtZero: true
                          }
                      }]
                  },
                  tooltips: {
                      mode: 'index'
                  },
                  spanGaps: true
              }
          //this.renderChart
          )
      },
      changeGraphColors(activityType,goalType){
          for(let i = 0; i < 7;i++){
              let activity = activityType[i];
              let goals = goalType[i];
              let green = 'rgba(30, 130, 76, 1)';
              let yellow = 'rgba(245, 229, 27, 1)';
              let red = 'rgba(207, 0, 15, 1)';

              if(activity >= goals) {
                  this.setDayColor(green, i);
              }else if (activity >= ((goals * .5))) {
                  this.setDayColor(yellow, i);
              } else {
                  this.setDayColor(red, i);
              }
          }
      },
      setDayColor(color, day){
          switch(day){
              case 0:
                  this.sunday = color;
                  break;
              case 1:
                  this.monday = color;
                  break;
              case 2:
                  this.tuesday = color;
                  break;
              case 3:
                  this.wednesday = color;
                  break;
              case 4:
                  this.thursday = color;
                  break;
              case 5:
                  this.friday = color;
                  break;
              case 6:
                  this.saturday = color;
                  break;
          }
      }
    },
    mounted () {
        this.changeGraphColors(this.activity,this.goals);
        this.render();
    },
    watch: {
        goals: {
            handler: function () {
                this.$data._chart.destroy();
                this.changeGraphColors(this.activity,this.goals);
                this.render();
            },
            deep: true
        },
        activity: {
            handler: function() {
                this.changeGraphColors(this.activity,this.goals);
                this.render();
            },
            deep: true
        }
    }
});

Vue.component('med-chart', {
    extends: VueChartJs.Bar,
    props: {
        weeklymed:{
            type :Array,
            required:true
        },

        goals:{
            type : Object,
            required:true
        }
    },
    mounted () {
        this.renderChart({
            labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            datasets: [
                {
                    label: 'Meditation(minutes)',
                    backgroundColor: '#e7823e',
                    data: this.weeklymed
                    // data: this.$parent.getWeeklyMedMins()

                },
                {
                    // type: 'line',
                    // steppedLine: 'beginning',
                    label:'Goal',
                    backgroundColor: '#0d17f8',
                    data: this.goals.meditations
                }

            ]
        }, {responsive: true, maintainAspectRatio: false})
    },
    watch: {
        goals: {
            handler: function (val, oldVal) {
                this.$data._chart.update();
            },
            deep: true
        },
    }
});

Vue.component('goals-modal',{
    props: {
        goals:{
            type: Object,
            required: true
        }
    },
    methods: {
    },
    template: ''+
        '<div>\n' +
        ' <b-button v-b-modal.modal variant="outline-light">Set Goals</b-button>\n' +
        '                <!-- Modal Component -->' +
            '<b-modal id="modal" title="Set Your Daily Goals">\n' +
                '<div class= "parent">'+
                    '<div class = "steps stepsbg">'+
                    '        <h5><b>Miles</b></h5>'+
                    '        Sunday:<input type="text" v-model="goals.steps[0]">\n' +
                    '        Monday:<input type="text" v-model="goals.steps[1]">\n' +
                    '        Tuesday:<input type="text" v-model="goals.steps[2]">\n' +
                    '        Wednesday:<input type="text" v-model="goals.steps[3]">\n' +
                    '        Thursday:<input type="text" v-model="goals.steps[4]">\n' +
                    '        Friday:<input type="text" v-model="goals.steps[5]">\n' +
                    '        Saturday:<input type="text" v-model="goals.steps[6]">\n' +
                    '</div>'+
                    '<div class ="med medbg">'+
                    '         <h5><b>Meditation minutes</b></h5>          '+
                    '         Sunday:<input type="text" v-model="goals.meditations[0]">\n' +
                    '         Monday:<input type="text" v-model="goals.meditations[1]">\n' +
                    '         Tuesday:<input type="text" v-model="goals.meditations[2]">\n' +
                    '         Wednesday:<input type="text" v-model="goals.meditations[3]">\n' +
                    '         Thursday:<input type="text" v-model="goals.meditations[4]">\n' +
                    '         Friday:<input type="text" v-model="goals.meditations[5]">\n' +
                    '         Saturday:<input type="text" v-model="goals.meditations[6]">\n' +
                    '</div>'+
                '</div>'+
            '</b-modal>\n' +
        '</div>',
    computed: {

    }

});

Vue.component('day',{
    extends: VueChartJs.Doughnut,
    data: function() {
       return {
          color: 'rgba(255, 99, 132, 1)'
       }
    },
    props: {
        weeklysteps:{
            type :Array,
            required:true
        },
        goals:{
            type : Object,
            required:true
        },
        label:{
            type: String
        },
        day: {
            type: Number, default: 3
        }
    },

    computed: {
        stepsTaken() {
            return this.weeklysteps[this.day]
        },
        stepsGoal(){
            return this.goals.steps[this.day];
        },
        stepsRemaining(){
            if(this.stepsTaken >= this.stepsGoal){
                return 0;
            }else{
                return this.stepsGoal - this.stepsTaken;
                // console.log(this.stepsGoal -= this.stepsTaken);
            }
        }

    },
    template: '' +
        '         <div>'+
        '         </div>',
    methods: {
      render(){
          this.renderChart({
                  labels: ['Miles Finished','Miles Remaining'],
                  datasets: [
                      {
                          label: 'Steps',
                          // backgroundColor: '#3985C3',
                          // borderColor: '#4BF832',
                          data: [this.stepsTaken.toFixed(2),this.stepsRemaining.toFixed(2)],
                          backgroundColor: [
                              this.color,
                              'rgba(54, 162, 235, 1)',
                          ]
                      }
                  ],
              },
              //options
              {responsive: true, maintainAspectRatio: false }
              //this.renderChart
          )
      },
        changeGraphColors(){
            let green = 'rgba(30, 130, 76, 1)';
            let yellow = 'rgba(245, 229, 27, 1)';
            let red = 'rgba(207, 0, 15, 1)';

            console.log(this.stepsTaken, this.stepsGoal);
            if(this.stepsTaken >= this.stepsGoal) {
                this.color = green;
            }else if (this.stepsTaken >= ((this.stepsGoal * .5))) {
                this.color = yellow;
            } else {
                this.color = red;
            }
        }
    },
    mounted () {
        this.changeGraphColors();
        this.render();
    },
    watch: {
        goals: {
            handler: function () {
                //this.findRemainingSteps();
                // console.log(this.stepsGoal -= this.stepsTaken);
                this.$data._chart.destroy();
                this.changeGraphColors();
                this.render();
            },
            deep: true
        },
        weeklysteps: {
            handler: function() {
                //this.findRemainingSteps();
                this.changeGraphColors();
                this.render();
                // console.log(this.weeklysteps[0]);
            },
            deep:true
        }
    }

});

Vue.component('life-time-steps', {
    data: function() {
        return {
            miles: 0,
            currentLevelColor: '#07ffd8',
            nextLevelColor: '#ffd926',
            nextLevelMiles: 0,
            levelTwo: 300,
            levelThree: 400,
            currentLevel: 0
        }
    },
    props: {
        life: {
            type:Array,
            required: true
        }
    },
    methods: {
        calculateLifeTimeSteps(steps){
            // console.log("life",this.lifeTimeBucket);
            for(let i = 0;i < steps.length; i++){

                if (steps[i].dataset[0].point[0] === undefined){
                    //do nothing
                }else{
                    this.miles += (steps[i].dataset[0].point[0].value[0].intVal/2130);

                }
            }
            // this.miles += 30;
        },
        getLevel(){
            var miles = this.miles;
            console.log("miles",miles);
            switch(true){
                case miles < 50:
                    this.currentLevelColor = '#2011FF';
                    this.nextLevelColor = '#0f0';
                    this.nextLevelMiles = 150;
                case miles >= 200 && miles < 300:
                    this.currentLevel = this.levelTwo;
                    this.nextLevelMiles = 200;
                    this.currentLevelColor = '#ffd926';
                    this.nextLevelColor = '#FF1A23';
                    // localStorage.setItem('nextLevelColor','#FF1A23');
                    // this.nextLevelColor = localStorage.getItem('nextLevelColor');
                    break;
                case miles >= 300 && miles < 400:
                    this.currentLevel = this.levelThree;
                    this.nextLevelMiles = 300;
                    this.currentLevelColor = '#FF1A23';
                    this.nextLevelColor = '#FF20F0';

                    // localStorage.setItem('nextLevelColor','#FF20F0');
                    // this.nextLevelColor = localStorage.getItem('nextLevelColor');
                    // console.log(this.currentLevelColor);
                    break;
                default:
                    console.log('failure');
                    break;
            }

        }
    },
    mounted(){
      this.calculateLifeTimeSteps(this.life);
      this.getLevel();
    },
    template: ''+
    '  <div>' +
        '<div align="center"> <h1 :style="{color: currentLevelColor}"><i class="fas fa-blender"></i></h1></div>' +
        '<div v-bind:style="{backgroundColor: nextLevelColor}"  class="endbox"></div>' +
        '<b-progress :value="this.miles - this.nextLevelMiles" :max="100" show-progress animated></b-progress>\n' +
        '<h1>Total Miles: {{(this.miles).toFixed(2)}}</h1>' +
        '<h1>Next Miles: {{(this.nextLevelMiles).toFixed(2)}}</h1>' +
    '     <!--<b-progress class="mt-2" :max="max" show-value>-->\n' +
    '     <!--<b-progress-bar :value="50*(6/10)" variant="success"></b-progress-bar>-->\n' +
    '     <!--<b-progress-bar :value="50*(2.5/10)" variant="warning"></b-progress-bar>-->\n' +
    '     <!--<b-progress-bar :value="50*(1.5/10)" variant="danger"></b-progress-bar>-->\n' +
    '   <!--</b-progress>-->\n' +
    '  </div>',


});

Vue.component('goals-table',{
    data: function() {
        let fields = ['Week','Sun','Mon','Tues','Wed','Thurs','Fri','Sat'];
        return {
            fields: fields,
            items:this.buildTable(fields)
        }
    },
    props:{
      goals:{
       type:Array,
       required:true
      }
    },
    methods:{
      buildTable(fields){
          let items = [];
          let mult = 1;

          for(let week = 1;week < 9;week++) {

              let newItem = {};
              newItem[fields[0]] = week;

              for (let day = 0; day < this.goals.length; day++){

                  switch(parseInt(this.goals[day])) {
                      case 0:
                          newItem[fields[(day+1)]] = 'Rest Day';
                        break;
                      default:
                          newItem[fields[(day + 1)]] = (this.goals[day] * mult).toFixed(2) +' Mi Run';

                  }

                  //add rest day
                  if(this.goals[day] == 0){
                      newItem[fields[(day+1)]] = 'Rest Day';
                  }

                  if (day == 0){
                      newItem[fields[(day+1)]] = (this.goals[day] * mult).toFixed(2) + ' Mi Tempo';
                  }
                  if (day == 1){
                      newItem[fields[(day+1)]] = (this.goals[day] * mult).toFixed(2) + ' Mi Fast';
                  }

                  //5k test 4th week in
                  if(day == 5 && week == 4){
                      newItem[fields[(day + 1)]] = '5K Test';
                      // newItem = {Fri: '5k test', tdClass:'thick'}
                      newItem['_cellVariants'] = {Fri: 'danger'};
                      // newItem[fields[(i+1)]] {tdClass: 'thick'}
                  }
                  //Final 5k run
                  if(day == 5 && week == 8){
                      newItem[fields[(day + 1)]] = "5K Run";
                      newItem['_cellVariants'] = {Fri: 'danger'};
                  }

              }
              mult += .03;
              // console.log(newItem);
              items.push(newItem);
          }
          return items;
      }
    },
    watch: {
        goals: {
            handler: function () {
                this.items = this.buildTable(this.fields);
            },
            deep: true
        }
    },
   template:`
    <div>
        <b-table striped hover :items="items" :fields="fields"></b-table>
        <div class ="mx-3">
        <b-jumbotron>
            <span class ="action">Run:</span> When the schedule says "run" that suggest that you run at an easy pace.How fast is easy?
            You need to define you own comfort level. Don't worry about how fast you run; just cover the distance
            suggested-or approximately the distance. Ideally, you should be able to run at a pace that allows you to
            converse with a training partner without getting too much out of breath.
            <br><br>
            <span class ="action">Tempo Run</span> This is a continuous run with an easy beginning, a build up in the middle near the 10k
            race pace, then ease back and cruise to the finish. A typical temp run would begin with 5-10 minutes easy running,
            continue with 10-15 faster running, and finish with 5-10 minutes cooling down. You can't figure out your pace on a watch
            doing this workout; you need to listen to your body. Tempo runs are very useful for developing your anaerobic threshold, essential for
            5k racing.
            <br><br>
            <span class = "action">Fast</span> We suggest that for several runs you run "fast". How fast is "fast?" Again, that depends on your comfort level.
            Go somewhat faster than you would on a "run" day. If you are doing this workout right, you probably do not want to converse with your training partner,
            assuming you have one. It's okay now to get out of breath.
            <br><br>
            <span class ="action">Rest:</span> You can't train hard unless you are well-rested. The schedule includes
            two designated days for rest. The easy 3-mile runs scheduled for Tuesday and Thursdays are also to help
            you rest for hard workouts on other days
            </p>
        </b-jumbotron>
    </div>
    </div>
   `
});

Vue.component('level-buttons',{
    methods:{
        novice(){
            let goals = [3,1,1,0,1,1,0];
            this.$emit('updategoals',goals);
        },
        intermediate(){
            let goals = [5,3,3,0,3,3,0];
            this.$emit('updategoals',goals);
        },
        expert(){
            let goals = [8,5,5,0,5,5,0];
            this.$emit('updategoals',goals);
        }

    },
    template:`
        <div>
            <b-button @click="novice">Novice</b-button>
            <b-button @click="intermediate">Intermediate</b-button>
            <b-button @click="expert">Expert</b-button>
        </div>
    `

});