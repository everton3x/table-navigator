/**
 * @class TableNavigator
 * Enables keyboard navigation and row marking in an HTML table.
 */
class TableNavigator {
    /**
     * @constructor
     * @param {string} tableId - The ID of the HTML table element.
     * @param {string} selectedCls - A space-separated string of class names to apply to the selected row.
     * @param {string} markedCls - A space-separated string of class names to apply to marked rows.
     */
    constructor(tableId, selectedCls, markedCls) {
        /**
         * @type {HTMLTableElement}
         * Reference to the HTML table element.
         */
        this.table = document.getElementById(tableId);

        /**
         * @type {Array<HTMLTableRowElement>}
         * An array of the rows in the HTML table.
         */
        this.rows = Array.from(this.table.tBodies[0].rows);

        /**
         * @type {number}
         * The index of the currently selected row.
         */
        this.selectedIndex = 0;

        /**
         * @type {number}
         * The index of the last marked row. Used for range marking.
         */
        this.lastMarkedIndex = -1;

        /**
         * @type {Array<string>}
         * An array of CSS classes to apply to the selected row.
         */
        this.selectedCls = selectedCls.split(' ');

        /**
         * @type {Array<string>}
         * An array of CSS classes to apply to marked rows.
         */
        this.markedCls = markedCls.split(' ');

        this.initialize();
    }

    /**
     * Initializes the TableNavigator by setting up rows, adding event listeners, and selecting the first row.
     * @function initialize
     * @memberof TableNavigator
     */
    initialize() {
        // Initial setup for rows
        this.rows.forEach((row, index) => {
            row.dataset.index = index;
            row.tabIndex = -1;
            row.dataset.marked = 'false';
            row.classList.remove(...this.markedCls);
            row.classList.remove(...this.selectedCls);
        });

        // Event listeners
        this.table.addEventListener('keydown', this.handleKeyDown.bind(this));
        this.table.addEventListener('click', this.handleClick.bind(this));

        // Select the first row
        this.updateNavigation();
    }

    /**
     * Handles keydown events on the table.
     * @function handleKeyDown
     * @memberof TableNavigator
     * @param {KeyboardEvent} e - The keyboard event object.
     */
    handleKeyDown(e) {
        const { key, shiftKey, ctrlKey } = e;
        const isNavigationKey = ['ArrowUp', 'ArrowDown'].includes(key);

        if (isNavigationKey) {
            e.preventDefault();
            this.handleNavigation(key);
        }

        if (key === ' ') {
            e.preventDefault();
            this.handleMarking(shiftKey, ctrlKey);
        }
    }

    /**
     * Handles click events on the table.
     * @function handleClick
     * @memberof TableNavigator
     * @param {MouseEvent} e - The mouse event object.
     */
    handleClick(e) {
        const row = e.target.closest('tr');
        if (!row || row === undefined) return;

        const index = parseInt(row.dataset.index);
        this.selectedIndex = index;
        this.updateNavigation();
        this.handleMarking(e.shiftKey, e.ctrlKey || e.metaKey);
    }

    /**
     * Handles navigation up and down in the table.
     * @function handleNavigation
     * @memberof TableNavigator
     * @param {string} key - The pressed key ('ArrowUp' or 'ArrowDown').
     */
    handleNavigation(key) {
        const newIndex = key === 'ArrowUp'
            ? Math.max(0, this.selectedIndex - 1)
            : Math.min(this.rows.length - 1, this.selectedIndex + 1);

        this.selectedIndex = newIndex;
        this.updateNavigation();
    }

    /**
     * Handles marking rows based on modifier keys (Shift, Ctrl).
     * @function handleMarking
     * @memberof TableNavigator
     * @param {boolean} shiftKey - Indicates if the Shift key is pressed.
     * @param {boolean} ctrlKey - Indicates if the Ctrl key is pressed.
     */
    handleMarking(shiftKey, ctrlKey) {
        const currentRow = this.rows[this.selectedIndex];

        if (shiftKey) {
            this.markRange(currentRow);
        } else if (ctrlKey) {
            this.toggleMark(currentRow);
        } else {
            this.markSingle(currentRow);
        }
    }

    /**
     * Marks a single row and clears all other marks.
     * @function markSingle
     * @memberof TableNavigator
     * @param {HTMLTableRowElement} row - The row to be marked.
     */
    markSingle(row) {
        this.clearAllMarks();
        this.toggleMark(row);
    }

    /**
     * Marks a range of rows from the last marked row to the current one.
     * @function markRange
     * @memberof TableNavigator
     * @param {HTMLTableRowElement} endRow - The final row in the range to be marked.
     */
    markRange(endRow) {
        if (this.lastMarkedIndex === -1) {
            this.toggleMark(endRow);
            return;
        }

        const start = Math.min(this.lastMarkedIndex, endRow.dataset.index);
        const end = Math.max(this.lastMarkedIndex, endRow.dataset.index);

        this.rows.slice(start, end + 1).forEach(row => {
            row.dataset.marked = 'true';
            this.addCls(row, this.markedCls);
        });

        this.lastMarkedIndex = parseInt(endRow.dataset.index);
    }

    /**
     * Toggles the marked state of a row.
     * @function toggleMark
     * @memberof TableNavigator
     * @param {HTMLTableRowElement} row - The row to be toggled.
     */
    toggleMark(row) {
        if (row === undefined) return;

        const isMarked = row.dataset.marked === 'true';

        row.dataset.marked = (!isMarked).toString();

        // Toggle classes for marking/unmarking
        this.markedCls.forEach(cls => row.classList.toggle(cls, !isMarked));

        // Update last marked index accordingly
        this.lastMarkedIndex = isMarked ? -1 : parseInt(row.dataset.index);
    }

    /**
     * Clears all marks from all rows.
     * @function clearAllMarks
     * @memberof TableNavigator
     */
    clearAllMarks() {
        this.rows.forEach(row => {
            row.dataset.marked = 'false';
            this.removeCls(row, this.markedCls);
        });
    }

    /**
     * Adds one or more CSS classes to an element.
     * @function addCls
     * @memberof TableNavigator
     * @param {HTMLElement} el - The element to which classes will be added.
     * @param {Array<string>} clsList - An array of class names to be added.
     */
    addCls(el, clsList) {
        clsList.forEach(cls => el.classList.add(cls));
    }

    /**
     * Removes one or more CSS classes from an element.
     * @function removeCls
     * @memberof TableNavigator
     * @param {HTMLElement} el - The element from which classes will be removed.
     * @param {Array<string>} clsList - An array of class names to be removed.
     */
    removeCls(el, clsList) {
        clsList.forEach(cls => el.classList.remove(cls));
    }

    /**
     * Updates visual navigation by highlighting the selected row and scrolling it into view.
     * @function updateNavigation
     * @memberof TableNavigator
     */
    updateNavigation() {
        // Remove selected class from all rows first
        this.rows.forEach(row => this.removeCls(row, this.selectedCls));

        if (this.rows === undefined ||
            this.selectedIndex === undefined ||
            this.rows[this.selectedIndex] === undefined) return;


        // Add selected class to currently selected row and scroll it into view
        this.addCls(this.rows[this.selectedIndex], this.selectedCls);
        this.rows[this.selectedIndex].scrollIntoView({ block: 'nearest' });


    }
}