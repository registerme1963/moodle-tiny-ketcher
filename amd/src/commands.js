define("tiny_moldraw/commands", [
  "exports",
  "editor_tiny/utils",
  "core/str",
  "core/templates",
  "core/modal",
  "core/config",
  "./common",
], function (_exports, _utils, _str, _templates, _modal, _config, _common) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  /**
   * Commands helper for the Moodle tiny_moldraw plugin.
   *
   * @module      tiny_moldraw/commands
   * @copyright   2024 Venkatesan Rangarajan <venkatesanrpu@gmail.com>
   * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
   */ Object.defineProperty(_exports, "__esModule", { value: !0 }),
    (_exports.getSetup = void 0),
    (_templates = _interopRequireDefault(_templates)),
    (_modal = _interopRequireDefault(_modal)),
    (_config = _interopRequireDefault(_config));
 const handleAction = async (editor) => {
  await _modal.default.create({
    title: await (0, _str.get_string)("sketchtitle", "tiny_moldraw"),
    body: `${await _templates.default.render("tiny_moldraw/moldraw_iframe", {src: `${_config.default.wwwroot}/lib/editor/tiny/plugins/moldraw/ketcher/sketch.html`})}`,
    footer: `<button id="actionButton" class="btn btn-primary">Save</button><script src="${_config.default.wwwroot}/lib/editor/tiny/plugins/moldraw/ketcher/sketch.js"></script>`,
    show: true,
    removeOnClose: true,
  });

<<<<<<< Updated upstream
  var modalDialog = document.querySelector(".modal-dialog");
  var modalContent = document.querySelector(".modal-content");
  var modalBody = document.querySelector(".modal-body");

  if (window.matchMedia("(max-width: 768px)").matches) {
    modalDialog.style.cssText = "width: 90%; height: 90%; margin: 5% auto; padding: 0;";
  } else {
    modalDialog.style.cssText = "width: 850px; height: 680px; margin: auto; padding: 0;";
  }
=======
/**
 * Common values helper for the Moodle tiny_ketcher plugin.
 *
 * @module      tiny_ketcher/commands
 * @copyright   2024 Venkatesan Rangarajan <venkatesanrpu@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {
    getButtonImage
}
from 'editor_tiny/utils';
import {
    get_string as getString
}
from 'core/str';
import {
    component,
    ketcherButtonName,
    ketcherMenuName,
    icon,
}
from './common';
import {
    KetcherEmbed
}
from './embed';

// Function to find the hidden JSON data after the selected image
const findNextKetData = (editor) => {
    const selectedNode = editor.selection.getNode();
    let sibling = selectedNode.nextSibling;
    while (sibling && sibling.nodeType !== 8) { // Node.COMMENT_NODE === 8
        if (sibling.nodeName === 'BR') {
            sibling = sibling.nextSibling; // Move to the next sibling after <br>
            while (sibling && sibling.nodeType !== 8) { // Node.COMMENT_NODE === 8
                sibling = sibling.nextSibling;
            }
            if (sibling) {
                const data = JSON.parse(sibling.nodeValue);
                sibling.parentNode.removeChild(sibling); // Remove the sibling
                return data;
            }
        }
        sibling = sibling.nextSibling;
    }
    if (sibling) {
        return JSON.parse(sibling.nodeValue);
    }
    return null;
};
>>>>>>> Stashed changes

  modalContent.style.cssText = "height: 100%; max-height: 100%;";
  modalBody.style.cssText = "padding: 0; height: calc(100% - 56px);";

<<<<<<< Updated upstream
  window.console.log(editor);

  // Add event listener for image click
  editor.on('click', function(e) {
    if (e.target.nodeName == 'IMG') {
      // Select the corresponding [ketdata]
      var ketData = e.target.nextElementSibling;
      if (ketData && ketData.nodeName == 'KETDATA') {
        ketData.select();
      }
    }
  });

  // Add event listener for tiny_moldraw edit button click
  editor.ui.registry.on('click', function() {
    if (editor.selection.getNode().nodeName == 'KETDATA') {
      // Retrieve the selected [ketdata]
      var ketData = editor.selection.getContent();

      // Load the [ketdata] into the Ketcher window for editing
      ketcher.setMolecule(ketData);
    }
  });
};
 
_exports.getSetup = async () => {
    const [
      startMolDrawButtonNameTitle,
      startMolDrawMenuItemNameTitle,
      buttonImage,
    ] = await Promise.all([
      (0, _str.get_string)("button_startMolDraw", _common.component),
      (0, _str.get_string)("menuitem_startMolDraw", _common.component),
      (0, _utils.getButtonImage)("icon", _common.component),
    ]);
    return (editor) => {
      editor.ui.registry.addIcon(_common.icon, buttonImage.html),
        editor.ui.registry.addButton(_common.startMolDrawButtonName, {
          icon: _common.icon,
          tooltip: startMolDrawButtonNameTitle,
          onAction: () => handleAction(editor),
        }),
        editor.ui.registry.addMenuItem(_common.startMolDrawMenuItemName, {
          icon: _common.icon,
          text: startMolDrawMenuItemNameTitle,
          onAction: () => handleAction(editor),
        });
    };
  };
});

//# sourceMappingURL=commands.min.js.map
=======
const handleAction = (editor) => {
    const ketcherImage = new KetcherEmbed(editor);
    ketcherImage.init();
};


export const getSetup = async() => {
    const [
        ketcherButtonNameTitle,
        ketcherMenuNameTitle,
        buttonImage,
    ] = await Promise.all([
                getString('ketcherButtonNameTitle', component),
                getString('ketcherMenuNameTitle', component),
                getButtonImage('icon', component),
            ]);

    return (editor) => {
        // Register the Moodle SVG as an icon suitable for use as a TinyMCE toolbar button.
        editor.ui.registry.addIcon(icon, buttonImage.html);

        // Register the startdemo Toolbar Button.
        editor.ui.registry.addButton(ketcherButtonName, {
            icon,
            tooltip: ketcherButtonNameTitle,
            onAction: () => handleAction(editor),
        });

        editor.ui.registry.addToggleButton(ketcherButtonName, {
            icon,
            tooltip: ketcherButtonNameTitle,
            onAction: () => handleAction(editor),
            onSetup: (buttonApi) => {
                editor.on('NodeChange', () => {
                    const selectedNode = editor.selection.getNode();
                    if (selectedNode.nodeName === 'IMG') {
                        var tempData = findNextKetData(editor);
                        window.ketData = JSON.stringify(tempData);
                        if (tempData) {
                            buttonApi.setActive(true);
                        } else {
                            buttonApi.setActive(false);
                        }
                    } else {
                        buttonApi.setActive(false);
                    }
                });
                return () => {
                    editor.off('NodeChange');
                };
            },
        });

        // Add the startdemo Menu Item.
        // This allows it to be added to a standard menu, or a context menu.
        editor.ui.registry.addMenuItem(ketcherMenuName, {
            icon,
            text: ketcherMenuNameTitle,
            onAction: () => handleAction(editor),
        });
    };
};

>>>>>>> Stashed changes
