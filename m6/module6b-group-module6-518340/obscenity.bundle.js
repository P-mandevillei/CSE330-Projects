/*!
 * This file contains code from the "obscenity" npm package.
 * Obscenity: https://www.npmjs.com/package/obscenity
 * Copyright (c) Joe L.
 * Licensed under MIT
 */

require=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomCharFromSetCensorStrategy = exports.fixedCharCensorStrategy = exports.fixedPhraseCensorStrategy = exports.grawlixCensorStrategy = exports.asteriskCensorStrategy = exports.keepEndCensorStrategy = exports.keepStartCensorStrategy = void 0;
const Char_1 = require("../util/Char");
/**
 * A text censoring strategy that extends another strategy, adding the first
 * character matched at the start of the generated string.
 *
 * @example
 * ```typescript
 * const strategy = keepStartCensorStrategy(grawlixCensorStrategy());
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: 'f$@* you'
 * ```
 * @example
 * ```typescript
 * // Since keepEndCensorStrategy() returns another text censoring strategy, you can use it
 * // as the base strategy to pass to keepStartCensorStrategy().
 * const strategy = keepStartCensorStrategy(keepEndCensorStrategy(asteriskCensorStrategy()));
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: 'f**k you'
 * ```
 * @param baseStrategy - Strategy to extend. It will be used to produce the end of
 * the generated string.
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
function keepStartCensorStrategy(baseStrategy) {
    return (ctx) => {
        if (ctx.overlapsAtStart)
            return baseStrategy(ctx);
        const firstChar = String.fromCodePoint(ctx.input.codePointAt(ctx.startIndex));
        return firstChar + baseStrategy({ ...ctx, matchLength: ctx.matchLength - 1 });
    };
}
exports.keepStartCensorStrategy = keepStartCensorStrategy;
/**
 * A text censoring strategy that extends another strategy, adding the last
 * character matched at the end of the generated string.
 *
 * @example
 * ```typescript
 * const strategy = keepEndCensorStrategy(asteriskCensorStrategy());
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: '***k you'
 * ```
 * @param baseStrategy - Strategy to extend. It will be used to produce the start
 * of the generated string.
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
function keepEndCensorStrategy(baseStrategy) {
    return (ctx) => {
        if (ctx.overlapsAtEnd)
            return baseStrategy(ctx);
        const lastChar = String.fromCodePoint(ctx.input.codePointAt(ctx.endIndex));
        return baseStrategy({ ...ctx, matchLength: ctx.matchLength - 1 }) + lastChar;
    };
}
exports.keepEndCensorStrategy = keepEndCensorStrategy;
/**
 * A text censoring strategy that generates strings made up of asterisks (`*`).
 *
 * @example
 * ```typescript
 * const strategy = asteriskCensorStrategy();
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: '**** you'
 * ```
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
function asteriskCensorStrategy() {
    return fixedCharCensorStrategy('*');
}
exports.asteriskCensorStrategy = asteriskCensorStrategy;
/**
 * A text censoring strategy that generates
 * [grawlix](https://www.merriam-webster.com/words-at-play/grawlix-symbols-swearing-comic-strips),
 * i.e. strings that contain the characters `%`, `@`, `$`, `&`, and `*`.
 *
 * @example
 * ```typescript
 * const strategy = grawlixCensorStrategy();
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: '%@&* you'
 * ```
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
function grawlixCensorStrategy() {
    return randomCharFromSetCensorStrategy('%@$&*');
}
exports.grawlixCensorStrategy = grawlixCensorStrategy;
/**
 * A text censoring strategy that returns a fixed string.
 *
 * @example
 * ```typescript
 * // The replacement phrase '' effectively removes all matched regions
 * // from the string.
 * const strategy = fixedPhraseCensorStrategy('');
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: ' you'
 * ```
 * @example
 * ```typescript
 * const strategy = fixedPhraseCensorStrategy('fudge');
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: 'fudge you'
 * ```
 * @param phrase - Replacement phrase to use.
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
function fixedPhraseCensorStrategy(phrase) {
    return () => phrase;
}
exports.fixedPhraseCensorStrategy = fixedPhraseCensorStrategy;
/**
 * A text censoring strategy that generates replacement strings that are made up
 * of the character given, repeated as many times as needed.
 *
 * @example
 * ```typescript
 * const strategy = fixedCharCensorStrategy('*');
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you'
 * // After: '**** you'.
 * ```
 * @param char - String that represents the code point which should be used when
 * generating the replacement string. Must be exactly one code point in length.
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
function fixedCharCensorStrategy(char) {
    // Make sure the input character is one code point in length.
    (0, Char_1.getAndAssertSingleCodePoint)(char);
    return (ctx) => char.repeat(ctx.matchLength);
}
exports.fixedCharCensorStrategy = fixedCharCensorStrategy;
/**
 * A text censoring strategy that generates replacement strings made up of
 * random characters from the set of characters provided. The strings never
 * contain two of the same character in a row.
 *
 * @example
 * ```typescript
 * const strategy = randomCharFromSetCensorStrategy('$#!');
 * const censor = new TextCensor().setStrategy(strategy);
 * // Before: 'fuck you!'
 * // After: '!#$# you!'
 * ```
 * @param charset - Set of characters from which the replacement string should
 * be constructed. Must have at least two characters.
 * @returns A [[TextCensorStrategy]] for use with the [[TextCensor]].
 */
function randomCharFromSetCensorStrategy(charset) {
    const chars = [...charset];
    if (chars.length < 2)
        throw new Error('The character set passed must have at least 2 characters.');
    return (ctx) => {
        if (ctx.matchLength === 0)
            return '';
        let lastIdx = Math.floor(Math.random() * chars.length);
        let censored = chars[lastIdx];
        for (let i = 1; i < ctx.matchLength; i++) {
            let idx = Math.floor(Math.random() * (chars.length - 1));
            // Transform the distribution for idx from [0, len-1) to
            // [0, lastIdx) ∪ (lastIdx, len) to exclude lastIdx while
            // ensuring a uniform distribution of generated characters.
            if (idx >= lastIdx)
                idx++;
            lastIdx = idx;
            censored += chars[idx];
        }
        return censored;
    };
}
exports.randomCharFromSetCensorStrategy = randomCharFromSetCensorStrategy;

},{"../util/Char":26}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextCensor = void 0;
const MatchPayload_1 = require("../matcher/MatchPayload");
const BuiltinStrategies_1 = require("./BuiltinStrategies");
/**
 * Censors regions of text matched by a [[Matcher]], supporting flexible
 * [[TextCensorStrategy | censoring strategies]].
 */
class TextCensor {
    constructor() {
        this.strategy = (0, BuiltinStrategies_1.grawlixCensorStrategy)();
    }
    /**
     * Sets the censoring strategy, which is responsible for generating
     * replacement text for regions of the text that should be censored.
     *
     * The default censoring strategy is the [[grawlixCensorStrategy]],
     * generating text like `$%@*`. There are several other built-in strategies
     * available:
     * - [[keepStartCensorStrategy]] - extends another strategy and keeps the
     *   first character matched, e.g. `f***`.
     * - [[keepEndCensorStrategy]] - extends another strategy and keeps the last
     *   character matched, e.g. `***k`.
     * - [[asteriskCensorStrategy]] - replaces the text with asterisks, e.g.
     *   `****`.
     * - [[grawlixCensorStrategy]] - the default strategy, discussed earlier.
     *
     * Note that since censoring strategies are just functions (see the
     * documentation for [[TextCensorStrategy]]), it is relatively simple to
     * create your own.
     *
     * To ease creation of common censoring strategies, we provide a number of
     * utility functions:
     * - [[fixedPhraseCensorStrategy]] - generates a fixed phrase, e.g. `fudge`.
     * - [[fixedCharCensorStrategy]] - generates replacement strings constructed
     *   from the character given, repeated as many times as needed.
     * - [[randomCharFromSetCensorStrategy]] - generates replacement strings
     *   made up of random characters from the set of characters provided.
     *
     * @param strategy - Text censoring strategy to use.
     */
    setStrategy(strategy) {
        this.strategy = strategy;
        return this;
    }
    /**
     * Applies the censoring strategy to the text, returning the censored text.
     *
     * **Overlapping regions**
     *
     * Overlapping regions are an annoying edge case to deal with when censoring
     * text. There is no single best way to handle them, but the implementation
     * of this method guarantees that overlapping regions will always be
     * replaced, following the rules below:
     *
     * - Replacement text for matched regions will be generated in the order
     *   specified by [[compareMatchByPositionAndId]];
     * - When generating replacements for regions that overlap at the start with
     *   some other region, the start index of the censor context passed to the
     *   censoring strategy will be the end index of the first region, plus one.
     *
     * @param input - Input text.
     * @param matches - A list of matches.
     * @returns The censored text.
     */
    applyTo(input, matches) {
        if (matches.length === 0)
            return input;
        const sorted = [...matches].sort(MatchPayload_1.compareMatchByPositionAndId);
        let censored = '';
        let lastIndex = 0; // end index of last match, plus one
        for (let i = 0; i < sorted.length; i++) {
            const match = sorted[i];
            if (lastIndex > match.endIndex)
                continue; // completely contained in the previous span
            const overlapsAtStart = match.startIndex < lastIndex;
            // Add the chunk of text between the end of the last match and the
            // start of the current match.
            if (!overlapsAtStart)
                censored += input.slice(lastIndex, match.startIndex);
            const actualStartIndex = Math.max(lastIndex, match.startIndex);
            const overlapsAtEnd = i < sorted.length - 1 && // not the last match
                match.endIndex >= sorted[i + 1].startIndex && // end index of this match and start index of next one overlap
                match.endIndex < sorted[i + 1].endIndex; // doesn't completely contain next match
            censored += this.strategy({ ...match, startIndex: actualStartIndex, input, overlapsAtStart, overlapsAtEnd });
            lastIndex = match.endIndex + 1;
        }
        censored += input.slice(lastIndex);
        return censored;
    }
}
exports.TextCensor = TextCensor;

},{"../matcher/MatchPayload":6,"./BuiltinStrategies":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhraseBuilder = exports.DataSet = void 0;
const BlacklistedTerm_1 = require("../matcher/BlacklistedTerm");
/**
 * Holds phrases (groups of patterns and whitelisted terms), optionally
 * associating metadata with them.
 *
 * @typeParam MetadataType - Metadata type for phrases. Note that the metadata
 * type is implicitly nullable.
 */
class DataSet {
    constructor() {
        this.containers = [];
        this.patternCount = 0;
        this.patternIdToPhraseContainer = new Map(); // pattern ID => index of its container
    }
    /**
     * Adds all the phrases from the dataset provided to this one.
     *
     * @example
     * ```typescript
     * const customDataset = new DataSet().addAll(englishDataset);
     * ```
     * @param other - Other dataset.
     */
    addAll(other) {
        for (const container of other.containers)
            this.registerContainer(container);
        return this;
    }
    /**
     * Removes phrases that match the predicate given.
     *
     * @example
     * ```typescript
     * const customDataset = new DataSet<{ originalWord: string }>()
     * 	.addAll(englishDataset)
     * 	.removePhrasesIf((phrase) => phrase.metadata.originalWord === 'fuck');
     * ```
     * @param predicate - A predicate that determines whether or not a phrase should be removed.
     * Return `true` to remove, `false` to keep.
     */
    removePhrasesIf(predicate) {
        // Clear the internal state, then gradually rebuild it by adding the
        // containers that should be kept.
        this.patternCount = 0;
        this.patternIdToPhraseContainer.clear();
        const containers = this.containers.splice(0);
        for (const container of containers) {
            const remove = predicate(container);
            if (!remove)
                this.registerContainer(container);
        }
        return this;
    }
    /**
     * Adds a phrase to this dataset.
     *
     * @example
     * ```typescript
     * const data = new DataSet<{ originalWord: string }>()
     * 	.addPhrase((phrase) => phrase.setMetadata({ originalWord: 'fuck' })
     * 		.addPattern(pattern`fuck`)
     * 		.addPattern(pattern`f[?]ck`)
     * 		.addWhitelistedTerm('Afck'))
     * 	.build();
     * ```
     * @param fn - A function that takes a [[PhraseBuilder]], adds
     * patterns/whitelisted terms/metadata to it, and returns it.
     */
    addPhrase(fn) {
        const container = fn(new PhraseBuilder()).build();
        this.registerContainer(container);
        return this;
    }
    /**
     * Retrieves the phrase metadata associated with a pattern and returns a
     * copy of the match payload with said metadata attached to it.
     *
     * @example
     * ```typescript
     * const matches = matcher.getAllMatches(input);
     * const matchesWithPhraseMetadata = matches.map((match) => dataset.getPayloadWithPhraseMetadata(match));
     * // Now we can access the 'phraseMetadata' property:
     * const phraseMetadata = matchesWithPhraseMetadata[0].phraseMetadata;
     * ```
     * @param payload - Original match payload.
     */
    getPayloadWithPhraseMetadata(payload) {
        const offset = this.patternIdToPhraseContainer.get(payload.termId);
        if (offset === undefined) {
            throw new Error(`The pattern with ID ${payload.termId} does not exist in this dataset.`);
        }
        return {
            ...payload,
            phraseMetadata: this.containers[offset].metadata,
        };
    }
    /**
     * Returns the dataset in a format suitable for usage with the [[RegExpMatcher]].
     *
     * @example
     * ```typescript
     * // With the RegExpMatcher:
     * const matcher = new RegExpMatcher({
     * 	...dataset.build(),
     * 	// additional options here
     * });
     * ```
     */
    build() {
        return {
            blacklistedTerms: (0, BlacklistedTerm_1.assignIncrementingIds)(this.containers.flatMap((p) => p.patterns)),
            whitelistedTerms: this.containers.flatMap((p) => p.whitelistedTerms),
        };
    }
    registerContainer(container) {
        const offset = this.containers.push(container) - 1;
        for (let i = 0, phraseId = this.patternCount; i < container.patterns.length; i++, phraseId++) {
            this.patternIdToPhraseContainer.set(phraseId, offset);
            this.patternCount++;
        }
    }
}
exports.DataSet = DataSet;
/**
 * Builder for phrases.
 */
class PhraseBuilder {
    constructor() {
        this.patterns = [];
        this.whitelistedTerms = [];
    }
    /**
     * Associates a pattern with this phrase.
     *
     * @param pattern - Pattern to add.
     */
    addPattern(pattern) {
        this.patterns.push(pattern);
        return this;
    }
    /**
     * Associates a whitelisted pattern with this phrase.
     *
     * @param term - Whitelisted term to add.
     */
    addWhitelistedTerm(term) {
        this.whitelistedTerms.push(term);
        return this;
    }
    /**
     * Associates some metadata with this phrase.
     *
     * @param metadata - Metadata to use.
     */
    setMetadata(metadata) {
        this.metadata = metadata;
        return this;
    }
    /**
     * Builds the phrase, returning a [[PhraseContainer]] for use with the
     * [[DataSet]].
     */
    build() {
        return {
            patterns: this.patterns,
            whitelistedTerms: this.whitelistedTerms,
            metadata: this.metadata,
        };
    }
}
exports.PhraseBuilder = PhraseBuilder;

},{"../matcher/BlacklistedTerm":4}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignIncrementingIds = void 0;
/**
 * Assigns incrementing IDs to the patterns provided, starting with 0. It is
 * useful if you have a list of patterns to match against but don't care about
 * identifying which pattern matched.
 *
 * @example
 * ```typescript
 * const matcher = new RegExpMatcher({
 *  ...,
 *  blacklistedTerms: assignIncrementingIds([
 *      pattern`f?uck`,
 *      pattern`|shit|`,
 *  ]),
 * });
 * ```
 * @param patterns - List of parsed patterns.
 * @returns A list of blacklisted terms with valid IDs which can then be passed
 * to the [[RegExpMatcher]].
 */
function assignIncrementingIds(patterns) {
    let currentId = 0;
    return patterns.map((pattern) => ({ id: currentId++, pattern }));
}
exports.assignIncrementingIds = assignIncrementingIds;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervalCollection = void 0;
class IntervalCollection {
    constructor() {
        this.dirty = false;
        this.intervals = [];
    }
    insert(lowerBound, upperBound) {
        this.intervals.push([lowerBound, upperBound]);
        this.dirty = true;
    }
    query(lowerBound, upperBound) {
        if (this.intervals.length === 0)
            return false;
        if (this.dirty) {
            this.dirty = false;
            // Sort by lower bound.
            this.intervals.sort(
            /* istanbul ignore next: not possible to write a robust test for this */
            (a, b) => (a[0] < b[0] ? -1 : b[0] < a[0] ? 1 : 0));
        }
        for (const interval of this.intervals) {
            // Since the intervals are sorted by lower bound, if we see an
            // interval with a lower bound greater than the target, we can skip
            // checking all the ones after it as it's impossible that they fully
            // contain the target interval.
            if (interval[0] > lowerBound)
                break;
            if (interval[0] <= lowerBound && upperBound <= interval[1])
                return true;
        }
        return false;
    }
    values() {
        return this.intervals.values();
    }
    [Symbol.iterator]() {
        return this.values();
    }
}
exports.IntervalCollection = IntervalCollection;

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareMatchByPositionAndId = void 0;
const Interval_1 = require("../util/Interval");
/**
 * Compares two match payloads.
 *
 * If the first match payload's start index is less than the second's, `-1` is
 *   returned;
 * If the second match payload's start index is less than the first's, `1` is
 *   returned;
 * If the first match payload's end index is less than the second's, `-1` is
 *   returned;
 * If the second match payload's end index is less than the first's, `1` is
 *   returned;
 * If the first match payload's term ID is less than the second's, `-1` is
 *   returned;
 * If the first match payload's term ID is equal to the second's, `0` is
 *   returned;
 * Otherwise, `1` is returned.
 *
 * @param a - First match payload.
 * @param b - Second match payload.
 * @returns The result of the comparison: -1 if the first should sort lower than
 * the second, 0 if they are the same, and 1 if the second should sort lower
 * than the first.
 */
function compareMatchByPositionAndId(a, b) {
    const result = (0, Interval_1.compareIntervals)(a.startIndex, a.endIndex, b.startIndex, b.endIndex);
    if (result !== 0)
        return result;
    return a.termId === b.termId ? 0 : a.termId < b.termId ? -1 : 1;
}
exports.compareMatchByPositionAndId = compareMatchByPositionAndId;

},{"../util/Interval":28}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegExpMatcher = void 0;
const Char_1 = require("../../util/Char");
const Util_1 = require("../../pattern/Util");
const TransformerSet_1 = require("../../transformer/TransformerSet");
const CharacterIterator_1 = require("../../util/CharacterIterator");
const IntervalCollection_1 = require("../IntervalCollection");
const MatchPayload_1 = require("../MatchPayload");
/**
 * An implementation of the [[Matcher]] interface using regular expressions and
 * string searching methods.
 */
class RegExpMatcher {
    /**
     * Creates a new [[RegExpMatcher]] with the options given.
     *
     * @example
     * ```typescript
     * // Use the options provided by the English preset.
     * const matcher = new RegExpMatcher({
     * 	...englishDataset.build(),
     * 	...englishRecommendedTransformers,
     * });
     * ```
     * @example
     * ```typescript
     * // Simple matcher that only has blacklisted patterns.
     * const matcher = new RegExpMatcher({
     *  blacklistedTerms: assignIncrementingIds([
     *      pattern`fuck`,
     *      pattern`f?uck`, // wildcards (?)
     *      pattern`bitch`,
     *      pattern`b[i]tch` // optionals ([i] matches either "i" or "")
     *  ]),
     * });
     *
     * // Check whether some string matches any of the patterns.
     * const doesMatch = matcher.hasMatch('fuck you bitch');
     * ```
     * @example
     * ```typescript
     * // A more advanced example, with transformers and whitelisted terms.
     * const matcher = new RegExpMatcher({
     *  blacklistedTerms: [
     *      { id: 1, pattern: pattern`penis` },
     *      { id: 2, pattern: pattern`fuck` },
     *  ],
     *  whitelistedTerms: ['pen is'],
     *  blacklistMatcherTransformers: [
     *      resolveConfusablesTransformer(), // '🅰' => 'a'
     *      resolveLeetSpeakTransformer(), // '$' => 's'
     *      foldAsciiCharCaseTransformer(), // case insensitive matching
     *      skipNonAlphabeticTransformer(), // 'f.u...c.k' => 'fuck'
     *      collapseDuplicatesTransformer(), // 'aaaa' => 'a'
     *  ],
     * });
     *
     * // Output all matches.
     * console.log(matcher.getAllMatches('fu.....uuuuCK the pen is mightier than the sword!'));
     * ```
     * @param options - Options to use.
     */
    constructor({ blacklistedTerms, whitelistedTerms = [], blacklistMatcherTransformers = [], whitelistMatcherTransformers = [], }) {
        this.blacklistedTerms = this.compileTerms(blacklistedTerms);
        this.validateWhitelistedTerms(whitelistedTerms);
        this.whitelistedTerms = whitelistedTerms;
        this.blacklistMatcherTransformers = new TransformerSet_1.TransformerSet(blacklistMatcherTransformers);
        this.whitelistMatcherTransformers = new TransformerSet_1.TransformerSet(whitelistMatcherTransformers);
    }
    getAllMatches(input, sorted = false) {
        const whitelistedIntervals = this.getWhitelistedIntervals(input);
        const [transformedToOrigIndex, transformed] = this.applyTransformers(input, this.blacklistMatcherTransformers);
        const matches = [];
        for (const blacklistedTerm of this.blacklistedTerms) {
            for (const match of transformed.matchAll(blacklistedTerm.regExp)) {
                const origStartIndex = transformedToOrigIndex[match.index];
                let origEndIndex = transformedToOrigIndex[match.index + match[0].length - 1];
                // End index is (unfortunately) inclusive, so adjust as necessary.
                if (origEndIndex < input.length - 1 && // not the last character
                    (0, Char_1.isHighSurrogate)(input.charCodeAt(origEndIndex)) && // character is a high surrogate
                    (0, Char_1.isLowSurrogate)(input.charCodeAt(origEndIndex + 1)) // next character is a low surrogate
                ) {
                    origEndIndex++;
                }
                if (!whitelistedIntervals.query(origStartIndex, origEndIndex)) {
                    matches.push({
                        termId: blacklistedTerm.id,
                        startIndex: origStartIndex,
                        endIndex: origEndIndex,
                        matchLength: [...match[0]].length,
                    });
                }
            }
        }
        if (sorted)
            matches.sort(MatchPayload_1.compareMatchByPositionAndId);
        return matches;
    }
    hasMatch(input) {
        const whitelistedIntervals = this.getWhitelistedIntervals(input);
        const [transformedToOrigIndex, transformed] = this.applyTransformers(input, this.blacklistMatcherTransformers);
        for (const blacklistedTerm of this.blacklistedTerms) {
            for (const match of transformed.matchAll(blacklistedTerm.regExp)) {
                const origStartIndex = transformedToOrigIndex[match.index];
                let origEndIndex = transformedToOrigIndex[match.index + match[0].length - 1];
                // End index is (unfortunately) inclusive, so adjust as necessary.
                if (origEndIndex < input.length - 1 && // not the last character
                    (0, Char_1.isHighSurrogate)(input.charCodeAt(origEndIndex)) && // character is a high surrogate
                    (0, Char_1.isLowSurrogate)(input.charCodeAt(origEndIndex + 1)) // next character is a low surrogate
                ) {
                    origEndIndex++;
                }
                if (!whitelistedIntervals.query(origStartIndex, origEndIndex))
                    return true;
            }
        }
        return false;
    }
    getWhitelistedIntervals(input) {
        const matches = new IntervalCollection_1.IntervalCollection();
        const [transformedToOrigIndex, transformed] = this.applyTransformers(input, this.whitelistMatcherTransformers);
        for (const whitelistedTerm of this.whitelistedTerms) {
            let lastEnd = 0;
            for (let startIndex = transformed.indexOf(whitelistedTerm, lastEnd); startIndex !== -1; startIndex = transformed.indexOf(whitelistedTerm, lastEnd)) {
                let origEndIndex = transformedToOrigIndex[startIndex + whitelistedTerm.length - 1];
                // End index is (unfortunately) inclusive, so adjust as necessary.
                if (origEndIndex < input.length - 1 && // not the last character
                    (0, Char_1.isHighSurrogate)(input.charCodeAt(origEndIndex)) && // character is a high surrogate
                    (0, Char_1.isLowSurrogate)(input.charCodeAt(origEndIndex + 1)) // next character is a low surrogate
                ) {
                    origEndIndex++;
                }
                matches.insert(transformedToOrigIndex[startIndex], origEndIndex);
                lastEnd = startIndex + whitelistedTerm.length;
            }
        }
        return matches;
    }
    applyTransformers(input, transformers) {
        const transformedToOrigIndex = [];
        let transformed = '';
        const iter = new CharacterIterator_1.CharacterIterator(input);
        for (const char of iter) {
            const transformedChar = transformers.applyTo(char);
            if (transformedChar !== undefined) {
                transformed += String.fromCodePoint(transformedChar);
                while (transformedToOrigIndex.length < transformed.length)
                    transformedToOrigIndex.push(iter.position);
            }
        }
        transformers.resetAll();
        return [transformedToOrigIndex, transformed];
    }
    compileTerms(terms) {
        const compiled = [];
        const seenIds = new Set();
        for (const term of terms) {
            if (seenIds.has(term.id))
                throw new Error(`Duplicate blacklisted term ID ${term.id}.`);
            if ((0, Util_1.potentiallyMatchesEmptyString)(term.pattern)) {
                throw new Error(`Pattern with ID ${term.id} potentially matches empty string; this is unsupported.`);
            }
            compiled.push({
                id: term.id,
                regExp: (0, Util_1.compilePatternToRegExp)(term.pattern),
            });
            seenIds.add(term.id);
        }
        return compiled;
    }
    validateWhitelistedTerms(whitelist) {
        if (whitelist.some((term) => term.length === 0)) {
            throw new Error('Whitelisted term set contains empty string; this is unsupported.');
        }
    }
}
exports.RegExpMatcher = RegExpMatcher;

},{"../../pattern/Util":13,"../../transformer/TransformerSet":15,"../../util/Char":26,"../../util/CharacterIterator":27,"../IntervalCollection":5,"../MatchPayload":6}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyntaxKind = void 0;
/**
 * An enumeration of the kinds of nodes there are.
 */
var SyntaxKind;
(function (SyntaxKind) {
    SyntaxKind[SyntaxKind["Optional"] = 0] = "Optional";
    SyntaxKind[SyntaxKind["Wildcard"] = 1] = "Wildcard";
    SyntaxKind[SyntaxKind["Literal"] = 2] = "Literal";
    SyntaxKind[SyntaxKind["BoundaryAssertion"] = 3] = "BoundaryAssertion";
})(SyntaxKind || (exports.SyntaxKind = SyntaxKind = {}));

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const Char_1 = require("../util/Char");
const CharacterIterator_1 = require("../util/CharacterIterator");
const Nodes_1 = require("./Nodes");
const ParserError_1 = require("./ParserError");
const supportsEscaping = [
    92 /* CharacterCode.Backslash */,
    91 /* CharacterCode.LeftSquareBracket */,
    93 /* CharacterCode.RightSquareBracket */,
    63 /* CharacterCode.QuestionMark */,
    124 /* CharacterCode.VerticalBar */,
];
const supportsEscapingList = supportsEscaping.map((char) => `'${String.fromCodePoint(char)}'`).join(', ');
const eof = -1;
class Parser {
    constructor() {
        this.input = '';
        this.line = 1;
        this.column = 1;
        this.position = 0;
        this.lastColumn = 1;
        this.lastWidth = 0;
    }
    parse(input) {
        this.setInput(input);
        const nodes = [];
        const firstNode = this.nextNode();
        const requireWordBoundaryAtStart = firstNode?.kind === Nodes_1.SyntaxKind.BoundaryAssertion;
        if (firstNode && !requireWordBoundaryAtStart)
            nodes.push(firstNode);
        let requireWordBoundaryAtEnd = false;
        while (!this.done) {
            const pos = this.mark();
            const node = this.nextNode();
            if (node.kind !== Nodes_1.SyntaxKind.BoundaryAssertion) {
                nodes.push(node);
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!this.done) {
                this.reportError('Boundary assertions are not supported in this position; they are only allowed at the start / end of the pattern.', pos);
            }
            requireWordBoundaryAtEnd = true;
        }
        return { requireWordBoundaryAtStart, requireWordBoundaryAtEnd, nodes };
    }
    setInput(input) {
        this.input = input;
        this.line = 1;
        this.column = 1;
        this.position = 0;
        this.lastColumn = 1;
        this.lastWidth = 0;
        return this;
    }
    nextNode() {
        switch (this.peek()) {
            case eof:
                return undefined;
            case 91 /* CharacterCode.LeftSquareBracket */:
                return this.parseOptional();
            case 93 /* CharacterCode.RightSquareBracket */:
                this.reportError(`Unexpected ']' with no corresponding '['.`);
            // eslint-disable-next-line no-fallthrough
            case 63 /* CharacterCode.QuestionMark */:
                return this.parseWildcard();
            case 124 /* CharacterCode.VerticalBar */:
                return this.parseBoundaryAssertion();
            default:
                return this.parseLiteral();
        }
    }
    get done() {
        return this.position >= this.input.length;
    }
    // Optional ::= '[' Wildcard | Text ']'
    parseOptional() {
        const preOpenBracketPos = this.mark();
        this.next(); // '['
        const postOpenBracketPos = this.mark();
        if (this.done)
            this.reportError("Unexpected unclosed '['.", preOpenBracketPos);
        if (this.accept('['))
            this.reportError('Unexpected nested optional node.', postOpenBracketPos);
        const childNode = this.nextNode();
        if (childNode.kind === Nodes_1.SyntaxKind.BoundaryAssertion) {
            this.reportError('Boundary assertions are not supported in this position; they are only allowed at the start / end of the pattern.', postOpenBracketPos);
        }
        if (!this.accept(']'))
            this.reportError("Unexpected unclosed '['.");
        return { kind: Nodes_1.SyntaxKind.Optional, childNode: childNode };
    }
    // Wildcard ::= '?'
    parseWildcard() {
        this.next(); // '?'
        return { kind: Nodes_1.SyntaxKind.Wildcard };
    }
    // BoundaryAssertion ::= '|'
    parseBoundaryAssertion() {
        this.next(); // '|'
        return { kind: Nodes_1.SyntaxKind.BoundaryAssertion };
    }
    // Literal              ::= (NON_SPECIAL | '\' SUPPORTS_ESCAPING)+
    // NON_SPECIAL         ::= _any character other than '\', '?', '[', ']', or '|'_
    // SUPPORTS_ESCAPING   ::= '\' | '[' | ']' | '?' | '|'
    parseLiteral() {
        const chars = [];
        while (!this.done) {
            if (this.accept('[]?|')) {
                this.backup();
                break;
            }
            const next = this.next();
            if (next === 92 /* CharacterCode.Backslash */) {
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (this.done) {
                    this.backup();
                    this.reportError('Unexpected trailing backslash.');
                }
                // Can we escape the next character?
                const escaped = this.next();
                if (!supportsEscaping.includes(escaped)) {
                    const repr = String.fromCodePoint(escaped);
                    this.backup();
                    this.reportError(`Cannot escape character '${repr}'; the only characters that can be escaped are the following: ${supportsEscapingList}.`);
                }
                chars.push(escaped);
            }
            else {
                chars.push(next);
            }
        }
        return { kind: Nodes_1.SyntaxKind.Literal, chars };
    }
    reportError(message, { line = this.line, column = this.column } = {}) {
        throw new ParserError_1.ParserError(message, line, column);
    }
    // Marks the current position.
    mark() {
        return { line: this.line, column: this.column };
    }
    // Accepts any code point in the charset provided. Iff accepted, the character is consumed.
    accept(charset) {
        const next = this.next();
        const iter = new CharacterIterator_1.CharacterIterator(charset);
        for (const char of iter) {
            if (char === next)
                return true;
        }
        this.backup();
        return false;
    }
    // Reads one code point from the input, without consuming it.
    peek() {
        const next = this.next();
        this.backup();
        return next;
    }
    // Consumes one code point from the input.
    next() {
        if (this.done)
            return eof;
        const char = this.input.charCodeAt(this.position++);
        this.lastWidth = 1;
        if (char === 10 /* CharacterCode.Newline */) {
            this.lastColumn = this.column;
            this.column = 1;
            this.line++;
            return char;
        }
        this.lastColumn = this.column++;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!(0, Char_1.isHighSurrogate)(char) || this.done)
            return char;
        // Do we have a surrogate pair?
        const next = this.input.charCodeAt(this.position);
        if ((0, Char_1.isLowSurrogate)(next)) {
            this.position++;
            this.lastWidth++;
            return (0, Char_1.convertSurrogatePairToCodePoint)(char, next);
        }
        return char;
    }
    // Steps back one character; can only be called once per call to next().
    backup() {
        this.position -= this.lastWidth;
        this.column = this.lastColumn;
        // Adjust line count if needed.
        if (this.lastWidth === 1 && this.input.charCodeAt(this.position) === 10 /* CharacterCode.Newline */) {
            this.line--;
        }
    }
}
exports.Parser = Parser;

},{"../util/Char":26,"../util/CharacterIterator":27,"./Nodes":9,"./ParserError":11}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserError = void 0;
/**
 * Custom error thrown by the parser when syntactical errors are detected.
 */
class ParserError extends Error {
    constructor(message, line, column) {
        super(`${line}:${column}: ${message}`);
        this.name = 'ParserError';
        this.line = line;
        this.column = column;
    }
}
exports.ParserError = ParserError;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRawPattern = exports.pattern = void 0;
const Parser_1 = require("./Parser");
const parser = new Parser_1.Parser();
/**
 * Parses a pattern, which matches a set of strings; see the `Syntax` section
 * for details. This function is intended to be called as a [template
 * tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates).
 *
 * **Syntax**
 *
 * Generally speaking, in patterns, characters are interpreted literally. That
 * is, they match exactly what they are: `a` matches an `a`, `b` matches a `b`,
 * `;` matches a `;`, and so on.
 *
 * However, there are several constructs that have special meaning:
 *
 * - `[expr]` matches either the empty string or `expr` (an **optional
 *   expression**). `expr` may be a sequence of literal characters or a wildcard
 *   (see below).
 * - `?` matches any character (a **wildcard**).
 * - A `|` at the start or end of the pattern asserts position at a word
 *   boundary (a **word boundary assertion**). If `|` is at the start, it
 *   ensures that the match either starts at the start of the string or a non-
 *   word character preceding it; if it is at the end, it ensures that the match
 *   either ends at the end of the string or a non-word character follows it.
 *
 *   A word character is an lower-case or upper-case ASCII alphabet character or
 *   an ASCII digit.
 * - In a literal, a backslash may be used to **escape** one of the
 *   meta-characters mentioned above so that it does match literally: `\\[`
 *   matches `[`, and does not mark the start of an optional expression.
 *
 *   **Note about escapes**
 *
 *   As this function operates on raw strings, double-escaping backslashes is
 *   not necessary:
 *
 *   ```typescript
 *   // Use this:
 *   const parsed = pattern`hello \[`;
 *   // Don't use this:
 *   const parsed = pattern`hello \\[`;
 *   ```
 *
 * **Examples**
 *
 * - `baz` matches `baz` exactly.
 *
 * - `b\[ar` matches `b[ar` exactly.
 *
 * - `d?ude` matches `d`, then any character, then `ude`. All of the following
 *   strings are matched by this pattern:
 *   - `dyude`
 *   - `d;ude`
 *   - `d!ude`
 *
 * - `h[?]ello` matches either `h`, any character, then `ello` or the literal
 *   string `hello`. The set of strings it matches is equal to the union of the
 *   set of strings that the two patterns `hello` and `h?ello` match. All of the
 *   following strings are matched by this pattern:
 *   - `hello`
 *   - `h!ello`
 *   - `h;ello`
 *
 * - `|foobar|` asserts position at a word boundary, matches the literal string
 *   `foobar`, and asserts position at a word boundary:
 *   - `foobar` matches, as the start and end of string count as word
 *     boundaries;
 *   - `yofoobar` does _not_ match, as `f` is immediately preceded by a word
 *     character;
 *   - `hello foobar bye` matches, as `f` is immediately preceded by a non-word
 *     character, and `r` is immediately followed by a non-word character.
 *
 * **Grammar**
 *
 * ```
 * Pattern  ::= '['? Atom* ']'?
 * Atom     ::= Literal | Wildcard | Optional
 * Optional ::= '[' Literal | Wildcard ']'
 * Literal  ::= (NON_SPECIAL | '\' SUPPORTS_ESCAPING)+
 *
 * NON_SPECIAL       ::= _any character other than '\', '?', '[', ']', or '|'_
 * SUPPORTS_ESCAPING ::= '\' | '[' | ']' | '?' | '|'
 * ```
 *
 * @example
 * ```typescript
 * const parsed = pattern`hello?`; // match "hello", then any character
 * ```
 * @example
 * ```typescript
 * const parsed = pattern`w[o]rld`; // match "wrld" or "world"
 * ```
 * @example
 * ```typescript
 * const parsed = pattern`my initials are \[??\]`; // match "my initials are [", then any two characters, then a "]"
 * ```
 * @returns The parsed pattern, which can then be used with the
 * [[RegExpMatcher]].
 * @throws [[ParserError]] if a syntactical error was detected while parsing the
 * pattern.
 * @see [[parseRawPattern]] if you want to parse a string into a pattern without
 * using a template tag.
 */
function pattern(strings, ...expressions) {
    let result = strings.raw[0];
    for (const [i, expression] of expressions.entries()) {
        result += expression;
        result += strings.raw[i + 1];
    }
    return parser.parse(result);
}
exports.pattern = pattern;
/**
 * Parses a string as a pattern directly.
 *
 * **Note**
 *
 * It is recommended to use the [[pattern | pattern template tag]] instead of
 * this function for literal patterns (i.e. ones without dynamic content).
 *
 * @param pattern - The string to parse.
 * @throws [[ParserError]] if a syntactical error was detected while parsing the
 * pattern.
 * @returns The parsed pattern, which can then be used with the
 * [[RegExpMatcher]].
 */
function parseRawPattern(pattern) {
    return parser.parse(pattern);
}
exports.parseRawPattern = parseRawPattern;

},{"./Parser":10}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegExpStringForNode = exports.compilePatternToRegExp = exports.potentiallyMatchesEmptyString = void 0;
const Nodes_1 = require("./Nodes");
function potentiallyMatchesEmptyString(pattern) {
    return pattern.nodes.every((node) => node.kind === Nodes_1.SyntaxKind.Optional);
}
exports.potentiallyMatchesEmptyString = potentiallyMatchesEmptyString;
function compilePatternToRegExp(pattern) {
    let regExpStr = '';
    if (pattern.requireWordBoundaryAtStart)
        regExpStr += '\\b';
    for (const node of pattern.nodes)
        regExpStr += getRegExpStringForNode(node);
    if (pattern.requireWordBoundaryAtEnd)
        regExpStr += `\\b`;
    return new RegExp(regExpStr, 'gs');
}
exports.compilePatternToRegExp = compilePatternToRegExp;
const regExpSpecialChars = ['[', '.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', '\\', ']'].map((str) => str.charCodeAt(0));
function getRegExpStringForNode(node) {
    switch (node.kind) {
        case Nodes_1.SyntaxKind.Literal: {
            let str = '';
            for (const char of node.chars) {
                if (regExpSpecialChars.includes(char))
                    str += '\\';
                str += String.fromCodePoint(char);
            }
            return str;
        }
        case Nodes_1.SyntaxKind.Optional:
            return `(?:${getRegExpStringForNode(node.childNode)})?`;
        case Nodes_1.SyntaxKind.Wildcard:
            return `.`;
    }
}
exports.getRegExpStringForNode = getRegExpStringForNode;

},{"./Nodes":9}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.englishDataset = exports.englishRecommendedTransformers = exports.englishRecommendedWhitelistMatcherTransformers = exports.englishRecommendedBlacklistMatcherTransformers = void 0;
const DataSet_1 = require("../dataset/DataSet");
const Pattern_1 = require("../pattern/Pattern");
const collapse_duplicates_1 = require("../transformer/collapse-duplicates");
const resolve_confusables_1 = require("../transformer/resolve-confusables");
const resolve_leetspeak_1 = require("../transformer/resolve-leetspeak");
const to_ascii_lowercase_1 = require("../transformer/to-ascii-lowercase");
/**
 * A set of transformers to be used when matching blacklisted patterns with the
 * [[englishDataset | english word dataset]].
 */
exports.englishRecommendedBlacklistMatcherTransformers = [
    (0, resolve_confusables_1.resolveConfusablesTransformer)(),
    (0, resolve_leetspeak_1.resolveLeetSpeakTransformer)(),
    (0, to_ascii_lowercase_1.toAsciiLowerCaseTransformer)(),
    // See #23 and #46.
    // skipNonAlphabeticTransformer(),
    (0, collapse_duplicates_1.collapseDuplicatesTransformer)({
        defaultThreshold: 1,
        customThresholds: new Map([
            ['b', 2],
            ['e', 2],
            ['o', 2],
            ['l', 2],
            ['s', 2],
            ['g', 2], // ni_gg_er
        ]),
    }),
];
/**
 * A set of transformers to be used when matching whitelisted terms with the
 * [[englishDataset | english word dataset]].
 */
exports.englishRecommendedWhitelistMatcherTransformers = [
    (0, to_ascii_lowercase_1.toAsciiLowerCaseTransformer)(),
    (0, collapse_duplicates_1.collapseDuplicatesTransformer)({
        defaultThreshold: Number.POSITIVE_INFINITY,
        customThresholds: new Map([[' ', 1]]), // collapse spaces
    }),
];
/**
 * Recommended transformers to be used with the [[englishDataset | english word
 * dataset]] and the [[RegExpMatcher]].
 */
exports.englishRecommendedTransformers = {
    blacklistMatcherTransformers: exports.englishRecommendedBlacklistMatcherTransformers,
    whitelistMatcherTransformers: exports.englishRecommendedWhitelistMatcherTransformers,
};
/**
 * A dataset of profane English words.
 *
 * @example
 * ```typescript
 * const matcher = new RegExpMatcher({
 * 	...englishDataset.build(),
 * 	...englishRecommendedTransformers,
 * });
 * ```
 * @example
 * ```typescript
 * // Extending the data-set by adding a new word and removing an existing one.
 * const myDataset = new DataSet()
 * 	.addAll(englishDataset)
 * 	.removePhrasesIf((phrase) => phrase.metadata.originalWord === 'vagina')
 * 	.addPhrase((phrase) => phrase.addPattern(pattern`|balls|`));
 * ```
 * @copyright
 * The words are taken from the [cuss](https://github.com/words/cuss) project,
 * with some modifications.
 *
 * ```text
 * (The MIT License)
 *
 * Copyright (c) 2016 Titus Wormer <tituswormer@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * ```
 */
exports.englishDataset = new DataSet_1.DataSet()
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'abo' }).addPattern((0, Pattern_1.pattern) `|ab[b]o[s]|`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'abeed' }).addPattern((0, Pattern_1.pattern) `ab[b]eed`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'africoon' }).addPattern((0, Pattern_1.pattern) `africoon`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'anal' })
    .addPattern((0, Pattern_1.pattern) `|anal`)
    .addWhitelistedTerm('analabos')
    .addWhitelistedTerm('analagous')
    .addWhitelistedTerm('analav')
    .addWhitelistedTerm('analy')
    .addWhitelistedTerm('analog')
    .addWhitelistedTerm('an al')
    .addPattern((0, Pattern_1.pattern) `danal`)
    .addPattern((0, Pattern_1.pattern) `eanal`)
    .addPattern((0, Pattern_1.pattern) `fanal`)
    .addWhitelistedTerm('fan al')
    .addPattern((0, Pattern_1.pattern) `ganal`)
    .addWhitelistedTerm('gan al')
    .addPattern((0, Pattern_1.pattern) `ianal`)
    .addWhitelistedTerm('ian al')
    .addPattern((0, Pattern_1.pattern) `janal`)
    .addWhitelistedTerm('trojan al')
    .addPattern((0, Pattern_1.pattern) `kanal`)
    .addPattern((0, Pattern_1.pattern) `lanal`)
    .addWhitelistedTerm('lan al')
    .addPattern((0, Pattern_1.pattern) `lanal`)
    .addWhitelistedTerm('lan al')
    .addPattern((0, Pattern_1.pattern) `oanal|`)
    .addPattern((0, Pattern_1.pattern) `panal`)
    .addWhitelistedTerm('pan al')
    .addPattern((0, Pattern_1.pattern) `qanal`)
    .addPattern((0, Pattern_1.pattern) `ranal`)
    .addPattern((0, Pattern_1.pattern) `sanal`)
    .addPattern((0, Pattern_1.pattern) `tanal`)
    .addWhitelistedTerm('tan al')
    .addPattern((0, Pattern_1.pattern) `uanal`)
    .addWhitelistedTerm('uan al')
    .addPattern((0, Pattern_1.pattern) `vanal`)
    .addWhitelistedTerm('van al')
    .addPattern((0, Pattern_1.pattern) `wanal`)
    .addPattern((0, Pattern_1.pattern) `xanal`)
    .addWhitelistedTerm('texan al')
    .addPattern((0, Pattern_1.pattern) `yanal`)
    .addPattern((0, Pattern_1.pattern) `zanal`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'anus' })
    .addPattern((0, Pattern_1.pattern) `anus`)
    .addWhitelistedTerm('an us')
    .addWhitelistedTerm('tetanus')
    .addWhitelistedTerm('uranus')
    .addWhitelistedTerm('janus')
    .addWhitelistedTerm('manus'))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'arabush' }).addPattern((0, Pattern_1.pattern) `arab[b]ush`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'arse' })
    .addPattern((0, Pattern_1.pattern) `|ars[s]e`)
    .addWhitelistedTerm('arsen'))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'ass' })
    .addPattern((0, Pattern_1.pattern) `|ass`)
    .addWhitelistedTerm('assa')
    .addWhitelistedTerm('assem')
    .addWhitelistedTerm('assen')
    .addWhitelistedTerm('asser')
    .addWhitelistedTerm('asset')
    .addWhitelistedTerm('assev')
    .addWhitelistedTerm('assi')
    .addWhitelistedTerm('assoc')
    .addWhitelistedTerm('assoi')
    .addWhitelistedTerm('assu'))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'bastard' }).addPattern((0, Pattern_1.pattern) `bas[s]tard`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'bestiality' }).addPattern((0, Pattern_1.pattern) `be[e][a]s[s]tial`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'bitch' })
    .addPattern((0, Pattern_1.pattern) `bitch`)
    .addPattern((0, Pattern_1.pattern) `bich|`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'blowjob' }).addPattern((0, Pattern_1.pattern) `b[b]l[l][o]wj[o]b`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'bollocks' }).addPattern((0, Pattern_1.pattern) `bol[l]ock`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'boob' }).addPattern((0, Pattern_1.pattern) `boob`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'boonga' })
    .addPattern((0, Pattern_1.pattern) `boonga`)
    .addWhitelistedTerm('baboon ga'))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'buttplug' }).addPattern((0, Pattern_1.pattern) `buttplug`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'chingchong' }).addPattern((0, Pattern_1.pattern) `chingchong`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'chink' })
    .addPattern((0, Pattern_1.pattern) `chink`)
    .addWhitelistedTerm('chin k'))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'cock' })
    .addPattern((0, Pattern_1.pattern) `|cock|`)
    .addPattern((0, Pattern_1.pattern) `|cocks`)
    .addPattern((0, Pattern_1.pattern) `|cockp`)
    .addPattern((0, Pattern_1.pattern) `|cocke[e]|`)
    .addWhitelistedTerm('cockney'))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'cuck' })
    .addPattern((0, Pattern_1.pattern) `cuck`)
    .addWhitelistedTerm('cuckoo'))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'cum' })
    .addPattern((0, Pattern_1.pattern) `|cum`)
    .addWhitelistedTerm('cumu')
    .addWhitelistedTerm('cumb'))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'cunt' })
    .addPattern((0, Pattern_1.pattern) `|cunt`)
    .addPattern((0, Pattern_1.pattern) `cunt|`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'deepthroat' })
    .addPattern((0, Pattern_1.pattern) `deepthro[o]at`)
    .addPattern((0, Pattern_1.pattern) `deepthro[o]t`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'dick' })
    .addPattern((0, Pattern_1.pattern) `|dck|`)
    .addPattern((0, Pattern_1.pattern) `dick`)
    .addWhitelistedTerm('benedick')
    .addWhitelistedTerm('dickens'))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'dildo' }).addPattern((0, Pattern_1.pattern) `dildo`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'doggystyle' }).addPattern((0, Pattern_1.pattern) `d[o]g[g]ys[s]t[y]l[l]`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'double penetration' }).addPattern((0, Pattern_1.pattern) `double penetra`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'dyke' })
    .addPattern((0, Pattern_1.pattern) `dyke`)
    .addWhitelistedTerm('van dyke'))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'ejaculate' })
    .addPattern((0, Pattern_1.pattern) `e[e]jacul`)
    .addPattern((0, Pattern_1.pattern) `e[e]jakul`)
    .addPattern((0, Pattern_1.pattern) `e[e]acul[l]ate`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'fag' })
    .addPattern((0, Pattern_1.pattern) `|fag`)
    .addPattern((0, Pattern_1.pattern) `fggot`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'felch' }).addPattern((0, Pattern_1.pattern) `fe[e]l[l]ch`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'fellatio' }).addPattern((0, Pattern_1.pattern) `f[e][e]llat`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'finger bang' }).addPattern((0, Pattern_1.pattern) `fingerbang`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'fisting' }).addPattern((0, Pattern_1.pattern) `fistin`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'fuck' })
    .addPattern((0, Pattern_1.pattern) `f[?]ck`)
    .addPattern((0, Pattern_1.pattern) `|fk`)
    .addPattern((0, Pattern_1.pattern) `|fu|`)
    .addPattern((0, Pattern_1.pattern) `|fuk`)
    .addWhitelistedTerm('fick')
    .addWhitelistedTerm('kung-fu')
    .addWhitelistedTerm('kung fu'))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'gangbang' }).addPattern((0, Pattern_1.pattern) `g[?]ngbang`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'handjob' }).addPattern((0, Pattern_1.pattern) `h[?]ndjob`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'hentai' }).addPattern((0, Pattern_1.pattern) `h[e][e]ntai`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'hooker' }).addPattern((0, Pattern_1.pattern) `hooker`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'incest' }).addPattern((0, Pattern_1.pattern) `incest`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'jerk off' }).addPattern((0, Pattern_1.pattern) `jerkoff`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'jizz' }).addPattern((0, Pattern_1.pattern) `jizz`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'kike' }).addPattern((0, Pattern_1.pattern) `kike`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'lubejob' }).addPattern((0, Pattern_1.pattern) `lubejob`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'masturbate' })
    .addPattern((0, Pattern_1.pattern) `m[?]sturbate`)
    .addPattern((0, Pattern_1.pattern) `masterbate`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'negro' })
    .addPattern((0, Pattern_1.pattern) `negro`)
    .addWhitelistedTerm('montenegro')
    .addWhitelistedTerm('negron')
    .addWhitelistedTerm('stoneground')
    .addWhitelistedTerm('winegrow'))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'nigger' })
    .addPattern((0, Pattern_1.pattern) `n[i]gger`)
    .addPattern((0, Pattern_1.pattern) `n[i]gga`)
    .addPattern((0, Pattern_1.pattern) `|nig|`)
    .addPattern((0, Pattern_1.pattern) `|nigs|`)
    .addWhitelistedTerm('snigger'))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'orgasm' })
    .addPattern((0, Pattern_1.pattern) `[or]gasm`)
    .addWhitelistedTerm('gasma'))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'orgy' })
    .addPattern((0, Pattern_1.pattern) `orgy`)
    .addPattern((0, Pattern_1.pattern) `orgies`)
    .addWhitelistedTerm('porgy'))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'penis' })
    .addPattern((0, Pattern_1.pattern) `pe[e]nis`)
    .addPattern((0, Pattern_1.pattern) `|pnis`)
    .addWhitelistedTerm('pen is'))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'piss' }).addPattern((0, Pattern_1.pattern) `|piss`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'porn' })
    .addPattern((0, Pattern_1.pattern) `|prn|`)
    .addPattern((0, Pattern_1.pattern) `porn`)
    .addWhitelistedTerm('p orna'))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'prick' }).addPattern((0, Pattern_1.pattern) `|prick[s]|`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'pussy' }).addPattern((0, Pattern_1.pattern) `p[u]ssy`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'rape' })
    .addPattern((0, Pattern_1.pattern) `|rape`)
    .addPattern((0, Pattern_1.pattern) `|rapis[s]t`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'retard' }).addPattern((0, Pattern_1.pattern) `retard`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'scat' }).addPattern((0, Pattern_1.pattern) `|s[s]cat|`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'semen' }).addPattern((0, Pattern_1.pattern) `|s[s]e[e]me[e]n`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'sex' })
    .addPattern((0, Pattern_1.pattern) `|s[s]e[e]x|`)
    .addPattern((0, Pattern_1.pattern) `|s[s]e[e]xy|`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'shit' })
    .addPattern((0, Pattern_1.pattern) `|shit`)
    .addPattern((0, Pattern_1.pattern) `shit|`)
    .addWhitelistedTerm('s hit')
    .addWhitelistedTerm('sh it')
    .addWhitelistedTerm('shi t')
    .addWhitelistedTerm('shitake'))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'slut' }).addPattern((0, Pattern_1.pattern) `s[s]lut`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'spastic' }).addPattern((0, Pattern_1.pattern) `|spastic`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'tit' })
    .addPattern((0, Pattern_1.pattern) `|tit|`)
    .addPattern((0, Pattern_1.pattern) `|tits|`)
    .addPattern((0, Pattern_1.pattern) `|titt`)
    .addPattern((0, Pattern_1.pattern) `|tiddies`)
    .addPattern((0, Pattern_1.pattern) `|tities`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'tranny' }).addPattern((0, Pattern_1.pattern) `tranny`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'turd' })
    .addPattern((0, Pattern_1.pattern) `|turd`)
    .addWhitelistedTerm('turducken'))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'twat' })
    .addPattern((0, Pattern_1.pattern) `|twat`)
    .addWhitelistedTerm('twattle'))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'vagina' })
    .addPattern((0, Pattern_1.pattern) `vagina`)
    .addPattern((0, Pattern_1.pattern) `|v[?]gina`))
    .addPhrase((phrase) => phrase.setMetadata({ originalWord: 'wank' }).addPattern((0, Pattern_1.pattern) `|wank`))
    .addPhrase((phrase) => phrase
    .setMetadata({ originalWord: 'whore' })
    .addPattern((0, Pattern_1.pattern) `|wh[o]re|`)
    .addPattern((0, Pattern_1.pattern) `|who[o]res[s]|`)
    .addWhitelistedTerm("who're"));

},{"../dataset/DataSet":3,"../pattern/Pattern":12,"../transformer/collapse-duplicates":17,"../transformer/resolve-confusables":21,"../transformer/resolve-leetspeak":23,"../transformer/to-ascii-lowercase":25}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransformerSet = void 0;
class TransformerSet {
    constructor(transformers) {
        this.transformers = transformers;
        this.statefulTransformers = Array.from({ length: this.transformers.length });
        for (let i = 0; i < this.transformers.length; i++) {
            const transformer = this.transformers[i];
            if (transformer.type === 1 /* TransformerType.Stateful */) {
                this.statefulTransformers[i] = transformer.factory();
            }
        }
    }
    applyTo(char) {
        let transformed = char;
        for (let i = 0; i < this.transformers.length && transformed !== undefined; i++) {
            const transformer = this.transformers[i];
            if (transformer.type === 0 /* TransformerType.Simple */)
                transformed = transformer.transform(transformed);
            else
                transformed = this.statefulTransformers[i].transform(transformed);
        }
        return transformed;
    }
    resetAll() {
        for (let i = 0; i < this.transformers.length; i++) {
            if (this.transformers[i].type === 1 /* TransformerType.Stateful */) {
                this.statefulTransformers[i].reset();
            }
        }
    }
}
exports.TransformerSet = TransformerSet;

},{}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStatefulTransformer = exports.createSimpleTransformer = void 0;
/**
 * Creates a container holding the transformer function provided. Simple
 * transformers are suitable for stateless transformations, e.g., a
 * transformation that maps certain characters to others. For transformations
 * that need to keep around state, see `createStatefulTransformer`.
 *
 * @example
 * ```typescript
 * function lowercaseToUppercase(char) {
 *  return isLowercase(char) ? char - 32 : char;
 * }
 *
 * const transformer = createSimpleTransformer(lowercaseToUppercase);
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @example
 * ```typescript
 * function ignoreAllNonDigitChars(char) {
 *  return isDigit(char) ? char : undefined;
 * }
 *
 * const transformer = createSimpleTransformer(ignoreAllNonDigitChars);
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @param transformer - Function that applies the transformation. It should
 * accept one argument, the input character, and return the transformed
 * character. A return value of `undefined` indicates that the character should
 * be ignored.
 * @returns A container holding the transformer, which can then be passed to the
 * [[RegExpMatcher]].
 */
function createSimpleTransformer(transformer) {
    return { type: 0 /* TransformerType.Simple */, transform: transformer };
}
exports.createSimpleTransformer = createSimpleTransformer;
/**
 * Creates a container holding the stateful transformer. Stateful transformers
 * are objects which satisfy the `StatefulTransformer` interface. They are
 * suitable for transformations that require keeping around some state regarding
 * the characters previously transformed in the text.
 *
 * @example
 * ```typescript
 * class IgnoreDuplicateCharactersTransformer implements StatefulTransformer {
 *  private lastChar = -1;
 *
 *  public transform(char: number) {
 *      if (char === this.lastChar) return undefined;
 *      this.lastChar = char;
 *      return char;
 *  }
 *
 *  public reset() {
 *      this.lastChar = -1;
 *  }
 * }
 *
 * const transformer = createStatefulTransformer(() => new IgnoreDuplicateCharactersTransformer());
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @param factory A function that returns an instance of the stateful
 * transformer.
 * @returns A container holding the stateful transformer, which can then be
 * passed to the [[RegExpMatcher]].
 */
function createStatefulTransformer(factory) {
    return { type: 1 /* TransformerType.Stateful */, factory };
}
exports.createStatefulTransformer = createStatefulTransformer;

},{}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collapseDuplicatesTransformer = void 0;
const Char_1 = require("../../util/Char");
const Transformers_1 = require("../Transformers");
const transformer_1 = require("./transformer");
/**
 * Creates a transformer that collapses duplicate characters. This is useful for
 * detecting variants of patterns in which a character is repeated to bypass
 * detection.
 *
 * As an example, the pattern `hi` does not match `hhiii` by default, as the
 * frequency of the characters does not match. With this transformer, `hhiii`
 * would become `hi`, and would therefore match the pattern.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied after all other
 * transformers. Using it before other transformers may have the effect of not
 * catching duplicates of certain characters that were originally different but
 * became the same after a series of transformations.
 *
 * **Warning**
 *
 * This transformer should be used with caution, as while it can make certain
 * patterns match text that wouldn't have been matched before, it can also go
 * the other way. For example, the pattern `hello` clearly matches `hello`, but
 * with this transformer, by default, `hello` would become `helo` which does
 * _not_ match. In this cases, the `customThresholds` option can be used to
 * allow two `l`s in a row, making it leave `hello` unchanged.
 *
 * @example
 * ```typescript
 * // Collapse runs of the same character.
 * const transformer = collapseDuplicatesTransformer();
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @example
 * ```typescript
 * // Collapse runs of characters other than 'a'.
 * const transformer = collapseDuplicatesTransformer({ customThresholds: new Map([['a', Infinity]]) });
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @param options - Options for the transformer.
 * @returns A container holding the transformer, which can then be passed to the
 * [[RegExpMatcher]].
 */
function collapseDuplicatesTransformer({ defaultThreshold = 1, customThresholds = new Map(), } = {}) {
    const map = createCharacterToThresholdMap(customThresholds);
    return (0, Transformers_1.createStatefulTransformer)(() => new transformer_1.CollapseDuplicatesTransformer({ defaultThreshold, customThresholds: map }));
}
exports.collapseDuplicatesTransformer = collapseDuplicatesTransformer;
function createCharacterToThresholdMap(customThresholds) {
    const map = new Map();
    for (const [str, threshold] of customThresholds) {
        if (threshold < 0)
            throw new RangeError('Expected all thresholds to be non-negative.');
        const char = (0, Char_1.getAndAssertSingleCodePoint)(str);
        map.set(char, threshold);
    }
    return map;
}

},{"../../util/Char":26,"../Transformers":16,"./transformer":18}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollapseDuplicatesTransformer = void 0;
class CollapseDuplicatesTransformer {
    constructor({ defaultThreshold, customThresholds }) {
        this.remaining = -1;
        this.lastChar = -1;
        this.defaultThreshold = defaultThreshold;
        this.customThresholds = customThresholds;
    }
    transform(char) {
        if (char === this.lastChar) {
            return this.remaining-- > 0 ? char : undefined;
        }
        const threshold = this.customThresholds.get(char) ?? this.defaultThreshold;
        this.remaining = threshold - 1;
        this.lastChar = char;
        return threshold > 0 ? char : undefined;
    }
    reset() {
        this.remaining = -1;
        this.lastChar = -1;
    }
}
exports.CollapseDuplicatesTransformer = CollapseDuplicatesTransformer;

},{}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remapCharactersTransformer = void 0;
const Char_1 = require("../../util/Char");
const CharacterIterator_1 = require("../../util/CharacterIterator");
const Transformers_1 = require("../Transformers");
/**
 * Maps certain characters to other characters, leaving other characters
 * unchanged.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied near the start of the
 * transformer chain.
 *
 * @example
 * ```typescript
 * // Transform 'a' to 'b'.
 * const transformer = remapCharactersTransformer({ 'b': 'a' });
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @example
 * ```typescript
 * // Transform '🅱️' to 'b', and use a map instead of an object as the argument.
 * const transformer = remapCharactersTransformer(new Map([['b', '🅱️']]));
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @example
 * ```typescript
 * // Transform '🇴' and '0' to 'o'.
 * const transformer = remapCharactersTransformer({ o: '🇴0' });
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @param mapping - A map/object mapping certain characters to others.
 * @returns A container holding the transformer, which can then be passed to the
 * [[RegExpMatcher]].
 * @see [[resolveConfusablesTransformer|  Transformer that handles confusable Unicode characters]]
 * @see [[resolveLeetSpeakTransformer | Transformer that handles leet-speak]]
 */
function remapCharactersTransformer(mapping) {
    const map = createOneToOneMap(mapping);
    return (0, Transformers_1.createSimpleTransformer)((c) => map.get(c) ?? c);
}
exports.remapCharactersTransformer = remapCharactersTransformer;
function createOneToOneMap(mapping) {
    const map = new Map();
    const iterable = mapping instanceof Map ? mapping.entries() : Object.entries(mapping);
    for (const [original, equivalents] of iterable) {
        const originalChar = (0, Char_1.getAndAssertSingleCodePoint)(original);
        const iter = new CharacterIterator_1.CharacterIterator(equivalents);
        for (const equivalent of iter)
            map.set(equivalent, originalChar);
    }
    return map;
}

},{"../../util/Char":26,"../../util/CharacterIterator":27,"../Transformers":16}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confusables = void 0;
/**
 * Maps confusable Unicode characters to their normalized equivalents.
 *
 * @copyright
 * The data here is taken from the
 * [confusables](https://github.com/gc/confusables) library.
 *
 * ```text
 * # The MIT License (MIT)
 *
 * Copyright © 2019 https://github.com/gc/
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the “Software”), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 * ```
 */
exports.confusables = new Map([
    [' ', ' '],
    ['0', '⓿'],
    ['1', '⓵➊⑴¹𝟏𝟙１𝟷𝟣⒈𝟭1➀₁①❶⥠'],
    ['2', '⓶⒉⑵➋ƻ²ᒿ𝟚２𝟮𝟤ᒾ𝟸Ƨ𝟐②ᴤ₂➁❷ᘝƨ'],
    ['3', '³ⳌꞫ𝟑ℨ𝟛𝟯𝟥Ꝫ➌ЗȜ⓷ӠƷ３𝟹⑶⒊ʒʓǯǮƺ𝕴ᶾзᦡ➂③₃ᶚᴣᴟ❸ҘҙӬӡӭӟӞ'],
    ['4', '➍ҶᏎ𝟜ҷ⓸ҸҹӴӵᶣ４чㄩ⁴➃₄④❹Ӌ⑷⒋'],
    ['5', '𝟱⓹➎Ƽ𝟓𝟻𝟝𝟧５➄₅⑤⁵❺ƽ⑸⒌'],
    ['6', 'ⳒᏮ𝟞𝟨𝟔➏⓺Ϭϭ⁶б６ᧈ⑥➅₆❻⑹⒍'],
    ['7', '⓻𐓒➐７⁷⑦₇❼➆⑺⒎'],
    ['8', '𐌚➑⓼８𝟠𝟪৪⁸₈𝟴➇⑧❽𝟾𝟖⑻⒏'],
    ['9', 'ꝮⳊ⓽➒੧৭୨９𝟫𝟿𝟗⁹₉Գ➈⑨❾⑼⒐'],
    ['A', '🄰Ꭿ𐊠𝕬𝜜𝐴ꓮᎪ𝚨ꭺ𝝖🅐Å∀🇦₳🅰𝒜𝘈𝐀𝔸дǺᗅⒶＡΑᾋᗩĂÃÅǍȀȂĀȺĄʌΛλƛᴀᴬДАልÄₐᕱªǞӒΆẠẢẦẨẬẮẰẲẴẶᾸᾹᾺΆᾼᾈᾉᾊᾌᾍᾎᾏἈἉἊἋἌἍἎἏḀȦǠӐÀÁÂẤẪ𝛢𝓐𝙰𝘼'],
    ['a', '∂⍺ⓐձǟᵃᶏ⒜аɒａαȃȁคǎმäɑāɐąᾄẚạảǡầẵḁȧӑӓãåάὰάăẩằẳặᾀᾁᾂᾃᾅᾆᾰᾱᾲᾳᾴᶐᾶᾷἀἁἂἃἄἅἆἇᾇậắàáâấẫǻⱥ𝐚𝑎𝒂𝒶𝓪𝔞𝕒𝖆𝖺𝗮𝘢𝙖𝚊𝛂𝛼𝜶𝝰𝞪⍶'],
    ['B', '𐌁𝑩𝕭🄱𐊡𝖡𝘽ꓐ𝗕𝘉𝜝𐊂𝚩𝐁𝛣𝝗𝐵𝙱𝔹Ᏼᏼ𝞑Ꞵ𝔅🅑฿𝓑ᗿᗾᗽ🅱ⒷＢвϐᗷƁ乃ßცჩ๖βɮБՅ๒ᙖʙᴮᵇጌḄℬΒВẞḂḆɃദᗹᗸᵝᙞᙟᙝᛒᙗᙘᴃ🇧'],
    ['b', 'Ꮟ𝐛𝘣𝒷𝔟𝓫𝖇𝖻𝑏𝙗𝕓𝒃𝗯𝚋♭ᑳᒈｂᖚᕹᕺⓑḃḅҍъḇƃɓƅᖯƄЬᑲþƂ⒝ЪᶀᑿᒀᒂᒁᑾьƀҌѢѣᔎ'],
    ['C', 'ᏟⲤ🄲ꓚ𐊢𐌂🅲𐐕🅒☾ČÇⒸＣↃƇᑕㄈ¢८↻ĈϾՇȻᙅᶜ⒞ĆҀĊ©टƆℂℭϹС匚ḈҪʗᑖᑡᑢᑣᑤᑥⅭ𝐂𝐶𝑪𝒞𝓒𝕮𝖢𝗖𝘊𝘾ᔍ'],
    ['c', 'ⲥ𐐽ꮯĉｃⓒćčċçҁƈḉȼↄсርᴄϲҫ꒝ςɽϛ𝙲ᑦ᧚𝐜𝑐𝒄𝒸𝓬𝔠𝕔𝖈𝖼𝗰𝘤𝙘𝚌₵🇨ᥴᒼⅽ'],
    ['D', 'Ꭰ🄳𝔡𝖉𝔻𝗗𝘋𝙳𝐷𝓓𝐃𝑫𝕯𝖣𝔇𝘿ꭰⅅ𝒟ꓓ🅳🅓ⒹＤƉᗪƊÐԺᴅᴰↁḊĐÞⅮᗞᑯĎḌḐḒḎᗫᗬᗟᗠᶛᴆ🇩'],
    ['d', 'Ꮷꓒ𝓭ᵭ₫ԃⓓｄḋďḍḑḓḏđƌɖɗᵈ⒟ԁⅾᶁԀᑺᑻᑼᑽᒄᑰᑱᶑ𝕕𝖽𝑑𝘥𝒅𝙙𝐝𝗱𝚍ⅆ𝒹ʠժ'],
    ['E', 'ꭼ🄴𝙀𝔼𐊆𝚬ꓰ𝝚𝞔𝓔𝑬𝗘🅴🅔ⒺΈＥƎἝᕮƐモЄᴇᴱᵉÉ乇ЁɆꂅ€ÈℰΕЕⴹᎬĒĔĖĘĚÊËԐỀẾỄỂẼḔḖẺȄȆẸỆȨḜḘḚἘἙἚἛἜῈΈӖὲέЀϵ🇪'],
    ['e', '𝑒𝓮𝕖𝖊𝘦𝗲𝚎𝙚𝒆𝔢𝖾𝐞Ҿҿⓔｅ⒠èᧉéᶒêɘἔềếễ૯ǝєεēҽɛểẽḕḗĕėëẻěȅȇẹệȩɇₑęḝḙḛ℮еԑѐӗᥱёἐἑἒἓἕℯ'],
    ['F', '🄵𐊇𝔉𝘍𐊥ꓝꞘ🅵🅕𝓕ⒻＦғҒᖴƑԲϝቻḞℱϜ₣🇫Ⅎ'],
    ['f', '𝐟𝖋ⓕｆƒḟʃբᶠ⒡ſꊰʄ∱ᶂ𝘧'],
    ['G', 'ꓖᏳ🄶Ꮐᏻ𝔾𝓖𝑮𝕲ꮐ𝒢𝙂𝖦𝙶𝔊𝐺𝐆🅶🅖ⒼＧɢƓʛĢᘜᴳǴĠԌĜḠĞǦǤԍ₲🇬⅁'],
    ['g', 'ⓖｇǵĝḡğġǧģց૭ǥɠﻭﻮᵍ⒢ℊɡᧁ𝐠𝑔𝒈𝓰𝔤𝕘𝖌𝗀𝗴𝘨𝙜𝚐'],
    ['H', '🄷𝜢ꓧ𝘏𝐻𝝜𝖧𐋏𝗛ꮋℍᎻℌⲎ𝑯𝞖🅷🅗ዞǶԋⒽＨĤᚺḢḦȞḤḨḪĦⱧҢңҤῊΉῌἨἩἪἫἭἮἯᾘᾙᾚᾛᾜᾝᾞᾟӉӈҥΉн卄♓𝓗ℋН𝐇𝙃𝙷ʜ𝛨Η𝚮ᕼӇᴴᵸ🇭'],
    ['h', 'Һ⒣ђⓗｈĥḣḧȟḥḩḫẖħⱨհһከኩኪካɦℎ𝐡𝒉𝒽𝓱𝔥𝕙𝖍𝗁𝗵𝘩𝙝𝚑իʰᑋᗁɧんɥ'],
    ['I', '🄸ЇꀤᏆ🅸🅘إﺇٳأﺃٲٵⒾＩ៸ÌÍÎĨĪĬİÏḮỈǏȈȊỊĮḬƗェエῘῙῚΊἸἹἺἻἼἽἾⅠΪΊɪᶦᑊᥣ𝛪𝐈𝙄𝙸𝓵𝙡𝐼ᴵ𝚰𝑰🇮'],
    ['i', 'ⓘｉìíîĩīĭïḯỉǐȉȋịḭῐῑῒΐῖῗἰἱἲⅰⅼ∣ⵏ￨׀ا١۱ߊᛁἳἴἵɨіὶίᶖ𝔦𝚒𝝸𝗂𝐢𝕚𝖎𝗶𝘪𝙞ίⁱᵢ𝓲⒤'],
    ['J', '🄹🅹🅙ⒿＪЈʝᒍנﾌĴʆวلյʖᴊᴶﻝጋɈⱼՂๅႱįᎫȷ丿ℐℑᒘᒙᒚᒛᒴᒵᒎᒏ🇯'],
    ['j', 'ⓙｊϳʲ⒥ɉĵǰјڶᶨ𝒿𝘫𝗷𝑗𝙟𝔧𝒋𝗃𝓳𝕛𝚓𝖏𝐣'],
    ['K', '𝗞🄺𝜥𝘒ꓗ𝙆𝕂Ⲕ𝔎𝛫Ꮶ𝞙𝒦🅺🅚₭ⓀＫĸḰќƘкҠκқҟӄʞҚКҡᴋᴷᵏ⒦ᛕЌጕḲΚKҜҝҞĶḴǨⱩϗӃ🇰'],
    ['k', 'ⓚｋḱǩḳķḵƙⱪᶄ𝐤𝘬𝗄𝕜𝜅𝜘𝜿𝝒𝝹𝞌𝞳𝙠𝚔𝑘𝒌ϰ𝛋𝛞𝟆𝗸𝓴𝓀'],
    ['L', '🄻𐐛Ⳑ𝑳𝙻𐑃𝓛ⳑꮮᏞꓡ🅻🅛ﺈ└ⓁւＬĿᒪ乚ՆʟꓶιԼᴸˡĹረḶₗΓլĻᄂⅬℒⱢᥧᥨᒻᒶᒷᶫﺎᒺᒹᒸᒫ⎳ㄥŁⱠﺄȽ🇱'],
    ['l', 'ⓛｌŀĺľḷḹļӀℓḽḻłﾚɭƚɫⱡ|Ɩ⒧ʅǀוןΙІ｜ᶩӏ𝓘𝕀𝖨𝗜𝘐𝐥𝑙𝒍𝓁𝔩𝕝𝖑𝗅𝗹𝘭𝚕𝜤𝝞ı𝚤ɩι𝛊𝜄𝜾𝞲'],
    ['M', '🄼𐌑𐊰ꓟⲘᎷ🅼🅜ⓂＭмṂ൱ᗰ州ᘻო๓♏ʍᙏᴍᴹᵐ⒨ḾМṀ௱ⅯℳΜϺᛖӍӎ𝐌𝑀𝑴𝓜𝔐𝕄𝕸𝖬𝗠𝘔𝙈𝙼𝚳𝛭𝜧𝝡𝞛🇲'],
    ['m', '₥ᵯ𝖒𝐦𝗆𝔪𝕞𝓂ⓜｍനᙢ൩ḿṁⅿϻṃጠɱ៳ᶆ𝙢𝓶𝚖𝑚𝗺᧕᧗'],
    ['N', '🄽ℕꓠ𝛮𝝢𝙽𝚴𝑵𝑁Ⲛ𝐍𝒩𝞜𝗡𝘕𝜨𝓝𝖭🅽₦🅝ЙЍⓃҋ៷ＮᴎɴƝᑎ几иՈռИהЛπᴺᶰŃ刀ክṄⁿÑПΝᴨոϖǸŇṆŅṊṈทŊӢӣӤӥћѝйᥢҊᴻ🇳'],
    ['n', 'ח𝒏𝓷𝙣𝑛𝖓𝔫𝗇𝚗𝗻ᥒⓝήｎǹᴒńñᾗηṅňṇɲņṋṉղຖՌƞŋ⒩ภกɳпŉлԉȠἠἡῃդᾐᾑᾒᾓᾔᾕᾖῄῆῇῂἢἣἤἥἦἧὴήበቡቢባቤብቦȵ𝛈𝜂𝜼𝝶𝞰𝕟𝘯𝐧𝓃ᶇᵰᥥ∩'],
    [
        'O',
        'ꄲ🄾𐊒𝟬ꓳⲞ𐐄𐊫𐓂𝞞🅞⍥◯ⵁ⊖０⊝𝝤Ѳϴ𝚶𝜪ѺӦӨӪΌʘ𝐎ǑÒŎÓÔÕȌȎㇿ❍ⓄＯὋロ❤૦⊕ØФԾΘƠᴼᵒ⒪ŐÖₒ¤◊Φ〇ΟОՕଠഠ௦סỒỐỖỔṌȬṎŌṐṒȮȰȪỎỜỚỠỞỢỌỘǪǬǾƟⵔ߀៰⍜⎔⎕⦰⦱⦲⦳⦴⦵⦶⦷⦸⦹⦺⦻⦼⦽⦾⦿⧀⧁⧂⧃ὈὉὊὌὍ',
    ],
    [
        'o',
        '𝚘𝛐𝗈𝞼ဝⲟ𝙤၀𐐬𝔬𐓪𝓸🇴⍤○ϙ🅾𝒪𝖮𝟢𝟶𝙾𝘰𝗼𝕠𝜊𝐨𝝾𝞸ᐤⓞѳ᧐ᥲðｏఠᦞՓòөӧóºōôǒȏŏồốȍỗổõσṍȭṏὄṑṓȯȫ๏ᴏőöѻоዐǭȱ০୦٥౦೦൦๐໐οօᴑ०੦ỏơờớỡởợọộǫøǿɵծὀὁόὸόὂὃὅ',
    ],
    ['P', '🄿ꓑ𝚸𝙿𝞠𝙋ꮲⲢ𝒫𝝦𝑃𝑷𝗣𝐏𐊕𝜬𝘗𝓟𝖯𝛲Ꮲ🅟Ҏ🅿ⓅＰƤᑭ尸Ṗրφքᴘᴾᵖ⒫ṔｱקРየᴩⱣℙΡῬᑸᑶᑷᑹᑬᑮ🇵₱'],
    ['p', 'ҏ℗ⓟｐṕṗƥᵽῥρрƿǷῤ⍴𝓹𝓅𝐩𝑝𝒑𝔭𝕡𝖕𝗉𝗽𝘱𝙥𝚙𝛒𝝆𝞺𝜌𝞀'],
    ['Q', '🅀🆀🅠ⓆＱℚⵕԚ𝐐𝑄𝑸𝒬𝓠𝚀𝘘𝙌𝖰𝕼𝔔𝗤🇶'],
    ['q', 'ⓠｑգ⒬۹զᑫɋɊԛ𝗊𝑞𝘲𝕢𝚚𝒒𝖖𝐪𝔮𝓺𝙦'],
    ['R', '℞℟ꭱᏒ𐒴ꮢᎡꓣ🆁🅡ⓇＲᴙȒʀᖇя尺ŔЯરƦᴿዪṚɌʁℛℜℝṘŘȐṜŖṞⱤ𝐑𝑅𝑹𝓡𝕽𝖱𝗥𝘙𝙍𝚁ᚱ🇷ᴚ'],
    ['r', 'ⓡｒŕṙřȑȓṛṝŗгՐɾᥬṟɍʳ⒭ɼѓᴦᶉ𝐫𝑟𝒓𝓇𝓻𝔯𝕣𝖗𝗋𝗿𝘳𝙧ᵲґᵣ'],
    ['S', '🅂ꇙ𝓢𝗦Ꮪ𝒮Ꮥ𝚂𝐒ꓢ𝖲𝔖𝙎𐊖𝕾𐐠𝘚𝕊𝑆𝑺🆂🅢ⓈＳṨŞֆՏȘˢ⒮ЅṠŠŚṤŜṦṢടᔕᔖᔢᔡᔣᔤ'],
    ['s', 'ⓢꜱ𐑈ꮪｓśṥŝṡšṧʂṣṩѕşșȿᶊక𝐬𝑠𝒔𝓈𝓼𝔰𝕤𝖘𝗌𝘀𝘴𝙨𝚜ގ🇸'],
    ['T', '🅃🆃𐌕𝚻𝛵𝕋𝕿𝑻𐊱𐊗𝖳𝙏🝨𝝩𝞣𝚃𝘛𝑇ꓔ⟙𝐓Ⲧ𝗧⊤𝔗Ꭲꭲ𝒯🅣⏇⏉ⓉＴтҬҭƬイŦԵτᴛᵀｲፕϮŤ⊥ƮΤТ下ṪṬȚŢṰṮ丅丁ᐪ𝛕𝜏𝝉𝞃𝞽𝓣ㄒ🇹ጥ'],
    ['t', 'ⓣｔṫẗťṭțȶ੮էʇ†ţṱṯƭŧᵗ⒯ʈեƫ𝐭𝑡𝒕𝓉𝓽𝔱𝕥𝖙𝗍𝘁𝘵𝙩𝚝ナ'],
    ['U', '🅄ꓴ𐓎꒤🆄🅤ŨŬŮᑗᑘǓǕǗǙⓊＵȖᑌ凵ƱմԱꓵЦŪՄƲᙀᵁᵘ⒰ŰપÜՍÙÚÛṸṺǛỦȔƯỪỨỮỬỰỤṲŲṶṴɄᥩᑧ∪ᘮ⋃𝐔𝑈𝑼𝒰𝓤𝔘𝕌𝖀𝖴𝗨𝘜𝙐𝚄🇺'],
    ['u', 'ὺύⓤｕùũūừṷṹŭǖữᥙǚǜὗυΰนսʊǘǔúůᴜűųยûṻцሁüᵾᵤµʋủȕȗưứửựụṳṵʉῠῡῢΰῦῧὐὑϋύὒὓὔὕὖᥔ𝐮𝑢𝒖𝓊𝓾𝔲𝕦𝖚𝗎ᶙ'],
    ['V', '🅅ꓦ𝑽𝖵𝘝Ꮩ𝚅𝙑𝐕🆅🅥ⓋＶᐯѴᵛ⒱۷ṾⅴⅤṼ٧ⴸѶᐺᐻ🇻𝓥'],
    ['v', 'ሀⓥｖ𝜐𝝊ṽṿ౮งѵעᴠνטᵥѷ៴ᘁ𝙫𝚟𝛎𝜈𝝂𝝼𝞶𝘷𝘃𝓿'],
    ['W', '🅆ᏔᎳ𝑾ꓪ𝒲𝘞🆆Ⓦ🅦ｗＷẂᾧᗯᥕ山ѠຟచաЩШώщฬшᙎᵂʷ⒲ฝሠẄԜẀŴẆẈധᘺѿᙡƜ₩🇼'],
    ['w', 'ẁꮃẃⓦ⍵ŵẇẅẘẉⱳὼὠὡὢὣωὤὥὦὧῲῳῴῶῷⱲѡԝᴡώᾠᾡᾢᾣᾤᾥᾦɯ𝝕𝟉𝞏'],
    ['X', '🞨🞩🞪🅇🞫🞬𐌗Ⲭꓫ𝖃𝞦𝘟𐊐𝚾𝝬𝜲Ꭓ𐌢𝖷𝑋𝕏𝔛𐊴𝗫🆇🅧❌Ⓧ𝓧ＸẊ᙭χㄨ𝒳ӾჯӼҳЖΧҲᵡˣ⒳אሸẌꊼⅩХ╳᙮ᕁᕽⅹᚷⵝ𝙓𝚇乂𝐗🇽'],
    ['x', 'ⓧｘхẋ×ₓ⤫⤬⨯ẍᶍ𝙭ӽ𝘹𝐱𝚡⨰ﾒ𝔁'],
    ['Y', 'Ⲩ𝚈𝑌𝗬𝐘ꓬ𝒀𝜰𐊲🆈🅨ⓎＹὛƳㄚʏ⅄ϔ￥¥ՎϓγץӲЧЎሃŸɎϤΥϒҮỲÝŶỸȲẎỶỴῨῩῪΎὙὝὟΫΎӮӰҰұ𝕐🇾'],
    ['y', '🅈ᎽᎩⓨｙỳýŷỹȳẏÿỷуყẙỵƴɏᵞɣʸᶌү⒴ӳӱӯўУʎ'],
    ['Z', '🅉ꓜ𝗭𝐙☡Ꮓ𝘡🆉🅩ⓏＺẔƵ乙ẐȤᶻ⒵ŹℤΖŻŽẒⱫ🇿'],
    ['z', 'ꮓⓩｚźẑżžẓẕƶȥɀᴢጊʐⱬᶎʑᙆ'],
]);

},{}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveConfusablesTransformer = void 0;
const remap_characters_1 = require("../remap-characters");
const confusables_1 = require("./confusables");
/**
 * Creates a transformer that maps confusable Unicode characters to their
 * normalized equivalent. For example, `⓵`, `➊`, and `⑴` become `1` when using
 * this transformer.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied near the start of the
 * transformer chain.
 *
 * @example
 * ```typescript
 * const transformer = resolveConfusablesTransformer();
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @returns A container holding the transformer, which can then be passed to the
 * [[RegExpMatcher]].
 */
function resolveConfusablesTransformer() {
    return (0, remap_characters_1.remapCharactersTransformer)(confusables_1.confusables);
}
exports.resolveConfusablesTransformer = resolveConfusablesTransformer;

},{"../remap-characters":19,"./confusables":20}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dictionary = void 0;
exports.dictionary = new Map([
    ['a', '@4'],
    ['c', '('],
    ['e', '3'],
    ['i', '1|!'],
    ['g', '6'],
    ['o', '0'],
    ['s', '$5'],
    ['t', '7'],
    ['z', '2'],
]);

},{}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveLeetSpeakTransformer = void 0;
const remap_characters_1 = require("../remap-characters");
const dictionary_1 = require("./dictionary");
/**
 * Creates a transformer that maps leet-speak characters to their normalized
 * equivalent. For example, `$` becomes `s` when using this transformer.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied near the start of the
 * transformer chain, but after similar transformers that map characters to
 * other characters, such as the [[resolveConfusablesTransformer | transformer
 * that resolves confusable Unicode characters]].
 *
 * @example
 * ```typescript
 * const transformer = resolveLeetSpeakTransformer();
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @returns A container holding the transformer, which can then be passed to the
 * [[RegExpMatcher]].
 */
function resolveLeetSpeakTransformer() {
    return (0, remap_characters_1.remapCharactersTransformer)(dictionary_1.dictionary);
}
exports.resolveLeetSpeakTransformer = resolveLeetSpeakTransformer;

},{"../remap-characters":19,"./dictionary":22}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skipNonAlphabeticTransformer = void 0;
const Char_1 = require("../../util/Char");
const Transformers_1 = require("../Transformers");
/**
 * Creates a transformer that skips non-alphabetic characters (`a`-`z`,
 * `A`-`Z`). This is useful when matching text on patterns that are solely
 * comprised of alphabetic characters (the pattern `hello` does not match
 * `h.e.l.l.o` by default, but does with this transformer).
 *
 * **Warning**
 *
 * This transformation is not part of the default set of transformations, as
 * there are some known rough edges with false negatives; see
 * [#23](https://github.com/jo3-l/obscenity/issues/23) and
 * [#46](https://github.com/jo3-l/obscenity/issues/46) on the GitHub issue
 * tracker.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied near the end of the
 * transformer chain, if at all.
 *
 * @example
 * ```typescript
 * const transformer = skipNonAlphabeticTransformer();
 * const matcher = new RegExpMatcher({ ..., blacklistMatcherTransformers: [transformer] });
 * ```
 * @returns A container holding the transformer, which can then be passed to the
 * [[RegExpMatcher]].
 */
function skipNonAlphabeticTransformer() {
    return (0, Transformers_1.createSimpleTransformer)((c) => ((0, Char_1.isAlphabetic)(c) ? c : undefined));
}
exports.skipNonAlphabeticTransformer = skipNonAlphabeticTransformer;

},{"../../util/Char":26,"../Transformers":16}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAsciiLowerCaseTransformer = void 0;
const Char_1 = require("../../util/Char");
const Transformers_1 = require("../Transformers");
/**
 * Creates a transformer that changes all ASCII alphabet characters to
 * lower-case, leaving other characters unchanged.
 *
 * **Application order**
 *
 * It is recommended that this transformer be applied near the end of the
 * transformer chain. Using it before other transformers may have the effect of
 * making its changes useless as transformers applied after produce characters
 * of varying cases.
 *
 * @returns A container holding the transformer, which can then be passed to the
 * [[RegExpMatcher]].
 */
function toAsciiLowerCaseTransformer() {
    return (0, Transformers_1.createSimpleTransformer)((c) => ((0, Char_1.isUpperCase)(c) ? (0, Char_1.invertCaseOfAlphabeticChar)(c) : c));
}
exports.toAsciiLowerCaseTransformer = toAsciiLowerCaseTransformer;

},{"../../util/Char":26,"../Transformers":16}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAndAssertSingleCodePoint = exports.invertCaseOfAlphabeticChar = exports.isUpperCase = exports.isLowerCase = exports.isAlphabetic = exports.isDigit = exports.isWordChar = exports.convertSurrogatePairToCodePoint = exports.isLowSurrogate = exports.isHighSurrogate = void 0;
function isHighSurrogate(char) {
    return 55296 /* CharacterCode.HighSurrogateStart */ <= char && char <= 56319 /* CharacterCode.HighSurrogateEnd */;
}
exports.isHighSurrogate = isHighSurrogate;
function isLowSurrogate(char) {
    return 56320 /* CharacterCode.LowSurrogateStart */ <= char && char <= 57343 /* CharacterCode.LowSurrogateEnd */;
}
exports.isLowSurrogate = isLowSurrogate;
// See https://unicodebook.readthedocs.io/unicode_encodings.html#utf-16-surrogate-pairs.
function convertSurrogatePairToCodePoint(highSurrogate, lowSurrogate) {
    return ((highSurrogate - 55296 /* CharacterCode.HighSurrogateStart */) * 0x400 +
        lowSurrogate -
        56320 /* CharacterCode.LowSurrogateStart */ +
        0x10000);
}
exports.convertSurrogatePairToCodePoint = convertSurrogatePairToCodePoint;
function isWordChar(char) {
    return isDigit(char) || isAlphabetic(char);
}
exports.isWordChar = isWordChar;
function isDigit(char) {
    return 48 /* CharacterCode.Zero */ <= char && char <= 57 /* CharacterCode.Nine */;
}
exports.isDigit = isDigit;
function isAlphabetic(char) {
    return isLowerCase(char) || isUpperCase(char);
}
exports.isAlphabetic = isAlphabetic;
function isLowerCase(char) {
    return 97 /* CharacterCode.LowerA */ <= char && char <= 122 /* CharacterCode.LowerZ */;
}
exports.isLowerCase = isLowerCase;
function isUpperCase(char) {
    return 65 /* CharacterCode.UpperA */ <= char && char <= 90 /* CharacterCode.UpperZ */;
}
exports.isUpperCase = isUpperCase;
// Input must be a lower-case or upper-case ASCII alphabet character.
function invertCaseOfAlphabeticChar(char) {
    return char ^ 0x20;
}
exports.invertCaseOfAlphabeticChar = invertCaseOfAlphabeticChar;
// Asserts that the string is comprised of one and only one code point,
// then returns said code point.
function getAndAssertSingleCodePoint(str) {
    if ([...str].length !== 1)
        throw new RangeError(`Expected the input string to be one code point in length.`);
    return str.codePointAt(0);
}
exports.getAndAssertSingleCodePoint = getAndAssertSingleCodePoint;

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterIterator = void 0;
const Char_1 = require("./Char");
class CharacterIterator {
    constructor(input) {
        this.lastPosition = -1;
        this.currentPosition = 0;
        this._lastWidth = 0;
        this._input = input ?? '';
    }
    get input() {
        return this._input;
    }
    setInput(input) {
        this._input = input;
        this.reset();
        return this;
    }
    reset() {
        this.lastPosition = -1;
        this.currentPosition = 0;
        this._lastWidth = 0;
    }
    next() {
        if (this.done)
            return { done: true, value: undefined };
        this.lastPosition = this.currentPosition;
        const char = this._input.charCodeAt(this.currentPosition++);
        this._lastWidth = 1;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (this.done || !(0, Char_1.isHighSurrogate)(char))
            return { done: false, value: char };
        // Do we have a surrogate pair?
        const next = this._input.charCodeAt(this.currentPosition);
        if ((0, Char_1.isLowSurrogate)(next)) {
            this._lastWidth++;
            this.currentPosition++;
            return { done: false, value: (0, Char_1.convertSurrogatePairToCodePoint)(char, next) };
        }
        return { done: false, value: char };
    }
    // Position of the iterator; equals the start index of the last character consumed.
    // -1 if no characters were consumed yet.
    get position() {
        return this.lastPosition;
    }
    // Width of the last character consumed; 2 if it was a surrogate pair and 1 otherwise.
    // 0 if no characters were consumed yet.
    get lastWidth() {
        return this._lastWidth;
    }
    get done() {
        return this.currentPosition >= this._input.length;
    }
    [Symbol.iterator]() {
        return this;
    }
}
exports.CharacterIterator = CharacterIterator;

},{"./Char":26}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareIntervals = void 0;
function compareIntervals(lowerBound0, upperBound0, lowerBound1, upperBound1) {
    if (lowerBound0 < lowerBound1)
        return -1;
    if (lowerBound1 < lowerBound0)
        return 1;
    if (upperBound0 < upperBound1)
        return -1;
    if (upperBound1 < upperBound0)
        return 1;
    return 0;
}
exports.compareIntervals = compareIntervals;

},{}],"obscenity":[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./censor/BuiltinStrategies"), exports);
__exportStar(require("./censor/TextCensor"), exports);
__exportStar(require("./dataset/DataSet"), exports);
__exportStar(require("./matcher/regexp/RegExpMatcher"), exports);
__exportStar(require("./matcher/BlacklistedTerm"), exports);
__exportStar(require("./matcher/MatchPayload"), exports);
__exportStar(require("./matcher/Matcher"), exports);
__exportStar(require("./pattern/Nodes"), exports);
__exportStar(require("./pattern/ParserError"), exports);
__exportStar(require("./pattern/Pattern"), exports);
__exportStar(require("./preset/english"), exports);
__exportStar(require("./transformer/collapse-duplicates"), exports);
__exportStar(require("./transformer/remap-characters"), exports);
__exportStar(require("./transformer/resolve-confusables"), exports);
__exportStar(require("./transformer/resolve-leetspeak"), exports);
__exportStar(require("./transformer/skip-non-alphabetic"), exports);
__exportStar(require("./transformer/to-ascii-lowercase"), exports);

},{"./censor/BuiltinStrategies":1,"./censor/TextCensor":2,"./dataset/DataSet":3,"./matcher/BlacklistedTerm":4,"./matcher/MatchPayload":6,"./matcher/Matcher":7,"./matcher/regexp/RegExpMatcher":8,"./pattern/Nodes":9,"./pattern/ParserError":11,"./pattern/Pattern":12,"./preset/english":14,"./transformer/collapse-duplicates":17,"./transformer/remap-characters":19,"./transformer/resolve-confusables":21,"./transformer/resolve-leetspeak":23,"./transformer/skip-non-alphabetic":24,"./transformer/to-ascii-lowercase":25}]},{},[]);
