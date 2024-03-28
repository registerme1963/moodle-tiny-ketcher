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
 * @module      tiny_ketcher/embed
 * @copyright   2024 Venkatesan Rangarajan <venkatesanrpu@gmail.com>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {
    get_string as getString
}
from 'core/str';
import Templates from 'core/templates';
import Modal from 'core/modal';
import Config from 'core/config';
import {
    exception as displayException
}
from 'core/notification';

export const KetcherEmbed = class {
    editor = null;
    canShowFilePicker = false;

    /**
     * @property {Object} The names of the alignment options.
     */
    helpStrings = null;

    /**
     * @property {boolean} Indicate that the user is updating the media or not.
     */
    isUpdating = false;

    constructor(editor) {
        this.editor = editor;
    }

    getIframeURL = () => {
        const url = new URL(`${Config.wwwroot}/lib/editor/tiny/plugins/ketcher/ketcher/sketch.html`);
        return url.toString();
    };

    init = async() => {
        const modal = await Modal.create({
            title: getString('ketchertitle', 'tiny_ketcher'),
            show: true,
            removeOnClose: true,
        });

        var modalDialog = document.querySelector(".modal-dialog");
        var modalContent = document.querySelector(".modal-content");
        var modalBody = document.querySelector(".modal-body");
        var modalFooter = document.querySelector(".modal-footer");

        if (window.matchMedia("(max-width: 768px)").matches) {
            modalDialog.style.cssText = "width: 90%; height: 90%; margin: 5% auto; padding: 0;";
        } else {
            modalDialog.style.cssText = "width: 850px; height: 720px; margin: auto; padding: 0;";
        }

        modalContent.style.cssText = "height: 100%; max-height: 100%;";
        modalBody.style.cssText = "padding: 0; height: calc(100% - 50px);";
        modalFooter.style.cssText = "display: inherit; height: 50px;";

        Templates.renderForPromise('tiny_ketcher/ketcher_iframe', {
            src: this.getIframeURL()
        })
        .then(({
                html,
                js
            }) => {
            Templates.appendNodeContents(modal.getBody(), html, js);

            // Get the iframe element
            const iframe = document.getElementById('tinymce_ketcher-iframe');
            // Add a load event listener to the iframe
            iframe.addEventListener('load', function () {
                // Make sure window.ketData is valid
                if (window.json) {
                    // Call the ketcher.setMolecule API after a delay
                    setTimeout(function () {
                        if (iframe.contentWindow.ketcher) {
                            iframe.contentWindow.ketcher.setMolecule(window.json);
                        } else {
                            window.console.log('ketcher is not defined');
                        }
                    }, 1000); // Adjust the delay as needed
                }
            });

            // Add the script to the modal footer after the iframe is loaded
            const scripturl = new URL(`${Config.wwwroot}/lib/editor/tiny/plugins/ketcher/ketcher/sketch.js`);
            var script = document.createElement('script');
            script.src = scripturl.toString();
            var button = document.createElement('button');
            button.id = "actionButton";
            button.className = "btn btn-primary";
            button.textContent = "Save";
            modal.getFooter().append(button, script);

        })
        .catch((error) => displayException(error));
    };
};
