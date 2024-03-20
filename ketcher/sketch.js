$(document).ready(function() {
    var iframe = document.getElementById('tinymce_ketcher-iframe');
    var checkKetcherInterval = setInterval(function() {
        var ketcher = iframe.contentWindow.ketcher;
        if (ketcher) {
            clearInterval(checkKetcherInterval);
            $("#actionButton").click(function() {
                handleAction(ketcher);
            });
        }
    }, 500); // Check every 500ms

    async function handleAction(ketcher) {
        var struct = await ketcher.getKet();
        var image = await ketcher.generateImage(struct, {
            outputFormat: "svg",
            backgroundColor: "255, 255, 255"
        });
        var url = URL.createObjectURL(image);
            if (window.parent.tinyMCE && window.parent.tinyMCE.activeEditor) {
                var content = '<img src="' + url + '" width=100px height=100px>';
                var ketString = JSON.stringify(struct);
                var ketStruct = ketString.replace(/\\n/g, '').replace(/\\"/g, '"').replace(/ /g, '').slice(1, -1);
                window.parent.tinyMCE.activeEditor.execCommand('mceInsertContent', 0, content);
                window.parent.tinyMCE.activeEditor.execCommand('mceInsertContent', 0, '<!--[ketdata]' + ketStruct + '[/ketdata]-->');
            } else {
                console.log('TinyMCE not initialized');
            }
            $(window.parent.document).find(".modal").find('.close').click();        
    }
});

