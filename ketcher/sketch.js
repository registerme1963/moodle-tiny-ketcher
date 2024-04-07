document.addEventListener('DOMContentLoaded', function() {
    var checkInterval = setInterval(function() {
        var ketcherRoot = document.querySelector('.ketcher-root');
        var actionButton = document.getElementById('actionButton');
        if (ketcherRoot && window.ketcher && actionButton) {
            clearInterval(checkInterval);

            actionButton.addEventListener('click', function() {
                handleAction(window.ketcher);
            });
        }
    }, 500); // Check every 500ms

    async function handleAction(ketcher) {
    var struct = await ketcher.getKet();
    var image = await ketcher.generateImage(struct, {
        outputFormat: "svg",
        backgroundColor: "255, 255, 255"
    });


    // Create a new FileReader instance
    var reader = new FileReader();

    // Add an event listener for the 'load' event
    reader.addEventListener('load', function() {
        // The result attribute contains the data as a Base64 encoded string
        var base64Image = reader.result;

        // Parse the SVG to get the width and height
        var parser = new DOMParser();
        var svgDoc = parser.parseFromString(atob(base64Image.split(',')[1]), "image/svg+xml");
        var svgElement = svgDoc.documentElement;
        var width = svgElement.getAttribute("width");
        var height = svgElement.getAttribute("height");
        if (window.parent.tinyMCE && window.parent.tinyMCE.activeEditor) {
            var url = URL.createObjectURL(image);
            var ketString = JSON.stringify(struct);
            var ketStruct = ketString.replace(/\\n/g, '').replace(/\\"/g, '"').replace(/ /g, '').slice(1, -1);
            var content = '<img src="' + url + '" width="' + width + '" height="' + height + '">';			
            window.parent.tinyMCE.activeEditor.execCommand('mceInsertContent', 0, content);
            window.parent.tinyMCE.activeEditor.execCommand('mceInsertContent', 0, '<!--' + ketStruct + '-->');
        } else {
            console.log('TinyMCE not initialized');
        }
        $(window.parent.document).find(".modal").find('.close').click();
    });

    // Start reading the Blob as a Base64 encoded string
    reader.readAsDataURL(image);
}

});


