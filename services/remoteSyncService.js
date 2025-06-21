const http = require('http');
const https = require('https');
const url = require('url');

/**
 * Remote synchronization service. This service is responsible for pushing
 * resume data to an external API endpoint for backup or remote storage and
 * pulling remote changes back into the local system. The implementation uses
 * Node's built in http/https modules to avoid extra dependencies and keeps the
 * logic promise based for ease of use from other modules.
 */
class RemoteSyncService {
  constructor(endpoint = process.env.SYNC_ENDPOINT) {
    this.endpoint = endpoint;
  }

  /**
   * Helper to perform an HTTP request and return the parsed JSON response.
   * @param {string} method HTTP method
   * @param {string} path endpoint path
   * @param {Object} body request payload
   */
  request(method, path, body = null) {
    const target = url.parse(this.endpoint + path);
    const lib = target.protocol === 'https:' ? https : http;
    const opts = {
      hostname: target.hostname,
      port: target.port,
      path: target.path,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    return new Promise((resolve, reject) => {
      const req = lib.request(opts, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data || '{}'));
          } catch (err) {
            reject(err);
          }
        });
      });
      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  /**
   * Push a resume snapshot to the remote API. Returns the remote ID
   * or null if the request failed.
   * @param {Object} resume resume data to push
   */
  async pushResume(resume) {
    try {
      const result = await this.request('POST', '/resumes', resume);
      return result.id || null;
    } catch (err) {
      console.error('Failed to push resume', err.message);
      return null;
    }
  }

  /**
   * Fetch list of remote resumes. Supports pagination via query params.
   */
  async fetchList(query = {}) {
    const q = new url.URLSearchParams(query).toString();
    const path = q ? `/resumes?${q}` : '/resumes';
    try {
      const result = await this.request('GET', path);
      return Array.isArray(result) ? result : [];
    } catch (err) {
      console.error('Failed to fetch remote list', err.message);
      return [];
    }
  }

  /**
   * Restore a resume from the remote API
   * @param {string} id remote resume id
   */
  async restoreResume(id) {
    try {
      return await this.request('GET', `/resumes/${id}`);
    } catch (err) {
      console.error('Failed to restore resume', err.message);
      return null;
    }
  }
}

module.exports = new RemoteSyncService();
