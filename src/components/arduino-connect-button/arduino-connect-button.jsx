import React from 'react';
import {connect} from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import arduinoAPI from '../../lib/arduino-api/index.js';
import {setArduinoStatus} from '../../reducers/arduino.js';

import styles from './arduino-connect-button.css';
import connectIcon from './icon--connect.svg';
import disconnectIcon from './icon--disconnect.svg';

const ArduinoConnectButton = ({status, onSetStatus}) => {
    const handleConnect = () => {
        onSetStatus('connecting');
        arduinoAPI.connect()
            .then(() => {
                onSetStatus('connected');
                // Set up a callback to update status if device is unplugged
                arduinoAPI.onDisconnect = () => onSetStatus('disconnected');
            })
            .catch(() => {
                onSetStatus('error');
                // After a moment, reset to disconnected
                setTimeout(() => onSetStatus('disconnected'), 2000);
            });
    };

    const handleDisconnect = () => {
        arduinoAPI.disconnect().then(() => onSetStatus('disconnected'));
    };

    if (status === 'connected') {
        return (
            <button className={classNames(styles.button, styles.connected)} onClick={handleDisconnect}>
                <img className={styles.icon} src={disconnectIcon} />
                <span>Disconnect</span>
            </button>
        );
    }

    return (
        <button className={styles.button} onClick={handleConnect} disabled={status === 'connecting'}>
            <img className={styles.icon} src={connectIcon} />
            <span>
                {status === 'connecting' && 'Connecting...'}
                {status === 'disconnected' && 'Connect Arduino'}
                {status === 'error' && 'Error!'}
            </span>
        </button>
    );
};

ArduinoConnectButton.propTypes = {
    status: PropTypes.oneOf(['disconnected', 'connecting', 'connected', 'error']),
    onSetStatus: PropTypes.func
};

// --- THIS IS THE CORRECTED PART ---
const mapStateToProps = state => ({
    status: state.arduino.status
});
// --- END OF CORRECTION ---

const mapDispatchToProps = dispatch => ({
    onSetStatus: status => dispatch(setArduinoStatus(status))
});

export default connect(mapStateToProps, mapDispatchToProps)(ArduinoConnectButton);