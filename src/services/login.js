import axios from 'axios'
const baseUrl = import.meta.env.VITE_BE_SIDE_URL + '/login'

const login = async credentials => {
    const response = await axios.post(baseUrl, credentials);
    return response.data;
};

// Function to verify MFA
const verifyMfa = async (credentials) => {
    const response = await axios.post(`${baseUrl}/verifyMfa`, credentials);
    return response;
};

// Function to handle MFA setup
const mfaSetup = async session => {
    const response = await axios.post(`${baseUrl}/mfa-setup`, { session });
    return response.data;
};

export default { login, verifyMfa, mfaSetup };
