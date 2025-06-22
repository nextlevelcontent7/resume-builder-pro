function sectionScore(section, weight = 1) {
  if (!section) return 0;
  if (Array.isArray(section)) return section.length > 0 ? weight : 0;
  if (typeof section === 'object') return Object.keys(section).length > 0 ? weight : 0;
  return section ? weight : 0;
}

function calculate(resume) {
  let score = 0;
  let total = 0;
  const weights = {
    personalInfo: 2,
    summary: 1,
    experience: 3,
    education: 2,
    skills: 2,
  };
  for (const [field, weight] of Object.entries(weights)) {
    total += weight;
    score += sectionScore(resume[field], weight);
  }
  return Math.round((score / total) * 100);
}

function missingSections(resume) {
  const needed = [];
  if (!resume.personalInfo || !resume.personalInfo.name) needed.push('personalInfo');
  if (!resume.experience || resume.experience.length === 0) needed.push('experience');
  if (!resume.education || resume.education.length === 0) needed.push('education');
  if (!resume.skills || resume.skills.length === 0) needed.push('skills');
  return needed;
}

module.exports = { calculate, missingSections };
