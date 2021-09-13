import MarkdownIt from 'markdown-it';

export const JUPYTER_IMARKDOWN_EXPR_CLASS = 'jupyter-imarkdown-expr';

// Skip char codes from given position
function skipChars(state: any, pos: number, code: number): number {
  for (let max = state.src.length; pos < max; pos++) {
    if (state.src.charCodeAt(pos) !== code) {
      break;
    }
  }
  return pos;
}

function expressionPlugin(md: MarkdownIt): any {
  function tokenize(state: any, silent: any) {
    const openDelim = 0x7b;
    const closeDelim = 0x7d;

    const stop = state.posMax;

    // Check we start with the correct marker
    let pos = state.pos;
    const char = state.src.charCodeAt(pos);
    if (char !== openDelim) {
      return false;
    }
    // We need exactly two open markers {{
    let searchStartPos = pos;
    pos = skipChars(state, pos, openDelim);
    if (pos - searchStartPos !== 2) {
      return false;
    }
    // First index _after_ {{
    const startPos = pos;

    // Find end marker }
    let foundEndMarker = false;
    while (pos <= stop) {
      // Didn't find end marker
      if (state.src.charCodeAt(pos) === closeDelim) {
        foundEndMarker = true;
        break;
      }
      pos++;
    }
    if (!foundEndMarker) {
      return false;
    }
    // Index of first } in  }}
    const stopPos = pos;
    // We need exactly two end markers }}
    searchStartPos = pos;
    pos = skipChars(state, pos, closeDelim);
    if (pos - searchStartPos !== 2) {
      return false;
    }

    // Read tokens inside of the bracket
    const expression = state.src.slice(startPos, stopPos);
    state.pos = pos;

    const token = state.push('expr', 'input', 0);
    token.attrSet('type', 'hidden');
    token.attrSet('class', JUPYTER_IMARKDOWN_EXPR_CLASS);
    token.attrSet('value', expression);

    return true;
  }
  md.inline.ruler.after('emphasis', 'expr', tokenize);
}

export default expressionPlugin;
