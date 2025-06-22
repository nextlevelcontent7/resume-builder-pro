const charMap = {
  á:'a', à:'a', ä:'a', â:'a', Á:'A', À:'A', Ä:'A', Â:'A',
  é:'e', è:'e', ë:'e', ê:'e', É:'E', È:'E', Ë:'E', Ê:'E',
  í:'i', ì:'i', ï:'i', î:'i', Í:'I', Ì:'I', Ï:'I', Î:'I',
  ó:'o', ò:'o', ö:'o', ô:'o', Ó:'O', Ò:'O', Ö:'O', Ô:'O',
  ú:'u', ù:'u', ü:'u', û:'u', Ú:'U', Ù:'U', Ü:'U', Û:'U',
  ñ:'n', Ñ:'N', ç:'c', Ç:'C'
};

function transliterate(str){
  return str.replace(/[\u00C0-\u017F]/g,c=>charMap[c]||c);
}

module.exports = function slugify(str, opts = {}) {
  const delimiter = opts.delimiter || '-';
  const lower = opts.lower !== false;
  const limit = opts.limit || 0;
  let slug = transliterate(str)
    .replace(/[^A-Za-z0-9]+/g, delimiter)
    .replace(new RegExp(`${delimiter}{2,}`,'g'), delimiter)
    .replace(new RegExp(`^${delimiter}|${delimiter}$`,'g'), '');
  if (lower) slug = slug.toLowerCase();
  if (limit) slug = slug.slice(0, limit);
  if (opts.replacements) {
    for (const [k,v] of Object.entries(opts.replacements)) {
      slug = slug.replace(new RegExp(k,'g'), v);
    }
  }
  return slug;
};
