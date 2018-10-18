Vue.component('tangle-fit-text', {
    props: ["multiline", "minfontsize", "maxfontsize"],
    computed:{
        textFitProps : function(){
            var fitProps = undefined;//I don't want this instantiated every update?
            if(this.multiline){
                fitProps = fitProps || {};
                fitProps.multiLine = this.multiline
            }
            if(this.minfontsize){
                fitProps = fitProps || {};
                fitProps.minFontSize = this.minfontsize
            }
            if(this.maxfontsize){
                fitProps = fitProps || {};
                fitProps.maxFontSize = this.maxfontsize
            }
            return fitProps;
        }
    },
    mounted : function(){
        this.render();
    },
    template: '<div ref="fitTextContainer" class="TangleUIelem"><slot></slot></div>',
    methods:{
        render : function(){
            var container = this.$refs.fitTextContainer;
            //container.innerHTML = this.label;
            var rect = container.id == "" ? null :  TangleUI.getRect(container.id);
            //console.log("render text id : ", container.id, rect.toString(), this.textFitProps);
            TransitionCSSUtil.showElement(container, rect);
            textFit(container, this.textFitProps);
            /*
            settings = {
alignVert: false, // if true, textFit will align vertically using css tables
alignHoriz: false, // if true, textFit will set text-align: center
multiLine: false, // if true, textFit will not set white-space: no-wrap
detectMultiLine: true, // disable to turn off automatic multi-line sensing
minFontSize: 6,
maxFontSize: 80,
reProcess: true, // if true, textFit will re-process already-fit nodes. Set to 'false' for better performance
widthOnly: false, // if true, textFit will fit text to element width, regardless of text height
alignVertWithFlexbox: false, // if true, textFit will use flexbox for vertical alignment
};
            */
        }
    }
});