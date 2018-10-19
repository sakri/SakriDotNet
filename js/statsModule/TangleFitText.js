Vue.component('tangle-fit-text', {
    props: ["multiline", "minfontsize", "maxfontsize"],
    mounted : function(){
        this.render();
    },
    template: '<div ref="fitTextContainer" class="TangleUIelem"><slot></slot></div>',
    methods:{
        render : function(){
            var container = this.$refs.fitTextContainer;
            var rect = TangleUI.getRect(container.id);
            TransitionCSSUtil.showElement(container, rect);
            //this is a hack, textFit wasn't able to calculate "original width & height" when reprocessing, not sure why
            var fitProps = {reProcess : true, setWidth : rect.width, setHeight : rect.height};//I don't want this instantiated every update?
            if(this.multiline){
                fitProps.multiLine = this.multiline
            }
            if(this.minfontsize){
                fitProps.minFontSize = this.minfontsize
            }
            if(this.maxfontsize){
                fitProps.maxFontSize = this.maxfontsize
            }
            textFit(container, fitProps);
        }
    }
});