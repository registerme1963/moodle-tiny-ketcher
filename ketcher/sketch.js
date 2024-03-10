$(document).ready(function() {
var isPreview = true;

async function handleClick() {
  if (isPreview) {
    $(this).attr('data-state', 'preview');
    await outputImage();
    $(this).html("Confirm & Close").attr('data-state', 'confirm');
    isPreview = false;
  } else {
    closeModal();
  }
}
$("#width, #height").on('input', outputImage);
$("#actionButton").click(handleClick);

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function outputImage() {
  var output = $('#output');
  var width = $('#width').val();
  var height = $('#height').val();
  ketcher.getKet().then(struct => ketcher.generateImage(struct, {
    outputFormat: "svg",
    backgroundColor: "255, 255, 255"
  })).then(blob => blobToBase64(blob)).then(base64 => {
    var img = $('<img>').attr('src', base64).attr('width', width).attr('height', height);
    output.html('').append(img);
  }).catch(error => window.alert(error));
}

function getData() {
  return new Promise((resolve, reject) => {
    ketcher.getKet().then(struct => {
      ketcher.generateImage(struct, {
        outputFormat: "svg",
        backgroundColor: "255, 255, 255",
      }).then(blob => blobToBase64(blob)).then(base64 => {
        resolve({
          dataURI: base64,
          ketData: struct,
        });
      }).catch(reject);
    }).catch(reject);
  });
}

window.getData = getData;

function closeModal() {
  var width = $('#width');
  var height = $('#height');
  getData().then(({ dataURI, ketData }) => {
    if (window.parent.tinyMCE && window.parent.tinyMCE.activeEditor) {
      var content = '<img src="' + dataURI + '" width="' + width.val() + 'px" height="' + height.val() + 'px">';
      window.parent.tinyMCE.activeEditor.execCommand('mceInsertContent', 0, content);
      window.parent.tinyMCE.activeEditor.execCommand('mceInsertContent', 0, '<!--'+ketData+'-->');
    } else {
      console.log('TinyMCE not initialized');
    }
    $(window.parent.document).find(".modal").find('.close').click();
  }).catch(error => {
    console.error('ERROR IN GETDATA', error);
    alert(error);
  });
}
});