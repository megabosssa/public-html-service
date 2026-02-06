/**
 * Thymeleaf Template Engine - Full Native JavaScript Implementation
 * Supports Spring Boot Thymeleaf 3.1 Syntax
 */
class ThymeleafEngine {
    constructor() {
        this.fragments = new Map();
        this.messages = {};
    }

    render(template, context = {}, messages = {}) {
        this.messages = messages;
        this.fragments.clear();
        this._extractFragments(template);
        const wrapper = document.createElement('div');
        wrapper.innerHTML = template;
        this._processNode(wrapper, context, null);
        return wrapper.innerHTML;
    }

    _extractFragments(template) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = template;
        tempDiv.querySelectorAll('[th\\:fragment]').forEach(el => {
            const fragAttr = el.getAttribute('th:fragment');
            const match = fragAttr.match(/^(\w+)(?:\s*\((.*?)\))?$/);
            if (match) {
                this.fragments.set(match[1], { element: el.cloneNode(true), params: match[2] ? match[2].split(',').map(p => p.trim()) : [] });
            }
        });
    }

    _processNode(node, context, selectedObject) {
        if (!node) return;
        if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = this._processInlineExpressions(node.textContent, context, selectedObject);
            return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;

        const el = node;
        const tagName = el.tagName.toLowerCase();

        if (el.hasAttribute('th:fragment')) el.removeAttribute('th:fragment');

        if (el.hasAttribute('th:insert') || el.hasAttribute('th:replace')) {
            const isReplace = el.hasAttribute('th:replace');
            const fragExpr = el.getAttribute(isReplace ? 'th:replace' : 'th:insert');
            el.removeAttribute(isReplace ? 'th:replace' : 'th:insert');
            const result = this._processFragmentInsert(fragExpr, context, isReplace);
            if (result) {
                if (isReplace) { el.replaceWith(result); return; }
                else { el.innerHTML = ''; el.appendChild(result); }
            }
        }

        if (el.hasAttribute('th:each')) { this._processEach(el, context, selectedObject); return; }

        if (el.hasAttribute('th:if')) {
            const condition = this._evaluateExpression(el.getAttribute('th:if'), context, selectedObject);
            el.removeAttribute('th:if');
            if (!this._isTruthy(condition)) { el.remove(); return; }
        }

        if (el.hasAttribute('th:unless')) {
            const condition = this._evaluateExpression(el.getAttribute('th:unless'), context, selectedObject);
            el.removeAttribute('th:unless');
            if (this._isTruthy(condition)) { el.remove(); return; }
        }

        if (el.hasAttribute('th:switch')) this._processSwitch(el, context, selectedObject);

        if (el.hasAttribute('th:with')) {
            context = this._processLocalVariables(el.getAttribute('th:with'), context, selectedObject);
            el.removeAttribute('th:with');
        }

        if (el.hasAttribute('th:object')) {
            selectedObject = this._evaluateExpression(el.getAttribute('th:object'), context, selectedObject);
            el.removeAttribute('th:object');
        }

        if (el.hasAttribute('th:attr')) {
            this._processAttr(el, el.getAttribute('th:attr'), context, selectedObject);
            el.removeAttribute('th:attr');
        }

        if (el.hasAttribute('th:text')) {
            const value = this._evaluateExpression(el.getAttribute('th:text'), context, selectedObject);
            el.removeAttribute('th:text');
            el.textContent = value != null ? String(value) : '';
        }

        if (el.hasAttribute('th:utext')) {
            const value = this._evaluateExpression(el.getAttribute('th:utext'), context, selectedObject);
            el.removeAttribute('th:utext');
            el.innerHTML = value != null ? String(value) : '';
        }

        const thAttributes = Array.from(el.attributes).filter(attr => attr.name.startsWith('th:') && !['th:block'].includes(attr.name));
        thAttributes.forEach(attr => {
            const attrName = attr.name.substring(3);
            const attrValue = attr.value;
            el.removeAttribute(attr.name);

            if (attrName === 'classappend') {
                const appendValue = this._evaluateExpression(attrValue, context, selectedObject);
                if (appendValue) el.className = (el.className + ' ' + appendValue).trim();
            } else if (attrName === 'styleappend') {
                const appendValue = this._evaluateExpression(attrValue, context, selectedObject);
                if (appendValue) el.style.cssText = (el.style.cssText + '; ' + appendValue).trim();
            } else if (['checked', 'selected', 'disabled', 'readonly', 'required'].includes(attrName)) {
                if (this._isTruthy(this._evaluateExpression(attrValue, context, selectedObject))) el.setAttribute(attrName, attrName);
            } else {
                const value = this._evaluateExpression(attrValue, context, selectedObject);
                if (value != null) el.setAttribute(attrName, String(value));
            }
        });

        Array.from(el.childNodes).forEach(child => this._processNode(child, context, selectedObject));

        if (tagName === 'th:block') {
            const fragment = document.createDocumentFragment();
            while (el.firstChild) fragment.appendChild(el.firstChild);
            el.replaceWith(fragment);
        }
    }

    _processEach(el, context, selectedObject) {
        const eachAttr = el.getAttribute('th:each');
        el.removeAttribute('th:each');
        const match = eachAttr.match(/^(\w+)(?:\s*,\s*(\w+))?\s*:\s*(.+)$/);
        if (!match) { el.remove(); return; }

        const itemVar = match[1], statVar = match[2] || itemVar + 'Stat';
        const collection = this._evaluateExpression(match[3].trim(), context, selectedObject);
        if (!collection || !this._isIterable(collection)) { el.remove(); return; }

        const items = Array.isArray(collection) ? collection : typeof collection === 'object' ? Object.entries(collection) : [collection];
        const fragment = document.createDocumentFragment();
        const size = items.length;

        items.forEach((item, index) => {
            const clone = el.cloneNode(true);
            const iterStat = { index, count: index + 1, size, current: item, even: index % 2 === 0, odd: index % 2 === 1, first: index === 0, last: index === size - 1 };
            this._processNode(clone, { ...context, [itemVar]: item, [statVar]: iterStat }, selectedObject);
            fragment.appendChild(clone);
        });
        el.replaceWith(fragment);
    }

    _processSwitch(el, context, selectedObject) {
        const switchValue = this._evaluateExpression(el.getAttribute('th:switch'), context, selectedObject);
        el.removeAttribute('th:switch');
        let matchFound = false;
        Array.from(el.children).forEach(child => {
            if (child.hasAttribute('th:case')) {
                const caseValue = child.getAttribute('th:case');
                child.removeAttribute('th:case');
                if (caseValue === '*') { if (matchFound) child.remove(); }
                else {
                    const evaluatedCase = this._evaluateExpression(caseValue, context, selectedObject);
                    if (!matchFound && evaluatedCase === switchValue) matchFound = true;
                    else child.remove();
                }
            }
        });
    }

    _processLocalVariables(withAttr, context, selectedObject) {
        const newContext = { ...context };
        this._splitAssignments(withAttr).forEach(assignment => {
            const eqIndex = assignment.indexOf('=');
            if (eqIndex > 0) newContext[assignment.substring(0, eqIndex).trim()] = this._evaluateExpression(assignment.substring(eqIndex + 1).trim(), context, selectedObject);
        });
        return newContext;
    }

    _splitAssignments(str) {
        const result = [];
        let current = '', depth = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str[i];
            if ('({['.includes(char)) depth++;
            else if (')}]'.includes(char)) depth--;
            else if (char === ',' && depth === 0) { result.push(current.trim()); current = ''; continue; }
            current += char;
        }
        if (current.trim()) result.push(current.trim());
        return result;
    }

    _processAttr(el, attrExpr, context, selectedObject) {
        this._splitAssignments(attrExpr).forEach(assignment => {
            const eqIndex = assignment.indexOf('=');
            if (eqIndex > 0) {
                const value = this._evaluateExpression(assignment.substring(eqIndex + 1).trim(), context, selectedObject);
                if (value != null) el.setAttribute(assignment.substring(0, eqIndex).trim(), String(value));
            }
        });
    }

    _processFragmentInsert(fragExpr, context, isReplace) {
        let fragName = fragExpr.trim();
        if (fragName.startsWith('~{') && fragName.endsWith('}')) fragName = fragName.slice(2, -1).trim();
        if (fragName.includes('::')) fragName = fragName.split('::')[1].trim();
        const match = fragName.match(/^(\w+)(?:\s*\((.*?)\))?$/);
        if (!match) return null;
        const fragDef = this.fragments.get(match[1]);
        if (!fragDef) return null;
        const clone = fragDef.element.cloneNode(true);
        clone.removeAttribute('th:fragment');
        if (match[2] && fragDef.params.length > 0) {
            const args = this._splitAssignments(match[2]);
            const fragContext = { ...context };
            args.forEach((arg, i) => { if (i < fragDef.params.length) fragContext[fragDef.params[i]] = this._evaluateExpression(arg, context, null); });
            this._processNode(clone, fragContext, null);
        } else this._processNode(clone, context, null);
        return clone;
    }

    _processInlineExpressions(text, context, selectedObject) {
        if (!text) return text;
        text = text.replace(/\[\[\$\{(.*?)\}\]\]/g, (m, expr) => this._escapeHtml(String(this._evaluateExpression('${' + expr + '}', context, selectedObject) ?? '')));
        text = text.replace(/\[\(#\{(.*?)\}\)\]/g, (m, expr) => String(this._evaluateExpression('#{' + expr + '}', context, selectedObject) ?? ''));
        text = text.replace(/\[\(\$\{(.*?)\}\)\]/g, (m, expr) => String(this._evaluateExpression('${' + expr + '}', context, selectedObject) ?? ''));
        return text;
    }

    _evaluateExpression(expr, context, selectedObject) {
        if (expr === null || expr === undefined) return null;
        expr = expr.trim();
        if (!expr) return null;
        if ((expr.startsWith("'") && expr.endsWith("'")) || (expr.startsWith('"') && expr.endsWith('"'))) return expr.slice(1, -1);
        if (/^-?\d+(\.\d+)?$/.test(expr)) return parseFloat(expr);
        if (expr === 'true') return true;
        if (expr === 'false') return false;
        if (expr === 'null') return null;
        if (expr.startsWith('${') && expr.endsWith('}')) return this._evaluateVariableExpression(expr.slice(2, -1), context, selectedObject);
        if (expr.startsWith('*{') && expr.endsWith('}')) return this._evaluateVariableExpression(expr.slice(2, -1), selectedObject || context, null);
        if (expr.startsWith('#{') && expr.endsWith('}')) return this._evaluateMessageExpression(expr.slice(2, -1), context);
        if (expr.startsWith('@{') && expr.endsWith('}')) return this._evaluateUrlExpression(expr.slice(2, -1), context, selectedObject);
        if (expr.startsWith('~{') && expr.endsWith('}')) return expr;
        return this._evaluateVariableExpression(expr, context, selectedObject);
    }

    _evaluateVariableExpression(expr, context, selectedObject) {
        expr = expr.trim();
        const ternary = this._parseTernary(expr);
        if (ternary) return this._isTruthy(this._evaluateVariableExpression(ternary.condition, context, selectedObject)) ? this._evaluateVariableExpression(ternary.thenExpr, context, selectedObject) : this._evaluateVariableExpression(ternary.elseExpr, context, selectedObject);
        const elvisIndex = expr.indexOf('?:');
        if (elvisIndex > 0) {
            const value = this._evaluateVariableExpression(expr.substring(0, elvisIndex).trim(), context, selectedObject);
            return (value !== null && value !== undefined && value !== '') ? value : this._evaluateVariableExpression(expr.substring(elvisIndex + 2).trim(), context, selectedObject);
        }
        if (this._hasOperator(expr)) return this._evaluateOperatorExpression(expr, context, selectedObject);
        if (expr.includes('+') && !expr.includes('(')) {
            const parts = this._splitByOperator(expr, '+');
            if (parts.length > 1) return parts.map(p => String(this._evaluateVariableExpression(p.trim(), context, selectedObject) ?? '')).join('');
        }
        if (expr.startsWith('#')) return this._evaluateUtilityCall(expr, context, selectedObject);
        return this._resolvePropertyPath(expr, context, selectedObject);
    }

    _parseTernary(expr) {
        let depth = 0, questionIdx = -1, colonIdx = -1;
        for (let i = 0; i < expr.length; i++) {
            const char = expr[i];
            if ('({['.includes(char)) depth++;
            else if (')}]'.includes(char)) depth--;
            else if (depth === 0) {
                if (char === '?' && expr[i + 1] !== ':' && questionIdx === -1) questionIdx = i;
                else if (char === ':' && expr[i - 1] !== '?' && questionIdx !== -1 && colonIdx === -1) colonIdx = i;
            }
        }
        if (questionIdx > 0 && colonIdx > questionIdx) return { condition: expr.substring(0, questionIdx).trim(), thenExpr: expr.substring(questionIdx + 1, colonIdx).trim(), elseExpr: expr.substring(colonIdx + 1).trim() };
        return null;
    }

    _hasOperator(expr) {
        return [' == ', ' != ', ' > ', ' < ', ' >= ', ' <= ', ' and ', ' or ', ' not ', ' eq ', ' ne ', ' gt ', ' lt ', ' ge ', ' le '].some(op => expr.includes(op));
    }

    _evaluateOperatorExpression(expr, context, selectedObject) {
        if (expr.startsWith('not ') || expr.startsWith('!')) return !this._isTruthy(this._evaluateVariableExpression(expr.startsWith('not ') ? expr.substring(4) : expr.substring(1), context, selectedObject));
        const andParts = this._splitByOperator(expr, ' and ');
        if (andParts.length > 1) return andParts.every(p => this._isTruthy(this._evaluateVariableExpression(p.trim(), context, selectedObject)));
        const orParts = this._splitByOperator(expr, ' or ');
        if (orParts.length > 1) return orParts.some(p => this._isTruthy(this._evaluateVariableExpression(p.trim(), context, selectedObject)));
        for (const { op, fn } of [{ op: ' == ', fn: (a, b) => a === b }, { op: ' eq ', fn: (a, b) => a === b }, { op: ' != ', fn: (a, b) => a !== b }, { op: ' ne ', fn: (a, b) => a !== b }, { op: ' >= ', fn: (a, b) => a >= b }, { op: ' ge ', fn: (a, b) => a >= b }, { op: ' <= ', fn: (a, b) => a <= b }, { op: ' le ', fn: (a, b) => a <= b }, { op: ' > ', fn: (a, b) => a > b }, { op: ' gt ', fn: (a, b) => a > b }, { op: ' < ', fn: (a, b) => a < b }, { op: ' lt ', fn: (a, b) => a < b }]) {
            const idx = expr.indexOf(op);
            if (idx > 0) return fn(this._evaluateVariableExpression(expr.substring(0, idx).trim(), context, selectedObject), this._evaluateVariableExpression(expr.substring(idx + op.length).trim(), context, selectedObject));
        }
        return this._resolvePropertyPath(expr, context, selectedObject);
    }

    _splitByOperator(expr, operator) {
        const result = [];
        let current = '', depth = 0, i = 0;
        while (i < expr.length) {
            const char = expr[i];
            if ("({['".includes(char)) { depth++; current += char; }
            else if (")}]".includes(char)) { depth--; current += char; }
            else if (depth === 0 && expr.substring(i).startsWith(operator)) { result.push(current); current = ''; i += operator.length; continue; }
            else current += char;
            i++;
        }
        if (current) result.push(current);
        return result;
    }

    _evaluateUtilityCall(expr, context, selectedObject) {
        const utils = this._getUtilityObjects();
        const match = expr.match(/^#(\w+)\.(\w+)\((.*)\)$/);
        if (match && utils[match[1]]?.[match[2]]) {
            try { return utils[match[1]][match[2]](...this._parseArguments(match[3], context, selectedObject)); }
            catch (e) { console.warn('Utility call failed:', expr, e); return null; }
        }
        const propMatch = expr.match(/^#(\w+)\.(\w+)$/);
        if (propMatch) return utils[propMatch[1]]?.[propMatch[2]];
        return null;
    }

    _getUtilityObjects() {
        const self = this;
        return {
            strings: {
                isEmpty: s => s === null || s === undefined || s === '',
                isNotEmpty: s => s !== null && s !== undefined && s !== '',
                length: s => s ? String(s).length : 0,
                trim: s => s ? String(s).trim() : '',
                toUpperCase: s => s ? String(s).toUpperCase() : '',
                toLowerCase: s => s ? String(s).toLowerCase() : '',
                capitalize: s => s ? String(s).charAt(0).toUpperCase() + String(s).slice(1) : '',
                capitalizeWords: s => s ? String(s).replace(/\b\w/g, l => l.toUpperCase()) : '',
                contains: (s, f) => s ? String(s).includes(f) : false,
                containsIgnoreCase: (s, f) => s ? String(s).toLowerCase().includes(String(f).toLowerCase()) : false,
                startsWith: (s, p) => s ? String(s).startsWith(p) : false,
                endsWith: (s, p) => s ? String(s).endsWith(p) : false,
                substring: (s, start, end) => s ? String(s).substring(start, end) : '',
                substringAfter: (s, sep) => s && s.includes(sep) ? s.substring(s.indexOf(sep) + sep.length) : '',
                substringBefore: (s, sep) => s && s.includes(sep) ? s.substring(0, s.indexOf(sep)) : '',
                replace: (s, t, r) => s ? String(s).replace(t, r) : '',
                replaceAll: (s, t, r) => s ? String(s).split(t).join(r) : '',
                prepend: (s, p) => p + (s || ''),
                append: (s, p) => (s || '') + p,
                indexOf: (s, f) => s ? String(s).indexOf(f) : -1,
                equals: (a, b) => a === b,
                equalsIgnoreCase: (a, b) => String(a).toLowerCase() === String(b).toLowerCase(),
                concat: (...p) => p.join(''),
                defaultString: (s, d) => s ?? d ?? '',
                abbreviate: (s, m) => !s || s.length <= m ? s : s.substring(0, m - 3) + '...',
                arrayJoin: (a, s) => Array.isArray(a) ? a.join(s) : '',
                arraySplit: (s, sep) => s ? String(s).split(sep) : []
            },
            numbers: {
                formatInteger: (n, m) => n != null ? String(Math.floor(Number(n))).padStart(m, '0') : '',
                formatDecimal: (n, minInt, thSep, dec, decSep) => {
                    if (n == null) return '';
                    n = Number(n); if (isNaN(n)) return '';
                    const getSym = t => t === 'COMMA' ? ',' : t === 'POINT' ? '.' : t === 'WHITESPACE' ? ' ' : '';
                    let [int, d] = n.toFixed(dec).split('.');
                    if (int.length < minInt) int = int.padStart(minInt, '0');
                    if (getSym(thSep)) int = int.replace(/\B(?=(\d{3})+(?!\d))/g, getSym(thSep));
                    return dec > 0 ? int + getSym(decSep) + d : int;
                },
                formatCurrency: (n, l = 'en-US', c = 'USD') => n != null ? new Intl.NumberFormat(l, { style: 'currency', currency: c }).format(n) : '',
                formatPercent: (n, m, d) => n != null ? (Number(n) * 100).toFixed(d) + '%' : '',
                sequence: (s, e, step = 1) => { const r = []; for (let i = s; step > 0 ? i <= e : i >= e; i += step) r.push(i); return r; }
            },
            dates: {
                format: (d, p) => self._formatDate(d, p),
                create: (y, m, d) => new Date(y, m - 1, d),
                createNow: () => new Date(),
                day: d => new Date(d).getDate(),
                month: d => new Date(d).getMonth() + 1,
                year: d => new Date(d).getFullYear(),
                dayOfWeek: d => new Date(d).getDay(),
                dayOfWeekName: d => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(d).getDay()],
                monthName: d => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][new Date(d).getMonth()]
            },
            temporals: {
                format: (t, p) => self._formatDate(t, p),
                day: t => new Date(t).getDate(),
                month: t => new Date(t).getMonth() + 1,
                year: t => new Date(t).getFullYear(),
                hour: t => new Date(t).getHours(),
                minute: t => new Date(t).getMinutes(),
                second: t => new Date(t).getSeconds(),
                dayOfWeek: t => new Date(t).getDay(),
                dayOfWeekName: t => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(t).getDay()],
                monthName: t => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][new Date(t).getMonth()],
                createNow: () => new Date().toISOString()
            },
            lists: {
                size: l => Array.isArray(l) ? l.length : 0,
                isEmpty: l => !l || l.length === 0,
                contains: (l, e) => Array.isArray(l) && l.includes(e),
                containsAll: (l, e) => Array.isArray(l) && e.every(x => l.includes(x)),
                sort: l => Array.isArray(l) ? [...l].sort() : [],
                toList: (...i) => i,
                toSet: (...i) => [...new Set(i)]
            },
            arrays: {
                length: a => Array.isArray(a) ? a.length : 0,
                isEmpty: a => !a || a.length === 0,
                contains: (a, e) => Array.isArray(a) && a.includes(e),
                toArray: (...i) => i
            },
            maps: {
                size: m => m instanceof Map ? m.size : typeof m === 'object' ? Object.keys(m).length : 0,
                isEmpty: m => m instanceof Map ? m.size === 0 : typeof m === 'object' ? Object.keys(m).length === 0 : true,
                containsKey: (m, k) => m instanceof Map ? m.has(k) : typeof m === 'object' ? m.hasOwnProperty(k) : false,
                keys: m => m instanceof Map ? Array.from(m.keys()) : typeof m === 'object' ? Object.keys(m) : [],
                values: m => m instanceof Map ? Array.from(m.values()) : typeof m === 'object' ? Object.values(m) : []
            },
            bools: {
                isTrue: v => v === true,
                isFalse: v => v === false,
                and: (...v) => v.every(x => !!x),
                or: (...v) => v.some(x => !!x),
                not: v => !v
            },
            objects: {
                nullSafe: (o, d) => o ?? d
            },
            aggregates: {
                sum: a => Array.isArray(a) ? a.reduce((x, y) => Number(x) + Number(y), 0) : 0,
                avg: a => Array.isArray(a) && a.length ? a.reduce((x, y) => Number(x) + Number(y), 0) / a.length : 0,
                max: a => Array.isArray(a) ? Math.max(...a) : null,
                min: a => Array.isArray(a) ? Math.min(...a) : null
            }
        };
    }

    _formatDate(date, pattern) {
        if (!date) return '';
        const d = new Date(date);
        if (isNaN(d.getTime())) return date;
        const pad = (n, l = 2) => String(n).padStart(l, '0');
        const tokens = {
            'yyyy': () => d.getFullYear(), 'yy': () => String(d.getFullYear()).slice(-2),
            'MMMM': () => ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()],
            'MMM': () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()],
            'MM': () => pad(d.getMonth() + 1), 'M': () => d.getMonth() + 1,
            'dd': () => pad(d.getDate()), 'd': () => d.getDate(),
            'EEEE': () => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()],
            'EEE': () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
            'HH': () => pad(d.getHours()), 'H': () => d.getHours(),
            'hh': () => pad(d.getHours() % 12 || 12), 'h': () => d.getHours() % 12 || 12,
            'mm': () => pad(d.getMinutes()), 'm': () => d.getMinutes(),
            'ss': () => pad(d.getSeconds()), 's': () => d.getSeconds(),
            'SSS': () => pad(d.getMilliseconds(), 3), 'a': () => d.getHours() < 12 ? 'AM' : 'PM'
        };
        let result = pattern;
        for (const token of Object.keys(tokens).sort((a, b) => b.length - a.length)) result = result.split(token).join(tokens[token]());
        return result;
    }

    _parseArguments(argsStr, context, selectedObject) {
        if (!argsStr.trim()) return [];
        const args = [];
        let current = '', depth = 0, inString = false, stringChar = '';
        for (let i = 0; i < argsStr.length; i++) {
            const char = argsStr[i];
            if (!inString && (char === "'" || char === '"')) { inString = true; stringChar = char; current += char; }
            else if (inString && char === stringChar) { inString = false; current += char; }
            else if (!inString && '({['.includes(char)) { depth++; current += char; }
            else if (!inString && ')}]'.includes(char)) { depth--; current += char; }
            else if (!inString && depth === 0 && char === ',') { args.push(this._evaluateExpression(current.trim(), context, selectedObject)); current = ''; }
            else current += char;
        }
        if (current.trim()) args.push(this._evaluateExpression(current.trim(), context, selectedObject));
        return args;
    }

    _resolvePropertyPath(path, context, selectedObject) {
        if (!path) return null;
        path = path.trim();
        const methodMatch = path.match(/^(.+?)\.(\w+)\((.*)\)$/);
        if (methodMatch) {
            const obj = this._resolvePropertyPath(methodMatch[1], context, selectedObject);
            if (obj != null) {
                const args = this._parseArguments(methodMatch[3], context, selectedObject);
                if (typeof obj === 'string') {
                    const m = { length: () => obj.length, toUpperCase: () => obj.toUpperCase(), toLowerCase: () => obj.toLowerCase(), trim: () => obj.trim(), substring: (s, e) => obj.substring(s, e), charAt: i => obj.charAt(i), indexOf: s => obj.indexOf(s), replace: (t, r) => obj.replace(t, r), split: s => obj.split(s), startsWith: p => obj.startsWith(p), endsWith: p => obj.endsWith(p), contains: s => obj.includes(s), isEmpty: () => obj.length === 0 };
                    if (m[methodMatch[2]]) return m[methodMatch[2]](...args);
                }
                if (Array.isArray(obj)) {
                    const m = { size: () => obj.length, isEmpty: () => obj.length === 0, get: i => obj[i], contains: i => obj.includes(i), indexOf: i => obj.indexOf(i), join: s => obj.join(s) };
                    if (m[methodMatch[2]]) return m[methodMatch[2]](...args);
                }
                if (typeof obj[methodMatch[2]] === 'function') return obj[methodMatch[2]](...args);
            }
            return null;
        }
        const parts = this._parsePropertyPath(path);
        let current = context;
        for (const part of parts) {
            if (current == null) return null;
            current = part.type === 'property' ? current[part.name] : current[part.index];
        }
        return current;
    }

    _parsePropertyPath(path) {
        const parts = [];
        let current = '', i = 0;
        while (i < path.length) {
            const char = path[i];
            if (char === '.') { if (current) { parts.push({ type: 'property', name: current }); current = ''; } }
            else if (char === '[') {
                if (current) { parts.push({ type: 'property', name: current }); current = ''; }
                let j = i + 1, indexStr = '';
                while (j < path.length && path[j] !== ']') { indexStr += path[j]; j++; }
                indexStr = indexStr.replace(/^['"]|['"]$/g, '');
                parts.push({ type: 'index', index: isNaN(indexStr) ? indexStr : parseInt(indexStr, 10) });
                i = j;
            } else current += char;
            i++;
        }
        if (current) parts.push({ type: 'property', name: current });
        return parts;
    }

    _evaluateMessageExpression(expr, context) {
        const match = expr.match(/^(\w[\w.]*?)(?:\((.*)\))?$/);
        if (match) {
            let message = this.messages[match[1]] || match[1];
            if (match[2]) this._parseArguments(match[2], context, null).forEach((arg, i) => { message = message.replace(new RegExp(`\\{${i}\\}`, 'g'), arg); });
            return message;
        }
        return this.messages[expr] || expr;
    }

    _evaluateUrlExpression(expr, context, selectedObject) {
        return expr.replace(/\$\{(.*?)\}/g, (m, e) => encodeURIComponent(String(this._evaluateVariableExpression(e, context, selectedObject) ?? '')));
    }

    _isTruthy(v) {
        if (v === null || v === undefined || v === false || v === 0) return false;
        if (v === 'false' || v === 'off' || v === 'no') return false;
        if (typeof v === 'string' && v.trim() === '') return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
    }

    _isIterable(v) { return v != null && (Array.isArray(v) || v instanceof Map || v instanceof Set || typeof v === 'object'); }

    _escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
}

window.ThymeleafEngine = ThymeleafEngine;
