function formatForPrint(text, lineWidth = 80) {
  return text
    .split('\n')
    .map((line) => {
      const chunks = [];
      let remaining = line;
      while (remaining.length > lineWidth) {
        chunks.push(remaining.slice(0, lineWidth));
        remaining = remaining.slice(lineWidth);
      }
      chunks.push(remaining);
      return chunks.join('\n');
    })
    .join('\n');
}

function paginate(text, linesPerPage = 50) {
  const lines = text.split('\n');
  const pages = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage).join('\n'));
  }
  return pages;
}

module.exports = { formatForPrint, paginate };
