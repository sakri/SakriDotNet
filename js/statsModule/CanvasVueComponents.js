Vue.component('clicks-chart', {
    props: [],
    data: function () {
        return {
            lineChart: new LineChart("#f7f7f7")
        }
    },
    template: '<canvas ref="clicksCanvas" class="TangleUIelem"></canvas>',
    methods:{
        render : function(){
            this.lineChart.render(this.$refs.clicksCanvas, AppData.interactionsHistory);
        }
    }
});

Vue.component('visits-pie-chart', {
    props: [],
    data: function () {
        return {
            pieChart: new PieChart("#f7f7f7")
        }
    },
    template: '<canvas ref="pieCanvas" class="TangleUIelem"></canvas>',
    methods:{
        render : function(){
            this.pieChart.render(this.$refs.pieCanvas);
        }
    }
});

Vue.component('avatar-renderer', {
    props: ["id"],
    data: function () {
        return {}
    },
    template: '<canvas ref="avatarCanvas" class="TangleUIelem"></canvas>',
    methods:{
        render : function(progressNormal){
            var canvas = this.$refs.avatarCanvas, bounds = TangleUI.getRect(this.id);
            CanvasUtil.enablePixelArtScaling(CanvasUtil.setLayoutBounds(canvas, bounds));
            //console.log(this.id, "avatar render : ", canvas.width, canvas.height, bounds.width, bounds.height);
            var scale = Math.floor(Math.min(bounds.width / PixelGuyHeadSprite.unscaledWidth, bounds.height/ PixelGuyHeadSprite.unscaledHeight) );
            var x = bounds.width * .5 - (scale * PixelGuyHeadSprite.unscaledWidth * .5);
            PixelGuyHeadSprite.renderAvatar(canvas.getContext("2d"), Math.floor(x), 0, scale, progressNormal);
        },
        clear : function(){
            var canvas = this.$refs.avatarCanvas;
            var context = canvas.getContext("2d");
            context.clearRect(0,0,canvas.width, canvas.height);
        }
    }
});

Vue.component('badge-list-renderer', {
    props: [],
    data: function () {
        return {
            barsList: new ProgressBarList(this.$root.playCelebrate)
        }
    },
    template: '<canvas ref="badgesCanvas" class="TangleUIelem"></canvas>',
    methods:{
        render : function(data){
            this.barsList.update(this.$refs.badgesCanvas, TangleUI.getRect("badgesList"), data);
            if(this.barsList.dataComplete(data)){
                window.scrollTo(0, 0);//bit of a hack here...
            }
        }
    }
});