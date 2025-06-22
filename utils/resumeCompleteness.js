'use strict';

/**
 * Utility to calculate resume completeness. Each section can be weighted
 * differently and custom evaluators can be supplied to better reflect specific
 * business requirements.
 */

const defaultWeights = {
  personalInfo: 2,
  summary: 1,
  experience: 3,
  education: 2,
  skills: 2,
  projects: 1,
  references: 1,
};

const defaultEvaluators = {
  personalInfo: (info) => info && info.name && info.email,
  summary: (val) => typeof val === 'string' && val.trim().length > 20,
  experience: (arr) => Array.isArray(arr) && arr.length > 0,
  education: (arr) => Array.isArray(arr) && arr.length > 0,
  skills: (arr) => Array.isArray(arr) && arr.length > 2,
  projects: (arr) => Array.isArray(arr) && arr.length > 0,
  references: (arr) => Array.isArray(arr) && arr.length > 0,
};

/**
 * Calculate resume completeness score as a percentage. Missing fields are
 * returned as an array so callers can prompt the user for additional content.
 *
 * @param {object} resume resume data to evaluate
 * @param {object} [weights] optional section weights
 * @param {object} [evaluators] optional functions returning truthy if section complete
 * @returns {{score:number, missing:string[]}}
 */
function calculate(resume, weights = defaultWeights, evaluators = defaultEvaluators) {
  let totalWeight = 0;
  let achieved = 0;
  const missing = [];

  for (const [section, weight] of Object.entries(weights)) {
    totalWeight += weight;
    const evaluator = evaluators[section] || (() => true);
    if (evaluator(resume[section])) {
      achieved += weight;
    } else {
      missing.push(section);
    }
  }

  const score = totalWeight ? Math.round((achieved / totalWeight) * 100) : 0;
  return { score, missing };
}

/**
 * Utility to create custom evaluator sets. Returns a function that mirrors the
 * `calculate` signature but uses provided weights and evaluators.
 *
 * @param {object} weights
 * @param {object} evaluators
 */
function createCalculator(weights, evaluators) {
  return (resume) => calculate(resume, weights, evaluators);
}

module.exports = { calculate, createCalculator, defaultWeights, defaultEvaluators };
