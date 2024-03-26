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

/**
 * Handle the action for your plugin.
 * @param {TinyMCE.editor} editor The tinyMCE editor instance.
 */

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

