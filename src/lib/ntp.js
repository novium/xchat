import sntp from 'sntp';

const options = {
  timeout: 1000
};

export default class NTP {
  static async getTime() {
    return await sntp.time(options);
  }
}