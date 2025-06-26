// scratch-gui/src/reducers/arduino.js

const SET_STATUS = 'scratch-gui/arduino/SET_STATUS';

const initialState = {
    // Possible statuses: 'disconnected', 'connecting', 'connected', 'error'
    status: 'disconnected'
};

const reducer = function (state = initialState, action) {
    switch (action.type) {
    case SET_STATUS:
        return { ...state, status: action.status };
    default:
        return state;
    }
};

export const setArduinoStatus = status => ({
    type: SET_STATUS,
    status: status
});

export default reducer;