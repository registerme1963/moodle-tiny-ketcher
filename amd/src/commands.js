// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Common values helper for the Moodle tiny_keteditor plugin.
 *
 * @module      tiny_keteditor/commands
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
    icon,
    buttonName
}
from './common';
import {
    ketcherEmbed,
    saveData
}
from './embed';

const isImage = (node) => node.nodeName.toLowerCase() === 'img';
/**
 * Handle the action for your plugin.
 * @param {TinyMCE.editor} editor The tinyMCE editor instance.
 */

const handleAction = async(editor) => {
    const ketcherImage = new ketcherEmbed(editor);
    ketcherImage.init();
    try {
        const ketcher = await ketcherImage.waitForKetcher();
        if (window.json) {
            window.console.log("molecule loading...", window.json);
            ketcher.setMolecule(window.json);
        } else {
            window.console.log("Ketcher Molecular Data Not Available");
        }
    } catch (error) {
        window.console.error(error.message);
    }
    document.getElementById('actionButton').addEventListener('click', saveData);
};

export const getSetup = async() => {
    //    const isImage = (node) => node.nodeName.toLowerCase() === 'img';

    const [
        buttonNameTitle,
        buttonImage,
    ] = await Promise.all([
                getString('buttonNameTitle', component),
                getButtonImage('icon', component),
            ]);

    return (editor) => {
        // Register the Moodle SVG as an icon suitable for use as a TinyMCE toolbar button.
        editor.ui.registry.addIcon(icon, buttonImage.html);

        // Register the startdemo Toolbar Button.
        editor.ui.registry.addButton(buttonName, {
            icon,
            tooltip: buttonNameTitle,
            onAction: () => handleAction(editor),
        });

        editor.ui.registry.addToggleButton(buttonName, {
            icon,
            tooltip: buttonNameTitle,
            onAction: () => handleAction(editor, window.json),
            onSetup: api => {
                return editor.selection.selectorChangedWithUnbind(
                    'img:not([data-mce-object]):not([data-mce-placeholder]),figure.image',
                    function () {
                    var node = editor.selection.getNode();
                    var parentNode = node.parentNode;
                    const html = editor.serializer.serialize(parentNode);
                    const commentMatch = html.match(/<!--(.*?)-->/);
                    if (commentMatch) {
                        try {
                            var json = JSON.parse(commentMatch[1]);
                            // If the comment contains valid JSON, call api.setActive and store the JSON
                            api.setActive(true);
                            window.json = JSON.stringify(json); // Save the JSON to window.json
                        } catch (e) {
                            // If the comment does not contain valid JSON, call api.setActive with false
                            api.setActive(false);
                        }
                    } else {
                        api.setActive(false);
                    }
                }).unbind;
            }
        });

        editor.ui.registry.addContextToolbar(buttonName, {
            predicate: isImage,
            items: buttonName,
            position: 'node',
            scope: 'node'
        });

        // Add the startdemo Menu Item.
        // This allows it to be added to a standard menu, or a context menu.
        editor.ui.registry.addMenuItem(buttonName, {
            icon,
            text: buttonNameTitle,
            onAction: () => handleAction(editor),
        });

    };
};
