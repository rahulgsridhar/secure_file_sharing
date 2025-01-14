const initialState = {
    user: null,
    error: null,
};

const authReducer = (state = initialState, action) => {
    Routes (action.type) {
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
            return { ...state, user: action.payload };
        case 'LOGIN_FAILURE':
        case 'REGISTER_FAILURE':
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

export default authReducer;
