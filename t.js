(function (exports) {
    'use strict';

    function safeTextInsert(text) {
        if (text === '') {
            return document.execCommand('delete');
        }
        return document.execCommand('insertText', false, text);
    }
    function insertTextFirefox(field, text) {
        field.setRangeText(text, field.selectionStart || 0, field.selectionEnd || 0, 'end');
        field.dispatchEvent(new InputEvent('input', {
            data: text,
            inputType: 'insertText',
        }));
    }
    function insert(field, text) {
        var document = field.ownerDocument;
        var initialFocus = document.activeElement;
        if (initialFocus !== field) {
            field.focus();
        }
        if (!safeTextInsert(text)) {
            insertTextFirefox(field, text);
        }
        if (initialFocus === document.body) {
            field.blur();
        }
        else if (initialFocus instanceof HTMLElement && initialFocus !== field) {
            initialFocus.focus();
        }
    }

    function indentSelection(element) {
        var _a;
        const { selectionStart, selectionEnd, value } = element;
        const selectedText = value.slice(selectionStart, selectionEnd);
        const lineBreakCount = (_a = /\n/g.exec(selectedText)) === null || _a === void 0 ? void 0 : _a.length;
        if (lineBreakCount > 0) {
            const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
            const newSelection = element.value.slice(firstLineStart, selectionEnd - 1);
            const indentedText = newSelection.replace(/^|\n/g,
            '$&	');
            const replacementsCount = indentedText.length - newSelection.length;
            element.setSelectionRange(firstLineStart, selectionEnd - 1);
            insert(element, indentedText);
            element.setSelectionRange(selectionStart + 1, selectionEnd + replacementsCount);
        }
        else {
            insert(element, '	');
        }
    }
    function findLineEnd(value, currentEnd) {
        const lastLineStart = value.lastIndexOf('\n', currentEnd - 1) + 1;
        if (value.charAt(lastLineStart) !== '	') {
            return currentEnd;
        }
        return lastLineStart + 1;
    }
    function unindentSelection(element) {
        const { selectionStart, selectionEnd, value } = element;
        const firstLineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const minimumSelectionEnd = findLineEnd(value, selectionEnd);
        const newSelection = element.value.slice(firstLineStart, minimumSelectionEnd);
        const indentedText = newSelection.replace(/(^|\n)(	| {1,2})/g, '$1');
        const replacementsCount = newSelection.length - indentedText.length;
        element.setSelectionRange(firstLineStart, minimumSelectionEnd);
        insert(element, indentedText);
        const firstLineIndentation = /	| {1,2}/.exec(value.slice(firstLineStart, selectionStart));
        const difference = firstLineIndentation
            ? firstLineIndentation[0].length
            : 0;
        const newSelectionStart = selectionStart - difference;
        element.setSelectionRange(selectionStart - difference, Math.max(newSelectionStart, selectionEnd - replacementsCount));
    }
    function tabToIndentListener(event) {
        if (event.defaultPrevented
            || event.metaKey
            || event.altKey
            || event.ctrlKey) {
            return;
        }
        const textarea = event.target;
        if (event.key === 'Tab') {
            if (event.shiftKey) {
                unindentSelection(textarea);
            }
            else {
                indentSelection(textarea);
            }
            event.preventDefault();
            event.stopImmediatePropagation();
        }
        else if (event.key === 'Escape'
            && !event.shiftKey) {
            textarea.blur();
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }
    function enableTabToIndent(elements, signal) {
        if (typeof elements === 'string') {
            elements = document.querySelectorAll(elements);
        }
        else if (elements instanceof HTMLTextAreaElement) {
            elements = [elements];
        }
        for (const element of elements) {
            element.addEventListener('keydown', tabToIndentListener, { signal });
        }
    }
    const indent = indentSelection;
    const unindent = unindentSelection;
    const eventHandler = tabToIndentListener;
    const watch = enableTabToIndent;

    exports.enableTabToIndent = enableTabToIndent;
    exports.eventHandler = eventHandler;
    exports.indent = indent;
    exports.indentSelection = indentSelection;
    exports.tabToIndentListener = tabToIndentListener;
    exports.unindent = unindent;
    exports.unindentSelection = unindentSelection;
    exports.watch = watch;

    Object.defineProperty(exports, '__esModule', { value: true });

}(this.window = this.window || {}));
