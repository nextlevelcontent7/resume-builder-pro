class Transporter {
  async sendMail(opts) {
    console.log('sending mail', opts);
    return true;
  }
}

function createTransport() {
  return new Transporter();
}

module.exports = { createTransport };
