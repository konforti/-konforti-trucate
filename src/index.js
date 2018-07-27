
// @flow

import type {
    WrapperElement,
    LongText,
    Lines,
    TruncFrom,
    Ellipsis,
    WrapperOffset,
} from './types.js';

const truncate = (
    element: WrapperElement,
    longText: LongText = '',
    lines?: Lines = 1,
    truncFrom?: TruncFrom = 'end',
    ellipsis?: Ellipsis = '...',
    wrapperOffset?: WrapperOffset = 5
): Object => {
    // Just to make sure it does not mutate.
    const originalText: string = longText;

    // Make sure the innerHTML is the original.
    // Important for revaluation.
    element.innerHTML = originalText;

    const textHeight: number = getTextHeight(lines);
    const maxLength: number = originalText.length;
    let lastIndex: number = originalText.length;
    let firstIndex: number = 0;
    let secondIndex: number = Math.floor(lastIndex / 2);
    let thirdIndex: number = Math.floor(lastIndex / 2) + 1;

    /**
     * Return the wrapper element height.
     */
    const wrapperHeight = (): number =>
        Math.max(
            element.scrollHeight,
            element.offsetHeight,
            element.clientHeight
        ) - wrapperOffset;

    /**
     * Return the current style for an element.
     */
    function computeStyle(element: HTMLElement, prop: string): string {
        // TODO: workaround https://bugzilla.mozilla.org/show_bug.cgi?id=548397
        return window.getComputedStyle(element, null).getPropertyValue(prop);
    }

    /**
     * Returns the line-height of an element as an integer.
     */
    function getLineHeight(element: HTMLElement): number {
        const lh = computeStyle(element, 'line-height');
        return lh === 'normal'
            ? // Handle line-height: normal case
              parseInt(computeStyle(element, 'font-size')) * 1.2
            : // Regular px case.
              parseInt(lh);
    }

    /**
     * Returns the maximum height a given element should have based on the line-
     * height of the text and the given lines value.
     */
    function getTextHeight(lines: number): number {
        const lineHeight = getLineHeight(element);
        return lineHeight * lines;
    }

    /**
     * Update the innerHTML based on current indexes.
     */
    function updateDOM(): void {
        element.innerHTML =
            originalText.slice(firstIndex, lastIndex) + ellipsis;
    }

    /**
     * Update the innerHTML based on current indexes.
     */
    function updateDOMRev(): void {
        element.innerHTML =
            ellipsis + originalText.slice(firstIndex, lastIndex);
    }

    /**
     * Concat strings and update the innerHTML based on current indexes.
     */
    function updateDOMPlus(): void {
        const startString = originalText.slice(firstIndex, secondIndex);
        const endString = originalText.slice(thirdIndex, lastIndex);
        element.innerHTML = startString + endString;
    }

    /**
     * Handle truncate from the end of the text.
     */
    function truncFromEnd(): string {
        // First, try to fit by divide the string by half repeatedly.
        while (lastIndex > firstIndex && wrapperHeight() >= textHeight) {
            lastIndex = Math.floor(lastIndex / 2);
            updateDOM();
        }

        // Then, We increase char by char to fit the maximum chars.
        while (wrapperHeight() <= textHeight && lastIndex <= maxLength) {
            lastIndex++;
            updateDOM();
        }

        lastIndex -= 2;
        updateDOM();

        element.innerHTML = element.innerHTML || '';
        return element.innerHTML;
    }

    /**
     * Handle truncate from the start of the text.
     */
    function truncFromStart(): string {
        // First, try to fit by divide the string by half repeatedly.
        while (lastIndex > firstIndex && wrapperHeight() >= textHeight) {
            firstIndex = Math.ceil((lastIndex + firstIndex) / 2);
            updateDOMRev();
        }

        // Then, We increase char by char to fit the maximum chars.
        while (wrapperHeight() <= textHeight && firstIndex > 0) {
            firstIndex--;
            updateDOMRev();
        }

        firstIndex += 2;
        updateDOMRev();

        element.innerHTML = element.innerHTML || '';
        return element.innerHTML;
    }

    /**
     * Handle truncate from in the middle of the text.
     */
    function truncFromMiddle(): string {
        // First, try to fit by divide the string by half repeatedly.
        while (
            lastIndex > firstIndex &&
            secondIndex > firstIndex &&
            lastIndex > thirdIndex &&
            wrapperHeight() >= textHeight
        ) {
            // Cut chars from the middle.
            secondIndex = Math.floor(secondIndex / 2);
            thirdIndex = Math.ceil((lastIndex + thirdIndex) / 2);
            updateDOMPlus();
        }

        // Then, We increase char by char to fit the maximum chars.
        let n = 0;
        while (wrapperHeight() <= textHeight && secondIndex <= maxLength) {
            // Once from left and once from right.
            n % 2 === 0 ? secondIndex++ : thirdIndex--;
            updateDOMPlus();
            n++;
        }

        // Fix length by revert one char.
        n % 2 !== 0 ? secondIndex-- : thirdIndex++;

        // Set room for ellipsis.
        secondIndex -= Math.ceil(ellipsis.length / 2);
        thirdIndex += Math.floor(ellipsis.length / 2);

        updateDOMPlus();

        const startString = originalText.slice(firstIndex, secondIndex);
        const endString = originalText.slice(thirdIndex, lastIndex);

        element.innerHTML = element.innerHTML || '';
        element.innerHTML = startString + ellipsis + endString;

        return element.innerHTML;
    }

    const processors = {
        end: truncFromEnd,
        start: truncFromStart,
        middle: truncFromMiddle,
    };

    const finalText =
        wrapperHeight() > textHeight ? processors[truncFrom]() : originalText;

    const ret = {
        text: finalText,
        truncated: finalText !== originalText,
    };

    return ret;
};

export default truncate;