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
 * @module      tiny_keteditor/embed
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

export const ketcherEmbed = class {
    editor = null;
    constructor(editor) {
        this.editor = editor;
    }
    init = async() => {
        const modal = await Modal.create({
            title: getString('buttonNameTitle', 'tiny_keteditor'),
            show: true,
            removeOnClose: true,
        });
        Templates.renderForPromise('tiny_keteditor/ketcher_template', {})
        .then(async({
                html,
                js
            }) => {
            Templates.appendNodeContents(modal.getBody(), html, js);
            const scripturl = new URL(`${Config.wwwroot}/lib/editor/tiny/plugins/keteditor/ketcher/static/js/main.963f80c2.js`);
            var script = document.createElement('script');
            script.src = scripturl.toString();
            document.body.appendChild(script); // Append the script to the body
            const cssurl = new URL(`${Config.wwwroot}/lib/editor/tiny/plugins/keteditor/ketcher/static/css/main.3fc9c0f8.css`);
            var link = document.createElement('link');
            link.href = cssurl.toString();
            link.rel = 'stylesheet';
            document.head.appendChild(link); // Append the link to the head
        })
        .catch((error) => displayException(error));
    };
    waitForKetcher = () => {
        return new Promise((resolve, reject) => {
            const checkKetcher = setInterval(() => {
                if (window.ketcher) {
                    clearInterval(checkKetcher);
                    resolve(window.ketcher);
                }
            }, 100);
            setTimeout(() => {
                clearInterval(checkKetcher);
                reject(new Error('Ketcher loading timeout'));
            }, 5000); // Timeout after 5 seconds
        });
    };
};

export const saveData = async function() {
    var ketcher = window.ketcher;
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
            window.console.log('TinyMCE not initialized');
        }
        window.parent.document.querySelector(".modal .close").click();
//$(window.parent.document).find(".modal").find('.close').click();
    });

    // Start reading the Blob as a Base64 encoded string
    reader.readAsDataURL(image);
};
