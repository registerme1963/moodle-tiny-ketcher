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
    icon,
}
from './common';
import {
    KetcherEmbed
}
from './embed';

/**
 * Handle the action for your plugin.
 * @param {TinyMCE.editor} editor The tinyMCE editor instance.
 */

const handleAction = (editor) => {
    const ketcherImage = new KetcherEmbed(editor);
    ketcherImage.init();
};

export const getSetup = async() => {
    const isImage = (node) => node.nodeName.toLowerCase() === 'img';

    const [
        ketcherButtonNameTitle,
        buttonImage,
    ] = await Promise.all([
                getString('ketcherButtonNameTitle', component),
                getString('ketcherButtonNameTitle', component),
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

        editor.ui.registry.addContextToolbar(ketcherButtonName, {
            predicate: isImage,
            items: ketcherButtonName,
            position: 'node',
            scope: 'node'
        });

        // Add the startdemo Menu Item.
        // This allows it to be added to a standard menu, or a context menu.
        editor.ui.registry.addMenuItem(ketcherButtonName, {
            icon,
            text: ketcherButtonNameTitle,
            onAction: () => handleAction(editor),
        });

    };
};
