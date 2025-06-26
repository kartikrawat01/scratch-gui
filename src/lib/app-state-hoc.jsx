import arduinoReducer from '../reducers/arduino';
import React from 'react';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import {createStore, combineReducers, compose} from 'redux';
import ConnectedIntlProvider from './connected-intl-provider.jsx';
import intlReducer, {initLocale, localesInitialState} from '../reducers/locales';
import {setPlayer, setFullScreen} from '../reducers/mode.js';
import guiReducer, {guiInitialState, guiMiddleware, initFullScreen, initPlayer, initTelemetryModal} from '../reducers/gui';
import locales from 'scratch-l10n';
import {detectLocale} from './detect-locale';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

/*
 * Higher Order Component to provide redux state. If an `intl` prop is provided
 * it will override the internal `intl` redux state
 * @param {React.Component} WrappedComponent - component to provide state for
 * @param {boolean} localesOnly - only provide the locale state, not everything
 *                      required by the GUI. Used to exclude excess state when
                        only rendering modals, not the GUI.
 * @returns {React.Component} component with redux and intl state provided
 */
const AppStateHOC = function (WrappedComponent, localesOnly) {
    class AppStateWrapper extends React.Component {
       // --- PASTE THIS NEW CONSTRUCTOR IN ITS PLACE ---
// --- PASTE THIS NEW CONSTRUCTOR IN ITS PLACE ---
constructor (props) {
    super(props);
    let enhancer;
    let initialState;
    let reducers;

    // This block is from your original code
    const guiRedux = require('../reducers/gui');
    const guiReducer = guiRedux.default;
    const {
        guiInitialState,
        guiMiddleware,
        initFullScreen,
        initPlayer,
        initTelemetryModal
    } = guiRedux;
    const {ScratchPaintReducer} = require('scratch-paint');

    let initializedGui = guiInitialState;
    if (props.isFullScreen) {
        initializedGui = initFullScreen(initializedGui);
    }
    if (props.isPlayerOnly) {
        initializedGui = initPlayer(initializedGui);
    } else if (props.showTelemetryModal) {
        initializedGui = initTelemetryModal(initializedGui);
    }

    // This is where we add our new reducer to the list
    reducers = {
        locales: intlReducer, // This now works because of the import you added
        scratchGui: guiReducer,
        arduino: arduinoReducer, // Our new reducer!
        scratchPaint: ScratchPaintReducer
    };

    // This is where we add the initial state for our reducer
    initialState = {
        locales: localesInitialState,
        scratchGui: initializedGui,
        arduino: undefined // Let Redux handle the default
    };

    // The rest is from your original code
    enhancer = composeEnhancers(guiMiddleware);

    const reducer = combineReducers(reducers);
    this.store = createStore(
        reducer,
        initialState,
        enhancer
    );
}
        componentDidUpdate (prevProps) {
            if (localesOnly) return;
            if (prevProps.isPlayerOnly !== this.props.isPlayerOnly) {
                this.store.dispatch(setPlayer(this.props.isPlayerOnly));
            }
            if (prevProps.isFullScreen !== this.props.isFullScreen) {
                this.store.dispatch(setFullScreen(this.props.isFullScreen));
            }
        }
        render () {
            const {
                isFullScreen, // eslint-disable-line no-unused-vars
                isPlayerOnly, // eslint-disable-line no-unused-vars
                showTelemetryModal, // eslint-disable-line no-unused-vars
                ...componentProps
            } = this.props;
            return (
                <Provider store={this.store}>
                    <ConnectedIntlProvider>
                        <WrappedComponent
                            {...componentProps}
                        />
                    </ConnectedIntlProvider>
                </Provider>
            );
        }
    }
    AppStateWrapper.propTypes = {
        isFullScreen: PropTypes.bool,
        isPlayerOnly: PropTypes.bool,
        isTelemetryEnabled: PropTypes.bool,
        showTelemetryModal: PropTypes.bool
    };
    return AppStateWrapper;
};

export default AppStateHOC;
