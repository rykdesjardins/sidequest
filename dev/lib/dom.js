class DOMHelper {
    constructor() {};

    create(op) {
        if (op.node == "text") {
            return document.createTextNode(op.text);
        }

        var node = document.createElement(op.node);
        if (op.id) {
            node.id = op.id;
        }

        node.className = op.className || (op.classList && op.classList.join(' ')) || "";

        if (op.attr) {
            var attr = Object.keys(op.attr);
            for (var i = 0; i < attr.length; i++) {
                node.setAttribute(attr[i], op.attr[attr[i]]);
            }
        }

        if (op.text) {
            node.textContent = op.text;
        } else if (op.html) {
            node.innerHTML = op.html;
        }

        if (op.children) for (var i = 0; i < op.children.length; i++) {
            node.appendChild(this.create(op.children[i]));
        }

        if (op.parent) {
            op.parent.appendChild(node);
        }

        return node;
    };

    byID(id) {
        return document.getElementById(id);
    }

    query(q, all) {
        return document[all ? "querySelectorAll" : "querySelector"](q);
    }
}

module.exports = new DOMHelper();
