(function() {

    window.TemplateGrabber = {};

    TemplateGrabber.grabTemplateFromDom = function(id){
        var element = document.getElementById(id);
        if(!element){
            console.warn("TemplateGrabber.grabTemplateFromDom(", id, ") , warning : no element found");
            return false;
        }
        _templates[id] = element.outerHTML;
        element.parentElement.removeChild(element);
        return true;
    };

    TemplateGrabber.getTemplate = function(id){
        if(!_templates[id] && !this.grabTemplateFromDom(id)){
            console.warn("TemplateGrabber.getTemplate(", id, ") , warning : no template found");
            _templates[id] = '<div ref="id"></div>';
        }
        return _templates[id];
    };

    var _templates = {};

}());