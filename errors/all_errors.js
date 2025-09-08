const onlyRegularChar = (str) => {
    const regex = /^[\p{L}\s]+$/u;
    return regex.test(str);
}
const onlyRegularCharAndNumber = (str) => {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(str)
}

const isValidEmail = (str) => {
    const regex = /^[\w.-]+@gmail\.com$/i;
    return regex.test(str);
}

const isValidPassword = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{6,25}$/;
  return regex.test(password);
};

module.exports = {
    onlyRegularChar,
    onlyRegularCharAndNumber,
    isValidEmail,
    isValidPassword};