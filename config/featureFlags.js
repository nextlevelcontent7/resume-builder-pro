const flags = {
  watermark: false,
  defaultTheme: 'classic',
  exportFormats: ['pdf', 'png'],
  pricingTier: 'free',
};

function update(newSettings) {
  Object.assign(flags, newSettings);
}

function toggle(key) {
  flags[key] = !flags[key];
}

module.exports = { flags, update, toggle };
