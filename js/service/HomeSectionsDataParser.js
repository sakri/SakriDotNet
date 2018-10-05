(function() {

    window.HomeSectionsDataParser = {};

    //Public API

    //loops through "section" tags on a page, stores content as data objects and clears dom
    HomeSectionsDataParser.parseSectionsData = function () {
        var sectionNodes = document.body.querySelectorAll("section, article"),
            dataList = [], data, section, node, i, story, originalImage;
        for (i = 0; i < sectionNodes.length; i++) {
            section = sectionNodes[i];
            node = section.querySelector(".sectionContent");
            originalImage = node.querySelector("img");
            data = {};
            if (originalImage) {
                data.image = new Image();
                data.image.src = originalImage.src;
            }
            data.themeColor = AppConfig.colorPalette[i % AppConfig.colorPalette.length];
            data.title = node.querySelector("h1").innerHTML.toLowerCase();
            data.contentLayout = new CardContentLayout(
                data.image ? data.image.width : AppLayout.thumbDefaultBounds.width,
                data.image ? data.image.height : AppLayout.thumbDefaultBounds.height
            );
            data.headline = node.querySelector("p").innerHTML;
            story = section.querySelector(".sectionExtendedContent");
            data.story = story ? story.innerHTML : "";
            data.link = node.querySelector("a");
            data.visited = false;
            data.storyReadComplete = false;
            dataList[i] = data;
        }
        document.body.innerHTML = "";
        return dataList.reverse();//html order is displayed in inverse order in menu
    };
    //private properties and methods


}());