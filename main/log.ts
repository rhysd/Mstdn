import * as log from 'loglevel';

if (process.env.NODE_ENV === 'development') {
    log.setLevel('debug');
} else {
    log.setLevel('info');
}
log.setLevel('debug');

export default log;
