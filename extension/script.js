(function () {
  const TAB_STR = "\t"
  const TABSPACE_STR = "    "
  const regexp = new RegExp(`^(${TAB_STR}|${TABSPACE_STR})(.+)`)
  document.addEventListener('keydown', e => {
    if (e.target.tagName !== 'TEXTAREA' || e.keyCode !== 9) { return false; }
    e.preventDefault();
    const selection = { left: e.target.selectionStart, right: e.target.selectionEnd };
//     console.info(selection);
    const text = e.target.value;
    const lines = text.split('\n');

    const lengthOfTextUpToThisLine = text.lastIndexOf('\n', selection.left - 1) + 1;
    const iLeft = text.substr(0, selection.left).match(/\n/g)?.length || 0;
    const iRight = text.substr(0, selection.right).match(/\n/g)?.length || 0;
    const colLeft = selection.left - lengthOfTextUpToThisLine; // 行頭からの文字数
    const shouldInsertTabForSingleLine = (
      iLeft == iRight // 単行選択
      && colLeft > 0 // 行頭ではない
      && !(lines[iLeft].match(/^(\t| )*(-|\*|[0-9]+\.) /)) // 箇条書きではない
    );
    for (const i in lines) {
      var line = lines[i];
      if (i < iLeft || i > iRight) continue;
      if (!e.shiftKey) {
        if (shouldInsertTabForSingleLine) {
          // 単行を選択中。現在位置にタブ挿入
//           console.info("単行")
          var colRight = selection.right - lengthOfTextUpToThisLine;
          lines[i] = line.substr(0, colLeft) + TAB_STR + line.substr(colRight);
          selection.left += TAB_STR.length;
          selection.right = selection.left; // 上書きした場合は範囲選択解除
        } else {
          // 行頭にタブ挿入
//           console.info("行頭")
          lines[i] = TAB_STR + line;
          selection.left += i==iLeft ? TAB_STR.length : 0;
          selection.right += TAB_STR.length;
        }
      } else {
        var m = line.match(regexp);
//         console.info("del", m);
        if (m) {
          // 行頭のタブ削除
          lines[i] = m[2];
          selection.left -= Math.min(colLeft, i==iLeft ? m[1].length : 0);
          selection.right = Math.max(selection.left, selection.right-m[1].length);
        }
      }
    }
    e.target.value = lines.join('\n');
    e.target.setSelectionRange(selection.left, selection.right);
    return false;
  })
})()